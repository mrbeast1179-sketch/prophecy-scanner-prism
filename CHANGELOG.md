# Changelog

## 0.5.0 — toolbar rate-limit pill flips amber with reset-time hint

Toolbar badge now distinguishes a convexvalue hourly rate-limit from a generic upstream error: **`RATE-LIMIT`** renders in amber (`#fbbf24`), **`ERROR`** stays in red (`.bd.off`). On rate-limit the badge carries a hover title `Hourly API limit · polling paused · resets at HH:MM:SS` and `aria-live="polite"` so screen-reader users hear the transition. The `?demo=1` path is unaffected because `cv-bootstrap.js` never produces a 429 — synthetic stays green.

## 0.4.0 — diagnostic overlay + hygiene

- `?debug=1` lands a bottom-right diagnostic overlay: chain cache hit-rate per ticker, scan cache status, in-flight requests, request-per-hour counter, rate-limit state, and the current `st` shape (1 s refresh; opt-in dev tool, omitted from the canonical UX).
- Corrective IIFE-close fix lands on top of the overlay so the diagnostic helpers resolve IIFE-scoped state (`st`, `chainCache`, `scanCache`) cleanly when the overlay mounts.
- `pages-smoke` workflow's post-attempt-2 mismatch `::warning::` annotations demoted to plain `echo` to cut Actions-UI noise; the SHA-match gate stays strict.

## 0.3.0 — `Snapshot` table column dropped in favor of a single `Refreshed` KPI cell; `fetchScan` `day_volume` floor lowered from `>1000` to `>250` so 100+ contracts surface; demo CSV bumped to pass the new floor; `loadScan` `fetchedAt` mapping swept

## 0.2.0 — drop trinity/pcr tabs, sweep dead code, rebrand to PRISM
