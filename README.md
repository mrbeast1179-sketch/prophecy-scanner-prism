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
Drop your own `window.cvApi` shim and visit the canonical URL (no
flag) for live data instead.

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
[github.com/mrbeast1179-sketch/prophecy-scanner-prism/releases](https://github.com/mrbeast1179-sketch/prophecy-scanner-prism/releases).
The current pin, **v0.2.0** (`PRISM` rebrand + dead-code sweep +
synthetic-data demo bootstrap), is the immutable artifact visitors
should grab from there.

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
