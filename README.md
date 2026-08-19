# Alibe Frontend

Documentation wiki for the Alibe UI. This project is an Expo-managed React Native application written in TypeScript and routed with Expo Router.

## Quick Start

```bash
npm install
npx expo start
```

Useful targets:

```bash
npm run android
npm run web
npm run build
```

Quality checks:

```bash
npx tsc --noEmit
npm run lint
npm run format:check
npm run test:unit
```

## Architecture

The application is organized around file-based routes, screen compositions, and reusable UI components:

```text
Expo entry (expo-router/entry)
        |
        v
src/app/_layout.tsx  -->  navigation stack and global providers
        |
        v
src/app/<route>.tsx   -->  thin route adapter
        |
        v
src/screens/          -->  complete screen composition
        |
        v
src/components/       -->  reusable visual and interaction primitives
```

The current route tree is:

```text
src/app/
├── _layout.tsx       # Root Stack navigator
├── index.tsx         # Home route (/)
└── __tests__/        # Route-level tests
```

`package.json` sets `main` to `expo-router/entry`. Expo Router scans `src/app` and turns files into routes. `_layout.tsx` owns the navigation boundary; `index.tsx` is the home screen. Add a route by adding a file such as `src/app/profile.tsx`, which becomes `/profile`.

Keep route files small. A route should normally import and return a screen component:

```tsx
import { ProfileScreen } from '@/screens/ProfileScreen';

export default ProfileScreen;
```

## Directory Guide

| Path               | Responsibility                                                         |
| ------------------ | ---------------------------------------------------------------------- |
| `src/app/`         | Expo Router routes, layouts, route-local tests, and navigation options |
| `src/screens/`     | Page-level compositions and screen state                               |
| `src/components/`  | Reusable UI components, grouped one component per folder               |
| `src/hooks/`       | Reusable stateful behavior and UI hooks                                |
| `src/server/`      | Typed API client and request error handling; not an in-app backend     |
| `src/utils/`       | Pure shared helpers with no screen ownership                           |
| `src/theme.ts`     | Shared design tokens represented as TypeScript values                  |
| `src/constants.ts` | Stable application constants such as storage keys                      |
| `src/global.css`   | NativeWind entry stylesheet                                            |
| `assets/`          | Icons, splash assets, images, and other bundled resources              |

## UI Development Model

For UI-only work, use local state and fixture data. Do not add API calls merely to render a screen. A typical implementation order is:

1. Create the route in `src/app`.
2. Create the page composition in `src/screens`.
3. Extract repeated controls into `src/components`.
4. Add interaction state with a typed hook or local `useState`.
5. Add route and component tests for important states.
6. Connect `src/server/api.ts` only when real data is required.

Example screen structure:

```text
src/
├── app/
│   ├── _layout.tsx
│   └── profile.tsx
├── screens/
│   └── ProfileScreen.tsx
└── components/
    ├── Button/index.tsx
    └── ProfileHeader/index.tsx
```

## Navigation

The root layout currently renders a native stack:

```tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return <Stack />;
}
```

Add screen options in `_layout.tsx` when a route needs a title, presentation mode, or header configuration:

```tsx
<Stack>
  <Stack.Screen
    name="index"
    options={{ title: 'Home' }}
  />
  <Stack.Screen
    name="profile"
    options={{ title: 'Profile' }}
  />
</Stack>
```

Use Expo Router `Link` or router methods for navigation. Keep navigation decisions in route and screen layers, not inside low-level visual components.

## Styling and NativeWind

NativeWind 4 is configured in two places:

- `babel.config.js` enables the Expo JSX transform and `nativewind/babel`.
- `metro.config.ts` wraps Expo Metro with `withNativeWind` and uses `src/global.css` as the input.

Use `className` on React Native components:

```tsx
<View className="flex-1 bg-white px-6 py-8">
  <Text className="text-2xl font-bold text-black">Profile</Text>
</View>
```

Prefer NativeWind classes for static styling. Use `style` only for values that genuinely depend on runtime calculations, animation, or a native API. The Tailwind content glob must include `src/**/*.{js,jsx,ts,tsx}`; update `tailwind.config.js` if it still contains starter paths.

Import the global stylesheet once from the root layout if the runtime requires it:

```tsx
import '../global.css';
```

Do not import the stylesheet repeatedly from individual screens.

## TypeScript and Imports

TypeScript runs in strict mode. Use the configured aliases:

```text
@/*         -> src/*
@/assets/*  -> assets/*
```

Use explicit prop interfaces, avoid `any`, and use `unknown` when a value is not yet narrowed. Prefer named exports for reusable components and hooks.

## Data and State Boundaries

The UI layer owns presentation and interaction state. `src/server/api.ts` owns HTTP request details and typed response models. Keep these concerns separate:

```text
screen or hook -> API client -> remote service
component      -> props/state -> visual output
```

The existing API client uses `fetch`, typed models, and `ApiError`. It currently targets JSONPlaceholder as an example and should be replaced or configured before production use.

## Testing

Jest uses the `jest-expo` preset. Use React Native Testing Library to test observable behavior:

```tsx
const { getByText } = render(<ProfileScreen />);
expect(getByText('Profile')).toBeTruthy();
```

Use `testID` or accessibility labels for controls that need stable automation selectors. Keep tests near the implementation or under `__tests__`.

## Configuration Map

| File                                  | Purpose                                                                       |
| ------------------------------------- | ----------------------------------------------------------------------------- |
| `app.json`                            | Expo app metadata, platform settings, plugins, splash screen, and experiments |
| `app.config.ts`                       | Dynamic Expo configuration; keep it consistent with `app.json`                |
| `babel.config.js`                     | Babel and NativeWind 4 transformation                                         |
| `metro.config.js` / `metro.config.ts` | Expo Metro and NativeWind bundling                                            |
| `tsconfig.json`                       | Strict TypeScript settings and import aliases                                 |
| `tailwind.config.js`                  | NativeWind preset and class scanning paths                                    |
| `eslint.config.mjs`                   | ESLint rules and TypeScript project service                                   |
| `package.json`                        | Dependencies, scripts, Expo Router entry, and Jest configuration              |

## Definition of Done for a UI Change

- The route is reachable through Expo Router.
- Components have typed props and stable dimensions where needed.
- NativeWind classes are detected from the `src` tree.
- Loading, empty, error, and interaction states are represented where relevant.
- The screen works on narrow and wide layouts.
- `npx tsc --noEmit`, `npm run lint`, and the focused Jest test pass.
- No API or persistence code is added unless the UI requires it.
