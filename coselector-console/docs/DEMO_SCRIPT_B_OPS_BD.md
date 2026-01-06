# Demo Script B: OPS_BD Review Workflow

## Overview

**Purpose**: Demonstrate the operations team review workflow from claim to decision  
**Persona**: Operations/Business Development reviewer (OPS_BD role)  
**Duration**: 6-8 minutes  
**Audience**: Operations stakeholders, management, Sprint 1 demo presentation

## Pre-Demo Setup

### 1. Environment Preparation

**Browser Setup**:
- Chrome or Edge (latest version)
- Window size: 1920x1080 (or 1440x900 minimum)
- Clear browser cache and localStorage
- Open DevTools Console (F12) to show no errors

**Application State**:
1. Press `Ctrl+Shift+D` to open DevTools
2. Switch to OPS_BD role
3. Go to "Data" tab
4. Click "Generate Batch" to create 10 diverse leads
5. Verify leads exist in various statuses (SUBMITTED, UNDER_REVIEW, INFO_REQUESTED, etc.)
6. Close DevTools

**Expected Test Data**:
- At least 2-3 leads in SUBMITTED status (unclaimed)
- At least 1 lead in UNDER_REVIEW status
- Mix of categories and regions
- Complete contact information for most leads

### 2. Demo Environment Check

✅ Application running at http://localhost:3000  
✅ No console errors visible  
✅ OPS_BD role active  
✅ Admin menu visible in navigation  
✅ Test leads generated (10 leads in various statuses)

---

## Demo Script

### SCENE 1: OPS_BD Login & Dashboard (1 minute)

**Objective**: Show OPS_BD perspective and permissions

#### Step 1.1: Show OPS_BD Role

**Action**: Click user avatar/menu in top-right

**Say**: 
> "I'm logged in as a member of the Operations and Business Development team. Notice my role is 'OPS_BD' which gives me additional permissions to review and approve merchant leads."

**Point Out**:
- Role badge: "OPS_BD"
- Admin menu item visible in navigation (permission-based)
- Different capabilities than CO_SELECTOR

**Screenshot**: 📸 User menu showing OPS_BD role

#### Step 1.2: Dashboard Overview

**Action**: Review dashboard (if different from CO_SELECTOR view)

**Say**:
> "As a reviewer, my dashboard might show team metrics like pending reviews, average approval time, and my assigned leads."

**Point Out**:
- Team-level metrics (if available)
- Review queue summary
- Action items needing attention

**Screenshot**: 📸 OPS_BD dashboard view

---

### SCENE 2: Access Review Queue (1 minute)

**Objective**: Navigate to and understand the Admin Review Queue

#### Step 2.1: Open Admin Menu

**Action**: Click "Admin" in left navigation

**Say**:
> "The Admin section is only visible to OPS_BD and higher roles. Here I can access the Review Queue where all submitted leads await evaluation."

**Point Out**:
- Admin menu expanded
- "Review Queue" option visible
- Permission gating (would not appear for CO_SELECTOR)

**Screenshot**: 📸 Admin menu expanded

#### Step 2.2: Review Queue Overview

**Action**: Click "Review Queue"

**Say**:
> "This is the Review Queue - the central hub for managing incoming merchant leads. I can see all leads that need attention, filtered by status and assigned owner."

**Point Out**:
- Page title: "Admin Review Queue"
- Filter bar at top (Status, Owner, Date Range)
- Table showing leads with key columns:
  - Merchant Name
  - Category
  - Region/City
  - Status
  - Assigned Owner (or "Unassigned")
  - Submitted Date
  - Actions column
- Status distribution (count of leads in each status)

**Screenshot**: 📸 Admin Review Queue full view

#### Step 2.3: Explain Queue Organization

**Action**: Point to different sections/filters

**Say**:
> "The queue is organized to help me prioritize. I can filter by status to see only SUBMITTED leads waiting for assignment, or see all leads I've claimed. The date filter helps me identify older leads that need urgent attention."

