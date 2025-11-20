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

### 1.4 Create Service Account

The app uses a Google Service Account to automatically authenticate with Google Sheets. Users don't need to sign in!

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **Service Account**
3. Fill in:
   - **Service account name**: Device Checkout Service
   - **Service account ID**: (auto-generated)
   - Click **Create and Continue**
4. **Permissions**:
   - Select role: **Editor** (grants read/write access to resources)
   - This allows the eservice account to read and write to Google Sheets
   - Click **Continue**
5. **Skip "Principals with Access"** (click **Done**)
   - You don't need to grant users access - the service account operates independently
6. Back at the Credentials page, click on your newly created service account
7. Go to the **Keys** tab
8. Click **Add Key** → **Create new key**
9. Choose **JSON** and click **Create**
10. A JSON file will download - **save it securely**
11. **Copy the entire JSON contents** - you'll need this for deployment

Now share your Google Sheet with the service account:

12. Open your Google Sheet ("Device Checkout Tracker")
13. Click **Share** (top right)
14. In the "People and groups" field, paste the service account email:
    - You can find this in the JSON file you downloaded: look for `"client_email"`
    - It looks like: `device-checkout-service@YOUR-PROJECT.iam.gserviceaccount.com`
15. Give it **Editor** access
16. Uncheck "Notify people" (it's a service account, not a person)
17. Click **Share**

You now have:
- ✅ Service Account JSON
- ✅ Spreadsheet ID
- ✅ Service account has Editor access to the sheet

## Step 2: Set Up Backend

The app includes a backend API (in the `api/` folder) that handles authentication with Google Sheets using your service account.

### For Local Development

1. Install Node.js dependencies (if not already done):
   ```bash
   npm install
   ```

   Also install the Vercel CLI globally (needed for local backend testing):
   ```bash
   npm install -g vercel
   ```

2. Create a `.env.local` file in the project root (for the frontend only):
   ```env
   VITE_GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_here
   VITE_API_URL=http://localhost:3001
   ```

3. Set up the backend environment variable in your terminal session:
   ```bash
   export GOOGLE_SERVICE_ACCOUNT='<paste entire JSON from service account key>'
   ```

   Or on Windows (PowerShell):
   ```powershell
   $env:GOOGLE_SERVICE_ACCOUNT='<paste entire JSON from service account key>'
   ```

   **Note:** We set this in the terminal (not in a file) because it's a sensitive credential. This keeps it in memory only for your current session, which is more secure than storing it in a file.

4. **Run the backend** (in a separate terminal):
   ```bash
   npm run dev:backend
   ```
   
   This uses Vercel's CLI to run your serverless function locally on port 3001. You should see:
   ```
   Ready on http://localhost:3001
   ```

5. **Run the frontend** (in another terminal):
   ```bash
   npm run dev
   ```

   Visit `http://localhost:5173` to test the app locally.

### Running Backend and Frontend Together

For convenience, you can run both in one command:

```bash
npm run dev:all
```

This starts both the frontend (port 5173) and backend (port 3001) in parallel. Use `Ctrl+C` to stop both.

**Important:** The backend must be running for the app to work locally. If you see API errors, make sure the backend terminal is still running.

### For Deployment (GitHub Pages + Vercel)

The backend runs on Vercel as a serverless function. Your GitHub Actions workflow will automatically deploy it.

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Import Project**
3. Select your `device-checkout-app` repository
4. Click **Import**
5. In Environment Variables, add:
   - **Name**: `GOOGLE_SERVICE_ACCOUNT`
   - **Value**: Paste your entire service account JSON
6. Click **Deploy**

GitHub Actions will also push to Vercel automatically on each push.

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

## Step 3: Configure Workflow Permissions

GitHub Actions needs write permissions to deploy your app to GitHub Pages.

1. Go to your GitHub repository
2. Click **Settings** (top right)
3. Go to **Actions** → **General** (left sidebar)
4. Scroll down to "Workflow permissions"
5. Select **"Read and write permissions"**
6. Check "Allow GitHub Actions to create and approve pull requests"
7. Click **Save**

✅ Workflow permissions are now configured!

## Step 4: Add GitHub Secrets

GitHub Secrets securely store your service account credentials.

1. Go to your GitHub repository
2. Click **Settings** (top right)
3. Go to **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add first secret:
   - **Name**: `VITE_GOOGLE_SPREADSHEET_ID`
   - **Value**: Paste your Spreadsheet ID
   - Click **Add secret**
6. Click **New repository secret** again
7. Add second secret:
   - **Name**: `GOOGLE_SERVICE_ACCOUNT`
   - **Value**: Paste the **entire JSON** from your service account key file
   - Click **Add secret**

✅ Both secrets are now securely stored!

## Step 5: Enable GitHub Pages

1. In your repository, go to **Settings**
2. Go to **Pages** (left sidebar)
3. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
4. Save

✅ GitHub Pages is now enabled!

## Step 6: Deploy

### 6.1 Push to GitHub

```bash
git add .
git commit -m "Deploy Device Checkout App"
git push origin main
```

### 6.2 Monitor Deployment

1. Go to your repository on GitHub
2. Click **Actions** tab
3. You'll see the build process
4. Wait for the green checkmark (success!)
5. Deployment typically takes 1-2 minutes

### 6.3 Access Your Live App

Your app is now live at:
```
https://yourusername.github.io/device-checkout-app
```

Replace `yourusername` with your actual GitHub username.

## Testing Your App

### Check It Works Locally

Create a `.env.local` file:

```env
VITE_GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_here
VITE_API_URL=http://localhost:3001
```

Set the service account environment variable:
```bash
export GOOGLE_SERVICE_ACCOUNT='<your entire service account JSON>'
```

Then in one terminal, start the backend:
```bash
npm run dev:backend
```

In another terminal, start the frontend:
```bash
npm run dev
```

Or run both together:
```bash
npm run dev:all
```

Visit `http://localhost:5173` and test:
1. Enter your name
2. Select a device type
3. Enter a device ID
4. Click "Check Out Device"
5. Check your Google Sheet - data should appear!
6. Try checking in a device with the same steps but choosing "Check In"

**Troubleshooting local testing:**
- If you see API errors, make sure the backend is running (`npm run dev:backend` in a separate terminal)
- Check that `GOOGLE_SERVICE_ACCOUNT` environment variable is set
- Verify the service account email is shared with Editor access on your Google Sheet
- Open browser DevTools (F12) → Console tab to see detailed error messages

### Check Live Version

After deployment:
1. Visit your live URL: `https://yourusername.github.io/device-checkout-app`
2. Test a device checkout (no login needed!)
3. Verify data appears in your Google Sheet
4. Check browser DevTools if you encounter issues

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

1. Go to **Vercel.com** and check your deployment status
2. Verify the environment variable is set:
   - Go to your Vercel project → **Settings** → **Environment Variables**
   - Ensure `GOOGLE_SERVICE_ACCOUNT` is set correctly
3. Check the deployment logs for errors
4. Try redeploying from Vercel dashboard

### "Build fails with error"

1. Check **Actions** tab for error details
2. Verify `vite.config.ts` has the correct base path
3. Run locally to test: `npm run build`
4. Look for error messages in terminal

### "Data not saving to Google Sheet"

1. Check that the Google Sheet exists and has the correct headers
2. Verify Google Sheets API is enabled in Cloud Console
3. Check your Vercel deployment logs for errors
4. Verify `GOOGLE_SERVICE_ACCOUNT` is set correctly in Vercel
5. Try checking out from localhost first to test the flow
6. Check browser console (F12) for error messages

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

## Environment Variables (Local Development)

Create a `.env.local` file in the project root:

```env
VITE_GOOGLE_SPREADSHEET_ID=your_spreadsheet_id
VITE_API_URL=http://localhost:3001
```

Also set the service account environment variable before running the app:

```bash
export GOOGLE_SERVICE_ACCOUNT='<your entire service account JSON>'
```

For Vercel deployment, set `GOOGLE_SERVICE_ACCOUNT` in Vercel's environment variables.

## How It Works (No User Login!)

The app uses a **service account** for automatic authentication:

1. User fills out the checkout form (no login!)
2. Form submission calls your backend API
3. Backend uses service account to get an OAuth token
4. Backend calls Google Sheets API with that token
5. Data is automatically saved to your sheet

This is much simpler for users - they just use the app without any authentication steps!

## Need Help?

- **Build issues?** Check the [Actions tab](https://github.com/yourusername/device-checkout-app/actions) for error logs
- **Google API problems?** Review [API Documentation](./API_DOCUMENTATION.md)
- **Deployment issues?** See [Deployment Guide](./DEPLOYMENT.md)

---

**You're all set!** Your Device Checkout App is live on GitHub Pages! 🚀
