# False Positive Reduction - Recommendations

## Current State ✅

Your Activity UI already has excellent foundations:
- ✅ **Checkbox selection** - Users can select which candidates to commit
- ✅ **Delete functionality** - Individual donations can be removed
- ✅ **Edit capability** - Users can fix incorrect amounts/dates/charity names
- ✅ **Manual commit** - Nothing auto-saves; user must explicitly commit selections
- ✅ **Visual feedback** - Committed vs candidates clearly differentiated

**This is the right approach!** Some false positives are inevitable with AI extraction, so user control is essential.

---

## Two-Pronged Improvement Strategy

### **1. Backend Filtering - Reduce Obvious False Positives**

Update `/Users/josephheath/giving-dashboard/src/utils/entryGates.js` to catch more non-charitable patterns:

#### A) Add to COMMERCIAL_KEYWORDS (lines 14-34)
```javascript
const COMMERCIAL_KEYWORDS = [
  'subscription',
  'auto-renewing',
  'premium',
  'membership',
  'license',
  'software',
  'app store',
  'google play',
  'icloud',
  'copilot',
  'api usage',
  'cloud storage',
  'broadband',
  'internet',
  'utility',
  'council rates',
  'water bill',
  'electricity',

  // NEW ADDITIONS:
  'podcast',                    // Catches Sam Harris podcasts
  'patreon',                    // Creator subscriptions
  'kickstarter',
  'indiegogo',
  'crowdfunding',
  'gofundme',                   // Personal crowdfunding (not charity)
  'zoo membership',             // Zoos Victoria memberships
  'aquarium membership',
  'museum membership',
  'waking up',                  // Sam Harris app
  'sam harris',                 // Sam Harris Media
  'making sense'                // Sam Harris podcast name
];
```

#### B) Add to BLACKLIST (lines 4-7)
```javascript
const BLACKLIST = (
  process.env.GMAIL_ENTRY_GATE_BLACKLIST ||
  'labour party,the labour party,uk labour party,down dog,paypal,stripe,google,apple,microsoft,github,anthropic,openai,midjourney,perplexity,disney,spotify,youtube,netflix,chatgpt,claude,aussie broadband,city of stonnington,council,telstra,optus,sam harris media,transaction,patreon,kickstarter'
).split(',').map(item => item.trim().toLowerCase()).filter(Boolean);
```

#### C) Add Specific Pattern Detection for "Transaction" (new function)

After line 79, add:
```javascript
const isGenericTransaction = (candidate) => {
  const charity = (candidate.charity || '').toLowerCase().trim();
  const subject = (candidate.source?.subject || '').toLowerCase();

  // Catch generic "Transaction" with Sam Harris patterns
  if (charity === 'transaction') {
    if (subject.includes('sam harris') ||
        subject.includes('waking up') ||
        subject.includes('making sense')) {
      return true;
    }
  }

  return false;
};
```

Then add check in `applyEntryGates` function (after line 128):
```javascript
// Check for generic transaction patterns
if (isGenericTransaction(candidate)) {
  stats.commercialKeyword += 1;
  recordRejection(rejected, candidate, 'commercialKeyword', 'generic transaction pattern');
  continue;
}
```

---

### **2. Frontend UX - Make False Positive Management Easier**

#### A) Add Bulk Actions

**File:** `/Users/josephheath/donation-dashboard/src/components/Activity/Activity.js`

Add bulk operations to make managing large candidate lists easier:

