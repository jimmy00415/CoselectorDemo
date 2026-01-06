# Demo Script A: CO_SELECTOR User Journey

## Overview

**Purpose**: Demonstrate the complete Co-Selector user workflow from lead creation to approval  
**Persona**: Regular user (CO_SELECTOR role)  
**Duration**: 8-10 minutes  
**Audience**: Product stakeholders, potential users, Sprint 1 demo presentation

## Pre-Demo Setup

### 1. Environment Preparation

**Browser Setup**:
- Chrome or Edge (latest version)
- Window size: 1920x1080 (or 1440x900 minimum)
- Clear browser cache and localStorage
- Open DevTools Console (F12) to show no errors

**Application State**:
1. Press `Ctrl+Shift+D` to open DevTools
2. Switch to CO_SELECTOR role
3. Click "Reset All Data" to start fresh
4. Close DevTools
5. Navigate to home page

**Test Data Ready**:
- Merchant name: "TechGadget Store"
- Category: Electronics & Technology
- Region: North America
- City: Toronto
- Monthly volume: $150,000
- Contact: John Smith, john@techgadget.com, +1-555-0123

### 2. Demo Environment Check

✅ Application running at http://localhost:3000  
✅ No console errors visible  
✅ Mock API initialized with seed data  
✅ CO_SELECTOR role active  
✅ Clean state (no existing leads)

---

## Demo Script

### SCENE 1: Login & Dashboard (1 minute)

**Objective**: Show authentication and home dashboard

#### Step 1.1: Show Landing Page

**Action**: Navigate to application URL

**Say**: 
> "Welcome to the Co-Selector Console. This is the main interface where Key Opinion Leaders can manage their merchant partnerships and track their earnings."

**Point Out**:
- Clean, modern UI with Ant Design components
- Top navigation bar with logo and user menu
- Side navigation with main sections

**Screenshot**: 📸 Landing page with clean navigation

#### Step 1.2: Verify User Role

**Action**: Click user avatar/menu in top-right

**Say**:
> "I'm logged in as a regular Co-Selector user. Notice the role shows 'CO_SELECTOR' here."

**Point Out**:
- Current user email
- Role badge (CO_SELECTOR)
- No admin menu items visible (permission-based)

**Screenshot**: 📸 User menu showing CO_SELECTOR role

#### Step 1.3: Dashboard Overview

**Action**: Review dashboard metrics

**Say**:
> "The dashboard gives me a quick overview of my activity: tracking assets, content performance, and lead status. For today's demo, we'll focus on the Lead Management workflow."

**Point Out**:
- Widget layout with key metrics
- Quick action cards
- Recent activity feed

---

### SCENE 2: Navigate to Leads (30 seconds)

**Objective**: Show navigation to Lead section

#### Step 2.1: Open Leads Page

**Action**: Click "Leads" in left navigation

**Say**:
> "Let's navigate to the Leads section where I can create and manage merchant partnership opportunities."

**Point Out**:
- Active navigation highlight
- Breadcrumb updates to show "Leads"
- Empty state or existing leads table

**Screenshot**: 📸 Leads page with empty state

#### Step 2.2: Show Empty State (if applicable)

**Action**: Point to empty state message

**Say**:
> "As a new user, I don't have any leads yet. Let's create my first one."

**Point Out**:
- Friendly empty state illustration
- Clear call-to-action: "Create New Lead"
- Helpful description text

---

### SCENE 3: Create New Lead (3 minutes)

**Objective**: Demonstrate 5-section lead form with validation

#### Step 3.1: Open Lead Form

**Action**: Click "Create New Lead" button

**Say**:
> "Clicking 'Create New Lead' opens our structured form. Notice it's organized into 5 clear sections A through E, making it easy to provide all necessary information."

**Point Out**:
- Modal opens with focus trap
- Form divided into 5 sections (A-E)
- Progress indicator or section labels
- Draft auto-save notice (every 10 seconds)

**Screenshot**: 📸 Lead form modal showing 5 sections

#### Step 3.2: Fill Section A - Basic Information

**Action**: Complete Section A fields

**Type**:
- Merchant Name: "TechGadget Store"
- Category: Select "Electronics & Technology"
- Region: Select "North America"
- City: Select "Toronto"

**Say**:
> "Section A captures basic merchant information. The form validates as I type, and I can see a running counter of any incomplete required fields."

