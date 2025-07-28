---
trigger: manual
---


# 📦 FitSnap Project Rules

These rules define architectural principles, feature ownership, and development conventions to keep the FitSnap app consistent, scalable, and maintainable across the entire team and toolchain.

---

## 🏗 Architecture

- Use **Next.js (App Router)** with **Tailwind CSS** and **TypeScript**.
- Use **Supabase** for authentication, storage, and database.
- Organize by **feature-first folder structure** (e.g., `/app/workout`, `/app/history`).
- Extract shared logic into `/lib`, UI elements into `/components`, and reusable types into `/types`.

---

## ⚙️ Feature Modules

### Dashboard
- Show weekly goal progress, PRs, and motivational quote.
- Highlight workout days on calendar.
- Owned by: `@dashboard-lead`

### Workout
- Allows adding exercises, sets, weight, rest timer, and photos.
- Tracks exercise duration (excluding rest).
- Owned by: `@workout-lead`

### Exercise Library
- Searchable list with filters and categories.
- Admin-editable via Admin Dashboard.
- Owned by: `@exercise-lead`

### Progress
- Shows before/after comparison, workout frequency, muscle group usage, and recent PRs.
- Owned by: `@progress-lead`

### History
- Lists past workouts with filter/search/export.
- CSV export included.
- Owned by: `@history-lead`

### Settings
- Update username, theme, rest time, notification toggles.
- Enable community sharing and export/delete data.
- Owned by: `@settings-lead`

### Community
- Real-time activity feed (opt-in).
- Shows user status (e.g., “1 user online”).
- Owned by: `@community-lead`

### Admin Panel
- CRUD for exercises, muscle groups, categories, and quotes.
- Restricted to `admin_only`.
- Owned by: `@admin`

---

## 📊 Data Rules

- Every user entry (goal, workout, PR) must be linked via `user_id`.
- Users can only access and manipulate their own data.
- Community feed is public-readable, user-writable.
- Only admins can modify quote/exercise databases.

---

## 💾 Environment Rules

- All secrets (e.g. Supabase keys) must go into `.env.local`.
- Do not commit `.env.*` files to Git.
- Use `.env.example` for reference.

---

## 🧪 Testing Rules

- All pure utility functions must include unit tests.
- Page-level features (like goal calculation) must include at least 1 test.
- Use mock data from `/lib/mocks/` for local tests and Figma previews.

---

## 🔐 Auth & Security

- Use Supabase Auth (OAuth or email magic link).
- Auth logic must be separated from UI components (middleware or layout wrapper).
- Admin routes must be protected at both the UI and server levels.

---

## 📦 Deployment Rules

- Use **Vercel** for production deployments.
- All PRs must be preview-tested in a staging environment before merging to `main`.
- Use GitHub Actions for linting and type-checking.

---

