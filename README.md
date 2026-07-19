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

The HTML expects `window.cvApi.{chain, screen}` to be present — provided
by a host-loaded `cv-bootstrap.js`, kept out of this repo by design.

## convexvalue API key

PRISM hits `https://tap.convexvalue.com/api/data/{chains, screen}` with
a bearer token in the `Authorization` header. Plans and pricing live at
<https://cvforge.convexvalue.com/pricing>. **Do not commit a bearer
token to this repo.** The bootstrap is responsible for injecting it at
runtime.

## Lenses

| Lens | What it shows |
|---|---|
| LiveTape | Cross-symbol scan (Snapshot refresh time, Spot/Entry, vol/OI, score, flow-type badge) plus a per-ticker OI/gamma drill-down chart and Put/Call-OI KPIs. |
| GammaMap | Dealer-gamma heatmap with IV Skew (call-IV@+5% minus put-IV@−5%), Gamma Flip, Max Pain, Net GEX / 1%, Regime; plus a long-gamma vs short-gamma top-strikes sidebar and a per-expiry contribution bar. |

## Layout

```
index.html       The app — JS, CSS, favicon all inline
CHANGELOG.md     Release notes
.nojekyll        GitHub Pages bypasses Jekyll processing
```

## License

MIT. See commit history for credits and prior incarnations.