**Point Out**:
- Inline validation (checkmarks on valid fields)
- Error messages if fields invalid
- Category/Region/City dropdowns with realistic options

#### Step 3.3: Fill Section B - Contact Details

**Action**: Complete Section B fields

**Type**:
- Contact Name: "John Smith"
- Contact Email: "john@techgadget.com"
- Contact Phone: "+1-555-0123"
- Website (optional): "https://www.techgadget.com"

**Say**:
> "Section B captures contact information. Email validation ensures I enter a properly formatted address."

**Point Out**:
- Email format validation
- Phone number format guidance
- Optional vs. required field indicators

#### Step 3.4: Fill Section C - Business Details

**Action**: Complete Section C fields

**Type**:
- Estimated Monthly Volume: "$150,000"
- Business Description (optional): "Leading electronics retailer in Toronto area"

**Say**:
> "Section C captures business scale information to help our review team assess partnership potential."

**Point Out**:
- Currency formatting
- Text area with character counter (if applicable)
- Placeholder text showing expected format

#### Step 3.5: Fill Section D - Conflict of Interest Declaration

**Action**: Check COI declaration checkbox

**Say**:
> "Section D requires me to declare any conflicts of interest. This is a compliance requirement we take seriously."

**Point Out**:
- Required checkbox with clear label
- Cannot submit without checking
- Explanation text about COI policy

#### Step 3.6: Fill Section E - Additional Notes

**Action**: Add notes (optional)

**Type**: "Excited to partner with this merchant. Strong presence in tech community."

**Say**:
> "Section E allows me to add any additional context that might help the review team."

**Point Out**:
- Optional field
- Text area for freeform notes
- Character limit indicator (if applicable)

**Screenshot**: 📸 Completed form with all sections filled

#### Step 3.7: Show Validation Summary

**Action**: Try to submit with a required field missing (intentionally leave one field empty first)

**Say**:
> "If I try to submit with incomplete information, the form shows a validation summary banner listing all issues. This helps me quickly find and fix any problems."

**Point Out**:
- Validation banner appears at top
- List of specific errors with field names
- Scroll-to-error functionality (if implemented)

**Screenshot**: 📸 Validation error banner

#### Step 3.8: Fix Errors and Submit

**Action**: 
1. Fill missing field
2. Click "Submit Lead" button

**Say**:
> "After correcting all issues, I can submit my lead. Notice the anti-double-submit protection prevents accidental duplicate submissions."

**Point Out**:
- Submit button disables after click
- Loading spinner appears
- Success message toast

**Screenshot**: 📸 Success message after submission

---

### SCENE 4: View Submitted Lead (2 minutes)

**Objective**: Show lead detail view with timeline and status explanation

#### Step 4.1: Navigate to Lead Details

**Action**: Click on newly created lead in table (or auto-redirect after submission)

**Say**:
> "My lead has been successfully submitted. Let's look at the details page where I can track its progress."

**Point Out**:
- Lead status badge: "SUBMITTED"
- Lead detail sections (merchant info, contact, business details)
- Timeline section showing submission event

**Screenshot**: 📸 Lead detail view with SUBMITTED status

#### Step 4.2: Answer Q1 - What Does This Status Mean?

**Action**: Point to Status Explanation component

**Say**:
> "The system answers the first key question: 'What does this status mean?' The explanation tells me that SUBMITTED means my lead is awaiting initial review by the operations team."

**Point Out**:
- Status badge with color coding (blue for SUBMITTED)
- Clear explanation text below status
- Expected timeframe information

**Screenshot**: 📸 Status explanation component

#### Step 4.3: Answer Q2 - How Did We Get Here?

**Action**: Scroll to Timeline section

**Say**:
> "The second question is 'How did we get here?' The timeline shows the complete history with who did what and when."

**Point Out**:
- Timeline event: "LEAD_SUBMITTED"
- Actor: Your name (CO_SELECTOR)
- Timestamp with relative time ("2 minutes ago")
- Event description
- Reason code (if applicable)

**Screenshot**: 📸 Timeline showing submission event

#### Step 4.4: Answer Q3 - What Can I Do Next?

**Action**: Point to Next Best Action component

**Say**:
> "And the third question: 'What can I do next?' The system tells me I need to wait for the operations team to review my submission. No action is required from me right now."

