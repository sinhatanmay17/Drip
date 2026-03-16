# DRIP — AI Fashion Curator

A luxury AI-powered outfit generator with Amazon shopping links and a persistent wardrobe.
Built with vanilla HTML/CSS/JS + a Vercel serverless backend. **100% free to deploy.**

---

## Project Structure

```
maison/
├── api/
│   └── generate.js       ← Serverless function (calls Groq AI securely)
├── public/
│   ├── index.html
│   ├── css/style.css
│   └── js/app.js
├── vercel.json
└── README.md
```

---

## Deploy in 4 Steps (all free, no credit card)

### Step 1 — Get your FREE Groq API key (no credit card!)
1. Go to https://console.groq.com
2. Sign up free (Google login works)
3. Go to API Keys → Create API Key
4. Copy the key — it starts with gsk_...

Groq gives you a generous free tier using LLaMA 3.3 70B — fast, smart, completely free.

### Step 2 — Push to GitHub
1. Go to https://github.com → New repository → name it "drip"
2. Run these commands inside this folder:

git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/drip.git
git push -u origin main

### Step 3 — Deploy on Vercel
1. Go to https://vercel.com → Sign up free with GitHub
2. Click Add New Project → Import your maison repo
3. Click Deploy (no build settings needed)

### Step 4 — Add your API key
1. Vercel dashboard → your project → Settings → Environment Variables
2. Add:  Name = GROQ_API_KEY  |  Value = your gsk_... key
3. Save → Deployments → Redeploy

Your app is live at https://drip-YOUR_USERNAME.vercel.app

---

## Cost: ₹0
- Vercel hosting: Free
- Groq AI API: Free (no credit card)
- Amazon links: Free
