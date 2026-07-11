# StudyFlow 📚

**StudyFlow** is a single-page, client-side student productivity dashboard. It brings together task management, a daily planner, a Pomodoro focus timer, subject progress tracking, quick notes, streaks, and an XP/level system — all in one clean, responsive interface with light/dark mode support.

**🔗 Live Demo:** [ahmadshayaan19.github.io/StudyFlow](https://ahmadshayaan19.github.io/StudyFlow/)

---

## ✨ Features

- **Dashboard** — Personalized greeting, daily motivational quote, and quick-action shortcuts.
- **Task Manager** — Add, edit, complete, search, and filter tasks by priority or status, with a live completion progress bar.
- **Today's Planner** — A simple timeline to schedule and check off tasks for the day.
- **Study Goal** — Set a daily focus-hour goal and track sessions, focus time, and completion percentage.
- **Pomodoro Timer** — Configurable focus sessions with start/pause/reset controls and session/time stats.
- **Quick Notes** — Capture and edit short notes or reminders.
- **Subject Progress** — Track completion progress across multiple learning tracks/subjects.
- **Study Streak** — Snapchat-style daily streak tracking with current and longest streak.
- **XP & Levels** — Earn XP for completing tasks and planner items, level up, and unlock achievement badges.
- **Weekly Activity Chart** — Visualize study activity across the past 7 days.
- **Dark / Light Mode** — Automatic based on system preference, with manual toggle.
- **Local-first storage** — All data is saved in the browser via `localStorage`; no backend or account required.
- **Reset Data** — One-click reset to clear all locally stored data.

---

## 🛠 Tech Stack

- **HTML5** — Single-file markup (`index.html`)
- **Tailwind CSS** (via CDN) — Utility-first styling with a custom theme (light/dark CSS variables)
- **Vanilla JavaScript** — No frameworks, no build step, no dependencies to install
- **Browser `localStorage`** — Client-side data persistence

There is no build tooling, package manager, or server-side code involved — the entire app is one HTML file.

---

## 🚀 Getting Started

### Option 1: Just open the file (fastest)

1. Clone or download this repository.
2. Open `index.html` directly in your browser (double-click it, or drag it into a browser window).

That's it — no installation, no dependencies, no build step required.

### Option 2: Run with a local server (recommended)

Some browsers restrict certain features (like `localStorage` behavior in some setups) when opening files via `file://`. Serving the file locally avoids this.

```bash
# Clone the repository
git clone https://github.com/ahmadshayaan19/StudyFlow.git
cd StudyFlow

# Option A: Python's built-in server
python3 -m http.server 8000

# Option B: Node's http-server (requires Node.js)
npx http-server -p 8000
```

Then open your browser and navigate to:

```
http://localhost:8000
```

### Requirements

- Any modern web browser (Chrome, Firefox, Edge, Safari)
- An internet connection on first load (Tailwind CSS is loaded from a CDN)
- No Node.js, npm, or build tools are required to run the app

---

## 📁 Project Structure

```
StudyFlow/
└── index.html   # Entire application — markup, styles, and logic
```

Everything (HTML structure, styling, and JavaScript logic) lives in a single `index.html` file for simplicity and easy deployment.

---

## 🌐 Deployment

This project is deployed with **GitHub Pages** directly from this repository, which is why it works as a static site with zero configuration.

To deploy your own copy:

1. Fork or push this repository to your own GitHub account.
2. Go to **Settings → Pages** in your repository.
3. Under **Source**, select the branch (e.g. `main`) and root folder (`/`).
4. Save — GitHub will publish your site at `https://<your-username>.github.io/<repo-name>/`.

---

## 💾 Data & Privacy

StudyFlow stores all of your tasks, notes, subjects, streaks, and settings **locally in your browser** using `localStorage`. Nothing is sent to any server, and no account or sign-up is required.

⚠️ Because data is stored per-browser, clearing your browser data, using a different browser, or using incognito/private mode will not preserve your saved data. Use the **Reset Data** button in the Settings section to intentionally clear everything.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m "Add some feature"`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source. Add a `LICENSE` file (e.g. MIT) to this repository if you'd like to specify usage terms explicitly.

---

## 👤 Author

**Ahmad Shayaan**
GitHub: [@ahmadshayaan19](https://github.com/ahmadshayaan19)
