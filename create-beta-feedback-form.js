// Google Apps Script to create Do-Nation Beta Feedback Form
// Instructions:
// 1. Go to https://script.google.com or scripts.new
// 2. Delete the default code and paste this entire script
// 3. Click Save (💾) and name it "Create Do-Nation Form"
// 4. Click Run (▶️) and grant permissions when prompted
// 5. Click View → Logs to see the generated URLs

function createDoNationBetaFeedbackForm() {
  const form = FormApp.create('Do-Nation Beta Feedback')
    .setDescription('Report bugs or submit suggestions for the Do-Nation beta. Please avoid including sensitive data in screenshots.')
    .setIsQuiz(false);

  // Optional: collect email
  try {
    form.setCollectEmail(true);
  } catch (e) {
    console.log('Could not enable email collection');
  }

  // First, create the type selector without page navigation (we'll add it later)
  const typeItem = form.addMultipleChoiceItem()
    .setTitle('Type')
    .setRequired(true);

  // Core fields
  const contactEmail = form.addTextItem()
    .setTitle('Contact Email')
    .setHelpText('For follow-up on your report')
    .setRequired(true);

  const environment = form.addListItem()
    .setTitle('Environment')
    .setChoiceValues(['Production', 'Staging', 'Local'])
    .setRequired(true);

  const pageUrlItem = form.addTextItem()
    .setTitle('Page URL')
    .setHelpText('e.g., https://app.do-nation.space/... or the exact page where the issue occurred')
    .setRequired(true);

  const affectedArea = form.addCheckboxItem()
    .setTitle('Affected Area')
    .setChoiceValues(['Dashboard', 'Matching', 'Donations', 'Perks', 'Privacy Settings', 'Onboarding', 'Profiles', 'Other'])
    .setRequired(true);

  const briefTitle = form.addTextItem()
    .setTitle('Brief Title')
    .setHelpText('One-line summary')
    .setRequired(true);

  // Bug Section Page Break
  const bugPage = form.addPageBreakItem()
    .setTitle('Bug Report Details');

  const severity = form.addListItem()
    .setTitle('Severity')
    .setChoiceValues(['S0 Critical - System unusable', 'S1 Major - Core feature broken', 'S2 Minor - Feature partially broken', 'S3 Cosmetic - Visual/text issue'])
    .setRequired(true);

  const frequency = form.addListItem()
    .setTitle('Frequency')
    .setChoiceValues(['Always', 'Often', 'Sometimes', 'Once'])
    .setRequired(true);

  const expected = form.addParagraphTextItem()
    .setTitle('Expected Behavior')
    .setHelpText('What should happen?')
    .setRequired(true);

  const actual = form.addParagraphTextItem()
    .setTitle('Actual Behavior')
    .setHelpText('What actually happens?')
    .setRequired(true);

  const steps = form.addParagraphTextItem()
    .setTitle('Steps to Reproduce')
    .setHelpText('Provide numbered steps, e.g.:\n1. Go to Dashboard\n2. Click on...\n3. Observe that...')
    .setRequired(true);

  const browser = form.addTextItem()
    .setTitle('Browser & Version')
    .setHelpText('e.g., Chrome 126, Safari 17, Firefox 128')
    .setRequired(true);

  const os = form.addTextItem()
    .setTitle('Operating System & Version')
    .setHelpText('e.g., macOS 14.5, Windows 11, iOS 17.5')
    .setRequired(true);

  const workaround = form.addParagraphTextItem()
    .setTitle('Workaround (if any)')
    .setHelpText('Optional: Any temporary fix you found')
    .setRequired(false);

  // Try to add file upload (may not work for all Google accounts)
  try {
    const bugScreenshot = form.addFileUploadItem()
      .setTitle('Screenshots / Screen Recording (optional)')
      .setHelpText('Attach up to 5 files (PNG, JPG, MP4; max 25MB each). Please ensure no sensitive data is visible.')
      .setMaxFiles(5);
  } catch (e) {
    console.log('File uploads not available - adding text field for URLs instead');
    form.addTextItem()
      .setTitle('Screenshot/Recording URL (optional)')
      .setHelpText('If you have screenshots hosted elsewhere, paste the URL here')
      .setRequired(false);
  }

  // Suggestion Section Page Break
  const suggestionPage = form.addPageBreakItem()
    .setTitle('Suggestion Details');

  const problemGoal = form.addParagraphTextItem()
    .setTitle('Problem/Goal')
    .setHelpText('What problem does this solve or what goal does it achieve?')
    .setRequired(true);

  const proposed = form.addParagraphTextItem()
    .setTitle('Proposed Solution')
    .setHelpText('How would you implement this feature?')
    .setRequired(true);

  const impact = form.addListItem()
    .setTitle('Impact')
    .setChoiceValues(['High - Critical for many users', 'Medium - Important for some users', 'Low - Nice to have'])
    .setRequired(true);

  const beneficiaries = form.addCheckboxItem()
    .setTitle('Who Benefits')
    .setChoiceValues(['Individual donors', 'Charities', 'Business partners', 'Admin users', 'All users'])
    .setRequired(false);

  const related = form.addTextItem()
    .setTitle('Related Screens/Flows (optional)')
    .setHelpText('Which parts of the app would this affect?')
    .setRequired(false);

  // Try to add file upload for suggestions
  try {
    const suggestionScreenshot = form.addFileUploadItem()
      .setTitle('Mockups / Examples (optional)')
      .setHelpText('Attach any mockups or examples (up to 5 files)')
      .setMaxFiles(5);
  } catch (e) {
    console.log('File uploads not available for suggestions section');
  }

  // Final Section - Jump to this from both paths
  const finalPage = form.addPageBreakItem()
    .setTitle('Additional Information');

  const additionalInfo = form.addParagraphTextItem()
    .setTitle('Additional Context (optional)')
    .setHelpText('Any other relevant information')
    .setRequired(false);

  const consent = form.addCheckboxItem()
    .setTitle('Consent')
    .setHelpText('I confirm that no sensitive personal or financial data is included in this report or attachments.')
    .setChoiceValues(['I confirm'])
    .setRequired(true);

  // Now set up the navigation - Type determines which section to show
  // Both bug and suggestion pages should go to finalPage after their sections
  bugPage.setGoToPage(finalPage);
  suggestionPage.setGoToPage(finalPage);

  // Wire up the type selector with navigation
  typeItem.setChoices([
    typeItem.createChoice('Bug Report', bugPage),
    typeItem.createChoice('Feature Suggestion', suggestionPage)
  ]);

  // Set confirmation message
  form.setConfirmationMessage('Thank you for your feedback! We review all reports and will follow up via email if we need additional information.');

  // Create a prefilled URL with placeholder for page URL
  const response = form.createResponse();

  // Add sample responses to generate the prefilled URL
  try {
    response.withItemResponse(contactEmail.createResponse('beta.tester@example.com'));
    response.withItemResponse(environment.createResponse('Production'));
    response.withItemResponse(pageUrlItem.createResponse('REPLACE_PAGE_URL'));
    response.withItemResponse(briefTitle.createResponse('Sample Title'));
  } catch (e) {
    console.log('Error creating prefilled responses: ' + e);
  }

  const prefilledUrl = response.toPrefilledUrl();

  // Log all the important URLs
  console.log('\n==================================================');
  console.log('✅ FORM CREATED SUCCESSFULLY!');
  console.log('==================================================\n');
  console.log('📝 EDIT FORM URL (to modify the form):');
  console.log(form.getEditUrl());
  console.log('\n🔗 LIVE FORM URL (basic link):');
  console.log(form.getPublishedUrl());
  console.log('\n🎯 PREFILLED URL (USE THIS IN YOUR APP):');
  console.log(prefilledUrl);

  // Extract the entry ID for the Page URL field
  const match = prefilledUrl.match(/(entry\.[0-9]+)=REPLACE_PAGE_URL/);
  if (match) {
    console.log('\n📌 Page URL Entry ID: ' + match[1]);
    console.log('(This is the field ID for the Page URL - saved for reference)');
  }

  console.log('\n==================================================');
  console.log('NEXT STEPS:');
  console.log('1. Copy the PREFILLED URL above');
  console.log('2. Add it to your .env and .env.production files:');
  console.log('   REACT_APP_BUG_REPORT_FORM_URL="[paste the prefilled URL here]"');
  console.log('3. The app will automatically replace REPLACE_PAGE_URL with the current page');
  console.log('==================================================\n');

  return {
    editUrl: form.getEditUrl(),
    liveUrl: form.getPublishedUrl(),
    prefilledUrl: prefilledUrl,
    pageUrlEntryId: match ? match[1] : null
  };
}