```javascript
// Add near line 153
const [bulkMode, setBulkMode] = useState(false);

// Add handler
const handleSelectAll = useCallback((jobId) => {
  const jobCandidates = searchHistory.find(h => h.jobId === jobId)?.candidates || [];
  setSelectedCandidates(prev => ({
    ...prev,
    [jobId]: jobCandidates.reduce((acc, c) => ({ ...acc, [c.id]: true }), {})
  }));
}, [searchHistory]);

const handleDeselectAll = useCallback((jobId) => {
  setSelectedCandidates(prev => ({
    ...prev,
    [jobId]: {}
  }));
}, []);

const handleBulkDelete = useCallback((jobId) => {
  const selected = Object.keys(selectedCandidates[jobId] || {});
  selected.forEach(candidateId => {
    setDonationStatuses(prev => ({
      ...prev,
      [candidateId]: { deleted: true, timestamp: Date.now() }
    }));
  });
  clearSelectionsForJob(jobId);
}, [selectedCandidates, clearSelectionsForJob]);
```

#### B) Add Quick Filter/Sort

Add UI controls to help users find false positives:

```javascript
// Add state
const [sortBy, setSortBy] = useState('date'); // 'date', 'amount', 'charity', 'confidence'
const [filterLowConfidence, setFilterLowConfidence] = useState(false);

// Add sorting logic
const sortCandidates = useCallback((candidates) => {
  return [...candidates].sort((a, b) => {
    switch (sortBy) {
      case 'confidence':
        return (b.confidence || 0) - (a.confidence || 0);
      case 'amount':
        return parseFloat(b.amount || 0) - parseFloat(a.amount || 0);
      case 'charity':
        return (a.charity || '').localeCompare(b.charity || '');
      case 'date':
      default:
        return new Date(b.date || 0) - new Date(a.date || 0);
    }
  });
}, [sortBy]);

// Add UI controls (in renderSearchResults)
<div className={styles.candidateControls}>
  <button onClick={() => handleSelectAll(entry.jobId)}>Select All</button>
  <button onClick={() => handleDeselectAll(entry.jobId)}>Deselect All</button>
  <button onClick={() => handleBulkDelete(entry.jobId)}>Delete Selected</button>

  <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
    <option value="date">Sort by Date</option>
    <option value="confidence">Sort by Confidence</option>
    <option value="amount">Sort by Amount</option>
    <option value="charity">Sort by Charity</option>
  </select>

  <label>
    <input
      type="checkbox"
      checked={filterLowConfidence}
      onChange={e => setFilterLowConfidence(e.target.checked)}
    />
    Show only low confidence (&lt;70%)
  </label>
</div>
```

#### C) Add Confidence Score Highlighting

Make low-confidence candidates visually obvious:

```javascript
// In renderDonationCard, add class based on confidence
const confidenceClass = donation.confidence >= 0.8 ? styles.highConfidence :
                        donation.confidence >= 0.6 ? styles.mediumConfidence :
                        styles.lowConfidence;

// Add to className
className={`${styles.card} ${baseCardClass} ${confidenceClass}`}

// Display confidence score
{donation.confidence !== undefined && (
  <span className={styles.confidenceBadge}>
    {Math.round(donation.confidence * 100)}% confidence
  </span>
)}
```

#### D) Add "Quick Review" Mode

Add a dedicated mode for reviewing uncertain candidates:

```javascript
const [reviewMode, setReviewMode] = useState(false);

// Filter to only uncertain candidates
const uncertainCandidates = useMemo(() => {
  if (!reviewMode) return [];

  return searchHistory.flatMap(job =>
    (job.candidates || []).filter(c =>
      c.confidence < 0.7 ||
      (c.charity || '').toLowerCase().includes('transaction') ||
      !c.receiptNumber
    )
  );
}, [searchHistory, reviewMode]);

// UI toggle
<button onClick={() => setReviewMode(!reviewMode)}>
  {reviewMode ? 'Exit Review Mode' : 'Review Uncertain Candidates'}
  ({uncertainCandidates.length} to review)
</button>
```

---

## Specific False Positive Fixes

### Current False Positives from MISSING_DONATIONS.txt:

1. **Sam Harris / "Transaction" x7** ❌ FIXED by:
   - Add "sam harris", "transaction", "podcast" to blacklists
   - Add `isGenericTransaction` pattern check

