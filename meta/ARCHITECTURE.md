# Architecture Decision Log

---

## v1.0 — 2026-05-09

**Decision: One JSON file per show in `/shows/`**

Considered a single database file (SQLite) and a single large JSON array. Rejected both.
- SQLite binary is hard to read on GitHub and merges are opaque
- A single JSON file becomes unwieldy and creates merge conflicts when editing one show
- Individual files are clean git diffs, human-readable, and independently editable

**Decision: GitHub repo as the database, GitHub API as the server**

No hosting cost. Data is private (private repo). Versioned automatically. Accessible anywhere via the API with a personal access token. The web UI reads data at runtime via the API — no build step, no deploy pipeline.

**Decision: Web UI authenticates via GitHub Personal Access Token**

The user enters their GitHub PAT once; it is stored in browser localStorage. All API calls use it. This means:
- Only someone with the PAT can read the data
- The PAT can be revoked at any time from GitHub settings
- No separate auth system to maintain

**Decision: Schema lives in `meta/SCHEMA.md`, not enforced by code**

The schema is documentation, not a validator. AI agents are trusted to follow it. This keeps the system flexible — a new field can be added to one show without breaking others. The tradeoff is consistency depends on the agent following instructions.

**Decision: `incidents` and `lessons` are first-class fields, not notes**

Career growth comes from remembering mistakes. Burying them in a notes field makes them invisible to queries. Structured incidents mean an AI agent can answer "what mistakes have I made with hotspot-dependent setups?" or "have I ever had a client-impacting failure?"

**Decision: `my_area` is a nested block, not flat fields**

A show can have multiple areas (general session, breakout rooms, pre-function, etc.). The operator may work one or more of them. Nesting the area's equipment under `my_area` leaves room for a future `other_areas` array without restructuring the whole schema.

---

## v1.1 — 2026-05-09

**Decision: `date` string → structured `dates` object with per-day schedule**

CEO Summit ran May 4–7, 2026 with different call/wrap times each day. A single date string can't represent this. Replaced with:
- `start` / `end` for range queries ("what shows did I work in May?")
- `schedule` array for per-day call and wrap times

Single-day shows just have one schedule entry. This is backwards-incompatible but acceptable — only one show exists so far.

**Decision: `location` string → structured object with `venue`, `city`, `state`**

A free string can't be filtered or grouped. Splitting into venue + city + state enables "all shows in Phoenix" or "all shows at this venue" queries. International shows use `country` instead of `state`.

**Decision: Fixture entries split from flat `name` → `manufacturer` + `model` + `operating_mode`**

The operator noted that operating mode matters (different DMX footprints) and that fixture arrays should track this. Splitting manufacturer from model also enables queries like "all shows where I used Martin fixtures" without string parsing.

The `operating_mode` field will be null in most early entries and populated over time as the operator remembers or records it.

**Decision: `summary` added as a freeform show-level field**

Some shows have character that doesn't fit structured fields — e.g., "client gave no guidance and oddly no approval process." This context is career-relevant. A single summary string captures it without forcing structure onto something inherently unstructured.

---

## Open Questions (as of v1.1)

- Should companies be a global registry (separate file, referenced by ID) or inline per show?
  - Current: inline per show. Simple to start.
  - Future: if the same companies appear on 50 shows, a registry makes queries easier.

- Should key crew be a global registry?
  - Same tradeoff. Start inline, migrate if it gets unwieldy.

- Is `my_area` always singular or can the operator work multiple areas on one show?
  - Possibly rename to `my_areas` (array) in a future version if that comes up.

- Travel: CEO Summit was in Phoenix. Was travel involved? No field for this yet. Worth adding if shows start happening in multiple cities regularly.
