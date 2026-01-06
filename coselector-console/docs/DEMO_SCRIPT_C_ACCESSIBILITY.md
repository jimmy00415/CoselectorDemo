# Demo Script C: Accessibility Tour

## Overview

**Purpose**: Demonstrate accessibility features and keyboard-only navigation  
**Persona**: User with keyboard-only navigation needs (motor disability, power user, screen reader)  
**Duration**: 5-7 minutes  
**Audience**: Accessibility stakeholders, compliance team, Sprint 1 demo presentation

## Pre-Demo Setup

### 1. Environment Preparation

**Browser Setup**:
- Chrome or Edge (latest version)
- Window size: 1920x1080 (or 1440x900 minimum)
- **IMPORTANT**: Do NOT use mouse during main demo
- Have screen reader ready (NVDA on Windows, JAWS, or VoiceOver on Mac) - optional
- Enable browser's focus indicator visibility

**Application State**:
1. Navigate to application home page
2. Press `Ctrl+Shift+D` to open DevTools
3. Generate test leads (batch or single)
4. Switch to CO_SELECTOR role
5. Close DevTools
6. **Position hands on keyboard only**

### 2. Demo Environment Check

✅ Application running at http://localhost:3000  
✅ Test data exists (at least 2-3 leads)  
✅ Keyboard ready (hands off mouse!)  
✅ Focus indicators visible in browser  
✅ Screen reader ready (if demonstrating)

### 3. Announce Demo Rules

**Say to Audience**: 
> "For this demonstration, I will **not use the mouse at all**. Everything you see will be accomplished using only the keyboard. This showcases our commitment to accessibility and ensures users with motor disabilities can use the application effectively."

---

## Demo Script

### SCENE 1: Page Navigation with Tab Key (1.5 minutes)

**Objective**: Show logical tab order and skip links

#### Step 1.1: Initial Focus on Page Load

**Action**: Refresh page (F5) and observe initial focus

**Say**: 
> "When the page loads, focus is automatically set to the first interactive element - typically the main content area or a skip link. This helps keyboard users bypass repetitive navigation."

**Keys Used**: `F5` (refresh)

**Point Out**:
- Visible focus indicator (outline or highlight)
- Focus starts at logical point (not randomly in middle of page)
- Skip link appears (if implemented): "Skip to main content"

**Screenshot**: 📸 Initial focus state on page load

#### Step 1.2: Tab Through Navigation

**Action**: Press `Tab` repeatedly to move through navigation elements

**Say**: 
> "As I press Tab, focus moves through all interactive elements in a logical order: logo, navigation links, user menu, and then into the main content area."

**Keys Used**: `Tab` (forward), `Shift+Tab` (backward)

**Point Out**:
- Focus order follows visual layout (left to right, top to bottom)
- Navigation items: Home → Assets → Content → Leads → Admin (if OPS_BD)
- User menu button receives focus
- Each element has clear focus indicator
- No focus traps in navigation

**Screenshot**: 📸 Tab focus on navigation links

**Count Aloud**: "Tab 1: Logo... Tab 2: Home link... Tab 3: Assets... Tab 4: Leads... etc."

#### Step 1.3: Use Skip Link (if implemented)

**Action**: Press `Tab` until skip link appears, then `Enter`

**Say**: 
> "Users can skip repetitive navigation using this 'Skip to main content' link. This saves time when navigating between pages."

**Keys Used**: `Tab` to skip link, `Enter` to activate

**Point Out**:
- Skip link becomes visible on focus
- Pressing Enter moves focus directly to main content
- Skips over navigation, saving ~10 tab stops

**Screenshot**: 📸 Skip link visible and focused

#### Step 1.4: Navigate Page Sections with Landmarks

**Action**: If screen reader available, use landmark navigation commands

**Say**: 
> "Screen reader users can jump between page sections using landmark navigation. Our pages use semantic HTML: header, nav, main, aside, footer."

**Keys Used** (Screen Reader):
- NVDA: `D` (next landmark)
- JAWS: `R` (next region)
- VoiceOver: `VO+U`, then select Landmarks

**Point Out**:
- Semantic HTML5 landmarks used
- ARIA labels for clarity (e.g., `<nav aria-label="Primary Navigation">`)
- Logical page structure

---

### SCENE 2: Form Interaction and Validation (2 minutes)

**Objective**: Show keyboard form navigation, validation, and error handling

