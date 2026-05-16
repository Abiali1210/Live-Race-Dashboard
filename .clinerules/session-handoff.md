# Session Handoff Usage

## When to Use
- Use the `session-handoff` skill whenever the user wants to save progress, pause work, hand off to another agent/person, or resume from a previous session.
- Use it proactively after substantial progress, major decisions, or when context is getting long.
- Prefer a handoff document over trying to keep everything in chat history.

## How to Apply
- When creating a handoff, capture:
  - Current state summary.
  - Important context.
  - Decisions made and why.
  - Immediate next steps.
  - Critical files and gotchas.
- When resuming from a handoff, read the latest handoff first, then any chained previous handoffs only if needed.
- Start work from the handoff’s immediate next steps unless the user asks to reprioritize.

## Quality Bar
- Keep handoffs concise, actionable, and free of secrets.
- Prefer bullets over long prose.
- If a handoff feels stale or incomplete, re-verify the current repo state before continuing.
- If the project has scripts or templates for handoffs, use them when present; otherwise, follow the project’s existing handoff format.