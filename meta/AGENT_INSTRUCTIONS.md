# Instructions for AI Agents Working on This Repository

You are working on a personal show log for a live event lighting operator. This is a living system — the schema is not fixed and is expected to evolve as new data arrives.

## Before You Do Anything

1. **Read `meta/SCHEMA.md`** — understand the current field definitions and why each one exists
2. **Read `meta/ARCHITECTURE.md`** — understand past decisions and the reasoning behind them
3. **Read `meta/profile.json`** — operator's home base and any standing preferences
4. **Read any existing shows** in `shows/` to understand the actual data shape

## When Adding New Data

1. Parse what the operator tells you — they will often speak freeform, not in structured fields
2. Map their words onto the current schema
3. **Ask yourself:** does this new entry introduce any concept that doesn't fit cleanly into the current schema?
   - A new type of company relationship?
   - A new kind of equipment?
   - A new type of role or hierarchy?
   - A field that would be useful retroactively on past shows?
4. If yes: **propose the schema change**, explain your reasoning, and if approved, update `SCHEMA.md` and apply the change retroactively to existing shows where relevant
5. If the change is significant, log it in `ARCHITECTURE.md`

## When Querying Data

- The operator will ask in natural language: "what shows did I work with Dave Renshaw?" or "when did I last use an ETC console?"
- Read the relevant JSON files and synthesize a clear answer
- If a query reveals a gap in the data (e.g., dates are missing from most shows), flag it

## Schema Philosophy

- **Null is fine** — missing data is better recorded as `null` than omitted entirely
- **Notes fields exist for a reason** — unstructured observations are valuable
- **Plan vs. actual matters** — in live events, what was planned and what happened are often different
- **Incidents and lessons are first-class data** — not afterthoughts
- **Personal relationships are data** — knowing a company is the operator's brother's company is useful context

## The Self-Evaluation Rule

With every new show added, ask yourself:
> "Does the current schema still make sense given everything in this database?"

If the answer is no, say so. Propose what should change and why. This system is designed to get smarter over time, not to stay frozen.
