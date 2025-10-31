# Deployment Guide

## ✅ This app is now 100% client-side!

The calculator runs entirely in your browser with **no server required**. All calculations, including Monte Carlo simulations with 10,000 trials, run instantly in modern browsers.

---

## 🚀 Quick Deploy Options

### Option 1: Cloudflare Pages (Recommended - FREE)

**Why Cloudflare Pages?**
- ✅ Free forever
- ✅ Global CDN (super fast worldwide)
- ✅ Auto-deploys from GitHub on every push
- ✅ Free SSL certificate
- ✅ Unlimited bandwidth

**Steps:**
1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. Go to [pages.cloudflare.com](https://pages.cloudflare.com)

3. Click **"Create a project"** → **"Connect to Git"**

4. Select your GitHub repository

5. Configure build settings:
   - **Build command:** (leave empty)
   - **Build output directory:** `public`
   - **Root directory:** `/`

6. Click **"Save and Deploy"**

7. Done! Your site will be live at `https://your-project.pages.dev`

**Custom Domain (Optional):**
- Add your own domain in Cloudflare Pages settings
- Cloudflare handles SSL automatically

---

### Option 2: Netlify (Also Great - FREE)

**Steps:**
1. Push to GitHub (same as above)

2. Go to [netlify.com](https://netlify.com)

3. Click **"Add new site"** → **"Import an existing project"**

4. Connect to GitHub and select your repo

5. Configure:
   - **Build command:** (leave empty)
   - **Publish directory:** `public`

6. Click **"Deploy site"**

7. Live at `https://your-site.netlify.app`

---

### Option 3: GitHub Pages (FREE)

**Steps:**
1. In your repo, go to **Settings** → **Pages**

2. Under "Source", select:
   - Branch: `main`
   - Folder: `/public`

3. Click **Save**

4. Wait 1-2 minutes

5. Your site will be live at `https://yourusername.github.io/trading/`

**Note:** You'll need to update the base path in your HTML if using GitHub Pages in a subdirectory.

---

### Option 4: Vercel (FREE)

Same process as Netlify:
1. Go to [vercel.com](https://vercel.com)
2. Import from GitHub
3. Set **Output Directory:** `public`
4. Deploy

---

## 📁 What Gets Deployed

Only the `public` folder needs to be deployed:
```
public/
  ├── index.html        # Main page
  ├── app.js            # UI logic
  ├── calculations.js   # All calculations (Monte Carlo, etc.)
  └── style.css         # Styling
```

The `server.js` file is **no longer needed** and can be ignored during deployment.

---

## 🧪 Test Locally

You can test the app by simply opening `public/index.html` in any modern browser:

```bash
open public/index.html
```

Or use a simple HTTP server:
```bash
cd public
python3 -m http.server 8000
# Then visit http://localhost:8000
```

---

## ⚡ Performance

- **Monte Carlo with 10,000 simulations:** ~100-200ms on modern hardware
- **All calculations:** Instant (runs in browser)
- **No cold starts:** Unlike server-based apps
- **Works offline:** Once loaded, works without internet

---

## 🔒 Security

Since everything runs client-side:
- ✅ No database to hack
- ✅ No server to maintain
- ✅ No API keys to secure
- ✅ User data never leaves their browser
- ✅ Works completely offline

---

## 💰 Cost

**100% FREE** on all recommended platforms:
- Cloudflare Pages: Unlimited (Free)
- Netlify: 100GB bandwidth/month (Free)
- GitHub Pages: 100GB bandwidth/month (Free)
- Vercel: 100GB bandwidth/month (Free)

---

## 🎯 Recommended: Cloudflare Pages

**Best overall option because:**
1. Unlimited bandwidth (no caps)
2. Fastest global CDN
3. Best free tier
4. Simplest deployment
5. Automatic SSL
6. Never sleeps (unlike free tier on Render/Railway)

---

## Need Help?

If you run into issues, check:
1. Is `public/calculations.js` included?
2. Is the script tag in `index.html` before `app.js`?
3. Are you deploying the `public` folder (not the root)?

The app should work perfectly on any static hosting platform!