**Point Out**:
- Next Best Action card
- Clear action guidance: "Wait for review"
- No edit buttons visible (lead is locked after submission)
- Expected timeline: "Typically 1-3 business days"

**Screenshot**: 📸 Next Best Action component

---

### SCENE 5: Simulate Review Process (2 minutes)

**Objective**: Use DevTools to progress lead through workflow

#### Step 5.1: Open DevTools

**Action**: Press `Ctrl+Shift+D`

**Say**:
> "Now I'll use our developer tools to simulate what happens behind the scenes when the operations team reviews my lead."

**Point Out**:
- DevTools panel opens from right side
- Multiple tabs: Role, Data, Timeline, Settings
- Note: "This is a prototype feature for demo purposes"

#### Step 5.2: Switch to OPS_BD Role Temporarily

**Action**: 
1. Click "Role" tab
2. Click "OPS_BD" button

**Say**:
> "Let me switch to the operations team perspective to show what they see."

**Point Out**:
- Role switches immediately
- UI updates to show admin menu items
- Notice additional permissions

**Screenshot**: 📸 DevTools role switching

#### Step 5.3: Claim and Review Lead (Quick Demo)

**Action**: 
1. Navigate to Admin → Review Queue
2. Find the TechGadget Store lead
3. Click "Claim" button
4. Set to "Under Review"

**Say**:
> "The operations team can see all submitted leads in their review queue. They claim leads for review and can request additional information or approve/reject."

**Point Out**:
- Admin Review Queue page
- Filter options (Status, Owner, Date)
- Claim button (assigns lead to reviewer)
- Status updates in timeline

**Screenshot**: 📸 Admin Review Queue

#### Step 5.4: Request Additional Information

**Action**:
1. Open lead detail
2. Click "Request Info" in Admin Action Panel
3. Check requested items: "Business License", "Tax Documentation"
4. Add comment: "Please provide business registration documents"
5. Submit

**Say**:
> "The reviewer needs some additional documentation before making a decision. They can request specific items from the merchant."

**Point Out**:
- Admin Action Panel on right side
- "Request Info" drawer with checklist
- Custom message to merchant
- Timeline updates with INFO_REQUESTED event

**Screenshot**: 📸 Request Info drawer

#### Step 5.5: Switch Back to CO_SELECTOR Role

**Action**:
1. Press `Ctrl+Shift+D`
2. Click "Role" tab
3. Click "CO_SELECTOR" button
4. Close DevTools

**Say**:
> "Now let's switch back to my perspective as the merchant contact."

---

### SCENE 6: Respond to Info Request (1.5 minutes)

**Objective**: Show notification and document upload flow

#### Step 6.1: Navigate Back to Lead

**Action**: Go to Leads page → Click TechGadget Store lead

**Say**:
> "Back in my account, I can see my lead status has changed to 'INFO_REQUESTED' and there's a clear notification about what's needed."

**Point Out**:
- Status badge: "INFO_REQUESTED" (amber/warning color)
- Status explanation updated: "Additional information required"
- Alert banner showing requested items
- Next Best Action: "Provide requested information"

**Screenshot**: 📸 INFO_REQUESTED status with alert

#### Step 6.2: Review Requested Items

**Action**: Read the info request details

**Say**:
> "The timeline shows exactly what the reviewer requested: business license and tax documentation, along with their note explaining why."

**Point Out**:
- Timeline event: "INFO_REQUESTED"
- Requested items list in metadata
- Reviewer's comment
- Timestamp of request

**Screenshot**: 📸 Timeline showing INFO_REQUESTED event

#### Step 6.3: Upload Documents (If Implemented)

**Action**: Click "Provide Information" button (or similar)

**Say**:
> "I can now upload the requested documents directly through the interface."

**Point Out**:
- Upload button or dropzone
- File type restrictions (PDF, images)
- Size limits
- Progress indicator during upload

**Note**: If document upload not implemented in Sprint 1, say:
> "In the full application, I would upload documents here. For this prototype, we'll simulate document provision by adding a timeline note."

**Screenshot**: 📸 Document upload interface

#### Step 6.4: Submit Response

**Action**: 
- If upload implemented: Upload files and submit
- If not: Use DevTools to inject timeline event

