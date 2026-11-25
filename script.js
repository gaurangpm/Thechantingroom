/* ==========================================================
   The Chanting Room – Naam Jap counter
   - Tap / click / Space / Enter to count
   - Mala ring fills every 108 counts
   - Progress saved in the browser (localStorage) so it survives reloads
   ========================================================== */

(function () {
  "use strict";

  const MALA_SIZE = 108;
  const STORAGE_KEY = "chantingRoomCounter";

  // ---------- Elements ----------
  const countEl = document.getElementById("count");
  const malasEl = document.getElementById("malas");
  const todayEl = document.getElementById("today");
  const ringEl = document.getElementById("ring");
  const mantraEl = document.getElementById("mantra");
  const tapBtn = document.getElementById("tapBtn");
  const undoBtn = document.getElementById("undoBtn");
  const resetBtn = document.getElementById("resetBtn");
  const vibrateEl = document.getElementById("vibrateToggle");

  // SVG ring geometry (r = 100 in viewBox 0 0 220 220)
  const RADIUS = 100;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  if (ringEl) {
    ringEl.style.strokeDasharray = CIRCUMFERENCE;
  }

  // ---------- State ----------
  const state = {
    total: 0,        // all-time count
    today: 0,        // count for today
    day: todayKey(), // date string used to reset "today"
    mantra: "",
    vibrate: true
  };

  function todayKey() {
    const d = new Date();
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  }

  // ---------- Storage (safe if blocked) ----------
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved) {
        Object.assign(state, saved);
      }
    } catch (e) {
      /* storage unavailable or corrupt – start fresh */
    }
    if (state.day !== todayKey()) {
      state.today = 0;
      state.day = todayKey();
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* ignore */
    }
  }

  // ---------- Rendering ----------
  function render() {
    const inMala = state.total % MALA_SIZE;
    const malas = Math.floor(state.total / MALA_SIZE);

    countEl.textContent = inMala;
    malasEl.textContent = malas;
    todayEl.textContent = state.today;

    // Ring shows progress through the current mala
    const progress = inMala / MALA_SIZE;
    ringEl.style.strokeDashoffset = CIRCUMFERENCE * (1 - progress);

    if (vibrateEl) {
      vibrateEl.checked = state.vibrate;
    }
  }

  function setMantraFromInput() {
    state.mantra = mantraEl.value.trim();
    save();
  }

  // ---------- Actions ----------
  function tap() {
    if (state.day !== todayKey()) {
      state.today = 0;
      state.day = todayKey();
    }
    state.total += 1;
    state.today += 1;

    if (state.vibrate && "vibrate" in navigator) {
      navigator.vibrate(12);
    }

    save();
    render();
  }

  function undo() {
    if (state.total === 0) return;
    state.total -= 1;
    if (state.today > 0) state.today -= 1;
    save();
    render();
  }

  function reset() {
    const ok = window.confirm("Reset the counter to zero? This cannot be undone.");
    if (!ok) return;
    state.total = 0;
    state.today = 0;
    save();
    render();
  }

  // ---------- Events ----------
  tapBtn.addEventListener("click", tap);
  undoBtn.addEventListener("click", undo);
  resetBtn.addEventListener("click", reset);

  mantraEl.addEventListener("input", setMantraFromInput);

  if (vibrateEl) {
    vibrateEl.addEventListener("change", function () {
      state.vibrate = vibrateEl.checked;
      save();
    });
  }

  // Keyboard: Space or Enter counts, unless typing in the mantra box
  document.addEventListener("keydown", function (e) {
    const typing = e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA";
    if (typing) return;
    if (e.code === "Space" || e.key === "Enter") {
      e.preventDefault();
      tap();
    }
  });

  // Footer year
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ---------- Init ----------
  load();
  if (mantraEl) {
    mantraEl.value = state.mantra || "";
  }
  render();
})();
