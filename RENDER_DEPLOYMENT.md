# Render Deployment Guide - Angular Frontend

## What's Been Done

✅ Updated `environment.prod.ts` with your backend API URL  
✅ Added `serve` package for static file serving  
✅ Updated build script to use production configuration  
✅ Created `render.yaml` for automated deployment  

---

## Step-by-Step Deployment Instructions

### Step 1: Commit and Push All Changes to GitHub

```bash
git add .
git commit -m "Prepare frontend for Render deployment"
git push origin main
```

**Changes included:**
- Updated `src/environments/environment.prod.ts` (with your backend URL)
- Updated `package.json` (with serve dependency)
- New `render.yaml` file

---

### Step 2: Go to Render Dashboard

1. Visit https://dashboard.render.com/
2. Log in to your Render account
3. Click **New +** button → Select **Web Service**

---

### Step 3: Connect Your GitHub Repository

1. Click **Connect Repository**
2. Search for your frontend repository
3. Select it and click **Connect**

---

### Step 4: Configure the Web Service

Fill in the following details:

| Field | Value |
|-------|-------|
| **Name** | `quantity-measurement-frontend` |
| **Environment** | `Node` |
| **Region** | Choose closest to you |
| **Branch** | `main` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npx serve -s dist/quantity-measurement-app` |

---

### Step 5: Set Environment (Optional)

Under the **Environment** section, you can add:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |

(Already configured in `render.yaml`, but you can override here)

---

### Step 6: Choose Plan and Deploy

1. Select **Free** plan (or paid if you prefer)
2. Scroll down and click **Create Web Service**
3. Render will automatically build and deploy your app

---

## What Happens During Deployment

1. **Install Dependencies**: `npm install` installs all packages including `serve`
2. **Build**: `npm run build` creates optimized production build
3. **Start**: `npx serve -s dist/quantity-measurement-app` serves the static files
4. Render provides you a URL like: `https://quantity-measurement-frontend-xxxxx.onrender.com`

---

## Important Notes

⚠️ **Google Client ID**  
Currently set to `'YOUR_GOOGLE_CLIENT_ID_HERE'` in `environment.prod.ts`.

**You need to:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/Find your Google OAuth 2.0 Client ID
3. Add your Render frontend URL to authorized origins:
   - e.g., `https://quantity-measurement-frontend-xxxxx.onrender.com`
4. Update `src/environments/environment.prod.ts` with the actual Client ID
5. Push the changes to GitHub
6. Render will automatically redeploy

---

## Testing Your Deployment

After deployment completes:

1. Visit your Render-provided URL
2. Test login with Google OAuth
3. Verify API calls connect to your backend
4. Check browser console for any errors

---

## Verify Backend Connection

If you see API errors:
1. Make sure your backend is running on Render
2. Double-check the `apiUrl` in `environment.prod.ts`
3. Ensure backend CORS headers allow your frontend domain

---

## Troubleshooting

**Build fails?**
- Check that all dependencies are compatible
- Review build logs in Render dashboard

**App loads but API calls fail?**
- Verify backend URL in `environment.prod.ts`
- Check that backend is accessible from the internet

**Google OAuth doesn't work?**
- Ensure Google Client ID is correct for production
- Verify your frontend URL is in Google Cloud Console's authorized origins

---

## Next Time You Deploy

Just push to GitHub and Render auto-deploys. No manual steps needed!

## First Time Setup Checklist

- [ ] All changes pushed to GitHub
- [ ] Name your service on Render
- [ ] Select Node environment
- [ ] Set build command: `npm install && npm run build`
- [ ] Set start command: `npx serve -s dist/quantity-measurement-app`
- [ ] Create Web Service
- [ ] Wait for deployment (usually 2-5 minutes)
- [ ] Get your Render URL
- [ ] Update Google Client ID in environment.prod.ts
- [ ] Push updated Google Client ID to GitHub
- [ ] Verify everything works via Render URL

---

**Questions? Let me know!**
