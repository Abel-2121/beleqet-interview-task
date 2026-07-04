# Beleqet Backend — NestJS API

Production-ready NestJS backend for the Beleqet hiring & freelance platform with PostgreSQL, BullMQ background workers, AI-powered screening, escrow payments, and Telegram notifications.

## Quick Start

```bash
# 1. Start Postgres + Redis
docker-compose up -d

# 2. Set up environment
cp .env.example .env
# Fill in DATABASE_URL, JWT secrets, OPENAI_API_KEY, CHAPA_SECRET_KEY

# 3. Install dependencies
npm install

# 4. Generate Prisma client + run migrations
npm run prisma:generate
npm run prisma:migrate

# 5. Seed demo data
npm run prisma:seed

# 6. Start in dev mode (hot reload)
npm run start:dev
```

**API** → http://localhost:4000/api/v1  
**Swagger** → http://localhost:4000/api/docs

---

## Module Map

```
src/
├── main.ts                        Bootstrap — Swagger, CORS, pipes, helmet
├── app.module.ts                  Root module — wires everything together
├── prisma/
│   ├── prisma.service.ts          PrismaClient wrapper (global singleton)
│   └── prisma.module.ts           @Global module
├── common/
│   ├── guards/
│   │   ├── jwt-auth.guard.ts      Protects routes needing auth
│   │   └── roles.guard.ts         RBAC — ADMIN / EMPLOYER / JOB_SEEKER / FREELANCER
│   ├── decorators/
│   │   ├── current-user.decorator.ts   @CurrentUser() param decorator
│   │   └── roles.decorator.ts          @Roles('EMPLOYER')
│   ├── filters/
│   │   └── http-exception.filter.ts    Consistent JSON error responses
│   ├── interceptors/
│   │   └── logging.interceptor.ts      Request/response timing logs
│   └── pipes/
│       └── parse-uuid.pipe.ts          UUID validation pipe
└── modules/
    ├── auth/                          JWT register/login/refresh/logout, profile
    ├── users/                         Profile, company, notifications
    ├── admin/                         Admin dispute resolution endpoints
    ├── jobs/                          Job CRUD + paginated search
    ├── applications/                  Submit, update, status management
    ├── screening/                     BullMQ worker — OpenAI scoring
    ├── notifications/                 BullMQ worker — Telegram/in-app
    ├── analytics/                     BullMQ worker — event logging
    ├── freelance/                     Gigs, bids, contracts, milestones
    ├── escrow/                        Chapa webhook + auto-release
    ├── wallet/                        Balance management + withdrawal
    ├── payments/                      Pricing plans, plan-based access
    ├── uploads/                       Presigned URL generation for file uploads
    ├── chat/                          WebSocket-based messaging (Socket.IO)
    ├── saved-jobs/                    Save/favourite jobs for later
    ├── telegram/                      Telegram bot integration for alerts
    ├── search/                        Phase 2 — Elasticsearch stub
    ├── cv/                            AI-powered CV features: summary generation,
    │                                 description improvement, skill suggestions
    └── queues/                        Queue name constants
```

---

## Event-Driven Workflow

```
POST /api/v1/applications
  ApplicationsService.submit()
  ├── DB: Application { status: SUBMITTED }
  ├── Queue → screen-candidate         ← ScreeningProcessor
  ├── Queue → notify-recruiter-*       ← ScreeningProcessor
  └── Queue → update-job-stats         ← AnalyticsProcessor

ScreeningProcessor
  ├── OpenAI: score cover letter vs JD  (0–100)
  ├── DB: CandidateScore saved
  ├── DB: Application → SHORTLISTED | REJECTED | SCREENING
  ├── Queue → send-in-app (candidate)   ← NotificationsProcessor
  ├── Queue → send-telegram (recruiter) ← NotificationsProcessor
  ├── if score ≥ 90: schedule-interview ← ScreeningProcessor
  └── Queue → log-platform-event        ← AnalyticsProcessor

POST /api/v1/escrow/callback (Chapa webhook)
  EscrowProcessor.handleWebhook()
  ├── DB: EscrowTransaction { status: FUNDED }
  ├── DB: FreelanceJob { status: FUNDED }
  └── Queue → send-in-app (client)      ← NotificationsProcessor

PATCH /api/v1/escrow/milestones/:id/release
  EscrowService.releaseMilestone()
  └── Queue → auto-release (3-day delay) ← EscrowProcessor
        ├── DB: Wallet pending→available
        ├── DB: WalletTransaction
        └── Queue → send-in-app + telegram ← NotificationsProcessor
```

