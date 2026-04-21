// jest.setup.js
// Chạy trước mỗi test suite — khai báo các global mock cần thiết

// Mock react-native-reanimated để tránh lỗi "Reanimated 2" trong môi trường test
require('react-native-reanimated/mock');
