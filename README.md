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

## Component Gallery

The project includes a dependency-free isolated component gallery at `/component-gallery`. Use it to see reusable components without navigating through the application flow.

Start Expo and open the gallery in a browser:

```bash
npx expo start
```

Then visit [`http://localhost:8081/component-gallery`](http://localhost:8081/component-gallery), or start the web target directly with `npm run web` and open the same path on the displayed port. The gallery currently includes the primary, secondary, and disabled `Button` states. Add new component examples to `src/screens/ComponentGalleryScreen.tsx` as reusable components are created.

The gallery is a development aid, not a separate production design system. Keep component behavior covered by tests next to the implementation, and use the gallery for visual checks on web, Android, and iOS.

Quality checks:

```bash
npx tsc --noEmit
npm run lint
npm run format:check
npm run test:unit
```

## Contributor Guide

### 1. Clone and install

Install Git, Node.js, and npm on your machine. Then clone the repository and install its dependencies:

```bash
git clone https://github.com/Alibe-AGES/Frontend.git
cd Frontend
npm install
```

Start the Expo development server:

```bash
npx expo start
```

From the Expo terminal, open the app in Expo Go, an Android emulator, an iOS simulator, or a web browser. Use `npm run android`, `npm run ios`, or `npm run web` when you want to open a specific target directly.

### 2. Start from `develop`

`develop` is the shared development branch. Always update it before creating a work branch:

```bash
git checkout develop
git pull origin develop
```

Do not work directly on `develop` or `main`. Create a branch for each task:

```bash
git checkout -b feature/profile-screen
```

Use a short, descriptive branch name. Common prefixes are `feature/`, `fix/`, `refactor/`, and `docs/`.

### 3. Develop and validate

Make focused changes, then run the checks relevant to your work:

```bash
npx tsc --noEmit
npm run lint
npm run format:check
npm run test:unit
```

For a focused test, run Jest directly:

```bash
npx jest src/app/__tests__/index-test.tsx --runInBand
```

Check your changes before committing:

```bash
git status
git diff
```

Commit related changes with a clear message:

```bash
git add src README.md
git commit -m "Add profile screen UI"
```

### 4. Push and open a pull request

Push your work branch to GitHub:

```bash
git push -u origin feature/profile-screen
```

Open a pull request on GitHub with:

- **Base branch:** `develop`
- **Compare branch:** your feature, fix, refactor, or docs branch
- A short description of the change
- The checks you ran
- Screenshots or a short recording for UI changes

Keep the pull request focused. Do not include unrelated formatting or generated-file changes.

### 5. Keep your branch current

Before requesting review, bring the latest `develop` into your branch:

```bash
git fetch origin
git checkout develop
git pull origin develop
git git checkout feature/profile-screen
git merge develop
```

Resolve any conflicts, run the checks again, and push the updated branch:

```bash
git add .
git commit -m "Resolve develop merge conflicts"
git push
```

The pull request should be merged into `develop` after review and passing checks. Changes move from `develop` toward `main` through the project release process; do not merge feature branches directly into `main` unless the Owners request it.

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
├── _layout.tsx                         # Root Stack navigator
├── index.tsx                           # Loading route (/)
├── component-gallery.tsx               # Component gallery (/component-gallery)
├── (auth)/                             # Authentication stack
│   ├── _layout.tsx
│   ├── auth.tsx                        # /auth
│   ├── login.tsx                       # /login
│   └── sign-up.tsx                     # /sign-up
├── (profile)/                          # Profile setup stack
│   ├── _layout.tsx
│   └── profile.tsx                     # /profile
├── (app)/                              # Authenticated app stack
│   ├── _layout.tsx
│   ├── groups.tsx                      # /groups
│   ├── create-group/                   # Group creation stack
│   │   ├── _layout.tsx
│   │   ├── index.tsx                   # /create-group
│   │   └── invite.tsx                  # /create-group/invite
│   └── group/[id]/                     # Group stack
│       ├── _layout.tsx
│       ├── index.tsx                   # /group/[id]
│       ├── day/[date]/                 # Day detail stack
│       ├── create-event.tsx            # Event modal
│       ├── event-created.tsx
│       ├── info.tsx
│       ├── leave.tsx                   # Leave confirmation modal
│       ├── memories/                   # Memories stack
│       └── experiences/                # Experiences stack
└── __tests__/                          # Route-level tests
```

`package.json` sets `main` to `expo-router/entry`. Expo Router scans `src/app` and turns files into routes. Parenthesized folders such as `(auth)` and `(app)` group screens into stacks without adding a URL segment. Dynamic folders such as `[id]` and `[date]` provide route parameters.

The current screens are intentionally simple placeholders rendered through `src/screens/WelcomeScreen.tsx`. The route and stack boundaries are ready for the full UI and data flows to be implemented.

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

### NativeWind and twrnc

Use `className` for styles that do not change and `twrnc` when a class string depends on state or props. Keep the visual vocabulary in `src/theme.ts` and mirror its colors in `tailwind.config.js` so components use semantic names such as `bg-coral` and `text-ink`.

```tsx
import { Pressable, Text } from 'react-native';
import tw from 'twrnc';

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  emphasized?: boolean;
}

export function ActionButton({ title, onPress, emphasized = true }: ActionButtonProps) {
  const background = emphasized ? 'bg-coral' : 'bg-lime';

  return (
    <Pressable
      className={`items-center rounded-full px-6 py-3 ${background}`}
      onPress={onPress}
      style={({ pressed }) => tw`${pressed ? 'opacity-75' : 'opacity-100'}`}
    >
      <Text className="font-bold text-white">{title}</Text>
    </Pressable>
  );
}
```

Prefer rem-based NativeWind utilities (`p-4`, `px-6`, `text-base`) for responsive spacing and type. Do not add `px` values. Raw numeric React Native values are density-independent units and should be reserved for native APIs, measurements, and animation output.

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

The root layout and each nested flow use the native stack from `expo-router/stack`:

```tsx
import { Stack } from 'expo-router/stack';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(profile)" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}
```

Use a nested `_layout.tsx` for every flow that owns a stack. The group layout defines the event and leave confirmation screens as modals:

```tsx
<Stack>
  <Stack.Screen
    name="create-event"
    options={{ presentation: 'modal', title: 'Create event' }}
  />
  <Stack.Screen
    name="leave"
    options={{ presentation: 'modal', title: 'Leave group' }}
  />
</Stack>
```

Use typed Expo Router `Link` objects for dynamic routes:

```tsx
<Link
  href={{ pathname: '/group/[id]/day/[date]', params: { id, date } }}
  asChild
>
  <Pressable>
    <Text>Open day</Text>
  </Pressable>
</Link>
```

Keep navigation decisions in route and screen layers, not inside low-level visual components. Route files should remain thin adapters that import a screen from `src/screens`.

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

Component tests should live next to the component or isolated screen. For example, run the component gallery test with:

```bash
npx jest src/screens/ComponentGalleryScreen.test.tsx --runInBand
```

Use the gallery route for visual inspection and React Native Testing Library for behavior such as presses, disabled states, and accessible labels.

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
