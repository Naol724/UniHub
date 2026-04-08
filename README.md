# UniHub - Smart University Collaboration Platform

A full-stack web application designed to improve how university students collaborate, manage projects, and share knowledge.

## 🎯 Project Overview

UniHub simulates a real-world software development environment while solving genuine collaboration challenges faced by student teams. The platform brings together task management, real-time communication, file sharing, and team coordination into a single, cohesive experience.

## 🏗️ Project Structure

```
project-root/
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── hooks/
│       ├── utils/
│       ├── App.jsx
│       └── main.jsx
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── services/
│   ├── config/
│   └── server.js
│
├── database/
│   ├── schema/
│   ├── migrations/
│   └── seed/
│
└── README.md
```

## 🛠️ Technology Stack

### Frontend
- ⚛️ React
- 🎨 Tailwind CSS
- 🔄 Axios
- 🛤️ React Router

### Backend
- 🟢 Node.js
- 🌐 Express.js
- 🍃 MongoDB
- 🔐 JWT Authentication
- 🔌 Socket.io (Real-time)

### Security & Development
- 🔒 bcrypt (Password hashing)
- 📦 dotenv (Environment variables)
- 📤 multer (File uploads)
- 🧪 Jest (Testing)

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Naol724/UniHub.git
   cd UniHub
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp ../.env.example .env
   # Configure your environment variables
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB service
   mongod
   ```

## 🔧 Environment Variables

Copy `.env.example` to `.env` and configure:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/unihub
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:3000
```

## 📋 Core Features

- **🔐 User Management** - Secure authentication with JWT
- **👥 Team Collaboration** - Create teams, assign roles, invite members
- **📋 Task Management** - Kanban board with drag-and-drop
- **💬 Real-Time Chat** - Team messaging powered by Socket.io
- **📁 Resource Sharing** - File uploads and organization
- **🔔 Notifications** - Real-time alerts and updates
- **📊 Dashboard & Analytics** - Central hub with insights
- **🛡️ Admin Panel** - Advanced management features

## 👥 Team Distribution

This project is designed for 14 students working in coordinated teams:

- **Frontend Team (5 students)** - UI/UX, Components, Routing, API Integration
- **Backend Team (4 students)** - Server Setup, Authentication, APIs, Middleware
- **Database Team (2 students)** - Schema Design, Implementation, Optimization
- **Testing Team (2 students)** - Functional Testing, Bug Tracking
- **Integration Lead (1 student)** - Coordination, Code Review, Merging

## 🔄 Git Workflow

1. **Always work on feature branches** from `dev`
2. **Never push to main** branch
3. **Create Pull Requests** to `dev` branch
4. **Team Lead reviews and merges** all PRs

```bash
git checkout dev
git pull origin dev
git checkout -b feature/your-task-name
# Work on your feature
git add .
git commit -m "Clear message describing your work"
git push origin feature/your-task-name
# Create PR to dev branch
```

## 📱 Application Screens

1. **Login/Register** - Authentication pages
2. **Dashboard** - Central hub with stats and activity
3. **Teams** - Team management and collaboration
4. **Tasks** - Kanban board for task management
5. **Messages** - Real-time chat interface
6. **Resources** - File sharing and management
7. **Notifications** - Notification center
8. **Profile** - User profile management

## 🚀 Future Enhancements

- 📱 React Native Mobile App
- 🎥 Video Conferencing Integration
- 🤖 AI Task Recommendations
- 📊 Advanced Analytics
- 🌐 Multi-University Support

## 📄 License

MIT License - feel free to use this project for learning and development.

## 🤝 Contributing

Follow the established Git workflow and team structure. All work should be submitted via Pull Requests to the `dev` branch for review and merging.

---

**UniHub** - Empowering student collaboration through modern technology.
