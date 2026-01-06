PRD_C — Co-selector Console UI/UX Detailed Spec (Prototype-Ready)
0. Document Control

Product: Co-selector Console (Web, Desktop-first)

Audience: Design + Frontend Eng + PM

Prototype Goal: A fully navigable prototype with realistic tables, drawers, forms, timelines, and state transitions (implemented with mock data / local storage).

Non-goal: Backend architecture, real settlement, real attribution, real KYC integrations.

1. Product Objective & Success Criteria
1.1 Objective

Enable a co-selector (KOL/共选者) to:

Create and manage tracking assets (links/QR/invite codes)

Manage content items and bind assets

Submit merchant/service leads into a structured pipeline

Understand earnings lifecycle clearly (Pending → Locked → Payable → Paid + Reversed)

Resolve issues via Inbox (reviews, reversals, disputes)

Complete compliance profile required for payout eligibility

This console must provide trust-by-transparency: every number can be drilled down to evidence; every status has a clear “next action”; every change is traceable by a timeline/audit log.

1.2 Success Criteria (Prototype Acceptance)

A reviewer can complete these demo journeys without explanation:

Create a link → see clicks/registrations/orders → see a Pending earning → see lock date → request withdrawal → see statement.

Submit a lead → see “Submitted → Under Review → Approved/Rejected” status changes with a timeline (“who/when/why”).

Open any earning row → view trace drawer showing attribution evidence + commission breakdown + locking policy.

Understand why payout is blocked from the Profile eligibility banner and fix it.

2. Glossary (Must Appear in “Help / Glossary”)

Tracking Asset: Shareable tracking entity (Short link / QR / Invite code).

Content Item: A managed record of a piece of content (platform, title, URL, publish date), optionally bound to assets.

Lead: A structured merchant/service provider opportunity submitted by co-selector for platform review/onboarding.

Lead Owner: The internal Ops/BD handler responsible for reviewing/advancing the lead (visible as “Assigned Owner” to co-selector; editable only on Ops side).

COI (Conflict of Interest): A declaration that the submitter has no disqualifying conflict (or has disclosed it). Appears as checkbox + disclosure field.

RBAC: Role-Based Access Control (permissions granted by role; see §4).

Locking Period / Locking Date: Window where a pending commission can be reversed/modified; after lock date it becomes locked. This maps to affiliate industry practices. 
impact.com Help Center
+1

Reversal / Reversed: Negative adjustment due to refund/dispute/fraud/void, etc. For “pending” earnings, reversal can happen before lock date; after lock, adjustments must be append-only ledger entries. 
impact.com Help Center
+1

Dispute: A case requiring evidence and response deadlines; dispute lifecycles often take weeks, with response deadlines typically within 7–21 days (network dependent). 
docs.stripe.com
+1

3. Design System Strategy (Do Not Start from Scratch)
3.1 Decision

Use an established admin component system to ensure speed, consistency, and accessibility:

Recommended: Ant Design (React) or MUI (React).

Prototype should pick one and standardize across the app.

Why: Admin products are table- and workflow-heavy; mature libraries already solve sorting/filtering/pagination/selection/drawers/modals/toasts consistently. Ant Design’s Table explicitly supports sort/search/paginate/filter patterns out-of-the-box. 
3x.ant.design

3.2 Unified UI Primitives (Global Reuse)

These must be identical across modules:

Data Table pattern: sorting, filters, pagination, column visibility, row actions, bulk actions

Filter Rail / Faceted Filters

Details Drawer (right-side) for “trace / evidence / detail”

Modal Dialog for confirm + risky actions

Action Bar above tables (primary actions + bulk actions)

Timeline component for auditability (status changes, notes, system events)

3.3 Accessibility Non-Negotiables

For any modal dialog:

Escape closes dialog

Focus is trapped within modal

Focus returns to trigger element on close 
W3C

For form errors:

Errors must be identified with clear text and not rely on color alone (WCAG error identification). 
ウェブアクセシビリティ基盤委員会（WAIC）

4. RBAC Structure (Role-Based Access Control)
4.1 Roles (MVP)

