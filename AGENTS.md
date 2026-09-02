# Agent Guidelines and Project Instructions

These instructions apply to the Alibe frontend. Keep changes focused on the requested behavior and preserve existing user changes.

## Project Contract

- Framework: Expo SDK 57, React Native 0.86, React 19.
- Routing: Expo Router with `main: expo-router/entry`.
- Language: TypeScript 6 in strict mode.
- Styling: NativeWind 4.2 with Tailwind preset and `className` support, plus `twrnc` for runtime Tailwind styles.
- Tests: Jest with `jest-expo` and React Native Testing Library.
- Package manager: npm. Keep `package-lock.json` synchronized with dependency changes.
- Primary scope: UI and interaction flows. Treat `src/server` as an integration boundary, not a place for screen markup.

## Source Ownership

Use these boundaries consistently:

| Location           | Owns                                                      |
| ------------------ | --------------------------------------------------------- |
| `src/app/`         | Route files, layouts, navigation options, and route tests |
| `src/screens/`     | Complete screen composition and page-level state          |
| `src/components/`  | Reusable visual components and interaction primitives     |
| `src/hooks/`       | Reusable stateful behavior; names must start with `use`   |
| `src/server/`      | Typed HTTP client, request models, and API errors         |
| `src/utils/`       | Pure, reusable functions without UI ownership             |
| `src/theme.ts`     | Shared TypeScript design tokens                           |
| `src/constants.ts` | Stable constants and storage keys                         |

Routes should be thin adapters. Prefer:

```tsx
import { HomeScreen } from '@/screens/HomeScreen';

export default HomeScreen;
```

Do not place large layouts, API calls, or reusable component definitions directly in route files.

## Expo Router Rules

- Add screens by adding files under `src/app`.
- `_layout.tsx` is the navigation and provider boundary.
- Use `<Stack.Screen />` for route-specific options.
- Keep navigation calls in route or screen layers.
- Do not make low-level components aware of route names.
- Use typed route support already enabled in `app.json`.
- Test route components independently from the navigation container unless navigation behavior itself is under test.

Current route ownership:

| Route                                                    | Stack / purpose                                |
| -------------------------------------------------------- | ---------------------------------------------- |
| `/`                                                      | Loading screen                                 |
| `/component-gallery`                                     | Isolated development component gallery         |
| `/auth`, `/login`, `/sign-up`                            | `(auth)` authentication stack                  |
| `/profile`                                               | `(profile)` profile setup stack                |
| `/groups`                                                | `(app)` groups home                            |
| `/create-group`, `/create-group/invite`                  | Group creation stack                           |
| `/group/[id]`                                            | Group calendar and main page                   |
| `/group/[id]/day/[date]`                                 | Day detail stack                               |
| `/group/[id]/create-event`, `/group/[id]/event-created`  | Event creation modal and confirmation          |
| `/group/[id]/info`, `/group/[id]/leave`                  | Group information and leave confirmation modal |
| `/group/[id]/memories`, `/group/[id]/memories/new`       | Memories stack                                 |
| `/group/[id]/experiences`, `/group/[id]/experiences/new` | Experiences stack                              |

Parenthesized folders are route groups and do not appear in public URLs. Dynamic route parameters must use typed pathname objects, for example `{ pathname: '/group/[id]', params: { id } }`. Keep nested flow configuration in its nearest `_layout.tsx`; use `presentation: 'modal'` for event creation and leave confirmation routes.

The `/component-gallery` route is a development aid for visually checking reusable components in isolation. Keep its examples in `src/screens/ComponentGalleryScreen.tsx`, and keep behavior tests next to the component or gallery screen. Do not put production-only navigation or API calls in the gallery.

## NativeWind 4 Rules

- Use `className` for static React Native styling.
- Use `twrnc` (`tw`) when class names must be generated or applied at runtime; keep its utilities consistent with the NativeWind class names.
- Keep utility order consistent: layout, spacing, typography, color, borders, effects.
- Use inline `style` only for runtime values, animations, measurements, or native-only APIs.
- Never use `px` in source styles, Tailwind classes, or arbitrary values. Use rem-based Tailwind utilities or explicit `rem` values for responsive sizing instead.
- Do not treat raw React Native numbers as CSS pixels: numeric layout values are density-independent units. Prefer NativeWind or `twrnc` rem-based utilities when a responsive value is needed.
- `babel.config.js` must retain `babel-preset-expo` with `jsxImportSource: 'nativewind'` and `nativewind/babel`.
- `metro.config.ts` must use `withNativeWind` with `input: './src/global.css'`.
- Keep `metro.config.js` and `metro.config.ts` behaviorally equivalent if both remain in the repository.
- Tailwind content scanning must include `src/**/*.{js,jsx,ts,tsx}`. Do not leave starter paths such as `./App.tsx` or `./components/**` as the only globs.
- Import `src/global.css` once from the root layout if required by the runtime; do not import it from every screen.
- Do not introduce NativeWind 5 or Tailwind 4 configuration without upgrading the dependency set and migration plan together.

