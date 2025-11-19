# Device Checkout System

A modern Vue 3 web app for managing device checkouts. Track when mobile devices (Google Pixel, Apple iPhone, Mac Mini) are borrowed and returned. All data is automatically saved to Google Sheets.

**Deployed on GitHub Pages with automatic deployment!**

## Quick Deploy (3 Steps)

### Step 1: Get Google Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable **Google Sheets API** (search in Library)
4. Go to **Credentials** → Create **API Key**
5. Create a Google Sheet with headers: `Person Name | Device Type | Device ID | Time | Status`
6. Share it publicly
7. Copy the **Spreadsheet ID** from the URL (the long string between `/d/` and `/edit`)

### Step 2: Add GitHub Secrets

In your GitHub repository:

1. **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** and add:
   - Name: `VITE_GOOGLE_API_KEY` → Value: your API key
   - Name: `VITE_GOOGLE_SPREADSHEET_ID` → Value: your spreadsheet ID

### Step 3: Enable GitHub Pages & Deploy

1. **Settings** → **Pages**
2. Set source to `gh-pages` branch, `/` folder
3. Click **Save**

Then push to GitHub:
```bash
git push origin main
```

GitHub Actions automatically builds and deploys. Your app is live at:
```
https://yourusername.github.io/device-checkout-app
```

## Features

✅ **Check Out Devices** - Record who took what device and when  
✅ **Check In Devices** - Record when devices are returned  
✅ **Multiple Device Types** - Google Pixel, Apple iPhone, Mac Mini  
✅ **View Records** - See complete checkout history  
✅ **Automatic Timestamps** - Records when each transaction occurred  
✅ **Mobile Friendly** - Works on phones and tablets  
✅ **Google Sheets Storage** - All data saved to your Google Sheet  
✅ **Automatic Deployment** - Deploys every time you push to GitHub  

## Using the App

### Check Out a Device
1. Enter your name
2. Select device type
3. Enter device ID/serial number
4. Keep status as "Check Out"
5. Click "Check Out Device"

### Check In a Device
1. Enter your name
2. Select device type
3. Enter device ID/serial number
4. Change status to "Check In"
5. Click "Check In Device"

### View All Records
Click "View All Records" to see all transactions

## Local Development

Want to test locally before pushing?

```bash
# Install dependencies
npm install

# Create .env.local with your credentials
VITE_GOOGLE_API_KEY=your_api_key_here
VITE_GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_here

# Start dev server
npm run dev

# Open http://localhost:5173
```

## Available Commands

```bash
npm run dev          # Start local development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run type-check   # Check TypeScript types
npm run lint         # Run linter
npm run test:unit    # Run tests
```

## Documentation

- 📖 [Getting Started Guide](./GETTING_STARTED.md) - Detailed setup walkthrough
- 🚀 [Deployment Guide](./DEPLOYMENT.md) - Deployment instructions
- 📡 [API Documentation](./API_DOCUMENTATION.md) - Technical API reference

## Technology

- **Vue 3** - Modern JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Lightning-fast build tool
- **Google Sheets API** - Cloud data storage
- **GitHub Pages** - Free hosting with automatic deployment

## Troubleshooting

**App not loading?**
- Check that GitHub Pages is enabled
- Wait a few minutes for the build to complete
- Check the Actions tab to see if the build succeeded

**Data not saving to Google Sheets?**
- Verify your API Key is correct
- Check that Google Sheets API is enabled
- Ensure your Google Secrets are set in GitHub
- Open browser DevTools (F12) to see error messages

**Deploy not working?**
- Check the **Actions** tab in GitHub to see build logs
- Ensure you're pushing to the `main` branch
- Verify `.github/workflows/deploy.yml` exists in your repo

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Security Notes

Your API Key is stored securely in GitHub Secrets and never exposed publicly. The Google Sheet should be publicly shared or accessible to anyone with the link.

## Next Steps

1. Complete the 3 deployment steps above
2. Visit your live app
3. Test a device checkout
4. Check your Google Sheet to verify data was saved

## Questions?

Check the [Getting Started Guide](./GETTING_STARTED.md) or [API Documentation](./API_DOCUMENTATION.md) for more details.

---

**Ready to deploy?** Push to GitHub and your app will be live in minutes! 🚀