**DevTools Workaround** (if needed):
1. Press `Ctrl+Shift+D`
2. Go to "Timeline" tab
3. Enter lead ID
4. Event Type: "INFO_PROVIDED"
5. Actor Type: "CO_SELECTOR"
6. Reason Code: "DOCUMENTS_UPLOADED"
7. Metadata: `{"documents": ["business_license.pdf", "tax_docs.pdf"]}`
8. Click "Inject Event"

**Say**:
> "I've submitted the requested documentation. The lead returns to 'Under Review' status for the operations team to continue their evaluation."

**Point Out**:
- Success message
- Status returns to UNDER_REVIEW
- Timeline updated with INFO_PROVIDED event

---

### SCENE 7: Final Approval (1 minute)

**Objective**: Show approved state and completion

#### Step 7.1: Simulate Approval (Quick)

**Action**: Use DevTools or manual process:
1. Switch to OPS_BD role via DevTools
2. Navigate to lead detail
3. Click "Approve" in Admin Action Panel
4. Select reason: "BUSINESS_QUALITY"
5. Add note: "Strong business case, approved for partnership"
6. Submit approval

**Say**:
> "Let me quickly simulate the reviewer approving the lead after reviewing the documents."

**Point Out**:
- Approval modal with reason selection
- Optional approval notes
- Submit button with confirmation

**Screenshot**: 📸 Approval modal

#### Step 7.2: View Approved Status as CO_SELECTOR

**Action**:
1. Switch back to CO_SELECTOR role
2. Navigate to lead detail
3. Refresh page if needed

**Say**:
> "Excellent! My lead has been approved. The status clearly shows 'APPROVED' with a green indicator."

**Point Out**:
- Status badge: "APPROVED" (green/success color)
- Status explanation: "Partnership approved, onboarding next steps"
- Timeline shows APPROVED event with reviewer name
- Approval reasons visible in timeline metadata
- Next Best Action: "Begin onboarding process"

**Screenshot**: 📸 APPROVED status with complete timeline

#### Step 7.3: Review Complete Timeline

**Action**: Scroll through timeline from top to bottom

**Say**:
> "The timeline shows the complete journey: submission, claimed by reviewer, set to under review, info requested, info provided, and finally approved. Each step shows who performed the action, when, and why."

**Point Out**:
- Chronological order (newest first or oldest first)
- All events with timestamps
- Actor names and types
- Reason codes for key decisions
- Metadata expansion (if clickable)
- State transitions clearly marked (SUBMITTED → UNDER_REVIEW → INFO_REQUESTED → UNDER_REVIEW → APPROVED)

**Screenshot**: 📸 Complete timeline showing all events

---

### SCENE 8: Wrap-Up & Key Features (1 minute)

**Objective**: Summarize demonstrated features

**Say**:
> "Let me recap what we've demonstrated in this Co-Selector journey:"

**Highlight**:

1. **Structured Lead Creation**
   - 5-section form (A-E) with clear organization
   - Inline validation with helpful error messages
   - Auto-save draft functionality (every 10 seconds)
   - Validation summary showing all errors at once

2. **Three Key Questions Answered**
   - Q1: "What does this status mean?" → Status Explanation component
   - Q2: "How did we get here?" → Complete timeline with actor/reason
   - Q3: "What can I do next?" → Next Best Action guidance

3. **Complete Audit Trail**
   - Every action recorded in timeline
   - Who/When/Why/What for each event
   - State transitions clearly tracked
   - Reason codes for key decisions

4. **Role-Based Access Control**
   - CO_SELECTOR can create and submit leads
   - Cannot modify after submission (locked state)
   - OPS_BD has review and approval powers
   - Permission-aware UI (no edit buttons when locked)

5. **Clear Communication**
   - Status explanations in plain language
   - Next action guidance at every step
   - Info request with specific items listed
   - Success messages and confirmations

**Point Out**:
- No console errors (show DevTools console)
- Responsive design works at different screen sizes
- Accessible keyboard navigation (if time permits)
- Clean, professional UI following Ant Design standards

**Screenshot**: 📸 Final state - approved lead with complete timeline

---

## Demo Completion Checklist

After completing the demo, verify:

✅ Lead created successfully with all required fields  
✅ Lead submitted with proper validation  
✅ Timeline shows submission event with actor/timestamp  
✅ Status explanation answers Q1  
✅ Timeline answers Q2  
✅ Next Best Action answers Q3  
✅ Info request workflow demonstrated  
✅ Lead approved with reason codes  
✅ Complete timeline shows all state transitions  
✅ No console errors visible  
✅ RBAC permissions respected (locked after submission)

