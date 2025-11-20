# Device Checkout System

A modern Vue 3 web app for managing device checkouts. Track when mobile devices (Google Pixel, Apple iPhone, Mac Mini) are borrowed and returned. All data is automatically saved to Google Sheets.

**Deployed on GitHub Pages with automatic backend on Vercel!**

## Quick Deploy (4 Steps)

### Step 1: Create Google Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project named "Device Checkout"
3. Enable **Google Sheets API** (go to APIs & Services → Library, search and enable)
4. Create a **Service Account**:
   - Go to Credentials → Create Credentials → Service Account
   - Name: "Device Checkout Service"
   - Grant it the **Editor** role
   - Create a JSON key and download it
5. Create a Google Sheet with headers: `Person Name | Device Type | Device ID | Time | Status`
6. Share the sheet with your service account email (found in the JSON file under `client_email`)
7. Copy the **Spreadsheet ID** from the URL (the long string between `/d/` and `/edit`)

### Step 2: Add GitHub Secrets

In your GitHub repository Settings → Secrets and variables → Actions, add:

1. `VITE_GOOGLE_SPREADSHEET_ID` → Your spreadsheet ID
2. `GOOGLE_SERVICE_ACCOUNT` → Your entire service account JSON (copy the whole file)

### Step 3: Deploy Backend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New..." → Project
3. Import your `device-checkout-app` repository
4. Add environment variable:
   - Name: `GOOGLE_SERVICE_ACCOUNT`
   - Value: Paste your entire service account JSON
5. Click Deploy

### Step 4: Enable GitHub Pages & Deploy Frontend

1. Go to your GitHub repository Settings → Pages
2. Set source to "GitHub Actions"
3. Push to GitHub:
   ```bash
   git push origin master
   ```

Your app is now live at:
```
https://yourusername.github.io/device-checkout-app
```

## Features

✅ **Check Out/In Devices** - Record device transactions with timestamps  
✅ **Multiple Device Types** - Google Pixel, Apple iPhone, Mac Mini  
✅ **Automatic Timestamps** - Records when each transaction occurred  
✅ **Mobile Friendly** - Works on phones and tablets  
✅ **Google Sheets Storage** - All data saved to your Google Sheet  
✅ **Service Account Auth** - No user login required!  
✅ **Automatic Deployment** - Deploys every time you push to GitHub  

## Using the App

1. Enter your name
2. Select device type
3. Enter device number
4. Choose Check Out or Check In
5. Click the button

Data automatically saves to your Google Sheet!

## Local Development

```bash
# Install dependencies
npm install

# Install Vercel CLI globally
npm install -g vercel

# Create .env.local
VITE_GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_here
VITE_API_URL=http://localhost:3001

# Terminal 1: Set environment variable then run backend
export GOOGLE_SERVICE_ACCOUNT='<your service account JSON>'
npm run dev:backend

# Terminal 2: Run frontend
npm run dev

# Or run both together:
npm run dev:all

# Open http://localhost:5173
```

## Available Commands

```bash
npm run dev          # Start frontend dev server (port 5173)
npm run dev:backend  # Start backend dev server (port 3001)
npm run dev:all      # Start both frontend and backend
npm run build        # Build for production
npm run preview      # Preview production build
npm run type-check   # Check TypeScript types
npm run lint         # Run linter
npm run test:unit    # Run tests
```

## Documentation

- 📖 [Getting Started Guide](./GETTING_STARTED.md) - Detailed setup walkthrough
- 📡 [API Documentation](./API_DOCUMENTATION.md) - Technical API reference

## Architecture

**Frontend (GitHub Pages):**
- Vue 3 + TypeScript
- Deployed automatically from the `dist/` folder
- Communicates with backend API

**Backend (Vercel Serverless):**
- Node.js serverless functions
- Located in `api/sheets.ts`
- Handles Google Sheets API authentication
- Uses service account for secure access

## Technology Stack

- **Vue 3** - Modern JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Lightning-fast build tool
- **Google Sheets API** - Cloud data storage
- **Vercel** - Backend serverless functions
- **GitHub Pages** - Frontend hosting

## Troubleshooting

**App not loading?**
- Check that GitHub Pages is enabled
- Wait a few minutes for the build to complete
- Check the Actions tab to see if the build succeeded

**Data not saving?**
- Check that Vercel deployment succeeded
- Verify `GOOGLE_SERVICE_ACCOUNT` is set in Vercel environment variables
- Check Vercel deployment logs for errors
- Open browser DevTools (F12) to see error messages

**Build not working?**
- Check the Actions tab for error logs
- Verify you're pushing to the `master` branch
- Ensure `.github/workflows/deploy.yml` exists

**Local testing fails?**
- Make sure backend is running: `npm run dev:backend`
- Set `GOOGLE_SERVICE_ACCOUNT` environment variable
- Check that service account email has Editor access to Google Sheet

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers

## Security

- Service account credentials stored securely in Vercel and GitHub
- Never stored in code or git history
- `.env.local` is git-ignored for local development
- Google Sheet is shared only with service account

## Next Steps

1. Complete the 4 deployment steps above
2. Visit your live app
3. Test a device checkout
4. Check your Google Sheet to verify data was saved
5. Share the app URL with your team

---

**Ready to deploy?** Follow the Quick Deploy steps above and your app will be live in minutes! 🚀
