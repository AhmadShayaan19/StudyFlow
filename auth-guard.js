/**
 * auth-guard.js
 * ------------------------------------------------------------------
 * Protects index.html (the existing StudyFlow dashboard) behind
 * Firebase Authentication, without touching any of the dashboard's
 * own markup or script.
 *
 * What it does:
 *   1. Keeps the dashboard visually hidden (via a CSS rule added in
 *      index.html's new auth-guard style block) until we know whether
 *      a session exists.
 *   2. If a user IS signed in: reveals the dashboard, personalizes the
 *      profile avatar, and wires up a Log out control.
 *   3. If NO user is signed in: redirects to login.html.
 *
 * The dashboard's own <script> (state, tasks, streaks, XP, etc.) is
 * completely untouched and keeps working exactly as before — this
 * file only controls visibility of the .app-shell wrapper and adds a
 * logout affordance to the header.
 * ------------------------------------------------------------------
 */

import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { showToast, logoutCurrentUser } from "./auth-common.js";

function revealDashboard(user) {
  document.body.classList.add("sf-auth-ready");
  const overlay = document.getElementById("authGuardOverlay");
  if (overlay) {
    overlay.style.opacity = "0";
    setTimeout(() => overlay.remove(), 260);
  }
  personalizeHeader(user);
}

function redirectToLogin() {
  window.location.replace("login.html");
}

/**
 * Updates the existing profile avatar (added by index.html) with the
 * signed-in user's initials, and attaches a small logout dropdown.
 * Purely a runtime DOM enhancement — index.html's markup is unchanged.
 */
function personalizeHeader(user) {
  const avatar = document.querySelector('[title="Profile"]');
  if (!avatar) return;

  const displayName = user.displayName || "";
  const email = user.email || "";
  const initials = getInitials(displayName, email);

  avatar.textContent = initials;
  avatar.title = displayName || email || "Profile";
  avatar.style.cursor = "pointer";
  avatar.setAttribute("role", "button");
  avatar.setAttribute("tabindex", "0");
  avatar.setAttribute("aria-haspopup", "true");
  avatar.setAttribute("aria-expanded", "false");

  const menu = buildAccountMenu(displayName, email);
  document.body.appendChild(menu);

  function toggleMenu(open) {
    const shouldOpen = open ?? menu.style.display !== "block";
    if (shouldOpen) {
      const rect = avatar.getBoundingClientRect();
      menu.style.top = `${rect.bottom + 8 + window.scrollY}px`;
      menu.style.right = `${Math.max(12, window.innerWidth - rect.right)}px`;
      menu.style.display = "block";
      requestAnimationFrame(() => {
        menu.style.opacity = "1";
        menu.style.transform = "translateY(0)";
      });
      avatar.setAttribute("aria-expanded", "true");
    } else {
      menu.style.opacity = "0";
      menu.style.transform = "translateY(-6px)";
      avatar.setAttribute("aria-expanded", "false");
      setTimeout(() => { menu.style.display = "none"; }, 160);
    }
  }

  avatar.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleMenu();
  });
  avatar.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleMenu();
    }
  });
  document.addEventListener("click", (event) => {
    if (!menu.contains(event.target)) toggleMenu(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") toggleMenu(false);
  });
  window.addEventListener("resize", () => toggleMenu(false));
}

function buildAccountMenu(displayName, email) {
  const menu = document.createElement("div");
  menu.id = "sfAccountMenu";
  menu.style.cssText = [
    "position:fixed", "display:none", "opacity:0", "transform:translateY(-6px)",
    "transition:opacity 180ms ease, transform 180ms ease",
    "min-width:13rem", "z-index:2147483000", "border-radius:8px",
    "background:var(--surface-strong,#fff)", "border:1px solid var(--border,rgba(24,24,27,0.09))",
    "box-shadow:var(--shadow,0 18px 55px rgba(43,48,70,0.16))", "padding:0.5rem", "overflow:hidden"
  ].join(";");

  const safeName = escapeHtml(displayName || "Signed in");
  const safeEmail = escapeHtml(email || "");

  menu.innerHTML = `
    <div style="padding:0.5rem 0.6rem 0.65rem;border-bottom:1px solid var(--border,rgba(24,24,27,0.09));">
      <p style="font-weight:800;font-size:0.9rem;color:var(--text,#18181b);">${safeName}</p>
      <p style="font-size:0.78rem;color:var(--muted,#6f717a);margin-top:0.1rem;word-break:break-all;">${safeEmail}</p>
    </div>
    <button type="button" id="sfLogoutButton" style="
      margin-top:0.5rem;width:100%;display:flex;align-items:center;gap:0.5rem;
      padding:0.55rem 0.6rem;border-radius:8px;border:none;background:none;cursor:pointer;
      font-weight:700;font-size:0.88rem;color:#dc2626;">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>
      Log out
    </button>
  `;

  menu.querySelector("#sfLogoutButton").addEventListener("mouseenter", (event) => {
    event.currentTarget.style.background = "rgba(239,68,68,0.1)";
  });
  menu.querySelector("#sfLogoutButton").addEventListener("mouseleave", (event) => {
    event.currentTarget.style.background = "none";
  });
  menu.querySelector("#sfLogoutButton").addEventListener("click", handleLogout);

  return menu;
}

async function handleLogout() {
  const button = document.getElementById("sfLogoutButton");
  if (button) {
    button.disabled = true;
    button.style.opacity = "0.6";
  }
  try {
    await logoutCurrentUser();
    // onAuthStateChanged below will detect the signed-out state and
    // redirect to login.html automatically.
  } catch (error) {
    showToast("Couldn't log out. Please try again.", "error");
    if (button) {
      button.disabled = false;
      button.style.opacity = "1";
    }
  }
}

function getInitials(displayName, email) {
  if (displayName && displayName.trim()) {
    const parts = displayName.trim().split(/\s+/);
    const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2);
    return letters.toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "?";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* --------------------------------- Boot --------------------------------- */

let handled = false;
onAuthStateChanged(auth, (user) => {
  // Firebase can fire this callback more than once (e.g. token refresh).
  // Only run the reveal/redirect flow the first time per page load.
  if (handled) return;
  handled = true;

  if (user) {
    revealDashboard(user);
  } else {
    redirectToLogin();
  }
});
