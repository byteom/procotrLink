# ProctorLink

Secure Online Examinations with a student-focused Grow & Career Hub. Built with Next.js (App Router), Firebase (Auth + Firestore), and a reusable UI system.


## Table of Contents
- Overview
- Features
- Architecture
- Tech Stack
- Quick Start
- Environment Configuration
- Firebase Setup
- Available Scripts
- Project Structure
- Data Model (Firestore)
- Development Workflow
- Deployment
- Troubleshooting
- Documentation
- Contributing
- License


## Overview
ProctorLink enables organizers to create, manage, and analyze secure online exams, while students can take exams, view results, and continuously upskill via the Grow & Career Hub (courses, learning paths, resume improvement, AI mock interviews, quizzes, question bank, roadmaps). The system respects access control, attempts, expiries, and paused states, with an AI assist for exam creation.


## Features
- Admin/Organizer
  - Create/edit/pause exams with questions, timers, attempts, expiry, and tags
  - Restrict access to specific email addresses
  - View results and basic analytics
  - AI-powered question and description generation
- Student
  - Authentication (Firebase Auth)
  - Dashboard with past submissions and performance
  - Available exams list (public + restricted, excluding paused)
  - Exam starting flow with restriction and attempt checks
  - Grow & Career Hub with dedicated pages:
    - Recommended Courses (dynamic topics based on low-score tags + friendly defaults)
    - Learning Path Generator, Resume Improvement, AI Mock Interviews
    - Practice Quizzes, Interview Question Bank, Career Roadmaps
- UX
  - Reusable components, consistent padding/spacing
  - Sticky layout for Career Hub with breadcrumbs and footer


## Architecture
- Frontend: Next.js (App Router), React components, shadcn/ui-based UI primitives
- Backend: Firebase Auth + Firestore (no custom server required)
- AI: Genkit flows for question/description generation

High-level diagram:
```mermaid
flowchart LR
  subgraph Client [Next.js App]
    A[UI Components / Pages]
    B[Auth Context]
    C[Hooks (toast, mobile)]
  end

  subgraph Backend [Firebase]
    D[Firestore]
    E[Authentication]
  end

  subgraph AI[Genkit / AI Flows]
    F[generate-exam-questions]
    G[generate-exam-description]
  end

  A <--> D
  A <--> E
  A <--> F
  A <--> G
  B --> E
  C --> A
```


## Tech Stack
- Next.js 14+ (App Router)
- React 18+
- TypeScript
- Firebase Auth & Firestore
- TailwindCSS + shadcn/ui components


## Quick Start
1) Clone and install
```bash
npm install
```
2) Configure environment (see Environment Configuration)
3) Start dev server
```bash
npm run dev
```
4) Open `http://localhost:3000`


## Environment Configuration
Create `.env.local` in `procotrLink/` with your Firebase config (see `src/lib/firebase.ts` for expected keys). Typical values:
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```
If you use AI/Genkit or other providers, add those keys as documented in `src/ai/genkit.ts`.


## Firebase Setup
- Create a Firebase project
- Enable Authentication (Email/Password at minimum)
- Enable Firestore in Native mode
- Optional: set up security rules to restrict writes/reads (see docs)
- Copy Firebase web app config into `.env.local`


## Available Scripts
- `npm run dev` – start development server
- `npm run build` – production build
- `npm run start` – start production server (after build)
- `npm run lint` – run linter


## Project Structure
```
src/
  ai/
    dev.ts
    genkit.ts
    flows/
      generate-exam-description.ts
      generate-exam-questions.ts
  app/
    dashboard/
      create/page.tsx
      edit/[id]/page.tsx
      results/page.tsx
      layout.tsx
      page.tsx
    exam/[id]/
      page.tsx         # exam details (start)
      verify/page.tsx  # verification step
      take/page.tsx    # taking the exam
    student/
      dashboard/
        submission/[id]/page.tsx
        layout.tsx
        page.tsx
      profile/page.tsx
      skills/
        layout.tsx     # reusable Career Hub header/breadcrumbs/footer
        page.tsx       # hub landing with dynamic recommendations
        courses/page.tsx
        path/page.tsx
        resume/page.tsx
        interview/page.tsx
        quiz/page.tsx
        questions/page.tsx
        roadmap/page.tsx
    legal/
      terms/page.tsx
      privacy/page.tsx
    login/page.tsx
    signup/page.tsx
    page.tsx           # public landing
  components/ui/       # reusable UI components (shadcn/ui based)
  context/
    AuthContext.tsx
  hooks/
    use-toast.ts
    use-mobile.tsx
  lib/
    firebase.ts
    rbac.tsx
    utils.ts
public/
  ... assets, icons, logos
```


## Data Model (Firestore)

Users `users/{uid}`
- `fullName: string`
- `email: string` (from auth; read-only in UI)
- `college: string`
- `graduationYear: string`

Exams `exams/{id}`
- `title: string`
- `description: string`
- `tags: string[]`
- `questions: { questionText: string; options: string[]; correctAnswer: string; timeLimit?: number }[]`
- `timeLimit: number | null`
- `perQuestionTimer: boolean`
- `allowedAttempts: number`
- `expiryDate: Timestamp | null`
- `restrictToEmails: boolean`
- `allowedEmails: string[]`
- `isPaused: boolean`
- `createdAt: Timestamp`

Submissions `submissions/{id}`
- `examId: string`
- `examTitle: string`
- `participantName: string`
- `participantEmail: string`
- `collegeName: string`
- `passingYear: string`
- `score: number`
- `totalQuestions: number`
- `submittedAt: Timestamp`

Recommended Indexes
- `exams.createdAt` (orderBy desc)
- `submissions.examId`
- `submissions.participantEmail`


## Development Workflow
- Use feature branches and pull requests
- Keep components small and reusable; avoid deep nesting
- Prefer semantic queries to Firestore and handle errors with toasts
- Use `AuthContext` for authenticated state in client components
- Follow code style: descriptive naming, minimal comments except where critical


## Deployment
- Build: `npm run build`
- Run: `npm run start`
- Hosted on your platform of choice (Vercel, Firebase Hosting, etc.)
- Ensure `.env` is set in the deployment environment


## Troubleshooting
- Missing lucide icon exports: replace with available icons (e.g., `Bot` instead of `Robot`).
- Firestore permission denied: verify rules and user auth state.
- Composite index errors: simplify queries or add required Firestore indexes.
- AI features not working: check API keys and `src/ai/genkit.ts` configuration.


## Documentation
- Platform overview and diagrams: `docs/PROCTORLINK_DOCUMENTATION.md`
- Software Requirements Specification (SRS): `docs/SRS.md`
- Design blueprint (if any): `docs/blueprint.md`


## Contributing
- Submit PRs with clear descriptions
- Keep UI consistent with existing styles
- Add concise tests where applicable (unit/integration)


## License
Copyright © ProctorLink. All rights reserved.
