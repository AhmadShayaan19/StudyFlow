# StudyFlow — Student Productivity Dashboard

A single-file, no-install student dashboard: tasks, planner, subjects, notes, a Pomodoro timer, streaks, and an XP/achievement system — all running client-side with zero setup.

## Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Project Structure](#project-structure)
- [Data & Storage](#data--storage)
- [Customization](#customization)
- [Deploying to a Live Site](#deploying-to-a-live-site)
- [Browser Support](#browser-support)
- [Troubleshooting](#troubleshooting)

## Features

- **Dashboard** — daily greeting, motivational quote, quick actions
- **Tasks** — priority levels, due dates, search, filtering, progress bar
- **Planner** — a simple daily timeline of scheduled items
- **Subjects** — track per-subject progress
- **Notes** — quick capture for thoughts, formulas, reminders
- **Pomodoro focus timer** — customizable session length
- **Daily study goal** — set target hours, track sessions and time
- **Streaks** — current and longest daily streak
- **XP & levels** — earn XP, unlock achievement badges
- **Weekly progress chart**
- **Dark/light theme** — respects system preference, remembers your choice
- **Fully responsive** — collapsible sidebar, mobile menu
- 100% client-side: no signup, no account, no server

## Tech Stack

- Plain HTML, CSS, and vanilla JavaScript — no framework, no build step
- [Tailwind CSS](https://tailwindcss.com/) loaded via CDN (`cdn.tailwindcss.com`)
- Browser `localStorage` for all data persistence

There is no `package.json`, no bundler, and nothing to `npm install`. The entire app is one HTML file.

## Prerequisites

- Any modern browser (Chrome, Firefox, Edge, or Safari)
- An internet connection the first time the page loads, so it can fetch the Tailwind CDN script (see [Troubleshooting](#troubleshooting))
- *Optional*, only needed if you want to serve the file instead of opening it directly: Python 3 or Node.js

## Local Setup

### Option 1 — Just open it (fastest)

Double-click `Studyflow.html`, or right-click it → **Open with** → your browser. It runs immediately — nothing to install.

### Option 2 — Serve it locally (recommended)

Serving over `http://localhost` sidesteps the occasional browser quirk with `file://` pages and behaves closer to how the deployed site will run. Use whichever you already have installed:

**Python 3** (pre-installed on most Mac/Linux systems):

```bash
cd path/to/folder-containing-file
python3 -m http.server 8000
```

Then visit `http://localhost:8000/Studyflow.html`.

**Node.js:**

```bash
npx serve .
```

Then open the URL it prints and click through to `Studyflow.html`.

**VS Code:** install the "Live Server" extension, then right-click `Studyflow.html` → **Open with Live Server**.

## Project Structure

```
├── Studyflow.html   # Everything: markup, styles, and app logic in one file
```

CSS lives in a `<style>` block in `<head>` (plus Tailwind's utility classes). All JavaScript — state management, rendering, event handling — is in a single `<script>` block right before `</body>`, and runs immediately via a call to `init()` at the bottom (no `DOMContentLoaded` wait needed, since the script tag comes after the markup).

## Data & Storage

- All app data (tasks, planner, subjects, notes, XP, streaks, goal settings) is saved to the browser's `localStorage` under the key `studyflow.dashboard.v1`. Theme choice is stored separately under `studyflow.theme`.
- Storage is per-browser, per-origin: data won't sync between different browsers, devices, or between a local copy and a deployed copy — each is its own storage bucket.
- Private/incognito windows typically clear `localStorage` on close.
- To start fresh, use **Settings → Reset Data** in the app, or clear site data for that page from your browser's settings.

## Customization

Quick tweaks you can make directly in `Studyflow.html`:

| What | Where |
|---|---|
| Default daily study goal (hours) | `dailyGoal: { hours: 5 }` inside `createDefaultState()` |
| Default Pomodoro length (minutes) | `pomodoroSettings: { minutes: 25 }` inside `createDefaultState()` |
| Accent / theme colors | CSS custom properties under `:root` and `.dark` near the top of the file |

## Deploying to a Live Site

Since it's a single static file with no backend, no environment variables, and no build step, any static host works. A few free options:

### GitHub Pages

1. Create a GitHub repo named **`study-flow`**.
2. Push the file, renamed to `index.html` for a clean root URL:

   ```bash
   cd path/to/folder-containing-file
   mv Studyflow.html index.html
   git init
   git add index.html
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/study-flow.git
   git push -u origin main
   ```

3. On GitHub, go to **Settings → Pages**, set **Source** to the `main` branch, and save.
4. Your site goes live at `https://<your-username>.github.io/study-flow/`.

### Netlify (drag-and-drop)

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag in the folder containing `Studyflow.html` (renamed to `index.html`).
3. Netlify assigns a random URL; go to **Site settings → Change site name** and set it to `study-flow` for `study-flow.netlify.app`.

### Vercel

1. Run `npx vercel` from inside a folder named `study-flow`, or import the `study-flow` repo at [vercel.com/new](https://vercel.com/new).
2. Accept the defaults — no build command is needed — and deploy. Vercel names the project after the folder/repo by default, so you'll get `study-flow.vercel.app` (or a numbered variant if that name's taken).

No API keys or environment variables are required for any of these.

## Browser Support

Works in current versions of Chrome, Firefox, Edge, and Safari. Requires JavaScript and `localStorage` to be enabled (so it won't retain data in strict private-browsing modes that block storage).

## Troubleshooting

- **Page looks unstyled** — check your internet connection; the Tailwind CDN script (`cdn.tailwindcss.com`) needs to load once per visit. For a fully offline version, replace that `<script>` tag with a locally built Tailwind stylesheet.
- **My data disappeared** — you're likely in a different browser, a private/incognito window, or opened the file from a different path or URL than before (each counts as a separate storage origin).
- **Clicked "Reset Data" and nothing seems to change** — it clears `localStorage` and immediately re-renders with default state, so the dashboard should look freshly empty right away; refresh the page if anything looks stale.