---

## Fallback Scenarios

### If Something Goes Wrong

**Issue**: Form won't submit
- **Fallback**: Check validation summary banner, fix errors, retry
- **Backup**: Use DevTools to generate a pre-filled lead

**Issue**: Timeline not updating
- **Fallback**: Refresh page to reload data from localStorage
- **Backup**: Use DevTools Timeline Injection to manually add events

**Issue**: Status not changing
- **Fallback**: Use DevTools to switch roles and manually update status
- **Backup**: Reset data and use pre-generated batch of leads

**Issue**: DevTools won't open
- **Fallback**: Manually set localStorage: `localStorage.setItem('coselector_dev_mode', 'true')` and reload
- **Backup**: Show static screenshots prepared in advance

---

## Questions & Answers

### Anticipated Audience Questions

**Q: "Can I edit a lead after submitting?"**  
**A**: No, once submitted, the lead is locked for review. This prevents conflicts with the review process. If changes are needed, you can communicate with the reviewer through the info request/response workflow.

**Q: "How long does review typically take?"**  
**A**: In production, typically 1-3 business days. For this demo, we simulated the process instantly using developer tools.

**Q: "What happens if my lead is rejected?"**  
**A**: You'll see a REJECTED status with the reviewer's reasons. Depending on the rejection type, you may be able to resubmit after addressing the issues, or the lead will be closed permanently.

**Q: "Can I see all my leads at once?"**  
**A**: Yes, the Leads page shows a table of all your leads with filtering and sorting options. You can filter by status, search by merchant name, and sort by submission date.

**Q: "Is there a notification system?"**  
**A**: Sprint 1 focuses on in-app timeline and status updates. Email/push notifications are planned for Sprint 2.

**Q: "What about mobile access?"**  
**A**: The UI is responsive and works on tablets. Full mobile optimization is planned for a future sprint.

---

## Screenshots Reference

### Required Screenshots for Documentation

1. 📸 Landing page with navigation
2. 📸 User menu showing CO_SELECTOR role
3. 📸 Leads page empty state
4. 📸 Lead form modal - 5 sections visible
5. 📸 Completed form with all fields filled
6. 📸 Validation error banner (intentional error)
7. 📸 Success message after submission
8. 📸 Lead detail view - SUBMITTED status
9. 📸 Status explanation component (Q1)
10. 📸 Timeline showing submission event (Q2)
11. 📸 Next Best Action component (Q3)
12. 📸 DevTools panel - role switching
13. 📸 Admin Review Queue page
14. 📸 Request Info drawer with checklist
15. 📸 INFO_REQUESTED status with alert
16. 📸 Timeline showing INFO_REQUESTED event
17. 📸 Document upload interface (if available)
18. 📸 Approval modal with reason selection
19. 📸 APPROVED status - final state
20. 📸 Complete timeline - all events visible

---

## Post-Demo Notes

### What Worked Well
- [ ] Form validation was clear and helpful
- [ ] Three questions clearly answered
- [ ] Timeline showed complete audit trail
- [ ] DevTools made demo progression smooth
- [ ] Status explanations were understandable

### Areas for Improvement
- [ ] Performance issues noted (specify)
- [ ] UI confusion points (specify)
- [ ] Missing features requested (specify)
- [ ] Accessibility concerns (specify)
- [ ] Bug discoveries (specify)

### Audience Feedback
- [ ] Positive reactions to: ___________
- [ ] Questions about: ___________
- [ ] Concerns raised: ___________
- [ ] Feature requests: ___________

---

## Next Steps

After Demo Script A, proceed to:

1. **Demo Script B**: OPS_BD Review workflow (reviewer perspective)
2. **Demo Script C**: Accessibility tour (keyboard navigation, screen readers)
3. **Sprint 1 DoD Verification**: Verify all Definition of Done criteria
4. **Final Documentation**: Complete Sprint 1 delivery package

---

**Script Version**: 1.0  
**Last Updated**: Sprint 1, Task 16  
**Status**: Ready for Demo  
**Estimated Demo Time**: 8-10 minutes  
**Preparation Time**: 5 minutes
