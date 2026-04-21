module.exports = {
  preset: "jest-expo",

  // ── Bỏ qua transform cho các native module ───────────────────────────────
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|expo-router)"
  ],

  // ── Alias @ → thư mục gốc project ───────────────────────────────────────
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    // File tĩnh (ảnh, font, v.v.) → trả về string giả
    "\\.(png|jpg|jpeg|gif|webp|svg|ttf|otf|woff|woff2)$": "<rootDir>/__mocks__/fileMock.js"
  },

  // ── Các file chạy trước mỗi test suite ──────────────────────────────────
  setupFiles: ["<rootDir>/jest.setup.js"],

  // ── Coverage report (lcov cho SonarCloud, text cho terminal) ────────────
  collectCoverage: false,          // chỉ bật khi truyền flag --coverage
  collectCoverageFrom: [
    "app/**/*.{ts,tsx}",
    "src/**/*.{ts,tsx}",
    "!app/_layout.tsx",            // layout không cần đo coverage
    "!**/*.d.ts",
    "!**/node_modules/**"
  ],
  coverageReporters: ["lcov", "text", "text-summary"],
  coverageDirectory: "coverage",
};