#### Step 2.1: Open Create Lead Form

**Action**: 
1. Tab to "Create New Lead" button
2. Press `Enter` to open modal

**Say**: 
> "I can open the lead creation form using only the keyboard. Notice the modal opens and focus is automatically trapped inside it - I can't accidentally tab out to the page behind."

**Keys Used**: `Tab` to button, `Enter` to activate

**Point Out**:
- Button receives focus
- Enter key activates button (not just click)
- Modal opens with animation
- **Focus trap activates** - focus stays in modal
- First form field automatically focused

**Screenshot**: 📸 Modal opened with focus on first field

#### Step 2.2: Navigate Form Fields

**Action**: Tab through form fields in Section A

**Say**: 
> "As I tab through the form, focus moves logically through each section. Each field is clearly labeled and has helpful placeholder text or instructions."

**Keys Used**: `Tab` (next field), `Shift+Tab` (previous field)

**Point Out**:
- Tab order follows visual layout (Section A → B → C → D → E)
- Labels properly associated with inputs (`<label for="...">`)
- Placeholder text visible
- Field type appropriate (text input, select dropdown, checkbox)
- Required fields marked with asterisk or ARIA

**Screenshot**: 📸 Tabbing through form fields

**Count Focus**: "Merchant Name... Category dropdown... Region... City..."

#### Step 2.3: Use Dropdown with Keyboard

**Action**: 
1. Tab to "Category" dropdown
2. Press `Enter` or `Space` to open dropdown
3. Use `Arrow Down`/`Arrow Up` to navigate options
4. Press `Enter` to select
5. Dropdown closes, focus moves to next field

**Say**: 
> "Dropdowns are fully keyboard accessible. I can open with Enter or Space, navigate with arrow keys, and select with Enter. Escape closes without selecting."

**Keys Used**: 
- `Enter` or `Space` (open dropdown)
- `Arrow Down` / `Arrow Up` (navigate options)
- `Enter` (select option)
- `Escape` (close without selecting)

**Point Out**:
- Dropdown opens on Enter/Space (not just click)
- Arrow keys work for navigation
- Selected option highlighted visually
- Keyboard selection updates form value
- Focus returns to dropdown after selection

**Screenshot**: 📸 Dropdown open with keyboard navigation

#### Step 2.4: Trigger Validation Error

**Action**: 
1. Tab to "Contact Email" field
2. Type invalid email: "notanemail"
3. Tab to next field (blur event triggers validation)
4. Observe error message

**Say**: 
> "If I enter invalid data, the form shows an error message immediately after leaving the field. Screen readers announce the error, and the field is marked invalid with ARIA attributes."

**Keys Used**: Type text, `Tab` to blur field

**Point Out**:
- Inline validation triggers on blur
- Error message appears below field
- Field outlined in red (or error color)
- ARIA attribute: `aria-invalid="true"`
- ARIA attribute: `aria-describedby="email-error"`
- Screen reader announces: "Invalid. Please enter a valid email address."

**Screenshot**: 📸 Form field with validation error

#### Step 2.5: Fix Error and See Success

**Action**: 
1. `Shift+Tab` back to email field
2. Fix email: "john@example.com"
3. Tab away to trigger validation

**Say**: 
> "After correcting the error, the field shows a success indicator. The error message disappears and screen readers announce the field is now valid."

**Keys Used**: `Shift+Tab` (back), type correction, `Tab` (blur)

**Point Out**:
- Error clears when valid
- Success indicator appears (green outline or checkmark)
- ARIA attribute: `aria-invalid="false"`
- Screen reader announces: "Valid."

**Screenshot**: 📸 Corrected field showing success

#### Step 2.6: Submit Form with Enter Key

**Action**: 
1. Complete all required fields
2. Tab to "Submit" button
3. Press `Enter` to submit

**Say**: 
> "After filling all fields, I can submit using Enter on the submit button. Notice the anti-double-submit protection prevents accidental duplicate submissions even with keyboard."

**Keys Used**: `Tab` to submit button, `Enter` to submit

**Point Out**:
- Submit button receives focus
- Enter key submits form
- Button disables immediately (anti-double-submit)
- Loading spinner appears
- Success message shown (keyboard focus moves to it)

**Screenshot**: 📸 Form submission with loading state

---

### SCENE 3: Focus Trap in Modal (1 minute)

**Objective**: Demonstrate focus trap prevents tabbing out of modal

