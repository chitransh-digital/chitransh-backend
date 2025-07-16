chitransh-backend 🔧
A lightweight Node.js + Express backend API powering the Chitransh Digital ecosystem with secure user management, RESTful endpoints, and MongoDB persistence.

🚀 Features
User Management: Registration, login (JWT auth), and role-based access control

Express API: Modular, RESTful routes for handling core operations

MongoDB Integration: Flexible schema using Mongoose models

Security: Password hashing, token verification, and protected routes

🛠️ Requirements
Node.js (v16+)

MongoDB (local or Atlas)

npm or yarn

⚙️ Setup
bash
Copy
Edit
git clone https://github.com/chitransh-digital/chitransh-backend.git
cd chitransh-backend
npm install            # or yarn install
cp .env.example .env   # fill in secrets (e.g. MONGO_URI, JWT_SECRET)
npm run dev            # starts server with live reload
📦 Available Scripts
Command	Description
npm run dev	Start server with nodemon for development
npm start	Launch production-ready server
npm test	Run unit/integration tests (if present)

📄 API Summary
Auth
POST /api/auth/register – Create a new user

POST /api/auth/login – Authenticate and return JWT

Users (Protected)
GET /api/users/ – List users (admin only)

GET /api/users/:id – User detail

(Optional) PUT, DELETE – Update or remove users

🔐 Security Highlights
Bcrypt for secure password storage

JWT tokens for stateless authentication

Middleware to guard routes and enforce permissions

🧪 Testing
Run npm test to execute any unit/integration tests. (Add tests as the project grows!)

