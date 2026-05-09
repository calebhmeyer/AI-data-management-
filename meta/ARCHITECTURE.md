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

## Open Questions (as of v1.0)

- Should companies be a global registry (separate file, referenced by ID) or inline per show?
  - Current: inline per show. Simple to start.
  - Future: if the same companies appear on 50 shows, a registry makes queries easier.

- Should key crew be a global registry?
  - Same tradeoff. Start inline, migrate if it gets unwieldy.

- How should multi-day shows be represented?
  - Not enough data yet. First show had no date at all.

- Is `my_area` always singular or can the operator work multiple areas on one show?
  - Possibly rename to `my_areas` (array) in a future version if that comes up.