**Point Out**:
- Status filter dropdown (All, SUBMITTED, UNDER_REVIEW, INFO_REQUESTED, etc.)
- Owner filter (All, Unassigned, My Leads, specific reviewers)
- Date range picker for submission dates
- Sort functionality (click column headers)
- Search box for merchant name

**Screenshot**: 📸 Filter bar with options visible

---

### SCENE 3: Claim a Lead (1.5 minutes)

**Objective**: Demonstrate the claim workflow per §8.2

#### Step 3.1: Filter to SUBMITTED Leads

**Action**: 
1. Set Status filter to "SUBMITTED"
2. Set Owner filter to "Unassigned"

**Say**:
> "Let me filter to see only newly submitted leads that haven't been claimed yet. These are leads waiting for initial review assignment."

**Point Out**:
- Filter chips appear showing active filters
- Table updates to show only matching leads
- Lead count updates (e.g., "Showing 3 of 10 leads")
- All leads show "Unassigned" in Owner column

**Screenshot**: 📸 Filtered view showing SUBMITTED, unassigned leads

#### Step 3.2: Review Lead Preview

**Action**: Hover over or click a lead row to see preview

**Say**:
> "I can quickly scan the key details: merchant name, category, region, estimated volume. This helps me decide which leads to prioritize based on my expertise."

**Point Out**:
- Merchant name: e.g., "TechGadget Store"
- Category: e.g., "Electronics & Technology"
- Location: "Toronto, North America"
- Submission date: "2 hours ago"
- Quick preview tooltip or expandable row (if implemented)

#### Step 3.3: Claim the Lead

**Action**: Click "Claim" button in Actions column

**Say**:
> "I'm going to claim this Electronics merchant because that's my area of expertise. Claiming assigns the lead to me and prevents other reviewers from working on it simultaneously."

