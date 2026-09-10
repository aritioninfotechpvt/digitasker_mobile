# InsightLoop Frontend V5 — Feature-Freeze Prototype

A React/Vite frontend prototype for a task-based mystery audit, survey, field research and experience-verification platform. V5 includes four operating surfaces: Platform Auditor/User, Admin/Super Admin, Client/Brand, and Multi-Vendor Partner Network.

## V5 headline architecture
`Campaign -> Task -> Sourcing Pool -> Assignment -> Submission -> Verification/QC -> Payment/Settlement -> Client Report`

Sourcing can be `Direct User`, `Vendor Managed`, or `Vendor Bid` and one campaign may mix all three.

## New in V5
- Operations Control Tower
- Vendor Commercials / Rate Cards
- Vendor Contracts & Compliance
- Vendor Capacity / Availability
- Vendor RFQ & Bidding
- Vendor Performance Scorecards
- Vendor Workforce Management
- Vendor Settlement & Reconciliation
- Smart Allocation Engine
- Campaign Budget Control
- Governance / Consent / Approval Chains
- White-label Tenant Controls
- Explicit Task Sourcing Models
- Vendor-facing rate, compliance, capacity, bidding, settlement and workforce screens

## Main new Admin routes
- `/admin/control-tower`
- `/admin/vendor-commercials`
- `/admin/vendor-contracts`
- `/admin/vendor-capacity`
- `/admin/vendor-bidding`
- `/admin/vendor-performance`
- `/admin/vendor-workforce`
- `/admin/vendor-settlements`
- `/admin/task-sourcing`
- `/admin/smart-allocation`
- `/admin/budget-control`
- `/admin/governance`
- `/admin/white-label`

## Main new Vendor routes
- `/vendor/workforce`
- `/vendor/commercials`
- `/vendor/capacity`
- `/vendor/bids`
- `/vendor/settlements`
- `/vendor/contracts`

## Run locally
```bash
npm install
npm run dev
```

All screens use dummy data from `src/data/dummy.js`. Replace those collections with Laravel API resources/query responses during backend integration.

See `BACKEND_CONTRACT.md` for proposed Laravel domains, tables, APIs, statuses and accounting rules. See `V5_FEATURE_MATRIX.md` for the feature-freeze coverage.
