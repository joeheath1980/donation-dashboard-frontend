# Unified Candidate UX Implementation Plan

## Objective
Make forwarded email donations use the **same rich UI template** as Gmail donations (with checkboxes, editing, bulk commit) while keeping them as **separate sections** triggered at different times.

---

## Current State vs. Target State

### Current State ❌
```
┌─────────────────────────────────────────────┐
│ Gmail Donations (Full Template)             │
│ ✓ Checkboxes for bulk selection            │
│ ✓ Edit all fields (charity, amount, etc.)  │
│ ✓ Bulk "Commit Selected" button            │
│ ✓ Confidence scores                         │
│ ✓ Job ID badge                              │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Forwarded Donations (Legacy Template)       │
│ ✗ No checkboxes                             │
│ ✗ Read-only display                         │
│ ✗ Individual commit buttons only           │
│ ✗ No confidence scores                      │
│ ✗ No job ID                                 │
└─────────────────────────────────────────────┘
```

### Target State ✅
```
┌─────────────────────────────────────────────┐
│ Gmail Donations (Full Template)             │
│ ✓ Checkboxes for bulk selection            │
│ ✓ Edit all fields                           │
│ ✓ Bulk commit                               │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Forwarded Donations (SAME Full Template)    │
│ ✓ Checkboxes for bulk selection            │
│ ✓ Edit all fields                           │
│ ✓ Bulk commit                               │
└─────────────────────────────────────────────┘
```

**Key:** Separate sections, same UI, triggered independently.

---

## Root Cause Analysis

### Why Templates Are Different

**File:** `src/components/Activity/Activity.js`

**Line 1290:**
```javascript
const isGmailSource = source === 'gmail';
```

**Line 1328-1469:** Full Gmail template (checkboxes, editing, bulk actions)
**Line 1470-1540:** Legacy template for non-Gmail sources (read-only, individual commit)

### Data Flow Issue

**Current Flow:**
```
Forwarded Email
  ↓
Backend: ReceiptProcessor → candidate format ✅
  ↓
Frontend: /api/email/forwarded-receipts ⚠️
  ↓
Transform to OLD format (lines 420-429) ❌
  ↓
Set source: 'forwarded' ❌
  ↓
Renders legacy template ❌
```

**Needed Flow:**
```
Forwarded Email
  ↓
Backend: ReceiptProcessor → candidate format ✅
  ↓
Frontend: /api/email/forwarded-receipts ✅
  ↓
Transform to GMAIL candidate format ✅
  ↓
Set source: 'forwarded' (but use Gmail template) ✅
  ↓
Renders full template ✅
```

---

## Implementation Plan

### Phase 1: Backend Verification ✅ COMPLETED

**Status:** Already done in previous session

**Changes Made:**
- ✅ `ReceiptProcessor.js` now returns candidates in Gmail format (lines 419-512)
- ✅ `receiptWorker.js` stores candidates instead of creating donations (lines 7-51)
- ✅ Candidates include all required fields: jobId, source, confidence, dedupeHash, etc.

**No further backend changes needed for this plan.**

---

### Phase 2: Frontend Data Transformation

**Goal:** Make forwarded emails match Gmail candidate structure exactly.

#### Step 2.1: Update fetchForwardedEmails Transform

**File:** `src/components/Activity/Activity.js`

**Current (Lines 420-429):**
```javascript
const transformedEmails = (data.emails || [])
  .filter(email => email.status === 'processed' && email.parsed)
  .map(email => ({
    id: `forwarded-${email._id}`,
    charity: email.parsed.charity,
    amount: `${email.parsed.currency || '$'}${email.parsed.amount}`,
    date: email.parsed.date || email.createdAt,
    source: 'forwarded',  // ⚠️ Simple string
    originalEmail: email
  }));
```

**Target (Replace lines 420-429):**
```javascript
const transformedEmails = (data.emails || [])
  .filter(email => email.status === 'processed' && email.parsed)
  .map(email => {
    const parsed = email.parsed;

    return {
      // Gmail-compatible candidate structure
      id: `forwarded-${email._id}`,
      jobId: `forwarded-${Date.now()}`,
      emailMessageId: email._id,
      candidateId: `forwarded-${email._id}`,

      // Core donation data
      charity: parsed.charityName || parsed.charity,
      normalizedCharity: parsed.charityName || parsed.charity,
      amount: parsed.amount,
      currency: parsed.currency || 'AUD',
      date: parsed.date,

      // Source object (same structure as Gmail)
      source: {
        from: email.metadata?.from || '',
        subject: email.metadata?.subject || '',
        snippet: '',
        textBody: '',
        htmlBody: ''
      },

      // Confidence and verification
      confidence: parsed.confidence?.overall || 0.7,
      verified: false,

      // Metadata
      receiptNumber: parsed.receiptNumber || null,
      dedupeHash: `forwarded-${email._id}`,
      metadata: {
        needsReview: parsed.confidence?.overall < 0.8,
        hasReceipt: !!parsed.receiptNumber,
        taxDeductible: parsed.taxDeductible || null,
        parsingConfidence: parsed.confidence,
        emailMetadata: email.metadata,
        originalEmail: email
      }
    };
  });
```

