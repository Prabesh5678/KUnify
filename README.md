<div align="center">

<a href="https://spmp.ku.edu.np">
  <img src="https://img.shields.io/badge/KUnify-SPMP-6C63FF?style=for-the-badge&logoColor=white" alt="KUnify"/>
</a>

# KUnify — Student Project Management Platform

**A full-stack web platform built for Kathmandu University to streamline the entire student project lifecycle — from team formation to weekly progress reviews.**

[![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

[Live Demo](https://spmp.ku.edu.np) · [Report a Bug](https://github.com/Prabesh5678/KUnify/issues) · [Request a Feature](https://github.com/Prabesh5678/KUnify/issues)

</div>

---

## 📌 Overview

KUnify replaces scattered emails, spreadsheets, and manual approvals with a single platform where students, teachers, and administrators collaborate on academic projects. It enforces a structured workflow from day one — ensuring no team goes without a supervisor, no proposal goes unreviewed, and no weekly log goes unmarked.

> Built as a real production system for **Kathmandu University**, currently serving students and faculty at [spmp.ku.edu.np](https://spmp.ku.edu.np).

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔐 **Role-based access** | Separate, isolated portals for Students, Teachers, and Admins — each with its own auth flow and middleware guards |
| 👥 **Team formation** | Create teams with unique 6-character codes; invite members instantly |
| 📄 **Proposal management** | Submit project proposals with title, abstract, keywords, and PDF upload via Cloudinary |
| 🎓 **Supervisor assignment** | Multi-step approval chain — pending → teacher approved → admin approved |
| 📋 **Weekly log tracking** | Students submit weekly activity logs; teachers review, mark (0–5), and request corrections |
| 📊 **Admin dashboard** | System-wide metrics, teacher capacity management, and full approval oversight |
| 📁 **File storage** | Cloudinary integration for proposal PDFs — zero server-side file management |
| 📤 **Data export** | XLSX report generation for admin use |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Users                                │
│   Student (@student.ku.edu.np)  │  Teacher  │  Admin        │
└──────────────┬──────────────────┴─────┬──────┴──────┬───────┘
               │                        │             │
         Google OAuth            Google OAuth    Local Auth
               │                        │        (bcrypt+JWT)
               └────────────────────────┴─────────────┘
                                        │
                    ┌───────────────────▼──────────────────┐
                    │   React 19 Frontend (Vite + Router v7) │
                    │   Student Portal │ Teacher │ Admin     │
                    └───────────────────┬──────────────────┘
                                        │ REST API
                    ┌───────────────────▼──────────────────┐
                    │   Express.js API  (RBAC Middleware)   │
                    │  /student /teacher /team /log         │
                    │  /proposal /admin /logout             │
                    └──────────┬─────────────┬─────────────┘
                               │             │
                    ┌──────────▼───┐   ┌─────▼──────────┐
                    │  MongoDB 8   │   │   Cloudinary    │
                    │  (Mongoose)  │   │  (PDF uploads)  │
                    └──────────────┘   └────────────────┘
```

---

## 🔄 Project Lifecycle

```
 Team Formed  ──▶  Proposal Submitted  ──▶  Supervisor Assigned
                                                    │
              ┌─────────────────────────────────────┘
              ▼
   Weekly Logs (Student submits every week)
              │
              ▼
   Teacher Reviews (mark 0–5 / request correction)
              │
              ├── Correction requested ──▶ Student revises ──▶ Back to review
              │
              └── Approved ──▶ Admin final sign-off
```

---

## 🧱 Tech Stack

### Frontend
- **React 19** with React Router v7 (file-based routing)
- **Vite** for blazing-fast builds and HMR
- **TailwindCSS v4** for utility-first styling
- **Lucide React** for icons
- **react-hot-toast** for notifications

### Backend
- **Node.js + Express.js** REST API
- **MongoDB 8** with **Mongoose** ODM
- **JWT** stored in HTTP-only cookies (one token per role)
- **Bcryptjs** for password hashing
- **Cloudinary SDK** for file uploads
- **XLSX** library for report generation

### Infrastructure
- **Docker Compose** — single command to spin up the entire stack
- **Mongo Express** — browser-based DB UI on port `8081` (dev only)
- Services: `mongodb` · `express-server (:3000)` · `react-client (:5173)`

---

## 🗄️ Data Models

<details>
<summary><strong>Student</strong></summary>

```js
{
  name, email, googleId, avatar,
  department, semester, rollNumber, subjectCode,
  teamId,          // ref → Team
  isTeamLeader,    // boolean
  isApproved,      // boolean (set by admin)
  createdAt, updatedAt
}
```
</details>

<details>
<summary><strong>Team</strong></summary>

```js
{
  name, code,          // 6-char unique invite code
  subject,
  leaderId,            // ref → Student
  members,             // ref[] → Student
  supervisor,          // ref → Teacher
  proposal,            // ref → Proposal
  supervisorStatus:    // notRequested | pending | teacherApproved
                       // | adminApproved | underDeletion
}
```
</details>

<details>
<summary><strong>Teacher</strong></summary>

```js
{
  name, email, googleId, phone,
  specialization, position,
  maxCount,        // default 5
  activeCount, pendingTeams, approvedTeams,
  assignedTeams, deletionTeams,
  activeStatus,    // set by admin
  isProfileCompleted
}
```
</details>

<details>
<summary><strong>LogEntry (weekly progress)</strong></summary>

```js
{
  teamId, date, week,
  activity, outcome,
  isChecked, checkedBy,   // ref → Teacher
  mark,                   // 0–5
  correctionRequested, correctionNote,
  reviewTimeline          // array of correction cycles
}
```
</details>

---

## 🚀 Getting Started

### Prerequisites
- [Docker & Docker Compose](https://docs.docker.com/get-docker/)
- [Node.js 18+](https://nodejs.org) (for local dev without Docker)

### With Docker (recommended)

```bash
git clone https://github.com/Prabesh5678/KUnify.git
cd KUnify
docker compose up --build
```

| Service | URL |
|---|---|
| App | http://localhost:5173 |
| API | http://localhost:3000 |
| DB UI | http://localhost:8081 |

### Local development

```bash
# Install dependencies
cd client && npm install
cd ../server && npm install

# Set environment variables
cp server/.env.example server/.env
# Fill in: MONGO_URI, JWT_SECRET, GOOGLE_CLIENT_ID,
#          CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

# Start both client and server concurrently
npm start   # from root
```

---

## 🔐 Environment Variables

```env
# Server
MONGO_URI=your_mongo_uri
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS (production)
CLIENT_ORIGIN=https://spmp.ku.edu.np
```

---

## 📁 Project Structure

```
kunify/
├── client/                  # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── student/     # Dashboard, Team, Proposal, Logsheet
│   │   │   ├── teacher/     # Dashboard, Projects, Requests, Reviews
│   │   │   └── admin/       # Dashboard, Teachers, Students, Approvals
│   │   ├── components/
│   │   └── main.jsx
│   └── vite.config.js
│
├── server/                  # Express backend
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API route handlers
│   ├── middleware/          # Auth guards per role
│   └── index.js
│
└── docker-compose.yml
```

---

## 👥 User Roles & Permissions

| Action | Student | Teacher | Admin |
|---|:---:|:---:|:---:|
| Create / join team | ✅ | — | — |
| Submit proposal | ✅ | — | — |
| Request supervisor | ✅ | — | — |
| Submit weekly log | ✅ | — | — |
| Review & mark logs | — | ✅ | — |
| Approve supervisor requests | — | ✅ | ✅ |
| Manage teacher accounts | — | — | ✅ |
| View all teams / students | — | — | ✅ |
| Export reports (XLSX) | — | — | ✅ |

---

## 🌐 Deployment

The platform is live at **[spmp.ku.edu.np](https://spmp.ku.edu.np)**.

- CORS is restricted to `localhost` (dev) and `spmp.ku.edu.np` (prod)
- All tokens stored in HTTP-only cookies — no localStorage auth
- Google OAuth restricted to `@ku.edu.np` and `@student.ku.edu.np` domains

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">

Built with ❤️ for Kathmandu University

</div>
