# 📋 Hướng Dẫn Setup Jest · GitHub Actions · SonarCloud
### Dự án: ScrapTech Mobile (React Native / Expo)

---

## Mục lục

1. [Tổng quan kiến trúc CI/CD](#1-tổng-quan-kiến-trúc-cicd)
2. [Phần 1 — Cấu hình Jest](#2-phần-1--cấu-hình-jest)
3. [Phần 2 — Viết Unit Test](#3-phần-2--viết-unit-test)
4. [Phần 3 — GitHub Actions](#4-phần-3--github-actions)
5. [Phần 4 — SonarCloud](#5-phần-4--sonarcloud)
6. [Kết quả đạt được](#6-kết-quả-đạt-được)
7. [Các lỗi thường gặp & cách fix](#7-các-lỗi-thường-gặp--cách-fix)

---

## 1. Tổng quan kiến trúc CI/CD

```
Push / PR lên GitHub
        │
        ▼
① Checkout code (fetch-depth: 0)
        │
        ▼
② npm install --legacy-peer-deps
        │
        ▼
③ npx jest --coverage  →  tạo coverage/lcov.info
        │
        ▼
④ Upload artifact (xem trên GitHub tab Actions)
        │
        ▼
⑤ SonarCloud Scan  (đọc lcov.info + phân tích chất lượng code)
```

**Kết quả:** Mỗi lần push → test tự chạy → SonarCloud phân tích → báo cáo chất lượng code.

---

## 2. Phần 1 — Cấu hình Jest

### 2.1 Cài dependencies cần thiết

```bash
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
```

> **Lưu ý:** Dùng `--legacy-peer-deps` nếu gặp peer dependency conflict (phổ biến với Expo + React 19).

### 2.2 Tạo `jest.config.js`

```js
// jest.config.js
module.exports = {
  preset: "jest-expo",

  // Bỏ qua transform cho các native module
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|expo-router)"
  ],

  moduleNameMapper: {
    // ⚠️ Fix lỗi Expo SDK 54+ import.meta trong Jest/CommonJS
    "^expo/src/winter(.*)$": "<rootDir>/__mocks__/expoWinterMock.js",
    // Alias @ → thư mục gốc project
    "^@/(.*)$": "<rootDir>/$1",
    // File tĩnh (ảnh, font) → trả về string giả
    "\\.(png|jpg|jpeg|gif|webp|svg|ttf|otf|woff|woff2)$": "<rootDir>/__mocks__/fileMock.js"
  },

  // File chạy trước mỗi test suite
  setupFiles: ["<rootDir>/jest.setup.js"],

  // Coverage report
  collectCoverage: false,          // chỉ bật khi truyền --coverage
  collectCoverageFrom: [
    "app/**/*.{ts,tsx}",
    "src/**/*.{ts,tsx}",
    "!app/_layout.tsx",
    "!**/*.d.ts",
    "!**/node_modules/**"
  ],
  coverageReporters: ["lcov", "text", "text-summary"],
  coverageDirectory: "coverage",
};
```

### 2.3 Tạo `jest.setup.js`

```js
// jest.setup.js

// ── Fix Expo SDK 54 import.meta trong môi trường Jest/CommonJS ───────
// Expo's winter runtime dùng import.meta (ESM) nhưng Jest chạy CommonJS
if (typeof global.__ExpoImportMetaRegistry === 'undefined') {
  Object.defineProperty(global, '__ExpoImportMetaRegistry', {
    value: new Map(),
    writable: true,
    configurable: true,
  });
}

// ── Mock react-native-reanimated ─────────────────────────────────────
require('react-native-reanimated/mock');
```

### 2.4 Tạo các file mock

**`__mocks__/fileMock.js`** — stub cho ảnh/font:
```js
module.exports = 'test-file-stub';
```

**`__mocks__/expoWinterMock.js`** — fix Expo SDK 54 import.meta:
```js
// Mock Expo winter runtime để tránh lỗi import.meta (ESM vs CommonJS)
module.exports = {};
```

### 2.5 Thêm scripts vào `package.json`

```json
"scripts": {
  "test": "jest",
  "test:coverage": "jest --coverage",
  "test:ci": "jest --coverage --passWithNoTests --forceExit"
}
```

---

## 3. Phần 2 — Viết Unit Test

### 3.1 Cấu trúc thư mục test

```
ScrapTech/
├── __tests__/
│   ├── OnboardingScreen.test.tsx   ← test màn hình Onboarding
│   ├── HomeScreen.test.tsx         ← test MyOrdersScreen (kết nối Supabase)
│   ├── TEST_REPORT.md              ← mô tả test cases
│   └── SETUP_GUIDE.md              ← file này
├── __mocks__/
│   ├── fileMock.js
│   └── expoWinterMock.js
├── jest.config.js
└── jest.setup.js
```

### 3.2 Pattern chuẩn cho test với Supabase mock

```tsx
// Cấu trúc mock Supabase chain (from → select → eq → single/then)
const buildChain = (table: string) => {
  const chain: any = {};
  chain.select = jest.fn(() => chain);
  chain.eq     = jest.fn(() => chain);
  chain.order  = jest.fn(() => chain);
  chain.limit  = jest.fn(() => chain);

  // Trả về single record
  chain.single = jest.fn(() =>
    Promise.resolve({ data: MOCK_DATA[table], error: null })
  );

  // Trả về array (dùng .then thay vì await trực tiếp)
  chain.then = jest.fn((cb: any) =>
    Promise.resolve({ data: MOCK_ARRAY, error: null }).then(cb)
  );

  return chain;
};

jest.mock('@/src/api', () => ({
  supabase: {
    from: jest.fn((table: string) => buildChain(table)),
  },
}));
```

### 3.3 Pattern render đúng chuẩn (tránh lỗi unmounted renderer)

```tsx
// ✅ ĐÚNG — render trực tiếp + waitFor cho async
it('hiển thị tên người dùng', async () => {
  const { getByText } = render(<MyOrdersScreen />);

  await waitFor(() => {
    expect(getByText('Trần Văn Mạnh')).toBeTruthy();
  });
});

// ❌ SAI — dùng let + act → gây lỗi "Can't access .root on unmounted"
it('test sai pattern', async () => {
  let component: ReturnType<typeof render>;
  await act(async () => {
    component = render(<MyOrdersScreen />); // SAI!
  });
  expect(component!.getByText('...')).toBeTruthy();
});
```

### 3.4 Chạy test local

```bash
# Chạy tất cả test
npx jest

# Chạy với coverage report
npx jest --coverage

# Chạy 1 file cụ thể
npx jest __tests__/OnboardingScreen.test.tsx
```

**Kết quả mong đợi:**
```
Test Suites: 2 passed, 2 total
Tests:       10 passed, 10 total

MyOrdersScreen.tsx    | 92.75% | 100% funcs | 93.93% lines
Onboarding1Screen.tsx |  100%  |  100%      |  100%
```

---

## 4. Phần 3 — GitHub Actions

### 4.1 Tạo file workflow

Tạo file `.github/workflows/ci.yml`:

```yaml
name: CI — Test & SonarCloud Analysis

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test-and-analyze:
    name: Jest Tests + SonarCloud
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # SonarCloud cần full git history

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm install --legacy-peer-deps
        # ⚠️ Dùng install thay vì ci để tránh lỗi lock file out of sync

      - name: Run Jest with coverage
        run: npx jest --coverage --coverageReporters=lcov --coverageReporters=text-summary --passWithNoTests
        env:
          EXPO_PUBLIC_SUPABASE_URL: https://placeholder.supabase.co
          EXPO_PUBLIC_SUPABASE_KEY: placeholder_key

      - name: Upload coverage report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: coverage-report
          path: coverage/lcov.info
          retention-days: 7

      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

### 4.2 Thêm GitHub Secret

1. Vào **GitHub repo → Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Thêm: `SONAR_TOKEN` = *(token lấy từ SonarCloud)*

> **Lưu ý:** `GITHUB_TOKEN` được GitHub tự động cấp, không cần thêm thủ công.

---

## 5. Phần 4 — SonarCloud

### 5.1 Tạo tài khoản & import project

1. Vào [sonarcloud.io](https://sonarcloud.io) → **Login with GitHub**
2. Click **"+"** → **"Analyze new project"**
3. Chọn GitHub repo của bạn → **Set Up**
4. Chọn phương thức: **"With GitHub Actions"**

> ⚠️ **Yêu cầu quyền:** Chỉ **Owner** của GitHub Organization mới có thể import project. Nếu là Member → cần nhờ Owner hoặc dùng tài khoản cá nhân.

### 5.2 Lấy SONAR_TOKEN

1. SonarCloud → **Avatar** → **My Account → Security**
2. Nhập tên token → **Generate**
3. **Copy ngay** (chỉ hiển thị 1 lần!)
4. Dán vào GitHub Secrets với tên `SONAR_TOKEN`

### 5.3 Tạo `sonar-project.properties`

```properties
# sonar-project.properties
sonar.projectKey=thiet28_ScrapTech
sonar.organization=thiet28

sonar.projectName=ScrapTech Mobile
sonar.projectVersion=1.0.0

# Nguồn code
sonar.sources=app,src
sonar.tests=__tests__

# Loại trừ
sonar.exclusions=\
  **/node_modules/**,\
  **/__mocks__/**,\
  **/coverage/**,\
  **/*.d.ts,\
  **/assets/**,\
  **/android/**,\
  **/ios/**

sonar.test.inclusions=**/__tests__/**/*.test.tsx,**/__tests__/**/*.test.ts

sonar.sourceEncoding=UTF-8

# Coverage report từ Jest
sonar.javascript.lcov.reportPaths=coverage/lcov.info

sonar.typescript.tsconfigPath=tsconfig.json
```

> **Tìm Project Key:** Vào SonarCloud → chọn project → xem URL:
> `https://sonarcloud.io/project/overview?id=<PROJECT_KEY>`

### 5.4 Xem kết quả SonarCloud

```
https://sonarcloud.io/project/overview?id=thiet28_ScrapTech
```

| Mục | Ý nghĩa |
|-----|---------|
| **Bugs** | Lỗi logic trong code |
| **Vulnerabilities** | Lỗ hổng bảo mật |
| **Code Smells** | Code viết chưa sạch |
| **Coverage** | % code được test bao phủ |
| **Quality Gate** | ✅ Passed / ❌ Failed |

---

## 6. Kết quả đạt được

### Test Results
```
Test Suites : 2 passed, 2 total
Tests       : 10 passed, 10 total
Time        : ~6 giây
```

### Coverage
```
MyOrdersScreen.tsx    → Statements: 92.75% | Functions: 100% | Lines: 93.93%
Onboarding1Screen.tsx → Statements: 100%   | Functions: 100% | Lines: 100%
```

### Files đã tạo/chỉnh sửa

| File | Mô tả |
|------|-------|
| `jest.config.js` | Cấu hình Jest với alias, coverage, mock |
| `jest.setup.js` | Global mock trước mỗi test |
| `__mocks__/fileMock.js` | Stub cho file ảnh/font |
| `__mocks__/expoWinterMock.js` | Fix lỗi Expo SDK 54 import.meta |
| `__tests__/OnboardingScreen.test.tsx` | 4 test cases cho Onboarding |
| `__tests__/HomeScreen.test.tsx` | 6 test cases cho MyOrdersScreen |
| `sonar-project.properties` | Cấu hình SonarCloud |
| `.github/workflows/ci.yml` | Pipeline CI/CD tự động |
| `package.json` | Thêm scripts test:coverage, test:ci |

---

## 7. Các lỗi thường gặp & cách fix

### Lỗi 1: `import.meta` — Expo SDK 54 + Jest/CommonJS

```
ReferenceError: You are trying to `import` a file outside of the scope
  at expo/src/winter/installGlobal.ts
```

**Fix:** Thêm vào `jest.config.js`:
```js
moduleNameMapper: {
  "^expo/src/winter(.*)$": "<rootDir>/__mocks__/expoWinterMock.js",
}
```
Và tạo `__mocks__/expoWinterMock.js`:
```js
module.exports = {};
```

---

### Lỗi 2: `Can't access .root on unmounted test renderer`

```
Can't access .root on unmounted test renderer
  at HomeScreen.test.tsx:122
```

**Fix:** Đổi pattern render:
```tsx
// ❌ Sai
let component;
await act(async () => { component = render(<Screen />) });
component.getByText('...');

// ✅ Đúng
const { getByText } = render(<Screen />);
await waitFor(() => { expect(getByText('...')).toBeTruthy() });
```

---

### Lỗi 3: `npm ci` lock file out of sync

```
npm error `npm ci` can only install packages when package.json and package-lock.json are in sync
npm error Missing: nativewind@4.2.3 from lock file
```

**Fix:** Trong `.github/workflows/ci.yml` đổi:
```yaml
# ❌ Sai
run: npm ci

# ✅ Đúng
run: npm install --legacy-peer-deps
```

---

### Lỗi 4: GitHub Actions billing locked

```
The job was not started because your account is locked due to a billing issue.
```

**Fix:** Nhờ Owner của GitHub Organization kiểm tra và cập nhật billing tại:
`github.com/organizations/<org-name>/settings/billing`

---

### Lỗi 5: SonarCloud — `This action must be performed by an organization owner`

**Fix:** Chỉ Owner mới có thể import project cho Organization. Có 2 cách:
1. Nhờ Owner import project
2. Tạo project dưới tài khoản cá nhân (thay `organization=<username>` và `projectKey=<username>_<repo>`)

---

*Tài liệu được tổng hợp từ quá trình setup thực tế dự án ScrapTech — 2026/04/22*