#### Step 3.1: Show Focus Trap Behavior

**Action**: 
1. Re-open lead form modal
2. Tab forward through all fields until reaching last element (Submit button)
3. Press `Tab` again
4. Observe focus returns to first element (Close button or first field)

**Say**: 
> "The modal implements a focus trap. When I reach the last interactive element and press Tab, focus wraps back to the first element. This prevents me from accidentally tabbing into the page behind the modal, which I can't interact with while the modal is open."

**Keys Used**: `Tab` repeatedly to demonstrate wrap-around

**Point Out**:
- Focus cycles within modal only
- Last element → Tab → First element (wrap forward)
- First element → Shift+Tab → Last element (wrap backward)
- Focus NEVER escapes modal
- Background page not accessible while modal open

**Screenshot**: 📸 Focus wrapping in modal

#### Step 3.2: Show Reverse Tab Wrap

**Action**: 
1. Focus on first element in modal (Close button)
2. Press `Shift+Tab`
3. Observe focus moves to last element (Submit button)

**Say**: 
> "The focus trap works in both directions. Shift+Tab from the first element brings me to the last element."

**Keys Used**: `Shift+Tab` from first element

**Point Out**:
- Reverse wrap works correctly
- Focus trap is bi-directional
- No dead-end focus points

---

### SCENE 4: Escape Key Behavior (1 minute)

**Objective**: Show Escape key closes modals and cancels operations

#### Step 4.1: Close Modal with Escape

**Action**: 
1. With modal open, press `Escape`
2. Modal closes
3. Focus returns to button that opened modal

**Say**: 
> "At any time, I can press Escape to close the modal. Notice that focus automatically returns to the button that opened the modal - this is called 'focus return' and helps users maintain context."

**Keys Used**: `Escape`

**Point Out**:
- Escape closes modal immediately
- No confirmation needed if form is empty/unchanged
- **Focus returns to triggering element** ("Create New Lead" button)
- User's place on page is preserved
- Can reopen modal and continue where left off

**Screenshot**: 📸 Modal closed, focus returned to button

#### Step 4.2: Escape with Unsaved Changes (if implemented)

**Action**: 
1. Open modal
2. Type something in form
3. Press `Escape`
4. Observe confirmation dialog (if implemented)

**Say**: 
> "If I have unsaved changes, Escape triggers a confirmation dialog to prevent accidental data loss. This is also keyboard accessible."

**Keys Used**: `Escape` to trigger, `Tab` + `Enter` to confirm/cancel

**Point Out**:
- Confirmation dialog appears
- Focus moves to confirmation dialog
- Options clearly labeled: "Discard Changes" / "Continue Editing"
- Tab between options, Enter to select
- Second Escape can bypass confirmation (depending on implementation)

**Screenshot**: 📸 Confirmation dialog on Escape

#### Step 4.3: Escape in Nested Modals (if applicable)

**Action**: If drawers/modals can nest:
1. Open modal (Info Request drawer)
2. Open nested element (confirmation)
3. Press `Escape` - closes inner element only
4. Press `Escape` again - closes outer modal

**Say**: 
> "With nested modals, Escape closes the most recently opened element first, working backward through the stack."

**Keys Used**: Multiple `Escape` presses

**Point Out**:
- Escape is contextual (closes top-most element)
- Multiple presses needed for nested structures
- Logical, predictable behavior

---

### SCENE 5: Focus Return After Navigation (45 seconds)

**Objective**: Show focus management during page navigation

#### Step 5.1: Navigate to Lead Detail

**Action**: 
1. Tab to a lead in the table
2. Press `Enter` to open detail view
3. Page navigates to detail view
4. Observe focus placement on new page

**Say**: 
> "When navigating to a new page, focus is set to a logical starting point - typically the page heading or main content. This announces the page change to screen reader users."

**Keys Used**: `Tab` to lead link, `Enter` to navigate

**Point Out**:
- Focus set to page heading (`<h1>`) or main landmark
- Focus is NOT lost (not on body or nowhere)
- Screen reader announces new page title
- User can immediately Tab forward from logical start

**Screenshot**: 📸 Focus on page heading after navigation

#### Step 5.2: Navigate Back with Browser Back Button

**Action**: 
1. Press `Alt+Left Arrow` (browser back)
2. Return to previous page
3. Observe focus returns to element that was focused

**Say**: 
> "When using browser back/forward, focus ideally returns to the element you were interacting with, maintaining context."

