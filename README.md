# ⚡ TaskFlow — Team Task Manager

A full-stack team task management app with role-based access control, real-time dashboards, and a polished UI.

---

## 🚀 Live Demo

- **Frontend:** `https://taskflow-frontend.up.railway.app`
- **Backend API:** `https://taskflow-backend.up.railway.app`

**Demo credentials:**
| Role | Email | Password |
|------|-------|----------|
| Admin | alice@taskflow.com | password123 |
| Member | bob@taskflow.com | password123 |

---

## ✨ Features

- 🔐 **JWT Authentication** — Signup, login, protected routes
- 📁 **Project Management** — Create projects, invite members, set colors
- ✅ **Task Tracking** — Create, assign, update tasks with status & priority
- 📊 **Dashboard** — Stats, progress bars, overdue alerts, recent activity
- 🗂 **Kanban Board** — Visual board view (Todo / In Progress / Done)
- 👥 **Role-Based Access Control** — Admins manage everything; Members update task status only
- 🔴 **Overdue Detection** — Tasks past due date are highlighted

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT + bcryptjs |
| Deployment | Railway |

---

## 📁 Project Structure

```
taskflow/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma         # DB schema
│   └── src/
│       ├── config/               # Prisma client
│       ├── controllers/          # Auth, Projects, Tasks, Users
│       ├── middleware/           # JWT auth, RBAC, validation, errors
│       ├── routes/               # Express routers
│       ├── utils/                # Seed script
│       └── index.js              # App entry point
├── frontend/
│   └── src/
│       ├── components/           # UI, auth, task, dashboard components
│       ├── context/              # Auth context
│       ├── pages/                # Route-level pages
│       ├── services/             # Axios API service
│       └── App.jsx               # Router setup
└── README.md
```

---

## ⚙️ Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL running locally

### Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in your DATABASE_URL and JWT_SECRET

npm install
npx prisma db push
npm run db:seed      # Optional: seed demo data
npm run dev
```

Backend runs at `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api

npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## 🌐 Railway Deployment

### Backend

1. Create a new Railway project
2. Add a **PostgreSQL** service
3. Add a **new service** from your GitHub repo (point to `/backend`)
4. Set environment variables:
   ```
   DATABASE_URL     → (auto-filled from Railway PostgreSQL)
   JWT_SECRET       → your-random-secret
   JWT_EXPIRES_IN   → 7d
   NODE_ENV         → production
   FRONTEND_URL     → https://your-frontend.up.railway.app
   ```

### Frontend

1. Add another service in the same Railway project (point to `/frontend`)
2. Set environment variables:
   ```
   VITE_API_URL → https://your-backend.up.railway.app/api
   ```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login + get JWT |
| GET | `/api/auth/me` | Get current user |

### Projects
| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `/api/projects` | ✅ | Any member |
| POST | `/api/projects` | ✅ | Authenticated |
| GET | `/api/projects/:id` | ✅ | Member |
| PATCH | `/api/projects/:id` | ✅ | Admin |
| DELETE | `/api/projects/:id` | ✅ | Admin |
| POST | `/api/projects/:id/members` | ✅ | Admin |
| DELETE | `/api/projects/:id/members/:userId` | ✅ | Admin |

### Tasks
| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `/api/tasks/dashboard` | ✅ | Any |
| GET | `/api/tasks/my` | ✅ | Any |
| GET | `/api/tasks/project/:id` | ✅ | Member |
| POST | `/api/tasks/project/:id` | ✅ | Admin |
| GET | `/api/tasks/:id` | ✅ | Member |
| PATCH | `/api/tasks/:id` | ✅ | Admin (full) / Member (status only) |
| DELETE | `/api/tasks/:id` | ✅ | Admin |

---

## 🔒 RBAC Rules

| Action | Admin | Member |
|--------|-------|--------|
| Create/delete project | ✅ | ❌ |
| Add/remove members | ✅ | ❌ |
| Create/delete tasks | ✅ | ❌ |
| Update any task field | ✅ | ❌ |
| Update task **status** | ✅ | ✅ |
| View project & tasks | ✅ | ✅ |

---

## 🌱 Seed Data

Run `npm run db:seed` in the backend to populate demo data including:
- 3 users (1 admin, 2 members)
- 1 sample project
- 6 tasks in various states (including 1 overdue)
