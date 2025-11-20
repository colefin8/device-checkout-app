# Deployment Checklist

Use this checklist to deploy the Device Checkout App.

## Prerequisites

- [ ] GitHub account
- [ ] Google account
- [ ] Vercel account (free, sign in with GitHub)
- [ ] Node.js 20.19.0+ installed locally
- [ ] Git installed

## Step 1: Google Cloud Setup

- [ ] Go to [console.cloud.google.com](https://console.cloud.google.com)
- [ ] Create new project "Device Checkout"
- [ ] Enable Google Sheets API
  - [ ] Go to APIs & Services → Library
  - [ ] Search "Google Sheets API"
  - [ ] Click Enable
- [ ] Create Service Account
  - [ ] Go to Credentials → Create Credentials → Service Account
  - [ ] Name: "Device Checkout Service"
  - [ ] Grant Editor role
  - [ ] Create JSON key
  - [ ] Download and save securely
- [ ] Create Google Sheet
  - [ ] Go to [sheets.google.com](https://sheets.google.com)
  - [ ] Create blank spreadsheet named "Device Checkout Tracker"
  - [ ] Add headers in row 1: Person Name | Device Type | Device ID | Time | Status
  - [ ] Copy Spreadsheet ID from URL
  - [ ] Share with service account email (from JSON file, `client_email` field)
  - [ ] Give Editor permissions

**Credentials needed:**
- [ ] Spreadsheet ID: `_____________`
- [ ] Service Account JSON: `_____________` (saved to file)

## Step 2: GitHub Setup

- [ ] Go to [github.com/new](https://github.com/new)
- [ ] Create repository `device-checkout-app`
- [ ] Make it Public
- [ ] Add repository secrets (Settings → Secrets and variables → Actions)
  - [ ] `VITE_GOOGLE_SPREADSHEET_ID` = your spreadsheet ID
  - [ ] `GOOGLE_SERVICE_ACCOUNT` = entire JSON from service account key file
- [ ] Enable GitHub Pages
  - [ ] Go to Settings → Pages
  - [ ] Set source to "GitHub Actions"
- [ ] Clone repository locally
  ```bash
  git clone https://github.com/yourusername/device-checkout-app.git
  cd device-checkout-app
  ```
- [ ] Copy project files to repository
- [ ] Push initial commit
  ```bash
  git add .
  git commit -m "Initial commit"
  git push origin master
  ```

## Step 3: Vercel Setup

- [ ] Go to [vercel.com](https://vercel.com)
- [ ] Sign in with GitHub
- [ ] Click "Add New..." → Project
- [ ] Select `device-checkout-app` repository
- [ ] Import project
- [ ] Add environment variable
  - [ ] Name: `GOOGLE_SERVICE_ACCOUNT`
  - [ ] Value: Entire JSON from service account key file
- [ ] Click Deploy
- [ ] Copy deployed URL (should be `https://device-checkout-app.vercel.app`)

**Vercel URL:** `_____________`

## Step 4: Update Frontend Configuration

- [ ] Update `.github/workflows/deploy.yml`
  - [ ] Replace `VITE_API_URL` with your Vercel URL if different from `https://device-checkout-app.vercel.app`
- [ ] Verify `vite.config.ts` has `base: '/device-checkout-app/'`
- [ ] Push changes
  ```bash
  git add .
  git commit -m "Configure deployment URLs"
  git push origin master
  ```

## Step 5: Verify Deployments

### GitHub Pages Build

- [ ] Go to your repository
- [ ] Click Actions tab
- [ ] Wait for build to complete (green checkmark)
- [ ] Check live URL: `https://yourusername.github.io/device-checkout-app`
  - [ ] App loads without errors
  - [ ] Styling looks correct
  - [ ] Form is visible

### Vercel Backend

- [ ] Go to [vercel.com](https://vercel.com)
- [ ] Go to your project
- [ ] Check that latest deployment says "Ready"
- [ ] Go to "Deployments" tab
- [ ] Click latest deployment
- [ ] Verify it shows "Deployment successful"

## Step 6: Test Live App

- [ ] Visit `https://yourusername.github.io/device-checkout-app`
- [ ] Fill out form:
  - [ ] Enter name: "Test User"
  - [ ] Select device type: "Google Pixel"
  - [ ] Enter device ID: "TEST-001"
  - [ ] Select status: "checked-out"
- [ ] Click "Check Out Device"
- [ ] Should see success message
- [ ] Go to your Google Sheet
  - [ ] Verify row was added with your test data
  - [ ] Check timestamp matches
  - [ ] Check status is "checked-out"

## Step 7: Local Development Setup (Optional)

- [ ] Install dependencies
  ```bash
  npm install
  ```
- [ ] Install Vercel CLI
  ```bash
  npm install -g vercel
  ```
- [ ] Create `.env.local`
  ```env
  VITE_GOOGLE_SPREADSHEET_ID=your_id_here
  VITE_API_URL=http://localhost:3001
  ```
- [ ] Set service account environment variable
  ```bash
  export GOOGLE_SERVICE_ACCOUNT='<paste entire JSON>'
  ```
- [ ] Test backend
  ```bash
  npm run dev:backend
  # Should see: Ready on http://localhost:3001
  ```
- [ ] Test frontend (in another terminal)
  ```bash
  npm run dev
  # Should see: Local: http://localhost:5173
  ```
- [ ] Visit `http://localhost:5173` and test checkout

## Troubleshooting

### Build Failed in GitHub Actions
- [ ] Check Actions tab for error logs
- [ ] Verify secrets are set correctly
- [ ] Ensure `.github/workflows/deploy.yml` exists
- [ ] Try manual rebuild from Actions tab

### Data not saving in live app
- [ ] Check browser console (F12) for errors
- [ ] Verify Vercel deployment succeeded
- [ ] Check Vercel logs for backend errors
- [ ] Verify service account email has Editor access to sheet

### Backend not responding locally
- [ ] Make sure `npm run dev:backend` is running
- [ ] Check that `GOOGLE_SERVICE_ACCOUNT` env var is set
- [ ] Verify `.env.local` has `VITE_API_URL=http://localhost:3001`

### App styling looks wrong
- [ ] Check that `base: '/device-checkout-app/'` is in `vite.config.ts`
- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Check browser console for CSS loading errors

## After Deployment

- [ ] Share app URL with team
- [ ] Monitor Google Sheet for data
- [ ] Test on mobile devices
- [ ] Set up regular backups of Google Sheet
- [ ] Document any custom device types added

## Making Updates

For any code changes:

1. Make changes locally
2. Test with `npm run dev`
3. Commit and push:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin master
   ```
4. GitHub Actions automatically builds and deploys
5. Vercel automatically rebuilds backend
6. Changes live in ~1-2 minutes

## Support

- See [README.md](./README.md) for overview
- See [GETTING_STARTED.md](./GETTING_STARTED.md) for detailed setup
- See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for backend API details
- See [ARCHITECTURE.md](./ARCHITECTURE.md) for technical architecture

---

**Deployment completed!** Your app is now live and ready for use. 🚀
