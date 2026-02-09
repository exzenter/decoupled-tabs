module.exports = {
	testEnvironment: 'jsdom',
	setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
	testMatch: [
		'**/__tests__/**/*.js',
		'**/?(*.)+(spec|test).js'
	],
	moduleNameMapper: {
		'\\.(css|scss)$': '<rootDir>/__mocks__/styleMock.js'
	},
	collectCoverageFrom: [
		'src/**/*.js',
		'!src/**/index.js',
		'!src/**/*.test.js',
		'!src/**/*.spec.js'
	],
	coverageThreshold: {
		global: {
			branches: 80,
			functions: 80,
			lines: 80,
			statements: 80
		}
	},
	transform: {
		'^.+\\.js$': 'babel-jest'
	},
	testTimeout: 10000
};
