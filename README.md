# FitSnap

FitSnap is a mobile-first fitness tracking web application that helps users track their workouts, measure progress with photos, and stay motivated with a supportive community.

## Tech Stack

- **Frontend**: Next.js (App Router)
- **Styling**: Tailwind CSS (dark theme with yellow accents)
- **Authentication & Database**: Supabase
- **Language**: TypeScript (strict mode)
- **Deployment**: Vercel

## Project Structure

```
/app                    # Next.js App Router directory
  /(protected)/         # Layout wrapper for authenticated routes
    /dashboard          # User dashboard
    /workout            # Workout tracking
    /exercises          # Exercise library
    /history            # Past workouts
    /progress           # Progress tracking
    /settings           # User settings
    /community          # Community features
    /admin              # Admin panel (restricted)
  /page.tsx             # Home/landing page
/components             # Shared UI components
  /navigation           # Navigation components
/lib                    # Utility functions and services
  /supabase.ts          # Supabase client setup
/types                  # TypeScript type definitions
/public                 # Static assets
/docs                   # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- Supabase account and project

### Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```
4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

### Core Features

- **Authentication**: Email/OAuth sign-up and authentication
- **Dashboard**: Goal tracking, calendar view, PRs, photo comparison
- **Workout Tracking**: Log sets, reps, weight, rest timer, and photos
- **Exercise Library**: Browse or search exercises with filters
- **History**: View and export previous workouts
- **Progress Tracking**: Before/after photos and PR charts
- **Community**: Activity feed and workout sharing
- **Settings**: Customize app preferences and account settings
- **Admin Panel**: Manage exercises, categories, muscle groups, and quotes

## Project Rules

For detailed project guidelines, refer to the documentation in the `/docs` folder:
- `PRD_fitsnap.md`: Product Requirements Document
- `project_rules.md`: Project architecture and conventions
