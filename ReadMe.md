# Beleqet — Hiring & Freelance Platform

Full-stack job marketplace with AI-powered candidate screening, CV generation, escrow payments, and real-time chat. Built with NestJS + Next.js.

## Architecture

```
beleqet-interview-task/
├── backend/                  NestJS API (TypeScript, PostgreSQL, Redis, BullMQ)
│   ├── src/modules/          13 feature modules
│   └── prisma/               Database schema & migrations
├── beleqet-jobs-nextjs/      Next.js 14 frontend (App Router, Tailwind)
│   ├── app/                  33 pages (static + dynamic)
│   ├── components/           24 reusable UI components
│   └── lib/                  API client, auth context, utilities
└── docker-compose.yml        Postgres + Redis + backend services
```

## Quick Start

```bash
# Backend
cd backend
cp .env.example .env          # Configure DATABASE_URL, JWT secrets, OPENAI_API_KEY
npm install
docker-compose up -d           # Start Postgres + Redis
npm run prisma:migrate         # Run database migrations
npm run prisma:seed            # Seed demo data
npm run start:dev              # API at http://localhost:4000

# Frontend (separate terminal)
cd beleqet-jobs-nextjs
npm install
npm run dev                    # App at http://localhost:3000
```

## Key Features

- **Job Marketplace** — post jobs, apply with cover letter, track application status
- **AI Screening** — OpenAI scores applications against job descriptions (BullMQ worker)
- **AI CV Builder** — generate summaries, improve descriptions, suggest skills
- **Already Applied UX** — users see applied state instead of duplicate apply button
- **Freelance Marketplace** — gigs, bids, contracts, milestone-based payments
- **Escrow Payments** — Chapa integration with milestone release workflow
- **Real-time Chat** — Socket.IO messaging between employers and candidates
- **User Dashboard** — manage jobs, applications, saved jobs, wallet, messages
- **Role-Based Access** — ADMIN, EMPLOYER, JOB_SEEKER, FREELANCER
- **Telegram Notifications** — job alerts and status updates
- **Pricing Plans** — subscription-based access via Chapa payments

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | NestJS, TypeScript, Prisma, PostgreSQL, Redis, BullMQ |
| Frontend | Next.js 14, Tailwind CSS, framer-motion, lucide-react |
| Auth | JWT (access + refresh tokens), Passport.js |
| AI | OpenAI API (screening + CV features) |
| Payments | Chapa (Ethiopian payment gateway) |
| Messaging | Socket.IO, Telegram Bot API |
| File Upload | Cloudinary (presigned URLs) |
| Container | Docker Compose |

## API Documentation

Swagger UI available at `http://localhost:4000/api/docs` when the backend is running.

## Build

```bash
cd beleqet-jobs-nextjs
npm run build          # 33 pages, all static, zero errors

cd backend
npm run build          # TypeScript → dist/
```