**Keys Used**: `Alt+Left Arrow` (back), `Alt+Right Arrow` (forward)

**Point Out**:
- Focus restored to previous element (if implemented)
- Or focus set to page heading (acceptable alternative)
- User's context maintained

---

### SCENE 6: Anti-Double-Submit Protection (45 seconds)

**Objective**: Demonstrate keyboard rapid-fire prevention

#### Step 6.1: Try Rapid Enter Key Presses

**Action**: 
1. Tab to submit button in a form
2. Press `Enter` multiple times rapidly
3. Observe only one submission occurs

**Say**: 
> "Our anti-double-submit hook prevents accidental duplicate submissions even when using keyboard. Rapid Enter key presses are ignored after the first one."

**Keys Used**: Multiple rapid `Enter` presses

**Point Out**:
- Submit button triggered only once
- Button disables immediately after first press
- Subsequent Enter presses have no effect
- Prevents duplicate data creation
- Works identically to mouse double-click prevention

**Screenshot**: 📸 Button disabled after submit

#### Step 6.2: Show Button Re-enables After Operation

**Action**: 
1. Wait for form submission to complete (success/error)
2. Observe button re-enables
3. Can submit again if needed

**Say**: 
> "After the operation completes, the button re-enables so the form can be submitted again if needed. This prevents permanent lockout."

**Point Out**:
- Button re-enables after success
- Or re-enables after error (to allow retry)
- Loading spinner clears
- Form ready for next interaction

---

### SCENE 7: Table Navigation with Arrow Keys (1 minute)

**Objective**: Show advanced keyboard navigation in data tables

#### Step 7.1: Navigate Leads Table with Keyboard

**Action**: 
1. Tab to leads table
2. Use `Arrow Down`/`Arrow Up` to move between rows
3. Use `Arrow Right`/`Arrow Left` to move between columns (if implemented)
4. Press `Enter` on a row to view details

**Say**: 
> "Our data tables support arrow key navigation. After tabbing into the table, I can use arrow keys to move between rows and columns, then Enter to activate the selected row."

**Keys Used**: 
- `Tab` to enter table
- `Arrow Down` / `Arrow Up` (rows)
- `Arrow Right` / `Arrow Left` (columns)
- `Enter` (activate row)
- `Space` (select checkbox, if applicable)

**Point Out**:
- Table has `role="grid"` or proper ARIA
- Current cell/row highlighted visually
- Arrow keys move focus within table
- Enter opens detail view or performs default action
- Space toggles row selection checkbox
- Screen reader announces row/column headers with each navigation

**Screenshot**: 📸 Table navigation with keyboard highlight

#### Step 7.2: Select Multiple Rows with Space (if applicable)

**Action**: 
1. Navigate to row with checkbox
2. Press `Space` to toggle selection
3. Arrow to next row
4. Press `Space` to add to selection

**Say**: 
> "I can select multiple rows using Space bar on the checkbox, then perform batch operations like bulk approve or delete."

**Keys Used**: `Space` to toggle selection

**Point Out**:
- Checkbox toggles with Space (not just click)
- Multiple selection works
- Selection state visible (checkmark + highlighted row)
- Selected count updates (e.g., "3 items selected")

**Screenshot**: 📸 Multiple rows selected with keyboard

---

### SCENE 8: Screen Reader Announcements (1 minute)

**Objective**: Demonstrate screen reader compatibility (if screen reader available)

#### Step 8.1: Enable Screen Reader

**Action**: Start screen reader (NVDA, JAWS, or VoiceOver)

**Say**: 
> "Now let me demonstrate with an actual screen reader. Screen reader users rely on announcements to understand page structure and changes."

**Keys Used**: Screen reader activation shortcut

#### Step 8.2: Navigate Page with Screen Reader

**Action**: 
1. Use screen reader heading navigation (H key in NVDA/JAWS)
2. Jump through page headings
3. Listen to announcements

**Say**: 
> "The screen reader can jump between headings, announcing the page structure. Our pages use proper heading hierarchy: H1 for page title, H2 for sections, H3 for subsections."

**Keys Used**: `H` (next heading), `Shift+H` (previous heading)

**Point Out**:
- Logical heading hierarchy (H1 → H2 → H3, no skips)
- Descriptive heading text
- Screen reader announces heading level: "Heading level 1: Lead Management"

**Screenshot**: 📸 (Audio demonstration, capture screen reader overlay if visible)

