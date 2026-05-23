# UniHub Deployment Guide

Complete guide for deploying UniHub to production (Render + Vercel).

## 📋 Pre-Deployment Checklist

### ✅ Security Checklist

- [ ] All secrets moved to `.env` files
- [ ] `.env` files added to `.gitignore`
- [ ] `.env.example` files created with placeholders
- [ ] No hardcoded secrets in source code
- [ ] Production JWT secret generated (64+ characters)
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Google OAuth production URLs configured

### ✅ Code Checklist

- [ ] All tests passing
- [ ] No console errors in development
- [ ] Production build works: `npm run build`
- [ ] Service workers disabled in development
- [ ] React Router works with page refresh
- [ ] Google OAuth works in development

### ✅ Environment Variables Checklist

- [ ] Backend `.env` configured
- [ ] Frontend `.env` configured
- [ ] Production URLs ready
- [ ] All API keys obtained

## 🚀 Deployment Steps

### Step 1: Prepare MongoDB Atlas

1. **Login to MongoDB Atlas**: https://cloud.mongodb.com/
2. **Create Production Database**:
   - Click "Browse Collections"
   - Create database: `unihub-production`
3. **Configure Network Access**:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
   - Or add specific Render IPs
4. **Get Connection String**:
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database password
   - Save for later: `mongodb+srv://username:password@cluster.mongodb.net/unihub-production?retryWrites=true&w=majority`

### Step 2: Deploy Backend to Render

1. **Create Render Account**: https://render.com/
2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

3. **Configure Service**:
   ```
   Name: unihub-backend
   Region: Choose closest to your users
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   ```

4. **Add Environment Variables**:
   Click "Environment" → "Add Environment Variable"
   
   ```env
   NODE_ENV=production
   PORT=5000
   
   # Your MongoDB Atlas production connection string
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/unihub-production?retryWrites=true&w=majority
   
   # Generate new JWT secret for production
   # Run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   JWT_SECRET=your-production-jwt-secret-64-characters-or-more
   JWT_EXPIRE=7d
   
   # Google OAuth (same credentials, different callback URL)
   GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=https://your-backend-url.onrender.com/api/google/callback
   
   # Frontend URL (will update after deploying frontend)
   FRONTEND_URL=https://your-frontend-url.vercel.app
   
   # File upload settings
   MAX_FILE_SIZE=10485760
   UPLOAD_PATH=./uploads
   ```

5. **Deploy**:
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Copy your backend URL: `https://your-backend-url.onrender.com`

6. **Verify Backend**:
   - Visit: `https://your-backend-url.onrender.com/api/health`
   - Should return: `{"status": "ok"}`

### Step 3: Update Google OAuth Settings

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Select Your Project**
3. **Go to Credentials**
4. **Edit OAuth 2.0 Client ID**
5. **Add Authorized Redirect URIs**:
   ```
   https://your-backend-url.onrender.com/api/google/callback
   ```
6. **Save Changes**

### Step 4: Deploy Frontend to Vercel

1. **Create Vercel Account**: https://vercel.com/
2. **Import Project**:
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Click "Import"

3. **Configure Project**:
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Add Environment Variables**:
   Click "Environment Variables"
   
   ```env
   VITE_API_URL=https://your-backend-url.onrender.com/api
   VITE_ENV=production
   ```

5. **Deploy**:
   - Click "Deploy"
   - Wait for deployment (2-5 minutes)
   - Copy your frontend URL: `https://your-frontend-url.vercel.app`

### Step 5: Update Backend with Frontend URL

1. **Go back to Render Dashboard**
2. **Select your backend service**
3. **Go to Environment**
4. **Update `FRONTEND_URL`**:
   ```env
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```
5. **Save Changes** (this will redeploy)

### Step 6: Final Google OAuth Update

1. **Go back to Google Cloud Console**
2. **Edit OAuth 2.0 Client ID**
3. **Add Authorized JavaScript Origins**:
   ```
   https://your-frontend-url.vercel.app
   ```
4. **Verify Authorized Redirect URIs include**:
   ```
   https://your-backend-url.onrender.com/api/google/callback
   ```
5. **Save Changes**

### Step 7: Test Production Deployment

1. **Visit Frontend**: `https://your-frontend-url.vercel.app`
2. **Test Regular Login**:
   - Create new account
   - Login with email/password
   - Verify dashboard loads
3. **Test Google OAuth**:
   - Click "Sign in with Google"
   - Complete Google authentication
   - Verify redirect to dashboard
   - Check no white screen
4. **Test Features**:
   - Create team
   - Add task
   - Upload file
   - Send message
5. **Check Browser Console**:
   - No errors
   - No 404s
   - No CORS errors

## 🔧 Post-Deployment Configuration

### Enable Custom Domain (Optional)

#### Vercel Custom Domain
1. Go to Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

#### Render Custom Domain
1. Go to Render service settings
2. Click "Custom Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

### Setup Monitoring

#### Render Monitoring
- Built-in metrics available in dashboard
- Set up email alerts for downtime

#### Vercel Monitoring
- Analytics available in dashboard
- Set up deployment notifications

### Backup Strategy

1. **MongoDB Atlas Backups**:
   - Go to "Backup" tab
   - Enable continuous backups
   - Configure retention policy

