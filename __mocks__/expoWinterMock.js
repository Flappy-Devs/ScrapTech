// __mocks__/expoWinterMock.js
// Mock toàn bộ Expo "winter" runtime để tránh lỗi import.meta trong Jest
// Expo dùng import.meta (ESM) để polyfill các global như structuredClone
// nhưng Jest chạy CommonJS → xung đột → mock sạch module này đi
module.exports = {};
