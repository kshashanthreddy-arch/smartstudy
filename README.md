# SmartStudy — Student Study Management System

Full-stack starter project using React + Vite, Node.js, Express, and MongoDB.

## Requirements
- Node.js 18+
- MongoDB Atlas connection string or local MongoDB

## Setup

### 1. Backend
```bash
cd backend
copy .env.example .env
npm install
```
Edit `backend/.env` and set `MONGODB_URI` and a long `JWT_SECRET`, then run:
```bash
npm run dev
```
Backend runs at http://localhost:5000

### 2. Frontend
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the URL shown by Vite (usually http://localhost:5173).

## Included
- Register and login with JWT
- Dashboard summary
- Create, list, complete, and delete study tasks
- Create and list subjects
- Create and list exams
- Basic Pomodoro timer UI
- MongoDB models and protected API routes

## Important
This is a functional starter/template, not a finished production system. Keep `.env` private and never commit real credentials. The frontend stores the JWT in localStorage for this student project; production apps should consider stronger session storage and additional security controls.
