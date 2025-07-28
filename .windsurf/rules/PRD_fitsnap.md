
# 📄 Product Requirements Document (PRD) – FitSnap

---

## 🧠 Project Overview

**App Name:** FitSnap  
**Type:** Mobile-first fitness tracking web app  
**Stack:** Next.js (App Router), Tailwind CSS, Supabase, TypeScript  
**Theme:** Dark mode with yellow accents  
**Target Users:** Fitness enthusiasts and casual users looking to track progress visually and quantitatively

---

## 🎯 Problem Statement

People struggle to consistently track workouts, measure progress, and stay motivated. Many fitness apps are either too complicated, overly focused on social feeds, or lack photo-based transformation tracking.

---

## 🥅 Goals

- Allow users to log workouts quickly and visually
- Track progress using both metrics (PRs, volume) and transformation photos
- Encourage consistency with motivational quotes and streaks
- Create an optional community space to boost accountability

---

## 🔑 Core Features

### 1. Authentication
- Email or OAuth sign-up (Google, GitHub)
- User settings: username, theme, rest timer, notifications

### 2. Dashboard
- Welcome header with name
- Monthly goal tracker (e.g., 10/15 workouts complete)
- Calendar view highlighting workout days
- Personal records (PRs)
- Before vs After photo comparison
- Daily quote

### 3. Start Workout
- Select workout type (push/pull/legs/custom)
- Add exercises via dropdown or search
- Log sets, reps, weight, and rest timer
- Upload a photo and add notes
- Save and track duration

### 4. Exercise Library
- Browse or search exercises
- Filter by category (e.g., strength, cardio) and muscle group
- View equipment and instructions
- Managed by admin panel

### 5. History
- Log of previous workouts
- View details (sets/reps/weight/notes)
- Export data as CSV

### 6. Progress
- Track PR changes over time
- Compare before/after photos
- View exercise frequency charts

### 7. Community
- Opt-in public feed showing completed workouts
- “Users online” status
- Shared workout stats (optional)

### 8. Settings
- Edit username
- Set default rest time
- Enable/disable notifications
- Toggle dark mode
- Enable/disable community sharing
- Export/clear/delete account data

### 9. Admin Panel
- Only visible to admins
- CRUD for:
  - Exercises
  - Categories
  - Muscle Groups
  - Quotes

---

## 📊 Success Metrics

- % of users completing 5+ workouts per month
- Number of PRs recorded
- Number of before/after photos uploaded
- % of users enabling community sharing
- Average time per workout session

---

## 🧱 Pages to Build

- `/` → Home + Signup
- `/dashboard`
- `/workout`
- `/exercises`
- `/history`
- `/progress`
- `/settings`
- `/community`
- `/admin` (admin-only)

---

## 🧩 Tech Stack Summary

| Layer        | Tool        |
|--------------|-------------|
| Frontend     | Next.js     |
| UI Framework | Tailwind CSS |
| Auth & DB    | Supabase    |
| Language     | TypeScript  |
| Deployment   | Vercel      |
| Styling Mode | Dark mode   |

---

## 🗂 Folder Structure (Initial)

```
/app
  /dashboard
  /workout
  /exercises
  /history
  /progress
  /settings
  /community
  /admin
/components
/lib
/types
/public
/docs
```

---

## 🚀 Next Steps

1. Upload this PRD to `/docs/PRD_fitsnap.md`
2. Scaffold the project with Next.js + Tailwind + Supabase
3. Build the dashboard route first with dummy data

