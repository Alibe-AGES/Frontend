# Agent Guidelines & Project Instructions

## 1. Stack Overview

- **Framework:** React Native with Expo (Managed Workflow, Router)
- **Language:** TypeScript (`strict` mode enabled)
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **Unit/Integration Testing:** Jest + React Native Testing Library
- **E2E UI Testing:** Maestro
- **Package Manager:** npm (or pnpm/yarn—adjust if needed)

---

## 2. Essential Commands

### Development & Build

- **Start Dev Server:** `npx expo start`
- **Run on iOS Simulator:** `npx expo start --ios`
- **Run on Android Emulator:** `npx expo start --android`
- **TypeScript Check:** `npx tsc --noEmit`

### Testing

- **Run all unit tests:** `npm run test` (or `npx jest`)
- **Run single unit test file:** `npx jest path/to/file.test.tsx`
- **Watch unit tests:** `npx jest --watch`
- **Run Maestro E2E flows:** `maestro test .maestro/`
- **Run single Maestro flow:** `maestro test .maestro/flow-name.yaml`

### Code Quality

- **Linting:** `npm run lint`

---

## 3. Code Conventions & Styling Rules

### TypeScript

- Always define explicit types or interfaces for component props and state.
- Avoid using `any`; use `unknown` if a type is truly uncertain.
- Keep components clean using functional components and hooks.

### NativeWind & Styling

- **Use Tailwind classes** via the `className` prop on NativeWind components (e.g., `<View className="flex-1 p-4 bg-white">`).
- **Avoid inline `style={{ ... }}` objects** unless dynamic runtime styling (like animated values) is required.
- Maintain consistent utility ordering: Layout (`flex-1`, `flex-row`) → Spacing (`p-4`, `m-2`) → Typography (`text-base`, `font-bold`) → Visuals (`bg-white`, `rounded-lg`).

### Component Architecture

- Place reusable UI components in `src/components/` or `components/`.
- Keep screen routes lightweight inside `app/` (Expo Router).
- Use named exports for components (`export const Button = ...`).

---

## 4. Testing Guidelines

### Jest (Unit / Integration)

- Colocate test files next to implementation (`Button.test.tsx`) or in `__tests__/`.
- Use React Native Testing Library queries (`screen.getByText`, `screen.getByTestId`).
- Mock Expo modules or native modules properly using `jest.mock()`.
- Add `testID` props to components that need to be targeted by tests.

### Maestro (E2E UI Flow)

- Store all Maestro YAML flows in the `.maestro/` directory.
- Use explicit `accessibilityLabel` or `testID` props in components so Maestro selectors are reliable:
  ```yaml
  - tapOn: 'submit-button' # Targets testID="submit-button"
  ```
