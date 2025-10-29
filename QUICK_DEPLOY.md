# ⚡ QUICK DEPLOYMENT REFERENCE

## 🚀 **DEPLOY IN 10 MINUTES**

### **1. Push to GitHub (2 min)**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/school-management-system.git
git push -u origin main
```

### **2. Deploy Backend to Render (4 min)**
1. https://render.com → New Web Service
2. Connect GitHub repo
3. Settings:
   - Root Directory: `server`
   - Build: `npm install`
   - Start: `npm start`
4. Environment Variables:
   ```
   PORT=5000
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://KTVCDASHBOARD:PASSWORD@ktvcdashboard.unvthjq.mongodb.net/KTVCDASHBOARD?retryWrites=true&w=majority
   JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters
   FRONTEND_URL=https://your-app.vercel.app
   ```
5. Create → Wait → Copy URL

### **3. Update Frontend Config (1 min)**
**File: `client/src/config/api.js`**
```javascript
const API_URL = 'https://your-render-app.onrender.com';  // ← Your Render URL
```

**File: `client/.env.production`**
```
REACT_APP_API_URL=https://your-render-app.onrender.com
```

### **4. Deploy Frontend to Vercel (3 min)**
1. https://vercel.com → New Project
2. Import GitHub repo
3. Settings:
   - Root Directory: `client`
   - Framework: Create React App
4. Environment Variables:
   ```
   REACT_APP_API_URL=https://your-render-app.onrender.com
   ```
5. Deploy → Copy URL

### **5. Update Backend CORS (1 min)**
Render → Your Service → Environment
```
FRONTEND_URL=https://your-vercel-app.vercel.app
```
Manual Deploy

---

## ✅ **VERIFY**
1. Visit: https://your-vercel-app.vercel.app
2. Login: STD2024001 / student123
3. Dashboard loads ✅

---

## 🔗 **YOUR PRODUCTION URLS**
- Frontend: `https://_____.vercel.app`
- Backend: `https://_____.onrender.com`
- Health Check: `https://_____.onrender.com/api/health`

---

## 🆘 **COMMON ISSUES**

**CORS Error?**
→ Check FRONTEND_URL matches Vercel URL exactly

**Login Fails?**
→ Check MONGODB_URI has correct password

**Blank Page?**
→ Check browser console, verify API_URL is correct

**404 on Refresh?**
→ vercel.json should be in client/ folder ✅

---

**See DEPLOYMENT_GUIDE.md for detailed instructions**