CO_SELECTOR (default): Full access to this console’s features, except internal-only edits (lead owner assignment, finance approvals).

OPS_BD (internal): Reviews leads, assigns owners, changes review statuses.

FINANCE (internal): Manages payouts and statements approval/execution.

4.2 How RBAC Appears in UI (Prototype Behavior)

Even without backend, prototype must visually enforce:

“Owner assignment” controls are disabled (tooltip: “Internal only”)

“Approve payout” buttons are hidden/disabled in co-selector view

Lead status changes triggered by Ops are represented by a “Simulate Ops Update” control (prototype-only, gated behind a “Dev Tools” toggle).

5. Information Architecture & Routing
5.1 Primary Navigation (Left Sidebar)

Home

Links

Content

Co-selection (Leads)

Earnings

Inbox

Profile & Compliance

5.2 Top Bar (Global Controls)

View Preset Switcher: Owner / Operator / Analyst / Finance (UI lens only; not permission)

Date Range: This month / last 30d / custom (+ compare optional)

Global Search: searches across asset_id, content_id, order_ref, lead_id, payout_id

Help / Glossary

Notifications Bell

6. Global UX Contract (Applies to Every Page)
6.1 Overview-first, Drill-down-second

Any KPI card or chart click must route to a filtered table view (deep-linked filters).

6.2 Progressive Disclosure Rules

Default UI shows only high-frequency decision information; advanced controls are collapsed into:

“Advanced filters”

“More details” drawer panels

“Explain this” tooltips
Progressive disclosure is explicitly intended to reduce cognitive load by gradually revealing complexity. 
uxpin.com
+1

6.3 Data Freshness Contract

Every analytics view must display:

Last updated at: timestamp

If stale beyond threshold: banner “Data may be delayed” + “Retry”

6.4 Table Interaction Contract (Standard)

All tables share:

Search (within module scope)

Column sort (client-side for prototype)

Filters (faceted + advanced)

Pagination

Row click opens Details Drawer

Row actions are in “…” menu + key actions inline

(Using Ant Table/MUI DataGrid capabilities is expected. 
3x.ant.design
+1
)

6.5 Modal Confirmation Contract

For destructive or financially sensitive actions (disable link, delete content item, withdraw request cancel):

Confirm modal with:

Title (risk-oriented)

Summary

Consequence text

Primary confirm button (explicit verb)

Secondary cancel

Must meet modal keyboard interaction expectations (Escape, focus trap). 
W3C

7. Page-Level UI/UX Specifications
7.1 Home (Dashboard)
7.1.1 Layout (Top → Down)

Context Header

Attribution model + window (read-only)

Rule version (vX.Y)

Risk status chip: Normal / Under Review / Frozen

Data freshness timestamp

KPI Strip (4–6 cards)

Contributed GMV

Orders

Registrations

CVR (Register→Order)

Estimated earnings (Pending + Locked)

Paid this period (Finance preset prioritizes)

Earnings Readiness Panel

Pending balance + next locking date

Locked balance

Payable balance + eligibility banner (“Blocked by: KYC / payout method / threshold / freeze”)

Reversed amount (strong warning)

(Industry semantics: pending commissions held for a holding/locking period; cancellations/refunds during holding can cancel commissions. 
Shopify Help Center
+1
)

Funnel Snapshot
Click → Register → First Purchase → Repeat Purchase

Dropdown: Channel tag (All / specific)

Drivers

Top assets

Top channels

Top content

Alerts & Next Actions

“X actions lock in next 7 days” → Earnings filtered by lock_end_at <= 7d

“Y reversals this period” → Earnings filtered state=Reversed

“Complete KYC to unlock payouts” → Profile/KYC tab

7.1.2 Interactions

Clicking a KPI card routes to the relevant module with filters pre-applied.

Alerts are clickable deep links (must preserve date range context).

7.1.3 Empty States

New user: “Getting Started” checklist with 3 CTAs:

Create first link

Add content item + bind link

Complete payout profile

7.2 Links (Invite & Links Center)
7.2.1 Links List (Primary Workspace)

