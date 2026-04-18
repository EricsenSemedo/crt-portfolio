# LEARNING_METRICS.json Schema

This file tracks aggregate learning metrics. Create it at the project root
alongside `LEARNING.md`. Update it whenever `LEARNING.md` changes.

## Schema

```json
{
  "last_updated": "YYYY-MM-DD",
  "summary": {
    "total_concepts": 0,
    "by_level": {
      "known": 0,
      "familiar": 0,
      "learning": 0,
      "new": 0
    },
    "stale_count": 0,
    "struggles_this_month": 0
  },
  "weekly_progress": [
    {
      "week_of": "YYYY-MM-DD",
      "concepts_promoted": 0,
      "concepts_added": 0,
      "struggles": 0
    }
  ],
  "category_breakdown": {
    "Category Name": {
      "known": 0,
      "familiar": 0,
      "learning": 0,
      "new": 0
    }
  }
}
```

## When to Update

Update `LEARNING_METRICS.json` whenever you modify `LEARNING.md`:
- After promoting a concept (e.g., `learning` -> `known`)
- After adding a new concept
- After recording a struggle
- At the start of each week (add a new `weekly_progress` entry)

## Why JSON

JSON enables programmatic analysis. Users or CI can parse this file to generate
dashboards, track learning velocity, or trigger reviews when too many concepts
go stale.
