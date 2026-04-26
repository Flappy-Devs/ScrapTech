# Welcome to your Expo app 👋

<p align="left">
  <a href="https://github.com/Flappy-Devs/ScrapTech/actions/workflows/ci.yml">
    <img src="https://github.com/Flappy-Devs/ScrapTech/actions/workflows/ci.yml/badge.svg" alt="CI Status">
  </a>
  <a href="https://sonarcloud.io/summary/new_code?id=Flappy-Devs_ScrapTech">
    <img src="https://sonarcloud.io/api/project_badges/measure?project=Flappy-Devs_ScrapTech&metric=alert_status" alt="Quality Gate Status">
  </a>
  <a href="https://sonarcloud.io/summary/new_code?id=Flappy-Devs_ScrapTech">
    <img src="https://sonarcloud.io/api/project_badges/measure?project=Flappy-Devs_ScrapTech&metric=coverage" alt="Coverage">
  </a>
  <a href="https://sonarcloud.io/summary/new_code?id=Flappy-Devs_ScrapTech">
    <img src="https://sonarcloud.io/api/project_badges/measure?project=Flappy-Devs_ScrapTech&metric=bugs" alt="Bugs">
  </a>
  <a href="https://sonarcloud.io/summary/new_code?id=Flappy-Devs_ScrapTech">
    <img src="https://sonarcloud.io/api/project_badges/measure?project=Flappy-Devs_ScrapTech&metric=vulnerabilities" alt="Vulnerabilities">
  </a>
</p>

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Testing

This project uses **Jest** and **React Native Testing Library** for testing.

### Run tests locally

- **Run all tests:**
  ```bash
  npm test
  ```

- **Run tests with coverage report:**
  ```bash
  npm run test:coverage
  ```
  After running this command, you can view the detailed HTML report at:
  `coverage/lcov-report/index.html`

- **Watch mode:**
  ```bash
  npx jest --watch
  ```

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