**Why this change:**
- Matches Gmail candidate structure exactly
- Includes all fields needed by full template (jobId, source object, confidence, etc.)
- Preserves original email data in metadata for debugging
- Uses same field names as Gmail scraper for consistency

---

### Phase 3: UI Template Logic

**Goal:** Make forwarded candidates use the full Gmail template.

#### Step 3.1: Update isGmailSource Check

**File:** `src/components/Activity/Activity.js`

**Current (Line 1290):**
```javascript
const isGmailSource = source === 'gmail';
```

**Target (Replace line 1290):**
```javascript
const isGmailSource = source === 'gmail' || source === 'forwarded';
```

**Why this change:**
- Simple one-line change
- Makes forwarded candidates render with full template
- Keeps source distinction for section headers

#### Step 3.2: Update Entry Source Check (for commit bar)

**File:** `src/components/Activity/Activity.js`

**Current (Line 1560):**
```javascript
const isGmailSource = entry.source === 'gmail';
```

**Target (Replace line 1560):**
```javascript
const isGmailSource = entry.source === 'gmail' || entry.source === 'forwarded';
```

**Why this change:**
- Shows commit bar for forwarded emails
- Enables bulk selection UI

#### Step 3.3: Update Commit Bar Conditional

**File:** `src/components/Activity/Activity.js`

**Current (Line 1574):**
```javascript
{isGmailSource && (
  <div className={styles.commitBar}>
```

**Target (Keep as-is, will work because isGmailSource now includes forwarded):**
```javascript
{isGmailSource && (
  <div className={styles.commitBar}>
```

**No change needed - already correct once Step 3.2 is done.**

---

### Phase 4: JobId and Selection Logic

**Goal:** Ensure forwarded emails support bulk selection properly.

#### Step 4.1: Verify Selection State Keying

**File:** `src/components/Activity/Activity.js`

**Check (Line 153):**
```javascript
const [selectedCandidates, setSelectedCandidates] = useState({});
```

This is keyed by `jobId`, so forwarded emails need consistent `jobId` format.

**Current forwarded transform:** Uses `id: 'forwarded-${email._id}'`
**Updated transform (from Step 2.1):** Uses `jobId: 'forwarded-${Date.now()}'`

**Potential issue:** Multiple forwarded emails in same fetch will have same jobId (same timestamp).

**Solution (in Step 2.1 transform):**
```javascript
// Instead of:
jobId: `forwarded-${Date.now()}`,

// Use:
jobId: `forwarded-${Date.now()}-${index}`,  // Add index from map
```

**Updated transform for line 420:**
```javascript
const transformedEmails = (data.emails || [])
  .filter(email => email.status === 'processed' && email.parsed)
  .map((email, index) => {  // Add index parameter
    const parsed = email.parsed;

    return {
      id: `forwarded-${email._id}`,
      jobId: `forwarded-${Date.now()}-${index}`,  // Unique jobId per email
      // ... rest of fields
    };
  });
```

**OR simpler:** Use a single jobId for all forwarded emails in one fetch:
```javascript
// Before map, outside:
const forwardedJobId = `forwarded-${Date.now()}`;

const transformedEmails = (data.emails || [])
  .map(email => ({
    jobId: forwardedJobId,  // Same jobId for all in this batch
    // ... rest
  }));
```

**Recommendation:** Use **single jobId per batch** (simpler, enables bulk commit of all forwarded).

---

### Phase 5: Testing Plan

#### Test Case 1: Forwarded Email UI Rendering
1. Forward a donation receipt to forwarding address
2. Click "Refresh Forwarded Inbox"
3. **Verify:**
   - ✓ Forwarded section appears
   - ✓ Checkbox appears on each donation
   - ✓ "Commit Selected" button appears
   - ✓ Can edit charity, amount, currency, date fields
   - ✓ Confidence score displays
   - ✓ Job ID badge displays

