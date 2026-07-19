# PRISM

A single-file option-flow scanner + dealer-gamma heatmap on top of the
[convexvalue](https://convexvalue.com) live option-chain API. Two lenses
on the same chain:

- **LiveTape** — cross-symbol unusual-flow scanner with Snapshot
  and Spot columns and a per-ticker drill-down chart.
- **GammaMap** — dealer-gamma exposure surface (strike × expiry), with
  a top-strike sidebar, IV-skew KPI, and per-expiry contribution bars.

No backend. No build step. The whole app is one HTML file.

## Live

[mrbeast1179-sketch.github.io/prophecy-scanner-prism](https://mrbeast1179-sketch.github.io/prophecy-scanner-prism/)

## Run locally

```bash
git clone https://github.com/mrbeast1179-sketch/prophecy-scanner-prism
cd prophecy-scanner-prism
open index.html
```

A `cv-bootstrap.demo.js` ships at the repo root and exposes
`window.cvApi = { chain, screen }` with **synthetic** data so the demo
renders populated on a fresh clone — no token, no network calls. To
swap to live convexvalue data, replace `cv-bootstrap.demo.js` with one that
POSTs to `https://tap.convexvalue.com/api/data/{chains, screen}` and
sets the same `window.cvApi` shape.

## convexvalue API key

PRISM hits `https://tap.convexvalue.com/api/data/{chains, screen}` with
a bearer token in the `Authorization` header. Plans and pricing live at
<https://cvforge.convexvalue.com/pricing>. **Do not commit a bearer
token to this repo.** The bootstrap is responsible for injecting it
at runtime (the demo bootstrap in this repo does not contain a token).

## Lenses

| Lens | What it shows |
|---|---|
| LiveTape | Cross-symbol scan (Snapshot refresh time, Spot/Entry, vol/OI, score, flow-type badge) plus a per-ticker OI/gamma drill-down chart and Put/Call-OI KPIs. |
| GammaMap | Dealer-gamma heatmap with IV Skew (call-IV@+5% minus put-IV@−5%), Gamma Flip, Max Pain, Net GEX / 1%, Regime; plus a long-gamma vs short-gamma top-strikes sidebar and a per-expiry contribution bar. |

## Layout

```
index.html                      The app — JS, CSS, favicon all inline
cv-bootstrap.demo.js                 Synthetic-data bootstrap exposing
                                window.cvApi = { chain, screen };
                                replace with a real convexvalue
                                shim to use live data
CHANGELOG.md                    Release notes
.github/workflows/pages-smoke.yml  Asserts Pages-byte-faithful-to-main
.nojekyll                       GitHub Pages bypasses Jekyll processing
```

## License

MIT. See commit history for credits and prior incarnations.
