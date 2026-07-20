# Changelog

## 0.4.0 — diagnostic overlay + hygiene

- `?debug=1` lands a bottom-right diagnostic overlay: chain cache hit-rate per ticker, scan cache status, in-flight requests, request-per-hour counter, rate-limit state, and the current `st` shape (1 s refresh; opt-in dev tool, omitted from the canonical UX).
- Corrective IIFE-close fix lands on top of the overlay so the diagnostic helpers resolve IIFE-scoped state (`st`, `chainCache`, `scanCache`) cleanly when the overlay mounts.
- `pages-smoke` workflow's post-attempt-2 mismatch `::warning::` annotations demoted to plain `echo` to cut Actions-UI noise; the SHA-match gate stays strict.

## 0.2.0 — drop trinity/pcr tabs, sweep dead code, rebrand to PRISM
