<div align="center">

<img width="80" src="https://raw.githubusercontent.com/tailwindlabs/heroicons/master/src/24/outline/bolt.svg" />

# IgnitionX 🔥
### *Ignite Ideas. Accelerate Dreams.*

**Crowdfunding Platform v3.0 — Cinematic Startup Edition**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4-38BDF8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/atlas)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=flat-square&logo=stripe)](https://stripe.com)

</div>

---

## 👥 Team

| Name | Roll No |
|------|---------|
| **Thanishq Reddy** | SE23UCSE062 |
| **Abhiram Reddy** | SE23UCSE060 |
| **Shivakaran Reddy** | SE23UCSE063 |
| **Chirag** | SE23UCSE050 |
| **Jai Sai Karthik** | SE23UCSE040 |

---

## 🎯 Overview

IgnitionX is a **next-generation crowdfunding platform** that combines the core functionality of Kickstarter with the premium UX of Apple, the cinematic presentation of Netflix, and the startup energy of Y Combinator.

Built as a full-stack production-ready MVP with real payments, real-time updates, gamification, AI-powered campaign booster, and a cinema-grade UI.

---

## ⚙️ Tech Stack

### Frontend
- **React 18** + **Vite 5** (lightning-fast dev server)
- **Tailwind CSS v4** (utility-first styling)
- **Framer Motion** (cinematic animations)
- **Zustand** (lightweight global state)
- **Socket.io Client** (real-time updates)
- **Stripe.js + React Stripe** (payment UI)
- **Recharts** (analytics charts)

### Backend
- **Node.js 20** + **Express 4**
- **MongoDB** + **Mongoose** (ODM)
- **JWT** (access + refresh token auth)
- **Socket.io** (WebSocket server)
- **Stripe** (payments + webhooks)
- **Nodemailer** (transactional emails)
- **Cloudinary** (image/video uploads)
- **Winston** (structured logging)
- **Helmet + express-rate-limit** (security)

### Infrastructure
- **Vercel** (frontend deployment)
- **Render / Railway** (backend deployment)
- **MongoDB Atlas** (managed database)
- **Docker + Docker Compose** (containerization)

---

## 🚀 Features

### Core
- [x] JWT Authentication with role-based access (backer / creator / admin)
- [x] Campaign CRUD with rich media
- [x] Stripe payment integration with webhook handling
- [x] Real-time funding progress via Socket.io
- [x] Campaign deadline enforcement + refund logic (7-day window)
- [x] Milestone system with creator updates
- [x] Transactional email notifications (Nodemailer)
- [x] Creator dashboard with analytics
- [x] Campaign discovery with trending algorithm
- [x] Report API (platform stats, creator stats, per-campaign)

### Advanced
- [x] **AI Campaign Booster** framework (score + suggestions)
- [x] **Trending Algorithm** (backers × 3 + views × 0.5 + shares × 2 - age decay)
- [x] **Video pitch uploads** (Cloudinary)
- [x] **Social sharing** with native share API
- [x] **Gamification** — XP, levels, badges (First Spark, Power Backer, etc.)
- [x] **Backer streaks** — daily contribution tracking
- [x] **Real-time notifications** via Socket.io
- [x] **Analytics charts** with Recharts (area chart, daily funding)
- [x] **Nested comment system** with likes
- [x] **Mobile-first UI** — fully responsive
- [x] **Glassmorphism dark theme** with cinematic animations

---

## 📁 Folder Structure

```
ignitionx/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── campaign/       # CampaignCard
│   │   │   ├── layout/         # Navbar, Footer, Layout, ProtectedRoute
│   │   │   └── ui/             # LoadingScreen, NotificationPanel
│   │   ├── pages/              # Home, Discover, CampaignDetail, Dashboard, ...
│   │   ├── store/              # Zustand (authStore)
│   │   ├── lib/                # Axios (api.js)
│   │   ├── App.jsx
│   │   └── index.css           # Global styles + glassmorphism utilities
│   ├── Dockerfile
│   ├── nginx.conf
│   └── vite.config.js
│
├── server/                    # Node.js Backend
│   ├── src/
│   │   ├── config/             # db.js
│   │   ├── controllers/        # auth, campaign, payment, comment
│   │   ├── middleware/         # auth, errorHandler, validate
│   │   ├── models/             # User, Campaign, Contribution, Notification, Comment
│   │   ├── routes/             # All API routes
│   │   ├── services/           # email, notification, gamification
│   │   ├── sockets/            # socket.js (Socket.io)
│   │   ├── utils/              # logger
│   │   └── index.js            # App entry point
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## 🛠️ Local Development Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier)
- Stripe account (test mode)

### 1. Clone & Install

```bash
git clone https://github.com/your-org/ignitionx.git
cd ignitionx

# Install backend
cd server
npm install

# Install frontend
cd ../client
npm install
```

### 2. Configure Environment Variables

**Backend** (`server/.env`):
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/ignitionx
JWT_SECRET=your_super_secret_key_minimum_32_characters
JWT_REFRESH_SECRET=your_refresh_secret_key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=IgnitionX <noreply@ignitionx.io>
CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

**Frontend** (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. Start Development Servers

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

Open `http://localhost:5173` 🚀

---

## 🎳 Stripe Webhook (Local Testing)

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:5000/api/payments/webhook
```

---

## 🚀 Deployment

### Frontend → Vercel

```bash
cd client
npm run build
# Push to GitHub → connect Vercel → set env vars → deploy
```

### Backend → Render

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repo → set root to `server/`
3. Build command: `npm install`
4. Start command: `node src/index.js`
5. Add all environment variables
6. Deploy

### Backend → Railway

```bash
cd server
railway init
railway up
```

### Database → MongoDB Atlas

1. Create a free cluster at [MongoDB Atlas](https://cloud.mongodb.com)
2. Whitelist all IPs (0.0.0.0/0 for production)
3. Create a database user
4. Copy the connection string to `MONGODB_URI`

---

## 🐳 Docker Deployment

```bash
# Copy env vars
cp server/.env.example .env

# Build and run
docker-compose up --build -d

# Logs
docker-compose logs -f server
```

---

## 📊 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register user |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/auth/me` | ✅ | Current user |
| GET | `/api/campaigns` | — | List campaigns |
| POST | `/api/campaigns` | Creator | Create campaign |
| PUT | `/api/campaigns/:id` | Creator | Update campaign |
| POST | `/api/payments/create-intent` | ✅ | Stripe payment intent |
| POST | `/api/payments/webhook` | Stripe | Handle events |
| GET | `/api/notifications` | ✅ | User notifications |
| GET | `/api/reports/creator` | Creator | Analytics |
| GET | `/api/users/leaderboard` | — | XP leaderboard |

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Primary | `#7c3aed` (purple-600) |
| Secondary | `#4f46e5` (indigo-600) |
| Accent | `#06b6d4` (cyan-500) |
| Background | `#050508` |
| Card BG | `rgba(255,255,255,0.03)` |
| Border | `rgba(255,255,255,0.08)` |
| Font | Inter (Google Fonts) |

---

## 📜 License

MIT © 2025 IgnitionX Team — Thanishq Reddy, Abhiram Reddy, Shivakaran Reddy, Chirag, Jai Sai Karthik
