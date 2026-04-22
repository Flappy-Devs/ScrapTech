// jest.setup.js
// Chạy trước mỗi test suite — khai báo các global mock cần thiết

// ── Fix Expo SDK 54 import.meta trong môi trường Jest/CommonJS ───────────────
// Expo's winter runtime dùng import.meta (ESM) nhưng Jest chạy CommonJS
// → cần định nghĩa global này trước khi bất kỳ module nào được load
if (typeof global.__ExpoImportMetaRegistry === 'undefined') {
  Object.defineProperty(global, '__ExpoImportMetaRegistry', {
    value: new Map(),
    writable: true,
    configurable: true,
  });
}

// ── Mock react-native-reanimated ─────────────────────────────────────────────
require('react-native-reanimated/mock');
