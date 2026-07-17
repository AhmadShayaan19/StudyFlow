# StudyFlow — Authentication Layer Setup

This adds a Login/Signup layer in front of your existing dashboard.
**Your dashboard (`index.html`'s existing markup, styles, and script)
was not modified or rewritten** — only new files were added, plus a
few small, clearly-marked additions to `index.html` (a loading
overlay + one script tag) needed to gate access to it. See the
"What changed in index.html" section at the bottom for the exact diff.

## New files

```
login.html              Login / Signup / Forgot-password screens
js/firebase-config.js   Firebase initialization (put your project keys here)
js/auth-common.js       Shared toasts, validation, error messages, sign-out
js/auth.js              login.html's page logic (all the Firebase calls)
js/auth-guard.js        Protects index.html: checks session, shows dashboard
                        or redirects, adds the Log out menu
```

## 1. Create a Firebase project

1. Go to the [Firebase console](https://console.firebase.google.com) and
   create a project (or use an existing one).
2. In **Project settings → General → Your apps**, add a **Web app**.
3. Firebase will show you a `firebaseConfig` object. Copy it.

## 2. Add your config

Open `js/firebase-config.js` and replace the placeholder values with
the config you copied:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

This is the **only file** you need to edit to connect your Firebase
project — every other auth file imports from it.

## 3. Enable sign-in methods

In the Firebase console: **Authentication → Sign-in method**, enable:
- **Email/Password**
- **Google**

## 4. Run it over a local server (not `file://`)

The auth files use ES module imports (`type="module"`), which browsers
block on the `file://` protocol. Serve the folder locally, e.g.:

```bash
# Python
python3 -m http.server 5500

# or Node
npx serve .
```

Then open `http://localhost:5500/login.html`. When you deploy (Firebase
Hosting, Netlify, Vercel, GitHub Pages, etc.), this isn't an issue since
those all serve over http/https.

## 5. Authorized domains (for Google Sign-In)

`localhost` is authorized by default. Before deploying, add your real
domain under **Authentication → Settings → Authorized domains**, or
Google Sign-In will fail on that domain.

## How it behaves

- Visiting `index.html` with no session redirects to `login.html`
  (with a brief "Checking your session…" spinner first).
- Logging in or signing up redirects to `index.html`.
- **Remember me** (checked, default): session persists after closing
  the browser. Unchecked: session ends when the browser closes.
- The profile avatar in the dashboard header now shows the signed-in
  user's initials and opens a small menu with **Log out**.
- **Forgot password** sends a reset email via Firebase and never
  reveals whether an account exists for that address.

## Firestore — ready for later

`js/firebase-config.js` already exports a `db` (Firestore) instance,
imported but unused. When you're ready to sync tasks/notes/streaks/XP
to the cloud instead of `localStorage`, `js/auth.js` has a commented
example showing where a per-user profile document gets created on
signup.

## What changed in `index.html`

Three additions only, each wrapped in `<!-- AUTH LAYER ... -->`
comments so they're easy to find:
1. A small `<style>` block (hides `.app-shell` until a session is
   confirmed; styles the loading spinner).
2. A loading-overlay `<div>` as the first element in `<body>`.
3. One `<script type="module" src="js/auth-guard.js"></script>` line
   before `</body>`.

Nothing was deleted, reordered, or rewritten — your planner, tasks,
streaks, XP, notes, achievements, charts, and theme system all work
exactly as before.
