# InsightLoop V3 — Laravel Backend Contract

## Core domain flow
Campaign -> Task -> Eligibility Rules -> Assignment -> Survey/Evidence -> Submission -> Verification -> Reward Hold -> Wallet -> Payout -> Client Report

## Recommended Laravel modules / tables

### Identity & Access
- users
- user_profiles
- user_addresses
- user_interests
- user_devices
- user_kyc
- user_bank_accounts
- roles
- permissions
- role_user / permission_role
- login_history

### Clients & Campaigns
- clients
- client_users
- campaigns
- campaign_locations
- campaign_budgets
- campaign_files

### Locations
- countries / states / cities (or unified locations table)
- stores
- store_contacts
- task_locations

### Tasks
- task_categories
- tasks
- task_eligibility_rules
- task_slots
- task_evidence_requirements
- task_assignments
- task_status_history

### Surveys
- surveys
- survey_sections
- survey_questions
- survey_question_options
- survey_logic_rules
- survey_answers

### Submissions
- task_submissions
- submission_files
- submission_locations
- submission_reviews
- submission_scores
- submission_revisions
- disputes
- dispute_messages

### Finance
- wallets
- wallet_transactions
- reward_holds
- withdrawal_requests
- payouts
- payout_batches
- payment_methods

### Growth & Communication
- referrals
- referral_rewards
- bonus_programs
- bonus_qualifications
- notifications
- notification_templates
- support_tickets
- support_messages

### Compliance & Platform
- fraud_signals
- user_risk_scores
- file_hashes
- audit_logs
- settings

## Key status enums

### task.status
DRAFT, SCHEDULED, PUBLISHED, PAUSED, COMPLETED, CANCELLED, ARCHIVED

### assignment.status
AVAILABLE, APPLIED, APPROVED, RESERVED, IN_PROGRESS, SUBMITTED, EXPIRED, CANCELLED

### submission.status
DRAFT, SUBMITTED, UNDER_REVIEW, REVISION_REQUIRED, APPROVED, REJECTED, DISPUTED

### reward_hold.status
PENDING_APPROVAL, ON_HOLD, RELEASED, REVERSED

### withdrawal.status
REQUESTED, UNDER_REVIEW, APPROVED, PROCESSING, PAID, FAILED, REJECTED, CANCELLED

### kyc.status
NOT_STARTED, PENDING, VERIFIED, REJECTED, REQUIRES_UPDATE

## Suggested REST API map

### Auth & profile
POST /api/auth/register
POST /api/auth/login
POST /api/auth/otp/verify
POST /api/auth/logout
GET /api/me
PUT /api/me/profile
PUT /api/me/interests
PUT /api/me/locations
GET /api/me/devices
POST /api/me/kyc
GET /api/me/kyc
POST /api/me/payout-methods

### Auditor task experience
GET /api/tasks/available
GET /api/tasks/{task}
POST /api/tasks/{task}/apply
POST /api/tasks/{task}/reserve
POST /api/assignments/{assignment}/start
POST /api/assignments/{assignment}/submit
POST /api/submissions/{submission}/files
GET /api/me/assignments
GET /api/me/submissions

### Wallet
GET /api/me/wallet
GET /api/me/wallet/transactions
POST /api/me/withdrawals
GET /api/me/withdrawals

### Admin users / KYC / risk
GET /api/admin/users
GET /api/admin/users/{user}
PATCH /api/admin/users/{user}/status
GET /api/admin/kyc
GET /api/admin/kyc/{user}
POST /api/admin/kyc/{user}/approve
POST /api/admin/kyc/{user}/reject
GET /api/admin/users/{user}/risk
POST /api/admin/users/{user}/risk-actions

### Clients
GET /api/admin/clients
POST /api/admin/clients
GET /api/admin/clients/{client}
PUT /api/admin/clients/{client}
POST /api/admin/clients/{client}/users

### Campaigns
GET /api/admin/campaigns
POST /api/admin/campaigns
GET /api/admin/campaigns/{campaign}
PUT /api/admin/campaigns/{campaign}
POST /api/admin/campaigns/{campaign}/publish