#### Test Case 2: Bulk Selection
1. Check multiple forwarded donations
2. **Verify:**
   - ✓ Checkboxes toggle correctly
   - ✓ "Commit Selected (N)" count updates
   - ✓ Can deselect individual items

#### Test Case 3: Bulk Commit
1. Select 2-3 forwarded donations
2. Fill in contribution type and charity category
3. Click "Commit Selected"
4. **Verify:**
   - ✓ All selected donations commit
   - ✓ Donations appear in profile
   - ✓ Checkboxes disable after commit
   - ✓ Status changes to "COMMITTED"

#### Test Case 4: Field Editing
1. Edit charity name on forwarded donation
2. Edit amount
3. Edit date
4. **Verify:**
   - ✓ Changes reflect in UI
   - ✓ Edited values persist during commit
   - ✓ Committed donation has edited values

#### Test Case 5: Separate Sections
1. Run Gmail search (creates Gmail section)
2. Refresh forwarded inbox (creates forwarded section)
3. **Verify:**
   - ✓ Two separate sections appear
   - ✓ Each has own header with timestamp
   - ✓ Each has own "Commit Selected" button
   - ✓ Selections are independent (selecting in Gmail doesn't affect forwarded)
   - ✓ Can commit Gmail and forwarded separately

#### Test Case 6: Mixed Operations
1. Select 2 Gmail candidates
2. Select 2 forwarded candidates
3. Commit Gmail selections
4. **Verify:**
   - ✓ Only Gmail candidates commit
   - ✓ Forwarded selections remain active
5. Commit forwarded selections
6. **Verify:**
   - ✓ Forwarded candidates commit
   - ✓ All 4 total donations in profile

---

## File Change Summary

### Files to Modify:

1. **`src/components/Activity/Activity.js`**
   - Line 420-429: Update `transformedEmails` transform
   - Line 1290: Change `isGmailSource` check
   - Line 1560: Change `isGmailSource` check in `renderSearchResults`

### Files to Verify (No Changes):

1. **`src/services/ReceiptProcessor.js`** ✅ Already correct
2. **`src/workers/receiptWorker.js`** ✅ Already correct

---

## Implementation Steps (Sequential)

### Step 1: Update Frontend Transform ⏳
- [ ] Update `fetchForwardedEmails` transform (lines 420-429)
- [ ] Add index to map for unique jobId
- [ ] Test: Forward email, check console for correct structure

### Step 2: Update UI Logic ⏳
- [ ] Change `isGmailSource` check at line 1290
- [ ] Change `isGmailSource` check at line 1560
- [ ] Test: Forward email, verify full template renders

### Step 3: Test All Scenarios ⏳
- [ ] Run all test cases from Phase 5
- [ ] Verify Gmail candidates still work correctly
- [ ] Verify forwarded candidates use full template
- [ ] Verify bulk selection works for both

### Step 4: Edge Case Testing ⏳
- [ ] Test with 0 forwarded emails
- [ ] Test with mix of processed/unprocessed forwarded emails
- [ ] Test commit with missing contribution type
- [ ] Test commit with missing charity category
- [ ] Test delete/restore on forwarded candidates

---

## Rollback Plan

If issues arise:

### Quick Rollback:
```javascript
// Revert line 1290 to:
const isGmailSource = source === 'gmail';

// Revert line 1560 to:
const isGmailSource = entry.source === 'gmail';

// Revert lines 420-429 to original transform
```

### Git Rollback:
```bash
git diff src/components/Activity/Activity.js
git checkout src/components/Activity/Activity.js
```

---

## Success Criteria

✅ Forwarded emails render with full Gmail template
✅ Checkboxes work for bulk selection
✅ Bulk "Commit Selected" button works
✅ Can edit all fields (charity, amount, currency, date)
✅ Confidence scores display
✅ Job ID badge displays
✅ Gmail and forwarded sections remain separate
✅ Independent triggering (Gmail button vs Refresh Forwarded)
✅ No regression in Gmail candidate functionality

---

## Notes

- This plan does NOT merge forwarded emails into Gmail jobs - they remain separate sections
- They remain independently triggered (different buttons)
- They just USE THE SAME UI TEMPLATE for consistency
- Backend changes already completed, only frontend changes needed
- Minimal code changes required (3 locations, ~20 lines modified)

---

## Related Documentation

- Backend changes: `docs/BACKEND_IMPROVEMENTS_SUMMARY.md`
- False positive handling: `docs/FALSE_POSITIVE_REDUCTION_RECOMMENDATIONS.md`
- Wildlife Victoria fix: `docs/WILDLIFE_VICTORIA_MULTITRANSACTION_BUG.md`
