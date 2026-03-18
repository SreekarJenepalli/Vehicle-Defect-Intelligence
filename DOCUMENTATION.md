# Strategic Legal Practice — Vehicle Defect Intelligence Platform
## Complete Technical & Product Documentation

**Version:** 1.0.0
**Last Updated:** March 2026
**Prepared for:** Strategic Legal Practice
**Classification:** Internal Technical Reference

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Business Objective](#2-business-objective)
3. [System Architecture Overview](#3-system-architecture-overview)
4. [Technology Stack](#4-technology-stack)
5. [Project Structure](#5-project-structure)
6. [Data Sources & APIs](#6-data-sources--apis)
7. [Core Application Logic](#7-core-application-logic)
8. [Pages — Detailed Breakdown](#8-pages--detailed-breakdown)
9. [Components — Detailed Breakdown](#9-components--detailed-breakdown)
10. [State Management](#10-state-management)
11. [Routing System](#11-routing-system)
12. [Design System & Theming](#12-design-system--theming)
13. [Data Flow Diagrams](#13-data-flow-diagrams)
14. [Error Handling Strategy](#14-error-handling-strategy)
15. [API Layer](#15-api-layer)
16. [TypeScript Type Definitions](#16-typescript-type-definitions)
17. [CORS & Proxy Configuration](#17-cors--proxy-configuration)
18. [Development Setup](#18-development-setup)
19. [Build & Deployment](#19-build--deployment)
20. [Known Limitations](#20-known-limitations)
21. [Glossary](#21-glossary)

---

## 1. Executive Summary

The **Vehicle Defect Intelligence Platform** is a single-page web application (SPA) built for Strategic Legal Practice. It provides legal professionals with real-time access to the complete federal vehicle safety database maintained by the U.S. National Highway Traffic Safety Administration (NHTSA).

The platform allows a user to enter a single Vehicle Identification Number (VIN) or manually select a vehicle by brand, model, and year, and instantly receive:

- Full vehicle specification breakdown
- All active safety recalls issued by NHTSA
- All consumer complaints filed in the NHTSA Office of Defects Investigation (ODI) database
- Statistical analytics: complaint trends, crash vs. fire patterns, geographic distribution, most-reported failure components

**The data is live.** Every query hits NHTSA's public API in real time. There is no local database, no caching layer, and no stale data.

---

## 2. Business Objective

### Problem Statement
Legal firms investigating vehicle defect cases need to quickly answer:
- Has this vehicle been recalled? For what reason?
- How many consumers have complained about the same issue?
- What components are most commonly failing?
- Are there crashes, fires, or injuries reported?
- Is there a geographic pattern to the complaints?

Previously, this required manually searching the NHTSA website, cross-referencing multiple pages, and manually compiling data — a slow, error-prone process.

### Solution
A single unified platform that:
1. Accepts one input (VIN or Make/Model/Year)
2. Fetches all relevant data simultaneously
3. Presents it in a structured, analyst-friendly interface
4. Provides visual analytics for pattern recognition
5. Supports legal research and case viability assessment

### Target Users
- Legal professionals preparing vehicle defect litigation
- Paralegals conducting preliminary case research
- Analysts identifying patterns across multiple complaints
- Researchers studying vehicle safety trends

---

## 3. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                           │
│                                                                 │
│   ┌──────────────────────────────────────────────────────┐      │
│   │              React SPA (Vite + TypeScript)           │      │
│   │                                                      │      │
│   │   ┌──────────┐  ┌──────────┐  ┌────────────────┐     │      │
│   │   │  Header  │  │  Pages   │  │   Components   │     │      │
│   │   │  (Nav)   │  │  (6)     │  │   (6)          │     │      │
│   │   └──────────┘  └──────────┘  └────────────────┘     │      │
│   │                                                      │      │
│   │   ┌──────────────────────────────────────────────┐   │      │
│   │   │           API Layer (nhtsa.ts / Axios)       │   │      │
│   │   └──────────────────────────────────────────────┘   │      │
│   └──────────────────────────────────────────────────────┘      │
│                             │                                   │
│              Calls /api/vpic/* and /api/nhtsa/*                 │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │    Vite Dev Proxy │  (Development only)
                    │   (vite.config.ts)│
                    └─────────┬─────────┘
                              │  Forwards to
              ┌───────────────┴────────────────┐
              │                                │
   ┌──────────▼──────────┐       ┌─────────────▼──────────────┐
   │  NHTSA vPIC API     │       │  NHTSA Complaints/Recalls  │
   │  vpic.nhtsa.dot.gov │       │  api.nhtsa.gov             │
   │  (VIN Decoding)     │       │  (Recalls + Complaints)    │
   └─────────────────────┘       └────────────────────────────┘
```

### Key Architectural Decisions

| Decision | Rationale |
|---|---|
| Single Page Application (SPA) | No page reloads; instant navigation between sections |
| Client-side rendering | All rendering in the browser; server only serves static files |
| No backend server | NHTSA API is public; no auth or data transformation needed |
| Vite dev proxy | Solves browser CORS restrictions without a backend |
| No state management library | App state is simple enough for React `useState` + prop drilling |
| No routing library | Custom page switching via `useState` (6 pages, no URL changes needed) |
| No database | Live API data is authoritative; caching would introduce staleness |

---

## 4. Technology Stack

### Production Dependencies

| Package | Version | Purpose |
|---|---|---|
| `react` | 19.2.4 | UI component framework |
| `react-dom` | 19.2.4 | React DOM renderer |
| `axios` | 1.13.6 | HTTP client for API calls |
| `framer-motion` | 12.36.0 | Animations (page transitions, accordions, chips) |
| `lucide-react` | 0.577.0 | Icon library (Search, Car, ShieldAlert, etc.) |
| `recharts` | 3.8.0 | Chart library (Bar, Pie, Line, ComposedChart) |
| `react-simple-maps` | 3.0.0 | SVG-based US map for choropleth visualization |
| `d3-scale` | 4.0.2 | Color scale calculation for map gradients |
| `prop-types` | 15.8.1 | Runtime prop validation (peer dep for react-simple-maps) |
| `react-is` | 19.2.4 | React type checking utilities (peer dep) |

### Development Dependencies

| Package | Version | Purpose |
|---|---|---|
| `vite` | 8.0.0 | Build tool & dev server with HMR |
| `@vitejs/plugin-react` | 6.0.0 | Vite plugin for React (Babel transform) |
| `typescript` | 5.9.3 | Static type checking |
| `eslint` | 9.39.4 | Code linting |
| `typescript-eslint` | 8.56.1 | TypeScript-aware ESLint rules |
| `@types/react` | 19.2.14 | TypeScript types for React |
| `@types/react-dom` | 19.2.3 | TypeScript types for ReactDOM |
| `@types/node` | 24.12.0 | TypeScript types for Node.js APIs |

### Why These Were Chosen

**React 19** — Latest stable version. Concurrent rendering features improve perceived performance during API calls.

**Vite 8** — Significantly faster than Webpack for development. Hot Module Replacement (HMR) is near-instant. The built-in proxy feature eliminates the need for a backend server.

**Framer Motion** — The industry standard for React animations. Used for the accordion expand/collapse on recall cards and complaint rows, page fade-in transitions, and the active vehicle chip appear/disappear animation.

**Recharts** — Built on D3, works natively with React's component model. Used for 4 different chart types: horizontal bar, pie, line/area, and composed (multi-series).

**react-simple-maps** — Lightweight SVG map renderer. Used for the US state choropleth showing geographic complaint distribution. ZoomableGroup was intentionally removed to prevent a known blank-screen freeze bug on mouse scroll.

---

## 5. Project Structure

```
app/
│
├── public/                          # Static assets (served as-is by Vite)
│   ├── slp-logo.png                 # Strategic Legal Practice company logo (header)
│   ├── brand-logos/                 # Car manufacturer logos (38 PNGs, local)
│   │   ├── ford.png
│   │   ├── toyota.png
│   │   ├── bmw.png
│   │   ├── honda.png
│   │   ├── tesla.png
│   │   └── ... (33 more)
│   └── vite.svg
│
├── src/                             # All application source code
│   │
│   ├── main.tsx                     # Entry point — mounts <App /> into #root
│   ├── App.tsx                      # Root component: routing, global state
│   ├── App.css                      # Empty (all styles in index.css)
│   ├── index.css                    # Global design system & CSS variables
│   ├── types.ts                     # TypeScript interfaces for API data
│   ├── react-simple-maps.d.ts       # Custom type declarations for react-simple-maps
│   │
│   ├── api/
│   │   └── nhtsa.ts                 # All NHTSA API functions
│   │
│   ├── pages/                       # Full-page views (one per nav item)
│   │   ├── HomePage.tsx             # /home — Overview & landing
│   │   ├── VINLookupPage.tsx        # /vin — VIN decode + inline results
│   │   ├── VehicleSearchPage.tsx    # /search — Recall browser
│   │   ├── ComplaintsPage.tsx       # /complaints — Complaint browser
│   │   ├── AnalyticsPage.tsx        # /analytics — Dashboard & charts
│   │   └── AboutPage.tsx            # /about — Methodology
│   │
│   └── components/                  # Reusable UI components
│       ├── Header.tsx               # Sticky top navigation bar
│       ├── RecallCard.tsx           # Collapsible recall display card
│       ├── ComplaintRow.tsx         # Expandable complaint table row
│       ├── USMap.tsx                # Interactive US choropleth map
│       ├── BrandLogo.tsx            # Car brand logo with fallback
│       └── VINQuickSearch.tsx       # Compact VIN input widget
│
├── vite.config.ts                   # Vite configuration + dev proxy rules
├── tsconfig.json                    # TypeScript root config
├── tsconfig.app.json                # TypeScript app-specific config
├── tsconfig.node.json               # TypeScript config for Vite/Node scripts
├── eslint.config.js                 # ESLint configuration
├── package.json                     # Dependencies & npm scripts
├── README.md                        # Setup & deployment instructions
└── DOCUMENTATION.md                 # This file — full technical documentation
```

---

## 6. Data Sources & APIs

### Overview
All data comes from the **U.S. National Highway Traffic Safety Administration (NHTSA)**, a federal agency with legal authority over vehicle safety standards. This makes the data authoritative and admissible as a reference in legal contexts.

### API 1 — vPIC (Vehicle Product Information Catalog)

| Property | Value |
|---|---|
| Base URL | `https://vpic.nhtsa.dot.gov/api/vehicles` |
| Purpose | Decode a VIN into full vehicle specifications |
| Auth required | No |
| Rate limits | None documented |
| Response format | JSON |

**Endpoint used:**
```
GET /DecodeVinValues/{vin}?format=json
```

**What it returns:**
Every field NHTSA has on record for that VIN — Make, Model, ModelYear, BodyClass, DriveType, EngineDisplacement, EngineCylinders, FuelTypePrimary, Manufacturer, PlantCity, PlantCountry, Series, TransmissionStyle, VehicleType, and ~100 more fields.

**Invalid VIN detection:**
NHTSA returns HTTP 200 even for invalid VINs. The `ErrorCode` field in the response indicates validity:
- `ErrorCode = "0"` → Valid VIN, data populated
- `ErrorCode ≠ "0"` or `Make` is empty → Invalid VIN

---

### API 2 — NHTSA Complaints API

| Property | Value |
|---|---|
| Base URL | `https://api.nhtsa.gov` |
| Purpose | Consumer complaints filed with NHTSA ODI |
| Auth required | No |
| Rate limits | None documented |
| Response format | JSON |

**Endpoint used:**
```
GET /complaints/complaintsByVehicle?make={make}&model={model}&modelYear={year}
```

**What a complaint record contains:**
- `odiNumber` — Unique NHTSA complaint ID
- `dateOfIncident` — When the defect occurred
- `dateComplaintFiled` — When the complaint was submitted
- `components` — What part of the vehicle failed (e.g. "FUEL SYSTEM, GASOLINE")
- `summary` — Full consumer-written description of the problem
- `crash` — Boolean: did this result in a crash?
- `fire` — Boolean: did this result in a fire?
- `numberOfInjuries` — How many people were injured
- `numberOfDeaths` — Fatalities
- `products` — Array of vehicle info (make, model, year)

**Known quirk:** NHTSA returns HTTP 400 for some valid requests (e.g. models with hyphens like "F-150"). The app uses `validateStatus: () => true` on Axios to treat all HTTP status codes as non-errors, then inspects the response body directly.

---

### API 3 — NHTSA Recalls API

| Property | Value |
|---|---|
| Base URL | `https://api.nhtsa.gov` |
| Purpose | Safety recall campaigns issued by NHTSA or manufacturers |
| Auth required | No |
| Rate limits | None documented |
| Response format | JSON |

**Endpoint used:**
```
GET /recalls/recallsByVehicle?make={make}&model={model}&modelYear={year}
```

**What a recall record contains:**
- `NHTSACampaignNumber` — Official recall campaign identifier
- `Component` — Affected part (e.g. "AIR BAGS:FRONTAL")
- `Summary` — Description of the defect
- `Consequence` — What can happen if not fixed
- `Remedy` — How the recall is being fixed
- `Notes` — Additional information
- `ReportReceivedDate` — When NHTSA received the recall report
- `PotentialNumberOfUnitsAffected` — Estimated affected vehicles

---

### API 4 — Makes & Models (vPIC)

Used internally for populating autocomplete dropdowns.

```
GET /GetAllMakes?format=json           → All vehicle makes
GET /GetModelsForMakeYear/make/{make}/modelyear/{year}?format=json  → Models
```

---

## 7. Core Application Logic

### VIN Validation (Two-Stage)

**Stage 1 — Client-side format check** (instant, before API call):
```
1. Length must be exactly 17 characters
2. Cannot contain letters I, O, or Q (internationally prohibited in VINs)
3. Must match regex: /^[A-HJ-NPR-Z0-9]{17}$/
```

**Stage 2 — API-level semantic check** (after vPIC response):
```
1. Response must contain Results[0]
2. ErrorCode must be "0"
3. Make field must be non-empty
→ If any check fails: throw Error('INVALID_VIN')
```

---

### Date Parsing

NHTSA returns dates in multiple inconsistent formats across different endpoints. The app normalises all of them:

| Format | Example | Handler |
|---|---|---|
| DD/MM/YYYY | `16/03/2024` | Parsed with day/month swap |
| MM/DD/YYYY | `03/16/2024` | Standard US format |
| YYYYMMDD | `20240316` | Substring extraction |
| ISO 8601 | `2024-03-16T00:00:00` | `new Date()` direct |
| `/Date(ms)/` | `/Date(1710547200000)/` | Regex extract + `new Date(ms)` |

**Epoch guard:** Any parsed date with `year < 1980` is treated as invalid and displayed as "—". This prevents NHTSA's occasional Unix epoch artifact (`Dec 31, 1969`) from appearing.

---

### Component Filtering (Analytics & Complaints)

NHTSA complaint components often include generic/unhelpful values:

```
SKIP_COMPONENTS = {
  'UNKNOWN OR OTHER',
  'OTHER',
  'UNKNOWN',
  'NOT APPLICABLE',
  'N/A',
  ''
}
```

These are filtered out before rendering any chart or table to keep the data meaningful.

---

### Severity Color Coding (Recalls)

Recall cards are colour-coded by component severity:

| Severity | Color | Components |
|---|---|---|
| **Critical** | Red | Fuel System, Air Bags, Seat Belts, Brakes, Fire |
| **High** | Orange | Steering, Suspension, Engine, Powertrain |
| **Standard** | Gold | All other components |

---

## 8. Pages — Detailed Breakdown

### 8.1 HomePage (`src/pages/HomePage.tsx`)

**Purpose:** Landing page and platform introduction.

**Sections:**
- **Hero** — Platform name, legal tagline, "Start VIN Lookup" CTA button
- **Stats bar** — 4 animated stat cards: 50M+ vehicles tracked, 1M+ complaints, 30K+ recalls, real-time data
- **Feature cards grid** — 4 cards (VIN Lookup, Safety Recalls, Complaints, Analytics), each with icon, description, and navigation button
- **Active vehicle banner** — Appears when a vehicle is globally set; shows make/model/year with quick-jump buttons to Recalls, Complaints, Analytics

**Props received:**
- `activeVehicle` — Current globally active vehicle (or null)
- `onNavigate(page)` — Navigation callback

---

### 8.2 VINLookupPage (`src/pages/VINLookupPage.tsx`)

**Purpose:** Primary data entry point. Decode a VIN and view all associated safety data.

**User Flow:**
```
Enter VIN (17 chars)
    → Client-side format validation
    → decodeVIN() API call
    → Display VehicleSpecCard (brand logo + all specs)
    → Set global activeVehicle state
    → Auto-fetch recalls + complaints in parallel
    → Show 4 stat cards (Recalls, Complaints, Crashes, Injuries)
    → Show inline tab (Recalls | Complaints preview)
    → Click stat cards → navigate to full section pages
```

**VehicleSpecCard sub-component:**
- Dark navy gradient header with brand logo (white pill)
- Vehicle name + VIN in monospace
- "Decoded" badge (green)
- Spec grid: Brand, Model, Year, Body Class, Vehicle Type, Drive Type, Engine, Fuel Type, Transmission, Series, Manufacturer, Plant City, Plant Country

**Loading states:**
- Skeleton placeholder shown during VIN decode
- Individual spinners on stat cards during data fetch
- Loading skeleton for recall/complaint list

**Error states:**
- Red alert box below input field
- Different message for invalid VIN vs network failure

---

### 8.3 VehicleSearchPage (`src/pages/VehicleSearchPage.tsx`)

**Purpose:** Browse and filter safety recalls by vehicle selection (no VIN required).

**Search Controls:**
- Year dropdown (current year back 30 years)
- Brand field: free-text `<input>` with `<datalist>` for autocomplete suggestions
- Model field: populates dynamically from `getModels()` when brand + year are set

**Auto-populate from active vehicle:** When a global vehicle is set, the fields pre-fill automatically.

**Results:**
- Stat summary cards (Total Recalls, Components affected, Units affected)
- Recall cards rendered via `<RecallCard>` component
- Empty state with checkmark if no recalls found

---

### 8.4 ComplaintsPage (`src/pages/ComplaintsPage.tsx`)

**Purpose:** Explore, filter, and analyse consumer complaints in detail.

**Search Controls:**
- Brand, Model, Year fields (same datalist pattern as Recalls page)
- Keyword search — filters complaint summaries in real-time
- Toggle filters: Crash only, Fire only, Injury only
- Sort: Most Recent first or Most Injuries first

**Analytics section (above the table):**
- Top 8 components bar chart
- Stats: Total complaints, Crashes, Fires, Injuries, Fatalities

**Complaints table:**
Columns: Date | Component | Summary (2-line clamp) | Crash | Fire | Injuries
- Each row is clickable → expands with `<ComplaintRow>` animation
- Expanded: full summary + ODI number + filed date + injury/fatality counts + crash/fire badges

---

### 8.5 AnalyticsPage (`src/pages/AnalyticsPage.tsx`)

**Purpose:** Visual analytics dashboard for defect pattern recognition.

**Requires:** An active vehicle (set via VIN Lookup or Search)

**Sections in order:**

| Section | Chart Type | Data Shown |
|---|---|---|
| KPI Cards | Metric cards | Total complaints, Crash rate %, Fire rate %, Injury rate % |
| Top Components | Horizontal bar (Recharts) | 8 most-reported failing components |
| Incident Types | Pie chart (Recharts) | Proportion of Crash / Fire / Injury / No-incident |
| Complaint Timeline | Line chart (Recharts) | Complaints per year with crash overlay |
| Crashes / Fires / Injuries | ComposedChart (Recharts) | Dual-axis: bars for crashes+fires, area line for injuries, peak reference line |
| Geographic Distribution | US Choropleth (react-simple-maps) | Estimated complaints by state using population weighting |

**US Map logic:**
- Total complaints are distributed across states proportionally to state population
- A small random variance is applied per state to prevent uniform distribution
- `d3-scale` `scaleQuantile` maps complaint counts to a 8-color scale (light gold → dark navy)
- Hover tooltip shows state name + estimated complaint count

---

### 8.6 AboutPage (`src/pages/AboutPage.tsx`)

**Purpose:** Explains data provenance, methodology, and legal research context.

**Sections:**
1. Data Sources — What NHTSA is, why the data is authoritative
2. VIN Decoding — How vPIC works
3. Safety Recalls — What a recall is, NHTSA's authority
4. Consumer Complaints — ODI process, what the data represents
5. Legal Context — How to use this data in legal research
6. Limitations — What the data does NOT cover

---

## 9. Components — Detailed Breakdown

### 9.1 Header (`src/components/Header.tsx`)

**Appearance:**
- Black background (`#111111`) — contrasts with white page content
- SLP logo image on the left (links back to home)
- Active vehicle chip in the centre (animated in/out with Framer Motion)
- Nav tabs along the bottom

**Active vehicle chip:**
- Shows brand logo (white pill) + Year Make Model + VIN in monospace
- "Change" button → navigates back to VIN Lookup
- "✕" button → clears global vehicle state
- Gold dot indicator on Recalls, Complaints, Analytics nav items when vehicle is active and user is on another tab

**Nav tabs:**
- Gold underline on active tab
- Semi-transparent white text on inactive tabs
- Scrollable horizontally on small screens (scrollbar hidden via CSS)

---

### 9.2 RecallCard (`src/components/RecallCard.tsx`)

**Default state (collapsed):**
- Component tag (colour-coded by severity)
- Campaign number
- Affected units count
- Date
- Chevron icon (pointing down)

**Expanded state (click to toggle):**
- All collapsed content visible
- + Summary paragraph
- + 3-column grid: Consequence | Remedy | Notes
- Chevron rotates 180° (smooth CSS transition)
- Height animation via Framer Motion `AnimatePresence`

---

### 9.3 ComplaintRow (`src/components/ComplaintRow.tsx`)

**Collapsed (table row):**
- Date | Component | 2-line summary preview | Crash badge | Fire badge | Injury count

**Expanded (animated panel below row):**
- Full complaint summary (no duplication)
- Metadata row: ODI# | Filed date | Injuries | Fatalities
- Icon badges: Car (crash), Flame (fire), Skull (death)
- Smooth height animation via Framer Motion

**Date parsing:** Handles all 6 NHTSA date formats. Year < 1980 displays as "—".

---

### 9.4 USMap (`src/components/USMap.tsx`)

**Technology:** `react-simple-maps` ComposableMap + Geographies + Geography

**Data:**
- GeoJSON fetched from CDN: `https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json`
- State population data hardcoded for 50 states + DC

**Rendering:**
- Each state filled with a colour from the d3-scale quantile colour scale
- 8-stop colour scale: from light champagne (`#f5efe0`) to dark navy (`#0f1b2d`)
- Hover state: gold fill + dark tooltip

**Tooltip:**
- Positioned relative to the SVG container
- Shows: State Name + Estimated complaint count
- Hidden when mouse leaves the map

**Important:** `ZoomableGroup` is intentionally NOT used. It caused a blank-screen freeze when users scrolled with a mouse wheel over the map. The map is rendered at fixed scale.

---

### 9.5 BrandLogo (`src/components/BrandLogo.tsx`)

**How it works:**
1. Receives a `brand` string (e.g. `"FORD"`, `"toyota"`)
2. Normalises to lowercase
3. Checks against a set of 38 known brands
4. If found: returns `<img src="/brand-logos/{brand}.png">`
5. If not found or image fails to load (`onError`): returns Car icon from Lucide

**38 supported brands:**
Acura, Alfa Romeo, Audi, BMW, Buick, Cadillac, Chevrolet, Chrysler, Dodge, Ferrari, Fiat, Ford, Genesis, GMC, Honda, Hyundai, Infiniti, Jaguar, Jeep, Kia, Lamborghini, Land Rover, Lexus, Lincoln, Maserati, Mazda, Mercedes-Benz, Mini, Mitsubishi, Nissan, Porsche, Ram, Rolls-Royce, Subaru, Tesla, Toyota, Volkswagen, Volvo

**Logo files:** Stored in `/public/brand-logos/*.png`. Downloaded from carlogos.org and served locally — no external CDN dependency at runtime.

**`pill` prop:** When `true` (default), logo is displayed on a white rounded-corner background with subtle shadow. This ensures visibility on both dark (header) and light (cards) backgrounds.

---

### 9.6 VINQuickSearch (`src/components/VINQuickSearch.tsx`)

A self-contained VIN input widget that:
- Accepts a VIN
- Calls `decodeVIN()`
- Returns make/model/year to parent via callback

Currently available for use on any page. Not currently displayed in the main UI but available for future expansion.

---

## 10. State Management

The application uses React's built-in `useState` — no Redux, Zustand, or Context API needed.

### Global State (App.tsx)

```typescript
// The currently active vehicle — shared across ALL pages
const [activeVehicle, setActiveVehicle] = useState<ActiveVehicle | null>(null);

// Which page is currently visible
const [activePage, setActivePage] = useState<Page>('home');
```

### ActiveVehicle Interface

```typescript
interface ActiveVehicle {
  vin?: string;      // Optional — may be set via search without a VIN
  make: string;      // e.g. "FORD"
  model: string;     // e.g. "F-150"
  year: string;      // e.g. "2020"
}
```

### How Global State Flows

```
App.tsx
  │  activeVehicle (state)
  │  setActiveVehicle (setter passed as onVehicleSet prop)
  │
  ├── Header.tsx          ← reads activeVehicle (shows chip)
  │                          calls onClearVehicle (clears state)
  │
  ├── VINLookupPage.tsx   ← calls onVehicleSet() after successful decode
  │
  ├── VehicleSearchPage.tsx ← reads activeVehicle (auto-fills form)
  │
  ├── ComplaintsPage.tsx  ← reads activeVehicle (auto-fills form)
  │
  └── AnalyticsPage.tsx   ← reads activeVehicle (loads charts)
```

### Local State (per page)

Each page manages its own loading/error/data state independently:

| State | Type | Description |
|---|---|---|
| `decoding` | boolean | VIN decode API call in progress |
| `fetchingData` | boolean | Recalls/complaints fetch in progress |
| `error` | string | Error message to display |
| `decoded` | VINDecodeResult \| null | Decoded vehicle data |
| `recalls` | Recall[] | Recall results |
| `complaints` | Complaint[] | Complaint results |
| `tab` | 'recalls' \| 'complaints' | Active tab in VIN page |

---

## 11. Routing System

The app uses a **custom client-side router** built with `useState`. There is no React Router or URL-based navigation.

### Page Type Definition

```typescript
type Page = 'home' | 'vin' | 'search' | 'complaints' | 'analytics' | 'about';
```

### How Navigation Works

```typescript
// In App.tsx:
const [activePage, setActivePage] = useState<Page>('home');

// Passed to every component as:
onNavigate={(page) => setActivePage(page)}

// In Header.tsx, nav buttons call:
onClick={() => onNavigate('vin')

// In any page, CTA buttons call:
onClick={() => onNavigate('analytics')
```

### Page Transitions

Framer Motion wraps each page render with:
```tsx
<motion.div
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -8 }}
  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
>
```

**Trade-off:** No browser back/forward button support, no URL sharing. This was an acceptable trade-off for this internal tool — the complexity of React Router was not justified.

---

## 12. Design System & Theming

All design tokens are defined as CSS custom properties in `src/index.css`.

### Color Palette

```css
/* Brand */
--navy:         #0f1b2d;    /* Primary dark — headings, header bg */
--navy-mid:     #1a2e47;    /* Secondary dark — card gradients */
--accent:       #b8922a;    /* Gold — active states, CTAs */
--accent-gold:  #c9a96e;    /* Lighter gold — hover states */
--accent-soft:  #fdf8ee;    /* Pale gold — chip backgrounds */

/* Semantic */
--danger:       #b91c1c;    /* Red — crashes, critical recalls */
--warning:      #b45309;    /* Amber — injuries, high severity */
--success:      #15803d;    /* Green — no recalls, valid state */

/* Neutral grays (10-step scale) */
--gray-50:      #f8f7f5;
--gray-100:     #f1ede7;
--gray-200:     #e5ddd3;
--gray-300:     #cfc5b9;
--gray-400:     #a89e95;
--gray-500:     #7d746c;
--gray-600:     #5c544d;
--gray-700:     #3d3830;
--gray-800:     #28231d;
--gray-900:     #1a1612;
```

### Typography

```css
/* Headings — Playfair Display (serif, elegant, law-firm feel) */
font-family: 'Playfair Display', Georgia, serif;

/* Body — Inter (clean, highly legible, professional) */
font-family: 'Inter', system-ui, -apple-system, sans-serif;
```

Both fonts are loaded from Google Fonts via `@import` in `index.css`.

### Utility Classes

```
.btn              Base button styles
.btn-primary      Navy background, gold-tinted text
.btn-secondary    White background, navy border
.btn-ghost        Transparent, gray text

.card             White background, border, hover shadow lift
.input            Consistent input field styling
.label            Form label styling

.badge            Small inline status tag
.badge-danger     Red badge (crashes, critical)
.badge-warning    Amber badge (injuries)
.badge-success    Green badge (resolved, no recalls)
.badge-info       Blue badge (neutral info)

.tag              Component/category tag
.tag-red          Red tag
.tag-orange       Orange tag
.tag-blue         Blue tag
.tag-green        Green tag
.tag-gray         Gray tag

.skeleton         Shimmer loading placeholder
.spinner          Rotating circle loader
.empty-state      Centered icon + heading + description
.table-container  Scrollable table wrapper
```

### Shadows

```css
--shadow-sm:  0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05);
--shadow-md:  0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.05);
--shadow-lg:  0 10px 15px rgba(0,0,0,0.08), 0 4px 6px rgba(0,0,0,0.04);
```

---

## 13. Data Flow Diagrams

### VIN Lookup Flow

```
User types VIN
    │
    ▼
handleSearch()
    │
    ├─ Length check (17 chars)?  NO → show error, stop
    │
    ├─ IOQ letter check?  FAIL → show error, stop
    │
    ├─ Regex check?  FAIL → show error, stop
    │
    ▼
runDecode(vin)
    │
    ├─ setDecoding(true) → show skeleton
    │
    ▼
decodeVIN(vin)  [nhtsa.ts]
    │
    ├─ GET /api/vpic/DecodeVinValues/{vin}
    │
    ├─ Results[0] missing?  → throw INVALID_VIN
    │
    ├─ ErrorCode ≠ 0 or Make empty?  → throw INVALID_VIN
    │
    ▼
setDecoded(result)
setGlobal activeVehicle (make, model, year, vin)
setDecoding(false)
    │
    ▼
[Parallel fetch]
getRecalls(make, model, year)     getComplaints(make, model, year)
    │                                      │
    ▼                                      ▼
setRecalls(r)                   setComplaints(c)
    │
    ▼
setHasResults(true)
setFetchingData(false)
→ Render VehicleSpecCard + stat cards + tab preview
```

---

### Analytics Data Flow

```
AnalyticsPage mounts
    │
    ├─ reads activeVehicle from props
    │
    ├─ activeVehicle null?  → show "No vehicle selected" prompt
    │
    ▼
useEffect([activeVehicle])
    │
    ▼
getComplaints(make, model, year)
    │
    ▼
complaints[] stored in local state
    │
    ├─ buildComponentData(complaints)
    │   → counts by component, filters SKIP_COMPONENTS, top 8
    │
    ├─ buildYearlyData(complaints)
    │   → group by year, count complaints + crashes
    │
    ├─ buildPieData(complaints)
    │   → count Crash / Fire / Injury / None
    │
    ├─ buildCrashFireData(complaints)
    │   → per year: crashes, fires, injuries for ComposedChart
    │
    └─ USMap receives complaints[] → distributes by state population
```

---

## 14. Error Handling Strategy

### Philosophy
Errors are caught at the boundary where they occur and surfaced to the user with actionable messages. The app never silently fails or shows a blank screen.

### VIN Errors

| Error | Message Shown |
|---|---|
| < 17 characters | "Please enter a valid 17-character VIN." |
| Contains I, O, Q | "VINs cannot contain the letters I, O, or Q." |
| Invalid characters | "VINs contain only letters (except I, O, Q) and numbers." |
| Invalid per NHTSA | "Invalid VIN number. Please double-check and enter a correct 17-character VIN." |
| Network failure | "Failed to reach the vehicle database. Please check your connection and try again." |

### API Errors

- `validateStatus: () => true` — Axios never throws on HTTP 4xx/5xx; we inspect the body
- Empty results arrays are handled gracefully with "No recalls found" / "No complaints found" empty states
- Failed image loads (`onError` on `<img>`) fall back to Car icon

### TypeScript Compile-time Safety

All API response shapes are typed via `src/types.ts`. TypeScript catches data shape mismatches at build time before they reach production.

---

## 15. API Layer

**File:** `src/api/nhtsa.ts`

### Axios Instance Configuration

```typescript
const nhtsa = axios.create({
  validateStatus: () => true,  // Accept all HTTP status codes
});
```

This is critical because NHTSA returns HTTP 400 for some valid vehicle models. We never rely on HTTP status — we look at the response body.

### Functions

#### `decodeVIN(vin: string): Promise<VINDecodeResult>`
Decodes a VIN using vPIC. Validates ErrorCode and Make presence. Throws `Error('INVALID_VIN')` for invalid VINs.

#### `getRecalls(make, model, year): Promise<Recall[]>`
Returns all recall campaigns for the given vehicle. Returns `[]` if no recalls found.

#### `getComplaints(make, model, year): Promise<Complaint[]>`
Returns all ODI consumer complaints for the given vehicle. Returns `[]` if no complaints found.

#### `getMakes(): Promise<string[]>`
Returns sorted list of all vehicle makes from vPIC. Used for autocomplete suggestions.

#### `getModels(make, year): Promise<string[]>`
Returns sorted list of models for a given make and year. Used for dynamic model dropdown.

---

## 16. TypeScript Type Definitions

**File:** `src/types.ts`

### VINDecodeResult
```typescript
interface VINDecodeResult {
  make: string;                  // e.g. "FORD"
  model: string;                 // e.g. "F-150"
  modelYear: string;             // e.g. "2020"
  bodyClass: string;             // e.g. "Pickup"
  driveType: string;             // e.g. "4WD/4-Wheel Drive"
  engineConfiguration: string;  // e.g. "V-Shape"
  engineCylinders: string;       // e.g. "6"
  engineDisplacementL: string;   // e.g. "3.5"
  fuelTypePrimary: string;       // e.g. "Gasoline"
  manufacturer: string;          // e.g. "Ford Motor Company"
  plantCity: string;             // e.g. "DEARBORN"
  plantCountry: string;          // e.g. "UNITED STATES (USA)"
  series: string;                // e.g. "XLT"
  transmissionStyle: string;     // e.g. "Automatic"
  vehicleType: string;           // e.g. "TRUCK"
  vin: string;                   // The decoded VIN
  errorCode: string;             // "0" = valid
  errorText: string;             // Error description if invalid
}
```

### Recall
```typescript
interface Recall {
  NHTSACampaignNumber: string;        // e.g. "21V123000"
  Component: string;                  // e.g. "AIR BAGS:FRONTAL"
  Summary: string;                    // Defect description
  Consequence: string;                // What can happen
  Remedy: string;                     // How it's being fixed
  Notes: string;                      // Additional info
  ReportReceivedDate: string;         // Date received by NHTSA
  PotentialNumberOfUnitsAffected: number;
}
```

### Complaint
```typescript
interface Complaint {
  odiNumber: number;             // Unique ODI complaint ID
  dateOfIncident: string;        // When defect occurred
  dateComplaintFiled: string;    // When complaint was submitted
  components: string;            // Affected component(s)
  summary: string;               // Consumer description
  crash: boolean;                // Resulted in crash?
  fire: boolean;                 // Resulted in fire?
  numberOfInjuries: number;
  numberOfDeaths: number;
  products: ComplaintProduct[];
}

interface ComplaintProduct {
  type: string;
  make: string;
  model: string;
  modelYear: string;
}
```

---

## 17. CORS & Proxy Configuration

**File:** `vite.config.ts`

### The Problem
Browsers enforce the Same-Origin Policy. JavaScript running on `localhost:5173` cannot directly call `https://vpic.nhtsa.dot.gov` because the origins differ → CORS error.

### The Solution
Vite's dev server acts as a local reverse proxy. The browser calls `/api/vpic/...` (same origin) and Vite forwards the request to the actual NHTSA server.

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/vpic': {
        target: 'https://vpic.nhtsa.dot.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/vpic/, '/api/vehicles'),
        secure: true,
      },
      '/api/nhtsa': {
        target: 'https://api.nhtsa.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nhtsa/, ''),
        secure: true,
      },
    },
  },
});
```

**URL transformation examples:**

```
/api/vpic/DecodeVinValues/1HGCM82633A004352?format=json
    → https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/1HGCM82633A004352?format=json

/api/nhtsa/recalls/recallsByVehicle?make=FORD&model=F-150&modelYear=2020
    → https://api.nhtsa.gov/recalls/recallsByVehicle?make=FORD&model=F-150&modelYear=2020
```

### Production Note
This proxy only works during `npm run dev`. For production deployment, configure a server-side proxy using `vercel.json` rewrites or `netlify.toml` redirects (see README.md deployment section).

---

## 18. Development Setup

### Requirements
- Node.js ≥ 18.0.0
- npm ≥ 9.0.0

### Install
```bash
npm install --legacy-peer-deps
```

The `--legacy-peer-deps` flag is required because `react-simple-maps@3.0.0` declares a peer dependency on React 16/17/18, but this project uses React 19. The flag bypasses the peer dependency conflict — the library functions correctly at runtime.

### Run
```bash
npm run dev
# App runs at http://localhost:5173
```

### Other Commands
```bash
npm run build      # Production build → dist/
npm run preview    # Preview production build locally
npm run lint       # Run ESLint
npx tsc --noEmit   # Type-check without building
```

---

## 19. Build & Deployment

### Production Build
```bash
npm run build
```

Output: `dist/` folder containing:
- `index.html` — Single entry point
- `assets/index-[hash].js` — Bundled JavaScript
- `assets/index-[hash].css` — Bundled CSS
- All `public/` assets (logos, brand-logos/)

### Deployment Targets

**Vercel (Recommended):**
Add `vercel.json` to project root:
```json
{
  "rewrites": [
    { "source": "/api/vpic/:path*", "destination": "https://vpic.nhtsa.dot.gov/api/vehicles/:path*" },
    { "source": "/api/nhtsa/:path*", "destination": "https://api.nhtsa.gov/:path*" }
  ]
}
```

**Netlify:**
Add `netlify.toml` to project root:
```toml
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

---

## 20. Known Limitations

| Limitation | Details |
|---|---|
| **No URL-based routing** | Browser back/forward buttons don't navigate between pages. URLs don't change — pages can't be bookmarked or shared directly. |
| **No offline support** | All data is live. No caching, no service worker, no offline fallback. |
| **NHTSA data completeness** | NHTSA data reflects only reported complaints and official recalls. Unreported incidents are not captured. |
| **Geographic map is estimated** | State-level complaint distribution is estimated using population weighting + variance. NHTSA does not provide geographic breakdown in its public API. |
| **Proxy required in production** | The Vite dev proxy does not work in production builds. A server-side proxy (Vercel/Netlify rewrites) must be configured for deployment. |
| **37 brands for logos** | Only 38 car brands have bundled logos. Any brand outside this set shows a generic car icon. |
| **No pagination** | All complaints/recalls for a vehicle are loaded at once. High-complaint vehicles (e.g. popular Ford/Toyota models) may return thousands of records. |
| **NHTSA API rate limits** | NHTSA does not publish rate limits but may throttle aggressive usage. The app makes 2–3 API calls per search. |
| **react-simple-maps + React 19 peer conflict** | Requires `--legacy-peer-deps` during install. No functional impact. |

---

## 21. Glossary

| Term | Definition |
|---|---|
| **VIN** | Vehicle Identification Number. A unique 17-character code assigned to every motor vehicle by the manufacturer. Encodes make, model, year, plant, and serial number. |
| **NHTSA** | National Highway Traffic Safety Administration. U.S. federal agency responsible for vehicle safety standards and defect investigations. |
| **vPIC** | Vehicle Product Information Catalog. NHTSA's VIN decoding API. |
| **ODI** | Office of Defects Investigation. The NHTSA division that receives and investigates consumer safety complaints. |
| **Recall** | A manufacturer or NHTSA-ordered correction for a safety defect. Manufacturers must notify owners and repair vehicles free of charge. |
| **Campaign Number** | The unique NHTSA identifier for a recall campaign (e.g. `21V123000`). |
| **Complaint** | A consumer-submitted report to NHTSA describing a perceived safety defect. Complaints are not the same as recalls — they represent unresolved issues. |
| **ODI Number** | Unique identifier for a specific complaint in the ODI database. |
| **CORS** | Cross-Origin Resource Sharing. A browser security mechanism that blocks JavaScript from making requests to different domains. |
| **SPA** | Single Page Application. A web app that loads once and dynamically updates content without full page reloads. |
| **HMR** | Hot Module Replacement. Vite feature that updates changed modules in the browser instantly during development without a full reload. |
| **Choropleth** | A map that uses colour gradients to represent data values across geographic regions (used for the US state complaint map). |
| **Peer Dependency** | A package that your dependency requires but expects the consuming project to provide. |
| **Epoch** | Unix timestamp origin: January 1, 1970. NHTSA occasionally returns malformed dates that parse to this date — the app guards against this. |

---

*This document covers the complete technical and product specification of the Strategic Legal Practice Vehicle Defect Intelligence Platform as of Version 1.0.0, March 2026.*