### Tasks / eligibility / surveys
POST /api/admin/tasks
PUT /api/admin/tasks/{task}
POST /api/admin/tasks/{task}/publish
POST /api/admin/tasks/{task}/eligibility-rules
POST /api/admin/tasks/{task}/evidence-requirements
POST /api/admin/tasks/{task}/slots
POST /api/admin/tasks/{task}/survey
PUT /api/admin/surveys/{survey}

### Bulk import
POST /api/admin/imports/tasks/validate
POST /api/admin/imports/tasks/commit
GET /api/admin/imports/{import}
GET /api/admin/imports/{import}/errors

### Stores / locations
GET /api/admin/stores
POST /api/admin/stores
PUT /api/admin/stores/{store}
POST /api/admin/stores/import

### Verification
GET /api/admin/submissions
GET /api/admin/submissions/{submission}
POST /api/admin/submissions/{submission}/approve
POST /api/admin/submissions/{submission}/reject
POST /api/admin/submissions/{submission}/request-revision
POST /api/admin/submissions/{submission}/score

### Disputes
GET /api/admin/disputes
GET /api/admin/disputes/{dispute}
POST /api/admin/disputes/{dispute}/resolve
POST /api/disputes/{submission}
POST /api/disputes/{dispute}/messages

### Payouts
GET /api/admin/withdrawals
POST /api/admin/withdrawals/{withdrawal}/approve
POST /api/admin/withdrawals/{withdrawal}/reject
POST /api/admin/payout-batches
GET /api/admin/payout-batches/{batch}

### Referrals / bonuses
GET /api/admin/bonus-programs
POST /api/admin/bonus-programs
PUT /api/admin/bonus-programs/{program}
GET /api/me/referrals

### Notifications
GET /api/admin/notification-templates
PUT /api/admin/notification-templates/{template}
POST /api/admin/notification-templates/{template}/test
GET /api/me/notifications
POST /api/me/notifications/{notification}/read

### RBAC / audit logs
GET /api/admin/roles
POST /api/admin/roles
PUT /api/admin/roles/{role}/permissions
GET /api/admin/audit-logs

### Reports
GET /api/admin/reports/overview
GET /api/admin/reports/tasks
GET /api/admin/reports/users
GET /api/admin/reports/payments
GET /api/client/reports/campaigns/{campaign}
GET /api/client/reports/campaigns/{campaign}/export

## Eligibility rule model
Use data-driven rules instead of hardcoding conditions.

Example JSON:
```json
{
  "match": "ALL",
  "rules": [
    {"field":"city_id","operator":"IN","value":[12,18]},
    {"field":"age","operator":"BETWEEN","value":[21,40]},
    {"field":"approval_rate","operator":">=","value":90},
    {"field":"interest","operator":"CONTAINS","value":"Dining"}
  ]
}
```

## Financial ledger rule
Never calculate wallet balance only from a mutable balance field. Keep a wallet ledger with immutable credit/debit transactions and derive totals. Reward approval should create an ON_HOLD ledger entry; the scheduled release job converts it to AVAILABLE after the configured hold period.

## File storage
Store images/videos/docs in private S3 or Cloudflare R2. Save only metadata, storage key, MIME, size, hash, capture/GPS metadata and moderation status in MySQL. Use signed URLs for viewing evidence.

## Queue jobs
- evidence metadata extraction
- image hash / duplicate check
- video processing
- notification delivery
- scheduled reward release
- payout batch processing
- report generation
- risk score recalculation

## Important audit requirements
Every approval, rejection, payout, wallet adjustment, KYC decision, role change and platform-setting change should create an immutable audit log containing actor, action, before/after data, resource, IP/device and timestamp.

# V4 Advanced / Enterprise Contract

## New domain modules

### Workflow engine
Tables: `workflow_templates`, `workflow_versions`, `workflow_nodes`, `workflow_edges`, `workflow_executions`, `workflow_execution_steps`.

