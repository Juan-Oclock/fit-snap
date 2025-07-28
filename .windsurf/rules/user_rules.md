---
trigger: manual
---




## 🔤 General Code Style & Formatting

- Use **functional** and **declarative** programming patterns; avoid class-based components.
- Prefer **modular code** and avoid duplication.
- Use **descriptive variable names** (e.g., `isLoading`, `hasWorkout`).
- Structure files by logical roles: main component → subcomponents → helpers → constants → types.
- Follow **Next.js + Tailwind CSS** best practices.

---

## 🏷 Naming Conventions

- Use **lowercase with dashes** for directories (e.g., `components/workout-tracker`).
- Use **camelCase** for variables and functions.
- Prefer **named exports** for all components and utilities.
- Use PascalCase for component names (e.g., `WorkoutCard`)

---

## 🧠 TypeScript Best Practices

- Use TypeScript across the entire project.
- Prefer `interface` over `type` for component props.
- Avoid using `any`; use union types or mapped values instead.
- Avoid `enum`; prefer string literal types or object maps.
- Use strict mode for maximum type safety.

---

## ✍️ Syntax & Formatting

- Use `function` keyword for utility/pure functions.
- Use concise conditionals (ternaries or `&&` for short expressions).
- JSX should be declarative and readable.
- Format consistently with **Prettier** (80 char max, trailing commas, etc.).

---

## 🎨 Styling & UI

- Use **Tailwind CSS** for styling (with `dark:` and `hover:` variants).
- Implement **dark mode** using Tailwind and system color scheme preference.
- Ensure responsive design with `flex`, `grid`, and `useWindowSize` when needed.
- Follow a consistent design system with spacing, font size, and border-radius.
- Build fully accessible UI: use `aria-*`, semantic HTML, and proper contrast ratios.

---

## 🧩 Component Patterns

- Break down complex screens into smaller, reusable components.
- Keep components **pure** and avoid side effects (use hooks for logic).
- Use `useEffect`, `useState`, and `useReducer` responsibly.
- Handle loading, error, and empty states clearly.

---

## 🔐 Data Handling

- Use **Supabase client** from a shared `/lib/supabase.ts`.
- Always check for `session.user.id` before performing write operations.
- Use optimistic UI updates where possible for a smoother UX.
- Keep auth logic separate from UI components.

---

## 🛠 File/Folder Structure

- Organize pages under `/app/` based on route (e.g. `/app/dashboard`, `/app/history`).
- Co-locate UI components with pages if not reused globally.
- Keep hooks under `/hooks`, services under `/lib`, and types under `/types`.

---

## 🧪 Testing & Dev Experience

- Use **Jest** or **Vitest** for unit testing (if integrated).
- Write tests for critical logic (timers, workout calculations, PR tracking).
- Use mock data for local development.
- Keep dev experience fast and smooth (no unnecessary dependencies).

---
