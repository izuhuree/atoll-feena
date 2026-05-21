# AtollFeeNa User And Developer Guide

AtollFeeNa turns recreational scuba diving in the Maldives into structured safety and citizen-science data. Divers can log dives, report recent site conditions, record species and reef observations, and contribute information that helps the next diver plan more safely.

Core mission: **Make every dive count — for conservation and for safety.**

## User Guide

### Sign In

Use Google sign-in to create an account. On first login, AtollFeeNa creates a Firestore user profile so administrators can assign roles and manage access.

### Home Dashboard

The home page shows recent 30-day activity, safety signals, conservation activity, and dive-site contribution gaps. It is intended to answer: what has changed recently, where is safety data available, and where can divers contribute useful observations.

### Dive Sites

Use the Dive Sites section to filter by atoll and search by dive-site name. Sites load progressively from Firestore so the app does not fetch every site upfront.

Expanded dive-site cards show:
- Description and source badges
- Depth, current, visibility, site type, and protected status
- Recent site intelligence from submitted logs
- Map and sketch panels
- AI sketch generation for trusted roles when a shared admin Gemini key is configured

### Quick Log

Quick Log captures dive profile and citizen-science observations:
- Site, date, depth, duration, visibility, current, temperature, and notes
- Species observations
- Reef health and coral condition observations
- Marine debris reports
- Safety conditions and hazards
- Media evidence where supported

Saved logs write to Firestore and can also create site-condition reports used by site intelligence.

### Logbook

The Logbook shows a diver's saved dive history. Each dive remains linked to the user and selected site.

### Field Guide

The Field Guide lists Maldives-relevant marine life and allows users to record sightings. The data model supports scientific names, categories, rarity, and user contributions.

### Pro Module

Pro access is controlled by `proSubscriptions/{uid}` in Firestore. Active Pro users can use dive-planning workflows:
- Individual dive plans
- Dive-centre group planning
- Safety checklists
- Equipment checklists
- Emergency and briefing notes

Admins can manually activate or verify Pro access.

### Settings

For administrators, Profile becomes a broader Settings area:
- User management
- Role and access management
- App settings
- Shared Gemini API key for Pro/trusted AI features
- Review queue preview

Normal users see only their own profile-related settings.

## Roles And Permissions

AtollFeeNa uses role-based access control through the `users` collection and Firestore rules.

Main roles:
- `recreational-diver`: logs dives and contributes basic observations
- `verified-contributor`: higher-trust contributor
- `dive-professional`: can publish trusted dive-site information and sketch instructions
- `dive-centre-manager`: manages operationally relevant site information
- `marine-science-reviewer`: reviews conservation and ecological information
- `platform-admin`: manages users, settings, dive sites, moderation, and Pro access

Admins can assign roles in Settings > User Management.

## Architecture

### Frontend

AtollFeeNa is a React 19 single-page app built with Vite and TypeScript.

Main entry points:
- `src/main.tsx`: React app mount
- `src/App.tsx`: app routing, authentication state, safety modal, tab switching
- `src/index.css`: Tailwind-based global styling and design tokens

The app uses internal tab-style routing rather than a URL router. Main screens live in `src/components/screens`.

### Components

Reusable UI is grouped by product area:
- `src/components/home`: home dashboard cards, map visual, compact summaries
- `src/components/dive-sites`: dive-site cards, filters, maps, AI description, sketches
- `src/components/quick-log`: quick log panels and review flow
- `src/components/pro`: Pro upgrade, dive planning form, plan cards
- `src/components/settings`: admin settings, user management, review queue
- `src/components/profile`: user profile and legacy AI-key cleanup notice

### Hooks

Data fetching and business logic live in `src/hooks`:
- `useFilteredDiveSites`: server-side filtered dive-site loading
- `useDiveSiteStats`: count queries and key dive-site metrics
- `useDives`: dive log writes and derived site-condition report writes
- `useHomeDashboard`: lightweight dashboard aggregation
- `useSiteIntelligence`: recent site safety and observation summaries
- `useUserRole`: role and admin permission checks
- `useAdminUsers`: admin user list and role/status updates
- `useProAccess`: Pro subscription and payment-request state
- `useDivePlans`: Pro dive-planning records
- `useDiveSiteDescriptionAI`: AI-assisted dive-site description generation
- `useSiteSketch`: AI-generated/cached dive-site sketches
- `useAppSettings`: app-wide settings, including shared Gemini key

### Firebase

Firebase is the primary backend:
- Authentication: Google sign-in
- Firestore: app data, roles, logs, dive sites, Pro subscriptions
- Storage: uploaded media and generated dive-site sketches
- Hosting: production deployment

Key files:
- `src/lib/firebase.ts`: Firebase app setup, Auth helpers, profile sync, error wrapping
- `functions/index.js`: server-side BML Swipe payment creation and verification
- `firestore.rules`: Firestore authorization and validation
- `storage.rules`: Storage permissions
- `firebase.json`: hosting, Firestore, and Storage configuration
- `firebase-applet-config.json`: Firebase client config

### Firestore Collections

Important collections:
- `users`: user profiles, role, access status, units
- `admins`: admin identity shortcut
- `diveSites`: canonical dive-site records
- `diveSiteEditSuggestions`: contributor description suggestions and AI-assisted drafts
- `diveLogs`: personal dive logs and observations
- `siteConditionReports`: recent safety and condition reports derived from logs
- `marineLife`: field guide records
- `atolls`: configured atoll list
- `appSettings/main`: app configuration and admin Gemini key
- `proSubscriptions`: Pro access status
- `paymentTransactions`: BML payment request records
- `divePlans`: Pro dive plans

