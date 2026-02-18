# Phase 3 – Detailed Checklist (AI Layer & Automation)

Use this for **subtask-level** progress. Main status stays in `agents/live/CHECKLIST.md`. Spec: `docs/PHASE3_HANDOFF.md`.

---

## M3.1 – Rule-based routing (Morgan) ✅ Done

- [x] recommendTopN (zip, radius, skills); optional config

---

## M3.2 – Scheduling suggestions; anomaly alerts (Morgan) ✅ Done

- [x] Read `docs/PHASE3_HANDOFF.md` (§ M3.2)
- [x] Scheduling suggestions: suggest appointment windows or “ready to schedule” list (API or packages/ai function)
- [x] Anomaly alerts: TAT breaches, rejection/stuck WO detection; expose as list or API (e.g. GET /v1/ai/anomalies)
- [x] Update build-notes/Morgan.md and this checklist; mark CHECKLIST M3.2 Done

---

## M3.3 – Document/notes extraction (LLM) (Morgan) ✅ Done

- [x] Read `docs/PHASE3_HANDOFF.md` (§ M3.3)
- [x] Extraction in packages/ai: text → structured WO fields (problem, product, ship_to, serial, etc.); use LLM API (env for keys)
- [x] Integration point: document how to invoke and wire to WO create flow; human review before create
- [x] Update build-notes and this checklist; mark CHECKLIST M3.3 Done

---

## M3.4 – Optional conversational dispatch (Morgan) ✅ Done

- [x] Read `docs/PHASE3_HANDOFF.md` (§ M3.4)
- [x] Intent + entity parsing: utterance → intent (schedule_wo, list_open, assign_wo) + entities (zip, wo_id, date)
- [x] API bridge: map parsed result to internal API calls; endpoint or script; human confirms execution
- [x] Update build-notes and this checklist; mark CHECKLIST M3.4 Done

---

## M3.5 – AI-led agents integration (Morgan / Archie) ✅ Done

- [x] Read `docs/PHASE3_HANDOFF.md` (§ M3.5) and `SCT_System_Recreation_Project/SCT_AI_and_Human_Operating_Model.md`
- [x] Parts reconciliation agent: match tracking to WOs; suggest parts shipped/return received; flag open cores
- [x] Claim-processing agent: map completion to claim format; prepare/submit; ingest responses; flag denials
- [x] Outbound tech-communications agent: reminder rules (appointment, parts, cores); draft/send templated messages
- [x] Human in the loop for all three; document invoke and approval flows
- [x] Update build-notes (Morgan, Archie) and this checklist; mark CHECKLIST M3.5 Done

---

*Agents: update this file as you complete subtasks; keep CHECKLIST.md in sync.*
