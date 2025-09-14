// Complete Google Apps Script for Do-Nation Beta Feedback Form
// This script creates a fully-featured bug report form with all requirements
//
// Instructions:
// 1. Go to https://script.google.com
// 2. Delete default code and paste this entire script
// 3. Save and name it "Do-Nation Beta Form"
// 4. Run createCompleteBetaForm function
// 5. Grant permissions when prompted
// 6. View → Logs to get all URLs and entry IDs

function createCompleteBetaForm() {
  // Create the form
  const form = FormApp.create('Do-Nation Beta Feedback')
    .setDescription('Help us improve Do-Nation by reporting bugs or suggesting features. Your feedback is invaluable during our beta phase.')
    .setProgressBar(true)
    .setShowLinkToRespondAgain(true)
    .setAllowResponseEdits(true);

  // Enable email collection and send receipt
  form.setCollectEmail(true);
  form.setRequireLogin(false); // Allow external testers

  // ===========================================
  // SECTION 1: CORE INFORMATION (Always shown)
  // ===========================================

  form.addSectionHeaderItem()
    .setTitle('Report Information')
    .setHelpText('Basic information about your report');

  // Type selector (determines conditional sections)
  const typeItem = form.addMultipleChoiceItem()
    .setTitle('Report Type')
    .setHelpText('Are you reporting a bug or suggesting a feature?')
    .setRequired(true);

  // Contact Email
  const contactEmail = form.addTextItem()
    .setTitle('Contact Email')
    .setHelpText('We may contact you for clarification')
    .setRequired(true);

  // User ID (optional - for prefilling)
  const userId = form.addTextItem()
    .setTitle('User ID (optional)')
    .setHelpText('Your Do-Nation user ID if known')
    .setRequired(false);

  // Environment
  const environment = form.addListItem()
    .setTitle('Environment')
    .setHelpText('Where did you encounter this?')
    .setChoiceValues(['Production (do-nation.space)', 'Staging', 'Local Development'])
    .setRequired(true);

  // Page URL
  const pageUrl = form.addTextItem()
    .setTitle('Page URL')
    .setHelpText('The exact page where this occurred (auto-filled when using in-app link)')
    .setRequired(true);

  // Affected Area
  const affectedArea = form.addCheckboxItem()
    .setTitle('Affected Area(s)')
    .setHelpText('Select all that apply')
    .setChoiceValues([
      'Dashboard',
      'Donation Tracking',
      'Email Integration',
      'Matching System',
      'Perks',
      'Privacy Settings',
      'User Profile',
      'Business Features',
      'Charity Features',
      'Authentication/Login',
      'Search',
      'Other'
    ])
    .setRequired(true);

  // Brief Title
  const briefTitle = form.addTextItem()
    .setTitle('Brief Title')
    .setHelpText('One-line summary (e.g., "Login button not working on mobile")')
    .setRequired(true);

  // ===========================================
  // SECTION 2: BUG REPORT DETAILS
  // ===========================================

  const bugSection = form.addPageBreakItem()
    .setTitle('Bug Report Details')
    .setHelpText('Please provide detailed information about the bug');

  // Severity with definitions
  const severity = form.addListItem()
    .setTitle('Severity')
    .setHelpText('How severe is this issue?')
    .setChoiceValues([
      'S0 - Critical: System unusable, data loss, security issue',
      'S1 - Major: Core feature broken, no workaround',
      'S2 - Minor: Feature impaired, workaround exists',
      'S3 - Cosmetic: Visual/text issue, no functional impact'
    ])
    .setRequired(true);

  // Frequency
  const frequency = form.addListItem()
    .setTitle('Frequency')
    .setHelpText('How often does this occur?')
    .setChoiceValues([
      'Always (100% reproducible)',
      'Often (>50% of the time)',
      'Sometimes (<50% of the time)',
      'Once (single occurrence)'
    ])
    .setRequired(true);

  // Expected Behavior
  const expected = form.addParagraphTextItem()
    .setTitle('Expected Behavior')
    .setHelpText('What should happen? Be specific about the desired outcome')
    .setRequired(true);

  // Actual Behavior
  const actual = form.addParagraphTextItem()
    .setTitle('Actual Behavior')
    .setHelpText('What actually happens? Include any error messages')
    .setRequired(true);

  // Steps to Reproduce
  const steps = form.addParagraphTextItem()
    .setTitle('Steps to Reproduce')
    .setHelpText('Numbered steps to recreate the issue:\n1. Go to...\n2. Click on...\n3. Observe that...')
    .setRequired(true);

  // Browser & Version
  const browser = form.addTextItem()
    .setTitle('Browser & Version')
    .setHelpText('e.g., Chrome 120, Safari 17.2, Firefox 121, Edge 120')
    .setRequired(true);

  // Operating System
  const os = form.addTextItem()
    .setTitle('Operating System')
    .setHelpText('e.g., macOS 14.2, Windows 11, iOS 17.2, Android 14')
    .setRequired(true);

  // Workaround
  const workaround = form.addParagraphTextItem()
    .setTitle('Workaround (if any)')
    .setHelpText('Have you found a temporary way around this issue?')
    .setRequired(false);

  // Console Errors
  const consoleErrors = form.addParagraphTextItem()
    .setTitle('Console Errors (optional)')
    .setHelpText('If you can access browser console (F12), paste any red error messages')
    .setRequired(false);

  // Bug Screenshots
  try {
    const bugScreenshots = form.addFileUploadItem()
      .setTitle('Screenshots/Recording')
      .setHelpText('Upload screenshots or screen recording (max 5 files, 25MB each). Supported: PNG, JPG, GIF, MP4')
      .setMaxFiles(5)
      .setMaxFileSize(25 * 1024 * 1024); // 25MB
  } catch (e) {
    // Fallback if file upload isn't available
    form.addTextItem()
      .setTitle('Screenshot URL (optional)')
      .setHelpText('Link to screenshots if file upload unavailable')
      .setRequired(false);
  }

  // ===========================================
  // SECTION 3: FEATURE SUGGESTION DETAILS
  // ===========================================

  const suggestionSection = form.addPageBreakItem()
    .setTitle('Feature Suggestion Details')
    .setHelpText('Tell us about your idea to improve Do-Nation');

  // Problem Statement
  const problem = form.addParagraphTextItem()
    .setTitle('Problem/Goal')
    .setHelpText('What problem does this solve? What goal does it achieve?')
    .setRequired(true);

  // Proposed Solution
  const solution = form.addParagraphTextItem()
    .setTitle('Proposed Solution')
    .setHelpText('How would you implement this feature? Be as detailed as possible')
    .setRequired(true);

  // User Story
  const userStory = form.addParagraphTextItem()
    .setTitle('User Story (optional)')
    .setHelpText('As a [type of user], I want [feature] so that [benefit]')
    .setRequired(false);

  // Impact
  const impact = form.addListItem()
    .setTitle('Impact')
    .setHelpText('How important is this feature?')
    .setChoiceValues([
      'High - Critical for my use of Do-Nation',
      'Medium - Would significantly improve my experience',
      'Low - Nice to have but not essential'
    ])
    .setRequired(true);

  // Who Benefits
  const beneficiaries = form.addCheckboxItem()
    .setTitle('Who Benefits?')
    .setHelpText('Select all that apply')
    .setChoiceValues([
      'Individual donors',
      'Charities',
      'Business partners',
      'Admin users',
      'All users'
    ])
    .setRequired(true);

  // Related Features
  const relatedFeatures = form.addTextItem()
    .setTitle('Related Features/Screens')
    .setHelpText('Which parts of the app would this affect?')
    .setRequired(false);

  // Suggestion Mockups
  try {
    const suggestionMockups = form.addFileUploadItem()
      .setTitle('Mockups/Examples (optional)')
      .setHelpText('Upload any mockups, sketches, or examples (max 5 files, 25MB each)')
      .setMaxFiles(5)
      .setMaxFileSize(25 * 1024 * 1024);
  } catch (e) {
    form.addTextItem()
      .setTitle('Mockup URL (optional)')
      .setHelpText('Link to mockups if file upload unavailable')
      .setRequired(false);
  }

  // ===========================================
  // SECTION 4: ADDITIONAL INFORMATION (Both paths converge here)
  // ===========================================

  const additionalSection = form.addPageBreakItem()
    .setTitle('Additional Information')
    .setHelpText('Final details and consent');

  // Additional Context
  const additionalContext = form.addParagraphTextItem()
    .setTitle('Additional Context (optional)')
    .setHelpText('Any other information that might be helpful')
    .setRequired(false);

  // Previous Reports
  const previousReports = form.addTextItem()
    .setTitle('Related Report IDs (optional)')
    .setHelpText('If this relates to previous reports, enter their IDs')
    .setRequired(false);

  // Privacy Consent (Required)
  const consent = form.addCheckboxItem()
    .setTitle('Data Privacy Consent')
    .setHelpText('Required for form submission')
    .setChoiceValues([
      'I confirm no sensitive personal or financial data is included in this report or attachments'
    ])
    .setRequired(true);

  // Beta Tester Agreement
  const betaAgreement = form.addCheckboxItem()
    .setTitle('Beta Testing Agreement')
    .setChoiceValues([
      'I understand this is beta software and may contain bugs'
    ])
    .setRequired(true);

  // ===========================================
  // CONFIGURE CONDITIONAL LOGIC
  // ===========================================

  // Bug section goes to Additional section after completion
  bugSection.setGoToPage(additionalSection);

  // Suggestion section goes to Additional section after completion
  suggestionSection.setGoToPage(additionalSection);

  // Type selector determines which section to show
  typeItem.setChoices([
    typeItem.createChoice('Bug Report', bugSection),
    typeItem.createChoice('Feature Suggestion', suggestionSection)
  ]);

  // ===========================================
  // CONFIGURE FORM SETTINGS
  // ===========================================

  // Set confirmation message with link
  form.setConfirmationMessage(
    'Thank you for your feedback! We review all reports within 24-48 hours.\n\n' +
    'Your report has been logged and you should receive an email confirmation.\n\n' +
    'Need immediate help? Visit our Help Center: https://do-nation.space/help\n\n' +
    'Report ID will be sent to your email for tracking.'
  );

  // ===========================================
  // CREATE RESPONSE SPREADSHEET
  // ===========================================

  try {
    // Create a spreadsheet for responses
    const sheet = SpreadsheetApp.create('Do-Nation Beta Feedback Responses');
    form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());

    // Add headers for triage columns
    const triageSheet = sheet.getActiveSheet();
    triageSheet.setName('Raw Responses');

    // Create a triage sheet
    const triageTab = sheet.insertSheet('Triage');
    triageTab.getRange(1, 1, 1, 7).setValues([[
      'Report ID', 'Type', 'Severity/Impact', 'Title', 'Status', 'Assigned To', 'Notes'
    ]]);
    triageTab.getRange(1, 1, 1, 7).setFontWeight('bold');

    console.log('Response Spreadsheet URL: ' + sheet.getUrl());
  } catch (e) {
    console.log('Could not create response spreadsheet: ' + e);
  }

  // ===========================================
  // GENERATE PREFILLED URLs
  // ===========================================

  // Create a prefilled response for URL generation
  const response = form.createResponse();

  try {
    // Add sample responses with placeholders
    response.withItemResponse(contactEmail.createResponse('REPLACE_EMAIL'));
    response.withItemResponse(userId.createResponse('REPLACE_USER_ID'));
    response.withItemResponse(environment.createResponse('REPLACE_ENVIRONMENT'));
    response.withItemResponse(pageUrl.createResponse('REPLACE_PAGE_URL'));
    response.withItemResponse(briefTitle.createResponse('REPLACE_TITLE'));
  } catch (e) {
    console.log('Error creating prefilled response: ' + e);
  }

  const prefilledUrl = response.toPrefilledUrl();

  // ===========================================
  // EXTRACT ENTRY IDs
  // ===========================================

  const entryIds = {};

  // Extract all entry IDs from the prefilled URL
  const patterns = {
    email: /entry\.([0-9]+)=REPLACE_EMAIL/,
    userId: /entry\.([0-9]+)=REPLACE_USER_ID/,
    environment: /entry\.([0-9]+)=REPLACE_ENVIRONMENT/,
    pageUrl: /entry\.([0-9]+)=REPLACE_PAGE_URL/,
    title: /entry\.([0-9]+)=REPLACE_TITLE/
  };

  for (const [field, pattern] of Object.entries(patterns)) {
    const match = prefilledUrl.match(pattern);
    if (match) {
      entryIds[field] = match[1];
    }
  }

  // ===========================================
  // LOG ALL IMPORTANT INFORMATION
  // ===========================================

  console.log('\n================================================');
  console.log('✅ FORM CREATED SUCCESSFULLY!');
  console.log('================================================\n');

  console.log('📝 FORM URLS:');
  console.log('Edit Form: ' + form.getEditUrl());
  console.log('Live Form: ' + form.getPublishedUrl());
  console.log('Short URL: ' + form.shortenFormUrl(form.getPublishedUrl()));

  console.log('\n🎯 PREFILLED URL FOR YOUR APP:');
  console.log(prefilledUrl);

  console.log('\n📌 ENTRY IDs FOR PREFILLING:');
  console.log('Email Entry ID: entry.' + (entryIds.email || 'NOT_FOUND'));
  console.log('User ID Entry ID: entry.' + (entryIds.userId || 'NOT_FOUND'));
  console.log('Environment Entry ID: entry.' + (entryIds.environment || 'NOT_FOUND'));
  console.log('Page URL Entry ID: entry.' + (entryIds.pageUrl || 'NOT_FOUND'));
  console.log('Title Entry ID: entry.' + (entryIds.title || 'NOT_FOUND'));

  console.log('\n================================================');
  console.log('NEXT STEPS:');
  console.log('1. Copy the prefilled URL above');
  console.log('2. Update your .env files with this URL');
  console.log('3. Share the Entry IDs with your developer');
  console.log('4. Test the form from your app');
  console.log('================================================\n');

  // Return data for programmatic use
  return {
    editUrl: form.getEditUrl(),
    liveUrl: form.getPublishedUrl(),
    prefilledUrl: prefilledUrl,
    entryIds: entryIds
  };
}

// Helper function to get form responses summary
function getFormResponsesSummary() {
  const forms = FormApp.openById('YOUR_FORM_ID'); // Replace with actual form ID
  const responses = forms.getResponses();

  console.log('Total Responses: ' + responses.length);

  // Analyze response patterns
  const bugCount = responses.filter(r => {
    const items = r.getItemResponses();
    return items[0] && items[0].getResponse() === 'Bug Report';
  }).length;

  console.log('Bug Reports: ' + bugCount);
  console.log('Feature Suggestions: ' + (responses.length - bugCount));
}