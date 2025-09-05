# Roxiler Fullstack Project

A full-stack web application built with **React (frontend)**, **Express + Prisma (backend)**, and **PostgreSQL (database)**.  
It supports **role-based access** for **Admin, Owner, and User** with JWT authentication.

---

## 🚀 Features
- 🔐 User Authentication (JWT)
- 👨‍💻 Admin Dashboard → Manage users & stores
- 🏪 Owner Dashboard → View store ratings
- 🙋 User Dashboard → Browse & rate stores
- ⭐ Rating system with averages
- 🗄 PostgreSQL database with Prisma ORM

---

## 🛠 Tech Stack
- **Frontend:** React, Bootstrap, Axios
- **Backend:** Node.js, Express, JWT, Bcrypt
- **Database:** PostgreSQL + Prisma ORM

---

## 📂 Project Structure
roxiler-fullstack-assignment/
│── roxiler-backend/ # Express + Prisma backend
│ ├── index.js
│ ├── package.json
│ ├── prisma/
│ │ ├── schema.prisma # DB schema
│ │ └── seed.js # Seed script
│ └── .env.example
│
│── roxiler-frontend/ # React frontend
│ ├── src/
│ │ ├── App.jsx
│ │ ├── index.js
│ │ ├── api.js
│ │ └── pages/...
│ ├── public/
│ ├── package.json
│
│── .gitignore
│── README.md

```bash
git clone https://github.com/your-username/roxiler-fullstack.git
cd roxiler-fullstack-assignment
