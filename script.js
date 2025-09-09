/*
  WordSwiper - basic swipeable card for English–Turkish words
  - Loads words from words.json (with inline fallback)
  - Shuffles order on load
  - Swipe with touch or mouse drag, click/tap to advance
*/

const inlineWords = [
  { en: "hello", tr: "merhaba" },
  { en: "yes", tr: "evet" },
  { en: "no", tr: "hayır" },
  { en: "please", tr: "lütfen" },
  { en: "thank you", tr: "teşekkür ederim" },
  { en: "sorry", tr: "özür dilerim" },
  { en: "good", tr: "iyi" },
  { en: "bad", tr: "kötü" },
  { en: "morning", tr: "sabah" },
  { en: "night", tr: "gece" },
  { en: "water", tr: "su" },
  { en: "food", tr: "yemek" },
  { en: "friend", tr: "arkadaş" },
  { en: "family", tr: "aile" },
  { en: "love", tr: "sevgi" },
  { en: "house", tr: "ev" },
  { en: "car", tr: "araba" },
  { en: "book", tr: "kitap" },
  { en: "school", tr: "okul" },
  { en: "work", tr: "iş" },
];

const state = {
  words: [],
  index: 0,
  startX: 0,
  currentX: 0,
  dragging: false,
};

const card = document.getElementById("card");
const wordEn = document.getElementById("wordEn");
const wordTr = document.getElementById("wordTr");

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function loadWords() {
  try {
    const res = await fetch("./words.json", { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error("Invalid JSON");
    return data;
  } catch (e) {
    console.warn("Using inline words fallback:", e.message);
    return inlineWords;
  }
}

function showWord() {
  const item = state.words[state.index % state.words.length];
  wordEn.textContent = item.en;
  wordTr.textContent = item.tr;
  card.classList.remove("enter");
  // trigger reflow for re-adding animation
  void card.offsetWidth;
  card.classList.add("enter");
}

function nextWord() {
  state.index = (state.index + 1) % state.words.length;
  resetCardPosition();
  showWord();
}

function resetCardPosition() {
  state.currentX = 0;
  card.style.transform = `translateX(0px) rotate(0deg)`;
  card.style.opacity = "1";
}

function onDown(x) {
  state.dragging = true;
  state.startX = x;
  state.currentX = x;
}

function onMove(x) {
  if (!state.dragging) return;
  state.currentX = x;
  const dx = x - state.startX;
  const rot = Math.max(-15, Math.min(15, dx / 10));
  card.style.transform = `translateX(${dx}px) rotate(${rot}deg)`;
  const opacity = Math.max(0.25, 1 - Math.abs(dx) / 240);
  card.style.opacity = String(opacity);
}

function onUp(x) {
  if (!state.dragging) return;
  state.dragging = false;
  const dx = x - state.startX;
  if (Math.abs(dx) > 90) {
    // swipe away animation
    const toX = dx > 0 ? window.innerWidth : -window.innerWidth;
    const rot = dx > 0 ? 20 : -20;
    card.style.transition = "transform 220ms ease, opacity 220ms ease";
    card.style.transform = `translateX(${toX}px) rotate(${rot}deg)`;
    card.style.opacity = "0";
    setTimeout(() => {
      card.style.transition = "";
      nextWord();
    }, 230);
  } else {
    // snap back
    card.style.transition = "transform 180ms ease, opacity 180ms ease";
    resetCardPosition();
    setTimeout(() => (card.style.transition = ""), 180);
  }
}

function bindEvents() {
  // Mouse
  card.addEventListener("mousedown", (e) => onDown(e.clientX));
  window.addEventListener("mousemove", (e) => onMove(e.clientX));
  window.addEventListener("mouseup", (e) => onUp(e.clientX));

  // Touch
  card.addEventListener("touchstart", (e) => onDown(e.touches[0].clientX), { passive: true });
  window.addEventListener("touchmove", (e) => onMove(e.touches[0].clientX), { passive: true });
  window.addEventListener("touchend", (e) => {
    const x = e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientX : state.currentX;
    onUp(x);
  });

  // Click/tap to advance
  card.addEventListener("click", (e) => {
    // Prevent click from firing after a drag swipe away (threshold)
    if (Math.abs(state.currentX - state.startX) < 5) {
      nextWord();
    }
  });
}

(async function init() {
  const data = await loadWords();
  state.words = shuffle([...data]);
  state.index = 0;
  bindEvents();
  showWord();
})();
