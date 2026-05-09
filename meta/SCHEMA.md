# Show Log Schema — Version 1.1

Last updated: 2026-05-09
Updated by: claude-sonnet-4-6

Changes from v1.0: `date`/`date_notes`/`location`/`location_notes` replaced with structured `dates` and `location` objects; `summary` field added; fixture entries split into `manufacturer`/`model`/`operating_mode` instead of flat `name`.

---

## Top-Level Structure

Each show is a single JSON file in `/shows/`. Filename convention: `show-name-client.json` (lowercase, hyphens).

---

## `_meta` block

| Field | Type | Description |
|-------|------|-------------|
| `schema_version` | string | Which version of this schema the entry was written against |
| `added` | date string | When this entry was created |
| `added_by` | string | Who or what created it (AI model ID, or "operator") |
| `source` | string | How the data was captured |
| `last_updated` | date string | When the entry was last modified |

---

## `show` block

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | Show title as commonly referred to |
| `client` | string | The end client / brand / organization |
| `type` | string | See types below |
| `dates` | object | See dates structure below |
| `location` | object | See location structure below |
| `summary` | string or null | Freeform description of the overall feel, context, or unusual circumstances of the show |

### `dates` structure

```json
{
  "start": "YYYY-MM-DD",
  "end": "YYYY-MM-DD",
  "schedule": [
    { "date": "YYYY-MM-DD", "call": "HH:MM", "wrap": "HH:MM" }
  ]
}
```

- `schedule` is an array, one entry per day worked
- `call` and `wrap` are local time, 24-hour format
- Single-day shows have one schedule entry; `start` and `end` will be the same date
- Omit `schedule` entirely if per-day times are unknown

### `location` structure

```json
{
  "venue": "Venue Name",
  "city": "City",
  "state": "ST"
}
```

- `state` uses 2-letter US abbreviation; use `country` instead for international
- Any field can be null if unknown

**Show types:**
- `corporate_conference` — multi-session corporate event with breakout structure
- `corporate_general_session` — single large-format session
- `live_concert` — music performance
- `theater` — theatrical production
- `broadcast` — TV / streaming / film
- `trade_show` — exhibit/expo environment
- `special_event` — awards, galas, etc.

---

## `companies` array

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | Company name |
| `role` | string | See roles below |
| `personal_connection` | string or null | Any personal relationship |

**Company roles:**
- `lead_production` — the production company running the show
- `labor` — labor/crew supply company
- `av_vendor` — AV equipment vendor/rental
- `venue` — the venue itself
- `client_agency` — agency representing the client

---

## `my_role` block

| Field | Type | Notes |
|-------|------|-------|
| `title` | string | Job title as called on this show |
| `area` | string | Physical or functional area they were responsible for |
| `in_hierarchy` | string | Free text — where they sat relative to the show's chain of command |

---

## `key_crew` array

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | Full name |
| `role` | string | Their title on this show |
| `area` | string or null | Area they worked (if multi-room show) |
| `relationship` | string | How to characterize the working relationship |

---

## `my_area` block

### `equipment.lighting`

| Field | Type | Notes |
|-------|------|-------|
| `console` | string | Lighting console model |
| `fixtures_as_built` | array | What was actually on the floor |
| `fixtures_original_plan` | array or null | What was originally spec'd, if different |
| `plan_vs_actual_note` | string or null | Explanation of any discrepancy |

**Fixture entry structure:**

```json
{
  "quantity": 24,
  "manufacturer": "Martin",
  "model": "MAC Aura",
  "operating_mode": null,
  "note": null
}
```

- `operating_mode` matters: many fixtures run different DMX footprints (e.g., "basic", "extended", "16-bit"). Null if not specified or not relevant.
- `manufacturer` and `model` are separate to enable queries like "all shows with Martin fixtures"

### `equipment.audio`

| Field | Type | Notes |
|-------|------|-------|
| `speakers` | int or null | Speaker count in the area |
| `mixer` | boolean | Whether a mixer was present |
| `mixer_type` | string or null | Model/type if known |

### `equipment.video`

| Field | Type | Notes |
|-------|------|-------|
| `screens` | int or null | Screen/display count |
| `screen_type` | string or null | TV, LED wall, projection, etc. |

---

## `incidents` array

**This is career-critical data — not an afterthought.**

| Field | Type | Notes |
|-------|------|-------|
| `type` | string | `operator_error`, `equipment_failure`, `logistical_problem`, `client_issue`, `weather`, `other` |
| `severity` | string | `minor`, `moderate`, `significant`, `show_stopping` |
| `client_impact` | string | What the client actually experienced |
| `description` | string | What happened, in plain language |
| `lesson` | string | What to do differently next time |

---

## `notes`

Free text. Anything that doesn't fit elsewhere.

---

## Known Gaps in v1.1

- No field for union vs. non-union work
- No field for budget tier
- No field for travel required (this show was in Phoenix — was travel involved?)
- No field for whether show was repeat business / return client
- `operating_mode` is null on all fixtures so far — will populate as data comes in
- `summary` field is new and untested across multiple shows; may split into multiple fields later

---

## Changelog

| Version | Date | Change |
|---------|------|--------|
| 1.0 | 2026-05-09 | Initial schema |
| 1.1 | 2026-05-09 | Structured `dates` (with per-day schedule), structured `location`, `summary` field, fixtures split to `manufacturer`/`model`/`operating_mode` |
