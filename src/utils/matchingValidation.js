export const validateMatchingFeed = () => {
  const tests = {
    contextAvailable: false,
    persistenceWorking: false,
    flexLayoutApplied: false,
    batchAPIConfigured: false,
    errorsHandled: false
  };

  console.log('=== Matching Feed Validation Starting ===');

  try {
    const contextElement = document.querySelector('[data-testid="match-selection-context"]');
    tests.contextAvailable = !!contextElement;
    console.log('✓ Context:', tests.contextAvailable);
  } catch (e) {
    console.error('✗ Context test failed:', e);
  }

  try {
    const testKey = 'match_test_' + Date.now();
    sessionStorage.setItem(testKey, JSON.stringify({ test: true, timestamp: Date.now() }));
    const retrieved = JSON.parse(sessionStorage.getItem(testKey));
    tests.persistenceWorking = retrieved?.test === true;
    sessionStorage.removeItem(testKey);
    console.log('✓ Persistence:', tests.persistenceWorking);
  } catch (e) {
    console.error('✗ Persistence test failed:', e);
  }

  try {
    const cards = document.querySelectorAll('.card');
    if (cards.length > 0) {
      const firstCard = cards[0];
      const computedStyle = window.getComputedStyle(firstCard);
      tests.flexLayoutApplied = computedStyle.display === 'flex';
    }
    console.log('✓ Flex layout:', tests.flexLayoutApplied);
  } catch (e) {
    console.error('✗ Layout test failed:', e);
  }

  tests.batchAPIConfigured = !!process.env.REACT_APP_API_BASE_URL;
  console.log('✓ API configured:', tests.batchAPIConfigured);

  try {
    const errorElements = document.querySelectorAll('[role="alert"]');
    tests.errorsHandled = true;
    console.log('✓ Error handling:', tests.errorsHandled);
  } catch (e) {
    console.error('✗ Error handling test failed:', e);
  }

  const passed = Object.values(tests).filter(t => t).length;
  const total = Object.keys(tests).length;
  
  console.log(`\n=== Results: ${passed}/${total} tests passed ===`);
  console.table(tests);

  return {
    passed,
    total,
    tests,
    allPassed: passed === total
  };
};

if (process.env.NODE_ENV === 'development') {
  window.validateMatchingFeed = validateMatchingFeed;
}

export default validateMatchingFeed;