#### Step 8.3: Form Field Announcements

**Action**: Tab through form fields with screen reader active

**Say**: 
> "As I move through form fields, the screen reader announces the label, field type, current value, and any validation errors."

**Keys Used**: `Tab` to move between fields

**Hear Announced**:
- "Merchant Name, edit text, required, blank"
- "Category, combo box, required, no selection"
- "Contact Email, edit text, invalid, error: Please enter a valid email address"

**Point Out**:
- Labels properly associated (for/id linkage)
- Required fields announced
- Field type announced (edit text, combo box, checkbox)
- Validation errors announced with aria-describedby

#### Step 8.4: Dynamic Content Announcements

**Action**: 
1. Submit a form
2. Listen for success message announcement
3. Or trigger validation error

**Say**: 
> "When content changes dynamically, screen readers are notified via ARIA live regions. Success messages, errors, and loading states are all announced automatically."

**Keys Used**: `Enter` to submit

**Hear Announced**:
- "Lead submitted successfully" (aria-live="polite")
- Or "Error: Please fill all required fields" (aria-live="assertive")

**Point Out**:
- ARIA live regions for dynamic content
- `aria-live="polite"` for non-critical announcements
- `aria-live="assertive"` for errors/urgent messages
- Loading states announced: "Loading, please wait"

---

### SCENE 9: Keyboard Shortcuts Reference (30 seconds)

**Objective**: Show global keyboard shortcuts

#### Step 9.1: Open DevTools with Keyboard Shortcut

**Action**: Press `Ctrl+Shift+D`

**Say**: 
> "Power users can use keyboard shortcuts for common actions. Ctrl+Shift+D opens our developer tools panel for quick role switching and data management."

**Keys Used**: `Ctrl+Shift+D`

**Point Out**:
- Global shortcut works from anywhere in app
- No mouse needed to access DevTools
- Focus moves to DevTools panel
- Can close with Escape

**Screenshot**: 📸 DevTools opened with keyboard shortcut

#### Step 9.2: Show Keyboard Shortcuts Help (if implemented)

**Action**: Press `?` or `Ctrl+/` to show shortcuts modal

**Say**: 
> "Users can access a full list of keyboard shortcuts by pressing ? or Ctrl+/."

**Keys Used**: `?` or `Ctrl+/`

**Point Out**:
- Shortcuts modal lists all available shortcuts
- Organized by category (Navigation, Forms, Global)
- Escape closes modal
- Reference available anytime

**Screenshot**: 📸 Keyboard shortcuts help modal

---

### SCENE 10: Wrap-Up & Accessibility Summary (1 minute)

**Objective**: Summarize demonstrated accessibility features

**Say**:
> "Let me recap the accessibility features we've demonstrated:"

**Highlight**:

1. **Keyboard Navigation**
   - Logical tab order throughout application
   - All interactive elements reachable with Tab
   - Skip links to bypass repetitive navigation
   - Arrow key navigation in tables and dropdowns

2. **Focus Management**
   - Clear visible focus indicators
   - Focus trap in modals prevents escape
   - Focus return to triggering element after modal close
   - Focus set to logical point after navigation

3. **Escape Key Behavior**
   - Closes modals and cancels operations
   - Works with nested modals (closes top-most first)
   - Confirmation for unsaved changes
   - Always provides exit path

4. **Form Accessibility**
   - Proper label associations (for/id)
   - Inline validation with ARIA attributes
   - Error messages announced to screen readers
   - Required fields marked and announced

5. **Screen Reader Support**
   - Semantic HTML5 (header, nav, main, aside)
   - Proper heading hierarchy (H1 → H2 → H3)
   - ARIA labels for clarity
   - ARIA live regions for dynamic content
   - Form field types and validation announced

6. **Anti-Double-Submit**
   - Works with keyboard (rapid Enter presses)
   - Works with mouse (double-clicks)
   - Button disables immediately
   - Re-enables after operation completes

7. **WCAG Compliance** (Sprint 1 Scope)
   - WCAG 2.1 Level AA target
   - Keyboard accessible (2.1.1)
   - No keyboard trap (2.1.2)
   - Focus visible (2.4.7)
   - Labels or instructions (3.3.2)
   - Error identification (3.3.1)

**Point Out**:
- Entire demo completed without mouse
- All features accessible via keyboard
- Screen reader compatible
- Professional, inclusive user experience

