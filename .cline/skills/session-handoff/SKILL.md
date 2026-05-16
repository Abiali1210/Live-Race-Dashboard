---
name: session-handoff
description: >
  Create and resume structured handoff documents for long-running tasks so future AI agents
  (or humans) can continue work with minimal context loss. Use when pausing work, handing
  off to another agent or teammate, resuming from a previous session, or when the
  conversation is getting long and important context should be captured in files.
---

# Session Handoff

You are a specialist in creating and consuming **handoff documents** for long-running work.

Your goal is to:
- Capture the current state in a structured file so future sessions can resume smoothly.
- Prevent context-window exhaustion by moving key information out of chat and into handoff docs.
- Safely resume from existing handoffs, validating that the context is still correct before acting.

This skill is **project-agnostic** and should work for code, data, infra, content, and other workflows.

---

## When This Skill Should Run

Activate this skill when any of the following are true:

- The user says they want to:
  - “save progress”, “create a handoff”, “write a session summary”, “prepare for later”, or “hand this off to another agent/person”.
  - “resume” work from a previous session, summary, or handoff file.
- The conversation has grown large or complex (multiple file edits, major decisions, long debugging), and a structured summary would reduce context load.
- You detect an upcoming **context shift**, such as:
  - Starting a large refactor or new feature.
  - Switching tasks or projects.
  - Ending the session soon after substantial work.

You may **proactively suggest** creating a handoff after major progress (for example, after several file edits or major architectural decisions), but only if it will clearly help future sessions.

---

## Storage Locations and Structure

Prefer these locations but adapt to the project’s existing conventions:

- Project skills and handoffs:
  - Skills: `.cline/skills/` (recommended), `.clinerules/skills/`, or `.claude/skills/`.  
  - Handoffs: `.cline/handoffs/`, `.agent/handoffs/`, or `.claude/handoffs/` in the repo root.
