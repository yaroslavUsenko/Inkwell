# Blog App

A simple blog web application built with the **MERN stack** (MongoDB, Express, React, Node.js).

## Features

- User registration and login (JWT-based authentication)
- Password reset via email (Nodemailer + Ethereal for testing)
- Create, edit, and delete blog posts
- Leave and delete comments on posts
- User profile with bio and avatar

## Tech Stack

| Layer      | Technology               |
|------------|--------------------------|
| Frontend   | React 18, Vite, React Router v6 |
| Backend    | Node.js, Express 4       |
| Database   | MongoDB (Mongoose ODM)   |
| Auth       | JSON Web Tokens (JWT)    |
| Email      | Nodemailer (Ethereal)    |

## Project Structure

```
lab1/
├── backend/                 # Express REST API
│   ├── models/              # Mongoose schemas (User, Post, Comment)
│   ├── routes/              # Route handlers (auth, users, posts, comments)
│   ├── middleware/          # JWT auth middleware
│   ├── .env.example         # Environment variable template
│   └── server.js            # Entry point
├── frontend/                # React SPA (Vite)
│   └── src/
│       ├── api/             # Axios instance
│       ├── context/         # Auth context
│       ├── components/      # Navbar, PostCard, CommentItem
│       └── pages/           # All page components
├── .gitignore
└── README.md
```

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/try/download/community) running locally (default port 27017)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd lab1
```

### 2. Set up the backend

```bash
cd backend
npm install
cp .env.example .env   # edit if needed
npm run dev
```

The API will start at **http://localhost:5000**.

### 3. Set up the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The app will open at **http://localhost:5173**.

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | — | Register new user |
| POST | /api/auth/login | — | Login |
| POST | /api/auth/forgot-password | — | Request password reset |
| POST | /api/auth/reset-password/:token | — | Reset password |
| GET | /api/users/:id | — | Get user profile |
| PUT | /api/users/:id | ✓ | Update own profile |
| GET | /api/posts | — | List posts (paginated) |
| POST | /api/posts | ✓ | Create post |
| GET | /api/posts/:id | — | Get single post |
| PUT | /api/posts/:id | ✓ | Edit post (author only) |
| DELETE | /api/posts/:id | ✓ | Delete post (author only) |
| GET | /api/posts/:id/comments | — | List comments |
| POST | /api/posts/:id/comments | ✓ | Add comment |
| DELETE | /api/posts/:id/comments/:cid | ✓ | Delete comment (author only) |

## Password Reset (Development)

Because a real SMTP server is not required, Nodemailer uses an **Ethereal** test account. When a reset email is sent, the backend console prints a preview URL like:

```
Password reset email preview URL: https://ethereal.email/message/xxxx
```

Open that URL in the browser to see the email and click the reset link.

## Environment Variables (backend/.env)

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/blog
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```
