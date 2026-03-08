### 2026-03-08: Use base64 data URIs for PNG asset delivery
**By:** Squad Coordinator
**What:** All PNG assets sent as base64 data URIs instead of webview resource URIs.
**Why:** Webview resource URIs failed silently in new Image() loads after 5+ fix attempts. Data URIs bypass the webview resource server entirely.