Suggested endpoints:
- `GET /api/admin/workflows`
- `POST /api/admin/workflows`
- `POST /api/admin/workflows/{workflow}/versions`
- `POST /api/admin/workflows/{workflow}/test`
- `POST /api/admin/workflows/{workflow}/publish`

Node types: `trigger`, `location`, `form`, `evidence`, `logic`, `survey`, `qc`, `hold`, `notification`, `finish`.
Store node configuration in JSON, but keep versioned immutable snapshots for active assignments.

### QC / maker-checker
Tables: `qc_rules`, `qc_assignments`, `qc_reviews`, `reviewer_metrics`.
Statuses: `pending`, `first_reviewed`, `second_review_required`, `qc_approved`, `qc_overridden`, `escalated`.
Support rule-based sampling by client/campaign/risk/reward/score plus random sample percentage.

### Fraud & trust
Tables: `risk_rules`, `risk_events`, `risk_scores`, `device_fingerprints`, `media_hashes`, `location_anomalies`, `fraud_cases`, `fraud_case_actions`.
Never auto-reject solely from one heuristic. Risk engine should create explainable signals and allow reviewer override.

### Finance & reconciliation
Tables: `client_wallets`, `client_wallet_transactions`, `campaign_fund_reservations`, `reward_liabilities`, `tax_profiles`, `invoices`, `invoice_items`, `credit_notes`, `reconciliation_batches`, `reconciliation_items`.
Use double-entry style ledger semantics for monetary movements; avoid mutating historical transaction amounts.

### Automation engine
Tables: `automation_rules`, `automation_versions`, `automation_runs`, `automation_run_steps`.
Events may include `task.quota_reached`, `submission.pending`, `submission.approved`, `wallet.hold_releasable`, `user.inactive`, `campaign.deadline_near`.
Execute through Laravel queues with idempotency keys and retry policies.

### Training & certification
Tables: `courses`, `course_lessons`, `quizzes`, `quiz_questions`, `course_enrollments`, `quiz_attempts`, `certifications`, `user_certifications`.
Eligibility rules can require certification IDs and validity dates.

### Communication hub
Tables: `conversations`, `conversation_participants`, `messages`, `message_attachments`, `broadcasts`, `broadcast_audiences`, `broadcast_deliveries`, `notification_preferences`.
Channels: in-app, push, email, SMS, WhatsApp where permitted/configured.

### System operations
Expose protected admin-only endpoints for queue statistics, service health, storage consumption, active sessions, feature flags, retention policies and maintenance state. Never expose secrets/API credentials in plaintext after creation.

### API & webhooks
Tables: `api_clients`, `api_keys`, `api_scopes`, `webhook_endpoints`, `webhook_subscriptions`, `webhook_deliveries`.
Webhook deliveries need HMAC signatures, timestamps, retry strategy and replay protection.

### Enterprise client access
Tables: `client_users`, `client_roles`, `client_permissions`, `client_data_scopes`.
Scopes may restrict by brand, campaign, region, city, store or report-only access.

### Custom/scheduled reports
Tables: `report_templates`, `report_template_blocks`, `report_runs`, `report_schedules`, `report_recipients`, `generated_files`.
Generate heavy PDF/Excel reports asynchronously through queues and store private files using signed URLs.

### Offline/mobile sync contract
Tables: `offline_assignment_packages`, `sync_sessions`, `sync_operations`, `sync_conflicts`.
Each mutation from mobile should carry a client-generated UUID/idempotency key, local timestamp and device ID. Server is authoritative for task status/reward, while evidence uploads should support resumable/chunked transfer.

## Advanced status additions
- Assignment: `waitlisted`, `downloaded_offline`, `checked_in`, `checked_out`, `sync_pending`, `sync_conflict`.
- Submission: `first_review`, `second_review`, `qc_hold`, `fraud_hold`, `client_escalation`.
- Reward: `pending_verification`, `approved_hold`, `fraud_hold`, `available`, `payout_requested`, `processing`, `paid`, `reversed`.

