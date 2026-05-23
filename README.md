# UniHub - Smart University Collaboration Platform

A full-stack web application designed to improve how university students collaborate, manage projects, and share knowledge.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)

## 🎯 Project Overview

UniHub simulates a real-world software development environment while solving genuine collaboration challenges faced by student teams. The platform brings together task management, real-time communication, file sharing, and team coordination into a single, cohesive experience.

## ✨ Core Features

- **🔐 User Management** - Secure authentication with JWT and Google OAuth
- **👥 Team Collaboration** - Create teams, assign roles, invite members
- **📋 Task Management** - Kanban board with drag-and-drop
- **💬 Real-Time Chat** - Team messaging powered by Socket.io
- **📁 Resource Sharing** - File uploads and organization
- **🔔 Notifications** - Real-time alerts and updates
- **📊 Dashboard & Analytics** - Central hub with insights
- **🛡️ Admin Panel** - Advanced management features

## 🛠️ Technology Stack

### Frontend
- ⚛️ **React 18** - UI library
- 🎨 **Tailwind CSS** - Styling
- 🔄 **Axios** - HTTP client
- 🛤️ **React Router** - Navigation
- ⚡ **Vite** - Build tool
- 📊 **Chart.js** - Data visualization

### Backend
- 🟢 **Node.js** - Runtime environment
- 🌐 **Express.js** - Web framework
- 🍃 **MongoDB** - Database
- 🔐 **JWT** - Authentication
- 🔌 **Socket.io** - Real-time communication
- 🔒 **bcrypt** - Password hashing
- 📤 **multer** - File uploads

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB Atlas Account** - [Sign up](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download](https://git-scm.com/)
- **Google Cloud Console Account** (for OAuth) - [Console](https://console.cloud.google.com/)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YourUsername/UniHub.git
cd UniHub
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file from template:
```bash
cp .env.example .env
```

Edit `backend/.env` with your credentials:
```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/unihub?retryWrites=true&w=majority

# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Google OAuth credentials from https://console.cloud.google.com/
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/google/callback

FRONTEND_URL=http://localhost:3000
```

Start the backend server:
```bash
npm start
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file from template:
```bash
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_ENV=development
```

Start the frontend development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

### 4. Create Admin User (Optional)

```bash
cd backend
node scripts/createAdmin.js
```

Follow the prompts to create an admin account.

## 🔐 Environment Variables

### Backend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for JWT tokens | Generate with crypto |
| `JWT_EXPIRE` | JWT expiration time | `7d` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | From Google Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | From Google Console |
| `GOOGLE_CALLBACK_URL` | OAuth callback URL | `http://localhost:5000/api/google/callback` |
| `FRONTEND_URL` | Frontend application URL | `http://localhost:3000` |

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api` |
| `VITE_ENV` | Environment mode | `development` or `production` |

## 🔑 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen
6. Add authorized redirect URIs:
   - Development: `http://localhost:5000/api/google/callback`
   - Production: `https://your-backend-url.onrender.com/api/google/callback`
7. Copy **Client ID** and **Client Secret** to your `.env` file

## 📦 Building for Production

### Frontend Build

```bash
cd frontend
npm run build
```

This creates an optimized production build in the `dist/` folder.

### Backend Production

Ensure your production `.env` has:
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
GOOGLE_CALLBACK_URL=https://your-backend-url.onrender.com/api/google/callback
FRONTEND_URL=https://your-frontend-url.vercel.app
```

## 🚢 Deployment

### Deploy Backend to Render

1. Create account on [Render](https://render.com/)
2. Create new **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Environment**: Add all backend environment variables
5. Deploy!

### Deploy Frontend to Vercel

1. Create account on [Vercel](https://vercel.com/)
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**: Add `VITE_API_URL` with your Render backend URL
4. Deploy!

### Post-Deployment

1. Update Google OAuth redirect URIs with production URLs
2. Update `FRONTEND_URL` in backend environment variables
3. Update `VITE_API_URL` in frontend environment variables
4. Test OAuth flow in production

## 🏗️ Project Structure

```
UniHub/
├── frontend/                 # React frontend application
│   ├── public/              # Static files
│   │   ├── index.html       # HTML template
│   │   └── sw-unregister.js # Service worker cleanup
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── contexts/        # React Context providers
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Utility functions
│   │   ├── App.jsx          # Main App component
│   │   └── main.jsx         # Entry point
│   ├── .env.example         # Environment template
│   ├── vite.config.js       # Vite configuration
│   ├── vercel.json          # Vercel deployment config
│   └── package.json         # Dependencies
│
├── backend/                 # Node.js backend application
│   ├── config/              # Configuration files
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Express middleware
│   ├── models/              # MongoDB models
│   ├── routes/              # API routes
│   ├── scripts/             # Utility scripts
│   ├── socket/              # Socket.io handlers
│   ├── uploads/             # File uploads directory
│   ├── .env.example         # Environment template
│   ├── server.js            # Entry point
│   └── package.json         # Dependencies
│
├── .gitignore               # Git ignore rules
├── .env.example             # Root environment template
└── README.md                # This file
```

## 🔄 Git Workflow

### For Development

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add your feature description"

# Push to GitHub
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

### Commit Message Convention

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🐛 Troubleshooting

### White Screen After Google Login

1. Clear browser cache and service workers
2. Run `npm run clear-cache` in frontend directory
3. Check console for errors
4. Verify OAuth redirect URIs match exactly

### MongoDB Connection Issues

1. Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0 for development)
2. Verify connection string format
3. Ensure database user has proper permissions

### Port Already in Use

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/user/register` - Register new user
- `POST /api/user/login` - Login user
- `GET /api/google` - Initiate Google OAuth
- `GET /api/google/callback` - Google OAuth callback

### User Endpoints

- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/all` - Get all users (admin)

### Team Endpoints

- `GET /api/teams` - Get all teams
- `POST /api/teams` - Create team
- `GET /api/teams/:id` - Get team details
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team

[Full API documentation coming soon]

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add some amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

This project is designed for collaborative development by university students.

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB for the database solution
- Vercel and Render for hosting platforms
- All contributors and testers

## 📞 Support

For support, email your-email@example.com or create an issue in the GitHub repository.

---

**UniHub** - Empowering student collaboration through modern technology.

Made with ❤️ by university students, for university students.