- Global skills:
  - `~/.cline/skills/` (macOS/Linux) or `C:\Users\USERNAME\.cline\skills\` (Windows).

If the project already has a dedicated handoff folder or template, follow that standard.

**Recommended handoff filename pattern:**

- `YYYY-MM-DD-HHMMSS-[slug].md`  
  - Example: `2026-05-15-173600-implement-auth.md`

Where possible, keep all files under version control (`.cline/skills/` and the handoff directory) so teammates and future agents can reuse them.

---

## Overall Modes

This skill works in two main modes:

1. **CREATE Mode – Writing a New Handoff**
   - Used for saving the current state.
   - Produces a well-structured handoff document.
   - Optionally chains from a previous handoff.

2. **RESUME Mode – Continuing from a Handoff**
   - Used when resuming from an existing handoff file.
   - Loads and validates the handoff.
   - Uses “Immediate Next Steps” as the starting checklist.

Always keep instructions **actionable and concise** rather than copying full transcripts or large code blocks.

---

## CREATE Mode: Handoff Creation

When the user wants to save or hand off the current work, follow this process.

### 1. Clarify Scope and Audience

Ask a few quick questions if not already clear:

- What is the main task or feature this handoff is about?
- Who is expected to use this handoff later (future-you, another AI, a specific teammate)?
- Roughly when might it be used again (later today, next week, unknown)?

Use their answers to choose a descriptive slug, like:

- `debug-payment-webhook`
- `refactor-user-auth-part2`
- `content-brief-landing-page`

### 2. Create or Open the Handoff File

Prefer this approach:

1. Choose a directory, for example:
   - `.cline/handoffs/` (recommended for Cline), or
   - `.agent/handoffs/`, `.claude/handoffs/`, or a project-specific `handoffs/` folder.

2. Create a new file with the timestamped slug pattern:

   - `YYYY-MM-DD-HHMMSS-[slug].md`

If the project includes helper scripts (for example under `scripts/`) to scaffold handoffs, you may suggest using them, but do not assume they exist. If no scripts exist, instruct the user clearly which file to create.

If the repository includes a handoff template (for example in `docs/` or `references/`), follow that structure instead of inventing a new one.

### 3. Use a Structured Template

Populate the handoff file using this structure (adapt it if the project has its own):

#### 3.1 Metadata

Include at the top:

- Title / slug
- Date and time
- Project path and repo name (if known)
- Current branch name (if known)
- Relevant commit hash(es) or PR links (if available)
- Optional: `Continues from: <previous-handoff-file>` for chained handoffs

#### 3.2 Current State Summary

Write 3–7 concise bullet points covering:

- What has been implemented or decided in this session.
- What is currently in progress.
- What remains intentionally out of scope for this handoff.

Focus on the **big picture**, not step-by-step chat history.

#### 3.3 Important Context

Capture the critical facts a new agent must know, such as:

- Domain or business rules that shaped decisions.
- Architectural constraints (framework choices, patterns, performance requirements).
- Assumptions about environment (framework versions, APIs, external services).
- Any temporary workarounds applied.

This section should answer “What do I need to know before I touch anything?”

#### 3.4 Decisions Made (with Rationale)

List important decisions and briefly explain **why**:

- “Chose approach A instead of B because …”
- “Deferred optimization X because …”
- “Adopted pattern Y to align with existing code.”

Do not just list outcomes; include at least a short justification so future agents don’t repeat the same analysis.

#### 3.5 Immediate Next Steps

Provide a numbered list of **concrete, small steps**:

- Each step should be doable by a fresh agent with minimal guessing.
- Clearly mark any blocked items and what is needed to unblock them.
- Keep this list prioritized.

Example structure:

1. Implement …
2. Update tests for …
3. Manually verify …
4. If passing, clean up …

This section is the main “start here” guide for the next session.

#### 3.6 Critical Files and Artifacts

List key assets needed to continue:

- Source files, config files, test files (with relative paths).
- Important documentation or design files.
- Links to relevant tickets, PRs, specs, or diagrams.

Avoid large inlined code blocks; instead, reference locations and summarize patterns.

#### 3.7 Potential Gotchas / Risks

Highlight known tricky areas, such as:

- Edge cases, race conditions, flaky tests.
- Partial migrations or refactors that are only halfway done.
- Performance or security concerns to keep in mind.

The goal is to help the next agent avoid repeating known mistakes.

#### 3.8 Pending Work / Backlog

List related work that is **not** in the Immediate Next Steps but worth tracking:

- Future enhancements.
- “Nice to have” improvements.
- Separate tasks that might justify their own handoff later.

---

### 4. Security and Quality Checks

Before considering the handoff “ready”:

- **Secrets**: Ensure the document does **not** contain any:
  - API keys, passwords, tokens, private keys, or sensitive personal data.
- **References**: As far as your context allows, verify that referenced files and paths exist.
- **Completeness**:
  - No unfinished placeholders like `[TODO: ...]` unless they are intentional and clearly described.
  - The Immediate Next Steps are clear and actionable.
- **Self-check**:
  - Ask: “If I knew nothing about this session, could I reasonably continue from this document?”

If the project provides validation scripts (for example in `scripts/validate_handoff.py`), mention them and suggest the user run them, then incorporate any reported warnings or scores into your guidance.

---

### 5. Confirm the Handoff to the User

After drafting or updating the handoff, report back:

- The exact file path of the handoff.
- A very short summary (2–4 bullets) of what is captured.
- The top one or two Immediate Next Steps for the next session.
- Any concerns (e.g., potential staleness, missing info that only the user knows).

Encourage the user to commit the handoff file if the repo is under version control.

---

## RESUME Mode: Continuing from a Handoff

When the user wants to resume work from an earlier session or handoff file, follow this process.

### 1. Identify the Handoff File

First, ensure you know **which** handoff to use:

- Ask the user for the handoff filename or path if they know it.
- If not, suggest looking in common directories:
  - `.cline/handoffs/`, `.agent/handoffs/`, `.claude/handoffs/`, or a project-specific `handoffs/` folder.
- If the project includes scripts (for example `scripts/list_handoffs.py`), you may suggest running them to see available handoffs.

If there are multiple candidates, prefer the most recent one by timestamp or by explicit user choice.

### 2. Load and Inspect the Handoff

Read the handoff file completely before taking any actions.

If it includes a `Continues from: <file>` reference, treat the current file as primary and only read older ones as needed for deeper context.

Focus on these sections first:

- Metadata (project, branch, previous links).
- Current State Summary.
- Important Context.
- Decisions Made.
- Immediate Next Steps.
- Potential Gotchas.

Do **not** start editing or running anything until the handoff makes sense.

### 3. Check for Staleness

Evaluate how “fresh” the handoff is:

- Has significant time passed since it was written?
- Are there new commits or changes not reflected in the handoff?
- Do referenced files still exist and match the described state?

If the project has a staleness-check script (for example `scripts/check_staleness.py`), suggest using it and interpret its output for the user.

Regardless of scripts, always:

- Confirm you are on the expected project and branch.
- Check whether any blockers in the handoff have already been resolved.
- Verify that key assumptions (library versions, API contracts, data structures) still hold.

If the handoff appears **very stale**, recommend:

- Carefully re-verifying the actual state.
- Creating a new, up-to-date handoff once the current situation is understood.

### 4. Begin Work from Immediate Next Steps

Use the “Immediate Next Steps” section as your primary guide:

- Start with step 1 unless the user explicitly reprioritizes.
- Before each major step, briefly confirm with the user if it still matches their goals.
- As steps are completed, keep an up-to-date mental or file-based record of what’s done.

If the work session becomes long or diverges significantly from the original plan, consider creating a **new, chained handoff** that references this one.

---

## Handoff Chaining

For long-running projects, maintain a **chain** of handoffs instead of bloating a single file.

When creating a new handoff that continues from an older one:

- Include a `Continues from: <previous-handoff-file>` line in the Metadata section.
- Carry forward only the context that still matters; do not duplicate everything.
- Optionally mark older handoffs as superseded once the new one fully replaces them.

When resuming:

- Start from the newest handoff in the chain.
- Refer to older handoffs only if you need historical decisions or earlier context.

---

## Best Practices

When using this skill, follow these general rules:

- Keep the handoff **under a few hundred lines** and under 5k tokens; move deep details into referenced docs if needed.
- Prefer **bullets and short sections** over long prose.
- Use descriptive, kebab-case slugs (e.g., `session-handoff`, `auth-refactor-part2`).
- Integrate handoffs with version control whenever possible.
- Avoid copying large code blocks; link to files and summarize the important patterns or issues instead.
- Front-load the most important, common sections (Metadata, Current State, Important Context, Immediate Next Steps) so they are read first.

Your objective is that any future AI agent or teammate can pick up the task and continue confidently, with minimal back-and-forth and no guesswork.