## Recommended background jobs
- media hash generation / metadata inspection
- duplicate evidence detection
- GPS distance and impossible-travel checks
- risk score recalculation
- task matching and waiting-list promotion
- quota closure
- SLA escalation
- reward hold release
- payout reconciliation
- report generation
- notification/broadcast delivery
- certification expiration reminders
- webhook delivery retries
- retention/archive cleanup

## API response convention
All list endpoints should support `page`, `per_page`, `search`, `sort`, filters and return pagination metadata. For frontend compatibility, prefer stable IDs and explicit enums over display strings.

Example:
```json
{
  "data": [],
  "meta": {"page": 1, "per_page": 25, "total": 0},
  "filters": {},
  "request_id": "uuid"
}
```

# V4.1 — Multi-Vendor / Partner Network

## Hierarchy
`Super Admin → Vendor Organization → Vendor Members`

The platform supports any number of vendors. A vendor is an organization/partner account, not a normal auditor user. Vendor managers can invite/register members, assign only the inventory allocated by Admin, review member progress, and release member payouts from funds already released/authorized to that vendor.

## Suggested tables
- `vendors` — legal/business profile, status, tax/KYC, agreement, coverage, primary manager, quality thresholds.
- `vendor_users` — vendor owners/managers/operators with vendor-scoped roles.
- `vendor_members` — link between vendor and auditor/member user, invitation status, joined_at, member code.
- `vendor_member_invitations` — email/mobile invite token, expiry, inviter, status.
- `vendor_allocations` — campaign/task/location allocation from Admin to vendor, quota, unit vendor reward, budget ceiling, SLA, validity.
- `vendor_task_assignments` — vendor allocation distributed to member, member reward, assignment status.
- `vendor_wallets` — vendor available, hold, reserved, payable and lifetime settlement balances.
- `vendor_wallet_transactions` — immutable vendor ledger.
- `vendor_payment_releases` — Admin → Vendor release/hold/adjustment records.
- `vendor_member_payouts` — Vendor → Member payout batches/items.
- `vendor_commission_rules` — vendor margin mode: fixed/task, percentage, tiered or admin-defined ceiling.
- `vendor_quality_rules` — approval rate, SLA, fraud threshold and auto-pause settings.

## Allocation controls
Admin allocation should support: vendor(s), campaign, task template, store/location set, quota, start/end, per-task amount payable to vendor, maximum amount vendor may promise a member, SLA, required member certification, member demographic eligibility, evidence/QC policy and whether vendor may reassign failed/expired work.

A task may be split among multiple vendors, for example 500 visits → Vendor A 200, Vendor B 150, Vendor C 150. Enforce atomic quota reservation to prevent over-assignment.

## Reward chain
Keep three different amounts in the ledger: `client_cost`, `vendor_reward`, and `member_reward`. Never infer one from another after posting transactions.

Example: Client cost ₹550 → Admin allocates vendor ₹400 → Vendor allocates member ₹300 → vendor gross margin ₹100; platform gross margin before costs ₹150.

Recommended financial states:
`admin_reserved → vendor_earned_hold → vendor_available → member_reserved → member_earned_hold → member_available → member_paid`.

Admin can freeze/reverse vendor funds only using auditable adjustment transactions. Vendor cannot release more than its available/authorized member payout balance.

## APIs
Admin:
- `POST /api/admin/vendors`
- `GET /api/admin/vendors`
- `GET|PATCH /api/admin/vendors/{vendor}`
- `POST /api/admin/vendors/{vendor}/allocations`
- `GET /api/admin/vendors/{vendor}/ledger`
- `POST /api/admin/vendors/{vendor}/payment-releases`
- `POST /api/admin/vendors/{vendor}/freeze`

Vendor:
- `GET /api/vendor/dashboard`
- `GET /api/vendor/members`
- `POST /api/vendor/members/invite`
- `POST /api/vendor/members/register`
- `PATCH /api/vendor/members/{member}`
- `GET /api/vendor/allocations`
- `POST /api/vendor/allocations/{allocation}/assign`
- `POST /api/vendor/allocations/{allocation}/auto-assign`
- `POST /api/vendor/assignments/{assignment}/reassign`
- `GET /api/vendor/wallet`
- `GET /api/vendor/ledger`
- `POST /api/vendor/member-payouts/batches`
- `POST /api/vendor/member-payouts/{payout}/release`

