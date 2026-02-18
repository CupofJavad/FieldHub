# TGND Live – Detailed Checklists

**Purpose:** Per-agent or per-phase **detailed checklists** with subtasks. When you complete work, update both:

1. **Main checklist:** `agents/live/CHECKLIST.md` (mark the milestone Done).
2. **This directory:** Add or update a detailed checklist here so others (and you) see subtask-level progress and what’s left.

## Conventions

- **File naming:** `Phase0.md`, `Phase1.md`, or `<Agent>_<Milestone>.md` (e.g. `Corey_M1.1.md`, `Dana_M1.2.md`).
- **Content:** Break the milestone into subtasks with checkboxes. Example:
  - `- [x] POST /v1/work-orders returns 201 and id`
  - `- [ ] GET /v1/work-orders/:id returns 404 when missing`
- **When you finish a milestone:** Ensure the matching file here is updated so the main CHECKLIST “Done” is backed by a detailed list.

## Who updates

The **owner of the milestone** (see `agents/live/CHECKLIST.md`) creates or updates the corresponding file in this directory when they work on or complete that milestone.
