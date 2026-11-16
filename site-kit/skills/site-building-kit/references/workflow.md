# Verification and delivery workflow (from the TEYEL build)

## Local preview of a Shopify theme
```bash
cd site-kit/tools/shopify-preview && npm install
# edit THEME / OUT and the fake catalogue at the top of render.mjs first
node render.mjs                      # theme -> static HTML in OUT
(cd "$OUT" && python3 -m http.server 8765 --bind 127.0.0.1)   # run in background
node check.mjs                       # Theme Check summary, expect "TOTAL 0 errors"
```

## Scroll scene shots
```bash
node scenes-shots.js OUT_DIR 1440 900
node scenes-shots.js OUT_DIR 390 844
node scenes-shots.js OUT_DIR 1440 900 --reduced
```
Prints per act: progress `p`, `stageTop` (0 = pinned), rail overflow, thread state, errors.
Open the JPGs and look at them.

## Lighthouse
```bash
CHROME_PATH=/opt/pw-browsers/chromium npx lighthouse http://127.0.0.1:8765/index.html \
  --quiet --chrome-flags="--headless --no-sandbox" \
  --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=lh.json
# add --preset=desktop for desktop
```

## Publishing a static preview on Higgsfield
1. `tar -czf site.tar.gz -C OUT .`
2. Higgs `media_upload` -> `curl -X PUT -H "Content-Type: application/octet-stream" -H "If-None-Match: *" --data-binary @site.tar.gz '<upload_url>'` -> `media_confirm`.
3. `website_repo_access` (checkout) -> in `sandbox_exec`: extract into `app/public`, `git commit`.
4. `website_repo_access` (push) -> `deploy_website` -> poll `website_status` until `deployed`.
5. Verify with curl and a Playwright screenshot of the live URL.
A site may need `publish_website` (community feed) before it is publicly reachable; ask the user first.
