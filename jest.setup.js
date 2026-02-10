// Add custom jest matchers from jest-dom
require('@testing-library/jest-dom');

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to suppress console output during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Setup DOM environment
beforeEach(() => {
  // Clear the DOM before each test
  document.body.innerHTML = '';
  document.head.innerHTML = '';
});

afterEach(() => {
  // Clean up after each test
  jest.clearAllMocks();
});
