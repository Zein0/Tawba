# Tawba – Missed Prayer Tracker

An Expo (React Native) mobile app that helps Muslims estimate, track, and repay missed (qadha) prayers entirely offline. The experience is gentle, ad-free, and bilingual (Arabic/English) with RTL support.

## Features

- **Onboarding estimator** – calculate missed prayers by years and fine-tune per prayer type.
- **Offline prayer reminders** – compute local adhan times with `adhan.js` and send gentle notifications 10 minutes after each prayer.
- **Smart logging** – capture current and qadha prayers, edit or delete entries, and view your day-by-day history.
- **Progress insights** – monitor remaining debt per prayer, see total qadha repaid, and get a projected completion date based on your pace.
- **Personalised settings** – toggle language (Arabic/English with RTL), font size, theme, reminders, and saved location.

## Tech Stack

- [Expo](https://expo.dev/) with React Native
- [expo-router](https://expo.github.io/router/) navigation
- Local persistence via `expo-sqlite`
- Local notifications (`expo-notifications`) and location (`expo-location`)
- Prayer time calculations with [`adhan.js`](https://github.com/batoulapps/adhan-js)
- i18n with `i18next`
- Styling via NativeWind (Tailwind CSS for React Native)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the Expo development server:
   ```bash
   npm run start
   ```
3. Open the project using Expo Go on your device or an emulator.

> The app is designed to work fully offline after the initial setup. No accounts, ads, or network requests are required.

## Building with EAS

This project includes an `eas.json` profile set that works with [EAS Build](https://docs.expo.dev/build/introduction/).

1. Authenticate with Expo:
   ```bash
   npx expo login
   ```
2. Configure any required credentials (run once per platform):
   ```bash
   npx eas credentials
   ```
3. Run a build:
   ```bash
   npx eas build --platform android --profile production
   # or
   npx eas build --platform ios --profile production
   ```
4. (Optional) Submit the build to the stores:
   ```bash
   npx eas submit --platform android --profile production
   npx eas submit --platform ios --profile production
   ```

Use the `development` or `preview` profiles when you need an internal build or development client.


- `app/` – routed screens powered by expo-router
- `src/components/` – reusable UI components
- `src/contexts/` – global state (settings, logs, estimates)
- `src/database/` – SQLite access helpers
- `src/hooks/` – reusable logic (prayer times, notifications)
- `src/i18n/` – translation configuration
- `src/utils/` – calculations and formatting helpers

## Intention

> This project is built to help Muslims repay their prayer debt with clarity, peace, and sincerity. May it be a means of ease and tawba.