---

## API Route Reference

```
Auth
  POST   /auth/register
  POST   /auth/login
  POST   /auth/refresh
  POST   /auth/logout                              🔒
  GET    /auth/me                                  🔒

Users
  GET    /users/profile                            🔒
  PATCH  /users/profile                            🔒
  GET    /users/company                            🔒
  POST   /users/company                            🔒
  GET    /users/notifications                      🔒
  PATCH  /users/notifications/:id/read             🔒

Jobs
  GET    /jobs                  ?q=&category=&location=&type=&page=&limit=
  GET    /jobs/:id
  POST   /jobs                                      🔒 EMPLOYER
  PATCH  /jobs/:id                                  🔒 EMPLOYER
  DELETE /jobs/:id                                  🔒 EMPLOYER
  GET    /jobs/my                                   🔒 EMPLOYER

Applications
  POST   /applications                              🔒 → triggers AI screening
  GET    /applications/my                           🔒
  GET    /applications/job/:id                      🔒 EMPLOYER
  GET    /applications/:id                          🔒
  PATCH  /applications/:id/status                   🔒 EMPLOYER
  PATCH  /applications/:id                          🔒 (update content)

Saved Jobs
  GET    /saved-jobs                                🔒
  POST   /saved-jobs                                🔒
  DELETE /saved-jobs/:id                            🔒

CV (AI-powered)
  POST   /cv/generate-summary                       🔒
  POST   /cv/improve-description                    🔒
  POST   /cv/suggest-skills                         🔒

Freelance
  GET    /freelance/jobs
  GET    /freelance/jobs/:id
  POST   /freelance/jobs                            🔒
  POST   /freelance/jobs/:id/bids                   🔒
  PATCH  /freelance/bids/:id/accept                 🔒
  GET    /freelance/my-bids                         🔒
  GET    /freelance/contracts/:id                   🔒
  PATCH  /freelance/milestones/:id/approve          🔒

Escrow
  POST   /escrow/initiate/:gigId                    🔒
  POST   /escrow/callback                    (Chapa webhook, no auth)
  POST   /escrow/milestones/:id/release             🔒

Wallet
  GET    /wallet                                    🔒
  POST   /wallet/withdraw                           🔒

Payments
  POST   /payments/initiate-plan                    🔒
  POST   /payments/callback                  (Chapa webhook, no auth)

Chat
  WebSocket /chat (Socket.IO namespace)
  GET    /chat/conversations                        🔒
  GET    /chat/conversations/:id/messages           🔒
  POST   /chat/messages                             🔒

Uploads
  POST   /uploads/presigned-url                     🔒

Admin
  GET    /admin/disputes                            🔒 ADMIN
  POST   /admin/disputes/:id/resolve                🔒 ADMIN

Telegram
  POST   /telegram/start?chatId=xxx                 🔒
  POST   /telegram/stop?chatId=xxx                  🔒

Payments — Plan-based subscriptions
  POST   /payments/initiate-plan                    🔒
  POST   /payments/callback                  (Chapa webhook)
```

---

## Environment Variables

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | `postgresql://user:pass@host:5432/db` |
| `REDIS_HOST` | Yes | Default: `localhost` |
| `REDIS_PORT` | Yes | Default: `6379` |
| `JWT_ACCESS_SECRET` | Yes | `openssl rand -hex 64` |
| `JWT_REFRESH_SECRET` | Yes | Separate secret for refresh tokens |
| `OPENAI_API_KEY` | Yes | AI screening + CV features |
| `TELEGRAM_BOT_TOKEN` | Recommended | Job alert notifications |
| `CHAPA_SECRET_KEY` | Freelance | Escrow payments |
| `CHAPA_WEBHOOK_SECRET` | Freelance | Webhook signature verification |
| `CLOUDINARY_CLOUD_NAME` | Uploads | File upload storage |
| `CLOUDINARY_API_KEY` | Uploads | File upload storage |
| `CLOUDINARY_API_SECRET` | Uploads | File upload storage |

---

## Scripts

```bash
npm run start:dev       # Hot-reload development server
npm run build           # Compile TypeScript → dist/
npm run start:prod      # Run compiled production build
npm run prisma:generate # Regenerate Prisma client after schema changes
npm run prisma:migrate  # Apply pending migrations
npm run prisma:seed     # Seed demo data
npm run prisma:studio   # Open Prisma Studio (DB GUI)
npm run test            # Run unit tests
npm run test:cov        # Test coverage report
```
