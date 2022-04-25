import path from "node:path";
import createEsmUtils from "esm-utils";
import installPrettier from "./tests/config/install-prettier.js";

const { dirname: PROJECT_ROOT } = createEsmUtils(import.meta);
const isProduction = process.env.NODE_ENV === "production";
const ENABLE_CODE_COVERAGE = Boolean(process.env.ENABLE_CODE_COVERAGE);
const TEST_STANDALONE = Boolean(process.env.TEST_STANDALONE);
const INSTALL_PACKAGE = Boolean(process.env.INSTALL_PACKAGE);
const SKIP_TESTS_WITH_NEW_SYNTAX = process.versions.node.startsWith("12.");

let PRETTIER_DIR = isProduction
  ? path.join(PROJECT_ROOT, "dist")
  : PROJECT_ROOT;
if (INSTALL_PACKAGE || (isProduction && !TEST_STANDALONE)) {
  PRETTIER_DIR = installPrettier(PRETTIER_DIR);
}
process.env.PRETTIER_DIR = PRETTIER_DIR;

const testPathIgnorePatterns = [];
if (TEST_STANDALONE) {
  testPathIgnorePatterns.push("<rootDir>/tests/integration/");
}
if (!isProduction) {
  // Only test bundles for production
  testPathIgnorePatterns.push(
    "<rootDir>/tests/integration/__tests__/bundle.js"
  );
}
if (SKIP_TESTS_WITH_NEW_SYNTAX) {
  testPathIgnorePatterns.push(
    "<rootDir>/tests/integration/__tests__/help-options.js"
  );
}

const config = {
  projects: [
    "<rootDir>/jest-format-test.config.mjs",
    isProduction && "<rootDir>/jest-integration-test.config.mjs",
  ].filter(Boolean),
  setupFiles: ["<rootDir>/tests/config/setup.js"],
  snapshotSerializers: [
    "jest-snapshot-serializer-raw",
    "jest-snapshot-serializer-ansi",
  ],
  snapshotFormat: {
    escapeString: false,
  },
  testRegex: "jsfmt\\.spec\\.js$|__tests__/.*\\.js$",
  testPathIgnorePatterns,
  collectCoverage: ENABLE_CODE_COVERAGE,
  collectCoverageFrom: ["<rootDir>/src/**/*.js", "<rootDir>/bin/**/*.js"],
  coveragePathIgnorePatterns: [
    "<rootDir>/src/standalone.js",
    "<rootDir>/src/document/doc-debug.js",
  ],
  coverageReporters: ["text", "lcov"],
  moduleNameMapper: {
    "prettier-local": "<rootDir>/tests/config/prettier-entry.js",
    "prettier-standalone": "<rootDir>/tests/config/require-standalone.cjs",
  },
  modulePathIgnorePatterns: [
    "<rootDir>/dist",
    "<rootDir>/website",
    "<rootDir>/scripts/release",
  ],
  transform: {},
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],
};

export default config;
