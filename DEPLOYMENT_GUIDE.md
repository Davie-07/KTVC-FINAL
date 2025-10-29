# 🚀 DEPLOYMENT GUIDE - Render & Vercel

Complete guide to deploy your School Management System to production.

---

## 📋 **PRE-DEPLOYMENT CHECKLIST**

✅ MongoDB Atlas database ready with data  
✅ GitHub account created  
✅ Render account created (render.com)  
✅ Vercel account created (vercel.com)  
✅ Code tested locally and working  

---

## 🔧 **STEP 1: PREPARE CODE FOR GITHUB**

### **1.1 Initialize Git Repository**

```bash
cd c:\Users\ADMIN\OneDrive\Desktop\dashboards

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: School Management System with KRA Services"
```

### **1.2 Create GitHub Repository**

1. Go to https://github.com
2. Click "New Repository"
3. Name: `school-management-system`
4. Description: `Full-stack school management system with KRA PIN integration`
5. Keep it **Private** (recommended)
6. **Don't** initialize with README (you already have one)
7. Click "Create repository"

### **1.3 Push to GitHub**

```bash
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/school-management-system.git

# Push to GitHub
git push -u origin main
```

If you get an error about branch name, use:
```bash
git branch -M main
git push -u origin main
```

---

## 🖥️ **STEP 2: DEPLOY BACKEND TO RENDER**

### **2.1 Create Web Service on Render**

1. Go to https://render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select `school-management-system`

### **2.2 Configure Web Service**

**Basic Settings:**
- **Name**: `ktvc-school-management-backend` (or your choice)
- **Region**: Choose closest to your location
- **Branch**: `main`
- **Root Directory**: `server`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: `Free` (or paid for better performance)

### **2.3 Add Environment Variables**

Click **"Advanced"** → **"Add Environment Variable"**

Add these variables:

```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://KTVCDASHBOARD:YOUR_PASSWORD@ktvcdashboard.unvthjq.mongodb.net/KTVCDASHBOARD?retryWrites=true&w=majority
JWT_SECRET=your_super_secure_random_string_change_this_now
FRONTEND_URL=https://your-app-name.vercel.app
KRA_CONSUMER_KEY=your_kra_key
KRA_CONSUMER_SECRET=your_kra_secret
```

**Important:**
- Replace `YOUR_PASSWORD` with your actual MongoDB password
- Replace `JWT_SECRET` with a strong random string
- You'll update `FRONTEND_URL` after deploying frontend

### **2.4 Deploy**

1. Click **"Create Web Service"**
2. Wait for deployment (3-5 minutes)
3. Once deployed, you'll get a URL like: `https://ktvc-school-management-backend.onrender.com`

### **2.5 Test Backend**

Visit: `https://your-backend-app.onrender.com/api/health`

Should return:
```json
{"status":"OK","message":"Server is running"}
```

✅ **Save your backend URL!** You'll need it for frontend.

---

## 🌐 **STEP 3: DEPLOY FRONTEND TO VERCEL**

### **3.1 Update Frontend Configuration**

Before deploying, update the API URL in your code:

**File: `client/src/config/api.js`**
```javascript
const API_URL = process.env.REACT_APP_API_URL || 
                (process.env.NODE_ENV === 'production' 
                  ? 'https://ktvc-school-management-backend.onrender.com'  // ← Your Render URL
                  : 'http://localhost:5000');
```

**File: `client/.env.production`**
```env
REACT_APP_API_URL=https://ktvc-school-management-backend.onrender.com
```

**Commit changes:**
```bash
git add .
git commit -m "Update production API URL"
git push
```

### **3.2 Deploy to Vercel**

1. Go to https://vercel.com
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### **3.3 Add Environment Variables on Vercel**

In Vercel project settings, add:

```
REACT_APP_API_URL = https://ktvc-school-management-backend.onrender.com
```

### **3.4 Configure Rewrites (Already done via vercel.json)**

The `vercel.json` file we created handles routing for React Router.

### **3.5 Deploy**

1. Click **"Deploy"**
2. Wait 2-3 minutes
3. You'll get a URL like: `https://your-app-name.vercel.app`

---

## 🔄 **STEP 4: UPDATE CORS ON BACKEND**

Now that you have your Vercel URL, update backend CORS:

### **4.1 Update Render Environment Variables**

Go to Render dashboard → Your service → Environment

Update:
```
FRONTEND_URL=https://your-app-name.vercel.app
```

### **4.2 Redeploy Backend**

Render will auto-redeploy with new environment variables.

---

## ✅ **STEP 5: VERIFY DEPLOYMENT**

### **Test Everything:**

1. **Visit your Vercel URL**: `https://your-app-name.vercel.app`
2. **Login Page should load**
3. **Try logging in:**
   - Admission: `STD2024001`
   - Course: `Diploma in Information Technology`
   - Password: `student123` (or your reset password)
4. **Dashboard should load**
5. **Try KRA Services**
6. **Check all menu items work**

---

