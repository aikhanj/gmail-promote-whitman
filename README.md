# gmail-promote-whitman (Google Apps Script)
promote high-signal “Whitman/Wire” threads back to Inbox with a BEST label when they match your keywords.

> built on Google Apps Script · least-privilege scopes · dry-run mode · idempotent with a 7d seen cache

## what it does
- scans the last few hours of emails under a label (default: `Whitman/Wire`)
- if subject/body contains any of your `keywords_primary` and no `hard_exclusions`:
  - moves thread to **Inbox**
  - adds label **BEST**
  - marks as **Unread**
- remembers processed threads for 7 days (no repeats)

## setup (5 min)
1) **Create a new Apps Script** project → paste `Code.gs`.
2) **Set Script Properties**: `CONFIG_JSON` → paste from `example.config.json`.
3) **Deploy a time trigger**: every 10 minutes (Apps Script → Triggers).
4) **Run once with `DRY_RUN=true`**, check Logs, then set to `false`.

## config
`CONFIG_JSON` (stored in Script Properties)
```json
{
  "label": "Whitman/Wire",
  "timezone": "America/New_York",
  "scan_hours": 6,
  "dry_run": false,
  "keywords_primary": [
    "research",
    "quant",
    "ai",
    "internship",
    "fellowship",
    "funding",
    "hackathon",
    "swe"
  ],
  "hard_exclusions": [
    "unsubscribe",
    "buy now",
    "promo",
    "sponsored"
  ]
}
```

built by [aikhan jumashukurov](https://aikhanjumashukurov.com)
princeton cs · ai researcher · kyrgyz government innovation recognition.