Member:
Existing `/api/user/*` task APIs continue to work. Add `source_type=vendor`, `vendor_id`, `vendor_allocation_id`, and `vendor_member_reward` to relevant assignment responses without exposing vendor margin.

## Permissions / isolation
Every vendor-side query must be tenant-scoped by authenticated `vendor_id`. Vendor A can never list Vendor B members, assignments, finance or files. Vendor managers may have granular permissions such as `member.invite`, `task.assign`, `submission.view`, `payout.prepare`, `payout.release`, `report.view`.

Admin controls whether vendor can see client/brand identity, raw reports, member contact data, margin details, or only operational task instructions.

# V5 Feature-Freeze Addendum — Multi-Vendor Enterprise Commercial & Governance Layer

## 1. Task sourcing modes
Every campaign/task allocation must declare one of three sourcing modes:

- `direct_user`: platform admin assigns directly to registered auditors/users.
- `vendor_managed`: admin allocates campaign/task inventory and budget to a vendor; vendor assigns to its members.
- `vendor_bid`: admin publishes an RFQ; one or more vendors quote rate/capacity/timeline and admin awards full or partial scope.

Recommended columns on `campaign_task_pools`: `campaign_id`, `source_type`, `total_quantity`, `allocated_quantity`, `reserved_budget`, `status`.

## 2. Vendor commercial model
Recommended tables:
- `vendor_rate_cards`
- `vendor_rate_card_items`
- `vendor_commercial_terms`
- `vendor_security_deposits`
- `vendor_credit_limits`

Rate-card item fields: vendor, task category/type, country/state/city/zone, base vendor rate, max member payout, platform margin rule, minimum quantity, effective_from, effective_to, tax behavior, currency, status, approval metadata.

No task should be allocated to a vendor without a valid rate/commercial rule unless an explicit admin override is audited.

## 3. Contracts and compliance
Recommended tables:
- `vendor_contracts`
- `vendor_contract_versions`
- `vendor_documents`
- `vendor_document_types`
- `vendor_compliance_checks`

Track agreement dates, renewal method, termination notice, GST/PAN/bank verification, authorized signatory, NDA/DPA, expiry reminders, status, reviewer and evidence.

A configurable rule may automatically block new allocations or settlements when critical compliance expires.

## 4. RFQ / bidding
Recommended tables:
- `vendor_rfqs`
- `vendor_rfq_invitees`
- `vendor_bids`
- `vendor_bid_items`
- `vendor_bid_awards`

Vendor bid captures rate, available quantity, start date, completion date/SLA, exclusions, comments, validity, commercial attachments and status. Admin can split award quantity across multiple vendors.

Endpoints:
- `POST /api/admin/rfqs`
- `POST /api/admin/rfqs/{id}/invite-vendors`
- `GET /api/vendor/rfqs`
- `POST /api/vendor/rfqs/{id}/bids`
- `POST /api/admin/rfqs/{id}/award`

## 5. Vendor capacity and coverage
Recommended tables:
- `vendor_capacity_calendars`
- `vendor_capacity_slots`
- `vendor_coverage_areas`
- `vendor_blackout_dates`
- `vendor_priority_rules`

Capacity should be queryable by date, geography, task type, certification, total members, available members and currently committed quantity.

## 6. Workforce availability
Extend vendor members with:
- skill tags
- certifications
- work radius/service zones
- availability calendar
- leave/blackout periods
- max tasks/day
- max concurrent tasks
- quality score
- preferred task types
- device/KYC state

Recommended supporting tables: `member_availability`, `member_skills`, `member_certifications`, `member_service_areas`, `member_work_limits`.

## 7. Smart allocation engine
Allocation scoring must be configurable. Example weighted inputs:
- distance/service-area fit
- vendor/member spare capacity
- historical quality
- certification match
- SLA performance
- cost efficiency
- fraud/risk status
- workload fairness

