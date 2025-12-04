# Deployment Guide - Festic + Vibex Unified

## 📋 Prerequisites

- GitHub account
- Vercel account (free tier works)
- Supabase account (free tier works)

## 🗄️ Step 1: Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Name it: `festic-vibex-unified`
3. Set a strong database password (save it!)
4. Choose region closest to IIT Gandhinagar (Mumbai/Singapore)
5. Wait for project to be created (~2 minutes)

### Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `schema.sql` from the project
4. Paste into the SQL editor
5. Click **Run** (bottom right)
6. Verify tables are created: Go to **Table Editor** → should see `profiles`, `sessions`, `events`, etc.

### Get API Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)
3. Keep these handy for Step 3

## 📦 Step 2: Push to GitHub

### Using GitHub Desktop

1. Open **GitHub Desktop**
2. Click **File** → **Add Local Repository**
3. Browse to: `C:\Users\Student\Desktop\yash kodam\festic-vibex-unified`
4. Click **Add Repository**
5. If it says "not a git repository", click **Create a repository**
   - Name: `festic-vibex-unified`
   - Description: `Dual-layer campus super-app: Festic (events) + Vibex (spontaneous meetups)`
   - Keep "Initialize with README" **unchecked** (we already have one)
   - Click **Create Repository**
6. You'll see all files in the "Changes" tab
7. Write commit message: `Initial commit: Unified Festic + Vibex foundation`
8. Click **Commit to main**
9. Click **Publish repository**
   - Keep it **Public** (or Private if you prefer)
   - Uncheck "Keep this code private" if you want it public
   - Click **Publish Repository**

### Verify on GitHub

1. Go to [github.com](https://github.com)
2. You should see your new repository: `festic-vibex-unified`
3. Verify files are there: `README.md`, `package.json`, `schema.sql`, etc.

## 🚀 Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **Add New...** → **Project**
4. Find `festic-vibex-unified` in the list
5. Click **Import**

### Configure Project

1. **Framework Preset**: Vite (should auto-detect)
2. **Root Directory**: `./` (leave as default)
3. **Build Command**: `npm run build` (should be pre-filled)
4. **Output Directory**: `dist` (should be pre-filled)

### Add Environment Variables

Click **Environment Variables** section and add:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | Your Supabase Project URL from Step 1 |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key from Step 1 |

5. Click **Deploy**

### Wait for Deployment

- Vercel will install dependencies and build the project
- This takes ~2-3 minutes
- You'll see a progress log

## ✅ Step 4: Test Your App

1. Once deployment is complete, Vercel will show you a URL like:
   `https://festic-vibex-unified.vercel.app`
2. Click **Visit** to open your app
3. Test the following:
   - ✅ App loads without errors
   - ✅ Can sign up with any email (domain restriction is disabled)
   - ✅ Can log in
   - ✅ Map loads (Vibex layer)
   - ✅ Can create a session
   - ✅ Bottom navigation works

## 🐛 Troubleshooting

### "Failed to fetch" or Supabase errors
- Check environment variables in Vercel are correct
- Verify Supabase project is active (not paused)
- Check Supabase dashboard → **Settings** → **API** → RLS is enabled

### Map not loading
- Check browser console for errors (F12)
- Verify Leaflet CSS is imported in `index.html`

### Build fails on Vercel
- Check build logs for specific error
- Common issue: TypeScript errors → fix locally and push again

## 🔄 Making Updates

After making code changes locally:

1. **GitHub Desktop**:
   - Write commit message describing changes
   - Click **Commit to main**
   - Click **Push origin**

2. **Vercel** will automatically:
   - Detect the new commit
   - Rebuild and redeploy
   - Takes ~2-3 minutes

## 📊 Monitoring

- **Vercel Dashboard**: View deployment logs, analytics
- **Supabase Dashboard**: View database tables, run queries
- **Browser DevTools**: Check for JavaScript errors (F12)

## 🎉 Next Steps

Once the app is deployed and working:

1. Share the Vercel URL with testers
2. Gather feedback on UI/UX
3. Continue implementing features from `task.md`
4. Test on mobile devices (Vercel URL works on phones too!)

---

**Need Help?**
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Check browser console (F12) for errors
