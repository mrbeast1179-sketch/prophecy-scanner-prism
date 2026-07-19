/*!
 * cv-bootstrap.js \u2014 PRISM demo bootstrap (synthetic data fallback).
 *
 * This file ships with the repo so visitors landing on the GitHub Pages
 * site get a non-empty LiveTape + GammaMap demo without needing a
 * convexvalue account. It exposes the same `window.cvApi = { chain,
 * screen }` shape the production bootstrap uses, so upstream call
 * sites in index.html are unchanged.
 *
 * To switch to live data: replace THIS file with one that POSTs to
 * https://tap.convexvalue.com/api/data/{chains,screen} with a real
 * `Authorization: Bearer <token>` header. See the README's
 * "convexvalue API" section.
 */
(function () {
  'use strict';

  // 12 tickers matching the in-app chip strip.
  var TICKERS = ['SPY', 'QQQ', 'IWM', 'DIA', 'TLT', 'AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'META', 'GOOGL'];

  // Approximate late-2026 spot prices \u2014 fixed so the demo renders the
  // same shape every run (deterministic RNG below keyed off ticker name).
  var SPOTS = {
    SPY: 580, QQQ: 510, IWM: 220, DIA: 440, TLT: 95,
    AAPL: 230, MSFT: 440, NVDA: 145, TSLA: 330,
    AMZN: 195, META: 590, GOOGL: 175
  };

  // Cheap, deterministic PRNG (LCG) so each ticker has stable synthetic
  // data across reloads. Demo feels "live" because greeks and OI aren't
  // pre-computed, but the user can refresh and see the same numbers.
  function rngFromString(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) {
      h = ((h << 5) - h) + s.charCodeAt(i);
      h |= 0;
    }
    var state = h;
    return function next() {
      state = (state * 1664525 + 1013904223) | 0;
      return ((state >>> 0) % 100000) / 100000;
    };
  }

  // Synthetic BSM-ish greeks keyed off log-moneyness and time-to-expiry.
  // Bell-shaped gamma, delta near \xb10.5 at-the-money, IV smiles with |m|.
  function synthGreeks(strike, spot, tte, isCall, rand) {
    var m = Math.log(strike / spot);
    var gamma = Math.exp(-m * m * 4) * 0.04 / Math.sqrt(Math.max(0.005, tte));
    var delta;
    if (isCall) {
      delta = 0.5 + (-m) * Math.exp(-m * m * 2) + (rand() - 0.5) * 0.04;
    } else {
      delta = -0.5 + (-m) * Math.exp(-m * m * 2) + (rand() - 0.5) * 0.04;
    }
    if (delta > 0.98) delta = 0.98;
    if (delta < -0.98) delta = -0.98;
    var iv = 0.22 + Math.abs(m) * 0.45 + (rand() - 0.5) * 0.06;
    if (iv < 0.05) iv = 0.05;
    var vega = 0.10 * gamma * spot;
    return { iv: iv, delta: delta, gamma: gamma, vega: vega, theta: -gamma * 6 + (rand() - 0.5) * 0.005 };
  }

  // Build a list of forward expirations: 6 weekly + 12 monthlies.
  function futureExpirations() {
    var out = [];
    var now = new Date();
    for (var i = 0; i < 6; i++) {
      var d = new Date(now);
      d.setDate(d.getDate() + 5 + i * 7);  // weekly on Fridays-ish
      out.push(d.toISOString().slice(0, 10));
    }
    for (var m = 1; m <= 12; m++) {
      var d2 = new Date(now);
      d2.setMonth(d2.getMonth() + m);
      d2.setDate(15);                       // 3rd-Friday-style monthly
      out.push(d2.toISOString().slice(0, 10));
    }
    return out;
  }

  // IDX-ordered per-side 14-tuple:
  // [EXP, STRIKE, TYPE, IV, DELTA, GAMMA, THETA, VEGA, BID, ASK, MID, OI, VOL, SPOT]
  // Mirrors index.html's IDX map exactly.
  function makeSide(spot, strike, exp, isCall, rand, OI, vol, greeks) {
    var mid = Math.max(0.05, spot * 0.005 + rand() * spot * 0.002);
    var spread = Math.max(0.02, mid * 0.04);
    var bid = Math.max(0.01, mid - spread / 2);
    var ask = mid + spread / 2;
    return [
      exp,
      strike,
      isCall ? 'C' : 'P',
      greeks.iv,
      greeks.delta,
      greeks.gamma,
      greeks.theta,
      greeks.vega,
      bid,
      ask,
      mid,
      OI,
      vol,
      spot
    ];
  }

  function makeExpiry(ticker, spot, exp, rand) {
    var strikes = [];
    var base = Math.round(spot);
    var step = Math.max(1, Math.round(base / 100));
    // Asymmetric offsets so cumulative GEX crosses zero above spot (long
    // gamma near ATM, short gamma further OTM/ITM).
    var offsets = [-20, -15, -10, -7, -5, -3, -2, -1, 0, 1, 2, 3, 5, 7, 10, 15, 20];
    var expDate = new Date(exp + 'T16:00:00Z');
    var now = new Date();
    var days = Math.max(1, Math.round((expDate - now) / 86400000));
    var tte = days / 365;

    for (var i = 0; i < offsets.length; i++) {
      var ofs = offsets[i];
      var strike = base + ofs * step;
      if (strike <= 0) continue;
      // Slight skew: bullish positioning biases calls above spot, puts below.
      var baseOI = Math.round((1500 + rand() * 4500) * (1 + 0.35 * Math.abs(ofs) / 20));
      var cOI = Math.round(baseOI * (ofs >= 0 ? 1.25 : 0.85) * (1 + rand() * 0.35));
      var pOI = Math.round(baseOI * (ofs <= 0 ? 1.25 : 0.85) * (1 + rand() * 0.35));
      var cVol = Math.round(cOI * (0.05 + rand() * 0.30));
      var pVol = Math.round(pOI * (0.05 + rand() * 0.30));
      var cG = synthGreeks(strike, spot, tte, true, rand);
      var pG = synthGreeks(strike, spot, tte, false, rand);
      strikes.push([
        strike,
        makeSide(spot, strike, exp, true,  rand, cOI, cVol, cG),
        makeSide(spot, strike, exp, false, rand, pOI, pVol, pG)
      ]);
    }
    return { expiration: exp, strikes: strikes };
  }

  function buildChain(ticker) {
    var spot = SPOTS[ticker];
    if (!spot) return { symbol: ticker, chain: [] };
    var rand = rngFromString(ticker);
    var exps = futureExpirations();
    var chain = [];
    for (var i = 0; i < exps.length; i++) {
      chain.push(makeExpiry(ticker, spot, exps[i], rand));
    }
    return { symbol: ticker, chain: chain };
  }

  // Screen rows for the cross-symbol flow table. Per-ticker seed with
  // ~10\u201330 rows so the scanner feels populated without overflowing the
  // 300-row limit.
  function buildScreen(query) {
    var cols = (query && query.columns) || ['underlying_ticker', 'ticker', 'contract_type', 'strike_price', 'expiration_date', 'day_volume', 'open_interest', 'implied_volatility', 'delta', 'underlying_price'];
    var limit = (query && query.limit) || 300;
    var sortKey = query && query.sort && query.sort[0] && query.sort[0].field || 'day_volume';
    var sortDir = query && query.sort && query.sort[0] && query.sort[0].direction || 'desc';
    var outcome = [];
    for (var t = 0; t < TICKERS.length && outcome.length < limit; t++) {
      var ticker = TICKERS[t];
      var spot = SPOTS[ticker];
      var rand = rngFromString(ticker + '_screen');
      var exps = futureExpirations().slice(0, 3);
      var n = 10 + Math.round(rand() * 18);
      for (var i = 0; i < n && outcome.length < limit; i++) {
        var step = Math.max(1, Math.round(spot / 100));
        var ofs = Math.round((rand() - 0.5) * 24);
        var strike = Math.round(spot) + ofs * step;
        var isCall = rand() < 0.55;
        var g = synthGreeks(strike, spot, 0.05, isCall, rand);
        var vol = Math.round(800 + rand() * 9000);
        var oi = Math.round(400 + rand() * 5500);
        var exp = exps[i % exps.length];
        var contractTicker = ticker + '2608' + (isCall ? 'C' : 'P') + String(strike).padStart(5, '0') + ((i % 3 === 0) ? 'W' : 'M');
        outcome.push([
          ticker,
          contractTicker,
          isCall ? 'call' : 'put',
          strike,
          exp,
          vol,
          oi,
          g.iv,
          g.delta,
          spot
        ]);
      }
    }
    outcome.sort(function (a, b) {
      var av = a[colIdx(cols, sortKey)];
      var bv = b[colIdx(cols, sortKey)];
      if (typeof av === 'string') return sortDir === 'desc' ? bv.localeCompare(av) : av.localeCompare(bv);
      return sortDir === 'desc' ? bv - av : av - bv;
    });
    return { columns: cols, rows: outcome };
  }

  function colIdx(cols, name) {
    for (var i = 0; i < cols.length; i++) if (cols[i] === name) return i;
    return cols.length - 1;
  }

  // Tiny latency so the UI's loading badges text is honest. Bounded.
  function delay(min, max) { return Math.round(min + Math.random() * (max - min)); }

  // The exact shape PRISM's fetchChain / fetchScan consume.
  window.cvApi = {
    chain: function (ticker /*, fields */) {
      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          try { resolve(buildChain(ticker)); } catch (e) { reject(e); }
        }, delay(40, 110));
      });
    },
    screen: function (query) {
      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          try { resolve(buildScreen(query || {})); } catch (e) { reject(e); }
        }, delay(60, 140));
      });
    }
  };

  // Tiny marker so the app can tell whether it's running in demo mode.
  // Useful when debugging: window.__cvBootstrap === 'demo' if this file
  // is the active bootstrap.
  window.__cvBootstrap = 'demo';
})();