Recommended tables: `allocation_models`, `allocation_model_weights`, `allocation_recommendations`, `allocation_decisions`.

All automatic assignments should save the score breakdown and reason for auditability.

## 8. Vendor performance scorecard
Store periodic score snapshots for completion %, QC %, SLA %, fraud %, disputes %, rework %, member quality and finance/compliance health.

Recommended tables: `vendor_scorecards`, `vendor_score_components`, `vendor_tiers`.

Support auto-tiering such as Platinum/Gold/Silver and configurable consequences like preferred allocation or temporary pause.

## 9. Vendor settlement engine
Recommended accounting tables:
- `vendor_settlement_batches`
- `vendor_settlement_lines`
- `vendor_invoices`
- `vendor_tax_lines`
- `vendor_adjustments`
- `vendor_credit_notes`
- `vendor_debit_notes`
- `vendor_reconciliation_items`

Settlement formula should preserve separately: approved work value, GST, TDS/withholding, bonuses, penalties, debit/credit notes, previous advances, holds and final net payable.

Money movement remains:
`Client Funding -> Platform Reserve -> Vendor Payable/Hold -> Vendor Available -> Member Payable/Hold -> Member Paid`.

Never derive one ledger from another only at display time; persist immutable ledger movements.

## 10. Campaign budget waterfall
Recommended tables: `campaign_budgets`, `campaign_budget_reservations`, `campaign_budget_commitments`, `campaign_budget_actuals`, `campaign_budget_alerts`.

Track: client budget, platform reserve, vendor commitment, member commitment, actual approved cost, paid cost and remaining/uncommitted budget. Prevent allocations that exceed available/reserved budget unless an authorized override exists.

## 11. Operations control tower
Create read models/materialized summaries for:
- SLA risk
- unassigned inventory
- low vendor capacity
- QC backlog
- fraud escalations
- compliance expiry
- settlement blocks
- disputes ageing
- campaign budget overrun

Recommended APIs: `/api/admin/control-tower/summary`, `/incidents`, `/campaign-risk`, `/vendor-risk`.

## 12. Governance and consent
Recommended tables:
- `consent_templates`
- `user_consents`
- `campaign_consents`
- `data_retention_policies`
- `approval_chains`
- `approval_chain_steps`
- `approval_requests`
- `approval_actions`
- `sensitive_exports`

Use maker-checker for sensitive financial/commercial changes. Record old/new value, actor, scope, reason, IP/device/session and approval chain.

## 13. White-label tenants
Recommended tables:
- `tenant_branding`
- `tenant_domains`
- `tenant_email_settings`
- `tenant_feature_flags`

Support client/vendor logo, accent colors, portal name, custom domain, mail-from identity, login artwork and optional module visibility. Tenant branding must never alter authorization/data scope.

## 14. API permissions for V5
Add permissions such as:
`vendor.ratecard.view`, `vendor.ratecard.manage`, `vendor.contract.manage`, `vendor.capacity.manage`, `vendor.rfq.create`, `vendor.rfq.bid`, `vendor.rfq.award`, `vendor.settlement.create`, `vendor.settlement.approve`, `vendor.workforce.manage`, `allocation.model.manage`, `allocation.run`, `budget.override`, `compliance.override`, `whitelabel.manage`.

## 15. V5 statuses
Suggested enums:
- RFQ: `draft`, `published`, `bidding`, `evaluation`, `partially_awarded`, `awarded`, `cancelled`, `closed`
- bid: `draft`, `submitted`, `shortlisted`, `recommended`, `won`, `partially_won`, `lost`, `withdrawn`, `expired`
- contract: `draft`, `pending_signature`, `active`, `renewal_due`, `expired`, `suspended`, `terminated`
- settlement: `draft`, `calculating`, `compliance_hold`, `qc_hold`, `maker_approved`, `checker_approved`, `ready`, `processing`, `paid`, `failed`, `reconciled`
- capacity: `available`, `limited`, `full`, `blackout`

V5 is intended as the frontend feature freeze. New requests should normally be implemented as configuration, workflow rules or report definitions rather than new core domain modules.
