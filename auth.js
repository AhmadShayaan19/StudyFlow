/**
 * auth.js
 * ------------------------------------------------------------------
 * Page logic for login.html: view switching (login / signup / forgot),
 * client-side validation, password visibility + strength, and all
 * Firebase Authentication calls (email/password, Google, password
 * reset). Also redirects to index.html immediately if a session
 * already exists, so a logged-in user never sees the login form.
 * ------------------------------------------------------------------
 */

import { auth, googleProvider } from "firebase-config.js";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import {
  showToast,
  isValidEmail,
  isValidName,
  passwordMeetsMinimum,
  scorePasswordStrength,
  friendlyAuthError
} from "./auth-common.js";

const $ = (selector) => document.querySelector(selector);

/* ------------------------- Redirect if signed in ------------------------- */
// If Firebase already has a session (e.g. the user hit the back button,
// or bookmarked login.html), send them straight to the dashboard instead
// of showing the login form.
const overlay = $("#authCheckOverlay");
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.replace("index.html");
    return;
  }
  // No session: reveal the login form.
  if (overlay) {
    overlay.style.opacity = "0";
    setTimeout(() => overlay.remove(), 260);
  }
});

/* ------------------------------ Theme toggle ------------------------------ */
const THEME_KEY = "studyflow.theme";
const themeToggle = $("#themeToggle");
const themeIcon = $("#themeIcon");

function applyThemeIcon() {
  if (!themeIcon) return;
  const isDark = document.documentElement.classList.contains("dark");
  themeIcon.innerHTML = isDark
    ? '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />'
    : '<path d="M12 3v2M12 19v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M3 12h2M19 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /><circle cx="12" cy="12" r="4" />';
}
applyThemeIcon();

themeToggle?.addEventListener("click", () => {
  const root = document.documentElement;
  root.classList.toggle("dark");
  localStorage.setItem(THEME_KEY, root.classList.contains("dark") ? "dark" : "light");
  applyThemeIcon();
});

/* ------------------------------ View switching ----------------------------- */
const VIEW_TRANSITION_MS = 220;

function switchView(target) {
  const current = document.querySelector(".auth-view:not([hidden])");
  const next = document.querySelector(`[data-view-panel="${target}"]`);
  if (!next || current === next) return;

  document.body.dataset.view = target;

  if (!current) {
    next.hidden = false;
    return;
  }

  current.classList.add("auth-view--leaving");
  setTimeout(() => {
    current.hidden = true;
    current.classList.remove("auth-view--leaving");

    next.hidden = false;
    next.classList.add("auth-view--entering");
    // Force a reflow so the browser registers the starting state
    // before we remove the class and transition to the resting state.
    void next.offsetWidth;
    next.classList.remove("auth-view--entering");
  }, VIEW_TRANSITION_MS);
}

$("#showSignup")?.addEventListener("click", () => switchView("signup"));
$("#showLogin")?.addEventListener("click", () => switchView("login"));
$("#showForgot")?.addEventListener("click", () => switchView("forgot"));
$("#showLoginFromForgot")?.addEventListener("click", () => switchView("login"));

/* --------------------------- Password show/hide --------------------------- */
const EYE_OPEN = '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />';
const EYE_CLOSED = '<path d="M3 3l18 18" /><path d="M10.6 10.6a3 3 0 0 0 4.24 4.24" /><path d="M9.9 5.1A9.4 9.4 0 0 1 12 5c6.4 0 10 7 10 7a13.4 13.4 0 0 1-3.1 3.9M6.2 6.2C3.6 7.9 2 12 2 12s1 1.9 2.8 3.6" />';

document.querySelectorAll(".password-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const input = document.getElementById(button.dataset.target);
    if (!input) return;
    const showing = input.type === "text";
    input.type = showing ? "password" : "text";
    const svg = button.querySelector("svg");
    svg.innerHTML = showing ? EYE_OPEN : EYE_CLOSED;
    button.setAttribute("aria-label", showing ? "Show password" : "Hide password");
  });
});

/* -------------------------------- Helpers -------------------------------- */

function setFieldError(inputId, errorId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (input) input.classList.toggle("invalid", Boolean(message));
  if (error) error.textContent = message || "";
}

function setButtonBusy(button, busy, busyLabel) {
  if (!button) return;
  const label = button.querySelector(".btn-label");
  if (busy) {
    button.dataset.originalLabel = label ? label.textContent : "";
    if (label) label.textContent = busyLabel || "Please wait…";
    button.disabled = true;
    button.insertAdjacentHTML("beforeend", '<span class="btn-spinner" aria-hidden="true"></span>');
  } else {
    if (label && button.dataset.originalLabel) label.textContent = button.dataset.originalLabel;
    button.disabled = false;
    button.querySelector(".btn-spinner")?.remove();
  }
}

/* -------------------------------- Login form -------------------------------- */

const loginForm = $("#loginForm");
let loginSubmitting = false;

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (loginSubmitting) return;

  const email = $("#loginEmail").value.trim();
  const password = $("#loginPassword").value;
  const rememberMe = $("#rememberMe").checked;

  setFieldError("loginEmail", "loginEmailError", "");
  setFieldError("loginPassword", "loginPasswordError", "");

  let hasError = false;
  if (!isValidEmail(email)) {
    setFieldError("loginEmail", "loginEmailError", "Enter a valid email address.");
    hasError = true;
  }
  if (!password) {
    setFieldError("loginPassword", "loginPasswordError", "Enter your password.");
    hasError = true;
  }
  if (hasError) return;

  loginSubmitting = true;
  const submitButton = $("#loginSubmit");
  setButtonBusy(submitButton, true, "Logging in…");

  try {
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
    await signInWithEmailAndPassword(auth, email, password);
    showToast("Welcome back! Redirecting…", "success", 1600);
    window.location.replace("index.html");
  } catch (error) {
    showToast(friendlyAuthError(error), "error");
  } finally {
    loginSubmitting = false;
    setButtonBusy(submitButton, false);
  }
});