Primary CTA: “Create asset”
Secondary: Export CSV, Manage columns

Table Columns (MVP)

Asset name + type chip (Short link / QR / Invite code)

Channel tag

Campaign (optional)

Status (Active/Disabled)

Clicks / Registrations / Orders / GMV

Est. earnings

Last activity time

Actions: Copy / QR / Disable / View

Filter Rail

Basic: Type, Status, Channel tag

Advanced (collapsed): Campaign, Landing target, Created date, Has conversions, Has reversals

7.2.2 Create Asset Wizard (3 Steps)

Step 1: Choose type
Step 2: Labeling (name, channel tag required; campaign optional)
Step 3: Landing target (URL/deeplink) + Generate

Validation

Name required (<= 60 chars)

Channel tag required (predefined list + “custom tag”)

Landing target must match URL pattern

Duplicate detection: warn if same landing + same tag already exists (allow continue)

Success Output

“Share Pack” panel:

Copy short link

Download/view QR

Copy invite code

“Attribution rules” box: last-click + window + where to view evidence (trace drawer)

7.2.3 Link Detail Page

Tabs:

Performance (trend)

Conversions (table)

Earnings impact (state breakdown)

Attribution explanation (read-only)

Key UX Requirement: Attribution Explanation
If a conversion was overridden by a later click, show:

“Credited to later touchpoint at {timestamp}”

Link to that asset

(Impact’s action lifecycle framing—pending, locking date, locked—should be mirrored in explanation language. 
impact.com Help Center
)

7.2.4 Link Health Diagnostics

If clicks high but conversions low:
Show reason categories (non-sensitive):

Landing broken/redirect issues

Cross-device loss

Window expired

Last-click override by other assets

Each reason links to “How to fix” help article (prototype stub).

7.3 Content (Content Performance)
7.3.1 Content List

Primary CTA: “Add content item”
Columns

Title

Platform (XHS / WeChat / IG / Other)

Bound assets count (click to manage)

Click / Register / Order / GMV

Est. earnings

Publish date

Actions: View / Bind / Duplicate

Filters

Platform

Has bound assets (yes/no)

Date published range

7.3.2 Add/Edit Content Item (Form)

Fields:

Platform (required)

Title (required)

URL (optional; validate format)

Publish date (optional)

Notes (optional)

7.3.3 Content Detail

Sections:

Funnel + trends

Bound assets (manage bindings)

Conversions table (drilldown)

Earnings trace (drawer)

Binding Flow

“Bind assets” opens a modal:

Search existing assets

Multi-select

Option: “Create new asset” (opens nested wizard, then auto-binds)

Empty State

If no bound assets: banner “Not trackable until assets are bound” + CTA “Bind now”

7.4 Co-selection (Leads)
7.4.1 Leads List (Pipeline Table)

Primary CTA: “Submit lead”
Table Columns

Lead name (merchant/service provider)

Category

City/Region

Status: Submitted / Under Review / Approved / Rejected

Assigned owner (read-only label, if available)

Last updated

Next required info (chip summary)

Actions: View / Edit draft (if Draft) / Duplicate

Filters

Status

Category

Region

Owner assigned (yes/no)

Missing info (yes/no)

Submitted date range

7.4.2 Submit Lead (Structured Form)

Form Sections
A) Basic info

Merchant/service provider name (required)

Category (required; predefined)

Region/city (required)

Website / social profile (optional, validate URL)

B) Contact

Contact name (required)

Contact role (optional)

Contact phone/email (at least one required; validate)

C) Commercial fit snapshot

Estimated monthly volume (range selector)

Service availability window (optional)

Notes (free text)

D) Attachments

Upload: menu/service deck/pricing sheet (optional)

E) COI Declaration (required)

Checkbox: “I confirm I have disclosed any potential conflict of interest”

If checkbox true: show conditional field “COI details (optional)”

Validation Rules

Block submit if required fields missing

Preserve user input on validation errors (do not reset)

7.4.3 Lead Detail (Closed-Loop Page)

This page must answer:

