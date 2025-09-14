# Do-Nation Beta Feedback Form - Complete Setup Guide

## ✅ Current Status

The beta feedback system is now fully configured with:

1. **Google Form URL with prefilling** - Added to both `.env` and `.env.production`
2. **Automatic field prefilling** for:
   - Page URL (where the bug occurred)
   - User ID (if logged in)
   - User Email (if available)
   - Environment (auto-detected: Production/Staging/Local)
3. **Fallback behavior** - Uses mailto link if form URL not configured

## 📋 Form Requirements Checklist

### Required Fields ✅
- [x] **Type** - Bug Report or Feature Suggestion (with conditional logic)
- [x] **Contact Email** - For follow-up
- [x] **Environment** - Production/Staging/Local (auto-prefilled)
- [x] **Page URL** - Auto-prefilled from current page
- [x] **Brief Title** - One-line summary
- [x] **Affected Area(s)** - Multi-select checkboxes

### Bug-Specific Fields (shown only for Bug Reports) ✅
- [x] **Severity** - S0-S3 with clear definitions
- [x] **Frequency** - Always/Often/Sometimes/Once
- [x] **Expected Behavior** - With help text
- [x] **Actual Behavior** - With help text
- [x] **Steps to Reproduce** - With numbered format guide
- [x] **Browser & Version** - Required
- [x] **OS & Version** - Required
- [x] **Workaround** - Optional
- [x] **Console Errors** - Optional
- [x] **Screenshots/Recording** - File upload (max 5 files, 25MB each)

### Suggestion-Specific Fields (shown only for Suggestions) ✅
- [x] **Problem/Goal** - What it solves
- [x] **Proposed Solution** - Implementation details
- [x] **User Story** - Optional
- [x] **Impact** - High/Medium/Low with definitions
- [x] **Who Benefits** - Multi-select
- [x] **Related Features** - Optional
- [x] **Mockups/Examples** - File upload optional

### Additional Features ✅
- [x] **Privacy Consent** - Required checkbox
- [x] **Beta Agreement** - Understanding it's beta software
- [x] **Email Collection** - Enabled with receipts
- [x] **Response Spreadsheet** - Auto-created with triage tab
- [x] **Confirmation Message** - With help link
- [x] **Progress Bar** - Shows form completion
- [x] **Edit Responses** - Users can update their submissions

## 🚀 Setup Instructions

### Step 1: Create the Form (One-time setup)

1. Go to https://script.google.com
2. Delete the default code
3. Copy the entire content from `complete-beta-feedback-form.js`
4. Click Save and name it "Do-Nation Beta Form"
5. Click Run ▶️ and grant permissions
6. View → Logs to see generated URLs and entry IDs

### Step 2: Update Environment Variables

After running the script, you'll get a prefilled URL with placeholders. It should look like:
```
https://docs.google.com/forms/d/e/[FORM_ID]/viewform?usp=pp_url&entry.XXX=REPLACE_PAGE_URL&entry.YYY=REPLACE_USER_ID...
```

Update your environment files:

```bash
# .env (local development)
REACT_APP_BUG_REPORT_FORM_URL="[paste prefilled URL here]"

# .env.production
REACT_APP_BUG_REPORT_FORM_URL="[paste prefilled URL here]"
```

### Step 3: Deploy

- **Local**: Restart dev server (`npm start` or `yarn start`)
- **Production**: Deploy with updated environment variables
  - Vercel: Project Settings → Environment Variables
  - Netlify: Site Settings → Environment
  - Heroku/Render: Config Vars

## 🧪 Test Plan

### 1. Basic Functionality Tests

#### Test A: Page URL Prefilling
1. Navigate to different pages in your app:
   - `/dashboard`
   - `/settings`
   - `/search`
2. Click "Report a bug" from header/footer
3. **Verify**: Page URL field contains the correct URL

#### Test B: User Information Prefilling
1. Test as logged-in user
2. Click "Report a bug"
3. **Verify**:
   - User ID field contains user's ID (if available)
   - Email field prefilled (if available)
   - Environment correctly detected

#### Test C: Environment Detection
1. Test from `localhost:3000` → Should show "Local Development"
2. Test from `do-nation.space` → Should show "Production (do-nation.space)"
3. Test from staging URL → Should show "Staging"

### 2. Form Submission Tests

#### Test D: Bug Report Flow
1. Click "Report a bug"
2. Select "Bug Report" as type
3. **Verify**: Bug-specific fields appear
4. Fill all required fields
5. Submit
6. **Verify**: Confirmation message with help link

#### Test E: Feature Suggestion Flow
1. Click "Report a bug"
2. Select "Feature Suggestion" as type
3. **Verify**: Suggestion-specific fields appear
4. Fill all required fields
5. Submit
6. **Verify**: Confirmation message

### 3. File Upload Tests

#### Test F: Screenshot Upload
1. Create a bug report
2. Upload 1-3 screenshots (PNG/JPG)
3. **Verify**: Files upload successfully
4. Submit form
5. **Verify**: Files appear in response

#### Test G: Upload Limits
1. Try uploading 6 files → Should limit to 5
2. Try uploading >25MB file → Should reject
3. **Verify**: Error messages are clear

### 4. Edge Cases

#### Test H: Non-logged-in User
1. Access app without logging in
2. Click "Report a bug"
3. **Verify**: Form opens without user ID
4. **Verify**: Can still submit report

#### Test I: Mobile Responsiveness
1. Open form on mobile device
2. **Verify**: All fields accessible
3. **Verify**: File upload works
4. Submit form
5. **Verify**: Success on mobile

### 5. Data Validation Tests

#### Test J: Response Spreadsheet
1. Submit 2-3 test reports
2. Check Google Sheets responses
3. **Verify**:
   - All data captured correctly
   - Triage tab created
   - Timestamps accurate

## 📊 Entry IDs Reference

When you run the form creation script, it will output entry IDs like:

```
Email Entry ID: entry.1234567890
User ID Entry ID: entry.2345678901
Environment Entry ID: entry.3456789012
Page URL Entry ID: entry.1565189353
Title Entry ID: entry.4567890123
```

These are already configured in the code to be replaced automatically.

## 🔧 Troubleshooting

### Issue: Form not opening
- Check browser console for errors
- Verify `REACT_APP_BUG_REPORT_FORM_URL` is set
- Ensure no ad blockers are interfering

### Issue: Fields not prefilling
- Check that placeholders match exactly: `REPLACE_PAGE_URL`, `REPLACE_USER_ID`, etc.
- Verify entry IDs in URL match form fields
- Test with console.log to see generated URL

### Issue: File uploads require sign-in
- This is a Google Forms limitation for file uploads
- Consider using screenshot URL field as fallback
- Inform users in help text

### Issue: Responses not appearing in sheet
- Check form settings → Responses → Destination
- Verify spreadsheet permissions
- Check Google account quotas

## 🎯 Next Steps

1. **Run the form creation script** from `complete-beta-feedback-form.js`
2. **Copy the prefilled URL** from script logs
3. **Update the prefilled URL** in `.env.production` with all entry IDs
4. **Run through the test plan** to verify everything works
5. **Share the spreadsheet** with your team for triage
6. **Monitor submissions** and iterate based on feedback quality

## 📝 Maintenance

- Review form responses weekly
- Update severity definitions based on team consensus
- Add new affected areas as product grows
- Monitor completion rates and adjust required fields if needed
- Set up email notifications for S0/S1 bugs

## 🔗 Quick Links

- Form Edit URL: [Will be generated when you run the script]
- Response Spreadsheet: [Will be generated when you run the script]
- Help Page: https://do-nation.space/help