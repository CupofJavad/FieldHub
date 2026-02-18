# TGND Agent System and Autonomy

**Purpose:** Describe how the live checklist and per-agent instructions work so agents can work cohesively and autonomously without the owner passing prompts after the initial handoff.

---

## 1. Components

| Component | Location | Purpose |
|-----------|----------|---------|
| **Live checklist** | `agents/live/CHECKLIST.md` | Single source of truth: phases, milestones, tasks, owner, status. |
| **Per-agent instructions** | `agents/live/instructions/<AGENT_NAME>.md` | Current focus and next actions for that agent. |
| **Initial prompts** | `agents/prompts/<AGENT_NAME>_*.md` | One-time prompt to paste into a new Cursor chat to “become” that agent. |

---

## 2. Autonomy Flow

1. **Owner** creates a new Cursor chat per agent and pastes the **initial prompt** from `agents/prompts/` (e.g. `ARCHIE_Project_Director.md`).
2. **Agent** executes the initial tasks in that prompt, then **updates** `agents/live/CHECKLIST.md` for their tasks (e.g. change Pending → Done).
3. **Agent** periodically **reads** `agents/live/CHECKLIST.md` and `agents/live/instructions/<AGENT_NAME>.md` to find **new work** (next task with their name and Pending).
4. **No further prompts** need to be copied from the Project Director or owner; the system is designed so agents pull work from the checklist and instruction files.

---

## 3. Rules

- **One owner per task** – no duplicate work; handoff is by checklist assignee.
- **Coordination** – Archie can unblock and align; agents can read other agents’ instruction files only to coordinate, not to do their work.
- **Enhancements** – Any change to this system (e.g. adding a task queue, priority flags, or a bot that assigns work) must be **documented** and **permission requested from Javad** before modifying the live checklist format or agent workflow.

---

## 4. Possible Future Enhancements (Do Not Implement Without Permission)

- **Task queue or priority:** A separate file or table listing “next available task” per agent to reduce parsing of CHECKLIST.
- **Notifications:** A lightweight mechanism (e.g. a “last_updated” or “pending_for” file) so agents know when new work is assigned.
- **Slack/Discord bot:** Optional integration that posts “Task X assigned to Agent Y” when the checklist is updated (would require owner approval and credentials).

These are **additions only**; the current checklist + instruction file design remains the base. Document any new mechanism in this file and request owner approval before implementing.

---

*This document is the reference for the agent system. Agents and the Project Director should follow it so the owner does not need to swivel between chats to pass prompts.*