2. **Zoos Victoria x2** - Likely memberships ❓ Partial fix:
   - Add "zoo membership" to COMMERCIAL_KEYWORDS
   - Will only catch if subject/body mentions "membership"
   - May need manual deletion if receipts don't mention membership

3. **Colin's crowdfunding (£82k)** ❌ FIXED by:
   - Add "crowdfunding", "gofundme" to COMMERCIAL_KEYWORDS
   - Personal crowdfunding isn't charitable giving

4. **NBCF 2024 & 2025** - User says shouldn't exist ❓
   - Need to investigate if these emails actually exist
   - If test data, delete from Gmail
   - If actual emails, check why they're extracting

---

## Priority Recommendations

### **High Priority (Do Now)**
1. ✅ Add Sam Harris patterns to blacklists (eliminates 7 false positives)
2. ✅ Add crowdfunding/podcast keywords to COMMERCIAL_KEYWORDS
3. ✅ Add bulk select/deselect buttons (huge UX improvement)
4. ✅ Display confidence scores visually

### **Medium Priority (Next Sprint)**
1. Add sorting/filtering controls
2. Add "Review Mode" for uncertain candidates
3. Add confidence-based highlighting
4. Investigate NBCF 2024/2025 emails

### **Low Priority (Nice to Have)**
1. Machine learning to learn from user deletions
2. "Not a charity" feedback mechanism
3. Suggested blacklist additions based on patterns
4. Export rejected candidates for analysis

---

## Expected Impact

### Before Improvements:
- 63 candidates shown
- ~10 false positives (16% false positive rate)
- Manual review of all 63 required
- No easy way to bulk manage

### After Backend Improvements:
- ~55 candidates shown (8 fewer)
- ~3 false positives (5% false positive rate)
- Sam Harris, crowdfunding auto-filtered

### After Frontend Improvements:
- Sort by confidence → review low-confidence first
- Bulk select → delete multiple in one action
- Quick review mode → see only uncertain ones
- 50% faster review time

---

## Testing Approach

1. **Backend Changes:**
   ```bash
   # Restart worker
   pm2 restart gmail-worker

   # Trigger fresh scrape
   # Check logs for rejected counts
   pm2 logs gmail-worker | grep "commercialKeyword"
   ```

2. **Verify Sam Harris Filtered:**
   - Should see 7 fewer candidates
   - Check rejection stats show "commercialKeyword: 7"

3. **Frontend Changes:**
   - Test select all/deselect all
   - Test bulk delete
   - Test sorting by confidence
   - Verify low-confidence items highlighted

---

## Alternative Approach: Machine Learning

If false positives remain high, consider:

1. **Supervised Learning:**
   - Track user deletions
   - Extract features: charity name, confidence, amount, has receipt, etc.
   - Train binary classifier: "charity" vs "not charity"
   - Auto-flag high-risk candidates

2. **Pattern Mining:**
   - Analyze deleted candidates for common patterns
   - Auto-suggest new blacklist entries
   - "Users often delete candidates with charity='Transaction', add to blacklist?"

3. **Confidence Calibration:**
   - Track commit rate per confidence level
   - Adjust threshold: if <50% of 0.6-0.7 confidence get committed, raise threshold to 0.7

**Implementation complexity:** High
**Expected improvement:** 5-10% additional false positive reduction
**Recommended:** Only if manual curation becomes too burdensome

---

## Conclusion

**Your current UI approach is excellent** - manual selection with delete capability is the right pattern for AI-assisted data extraction.

**Biggest quick wins:**
1. Backend blacklist updates → eliminate 7-10 false positives automatically
2. Bulk select/delete buttons → 50% faster manual review
3. Confidence score display → prioritize review of uncertain items

**Long-term:**
- Consider ML if false positive rate stays >10%
- Add user feedback loops to continuously improve filtering
- Monitor rejection stats to identify new patterns to blacklist
