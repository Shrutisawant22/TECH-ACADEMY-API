# 🚀 Tech Academy API (Backend)

A **production-ready full-stack EdTech backend** built with **Node.js, Express, and MongoDB**, powering the Tech Academy platform with secure authentication, course management, enrollments, and admin analytics.

 

## 📌 Overview

Tech Academy API provides:

* 🔐 Secure JWT Authentication (User & Admin)
* 📚 Course Management System
* 🧾 Enrollment & Progress Tracking
* 💳 Payment Integration Ready (UPI / Stripe / Razorpay)
* 📊 Admin Dashboard with Analytics
* 🛡️ Role-Based Access Control
* ⚡ Optimized API Performance

 

## 🏗️ Tech Stack

| Layer    | Technology            |
|   -- |         |
| Backend  | Node.js, Express.js   |
| Database | MongoDB + Mongoose    |
| Auth     | JWT (JSON Web Tokens) |
| Security | Helmet, CORS          |
| Logging  | Morgan                |
| Password | bcryptjs              |

 

## 📂 Project Structure

```
backend/
│
├── controllers/
│   ├── authController.js
│   ├── courseController.js
│   ├── enrollmentController.js
│   └── admin/
│       ├── adminController.js
│       └── dashboardController.js
│
├── models/
│   ├── userModel.js
│   ├── courseModel.js
│   └── enrollmentModel.js
│
├── routes/
│   ├── authRoutes.js
│   ├── courseRoutes.js
│   ├── enrollmentRoutes.js
│   └── admin/
│       └── adminRoutes.js
│
├── middleware/
│   ├── authMiddleware.js
│   └── adminMiddleware.js
│
├── config/
│   └── db.js
│
├── utils/
│
├── .env
├── server.js
└── package.json
```

 

## 🔐 Authentication System

### Features:

* Register & Login
* JWT Token-based auth
* Role-based access (Student / Admin)
* Password hashing (bcrypt)
* Protected routes

### Token Usage:

```
Authorization: Bearer <token>
```

 

## 👤 User Features

* Register/Login
* Browse courses
* Enroll in courses
* Track progress
* View enrolled courses

 

## 🛠️ Admin Features

* Admin Login
* View all users
* View all enrollments
* Dashboard analytics:

  * Total users
  * Courses
  * Enrollments
  * Revenue
  * Completion rate

 

## 📚 API Endpoints

### 🔐 Auth

```
POST   /api/auth/register
POST   /api/auth/login
```

 

### 📘 Courses

```
GET    /api/courses
GET    /api/courses?page=1
```

 

### 🧾 Enrollments

```
POST   /api/enrollments
GET    /api/enrollments/my-courses
PATCH  /api/enrollments/:id/progress
```

 

### 🛠️ Admin

```
POST   /api/admin/login
GET    /api/admin/dashboard
GET    /api/admin/users
GET    /api/admin/enrollments
```

 

## ⚙️ Environment Variables

Create `.env` file in root:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

 

## 🚀 Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/Shrutisawant22/TECH-ACADEMY-API.git
cd TECH-ACADEMY-API
```

 

### 2️⃣ Install Dependencies

```bash
npm install
```

 

### 3️⃣ Setup Environment

Create `.env` file (see above)

 

### 4️⃣ Run Server

```bash
npm run dev
```

or

```bash
node server.js
```

 

## 🔑 Default Admin Setup

Run this script once:

```js
await User.create({
  name: "Admin",
  email: "admin@tech.com",
  password: "admin123",
  role: "admin"
});
```

 

## 📊 Performance Features

* API caching support (304 responses)
* Pagination implemented
* Optimized Mongo queries
* Minimal payload responses

 

## 🛡️ Security Features

* Helmet (HTTP security headers)
* JWT authentication
* Password hashing
* Role-based authorization
* Input validation

 

## 🧪 Testing APIs

Use:

* Postman
* Thunder Client

 
## 📌 Future Enhancements

* 💳 Stripe / Razorpay Integration
* 📜 Certificate Generation
* 📈 Advanced Analytics Charts
* 🔔 Notifications System
* 📂 File Upload (Course Content)
* 🌍 Deployment (Render / AWS)

 

## 👩‍💻 Author

**Shruti Sawant**
Full Stack Developer 🚀