## 📝 **ENVIRONMENT VARIABLES SUMMARY**

### **Render (Backend):**
```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://KTVCDASHBOARD:PASSWORD@ktvcdashboard.unvthjq.mongodb.net/KTVCDASHBOARD?retryWrites=true&w=majority
JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters
FRONTEND_URL=https://your-app-name.vercel.app
KRA_CONSUMER_KEY=your_kra_consumer_key
KRA_CONSUMER_SECRET=your_kra_consumer_secret
```

### **Vercel (Frontend):**
```
REACT_APP_API_URL=https://your-backend-app.onrender.com
```

---

## 🔧 **TROUBLESHOOTING**

### **Issue 1: CORS Error**
**Error:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution:**
1. Check `FRONTEND_URL` on Render matches your Vercel URL exactly
2. Include `https://` in the URL
3. Redeploy backend after changing

### **Issue 2: Login Fails**
**Error:** `Account not found`

**Solution:**
1. Check MongoDB Atlas is accessible
2. Verify `MONGODB_URI` is correct
3. Check IP whitelist on Atlas (should be 0.0.0.0/0)
4. Check database has data (run `node check-database.js` locally)

### **Issue 3: Blank Page After Login**
**Error:** White page, no dashboard

**Solution:**
1. Check browser console for errors
2. Verify all routes are configured
3. Check React Router is working
4. Clear browser cache

### **Issue 4: 404 on Refresh**
**Error:** Vercel shows 404 when refreshing page

**Solution:**
- Ensure `vercel.json` exists in `client/` folder (we created this)
- Redeploy if needed

### **Issue 5: Backend Sleeping (Render Free Tier)**
**Symptom:** First request takes 30+ seconds

**Solution:**
- Render free tier sleeps after 15 minutes of inactivity
- First request wakes it up
- Consider upgrading to paid tier for always-on
- Or use a service like UptimeRobot to ping every 10 minutes

---

## 🎯 **PRODUCTION URLs**

After deployment, you'll have:

**Frontend (Vercel):**
```
https://your-app-name.vercel.app
```

**Backend (Render):**
```
https://your-backend-app.onrender.com
```

**MongoDB Atlas:**
```
Already hosted in cloud
```

---

## 🔐 **SECURITY CHECKLIST**

✅ `.env` files NOT committed to GitHub  
✅ Strong JWT_SECRET in production  
✅ MongoDB Atlas IP whitelist configured  
✅ CORS properly configured  
✅ Rate limiting enabled  
✅ Helmet security headers enabled  
✅ MongoDB sanitization enabled  

---

## 📱 **CUSTOM DOMAIN (Optional)**

### **For Vercel:**
1. Go to Vercel project settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### **For Render:**
1. Upgrade to paid plan (custom domains not available on free tier)
2. Go to service settings → Custom Domain
3. Add your domain and update DNS

---

## 🔄 **CONTINUOUS DEPLOYMENT**

Both Render and Vercel support auto-deployment:

**How it works:**
1. Push code to GitHub
2. Both services automatically detect changes
3. They rebuild and redeploy
4. New version live in 2-5 minutes

**To deploy updates:**
```bash
git add .
git commit -m "Your update message"
git push
```

Done! Both services will auto-deploy.

---

## 📊 **MONITORING**

### **Render:**
- View logs in Render dashboard
- Check deployment status
- Monitor CPU/Memory usage

### **Vercel:**
- Analytics available in dashboard
- View deployment history
- Check build logs

### **MongoDB Atlas:**
- Monitor database metrics
- Check connection stats
- Set up alerts

---

## 💰 **COST BREAKDOWN**

### **Free Tier:**
- **Vercel**: Free (includes custom domain)
- **Render**: Free (spins down after 15 min inactivity)
- **MongoDB Atlas**: Free (512MB storage)
- **GitHub**: Free (unlimited private repos)

**Total Cost: $0/month** ✅

### **Paid Tier (Recommended for Production):**
- **Vercel Pro**: $20/month
- **Render Starter**: $7/month
- **MongoDB Atlas M10**: $57/month
- **GitHub Pro**: $4/month

**Total: ~$88/month**

---

## 🎉 **DEPLOYMENT COMPLETE!**

Your School Management System is now live!

**Share these URLs with users:**
- Login: `https://your-app-name.vercel.app`
- API Health: `https://your-backend-app.onrender.com/api/health`

**Default Login Credentials:**
- **Admin**: admin@school.com / admin123
- **Student**: STD2024001 / student123
- **Teacher**: 6-digit code from seed output
- **Finance**: 7-digit code from seed output

---

## 📚 **ADDITIONAL RESOURCES**

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com
- React Deployment: https://create-react-app.dev/docs/deployment

---

## 🆘 **NEED HELP?**

1. Check logs on Render dashboard
2. Check browser console for frontend errors
3. Test API endpoints with Postman
4. Verify environment variables are set
5. Check MongoDB Atlas connection

**Happy Deploying! 🚀**
