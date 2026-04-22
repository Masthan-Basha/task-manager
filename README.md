# TaskManager — Full-Stack REST API + React UI

A production-ready full-stack application built for the Backend Developer Intern assignment.  
Features JWT auth, role-based access, full task CRUD, Swagger docs, and Docker support.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (access + refresh tokens) |
| Frontend | React.js + React Router |
| Docs | Swagger / OpenAPI 3.0 |
| Logging | Winston |
| Security | Helmet, express-rate-limit, bcryptjs |
| Deployment | Docker + Docker Compose |

---

## Project Structure

```
project/
├── backend/
│   ├── src/
│   │   ├── config/         # DB + Swagger config
│   │   ├── controllers/    # authController, taskController, adminController
│   │   ├── middleware/     # auth (JWT), errorHandler, validate
│   │   ├── models/         # User, Task (Mongoose schemas)
│   │   ├── routes/         # authRoutes, taskRoutes, adminRoutes
│   │   ├── utils/          # logger (Winston)
│   │   ├── validators/     # express-validator rules
│   │   ├── app.js          # Express app setup
│   │   └── server.js       # Entry point
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Layout, TaskModal
│   │   ├── context/        # AuthContext (React Context + hooks)
│   │   ├── pages/          # Login, Register, Dashboard, AdminPanel
│   │   ├── services/       # Axios API client with interceptors
│   │   ├── App.js          # Routing
│   │   └── index.js        # Entry point
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```

---

## Quick Start (Local)

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod`)

### 1. Clone & set up backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set MONGO_URI, JWT_SECRET, JWT_REFRESH_SECRET
npm run dev
```

### 2. Set up frontend

```bash
cd frontend
npm install
npm start
```

App runs at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/v1
- Swagger Docs: http://localhost:5000/api-docs

---

## Quick Start (Docker)

```bash
# From project root
docker-compose up --build
```

Then open http://localhost:3000

---

## API Reference (v1)

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/register` | No | Register new user |
| POST | `/api/v1/auth/login` | No | Login |
| POST | `/api/v1/auth/refresh` | No | Refresh access token |
| POST | `/api/v1/auth/logout` | Yes | Logout |
| GET | `/api/v1/auth/me` | Yes | Get current user |

### Tasks (JWT required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/tasks` | List tasks (filter, paginate, search) |
| POST | `/api/v1/tasks` | Create task |
| GET | `/api/v1/tasks/stats` | Task stats by status/priority |
| GET | `/api/v1/tasks/:id` | Get one task |
| PUT | `/api/v1/tasks/:id` | Update task |
| DELETE | `/api/v1/tasks/:id` | Delete task |

### Admin (JWT + admin role required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/stats` | Dashboard stats |
| GET | `/api/v1/admin/users` | All users |
| PATCH | `/api/v1/admin/users/:id/role` | Change user role |
| PATCH | `/api/v1/admin/users/:id/status` | Toggle active status |

---

## Database Schema

### User
```
_id, name, email, password (hashed), role (user|admin),
refreshToken, isActive, lastLogin, createdAt, updatedAt
```

### Task
```
_id, title, description, status (todo|in-progress|done),
priority (low|medium|high), dueDate, tags[], owner (ref: User),
createdAt, updatedAt
```

---

## Security Practices

- **Password hashing** — bcryptjs with cost factor 12
- **JWT** — Short-lived access tokens (15m) + long-lived refresh tokens (7d)
- **Refresh token rotation** — New refresh token issued on each refresh
- **Rate limiting** — 100 req/15min globally, 10 req/15min on auth routes
- **Helmet** — Sets security HTTP headers
- **Input validation** — express-validator on all routes
- **CORS** — Restricted to frontend origin only
- **Role-based access** — `protect` + `authorize` middleware
- **Sensitive field filtering** — password/refreshToken excluded from all API responses

---

## Scalability Notes

### Horizontal Scaling
- Stateless JWT auth — no server-side sessions; any instance can validate tokens
- MongoDB supports replica sets and sharding for high-volume data
- Add a load balancer (nginx / AWS ALB) in front of multiple API instances

### Caching (optional extension)
- Use Redis to cache task lists and stats per user
- Cache TTL ~60s; invalidate on mutations

### Microservices Path
- Auth Service — handles registration, login, token management
- Task Service — handles CRUD, search, notifications
- Admin Service — user management, analytics
- Communicate via REST or message queues (RabbitMQ / Kafka)

### Infrastructure
- Containerized with Docker — deploy to AWS ECS, GCP Cloud Run, or Kubernetes
- CI/CD via GitHub Actions → Docker Hub → deploy
- Centralized logging with Winston → send to Datadog / CloudWatch

---

## Evaluation Checklist

- ✅ User registration & login with bcrypt + JWT
- ✅ Role-based access (user vs admin)
- ✅ CRUD APIs for Tasks with pagination, filtering, search
- ✅ API versioning (`/api/v1/`)
- ✅ Centralized error handling & validation
- ✅ Swagger/OpenAPI documentation at `/api-docs`
- ✅ MongoDB schema with indexes
- ✅ React frontend: register, login, dashboard, CRUD
- ✅ JWT token auto-refresh in frontend
- ✅ Error/success feedback via toast notifications
- ✅ Secure JWT handling + input sanitization
- ✅ Docker deployment ready
- ✅ Scalability notes

---

*Built with ❤️ for the Primetrade.ai Backend Intern Assignment*
