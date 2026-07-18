/**
 * auth-common.js
 * ------------------------------------------------------------------
 * Shared, reusable helpers used by both login.html (auth.js) and
 * index.html (auth-guard.js):
 *   - Toast notifications (styled to match StudyFlow's design tokens)
 *   - Email / password / name validation
 *   - Password strength scoring
 *   - Friendly Firebase error messages (never leaks raw error detail)
 *   - Sign out helper
 *
 * Nothing here touches the existing dashboard state, storage keys,
 * or DOM structure.
 * ------------------------------------------------------------------
 */

import { auth } from "firebase-config.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

/* ------------------------------ Toasts ----------------------------- */

let toastHost = null;

function getToastHost() {
  if (toastHost && document.body.contains(toastHost)) return toastHost;
  toastHost = document.createElement("div");
  toastHost.id = "sfToastHost";
  toastHost.setAttribute("aria-live", "polite");
  toastHost.setAttribute("aria-atomic", "true");
  toastHost.style.cssText = [
    "position:fixed", "top:1.25rem", "right:1.25rem", "z-index:2147483000",
    "display:flex", "flex-direction:column", "gap:0.6rem",
    "max-width:min(92vw,22rem)", "pointer-events:none"
  ].join(";");
  document.body.appendChild(toastHost);
  return toastHost;
}

const TOAST_ICONS = {
  success: '<svg viewBox="0 0 24 24" class="h-5 w-5 flex-none" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 12 4 4L19 6" /></svg>',
  error: '<svg viewBox="0 0 24 24" class="h-5 w-5 flex-none" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></svg>',
  info: '<svg viewBox="0 0 24 24" class="h-5 w-5 flex-none" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>'
};

const TOAST_TONES = {
  success: { color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  error: { color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  info: { color: "#2563eb", bg: "rgba(37,99,235,0.12)" }
};

/**
 * Show a toast notification.
 * @param {string} message
 * @param {"success"|"error"|"info"} type
 * @param {number} duration ms before auto-dismiss
 */
export function showToast(message, type = "info", duration = 4200) {
  const host = getToastHost();
  const tone = TOAST_TONES[type] || TOAST_TONES.info;

  const toast = document.createElement("div");
  toast.className = "sf-toast";
  toast.style.cssText = [
    "pointer-events:auto", "display:flex", "align-items:flex-start", "gap:0.65rem",
    "border-radius:8px", "padding:0.85rem 1rem", "font-size:0.92rem", "font-weight:600",
    "line-height:1.35", "color:var(--text,#18181b)", "background:var(--surface-strong,#fff)",
    "border:1px solid var(--border, rgba(24,24,27,0.09))",
    "box-shadow:var(--shadow, 0 18px 55px rgba(43,48,70,0.16))",
    "transform:translateX(120%)", "opacity:0", "transition:transform 320ms cubic-bezier(.22,1,.36,1), opacity 320ms ease"
  ].join(";");

  toast.innerHTML = `
    <span style="color:${tone.color};margin-top:0.05rem;">${TOAST_ICONS[type] || TOAST_ICONS.info}</span>
    <span style="flex:1;min-width:0;">${escapeHtml(message)}</span>
    <button type="button" aria-label="Dismiss" style="flex:none;color:var(--muted,#6f717a);line-height:1;font-size:1.1rem;background:none;border:none;cursor:pointer;padding:0;">&times;</button>
  `;
  toast.style.borderLeft = `3px solid ${tone.color}`;
  toast.style.background = `linear-gradient(0deg, ${tone.bg}, ${tone.bg}), var(--surface-strong, #fff)`;

  host.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.transform = "translateX(0)";
    toast.style.opacity = "1";
  });

  let dismissed = false;
  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;
    toast.style.transform = "translateX(120%)";
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 320);
  };

  toast.querySelector("button").addEventListener("click", dismiss);
  const timer = setTimeout(dismiss, duration);
  toast.addEventListener("mouseenter", () => clearTimeout(timer));

  return dismiss;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* ---------------------------- Validation --------------------------- */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email) {
  return EMAIL_REGEX.test(String(email || "").trim());
}

export function isValidName(name) {
  return String(name || "").trim().length >= 2;
}

/**
 * Minimum bar every new password must clear:
 * at least 8 characters, one letter, one number.
 */
export function passwordMeetsMinimum(password) {
  const value = String(password || "");
  return value.length >= 8 && /[A-Za-z]/.test(value) && /[0-9]/.test(value);
}

/**
 * Score a password 0-4 for the strength meter.
 * Returns { score, label, color }.
 */
export function scorePasswordStrength(password) {
  const value = String(password || "");
  let score = 0;
  if (value.length >= 8) score += 1;
  if (value.length >= 12) score += 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
  if (/[0-9]/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;

  const levels = [
    { label: "Very weak", color: "#ef4444" },
    { label: "Weak", color: "#f59e0b" },
    { label: "Fair", color: "#f59e0b" },
    { label: "Strong", color: "#10b981" },
    { label: "Very strong", color: "#10b981" }
  ];
  const clamped = Math.min(score, levels.length - 1);
  return { score: clamped, ...levels[value ? clamped : 0], empty: value.length === 0 };
}

/* --------------------------- Error mapping -------------------------- */

/**
 * Convert a Firebase Auth error into a short, user-safe message.
 * Never surfaces raw error.message (which can include internal detail).
 */
export function friendlyAuthError(error) {
  const code = error && error.code ? error.code : "unknown";
  const map = {
    "auth/invalid-email": "That email address doesn't look valid.",
    "auth/user-disabled": "This account has been disabled. Contact support for help.",
    "auth/user-not-found": "We couldn't find an account with those details.",
    "auth/wrong-password": "That password doesn't match this account.",
    "auth/invalid-credential": "Incorrect email or password. Please try again.",
    "auth/invalid-login-credentials": "Incorrect email or password. Please try again.",
    "auth/email-already-in-use": "An account already exists with this email. Try logging in instead.",
    "auth/weak-password": "Please choose a stronger password.",
    "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
    "auth/popup-closed-by-user": "Sign-in was cancelled before it finished.",
    "auth/cancelled-popup-request": "Sign-in was cancelled before it finished.",
    "auth/popup-blocked": "Your browser blocked the sign-in popup. Please allow popups and try again.",
    "auth/network-request-failed": "Network error. Check your connection and try again.",
    "auth/operation-not-allowed": "This sign-in method isn't enabled yet for this project."
  };
  return map[code] || "Something went wrong. Please try again.";
}

/* ------------------------------ Session ----------------------------- */

export async function logoutCurrentUser() {
  await signOut(auth);
}
