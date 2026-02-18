# TGND Agent System and Autonomy

**Purpose:** Describe how the live checklist, detailed checklists, build notes, and per-agent instructions work so agents stay in sync and the owner doesn’t need to pass prompts after the initial handoff.

---

## 1. Components

| Component | Location | Purpose |
|-----------|----------|---------|
| **Live checklist** | `agents/live/CHECKLIST.md` | Single source of truth: phases, milestones, tasks, owner, status. |
| **Detailed checklists** | `agents/live/checklists/` | Per-phase or per-milestone **subtask** checklists (e.g. Phase1.md). |
| **Build notes / logs** | `agents/live/build-notes/<AGENT>.md` | Per-agent **detailed logs**: what you did, decisions, issues, handoffs. |
| **Per-agent instructions** | `agents/live/instructions/<AGENT_NAME>.md` | Current focus and next actions for that agent. |
| **Status** | `agents/live/STATUS.md` | Coordination summary and immediate next actions. |
| **Initial prompts** | `agents/prompts/<AGENT_NAME>_*.md` | One-time prompt to paste into a new Cursor chat to “become” that agent. |

---

## 2. What agents must update when they complete work

1. **Main checklist:** In `agents/live/CHECKLIST.md`, set your task’s Status to **☑ Done** and add the date.
2. **Detailed checklist:** In `agents/live/checklists/`, create or update the file for that phase/milestone (e.g. Phase1.md) with **subtask checkboxes** so progress is visible at a granular level.
3. **Build notes:** Append an entry at the **top** of `agents/live/build-notes/<YOUR_NAME>.md` with date, milestone, what you did, decisions, issues, and handoff notes for other agents. See `agents/live/build-notes/README.md`.

---

## 3. Autonomy flow

1. **Owner** creates a new Cursor chat per agent and pastes the **initial prompt** from `agents/prompts/`.
2. **Whenever an agent is active** (user opens the chat or pings the agent), the agent **must**:
   - **First:** Read `agents/live/CHECKLIST.md`, `agents/live/STATUS.md`, and `agents/live/instructions/<YOUR_NAME>.md` to find new work.
   - **Then:** Read recent entries in `agents/live/build-notes/` from agents you depend on (e.g. Dana reads Corey’s notes; Sam reads Corey’s).
   - **Then:** Set up your environment (deps, config, scripts) for your **next** assigned tasks so you can start immediately.
   - **Then:** Take the next Pending task assigned to you, or anticipate work (e.g. scaffold integration points for an upcoming task).
3. **When the agent completes work:** Update CHECKLIST, detailed checklist in `checklists/`, and build notes in `build-notes/<YOU>.md` as above.
4. **No further prompts** need to be copied from the owner; agents pull work from the live directory whenever they run.

---

## 4. Checking for new work: 30–60 second polling vs reality

**Can agents check the list every 30–60 seconds automatically?**  
**No.** Cursor agents are chat-based: they only run when the user opens that chat or sends a message. There is no built-in way for an agent to “wake up” on a timer (e.g. every 30–60 sec) inside Cursor.

**What we do instead:**

- **Whenever you are invoked** (user opens your chat or pings you), treat that as “poll time”: the **first thing** you do is read the live directory (CHECKLIST, STATUS, your instructions, recent build-notes from dependents). So effectively we **poll when the agent runs**, not on a fixed clock.
- **Owner workflow to keep agents busy:** Open each agent chat in turn (e.g. Jordan → Archie → Corey → Dana → …) or ping them periodically; each time an agent runs, it checks for new work and does the next task. Optionally use a single “orchestrator” chat that says: “Read CHECKLIST and STATUS; tell me which agent to run next and why.”
- **Future options (need your approval):** A script or cron that touches a “work-request” file or commits a heartbeat so there’s a clear “something changed” signal; agents would still need to be invoked to react. Or an external scheduler that opens Cursor / sends a message on an interval (outside Cursor).

---

## 5. Efficient practices: stay busy, anticipate, set up environment

- **Stay busy:** When you have no Pending task in the checklist, still use your session to: (1) set up or verify your **environment** (deps, config, scripts) for your *next* likely task, (2) read other agents’ build-notes and **anticipate** handoffs (e.g. “Dana will need an example request for POST /v1/work-orders” – add it to build-notes or docs), (3) add or refine **detailed checklist** subtasks for your next milestone, (4) run tests or lint so the next session starts from a clean state.
- **Anticipate work:** Read `agents/live/build-notes/` for agents you depend on or who depend on you; note “next steps” or “handoff” in your own build-notes so the next agent can start without delay.
- **Set up your assigned environment:** Each agent owns part of the stack (API, DB, portal, adapters, etc.). When you’re active, ensure your area is runnable and documented (e.g. how to start the API, run migrations, run tests) so you and others can pick up work quickly.

---

## 6. Rules

- **One owner per task** – no duplicate work; handoff is by checklist assignee.
- **Coordination** – Archie can unblock and align; agents can read other agents’ instruction files only to coordinate, not to do their work.
- **Enhancements** – Any change to this system (e.g. adding a task queue, priority flags, or a bot that assigns work) must be **documented** and **permission requested from Javad** before modifying the live checklist format or agent workflow.

---

## 7. Possible Future Enhancements (Do Not Implement Without Permission)

- **Task queue or priority:** A separate file or table listing “next available task” per agent to reduce parsing of CHECKLIST.
- **Notifications:** A lightweight mechanism (e.g. a “last_updated” or “pending_for” file) so agents know when new work is assigned.
- **Slack/Discord bot:** Optional integration that posts “Task X assigned to Agent Y” when the checklist is updated (would require owner approval and credentials).

These are **additions only**; the current checklist + detailed checklists + build-notes + instruction file design remains the base. Document any new mechanism in this file and request owner approval before implementing.

---

*This document is the reference for the agent system. Agents and the Project Director should follow it so the owner does not need to swivel between chats to pass prompts. When you complete work: update CHECKLIST, `agents/live/checklists/`, and `agents/live/build-notes/<YOU>.md`. When you start a session: read CHECKLIST, STATUS, your instructions, and recent build-notes first; then set up your environment and take the next task or anticipate work.*
