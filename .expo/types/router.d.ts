/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(tabs)` | `/(tabs)/home` | `/(tabs)/logs` | `/(tabs)/prayer-times` | `/(tabs)/progress` | `/(tabs)/settings` | `/(tabs)\home` | `/(tabs)\logs` | `/(tabs)\prayer-times` | `/(tabs)\progress` | `/..\src\components\Button` | `/..\src\components\LogForm` | `/..\src\components\PrayerPromptModal` | `/..\src\database\` | `/..\src\hooks\usePrayerTimes` | `/..\src\i18n\config` | `/..\src\types\` | `/..\src\utils\calculations` | `/_sitemap` | `/home` | `/logs` | `/onboarding` | `/prayer-times` | `/progress` | `/settings`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
