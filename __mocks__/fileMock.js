// __mocks__/fileMock.js
// Trả về string rỗng cho tất cả file tĩnh (ảnh, font, v.v.)
// để Jest không bị lỗi khi gặp require('*.png')
module.exports = 'test-file-stub';