**Screenshot**: 📸 Final screen showing completed keyboard-only workflow

---

## Demo Completion Checklist

After completing the demo, verify:

✅ Entire demo completed without using mouse  
✅ Tab order logical throughout application  
✅ Focus visible at all times  
✅ Skip links working (if implemented)  
✅ Form fields keyboard accessible  
✅ Dropdowns work with arrow keys  
✅ Validation errors announced properly  
✅ Focus trap in modals prevents escape  
✅ Escape key closes modals  
✅ Focus returns to triggering element  
✅ Anti-double-submit works with Enter key  
✅ Table navigation with arrow keys  
✅ Screen reader announcements correct (if tested)

---

## Fallback Scenarios

### If Something Goes Wrong

**Issue**: Focus indicator not visible
- **Fallback**: Mention browser settings may need adjustment
- **Backup**: Use browser DevTools to highlight focused element
- **Solution**: Update CSS to ensure `:focus` styles are strong enough

**Issue**: Tab order seems wrong
- **Fallback**: Note as known issue, explain expected order
- **Backup**: Use browser DevTools to inspect tabindex values
- **Solution**: Review HTML structure and tabindex usage

**Issue**: Focus trap doesn't work
- **Fallback**: Explain concept verbally even if not working
- **Backup**: Show code implementation in DevTools
- **Solution**: Debug useFocusTrap hook

**Issue**: Screen reader not available/working
- **Fallback**: Describe what screen reader would announce
- **Backup**: Show ARIA attributes in browser DevTools
- **Solution**: Prepare screen reader in advance, test before demo

**Issue**: Escape key doesn't close modal
- **Fallback**: Click close button as backup
- **Backup**: Explain expected behavior
- **Solution**: Debug useEscapeKey hook

---

## Questions & Answers

### Anticipated Audience Questions

**Q: "Does this work on all browsers?"**  
**A**: Yes, keyboard navigation is a web standard supported by all modern browsers (Chrome, Firefox, Edge, Safari). Focus management hooks use standard JavaScript APIs. Screen reader support varies slightly by browser+screen reader combination, but core functionality works everywhere.

**Q: "What about mobile/touch accessibility?"**  
**A**: Sprint 1 focuses on desktop keyboard navigation. Mobile touch accessibility (larger tap targets, swipe gestures, VoiceOver on iOS) is planned for Sprint 2. The responsive layout does work on tablets.

**Q: "How do you test accessibility?"**  
**A**: We use multiple approaches:
1. Manual keyboard-only testing (this demo)
2. Screen reader testing (NVDA, JAWS, VoiceOver)
3. Automated tools (axe DevTools, Lighthouse)
4. Browser accessibility inspector
5. WCAG 2.1 checklist validation

**Q: "What WCAG level do you target?"**  
**A**: We target WCAG 2.1 Level AA for Sprint 1, with plans to achieve Level AAA for critical workflows in future sprints.

**Q: "Can I customize keyboard shortcuts?"**  
**A**: Not in Sprint 1, but customizable shortcuts are planned for Sprint 2 based on user feedback.

**Q: "What about users who can't use keyboards or mice?"**  
**A**: We support assistive technologies like switch controls, eye tracking, and voice control through standard HTML and ARIA. These devices emulate keyboard or mouse input.

**Q: "Are there accessibility issues remaining?"**  
**A**: Sprint 1 achieves core accessibility requirements. Known improvements for Sprint 2:
- Enhanced color contrast in some areas
- More descriptive ARIA labels
- Keyboard shortcut customization
- Better mobile touch accessibility

---

## Screenshots Reference

### Required Screenshots for Documentation

1. 📸 Initial focus state on page load
2. 📸 Tab focus on navigation links
3. 📸 Skip link visible and focused
4. 📸 Modal opened with focus on first field
5. 📸 Tabbing through form fields
6. 📸 Dropdown open with keyboard navigation
7. 📸 Form field with validation error
8. 📸 Corrected field showing success
9. 📸 Form submission with loading state
10. 📸 Focus wrapping in modal (focus trap)
11. 📸 Modal closed, focus returned to button
12. 📸 Confirmation dialog on Escape
13. 📸 Focus on page heading after navigation
14. 📸 Button disabled after submit (anti-double)
15. 📸 Table navigation with keyboard highlight
16. 📸 Multiple rows selected with keyboard
17. 📸 Screen reader overlay (if available)
18. 📸 DevTools opened with keyboard shortcut
19. 📸 Keyboard shortcuts help modal (if implemented)
20. 📸 Final screen showing completed workflow

