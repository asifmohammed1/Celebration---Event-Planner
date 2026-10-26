# Celebration & Event Planner

> GenAI-powered planning assistant for weddings, birthdays, and community events — powered by **Google Gemini 2.0 Flash**

[![CI](https://github.com/asifmohammed1/Celebration-Event-Planner/actions/workflows/ci.yml/badge.svg)](https://github.com/asifmohammed1/Celebration-Event-Planner/actions)

## Overview

**Celebration & Event Planner** makes event planning accessible and enjoyable through six AI-powered features — all without needing a professional event planner.

```text
┌───────────────────────────────────────────────────────┐
│              User (Browser)                            │
│  index.html → js/app.js → GeminiClient.query()         │
│                    ↓                                  │
│         Google Gemini 2.0 Flash API                    │
│                    ↓                                  │
│  UIHelpers.renderMarkdown() → Output Panel             │
└───────────────────────────────────────────────────────┘
```

## Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | ✨ **Personalized Ideas** | Creative theme concepts, entertainment, and unique touches |
| 2 | 💰 **Budget Planner** | AI breakdown + manual tracker with actual vs. estimated |
| 3 | 📅 **Planning Timeline** | Month-by-month milestone checklist |
| 4 | 📋 **Vendor Checklist** | Essential vendors, key questions, confirmation tasks |
| 5 | 🎨 **Theme & Decor** | Color palette, lighting, table settings, favours |
| 6 | 📧 **Guest Messages** | Invitation wording, RSVP reminders, thank-you templates |

## Architecture

```text
Celebration & Event Planner/
├── index.html              → Semantic HTML5, zero inline JS/CSS
├── sw.js                   → Service Worker (Cache-First)
├── manifest.json           → PWA manifest
├── css/
│   └── styles.css          → Dark theme, CSS design tokens, animations
├── js/
│   ├── config.js           → Frozen constants (CONFIG, TIME_MS, AI_ERROR, DEMO)
│   ├── ui.js               → UIHelpers: toast, loading, markdown renderer, counters
│   ├── gemini.js           → GeminiClient: LRU cache, rate limiter, AbortController
│   ├── event.js            → EventData: sanitise, validate, budget math, summaries
│   ├── planner.js          → Planner: all 6 system prompt builders
│   ├── budget.js           → BudgetMgr: CRUD, totals, over-budget detection, render
│   └── app.js              → Bootstrap, handler map, tab navigation, SW registration
├── tests/
│   └── planner.test.js     → 22 suites, 82+ assertions, zero dependencies
├── Dockerfile              → nginx:alpine, port 8080
├── nginx.conf              → Security headers, gzip, /healthz
└── .github/workflows/ci.yml → Lint + HTML validate + Test + Docker
```

## Quick Start

```bash
npm run serve
```
Open `http://localhost:3000` — all features work with built-in demo responses.

**With Gemini API key:** Enter your key in the header input. Get one at [aistudio.google.com](https://aistudio.google.com).

## Development

```bash
npm install        # Install dev dependencies
npm run lint       # ESLint (0 errors, 0 warnings)
npm run validate   # HTML validate
npm test           # Run 82 unit tests
npm run serve      # Serve locally at :3000
```

## Docker

```bash
docker build -t celebration-event-planner .
docker run -p 8080:8080 celebration-event-planner
# http://localhost:8080/healthz → "ok"
```

## Security

- XSS prevention: 5-step sanitisation on all user inputs (`EventData.sanitise()`)
- No `eval` / `innerHTML` on user content
- File API not used — no file upload attack surface
- Gemini safety: 4 harm categories at `BLOCK_MEDIUM_AND_ABOVE`
- Fetch timeout: 15-second `AbortController` on all Gemini requests
- Rate limiting: 1.5-second minimum gap between API calls
- nginx headers: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`

## Code Quality

- ESLint: 0 errors, 0 warnings (`--max-warnings 0`)
- All functions <= 50 lines (`max-lines-per-function` enforced)
- JSDoc on every exported function
- All constants frozen with `Object.freeze()`

## License

MIT © 2026 Asif | AntiGravity
