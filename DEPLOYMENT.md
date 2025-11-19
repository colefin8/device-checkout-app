# Deployment Guide - GitHub Pages

Your Device Checkout App is configured for automatic deployment on GitHub Pages!

## How It Works

1. **You push code to GitHub** (`git push origin main`)
2. **GitHub Actions runs automatically** (builds your app)
3. **App deploys to GitHub Pages** (live for everyone!)
4. **Takes 1-2 minutes** from push to live

## Prerequisites

- GitHub repository with this project
- GitHub Secrets configured:
  - `VITE_GOOGLE_API_KEY`
  - `VITE_GOOGLE_SPREADSHEET_ID`
- GitHub Pages enabled (Settings → Pages → GitHub Actions)

## Deployment Steps

### First Time Setup

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **GitHub Actions automatically:**
   - Installs dependencies
   - Builds the app for production
   - Deploys to GitHub Pages
   - Takes 1-2 minutes

3. **Your app is live at:**
   ```
   https://yourusername.github.io/device-checkout-app
   ```

### Making Updates

Every push to `main` automatically redeploys:

```bash
# Edit your code
npm run dev         # Test locally first
git add .
git commit -m "Feature description"
git push origin main
# Wait 1-2 minutes - automatically deployed!
```

## Verify Deployment

### Check Build Status

1. Go to your GitHub repository
2. Click the **Actions** tab
3. You'll see your deployments
4. Green checkmark = success ✅
5. Red X = something failed ❌

### View Live App

1. Visit: `https://yourusername.github.io/device-checkout-app`
2. Test a device checkout
3. Check your Google Sheet for the data

## Troubleshooting

### Build Failed

**Check the error:**
1. Go to **Actions** tab
2. Click the failed build
3. Scroll down to see error details
4. Common issues:
   - TypeScript errors: `npm run type-check` locally to find them
   - Missing dependencies: Run `npm install` locally
   - Import errors: Check file paths are correct

**Fix and redeploy:**
```bash
# Fix the error locally
npm run type-check  # Find type errors
npm run dev         # Test it works
git add .
git commit -m "Fix deployment issue"
git push origin main
```

### App Loads but Styling is Missing

This means the base path is wrong. Fix it in `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/device-checkout-app/',  // Must match your repository name
  // ... rest of config
})
```

Then:
```bash
git add vite.config.ts
git commit -m "Fix base path"
git push origin main
```

### API Not Working

**Check GitHub Secrets:**
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Verify both exist:
   - `VITE_GOOGLE_API_KEY`
   - `VITE_GOOGLE_SPREADSHEET_ID`
3. If missing, add them
4. Redeploy: `git push origin main`

**Check Google API:**
1. Verify Google Sheets API is enabled
2. Test your API key at: `https://console.cloud.google.com/`
3. Ensure Google Sheet is publicly accessible

**Test locally first:**
```bash
# Create .env.local
VITE_GOOGLE_API_KEY=your_key_here
VITE_GOOGLE_SPREADSHEET_ID=your_id_here

# Run dev server
npm run dev

# Test if it works locally first
```

### Pages Not Deploying

**Check Pages is enabled:**
1. Go to **Settings** → **Pages**
2. "Build and deployment" should show "GitHub Actions"
3. If not, change it to GitHub Actions

**Check workflow file exists:**
- Verify `.github/workflows/deploy.yml` is in your repo

**Force redeploy:**
```bash
git commit --allow-empty -m "Trigger rebuild"
git push origin main
```

## Environment Variables

Your app uses GitHub Secrets to pass sensitive data:

```bash
# GitHub Secrets (Settings → Secrets and variables → Actions)
VITE_GOOGLE_API_KEY
VITE_GOOGLE_SPREADSHEET_ID

# These are automatically injected when building
# Never commit to Git!
```

## Performance Tips

Your production build includes:
- ✅ Minified JavaScript
- ✅ Optimized CSS
- ✅ Cached assets (won't re-download if unchanged)
- ✅ Fast load times

The app is cached by browsers, so updates might not show immediately:
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Clear cache and reload if needed

## Custom Domain

Want to use your own domain instead of GitHub Pages?

1. Get a domain from GoDaddy, Namecheap, or similar
2. Go to **Settings** → **Pages**
3. Add your custom domain
4. Follow GitHub's DNS setup instructions

## Git Workflow

### Recommended Workflow

```bash
# Create a feature branch
git checkout -b my-feature

# Make changes and test
npm run dev

# Commit changes
git add .
git commit -m "Add new feature"

# Push to GitHub (testing before main)
git push origin my-feature

# Create Pull Request to review changes

# Merge to main
git checkout main
git merge my-feature

# Auto-deploys to GitHub Pages!
```

### Keep Main Clean

- Only merge tested, working code to `main`
- Use branches for experimental features
- `main` branch = what's live on GitHub Pages

## Rollback Deployment

If something breaks after deployment:

```bash
# Undo last commit
git revert HEAD
git push origin main

# Or revert to specific commit
git revert <commit-hash>
git push origin main
```

GitHub Pages will automatically redeploy the previous version.

## Monitoring Deployments

### GitHub Actions Log

Each deployment creates a build log:
1. **Actions** tab → Find your workflow run
2. Click on "Build and Deploy"
3. See real-time build output
4. Useful for debugging failed builds

### Deployment Status

- **In Progress** (orange dot) - Currently building
- **Success** (green checkmark) - Live and working
- **Failed** (red X) - Something went wrong

## Advanced: Custom Workflows

You can customize the build process in `.github/workflows/deploy.yml`:

- Add tests before deploy
- Run linting checks
- Generate reports
- Send notifications

See GitHub Actions documentation for advanced options.

## Costs

GitHub Pages hosting is **completely free**:
- ✅ No monthly charges
- ✅ Unlimited bandwidth
- ✅ Unlimited deployments
- ✅ Custom domains supported

## Security

Your secrets are secure:
- ✅ Only injected during builds (not stored in logs)
- ✅ Cannot be viewed after creation
- ✅ Encrypted at rest
- ✅ Only used by your workflows

## Next Steps

1. **First deployment:** Push to GitHub
2. **Monitor:** Check Actions tab for success
3. **Test:** Visit your live URL
4. **Share:** Give the URL to your team
5. **Update:** Every push automatically redeploys

---

**Everything is set up for automatic deployment!** Just push to GitHub and your app goes live! 🚀