---

## Accessibility Testing Tools

### Recommended Tools for Post-Demo Validation

**Browser Extensions**:
- **axe DevTools**: Automated accessibility scanning
- **WAVE**: Visual feedback about accessibility issues
- **Lighthouse**: Built-in Chrome DevTools audit
- **Accessibility Insights**: Microsoft's testing toolkit

**Screen Readers**:
- **NVDA** (Windows): Free, widely used
- **JAWS** (Windows): Industry standard, paid
- **VoiceOver** (Mac): Built-in, free
- **TalkBack** (Android): Built-in mobile screen reader

**Manual Testing Checklist**:
```
Keyboard Navigation:
□ Tab order logical
□ All interactive elements reachable
□ No keyboard traps (except intentional in modals)
□ Skip links present
□ Focus visible at all times

Focus Management:
□ Focus trap in modals
□ Focus return after modal close
□ Escape closes modals
□ Focus set on page navigation

Forms:
□ Labels associated with inputs
□ Required fields marked
□ Validation errors clear and announced
□ Error messages linked with aria-describedby
□ Submit prevention (anti-double-submit)

Semantic HTML:
□ Proper heading hierarchy (H1 → H2 → H3)
□ Landmarks used (header, nav, main, aside, footer)
□ Lists for navigation and content
□ Buttons for actions, links for navigation

ARIA:
□ ARIA labels where needed
□ ARIA live regions for dynamic content
□ ARIA-invalid for validation errors
□ ARIA-describedby for help text
□ Role attributes for custom components
```

---

## Integration with Other Scripts

**Before This Demo**:
- Run Demo Script A or B to show application functionality first
- Establishes context for what you're making accessible

**Combined Demo** (20 minutes):
1. Demo Script A or B: Show feature with mouse (8-10 min)
2. Demo Script C: Repeat same workflow with keyboard only (7 min)
3. Comparison: Highlight that both methods achieve same result

**After This Demo**:
- Sprint 1 DoD Verification includes accessibility checks
- Final documentation includes accessibility compliance summary

---

## Post-Demo Notes

### What Worked Well
- [ ] Keyboard-only navigation smooth
- [ ] Focus management prevented confusion
- [ ] Validation accessible to keyboard users
- [ ] Screen reader announcements clear (if tested)
- [ ] Anti-double-submit effective

### Areas for Improvement
- [ ] Focus indicators could be stronger in certain areas
- [ ] Some ARIA labels could be more descriptive
- [ ] Keyboard shortcut discoverability needs improvement
- [ ] Complex table navigation could be enhanced
- [ ] Mobile touch accessibility needs work

### Audience Feedback
- [ ] Questions about screen reader support: ___________
- [ ] Concerns about WCAG compliance: ___________
- [ ] Requests for additional shortcuts: ___________
- [ ] Interest in accessibility training: ___________

---

## Accessibility Statement (Draft for Sprint 1)

**Co-Selector Console Accessibility**

We are committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.

**Conformance Status**: WCAG 2.1 Level AA (Partially Conformant)

**Measures to Support Accessibility**:
- Keyboard-only navigation supported throughout
- Focus management in modals and navigation
- Screen reader compatible with semantic HTML and ARIA
- Form validation with accessible error messages
- Anti-double-submit protection for keyboard users
- Skip links to bypass repetitive content
- Logical heading hierarchy

**Known Limitations** (Sprint 1):
- Some color contrast ratios may not meet AAA standards
- Mobile touch accessibility limited
- No keyboard shortcut customization
- Video/audio content (future) may need captions

**Feedback**: We welcome feedback on accessibility. Contact [email] with suggestions or issues.

---

## Next Steps

After Demo Script C, proceed to:

1. **Sprint 1 DoD Verification**: Verify all Definition of Done criteria (including accessibility)
2. **Final Documentation**: Complete Sprint 1 delivery package with accessibility summary
3. **Sprint 2 Planning**: Prioritize remaining accessibility enhancements

---

**Script Version**: 1.0  
**Last Updated**: Sprint 1, Task 18  
**Status**: Ready for Demo  
**Estimated Demo Time**: 5-7 minutes  
**Preparation Time**: 2 minutes  
**Special Requirements**: Hands off mouse, screen reader optional
