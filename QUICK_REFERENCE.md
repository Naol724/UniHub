# UniHub - Quick Reference Guide

## 🚀 Quick Start (Development)

### 1. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm start
```

### 2. Setup Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### 3. Access Application
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 🔧 Common Commands

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run clear-cache  # Clear cache and rebuild
```

### Backend
```bash
npm start            # Start server
npm test             # Run tests
node scripts/createAdmin.js  # Create admin user
```

### Git
```bash
git status           # Check status
git add .            # Stage all changes
git commit -m "msg"  # Commit changes
git push origin main # Push to GitHub
```

## 📋 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/unihub
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/google/callback
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_ENV=development
```

## 🐛 Troubleshooting

### White Screen After Login
```bash
cd frontend
npm run clear-cache
npm run dev
# Hard refresh: Ctrl+Shift+R
```

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Change port in vite.config.js
```

### MongoDB Connection Failed
- Check connection string format
- Verify IP whitelist in MongoDB Atlas
- Ensure database user has permissions

### Google OAuth Not Working
- Verify redirect URIs in Google Cloud Console
- Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- Verify FRONTEND_URL and GOOGLE_CALLBACK_URL

## 📚 Documentation

- **README.md** - Full setup and features guide
- **DEPLOYMENT_GUIDE.md** - Deploy to Render + Vercel
- **SECURITY.md** - Security best practices
- **FINAL_SUMMARY.md** - Project completion summary

## 🚢 Deployment

### Deploy Backend (Render)
1. Create Render account
2. Connect GitHub repository
3. Set environment variables
4. Deploy

### Deploy Frontend (Vercel)
1. Create Vercel account
2. Import GitHub repository
3. Set environment variables
4. Deploy

See DEPLOYMENT_GUIDE.md for detailed steps.

## 🔐 Security Checklist

- [ ] All secrets in .env files
- [ ] .env files gitignored
- [ ] No hardcoded secrets in code
- [ ] Production JWT secret generated
- [ ] MongoDB IP whitelist configured
- [ ] Google OAuth URLs configured
- [ ] HTTPS enabled in production

## 📞 Need Help?

1. Check README.md for setup issues
2. Check DEPLOYMENT_GUIDE.md for deployment issues
3. Check SECURITY.md for security questions
4. Check console for error messages
5. Create GitHub issue for bugs

## ✅ Pre-Deployment Checklist

- [ ] Production build works: `npm run build`
- [ ] No console errors
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database backups enabled
- [ ] Monitoring alerts set up
- [ ] Security headers configured

## 🎯 Project Status

✅ **PRODUCTION READY**

All security, configuration, and documentation tasks completed.
Ready for deployment to Render (backend) and Vercel (frontend).

---

**Last Updated**: May 20, 2026