2. **Code Backups**:
   - GitHub repository is your backup
   - Tag releases: `git tag v1.0.0`
   - Push tags: `git push --tags`

## 🔄 Redeployment Process

### Update Code and Redeploy

```bash
# 1. Make changes locally
git add .
git commit -m "feat: your changes"

# 2. Push to GitHub
git push origin main

# 3. Automatic deployment
# - Vercel: Deploys automatically on push
# - Render: Deploys automatically on push

# 4. Manual deployment (if needed)
# Vercel: Go to dashboard → Deployments → Redeploy
# Render: Go to dashboard → Manual Deploy → Deploy latest commit
```

### Rollback to Previous Version

#### Vercel Rollback
1. Go to Vercel dashboard
2. Click "Deployments"
3. Find previous working deployment
4. Click "..." → "Promote to Production"

#### Render Rollback
1. Go to Render dashboard
2. Click "Events"
3. Find previous deployment
4. Click "Rollback to this version"

## 🐛 Troubleshooting Production Issues

### Issue: 404 on Page Refresh

**Solution**: Verify `vercel.json` has rewrites configured:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Issue: CORS Errors

**Solution**: Check backend CORS configuration in `server.js`:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### Issue: Google OAuth Fails

**Checklist**:
- [ ] Redirect URIs match exactly (no trailing slashes)
- [ ] `GOOGLE_CALLBACK_URL` in backend env is correct
- [ ] `FRONTEND_URL` in backend env is correct
- [ ] Google Console has production URLs added

### Issue: MongoDB Connection Fails

**Checklist**:
- [ ] Connection string is correct
- [ ] Password doesn't contain special characters (URL encode if needed)
- [ ] IP whitelist includes 0.0.0.0/0 or Render IPs
- [ ] Database user has read/write permissions

### Issue: Environment Variables Not Working

**Solution**:
1. Verify variables are set in platform dashboard
2. Redeploy after adding/changing variables
3. Check variable names match exactly (case-sensitive)
4. For Vite variables, must start with `VITE_`

### Issue: Build Fails

**Common Causes**:
1. **Missing dependencies**: Run `npm install` locally
2. **Node version mismatch**: Check `.node-version` file
3. **Build errors**: Run `npm run build` locally to debug
4. **Memory issues**: Increase build memory in platform settings

### Issue: Slow Performance

**Solutions**:
1. **Enable caching**: Check `vercel.json` cache headers
2. **Optimize images**: Compress and use WebP format
3. **Code splitting**: Vite does this automatically
4. **CDN**: Vercel uses CDN by default
5. **Database indexes**: Add indexes to frequently queried fields

## 📊 Monitoring & Logs

### View Logs

#### Render Logs
```bash
# Real-time logs
1. Go to Render dashboard
2. Select your service
3. Click "Logs" tab
4. View real-time logs
```

#### Vercel Logs
```bash
# Function logs
1. Go to Vercel dashboard
2. Select your project
3. Click "Deployments"
4. Click on a deployment
5. View build and function logs
```

### Set Up Alerts

#### Render Alerts
1. Go to service settings
2. Enable "Notify on deploy"
3. Add email for notifications

#### Vercel Alerts
1. Go to project settings
2. Click "Notifications"
3. Configure deployment notifications

## 🔐 Security Best Practices

### Production Security Checklist

- [ ] HTTPS enabled (automatic on Vercel/Render)
- [ ] Environment variables secured
- [ ] JWT secret is strong (64+ characters)
- [ ] MongoDB IP whitelist configured
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] File upload size limits set
- [ ] XSS protection headers set
- [ ] SQL injection protection (using Mongoose)

### Regular Security Maintenance

1. **Update Dependencies Monthly**:
   ```bash
   npm audit
   npm audit fix
   npm update
   ```

2. **Rotate Secrets Quarterly**:
   - Generate new JWT secret
   - Update in Render environment variables
   - Redeploy

3. **Review Access Logs**:
   - Check for suspicious activity
   - Monitor failed login attempts
   - Review API usage patterns

## 📈 Performance Optimization

### Frontend Optimization

1. **Code Splitting**: Already configured in Vite
2. **Lazy Loading**: Use React.lazy() for routes
3. **Image Optimization**: Use WebP format
4. **Bundle Analysis**: Run `npm run build -- --analyze`

### Backend Optimization

1. **Database Indexing**:
   ```javascript
   // Add indexes to frequently queried fields
   userSchema.index({ email: 1 });
   teamSchema.index({ members: 1 });
   ```

2. **Caching**: Implement Redis for session storage
3. **Compression**: Enable gzip compression
4. **Rate Limiting**: Prevent abuse

## 🎉 Deployment Complete!

Your UniHub application is now live in production!

### Share Your URLs

- **Frontend**: `https://your-frontend-url.vercel.app`
- **Backend**: `https://your-backend-url.onrender.com`
- **API Docs**: `https://your-backend-url.onrender.com/api/docs`

### Next Steps

1. Share with users
2. Monitor performance
3. Collect feedback
4. Plan next features
5. Keep dependencies updated

---

**Need Help?** Check the main README.md or create an issue on GitHub.