**Point Out**:
- "Claim" button clearly visible
- Click triggers immediate action
- Success message: "Lead claimed successfully"
- Owner column updates to show your name
- Lead status remains SUBMITTED (claiming doesn't change status yet)

**Screenshot**: 📸 Claim button and success message

#### Step 3.4: Verify Claim in Timeline

**Action**: Click the lead to open detail view

**Say**:
> "Let's look at the lead details. Notice the timeline now shows an OWNER_ASSIGNED event recording who claimed it, when, and why."

**Point Out**:
- Timeline event: "OWNER_ASSIGNED"
- Actor: Your name (OPS_BD)
- Timestamp: "Just now"
- Reason code: e.g., "CLAIMED" or "EXPERTISE"
- Metadata might include: `{"reason": "Electronics category expert"}`

**Screenshot**: 📸 Timeline showing OWNER_ASSIGNED event

---

### SCENE 4: Set Lead to Under Review (1 minute)

**Objective**: Show status progression and Admin Action Panel

#### Step 4.1: Locate Admin Action Panel

**Action**: Scroll to right side of lead detail page

**Say**:
> "As a reviewer, I have access to the Admin Action Panel on the right. This provides quick actions for managing the review process."

**Point Out**:
- Admin Action Panel component
- Current status displayed: "SUBMITTED"
- Available actions based on current status
- Four action buttons visible:
  - "Set Under Review"
  - "Request Information"
  - "Approve"
  - "Reject"

**Screenshot**: 📸 Admin Action Panel overview

#### Step 4.2: Set Under Review

**Action**: Click "Set Under Review" button

**Say**:
> "The first step after claiming is to formally set the lead to 'Under Review' status. This signals to the merchant that their submission is being actively evaluated."

**Point Out**:
- "Set Under Review" button highlighted
- Click triggers status change
- Success message: "Lead status updated to Under Review"
- Status badge updates immediately: SUBMITTED → UNDER_REVIEW
- Color changes (blue → yellow/amber)

**Screenshot**: 📸 UNDER_REVIEW status after action

#### Step 4.3: Verify Timeline Update

**Action**: Scroll to timeline section

**Say**:
> "The timeline automatically records this status change with complete details of who made the change and when."

**Point Out**:
- New timeline event: "STATUS_CHANGED"
- Actor: Your name (OPS_BD)
- Metadata: `{"from": "SUBMITTED", "to": "UNDER_REVIEW"}`
- Reason code: "STARTED_REVIEW" or similar
- Timestamp: "Just now"
- Events in chronological order (newest first or oldest first)

**Screenshot**: 📸 Timeline showing STATUS_CHANGED event

---

### SCENE 5: Request Additional Information (2 minutes)

**Objective**: Demonstrate info request workflow with checklist

#### Step 5.1: Review Lead Details

**Action**: Scroll through lead details sections

**Say**:
> "Let me review the submitted information. I can see the merchant details, contact info, and business details. Suppose I notice the estimated monthly volume seems high and I need supporting documentation."

**Point Out**:
- Section A: Basic merchant info (complete)
- Section B: Contact details (complete)
- Section C: Business details (estimated volume looks high)
- Section D: COI declaration (checked)
- Section E: Additional notes

#### Step 5.2: Open Request Info Drawer

**Action**: Click "Request Information" button in Admin Action Panel

**Say**:
> "I'm going to request additional information from the merchant. This opens a drawer where I can specify exactly what documents or details I need."

**Point Out**:
- Drawer slides in from right
- Title: "Request Additional Information"
- Subtitle: "Select items to request from merchant"
- Pre-defined checklist of common requests
- Custom message text area

**Screenshot**: 📸 Request Information drawer opened

#### Step 5.3: Select Requested Items

**Action**: Check multiple items in the checklist:
- ☑ Business License
- ☑ Tax Documentation
- ☑ Bank Verification
- ☑ Sales Reports (optional custom item)

**Say**:
> "I can select from pre-defined items or add custom requests. For this high-volume merchant, I want to verify their business registration and financial capacity."

**Point Out**:
- Checkbox list with common requests:
  - Business License
  - Tax Documentation  
  - Bank Verification
  - Monthly Sales Reports
  - Customer References
  - Marketing Materials
  - Other (custom)
- All selections highlighted
- Counter showing "4 items selected"

**Screenshot**: 📸 Checklist with items selected

#### Step 5.4: Add Custom Message

**Action**: Type in message text area:
> "Thank you for your submission. To proceed with approval, we need to verify your business credentials and financial capacity. Please provide the selected documents at your earliest convenience."

**Say**:
> "I can add a personalized message explaining why I need these documents and what the next steps are."

**Point Out**:
- Text area with clear label
- Character counter (if applicable)
- Helpful placeholder text
- Message preview

**Screenshot**: 📸 Custom message entered

#### Step 5.5: Submit Info Request

**Action**: Click "Submit Request" button at bottom of drawer

**Say**:
> "When I submit, the lead status changes to 'INFO_REQUESTED' and the merchant receives a clear notification of what's needed."

**Point Out**:
- Submit button at drawer bottom
- Loading spinner appears briefly
- Success message: "Information request sent"
- Drawer closes automatically
- Status badge updates: UNDER_REVIEW → INFO_REQUESTED
- Color changes to amber/warning

**Screenshot**: 📸 INFO_REQUESTED status with alert banner

#### Step 5.6: Verify Info Request in Timeline

**Action**: Review timeline section

**Say**:
> "The timeline now shows a detailed record of what information was requested, including the specific items and my message to the merchant."

**Point Out**:
- Timeline event: "INFO_REQUESTED"
- Actor: Your name (OPS_BD)
- Timestamp: "Just now"
- Metadata includes:
  - `requestedItems`: ["Business License", "Tax Documentation", "Bank Verification", "Sales Reports"]
  - `message`: Your custom message text
- Reason code: "VERIFICATION_REQUIRED"

**Screenshot**: 📸 Timeline showing INFO_REQUESTED event with metadata

---

### SCENE 6: Simulate Info Response (30 seconds)

**Objective**: Show what happens when merchant provides info

#### Step 6.1: Use DevTools to Simulate Response

**Action**:
1. Press `Ctrl+Shift+D`
2. Go to "Timeline" tab
3. Enter current lead ID
4. Event Type: "INFO_PROVIDED"
5. Actor Type: "CO_SELECTOR"
6. Reason Code: "DOCUMENTS_UPLOADED"
7. Metadata: `{"documents": ["business_license.pdf", "tax_returns.pdf", "bank_statement.pdf", "sales_report_q4.xlsx"], "note": "All requested documents attached"}`
8. Click "Inject Event"

**Say**:
> "Let me simulate the merchant responding with the requested documents. In the real workflow, they would upload these through the lead detail page."

**Point Out**:
- DevTools Timeline Injection feature
- Event successfully added
- Timeline updates with INFO_PROVIDED event
- Status automatically returns to UNDER_REVIEW

**Screenshot**: 📸 Timeline with INFO_PROVIDED event

---

### SCENE 7: Make Approval Decision (2 minutes)

**Objective**: Demonstrate approval OR rejection workflow

### Option A: Approve the Lead

#### Step 7A.1: Open Approval Modal

**Action**: Click "Approve" button in Admin Action Panel

**Say**:
> "After reviewing all the information and documents, I'm satisfied this is a qualified merchant. Let me approve the lead for partnership."

**Point Out**:
- "Approve" button in Admin Action Panel
- Modal opens (centered, with overlay)
- Title: "Approve Lead"
- Subtitle: "Select approval reasons and add optional notes"

**Screenshot**: 📸 Approval modal opened

#### Step 7A.2: Select Approval Reasons

**Action**: Select multiple approval reasons from checkboxes:
- ☑ Business Quality
- ☑ Financial Capacity
- ☑ Strategic Fit
- ☑ Market Opportunity

**Say**:
> "I need to document why I'm approving this lead. Multiple factors support this decision: strong business credentials, financial capacity verified, and good strategic fit with our platform."

**Point Out**:
- Checkbox list of approval reasons:
  - Business Quality
  - Financial Capacity
  - Strategic Fit
  - Market Opportunity
  - Category Expertise
  - Regional Priority
  - Other
- Multiple selection allowed
- Required field indicator

**Screenshot**: 📸 Approval reasons selected

#### Step 7A.3: Add Approval Notes

**Action**: Type in notes text area:
> "Excellent merchant profile with strong financials. Electronics category is priority for Q1. Recommend fast-track onboarding."

**Say**:
> "I can add notes for the merchant and for internal records about why this approval decision was made."

**Point Out**:
- Text area for optional notes
- Character limit indicator
- Notes are recorded in timeline

#### Step 7A.4: Submit Approval

**Action**: Click "Approve Lead" button at modal bottom

**Say**:
> "Submitting the approval finalizes the review process. The merchant will be notified and onboarding can begin."

**Point Out**:
- Primary action button: "Approve Lead"
- Secondary button: "Cancel"
- Loading state while processing
- Success message: "Lead approved successfully"
- Modal closes
- Status updates: INFO_REQUESTED → APPROVED
- Color changes to green/success

**Screenshot**: 📸 APPROVED status with success message

#### Step 7A.5: Verify Approval Timeline

**Action**: Scroll to timeline

**Say**:
> "The complete approval decision is recorded in the timeline, including all the reasons and notes for future reference and audit purposes."

**Point Out**:
- Timeline event: "APPROVED"
- Actor: Your name (OPS_BD)
- Timestamp: "Just now"
- Metadata includes:
  - `approvalReasons`: ["BUSINESS_QUALITY", "FINANCIAL_CAPACITY", "STRATEGIC_FIT", "MARKET_OPPORTUNITY"]
  - `notes`: Your approval notes
- Reason code: "REVIEW_COMPLETE"
- Final status: APPROVED

**Screenshot**: 📸 Timeline showing APPROVED event with full metadata

---

### Option B: Reject the Lead (Alternative Path)

#### Step 7B.1: Open Rejection Modal

**Action**: Click "Reject" button in Admin Action Panel

**Say**:
> "If I find the lead doesn't meet our criteria, I can reject it with clear documentation of why."

**Point Out**:
- "Reject" button in Admin Action Panel (danger/red styling)
- Modal opens with warning styling
- Title: "Reject Lead"
- Warning message about finality

#### Step 7B.2: Select Rejection Reasons

**Action**: Select rejection reasons:
- ☑ Insufficient Business Scale
- ☑ Category Not Aligned

**Say**:
> "I need to specify why the lead is being rejected. This helps the merchant understand the decision and helps our team identify patterns."

**Point Out**:
- Checkbox list of rejection reasons:
  - Insufficient Business Scale
  - Category Not Aligned
  - Geographic Restrictions
  - Compliance Issues
  - Duplicate Submission
  - Unresponsive Contact
  - Other
- Multiple selection allowed
- Required field

**Screenshot**: 📸 Rejection reasons selected

#### Step 7B.3: Add Rejection Notes & Resubmission Option

**Action**: 
1. Type rejection notes: "Monthly volume below our current minimum threshold of $200K. Category focus is shifting away from electronics in this region."
2. Check/uncheck "Allow Resubmission" toggle

**Say**:
> "I can explain the decision in detail and indicate whether the merchant can resubmit in the future if their situation changes."

**Point Out**:
- Required text area for rejection notes
- Toggle: "Allow resubmission after 90 days"
- Clear explanation that rejection is final unless resubmission allowed

#### Step 7B.4: Submit Rejection

**Action**: Click "Reject Lead" button (requires confirmation)

**Say**:
> "This is a significant decision, so the system requires confirmation before proceeding."

**Point Out**:
- Danger-styled button: "Reject Lead"
- Confirmation dialog: "Are you sure you want to reject this lead?"
- Confirmation required to prevent accidental rejection
- Success message: "Lead rejected"
- Status updates to REJECTED
- Color changes to red/error

**Screenshot**: 📸 REJECTED status

#### Step 7B.5: Verify Rejection Timeline

**Action**: Review timeline

**Point Out**:
- Timeline event: "REJECTED"
- Actor: Your name (OPS_BD)
- Metadata includes:
  - `rejectionReasons`: ["INSUFFICIENT_SCALE", "CATEGORY_NOT_ALIGNED"]
  - `notes`: Your rejection notes
  - `allowResubmission`: true/false
  - `resubmissionDate`: "2026-04-06" (if applicable)

**Screenshot**: 📸 Timeline showing REJECTED event

---

### SCENE 8: Review Queue Management (1 minute)

**Objective**: Show queue efficiency and bulk operations

#### Step 8.1: Return to Review Queue

**Action**: Navigate back to Admin → Review Queue

**Say**:
> "Let me return to the queue to show how I manage multiple leads efficiently."

**Point Out**:
- Lead just reviewed is no longer in SUBMITTED queue
- Appears in APPROVED or REJECTED filter
- Owner column shows your name
- Completion timestamp updated

**Screenshot**: 📸 Updated queue showing processed lead

#### Step 8.2: Show My Assigned Leads

**Action**: Filter by "Owner: My Leads"

**Say**:
> "I can quickly see all leads assigned to me across all statuses. This helps me prioritize follow-ups and track my workload."

**Point Out**:
- Filter shows only your claimed leads
- Leads in various statuses (UNDER_REVIEW, INFO_REQUESTED, etc.)
- Queue organized by priority or submission date
- Action buttons contextual to each status

**Screenshot**: 📸 Filtered view showing only your leads

#### Step 8.3: Highlight Queue Metrics

**Action**: Point to metrics or summary cards (if implemented)

**Say**:
> "The queue dashboard helps me and my team track performance: how many leads are pending, average review time, and approval rates."

**Point Out**:
- Total pending leads count
- Leads assigned to you
- Average review time
- Approval rate percentage
- Oldest pending lead age

---

### SCENE 9: Wrap-Up & Key Features (1 minute)

**Objective**: Summarize OPS_BD workflow capabilities

**Say**:
> "Let me recap what we've demonstrated in the OPS_BD review workflow:"

**Highlight**:

1. **Centralized Review Queue**
   - Single place to see all leads needing attention
   - Powerful filtering (Status, Owner, Date)
   - Sort by any column for prioritization
   - Search by merchant name

2. **Claim Workflow (§8.2)**
   - One-click claim prevents conflicts
   - Assigns ownership immediately
   - Records OWNER_ASSIGNED in timeline with reason
   - Status remains SUBMITTED until formal review starts

3. **Admin Action Panel**
   - Four review actions available based on status
   - Set Under Review (start formal review)
   - Request Information (with checklist and custom message)
   - Approve (with multiple reasons and notes)
   - Reject (with reasons, notes, resubmission option)

4. **Complete Audit Trail**
   - Every decision recorded in timeline
   - Approval/rejection reasons preserved
   - Info requests tracked with specific items
   - From→To status transitions clearly marked

5. **Permission-Based Access**
   - Admin menu only visible to OPS_BD+
   - CO_SELECTOR users cannot access review queue
   - Action panel not visible to non-reviewers
   - RBAC enforced throughout

6. **Efficient Workflow**
   - Batch lead generation for testing (DevTools)
   - Filter to prioritize oldest or highest value
   - Quick preview of lead details
   - Contextual actions based on current status

**Point Out**:
- No console errors (show DevTools console)
- Responsive design
- Fast page loads with mock API
- Professional UI consistent with Ant Design

**Screenshot**: 📸 Final queue view showing completed work

---

## Demo Completion Checklist

After completing the demo, verify:

✅ OPS_BD role active and admin menu visible  
✅ Review Queue accessible with filters working  
✅ Claim workflow executed successfully  
✅ Timeline shows OWNER_ASSIGNED event with reason  
✅ Lead set to UNDER_REVIEW status  
✅ Info request created with checklist items  
✅ Timeline shows INFO_REQUESTED with metadata  
✅ Approval or Rejection completed with reasons  
✅ Final timeline shows complete audit trail  
✅ Queue updated to reflect processed lead  
✅ No console errors visible

---

## Fallback Scenarios

### If Something Goes Wrong

**Issue**: No leads in queue
- **Fallback**: Use DevTools → Data → Generate Batch to create 10 test leads
- **Backup**: Manually create leads via CO_SELECTOR role first

**Issue**: Claim button doesn't work
- **Fallback**: Refresh page and retry
- **Backup**: Use DevTools Timeline Injection to manually add OWNER_ASSIGNED event

**Issue**: Admin Action Panel not visible
- **Fallback**: Verify OPS_BD role via user menu, use DevTools to switch roles
- **Backup**: Check AuthContext permissions, restart demo

**Issue**: Info Request drawer won't open
- **Fallback**: Refresh page, try again
- **Backup**: Describe workflow verbally and use static screenshots

**Issue**: Approval/Rejection modal freezes
- **Fallback**: Press Escape to close, refresh page, retry
- **Backup**: Use DevTools Timeline Injection to add APPROVED/REJECTED event manually

---

## Questions & Answers

### Anticipated Audience Questions

**Q: "How do you prevent two reviewers from claiming the same lead?"**  
**A**: The Claim action immediately assigns the lead to the reviewer. The UI updates in real-time, and the lead disappears from the unassigned queue. If implemented with proper backend, optimistic locking prevents race conditions.

**Q: "What happens if a reviewer claims too many leads?"**  
**A**: Team leads can use the Owner filter to see workload distribution. In production, we could implement claim limits or assignment algorithms for load balancing.

**Q: "Can a reviewer un-claim a lead?"**  
**A**: Sprint 1 doesn't implement un-claim, but it's planned for Sprint 2. Currently, leads can be reassigned by team leads if needed.

**Q: "How long does a merchant have to provide requested information?"**  
**A**: The system doesn't enforce a deadline in Sprint 1, but the timeline shows how long the lead has been in INFO_REQUESTED status. Future sprints may add SLA tracking and automatic reminders.

**Q: "Can you approve a lead without requesting info first?"**  
**A**: Yes, if all necessary information is provided in the initial submission, reviewers can approve directly from UNDER_REVIEW status. The Request Info step is optional.

**Q: "What happens after a lead is approved?"**  
**A**: Approval triggers the onboarding workflow (planned for Sprint 2). The merchant receives notification to begin contract signing and platform integration.

**Q: "Can rejection decisions be reversed?"**  
**A**: Not in Sprint 1. Rejection is final unless "Allow Resubmission" was checked, in which case the merchant can submit a new lead after the waiting period. Reversals would require system admin intervention.

---

## Screenshots Reference

### Required Screenshots for Documentation

1. 📸 User menu showing OPS_BD role
2. 📸 OPS_BD dashboard view
3. 📸 Admin menu expanded with Review Queue
4. 📸 Admin Review Queue full view
5. 📸 Filter bar with options visible
6. 📸 Filtered view - SUBMITTED, unassigned leads
7. 📸 Claim button and success message
8. 📸 Timeline showing OWNER_ASSIGNED event
9. 📸 Admin Action Panel overview
10. 📸 UNDER_REVIEW status after action
11. 📸 Timeline showing STATUS_CHANGED event
12. 📸 Request Information drawer opened
13. 📸 Checklist with items selected
14. 📸 Custom message entered
15. 📸 INFO_REQUESTED status with alert banner
16. 📸 Timeline showing INFO_REQUESTED event with metadata
17. 📸 Timeline with INFO_PROVIDED event (simulated)
18. 📸 Approval modal opened
19. 📸 Approval reasons selected
20. 📸 APPROVED status with success message
21. 📸 Timeline showing APPROVED event with full metadata
22. 📸 Rejection modal (optional alternative)
23. 📸 Updated queue showing processed lead
24. 📸 Filtered view showing only your leads
25. 📸 Final queue view showing completed work

---

## Post-Demo Notes

### What Worked Well
- [ ] Review Queue filtering was intuitive
- [ ] Claim workflow was smooth
- [ ] Admin Action Panel clearly organized
- [ ] Timeline provided complete audit trail
- [ ] Info request checklist was comprehensive

### Areas for Improvement
- [ ] Performance issues noted (specify)
- [ ] UI confusion points (specify)
- [ ] Missing features requested (specify)
- [ ] Workflow inefficiencies (specify)
- [ ] Bug discoveries (specify)

### Audience Feedback
- [ ] Questions about workload management: ___________
- [ ] Concerns about approval criteria: ___________
- [ ] Requests for batch operations: ___________
- [ ] Interest in SLA tracking: ___________

---

## Comparison with Demo Script A

**Key Differences**:

| Aspect | CO_SELECTOR (Script A) | OPS_BD (Script B) |
|--------|----------------------|-------------------|
| **Entry Point** | Create New Lead | Review Queue |
| **Primary Action** | Submit lead for review | Claim, review, decide |
| **UI Access** | No admin menu | Admin menu + Review Queue |
| **Permissions** | Can edit only own drafts | Can review/approve any lead |
| **Workflow** | Linear (create → submit → wait) | Branching (review → info request OR approve OR reject) |
| **Timeline Role** | Actor: CO_SELECTOR | Actor: OPS_BD |
| **Key Feature** | 5-section form with validation | Admin Action Panel with 4 actions |

---

## Integration with Other Scripts

**Before This Demo**:
- Run Demo Script A to show CO_SELECTOR creating the lead being reviewed
- Provides context for what reviewers see

**After This Demo**:
- Run Demo Script C to show accessibility features
- Demonstrate keyboard navigation through Review Queue and Action Panel

**Combined Demo** (15 minutes):
- Show both perspectives in sequence:
  1. CO_SELECTOR creates lead (Script A, 5 min)
  2. Switch roles (DevTools, 30 sec)
  3. OPS_BD reviews same lead (Script B, 6 min)
  4. Complete workflow end-to-end

---

## Next Steps

After Demo Script B, proceed to:

1. **Demo Script C**: Accessibility tour (keyboard navigation, screen readers)
2. **Sprint 1 DoD Verification**: Verify all Definition of Done criteria
3. **Final Documentation**: Complete Sprint 1 delivery package

---

**Script Version**: 1.0  
**Last Updated**: Sprint 1, Task 17  
**Status**: Ready for Demo  
**Estimated Demo Time**: 6-8 minutes  
**Preparation Time**: 3 minutes
