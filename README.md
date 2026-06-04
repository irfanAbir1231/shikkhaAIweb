# ShikkhaAI Web

A complete **Next.js 15** web application for ShikkhaAI — an AI-powered adaptive learning platform for Bangladeshi students. This web app replicates all existing Flutter features plus all planned features (gamification, study spaces, teacher dashboard, chapter-aware curriculum, focus garden, etc.).

**Live URL:** [https://shikkhaai-web.vercel.app](https://shikkhaai-web.vercel.app) *(coming soon)*

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript 5.5+ |
| **Styling** | Tailwind CSS + shadcn/ui |
| **State (Server)** | TanStack Query (React Query) v5 |
| **State (Client)** | Zustand |
| **Charts** | Recharts |
| **Forms** | React Hook Form + Zod |
| **Markdown** | ReactMarkdown + remark-gfm |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Auth Storage** | httpOnly cookies |

---

## Features

### Implemented
- **Auth** — Login, register, onboarding with JWT httpOnly cookies
- **Dashboard** — Readiness score, weak subjects, streak, improvement charts, recent quizzes, AI recommendations
- **Analytics** — Topic accuracy, weak chapters, improvement history, practice suggestions, stat cards
- **Exam Flow** — Config → Generate → Session (with timer, anti-cheat, navigation grid) → Result → History
- **Topics** — Curriculum topics grouped by subject with completion tracking
- **Library** — Notes CRUD with search, grouped by topic
- **Study Companion** — AI chat with curriculum context, explanation modes, markdown rendering
- **Settings** — Account info, logout

### Planned (Coming Soon)
- **Study Plan** — AI-generated study schedules with calendar and task tracking
- **Focus Session** — Pomodoro timer with plant growth gamification
- **Study Spaces** — PDF upload spaces with scoped AI chat
- **Teacher Dashboard** — Classroom management and student performance heatmaps
- **Gamification** — Points, coins, streaks, plant growth, focus sessions
- **Chapter-Aware Curriculum** — Nested chapter/topic structure
- **Admin Panel** — Curriculum CRUD

---

## Project Structure

```
shikkhaai-web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth layout group (login, register, onboarding)
│   │   ├── (dashboard)/        # Main app layout (sidebar + header)
│   │   │   ├── page.tsx        # Dashboard
│   │   │   ├── analytics/
│   │   │   ├── exam/
│   │   │   ├── topics/
│   │   │   ├── library/
│   │   │   ├── study-companion/
│   │   │   ├── study-plan/     # Placeholder
│   │   │   ├── focus-session/  # Placeholder
│   │   │   ├── spaces/         # Placeholder
│   │   │   ├── teacher/        # Placeholder
│   │   │   └── settings/
│   │   ├── api/                # Next.js API routes (auth proxy, FastAPI proxy)
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layout/             # Sidebar, header
│   │   ├── charts/             # Recharts wrappers
│   │   └── dashboard/          # Dashboard widgets
│   ├── lib/
│   │   ├── api/                # React Query provider
│   │   ├── stores/             # Zustand stores (auth, exam)
│   │   ├── types/              # TypeScript types (mirror backend schemas)
│   │   └── utils/              # Constants, formatters, cn helper
│   └── styles/
│       └── globals.css
├── next.config.ts
├── middleware.ts               # JWT validation, route guards
└── package.json
```

---

## Getting Started

### Prerequisites
- Node.js 22+
- The [ShikkhaAI Backend](https://github.com/yourusername/shikkhaai-backend) running

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/shikkhaai-web.git
cd shikkhaai-web

# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Edit .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
npm start
```

---

## Architecture

### Auth Flow (httpOnly Cookies)
1. User logs in → Next.js API route `/api/auth/login` proxies to FastAPI `/student/login`
2. FastAPI returns JWT → API route sets `token` as httpOnly cookie
3. All subsequent requests: browser auto-sends cookie → Next.js middleware validates → proxies to FastAPI with `Authorization: Bearer` header
4. Logout: API route clears cookie

### API Proxy Pattern
All backend API calls go through `/api/proxy/[...path]` which:
- Reads the JWT cookie
- Forwards the request to the FastAPI backend
- Returns the response

This avoids CORS issues and keeps JWT tokens secure in httpOnly cookies.

---

## Backend Integration

This frontend consumes the existing [ShikkhaAI FastAPI Backend](https://github.com/yourusername/shikkhaai-backend).

### Required Backend Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/student/register` | Register new student |
| POST | `/student/login` | Login |
| GET | `/student/{id}` | Get student profile |
| GET | `/student/{id}/dashboard` | Dashboard data |
| GET | `/student/{id}/analytics` | Analytics data |
| GET | `/student/{id}/topics` | Curriculum topics |
| GET | `/student/{id}/attempts` | Exam history |
| POST | `/exam/generate` | Generate exam |
| POST | `/exam/submit` | Submit exam |
| GET | `/notes` | List notes |
| POST | `/notes` | Create note |
| DELETE | `/notes/{id}` | Delete note |
| POST | `/study-companion/ask` | AI chat |

### Backend CORS Config
Update `backend/.env`:
```
CORS_ORIGINS=https://shikkhaai-web.vercel.app,http://localhost:3000
```

---

## Implementation Plan

### Phase 0: Project Scaffolding ✅
- Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui
- TanStack Query + Zustand
- Folder structure

### Phase 1: Auth & Core Layout ✅
- Login / Register / Onboarding
- Protected layout with sidebar
- httpOnly cookie auth
- Mobile responsive sidebar

### Phase 2: Dashboard & Analytics ✅
- Dashboard with readiness, streak, weak subjects, charts
- Analytics with tabs: Topics, Weakness, History, Practice
- Recharts integration

### Phase 3: Exam Flow ✅
- Exam config with subject/topic/difficulty sliders
- Full-screen exam session with timer
- Question navigation grid
- Anti-cheat tab switch detection
- Result page with score, grade, answer review
- Exam history

### Phase 4: Topics & Library ✅
- Topics browser with progress bars
- Notes CRUD with search and grouping

### Phase 5: Study Companion ✅
- AI chat interface
- Markdown rendering
- Explanation mode selector
- Suggested prompts

### Phase 6-11: Planned Features
See the full implementation plan in the original project docs.

---

## Deployment

### Vercel
1. Push to GitHub
2. Connect repo in Vercel dashboard
3. Set environment variable: `NEXT_PUBLIC_API_URL=https://your-backend-url.com`
4. Deploy

### Backend CORS
Ensure your FastAPI backend allows the Vercel domain:
```env
CORS_ORIGINS=https://shikkhaai-web.vercel.app
```

---

## License

MIT
