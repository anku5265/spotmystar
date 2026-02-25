# Deployment Guide

## Prerequisites
- MongoDB Atlas account (free tier)
- Vercel account (frontend)
- Render account (backend)
- Gmail account for email notifications

## Backend Deployment (Render)

1. **Setup MongoDB Atlas**
   - Create cluster at mongodb.com/cloud/atlas
   - Get connection string
   - Whitelist all IPs (0.0.0.0/0)

2. **Deploy to Render**
   - Push code to GitHub
   - Create new Web Service on Render
   - Connect GitHub repo
   - Root directory: `backend`
   - Build command: `npm install`
   - Start command: `npm start`
   
3. **Environment Variables** (Render Dashboard)
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/artisthub
   JWT_SECRET=your_random_secret_key_here
   NODE_ENV=production
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   FRONTEND_URL=https://your-app.vercel.app
   ```

4. **Gmail App Password**
   - Enable 2FA on Gmail
   - Generate App Password: myaccount.google.com/apppasswords
   - Use this as EMAIL_PASS

5. **Seed Database**
   ```bash
   node seed.js
   ```

## Frontend Deployment (Vercel)

1. **Update API URL**
   - Create `frontend/.env.production`:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```

2. **Deploy to Vercel**
   - Install Vercel CLI: `npm i -g vercel`
   - From frontend folder: `vercel --prod`
   - Or connect GitHub repo on vercel.com

3. **Configure Vercel**
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Output directory: `dist`

## Post-Deployment

1. **Test the app**
   - Visit your Vercel URL
   - Register as artist
   - Login as admin (admin@artisthub.com / admin123)
   - Approve artist
   - Test booking flow

2. **Custom Domain** (Optional)
   - Add domain in Vercel settings
   - Update DNS records
   - Update FRONTEND_URL in backend env

## Local Development

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI
node seed.js
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Troubleshooting

- **CORS errors**: Check FRONTEND_URL in backend .env
- **Email not sending**: Verify Gmail app password
- **Database connection**: Check MongoDB Atlas IP whitelist
- **Build fails**: Clear node_modules and reinstall

## Cost Estimate
- MongoDB Atlas: Free (512MB)
- Render: Free tier (sleeps after 15min inactivity)
- Vercel: Free tier
- **Total: ₹0/month** for MVP

## Scaling (Future)
- Upgrade Render to paid ($7/month) for 24/7 uptime
- Add Cloudinary for image uploads
- Implement Redis for caching
- Add payment gateway (Razorpay)