### BML Swipe Payments

The Pro upgrade flow uses Bank of Maldives Swipe through Firebase Functions:
- The browser calls `createSwipeProPayment`.
- The function authenticates with Swipe using server-side `SWIPE_CLIENT_ID` and `SWIPE_CLIENT_SECRET`.
- Swipe returns a hosted payment link.
- The app opens the link and stores a pending `paymentTransactions` record.
- `verifySwipeProPayment` checks the Swipe payment status and activates `proSubscriptions/{uid}` after successful payment.

Required Functions environment variables:
- `SWIPE_API_BASE`
- `SWIPE_CLIENT_ID`
- `SWIPE_CLIENT_SECRET`
- `SWIPE_AUTH_SCOPE` where required by BML
- `APP_URL`

Do not put Swipe client secrets in Vite/frontend environment variables.

### AI Workflow

AtollFeeNa uses Google Gemini through `@google/genai`.

AI features:
- AI-assisted dive-site descriptions with Google Search grounding
- AI-generated dive-site sketches from reviewed sketch instructions

The Gemini key is configured by an administrator in App Settings and read by Pro/trusted users through Firestore rules. The app does not require each Pro user to enter their own key.

### Data Seeding And Imports

Scripts:
- `npm run seed:firestore`: seed core Firestore data
- `npm run seed:sample-activity`: seed dashboard/sample activity
- `npm run seed:pro`: seed Pro sample data
- `npm run import:scraped-sites`: import scraped dive-site data

Seed/import scripts should be rerunnable and keep database-backed data out of UI components.

## Libraries Used

Runtime dependencies:
- `@google/genai`: Gemini AI text, search-grounded generation, and image generation calls
- `@tailwindcss/vite`: Tailwind CSS integration for Vite
- `@vitejs/plugin-react`: React plugin for Vite
- `clsx`: conditional class name composition
- `d3`: data visualization utilities
- `date-fns`: date formatting and time-window calculations
- `dotenv`: environment variable loading for scripts
- `express`: lightweight server support where needed by tooling or local scripts
- `firebase`: Firebase Auth, Firestore, Storage, and Hosting client SDK
- `leaflet`: map rendering engine
- `lucide-react`: icon set
- `motion`: animation and transition library
- `react`: UI framework
- `react-dom`: React DOM renderer
- `react-leaflet`: React bindings for Leaflet maps
- `react-leaflet-cluster`: marker clustering for map views
- `recharts`: charting components for dashboards/insights
- `tailwind-merge`: Tailwind class conflict resolution
- `vite`: development server and production build tool

Development dependencies:
- `@firebase/eslint-plugin-security-rules`: Firebase security rules lint support
- `@types/express`: TypeScript types for Express
- `@types/leaflet`: TypeScript types for Leaflet
- `@types/node`: TypeScript types for Node.js
- `@types/react`: TypeScript types for React
- `@types/react-dom`: TypeScript types for React DOM
- `autoprefixer`: CSS vendor prefix processing
- `tailwindcss`: utility CSS framework
- `tsx`: TypeScript script runner
- `typescript`: static type checking
- `vite`: build/dev tooling

## Local Development

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm run dev
```

### Local BML Swipe Development

Create `functions/.env` from `functions/.env.example` and add the Swipe sandbox/dev credentials:

```bash
SWIPE_API_BASE="https://merchant-api.swipeapp.dev"
SWIPE_CLIENT_ID="..."
SWIPE_CLIENT_SECRET="..."
SWIPE_AUTH_SCOPE=""
APP_URL="http://127.0.0.1:3000"
```

Create local frontend env:

```bash
VITE_USE_FUNCTIONS_EMULATOR="true"
```

Run the Functions emulator in one terminal:

```bash
firebase emulators:start --only functions
```

Run the app in another terminal:

```bash
npm run dev
```

Local URLs:
- App: `http://127.0.0.1:3000`
- Functions emulator: `http://127.0.0.1:5001`
- Emulator UI: `http://127.0.0.1:4000`

If Vite reports a different port, such as `3001`, use that app URL locally and set
`APP_URL` in `functions/.env` to match.

When you click Upgrade with BML Swipe locally, the browser calls the local
`createSwipeProPayment` function, which talks to the Swipe dev API and returns a hosted payment link.

Run checks:

```bash
npm run lint
```

Build:

```bash
npm run build
```

Deploy:

```bash
firebase deploy --only firestore:rules,functions,hosting
```

## Security Notes

- Firestore rules enforce role-aware access and validation.
- Normal users cannot directly update canonical dive-site records unless their role permits it.
- Contributor description edits go to `diveSiteEditSuggestions`.
- Pro access is checked through `proSubscriptions/{uid}`.
- AI keys are managed through admin settings. For production hardening, move AI calls behind server-side functions so the Gemini key is never exposed to client devices.

## Current Technical Gaps

Recommended future hardening:
- Move Gemini calls to Cloud Functions or another trusted backend.
- Add formal review approval actions for dive-site edit suggestions.
- Add stronger structured export mapping for Darwin Core / OBIS / GBIF readiness.
- Add automated tests for Firestore rules and critical save flows.
- Split the large app bundle with route-level dynamic imports.
