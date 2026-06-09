# FAQ Software

## Overview

This repository contains a full-stack FAQ and forum platform for a student cohort. The app is built with:
- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Express.js + MongoDB + Socket.IO + node-cron
- **Authentication:** JWT-based student sessions and admin login
- **Search:** client-side FAQ search with highlighted matches
- **Forum workflow:** query submission, answer review, and admin moderation

The project is split into:
- `Frontend/` — public FAQ, student forum, admin dashboard UI
- `Backend/` — API server, database models, auth, admin tooling, cron jobs

---

## Key Features

### Public FAQ
- Searchable FAQ page at `/faq`
- Live query matching across question, answer, and category text
- Highlighted search terms in results
- Categorized FAQ listing with accordion view
- Helpful count and peer footnote display for approved community notes

### Cohort Forum
- Secure student forum at `/forum`
- Student login and session management using JWT in `httpOnly` cookies
- Discussion tabs for Samvaad, raising queries, and solving queries
- Password reset flow for first-time or expired student sessions
- Inactivity warning and automatic logout after inactivity

### Admin Dashboard
- Separate admin portal at `/admin`
- Admin login with email/password
- Query detail review, answer approval, rejection, and promotion to FAQ
- Trusted student answer review and override options
- File screenshot preview support inside admin review

### Backend Services
- Express API routes for FAQs, auth, queries, categories, uploads, and notifications
- MongoDB models for `FAQ`, `User`, `Query`, `Category`, and more
- Rate limiting, CORS, Helmet security headers, and no-cache API policy
- Cookie-backed JWT refresh on each authenticated request
- Daily cron digest email generation and hourly cache cleanup

### Additional Functionality
- Category-based FAQ organization and content sorting
- Query and answer flagging support in the backend workflow
- Admin queue and query status tracker in the dashboard
- File upload endpoint for screenshot attachments
- Daily backend cron tasks for maintenance and digest generation

---

## Repository Structure

```
FAQ_SOFTWARE/
├── Frontend/                # React app and UI code
│   ├── src/
│   │   ├── components/      # UI components and forum widgets
│   │   ├── lib/             # axios instances and socket helpers
│   │   ├── pages/           # React route pages
│   │   └── store/           # auth and application state
│   └── package.json
├── Backend/                 # Express API server and services
│   ├── middleware/          # auth guards and socket auth
│   ├── models/              # Mongoose schema definitions
│   ├── routes/              # API route handlers
│   ├── scripts/             # seed and setup helpers
│   ├── services/            # email, similarity, cron, and backend utilities
│   └── server.js            # server bootstrap
├── package.json             # root workspace config
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 18+ / 20+
- npm 10+
- MongoDB Atlas or local MongoDB
- A web browser for the frontend

### Backend Setup

1. Open a terminal in `Backend/`
2. Install dependencies:
   ```bash
   cd Backend
   npm install
   ```
3. Create a `.env` file in `Backend/` with values for:
   - `MONGODB_URI`
   - `CLIENT_URL`
   - `JWT_STUDENT_SECRET`
   - `JWT_ADMIN_SECRET`
   - `BASE_URL`
   - `JWT_INACTIVITY_MINUTES` (optional, default: `10`)

4. Seed initial data (optional):
   ```bash
   npm run seed
   npm run seed:admin
   npm run seed:categories
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Open a terminal in `Frontend/`
2. Install dependencies:
   ```bash
   cd Frontend
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
4. Open the app in the browser at the URL shown by Vite (typically `http://localhost:5173`).

---

## Available Scripts

### Frontend
- `npm run dev` — start Vite development server
- `npm run build` — build production assets
- `npm run preview` — preview production build locally
- `npm run lint` — run ESLint

### Backend
- `npm run dev` — start Express server
- `npm run start` — start production server
- `npm run seed` — seed FAQ data
- `npm run seed:admin` — seed admin user data
- `npm run seed:categories` — seed category data

---

## Environment Variables

### Backend `.env`

Required variables:
- `MONGODB_URI` — MongoDB connection string
- `CLIENT_URL` — allowed frontend origin
- `JWT_STUDENT_SECRET` — student auth JWT secret
- `JWT_ADMIN_SECRET` — admin auth JWT secret
- `BASE_URL` — public backend base URL
- `JWT_INACTIVITY_MINUTES` — session expiration window (default `10`)

### Frontend
The frontend uses `Vite` and expects the API base URL to match the backend origin.

---

## Notes

- The frontend app includes a public FAQ page and a protected forum page.
- Student authentication is managed via secure cookies and JWT session refresh.
- Admin users have a dedicated dashboard separate from student flows.
- The backend enforces rate limits, CORS, and no-cache headers on API endpoints.
- Cron jobs handle background tasks such as digest emails and cache cleanup.

---

## Contribution

1. Fork the repo or clone it locally.
2. Install dependencies in both `Frontend/` and `Backend/`.
3. Follow the feature implementation order in the project spec when adding new functionality.
4. Keep frontend components reusable and backend routes thin.

---

## License

This repository is currently private and intended for the cohort FAQ and forum project.
