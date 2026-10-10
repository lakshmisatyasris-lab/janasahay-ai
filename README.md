# JanSahay AI

A citizen-focused information assistant for discovering Indian government schemes, understanding preliminary eligibility considerations, preparing document checklists and finding official application links.

## Implemented
- Responsive landing page and searchable, category-filtered scheme directory backed by PostgreSQL.
- Multilingual AI guidance endpoint using Hatchable's managed AI capability.
- Preliminary directory-based helper; it is intentionally not an official eligibility decision.
- Passwordless end-user sign-in and per-user saved-scheme storage.
- Security-minded prompts and UI warnings not to share Aadhaar numbers, bank details, OTPs or passwords.

## Setup and launch
- Configure an available AI provider in the Hatchable project Setup/settings to enable the assistant.
- The first deployment applies database migrations and seeds the starter scheme directory.
- The project starts private. To allow public visitors, change project visibility in Hatchable Settings after reviewing the app and its data-handling needs.

## Important limitations
This is an informational product, not a government agency. The initial scheme directory is a starter set, not a complete or real-time database. Rules, deadlines, benefits and eligibility change; users should verify them at official portals. No automatic government application submission or live application-status integration is claimed.