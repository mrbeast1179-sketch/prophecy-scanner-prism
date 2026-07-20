# PRISM

A single-file option-flow scanner + dealer-gamma heatmap on top of the
[convexvalue](https://convexvalue.com) live option-chain API. Two lenses
on the same chain:

- **LiveTape** — cross-symbol unusual-flow scanner with a sortable
  vol/OI score, per-ticker drill-down chart, and stat-bar KPIs
  (Contracts, Notional Σ, Call/Put Vol, Unusual ≥2×, Top Name,
  Refreshed).
- **GammaMap** — dealer-gamma exposure surface (strike × expiry), with
  a top-strike sidebar, IV-skew KPI, and per-expiry contribution bars.

No backend. No build step. The whole app is one HTML file.

## Live

[mrbeast1179-sketch.github.io/prophecy-scanner-prism](https://mrbeast1179-sketch.github.io/prophecy-scanner-prism/)

To try the demo with synthetic CSV-backed data, append `?demo=1` to
the URL: [mrbeast1179-sketch.github.io/prophecy-scanner-prism/?demo=1](https://mrbeast1179-sketch.github.io/prophecy-scanner-prism/?demo=1).
For live debugging, append `?debug=1` (combine freely with `?demo=1`)
to surface a bottom-right diagnostic overlay — chain cache hit-rate
per ticker, scan cache status, in-flight requests, request-per-hour
counter, rate-limit state, and the current `st` shape; refresh 1 s.
Opt-in dev tool, omitted from the canonical UX.
Drop your own `window.cvApi` shim and visit the canonical URL (no
flag) for live data instead.

When the convexvalue hourly limit is closed, the toolbar badge flips
from green **LIVE** to amber **RATE-LIMIT** with a hover tooltip showing
the exact reset time — no debug flag needed. (Errors stay red; rate-limit
specifically is amber so the two failure modes are visually distinct.)

To exercise the rate-limit handling end-to-end without burning the
convexvalue hourly budget, append `&ratelimit=1` to any `?demo=1`
URL: [demo+ratelimit URL](https://mrbeast1179-sketch.github.io/prophecy-scanner-prism/?demo=1&ratelimit=1).
The toolbar badge flips to amber `RATE-LIMIT` exactly as it does for
a real upstream 429 — same shape, same hover tooltip, same
`aria-live="polite"` transition. The synthetic 429 honors PRISM's
`RL_PAUSE` (10 min) so the badge reverts to `LIVE` naturally without
you needing to refresh.

> **Demo caveat.** The CSV rows in the demo bootstrap are tuned so
> ~120 contracts pass the `day_volume > 250` filter and surface in a
> clean load — that's not a literal mirror of convexvalue's live
> screen-feed percentile (deep-OTM dust rows are bumped up so the
> scan table feels "alive" on a fresh open). Real upstream data
> behaves identically for KPI math, hammers, and chart overlays; the
> synthetic distribution is intentionally skewed toward breadth so
> demo users see the full active-flow band at a glance.

## Releases

Tagged releases live at
[github.com/mrbeast1179-sketch/prohecy-scanner-prism/releases](https://github.com/mrbeast1179-sketch/prophecy-scanner-prism/releases).
The current pin is **v0.6.0** ([release page](https://github.com/mrbeast1179-sketch/prophecy-scanner-prism/releases/tag/v0.6.0))
— the immutable artifact visitors should grab from there.
v0.5.0 subsumes v0.4.0: the toolbar `LIVE` badge now flips to amber **`RATE-LIMIT`** (visually distinct from the red **`ERROR`** pill on other upstream failures), with a hover tooltip of the form `Hourly API limit · polling paused · resets at <HH:MM:SS>` so visitors see the gate without opening `?debug=1`. The badge carries `aria-live="polite"` so screen-reader users hear the transition. The `?demo=1` synthetic path is unaffected because `cv-bootstrap.js` never produces a 429 — the badge stays green.

v0.6.0 subsumes v0.5.0: visitors can now exercise the convexvalue rate-limit error path end-to-end without burning the hourly budget. Append `&ratelimit=1` to any `?demo=1` URL and the demo bootstrap throws a synthetic 429 from both `chain()` and `screen()`; the toolbar flips to amber `RATE-LIMIT` exactly as for a real upstream 429, with the same hover tooltip, the same `aria-live="polite"` transition, and the existing `RL_PAUSE` (10 min) cool-down so the badge reverts to `LIVE` naturally. Implementation lives in `cv-bootstrap.js` (~6 lines added; mirrors the existing `isDemo()` gating pattern); the `?demo=1`-only path is unaffected.

v0.4.0 subsumes v0.3.0: ships the `?debug=1` diagnostic overlay
(chain cache hit-rate per ticker, scan cache status, in-flight
requests, request-per-hour counter, rate-limit state, current `st`
shape — refresh every 1 s, opt-in via the URL flag), lands the
corrective IIFE-close fix on top so the overlay helpers resolve
IIFE-scoped state correctly, and lowers the `pages-smoke` workflow's
Actions-UI noise by demoting post-attempt-2 mismatch warnings to
plain echo while keeping the SHA-match gate strict.

v0.3.0 subsumes v0.2.0: drops the `'Snapshot'` table column (refresh
time now lives in a single `Refreshed` KPI cell), lowers `fetchScan`'s
`day_volume` floor from `>1000` to `>250` so the scanner surfaces 100+
contracts, bumps the `cv-bootstrap.js` demo CSV so all 120 rows pass
the new floor, and sweeps the now-dead `fetchedAt` mapping out of
`loadScan()`.

## Run locally

```bash
git clone https://github.com/mrbeast1179-sketch/prophecy-scanner-prism
cd prophecy-scanner-prism
open index.html
```

A `cv-bootstrap.js` ships at the repo root. It is gated by
`?demo=1`, so a fresh clone opened as `index.html?demo=1` (or the
GitHub-Pages deploy with `?demo=1` appended) populates LiveTape +
GammaMap with **synthetic** CSV-backed data — no token, no network
calls. To swap to live convexvalue data, replace `cv-bootstrap.js`
with one that POSTs to `https://tap.convexvalue.com/api/data/{chains, screen}`
and sets the same `window.cvApi` shape.

## convexvalue API key

PRISM hits `https://tap.convexvalue.com/api/data/{chains, screen}` with
a bearer token in the `Authorization` header. Plans and pricing live at
<https://cvforge.convexvalue.com/pricing>. **Do not commit a bearer
token to this repo.** The bootstrap is responsible for injecting it
at runtime (the demo bootstrap in this repo does not contain a token).

## Lenses

| Lens | What it shows |
|---|---|
| LiveTape | Cross-symbol scan (Refreshed timestamp in KPI bar; Spot/Entry, vol/OI, score, flow-type badge per row) plus a per-ticker OI/gamma drill-down chart and Put/Call-OI KPIs. |
| GammaMap | Dealer-gamma heatmap with IV Skew (call-IV@+5% minus put-IV@−5%), Gamma Flip, Max Pain, Net GEX / 1%, Regime; plus a long-gamma vs short-gamma top-strikes sidebar and a per-expiry contribution bar. |

## Layout

```
index.html                      The app — JS, CSS, favicon all inline
cv-bootstrap.js                 Synthetic-data bootstrap (CSV-backed,
                                ?demo=1-gated) exposing
                                window.cvApi = { chain, screen };
                                replace with a real convexvalue
                                shim to use live data
CHANGELOG.md                    Release notes
.github/workflows/pages-smoke.yml  Asserts Pages-byte-faithful-to-main
.nojekyll                       GitHub Pages bypasses Jekyll processing
```

## License

MIT. See commit history for credits and prior incarnations.
