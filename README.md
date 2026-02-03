# Strategos: Daily Intelligence Briefing

**Brought to you by Jane, your digital intelligence ally.**

Strategos is an automated daily intelligence briefing that researches global events overnight and delivers a comprehensive synthesis to your inbox every morning.

## Features

- **Daily Generation**: Automatically researches and writes a new briefing at 6:00 AM Pacific
- **Email Delivery**: Sends to all subscribers at 6:30 AM Pacific  
- **Web Archive**: View current and past briefings at philotic-web.com
- **PDF Export**: Download any briefing as a printable PDF
- **Subscriber Management**: Simple email signup for daily delivery

## Architecture

```
6:00 AM PT     →  Cron triggers Claude + Web Search  →  Briefing saved to Vercel Blob
6:30 AM PT     →  Cron sends email to all subscribers (from Vercel KV)
Anytime        →  Web visitors see latest briefing, can subscribe
```

## Tech Stack

- **Runtime**: Vercel Serverless Functions
- **AI**: Claude (Anthropic API) with web search
- **Email**: Resend
- **Storage**: Vercel Blob (briefings) + Vercel KV (subscribers)
- **Domain**: philotic-web.com

---

## Setup Guide

### Prerequisites

- Node.js 18+
- Vercel account (Pro plan for crons)
- Anthropic API key
- Resend account
- Domain (philotic-web.com)

### Step 1: Clone and Install

```bash
cd ~/Downloads
unzip strategos.zip
cd strategos
npm install
```

### Step 2: Deploy to Vercel

```bash
vercel login
vercel
```

Follow the prompts, accept defaults.

### Step 3: Add Vercel Blob Storage

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click your **strategos** project
3. Click **Storage** tab
4. Click **Create Database** → **Blob**
5. Name it `strategos-briefings`
6. Click **Create**

This automatically adds the `BLOB_READ_WRITE_TOKEN` environment variable.

### Step 4: Add Vercel KV Storage

1. Still in **Storage** tab
2. Click **Create Database** → **KV**
3. Name it `strategos-subscribers`
4. Click **Create**

This automatically adds the KV environment variables.

### Step 5: Add Remaining Environment Variables

Go to **Settings** → **Environment Variables** and add:

| Name | Value |
|------|-------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key |
| `RESEND_API_KEY` | Your Resend API key |
| `SITE_PASSWORD` | A password to protect the site |
| `CRON_SECRET` | Any random string |
| `EMAIL_FROM` | `Jane <jane@mythos.vc>` |

### Step 6: Verify mythos.vc Domain in Resend

1. Go to [resend.com](https://resend.com) → **Domains**
2. Click **Add Domain** → enter `mythos.vc`
3. Add the DNS records Resend shows you
4. Click **Verify** (may take a few minutes)

### Step 7: Add philotic-web.com Domain

1. In Vercel Dashboard → your project → **Settings** → **Domains**
2. Click **Add** → enter `philotic-web.com`
3. Vercel will show you DNS records to add
4. Add these records to your domain registrar:
   - Usually an A record pointing to `76.76.19.19`
   - Or CNAME pointing to `cname.vercel-dns.com`
5. Also add `www.philotic-web.com` if desired

### Step 8: Deploy to Production

```bash
vercel --prod
```

### Step 9: Test

1. Visit https://philotic-web.com (enter your password)
2. Go to **Settings** → **Crons** in Vercel Dashboard
3. Click **Run Now** on `cron-generate` to create first briefing
4. Wait 2-3 minutes
5. Refresh the homepage — you should see the briefing
6. Subscribe with your email
7. Click **Run Now** on `cron-send` to test email delivery

---

## Cron Schedule

| Job | Schedule (UTC) | Pacific Time | Purpose |
|-----|---------------|--------------|---------|
| `/api/cron-generate` | `0 14 * * *` | 6:00 AM PST | Generate briefing |
| `/api/cron-send` | `30 14 * * *` | 6:30 AM PST | Send to subscribers |

**Note**: During daylight saving time (PDT), these will run 1 hour later in local time. Adjust if needed.

---

## File Structure

```
strategos/
├── api/
│   ├── index.js           # Homepage
│   ├── cron-generate.js   # Daily briefing generation
│   ├── cron-send.js       # Daily email send
│   ├── subscribe.js       # Subscription handler
│   └── download-pdf.js    # PDF download
├── lib/
│   ├── jane-prompt.js     # System prompt
│   ├── email-template.js  # Email HTML template
│   └── storage.js         # Blob & KV helpers
├── package.json
├── vercel.json            # Cron config
└── .env.example
```

---

## Costs

| Service | Cost |
|---------|------|
| Vercel Pro | $20/month |
| Anthropic API | ~$0.50-1.00/briefing (~$15-30/month) |
| Resend | Free up to 3,000 emails/month |
| Vercel Blob | Free tier (5GB) |
| Vercel KV | Free tier |

**Estimated total: $35-50/month**

---

## Version Control with GitHub

### Initial Setup

```bash
cd strategos

# Initialize git
git init

# Create repo on GitHub (github.com/new)
# Name it "strategos" or "philotic-web"

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/strategos.git

# First commit
git add .
git commit -m "Initial commit: Strategos briefing system"
git push -u origin main
```

### Connect Vercel to GitHub

1. Go to Vercel Dashboard → your project → **Settings** → **Git**
2. Click **Connect Git Repository**
3. Select your GitHub repo
4. Now every push to `main` automatically deploys

### Making Changes

```bash
# Edit files locally
# ...

# Commit and push
git add .
git commit -m "Description of changes"
git push

# Vercel automatically deploys!
```

---

*Strategos is brought to you by Jane, your digital intelligence ally. Working for the good of all beings.*
