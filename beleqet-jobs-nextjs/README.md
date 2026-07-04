# Beleqet Jobs — Next.js Frontend

Production-ready Next.js 14 (App Router) frontend for the Beleqet hiring & freelance platform. Built with Tailwind CSS, featuring job search, AI-powered CV builder, freelance marketplace, escrow payments, and dashboard analytics.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** — design tokens matching the brand system (`brandGreen #00653B`, etc.)
- **lucide-react** for icons
- **framer-motion** for animations
- **EmailJS** for contact form

## Pages

| Route | Description |
|---|---|
| `/` | Homepage with hero, stats, categories, featured jobs |
| `/jobs` | Job listings with search, category, and type filters |
| `/jobs/[id]` | Job detail — apply with cover letter, view "Already Applied" state |
| `/cv-maker` | CV builder with form, live preview, PDF download, AI-powered features |
| `/freelance` | Freelance gig listings |
| `/freelance/[id]` | Gig detail with bid submission |
| `/freelance/post` | Post a new freelance gig |
| `/pricing` | Pricing plans with Chapa payment |
| `/post-job` | Post a new job vacancy |
| `/dashboard` | User dashboard with jobs, applications, saved jobs, messages |
| `/dashboard/profile` | Edit profile and company information |
| `/login`, `/register` | Authentication pages |
| `/about`, `/contact` | Static information pages |

## AI-Powered CV Features

The CV builder at `/cv-maker` includes:

- **Generate with AI** — creates a professional summary from your experience and skills
- **Improve with AI** — rewrites experience descriptions to be more compelling
- **Suggest Skills** — recommends relevant skills based on your work history

These use the backend's OpenAI integration (API key stored server-side).

## Build

```bash
npm run build
npm start
```

Build verified clean — 33 pages generated (static + dynamic), zero errors.