## Responsive Units

- Use rem-based values for spacing, dimensions, and typography so layouts scale consistently across screen sizes.
- Do not add pixel literals such as `12px`, `24px`, or `p-[12px]`; replace them with the closest rem-based utility or a project token.
- Keep responsive sizing in NativeWind or `twrnc` classes whenever possible. Use numeric React Native values only where the native API requires them, such as measured values or animation output.

## Alibe Design System

- Use `src/theme.ts` as the source of truth for the Alibe visual language: warm ivory canvas, deep green ink, lime highlights, coral actions, and pink accents.
- Mirror theme color tokens in `tailwind.config.js` and use semantic utilities such as `bg-coral`, `bg-lime`, `text-ink`, and `bg-canvas`; do not scatter new hex values through components.
- Favor expressive rounded geometry: capsule-shaped buttons and controls, with generous rounded surfaces for cards and panels.
- Keep contrast intentional: use deep green for primary text, coral for the main action, lime for secondary actions or highlights, and pink as a supporting accent.

## Component Construction

- Create reusable components in their own folder under `src/components/<ComponentName>/index.tsx` with explicit prop interfaces and named exports.
- Prefer `Pressable` for interactive components, include an accessibility role, and expose meaningful disabled and pressed states.
- Represent visual variations with typed unions such as `type ButtonVariant = 'primary' | 'secondary'` instead of accepting arbitrary class strings.
- Keep screen composition in `src/screens`; routes in `src/app` should remain thin adapters.

## TypeScript Rules

- Define explicit interfaces or types for component props.
- Avoid `any`; use a concrete type or narrow `unknown`.
- Prefer named exports for reusable components and hooks.
- Use `@/*` for imports from `src` and `@/assets/*` for assets.
- Do not use one-letter names except for conventional callback parameters where the meaning is obvious.
- Keep components functional and hooks composable.
- Avoid adding `useMemo` or `useCallback` without a measured need or an existing local pattern.

## UI Implementation Rules

- Build screens from reusable components rather than duplicating markup.
- Keep UI-only work independent from the API client; use typed fixture data or local state first.
- Represent meaningful loading, empty, disabled, validation, and error states.
- Prefer `Pressable` for new interactive controls and provide accessible labels where the visible label is insufficient.
- Add `testID` only when it provides a stable automation boundary; prefer accessible queries in unit tests.
- Use `StyleSheet` or runtime `style` for dynamic values only.
- Keep responsive layouts usable on small phones, large phones, tablets, and web.
- Avoid fixed dimensions for text containers unless the layout explicitly requires them.

## Testing and Validation

Run the narrowest relevant check after an edit, then the broader checks when practical:

```bash
npm run format
npx tsc --noEmit
npm run lint
npx jest path/to/changed.test.tsx --runInBand
npm run test:unit
```

For runtime UI verification:

```bash
npx expo start -c
```

Use Maestro flows under `.maestro/` when that directory exists. Selectors should use accessibility labels or stable `testID` values.

Before reporting completion, validate that:

- The route resolves through Expo Router.
- NativeWind classes are discovered from the `src` tree.
- TypeScript and focused tests pass.
- No unrelated files were reformatted or changed.

## Commands

```bash
npm install
npx expo start
npm run android
npm run ios
npm run web
npx tsc --noEmit
npm run lint
npm run test:unit
npm run format
npm run format:check
```

## Change Hygiene

- Use `apply_patch` for manual file edits.
- Do not commit, reset, checkout, or revert user changes unless explicitly requested.
- Do not add dependencies for a UI problem when the existing Expo and NativeWind stack can solve it.
- Keep comments short and explain only non-obvious decisions.
- Update `README.md` when architecture, setup, or configuration behavior changes.