What’s the current status?

What’s missing?

What happens next?

Who changed what and why?

Layout

Header

Lead name + status pill

Assigned owner (if exists) + contact button (prototype: opens mailto template)

“Last updated” + “Submitted at”

Required Info Checklist (dynamic)

Shows missing items (e.g., “Missing contact email”, “Missing deck”)

Each missing item has a CTA (jump to upload/edit section)

Timeline (Audit Trail)
A vertical timeline with entries:

Status changed: Submitted → Under Review

Requested more info

Approved / Rejected (with reason category)
Each entry must show:

Actor (System / Ops / Co-selector)

Timestamp

Reason (required for status change; controlled vocabulary)

Milestones Tracker (read-only for co-selector)

Onboarded

First order

30/60/90-day tiers
Each milestone shows:

status: Not started / Achieved / Reversed (if clawback)

achieved date

linked evidence reference (prototype: placeholder)

Reward Preview

Shows estimated reward by milestone and its lock date semantics:

“Pending until lock date; may be reversed before lock”
This mirrors established holding/locking period mental models (pending commissions can be canceled during holding). 
Shopify Help Center
+1

7.4.4 Lead Status Model (Visible to Co-selector)

Draft (local-only)

Submitted

Under Review

Approved

Rejected

Resubmitted (optional; if rejected allows resubmit)

Rules

Co-selector can only:

Create Draft

Submit

Edit while Under Review only if “Info Requested”

Resubmit after Rejected (creates new revision; keeps history)

7.5 Earnings (Earnings & Payout)
7.5.1 IA

Tabs:

Overview

Transactions

Payouts

Statements

The core semantic model should align with common affiliate finance lifecycles: tracked conversion → pending (modifiable/reversible before locking date) → approved/locked. 
impact.com Help Center
+1

7.5.2 Earnings Overview

Components:

Balance by state: Pending / Locked / Payable / Paid / Reversed

Next locking dates distribution (7/14/30 days)

Reversal rate indicator (this period)

Eligibility banner (from Profile):

Eligible / Blocked

If blocked: show checklist + deep links

Interactions:

Clicking any state routes to Transactions with filter applied.

Clicking “next locking date” bar filters Transactions by lock_end_at range.

7.5.3 Transactions Table (Must Have Trace Drawer)

Columns

Date

Source (Order / Milestone / Adjustment)

Reference (order_id / lead_id / case_id)

Amount (+/-)

State (Pending/Locked/Payable/Paid/Reversed)

Locking date (if Pending)

Rule version

Action: View trace

Trace Drawer (Right-side)
Sections (accordion inside drawer):

Attribution Evidence

Last-click touchpoint timestamp

Asset id + channel tag

Commission Breakdown

Commissionable base

Rate/fee

Adjustments

Locking Policy

lock_end_at + policy label

Reversal Reason (if reversed)

refund / dispute / fraud hold / void

Impact explicitly describes pending actions as reversible/modifiable before lock, and locked/approved thereafter. 
impact.com Help Center
+1

7.5.4 Payouts

Eligibility Banner

“Blocked” states: KYC incomplete / payout method missing / threshold unmet / freeze

Each item has a “Fix now” link to Profile

Request Withdrawal (Modal)
Fields:

Amount (default = max payable)

Destination (read-only from Profile payout method)

Confirmation checkbox: “I confirm payout details are correct”

States:

Requested

Approved (internal)

Paid

Failed (with reason)

Prototype requirement:

Submitting withdrawal creates a new Payout record and reduces Payable (mocked).

7.5.5 Statements

Monthly statement view:

Opening balance

Earnings

− Reversals

− Payouts
= Closing balance

Export:

CSV download button (prototype: generates CSV client-side)

7.6 Inbox (Notifications & Cases)
7.6.1 Notification Types

Review decisions (Lead, KYC)

Earnings lifecycle (Pending created, Locked, Reversed)

Payout lifecycle (Requested, Paid, Failed)

Policy updates (rule version change)

Disputes (action required)

7.6.2 Inbox UI