/* -------------------------------- Signup form -------------------------------- */

const signupForm = $("#signupForm");
const signupPasswordInput = $("#signupPassword");
const strengthMeter = $("#strengthMeter");
const strengthFill = $("#strengthFill");
const strengthLabel = $("#strengthLabel");
let signupSubmitting = false;

signupPasswordInput?.addEventListener("input", () => {
  const value = signupPasswordInput.value;
  if (!value) {
    strengthMeter.hidden = true;
    return;
  }
  strengthMeter.hidden = false;
  const { score, label, color } = scorePasswordStrength(value);
  strengthFill.style.width = `${((score + 1) / 5) * 100}%`;
  strengthFill.style.background = color;
  strengthLabel.textContent = label;
  strengthLabel.style.color = color;
});

signupForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (signupSubmitting) return;

  const name = $("#signupName").value.trim();
  const email = $("#signupEmail").value.trim();
  const password = $("#signupPassword").value;
  const confirm = $("#signupConfirm").value;

  setFieldError("signupName", "signupNameError", "");
  setFieldError("signupEmail", "signupEmailError", "");
  setFieldError("signupPassword", "signupPasswordError", "");
  setFieldError("signupConfirm", "signupConfirmError", "");

  let hasError = false;
  if (!isValidName(name)) {
    setFieldError("signupName", "signupNameError", "Enter your full name.");
    hasError = true;
  }
  if (!isValidEmail(email)) {
    setFieldError("signupEmail", "signupEmailError", "Enter a valid email address.");
    hasError = true;
  }
  if (!passwordMeetsMinimum(password)) {
    setFieldError("signupPassword", "signupPasswordError", "Use at least 8 characters, with a letter and a number.");
    hasError = true;
  }
  if (confirm !== password) {
    setFieldError("signupConfirm", "signupConfirmError", "Passwords don't match.");
    hasError = true;
  }
  if (hasError) return;

  signupSubmitting = true;
  const submitButton = $("#signupSubmit");
  setButtonBusy(submitButton, true, "Creating account…");

  try {
    await setPersistence(auth, browserLocalPersistence);
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: name });

    // ---------------------------------------------------------------
    // Ready for later: create the user's Firestore profile document
    // here once cloud sync is wired up. Left commented out so signup
    // works today with zero Firestore setup required.
    //
    //   import { doc, setDoc, serverTimestamp } from
    //     "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
    //   import { db } from "./firebase-config.js";
    //   await setDoc(doc(db, "users", credential.user.uid), {
    //     name,
    //     email,
    //     createdAt: serverTimestamp()
    //   });
    // ---------------------------------------------------------------

    showToast("Account created! Redirecting…", "success", 1600);
    window.location.replace("index.html");
  } catch (error) {
    showToast(friendlyAuthError(error), "error");
  } finally {
    signupSubmitting = false;
    setButtonBusy(submitButton, false);
  }
});

/* -------------------------------- Forgot password -------------------------------- */

const forgotForm = $("#forgotForm");
let forgotSubmitting = false;

forgotForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (forgotSubmitting) return;

  const email = $("#forgotEmail").value.trim();
  setFieldError("forgotEmail", "forgotEmailError", "");

  if (!isValidEmail(email)) {
    setFieldError("forgotEmail", "forgotEmailError", "Enter a valid email address.");
    return;
  }

  forgotSubmitting = true;
  const submitButton = $("#forgotSubmit");
  setButtonBusy(submitButton, true, "Sending…");

  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    // Don't reveal whether an account exists for this email — only
    // surface genuine input problems (e.g. malformed address).
    if (error.code !== "auth/user-not-found") {
      showToast(friendlyAuthError(error), "error");
      forgotSubmitting = false;
      setButtonBusy(submitButton, false);
      return;
    }
  }

  showToast("If an account exists for that email, a reset link is on its way.", "success", 5000);
  forgotForm.reset();
  forgotSubmitting = false;
  setButtonBusy(submitButton, false);
  setTimeout(() => switchView("login"), 900);
});

/* -------------------------------- Google sign-in -------------------------------- */

async function handleGoogleSignIn(button) {
  setButtonBusy(button, true, "Connecting…");
  try {
    await setPersistence(auth, browserLocalPersistence);
    await signInWithPopup(auth, googleProvider);
    showToast("Welcome! Redirecting…", "success", 1600);
    window.location.replace("index.html");
  } catch (error) {
    if (error.code !== "auth/popup-closed-by-user" && error.code !== "auth/cancelled-popup-request") {
      showToast(friendlyAuthError(error), "error");
    }
  } finally {
    setButtonBusy(button, false);
  }
}

$("#googleLoginBtn")?.addEventListener("click", (event) => handleGoogleSignIn(event.currentTarget));
$("#googleSignupBtn")?.addEventListener("click", (event) => handleGoogleSignIn(event.currentTarget));
