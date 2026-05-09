# Show Log Schema — Version 1.0

Last updated: 2026-05-09
Updated by: claude-sonnet-4-6

---

## Top-Level Structure

Each show is a single JSON file in `/shows/`. Filename convention: `show-name-client.json` (lowercase, hyphens).

---

## `_meta` block

Bookkeeping for the entry itself — not show data.

| Field | Type | Description |
|-------|------|-------------|
| `schema_version` | string | Which version of this schema the entry was written against |
| `added` | date string | When this entry was created |
| `added_by` | string | Who or what created it (AI model ID, or "operator") |
| `source` | string | How the data was captured |

---

## `show` block

Core identity of the production.

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | Show title as commonly referred to |
| `client` | string | The end client / brand / organization paying for the event |
| `type` | string | See types below |
| `date` | date string or null | ISO 8601 preferred. Null if unknown |
| `date_notes` | string | Context if date is approximate or unknown |
| `location` | string or null | City, venue, or both |
| `location_notes` | string | Additional location context |

**Show types** (expected to grow):
- `corporate_conference` — multi-session corporate event
- `corporate_general_session` — single general session
- `live_concert` — music performance
- `theater` — theatrical production
- `broadcast` — TV / streaming / film
- `trade_show` — exhibit/expo environment
- `special_event` — awards, galas, etc.

---

## `companies` array

All companies involved in the show. Each entry:

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | Company name |
| `role` | string | See roles below |
| `personal_connection` | string or null | Any personal relationship (e.g., "brother's company") |

**Company roles:**
- `lead_production` — the production company running the show
- `labor` — labor/crew supply company
- `av_vendor` — AV equipment vendor/rental
- `venue` — the venue itself
- `client_agency` — agency representing the client

---

## `my_role` block

The operator's specific position on this show.

| Field | Type | Notes |
|-------|------|-------|
| `title` | string | Job title as called on this show |
| `area` | string | Physical or functional area they were responsible for |
| `in_hierarchy` | string | Free text — where they sat relative to the show's chain of command |

---

## `key_crew` array

Notable crew members the operator interacted with or wants to remember.

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | Full name |
| `role` | string | Their title on this show |
| `area` | string or null | Area they worked (if multi-room show) |
| `relationship` | string | How to characterize the working relationship |

---

## `my_area` block

Detailed breakdown of the operator's specific area/room. This block is expected to be the most variable part of the schema.

### `equipment` block

#### `lighting`

| Field | Type | Notes |
|-------|------|-------|
| `console` | string | Lighting console model |
| `fixtures_as_built` | array | What was actually on the floor |
| `fixtures_original_plan` | array or null | What was originally spec'd, if different |
| `plan_vs_actual_note` | string or null | Explanation of any discrepancy |

Each fixture entry: `{ "quantity": int, "name": string, "note": string or null }`

#### `audio`

| Field | Type | Notes |
|-------|------|-------|
| `speakers` | int or null | Speaker count |
| `mixer` | boolean | Whether a mixer was in their area |
| `mixer_type` | string or null | Model/type if known |

#### `video`

| Field | Type | Notes |
|-------|------|-------|
| `screens` | int or null | Screen/display count |
| `screen_type` | string or null | TV, LED wall, projection, etc. |

---

## `incidents` array

Mistakes, near-misses, unexpected problems, and lessons learned. **This is career-critical data.**

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

## Known Gaps in v1.0

- No field for show duration / number of days
- No field for union vs. non-union work
- No field for budget tier
- No field for travel required
- No field for whether show was repeat business / return client
- `Machorra` fixture name on CEO Summit is uncertain — may need correction
- Dates and location missing from first entry

These gaps are tracked here intentionally. As shows are added, the right fields will become obvious.