Left: filters (All / Action required / Reviews / Earnings / Payouts / Disputes)

Right: list of notifications

Click item opens a details panel with:

Summary

Timeline of that case/event

Deep link to relevant context (lead detail, transaction row, payout record)

7.6.3 Disputes (Case UX)

A dispute case must show:

case_id

type

status (Open / Waiting for response / Resolved)

deadline_at (if action required)

evidence checklist + upload entry point

Stripe indicates response windows are typically 7–21 days, and full lifecycle often 2–3 months. The UI must reflect deadline pressure and lifecycle expectations. 
docs.stripe.com
+1

Shopify Collabs also supports disputes during the holding period and routes creators to payout pages for dispute detail. 
Shopify Help Center

7.7 Profile & Compliance
7.7.1 Tabs

Profile

KYC status

Payout method

Tax info (placeholder)

Compliance training

Rulebook (versioned)

7.7.2 Eligibility Banner (Top of Profile)

States:

Eligible for payout

Blocked (with checklist):

KYC not completed

Payout method not set

Minimum threshold not met

Account frozen / under review

Each checklist item must have:

Status chip

“Fix now” CTA deep link

7.7.3 KYC Stepper (Prototype)

Step-by-step wizard:

Identity basics

Document upload

Review submitted

Approved / Rejected (with reason category + resubmit)

8. State Machines (Deterministic UI Logic)
8.1 Lead State Machine

Draft → Submitted → Under Review → Approved

Under Review → Info Requested → (Co-selector updates) → Under Review

Under Review → Rejected → Resubmitted → Under Review

Every transition must create a timeline event with:

actor_type (CO_SELECTOR / OPS / SYSTEM)

actor_name

occurred_at

reason_code (required for approval/rejection/info request)

8.2 Earnings State Machine

Pending → Locked → Payable → Paid

Pending → Reversed

Locked/Payable → (Adjustment) Reversal entry appended
This mirrors common affiliate “pending then lock” semantics. 
impact.com Help Center
+1

8.3 Payout State Machine

Requested → Approved → Paid

Requested → Rejected

Approved → Failed → (Retry optional)

8.4 Dispute Case State Machine

Open → Waiting for response → Resolved (Won/Lost/Adjusted)
Include deadline and evidence requirements (if any). 
docs.stripe.com
+1

9. Prototype Implementation Requirements (For Coding Agent)
9.1 Tech/Structure (Recommendation)

React + TypeScript

Router-based pages matching §5 routes

One UI library (AntD recommended for admin velocity)

Mock API layer:

JSON fixtures + localStorage persistence

“Simulate data events” panel (dev-only)

9.2 Required Mock Datasets

Provide seed data for:

Assets (10–20)

Content items (10–20)

Leads (10–20 across statuses)

Transactions (50–200 across states, with lock_end_at)

Payouts (5–10)

Notifications (30–50)

Dispute cases (5–10)

9.3 Prototype-Only Controls (Dev Tools)

A hidden toggle (e.g., “Dev Tools” in Help menu) that can:

Advance time (simulate lock_end_at passing)

Trigger reversal on a transaction (select reason)

Change lead status (simulate Ops review)

Mark KYC approved/rejected

Generate new click/register/order counts

These controls ensure reviewers can test flows without backend.

10. UI Copy & Reason Codes (Controlled Vocabulary)
10.1 Lead Review Reason Codes (High-level)

Missing required documents

Identity mismatch

Not a fit (category/region)

Policy risk

Duplicate lead

10.2 Reversal Reason Codes

Refund

Dispute/chargeback

Fraud hold

Order void/cancel

System reattributed (if applicable)

(Impact documents reversal reasons and emphasizes pending actions can reverse before lock. 
impact.com Help Center
+1
)

11. Definition of Done (UI/UX DoD)

Every KPI has drilldown to a table.

Every table row has a details drawer with evidence.

Every status change writes a timeline entry (“who/when/why”).

Eligibility is always explicit (why payout blocked, and how to fix).

Modals are accessible (Escape, focus trap, focus return). 
W3C

Error messages are explicit text and non-color-only