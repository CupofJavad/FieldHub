# SCT System Recreation Project

This directory holds design and scope documents for **recreating an enhanced field-service system** inspired by the legacy Service Center Team (SCT) platform. The system supports work orders from OEMs, extended-warranty providers, and customer-pay; multiple service types (OSR, OSS/Last Mile, installation, depot); integration with on-demand field-tech platforms; and a clear **AI vs. human** operating model—with AI agents handling difficult or less desirable tasks and humans (especially the on-site tech and inbound calls) kept in the loop or fully in charge.

**Relationship to workspace:** This project is related to the Job_Seeking_2026 workspace; source evidence for the original SCT design came from `00_Source_Materials/Sample Work from Various Roles/` (SCT folder, Notes_Search_Results, etc.).

---

## Documents in this folder

| Document | Purpose |
|----------|---------|
| [SCT_Design_Scope_System_Portal_App.md](./SCT_Design_Scope_System_Portal_App.md) | Original SCT system, portal, and app design scope (evidence-based from sample work). |
| [SCT_Enhanced_System_Design_And_Build_Scope.md](./SCT_Enhanced_System_Design_And_Build_Scope.md) | Enhanced platform: inbound (API, EDI, webhooks, batch), service types, outbound field platforms, AI, phased build. |
| [SCT_End_User_Workflows_And_Processes.md](./SCT_End_User_Workflows_And_Processes.md) | End-user workflows and processes (provider, back-office, technician, end customer, admin). |
| [SCT_AI_and_Human_Operating_Model.md](./SCT_AI_and_Human_Operating_Model.md) | Which roles and processes are AI-led (with human in the loop), human-led with AI support, or human-only. |

---

## Vision (short)

- **Recreate** a system that supports the functions described in the design and workflow docs.
- **AI agents** handle difficult or less desirable work: parts reconciliation, claim processing, outbound tech communications (e.g. reminders to service customers).
- **Human in the loop** for all other roles; **on-site tech remains human**, supported by AI only for repair/diag instructions, claims assistance, service radius assignment, etc.
- **Human-only** where judgment and relationship matter: **inbound phone calls** and other high-touch interactions (scheduling with EU, escalations, exceptions).

See [SCT_AI_and_Human_Operating_Model.md](./SCT_AI_and_Human_Operating_Model.md) for the full operating model.
