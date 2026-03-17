# Strategic Legal Practice — Vehicle Defect Intelligence Platform

A professional web application that provides real-time vehicle defect intelligence using live data from the **National Highway Traffic Safety Administration (NHTSA)** public API. Built for Strategic Legal Practice to support case evaluation, recall tracking, and consumer complaint analysis.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Live Features](#live-features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Prerequisites](#prerequisites)
6. [Installation & Setup](#installation--setup)
7. [Running Locally](#running-locally)
8. [Environment & API Notes](#environment--api-notes)
9. [Building for Production](#building-for-production)
10. [Deploying](#deploying)
11. [Pushing to GitHub](#pushing-to-github)
12. [Troubleshooting](#troubleshooting)
13. [Key Design Decisions](#key-design-decisions)

---

## Project Overview

This platform allows legal professionals and researchers to:

- Decode any **17-character Vehicle Identification Number (VIN)** and instantly retrieve full vehicle specs
- View all **NHTSA Safety Recalls** for a specific vehicle
- Browse all **Consumer Complaints** filed against a vehicle
- Analyze defect trends with **interactive charts and a live US choropleth map**
- Identify the most commonly reported failure components

All data is sourced **live** from NHTSA's public APIs — no database, no login, no API keys required.

---

## Live Features

| Page | Description |
|---|---|
| **Overview** | Hero landing page with platform introduction and key stats |
| **VIN Lookup** | Decode any VIN — auto-populates all sections globally |
| **Recalls** | Browse safety recalls by brand, model, and year |
| **Complaints** | Browse consumer complaints with expandable row details |
| **Analytics** | Charts: top components, complaints timeline, crashes vs fires, US map |
| **Methodology** | Explains data sources and how to interpret results |

### Key Highlights
- **One VIN, all sections** — decode once, every tab auto-loads data for that vehicle
- **Brand logos** — official manufacturer logos displayed (38 brands bundled locally, no CDN)
- **Accordion recalls** — click to expand each recall card with smooth animation
- **Invalid VIN detection** — format-validated before API call with clear error messaging
- **Interactive US map** — complaint density by state with hover tooltips
- **Deep navy + gold theme** — Playfair Display + Inter fonts for a law-firm aesthetic

---

## Tech Stack

| Category | Technology | Version |
|---|---|---|
| Framework | React + TypeScript | 19.x |
| Build Tool | Vite | 8.x |
| Styling | Inline CSS + CSS Custom Properties | — |
| Animations | Framer Motion | 12.x |
| Charts | Recharts | 3.x |
| Map | react-simple-maps + d3-scale | 3.x / 4.x |
| HTTP Client | Axios | 1.x |
| Icons | Lucide React | 0.577+ |
| Data Source | NHTSA vPIC API + NHTSA Complaints/Recalls API | Public |

---

## Project Structure

```
app/
├── public/
│   ├── slp-logo.png                 # Strategic Legal Practice company logo
│   ├── brand-logos/                 # 38 car brand logo PNGs (served locally)
│   │   ├── ford.png
│   │   ├── toyota.png
│   │   ├── bmw.png
│   │   └── ... (35 more brands)
│   └── vite.svg
├── src/
│   ├── api/
│   │   └── nhtsa.ts                 # All NHTSA API calls (VIN decode, recalls, complaints)
│   ├── components/
│   │   ├── BrandLogo.tsx            # Car brand logo with automatic fallback
│   │   ├── ComplaintRow.tsx         # Expandable complaint table row
│   │   ├── Header.tsx               # Sticky navigation header
│   │   ├── RecallCard.tsx           # Collapsible recall card with animation
│   │   ├── USMap.tsx                # Interactive US choropleth map
│   │   └── VINQuickSearch.tsx       # Compact VIN search widget
│   ├── pages/
│   │   ├── HomePage.tsx             # Overview / landing page
│   │   ├── VINLookupPage.tsx        # VIN decode + inline recalls & complaints
│   │   ├── VehicleSearchPage.tsx    # Recall browser by brand/model/year
│   │   ├── ComplaintsPage.tsx       # Complaint browser
│   │   ├── AnalyticsPage.tsx        # Full analytics dashboard
│   │   └── AboutPage.tsx            # Methodology and data source info
│   ├── types.ts                     # Shared TypeScript interfaces
│   ├── App.tsx                      # Root component, global state, page routing
│   ├── index.css                    # Global styles, CSS variables, design tokens
│   └── main.tsx                     # Application entry point
├── vite.config.ts                   # Vite config + NHTSA API reverse proxy
├── tsconfig.json
├── tsconfig.app.json
├── package.json
└── README.md
```

---

## Prerequisites

Install the following before proceeding:

### 1. Node.js v18 or later
Download: [https://nodejs.org](https://nodejs.org)

```bash
node -v     # Must be v18.0.0 or higher
npm -v      # Must be v9.0.0 or higher
```

### 2. Git
Download: [https://git-scm.com](https://git-scm.com)

```bash
git --version
```

---

## Installation & Setup

### Step 1 — Clone the repository

```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>
```

### Step 2 — Install all dependencies

```bash
npm install --legacy-peer-deps
```

> **Why `--legacy-peer-deps`?**
> The `react-simple-maps` package (used for the US map) has not yet updated its peer dependency declaration for React 19. This flag tells npm to skip that conflict check. The package works correctly at runtime — this flag does not affect the app in any way.

You will likely see some deprecation warnings in the terminal — these are safe to ignore.

---

## Running Locally

```bash
npm run dev
```

Open your browser and go to:
```
http://localhost:5173
```

The app hot-reloads automatically on every file save. No restart needed during development.

---

## Environment & API Notes

### No API keys or .env file required

All data is from NHTSA's **free, public API**. There is nothing to configure.

### How the CORS proxy works

Web browsers block direct API calls to external domains (CORS policy). This project uses **Vite's built-in dev proxy** to forward API requests through the local dev server:

```
Browser request:  GET /api/vpic/DecodeVinValues/1HGCM82633A004352
Vite proxy:       GET https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/1HGCM82633A004352

Browser request:  GET /api/nhtsa/complaints/complaintsByVehicle?make=HONDA&...
Vite proxy:       GET https://api.nhtsa.gov/complaints/complaintsByVehicle?make=HONDA&...
```

The proxy is configured in `vite.config.ts` and runs **only during `npm run dev`**.

### NHTSA APIs used

| API | Endpoint | Purpose |
|---|---|---|
| vPIC (Vehicle Product Info Catalog) | `/api/vpic/DecodeVinValues/{vin}` | Decode a VIN into vehicle specs |
| NHTSA Complaints | `/api/nhtsa/complaints/complaintsByVehicle` | Get consumer complaints |
| NHTSA Recalls | `/api/nhtsa/recalls/recallsByVehicle` | Get safety recall campaigns |

### Sample VINs for testing

| VIN | Vehicle |
|---|---|
| `1HGCM82633A004352` | 2003 Honda Accord |
| `1FTFW1ET5EFC45657` | 2014 Ford F-150 |
| `3C3CFFARXCT119553` | 2012 Fiat 500 |
| `JN1AZ4EH9FM730841` | 2015 Nissan 370Z |

---

## Building for Production

```bash
npm run build
```

This compiles TypeScript and bundles everything into the `dist/` folder.

To preview the production build locally:

```bash
npm run preview
```

Open at: `http://localhost:4173`

> **Important:** The NHTSA API proxy does **not** work in the production build preview. You must configure a server-side proxy for production deployments (see below).

---

## Deploying

### Option A — Vercel (Recommended)

Vercel is the easiest option and handles the API proxy natively.

1. Push your code to GitHub
2. Go to [https://vercel.com](https://vercel.com) → **Add New Project** → Import your repo
3. Create a file called `vercel.json` in the project root:

```json
{
  "rewrites": [
    {
      "source": "/api/vpic/:path*",
      "destination": "https://vpic.nhtsa.dot.gov/api/vehicles/:path*"
    },
    {
      "source": "/api/nhtsa/:path*",
      "destination": "https://api.nhtsa.gov/:path*"
    }
  ]
}
```

4. Click **Deploy** — Vercel automatically runs `npm run build` and serves the `dist/` folder.

---

### Option B — Netlify

1. Push your code to GitHub
2. Go to [https://netlify.com](https://netlify.com) → **Add New Site** → Import from Git
3. Create a file called `netlify.toml` in the project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/api/vpic/*"
  to = "https://vpic.nhtsa.dot.gov/api/vehicles/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/api/nhtsa/*"
  to = "https://api.nhtsa.gov/:splat"
  status = 200
  force = true
```

4. Click **Deploy site**.

---

### Option C — GitHub Pages

> **Note:** GitHub Pages serves static files only and cannot proxy API requests. The NHTSA API calls will fail due to CORS. Use Vercel or Netlify instead.

---

## Pushing to GitHub

### First time (new repository)

```bash
# Step 1: Initialize git in the project folder
git init

# Step 2: Stage all project files
git add .

# Step 3: Create your first commit
git commit -m "Initial commit — Strategic Legal Practice Vehicle Defect Intelligence"

# Step 4: Go to https://github.com/new and create a new repository
#         - Give it a name (e.g. slp-vehicle-intelligence)
#         - Set to Public or Private
#         - Do NOT check "Add a README file" (you already have one)
#         - Do NOT add .gitignore or license
#         - Click "Create repository"

# Step 5: Connect your local repo to GitHub (copy the URL from GitHub)
git remote add origin https://github.com/<your-username>/<your-repo-name>.git

# Step 6: Rename branch to main and push
git branch -M main
git push -u origin main
```

### Subsequent updates

```bash
git add .
git commit -m "Describe what you changed"
git push
```

### Check what files will be committed

```bash
git status        # Shows changed/untracked files
git diff          # Shows exact line-by-line changes
```

---

## Troubleshooting

### `npm install` fails with dependency conflict error

```bash
npm install --legacy-peer-deps
```

Always use this flag for this project.

---

### Port 5173 already in use

```bash
npm run dev -- --port 3000
# Then open http://localhost:3000
```

---

### API returns no data / "Failed to fetch"

- Ensure you are running `npm run dev` (not the built version)
- Check your internet connection
- Try a known-good VIN: `1HGCM82633A004352`
- Open browser DevTools (F12) → Network tab → check if `/api/vpic/...` requests are succeeding

---

### "Invalid VIN number" error

- VINs must be exactly **17 characters**
- VINs **cannot** contain the letters **I**, **O**, or **Q**
- Do not confuse `0` (zero) with `O` (letter)
- Check your VIN on: driver-side dashboard, door jamb sticker, vehicle title, or insurance card

---

### Brand logo not showing (Car icon shown instead)

- Confirm the folder `public/brand-logos/` exists and contains `.png` files
- If missing, re-download using the curl commands (see `public/brand-logos/`)
- Unsupported brands (38 brands are covered) will show a fallback car icon — this is expected

---

### TypeScript compilation errors

```bash
# Check for type errors without building
npx tsc --noEmit

# Fix errors, then build
npm run build
```

---

### White screen after `npm run build && npm run preview`

This is expected — the API proxy only works in `npm run dev`. Deploy to Vercel/Netlify with the proxy config above for a working production build.

---

## Key Design Decisions

| Decision | Reason |
|---|---|
| **Vite dev proxy for NHTSA API** | Browsers block cross-origin requests (CORS); the proxy forwards calls server-side |
| **`validateStatus: () => true` on Axios** | NHTSA returns HTTP 400 with valid JSON for some models (e.g. F-150); we inspect the body directly instead of relying on status codes |
| **Brand logos served locally** | External CDNs (GitHub raw, Clearbit, Wikimedia) proved unreliable in sandboxed/cloud environments; logos are bundled in `public/brand-logos/` |
| **`--legacy-peer-deps` on install** | `react-simple-maps` peer dependency not yet updated for React 19 |
| **Global `activeVehicle` state in App.tsx** | One VIN lookup drives all tabs — recalls, complaints, and analytics all read from the same global state |
| **Framer Motion `AnimatePresence`** | Smooth accordion expand/collapse on recall cards and complaint rows |
| **No footer, no AI indicators** | Client requirement — clean, professional law-firm presentation only |
| **Deep navy `#0f1b2d` + gold `#b8922a` theme** | Brand identity for Strategic Legal Practice; Playfair Display serif for headings |
| **Multi-format date parsing** | NHTSA returns dates in DD/MM/YYYY, MM/DD/YYYY, YYYYMMDD, and `/Date(ms)/` formats; all are normalised with a `year > 1980` guard to prevent epoch artifacts |

---

## Data Source

All vehicle safety data is provided by the **U.S. National Highway Traffic Safety Administration (NHTSA)**.

- Main site: [https://www.nhtsa.gov](https://www.nhtsa.gov)
- API docs: [https://api.nhtsa.gov](https://api.nhtsa.gov)
- vPIC API: [https://vpic.nhtsa.dot.gov/api](https://vpic.nhtsa.dot.gov/api)

---

## License

Built exclusively for **Strategic Legal Practice**. All rights reserved.
