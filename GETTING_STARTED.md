# Getting Started - GitHub Pages Deployment

This guide walks you through setting up and deploying the Device Checkout App on GitHub Pages.

## Prerequisites

- A GitHub account (free at [github.com](https://github.com))
- A Google account
- Node.js 20.19.0+ installed locally ([download](https://nodejs.org/))
- Git installed ([download](https://git-scm.com/))

## Step 1: Prepare Google Sheets

### 1.1 Create Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com)
2. Click **+ Blank** to create a new spreadsheet
3. Name it "Device Checkout Tracker"
4. In the first row, add these headers:
   - A1: `Person Name`
   - B1: `Device Type`
   - C1: `Device ID`
   - D1: `Time`
   - E1: `Status`
5. **Share** the sheet and set access to "Anyone with the link can view"
6. Copy the **Spreadsheet ID** from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/YOUR_ID_HERE/edit`
   - Copy the long string between `/d/` and `/edit`
   - Save this for later

### 1.2 Create Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com/)
2. Click "Select a Project" → "NEW PROJECT"
3. Name it "Device Checkout"
4. Click **CREATE** and wait for it to finish

### 1.3 Enable Google Sheets API

1. Go to **APIs & Services** → **Library**
2. Search for "Google Sheets API"
3. Click on it
4. Click **ENABLE**

### 1.4 Create API Key

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **API Key**
3. Your API Key will appear in a popup
4. **Copy it** and save it safely
5. Click **Close**

You now have:
- ✅ API Key
- ✅ Spreadsheet ID

## Step 2: Set Up GitHub Repository

### 2.1 Create Repository

1. Go to [github.com/new](https://github.com/new)
2. Name it `device-checkout-app`
3. Description: "Device checkout system with Google Sheets"
4. Make it **Public** (required for free GitHub Pages)
5. Check "Add a README file"
6. Click **Create repository**

### 2.2 Clone Repository

```bash
git clone https://github.com/yourusername/device-checkout-app.git
cd device-checkout-app
```

### 2.3 Add Project Files

1. Copy all files from this project to your cloned repository
2. Make sure `.github/workflows/deploy.yml` is included
3. Verify `.gitignore` exists

### 2.4 Update Configuration

Edit `vite.config.ts` and ensure the base path is set:

```typescript
export default defineConfig({
  base: '/device-checkout-app/',
  // ... rest of config
})
```

## Step 3: Add GitHub Secrets

GitHub Secrets securely store your API credentials without exposing them.

1. Go to your GitHub repository
2. Click **Settings** (top right)
3. Go to **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add first secret:
   - **Name**: `VITE_GOOGLE_API_KEY`
   - **Value**: Paste your Google API Key
   - Click **Add secret**
6. Click **New repository secret** again
7. Add second secret:
   - **Name**: `VITE_GOOGLE_SPREADSHEET_ID`
   - **Value**: Paste your Spreadsheet ID
   - Click **Add secret**

✅ Both secrets are now securely stored!

## Step 4: Enable GitHub Pages

1. In your repository, go to **Settings**
2. Go to **Pages** (left sidebar)
3. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
4. Save

✅ GitHub Pages is now enabled!

## Step 5: Deploy

### 5.1 Push to GitHub

```bash
git add .
git commit -m "Deploy Device Checkout App"
git push origin main
```

### 5.2 Monitor Deployment

1. Go to your repository on GitHub
2. Click **Actions** tab
3. You'll see the build process
4. Wait for the green checkmark (success!)
5. Deployment typically takes 1-2 minutes

### 5.3 Access Your Live App

Your app is now live at:
```
https://yourusername.github.io/device-checkout-app
```

Replace `yourusername` with your actual GitHub username.

## Testing Your App

### Check It Works Locally

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` and test:
1. Enter your name
2. Select a device type
3. Enter a device ID
4. Click "Check Out Device"
5. Check your Google Sheet - data should appear!

### Check Live Version

After deployment:
1. Visit your live URL (see Step 5.3)
2. Test a device checkout
3. Verify data appears in your Google Sheet

## Redeploying

Every time you push to GitHub, the app automatically redeploys:

```bash
# Make changes to the code
git add .
git commit -m "Your message"
git push origin main
# It automatically rebuilds and deploys!
```

## Troubleshooting

### "GitHub Pages is not building"

1. Go to **Settings** → **Pages**
2. Verify source is set to "GitHub Actions"
3. Check **Actions** tab for error logs
4. Verify `.github/workflows/deploy.yml` exists

### "API not working in live app"

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Verify both secrets are present:
   - `VITE_GOOGLE_API_KEY`
   - `VITE_GOOGLE_SPREADSHEET_ID`
3. If missing, add them again
4. Redeploy by pushing to GitHub

### "Build fails with error"

1. Check **Actions** tab for error details
2. Verify `vite.config.ts` has the correct base path
3. Run locally to test: `npm run build`
4. Look for error messages in terminal

### "Data not saving to Google Sheet"

1. Verify the Google Sheet exists and has headers
2. Check Google Sheets API is enabled in Cloud Console
3. Verify API Key is valid
4. Ensure Google Sheet is publicly accessible
5. Check browser console (F12) for error messages

### "App looks broken (styling missing)"

This usually means the base path is wrong in `vite.config.ts`. Make sure it's:
```typescript
base: '/device-checkout-app/',
```

## Making Changes

To update your app:

1. Make code changes locally
2. Test with `npm run dev`
3. Push to GitHub: `git push origin main`
4. Wait 1-2 minutes for deployment
5. Refresh your live site

## Adding More Device Types

Edit `src/App.vue` and find the `deviceTypes` array:

```typescript
const deviceTypes = ['Google Pixel', 'Apple iPhone', 'Mac Mini'] as const
```

Add your device:
```typescript
const deviceTypes = ['Google Pixel', 'Apple iPhone', 'Mac Mini', 'iPad'] as const
```

Then push to GitHub - it automatically redeploys!

## Next Steps

✅ You now have a live device checkout app!

- Monitor your [Google Sheet](https://sheets.google.com) for checkout data
- Share your live app URL with your team
- Make changes and redeploy anytime with `git push`
- See [API Documentation](./API_DOCUMENTATION.md) for technical details

## Need Help?

- **Build issues?** Check the [Actions tab](https://github.com/yourusername/device-checkout-app/actions) for error logs
- **Google API problems?** Review [API Documentation](./API_DOCUMENTATION.md)
- **Deployment issues?** See [Deployment Guide](./DEPLOYMENT.md)

---

**You're all set!** Your Device Checkout App is live on GitHub Pages! 🚀
