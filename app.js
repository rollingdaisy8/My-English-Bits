const STORAGE_KEY = "myEnglishBits_v1";
const THEME_KEY = "myEnglishBits_theme";

const sampleData = [
  {
    original: "I everyday jog.",
    natural: "I go jogging every day.",
    alternative: "I usually go for a run every day.",
    meaning: "나는 매일 조깅해.",
    context: "daily routine",
    tag: "running"
  },
  {
    original: "In my way, I see cat.",
    natural: "I saw a cat on my way.",
    alternative: "I came across a cat while I was out running.",
    meaning: "가는 길에 고양이를 봤어.",
    context: "evening jog",
    tag: "daily life"
  },
  {
    original: "The cat seemed frightening and ran away.",
    natural: "The cat got spooked and ran away.",
    alternative: "I startled the cat, and it ran off.",
    meaning: "고양이가 놀라서 도망갔어.",
    context: "cat encounter",
    tag: "cats"
  },
  {
    original: "I don't wanna stop my face.",
    natural: "I don't want to lose my pace.",
    alternative: "I don't want to break my rhythm.",
    meaning: "페이스를 잃고 싶지 않아.",
    context: "jogging",
    tag: "running"
  },
  {
    original: "I keep running.",
    natural: "I just kept going.",
    alternative: "I kept running without stopping.",
    meaning: "그냥 계속 달렸어.",
    context: "jogging",
    tag: "running"
  }
];

let state = loadState();
let currentPracticeId = null;
let filterMode = "all";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [], practiced: 0 };
    const parsed = JSON.parse(raw);
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      practiced: Number(parsed.practiced || 0)
    };
  } catch {
    return { items: [], practiced: 0 };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  renderAll();
}

function normalizeItem(item) {
  return {
    id: item.id || crypto.randomUUID(),
    original: String(item.original || "").trim(),
    natural: String(item.natural || "").trim(),
    alternative: String(item.alternative || "").trim(),
    meaning: String(item.meaning || "").trim(),
    context: String(item.context || "").trim(),
    tag: String(item.tag || "daily").trim() || "daily",
    favorite: Boolean(item.favorite),
    createdAt: item.createdAt || new Date().toISOString()
  };
}

function addItems(items) {
  const valid = items
    .map(normalizeItem)
    .filter(x => x.natural && x.meaning);

  const existingKeys = new Set(
    state.items.map(x => `${x.natural.toLowerCase()}|${x.meaning.toLowerCase()}`)
  );

  const fresh = valid.filter(x => {
    const key = `${x.natural.toLowerCase()}|${x.meaning.toLowerCase()}`;
    if (existingKeys.has(key)) return false;
    existingKeys.add(key);
    return true;
  });

  state.items = [...fresh, ...state.items];
  saveState();
  return fresh.length;
}

function renderAll() {
  renderRecent();
  renderLibrary();
  renderStats();
  renderPracticeMeta();
}

function createCard(item) {
  const tpl = document.getElementById("expressionCardTemplate");
  const node = tpl.content.firstElementChild.cloneNode(true);

  node.querySelector(".tag").textContent = item.tag || "daily";
  node.querySelector(".natural").textContent = item.natural;
  node.querySelector(".meaning").textContent = item.meaning;
  node.querySelector(".original").textContent = item.original || "—";
  node.querySelector(".alternative").textContent = item.alternative || "—";
  node.querySelector(".context").textContent = item.context || "";

  const fav = node.querySelector(".favorite-btn");
  fav.textContent = item.favorite ? "★" : "☆";
  fav.addEventListener("click", () => {
    item.favorite = !item.favorite;
    saveState();
  });

  node.querySelector(".delete-btn").addEventListener("click", () => {
    if (confirm("이 표현을 삭제할까요?")) {
      state.items = state.items.filter(x => x.id !== item.id);
      if (currentPracticeId === item.id) currentPracticeId = null;
      saveState();
    }
  });

  return node;
}

function renderRecent() {
  const el = document.getElementById("recentList");
  const recent = [...state.items]
    .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  el.innerHTML = "";
  if (!recent.length) {
    el.innerHTML = `<div class="empty">아직 저장된 표현이 없어요.<br>위에 샘플을 넣어 먼저 사용해보세요.</div>`;
  } else {
    recent.forEach(item => el.appendChild(createCard(item)));
  }

  document.getElementById("todayCount").textContent = state.items.length;
}

function renderLibrary() {
  const el = document.getElementById("libraryList");
  const query = document.getElementById("searchInput").value.trim().toLowerCase();

  let items = [...state.items];
  if (filterMode === "favorite") items = items.filter(x => x.favorite);
  if (query) {
    items = items.filter(x =>
      [x.original,x.natural,x.alternative,x.meaning,x.context,x.tag]
        .join(" ").toLowerCase().includes(query)
    );
  }

  el.innerHTML = "";
  if (!items.length) {
    el.innerHTML = `<div class="empty">조건에 맞는 표현이 없어요.</div>`;
  } else {
    items.forEach(item => el.appendChild(createCard(item)));
  }
  document.getElementById("libraryCount").textContent = items.length;
}

function renderStats() {
  document.getElementById("statTotal").textContent = state.items.length;
  document.getElementById("statFavorites").textContent =
    state.items.filter(x => x.favorite).length;
  document.getElementById("statPracticed").textContent = state.practiced;
}

function renderPracticeMeta() {
  document.getElementById("practiceRemaining").textContent = state.items.length;
  if (!state.items.length) resetPracticeEmpty();
}

function pickPracticeItem() {
  if (!state.items.length) {
    resetPracticeEmpty();
    return;
  }
  let pool = state.items;
  if (state.items.length > 1 && currentPracticeId) {
    pool = state.items.filter(x => x.id !== currentPracticeId);
  }
  const item = pool[Math.floor(Math.random() * pool.length)];
  currentPracticeId = item.id;

  document.getElementById("practiceTag").textContent = (item.tag || "daily").toUpperCase();
  document.getElementById("practiceMeaning").textContent = item.meaning;
  document.getElementById("practiceNatural").textContent = item.natural;
  document.getElementById("practiceAlternative").textContent =
    item.alternative ? `Also: ${item.alternative}` : "";
  document.getElementById("practiceOriginal").textContent = item.original || "—";
  document.getElementById("answerBox").classList.add("hidden");
  document.getElementById("ratingRow").classList.add("hidden");
  document.getElementById("showAnswerBtn").classList.remove("hidden");
}

function resetPracticeEmpty() {
  currentPracticeId = null;
  document.getElementById("practiceTag").textContent = "DAILY";
  document.getElementById("practiceMeaning").textContent =
    "표현을 저장하면 연습을 시작할 수 있어요.";
  document.getElementById("answerBox").classList.add("hidden");
  document.getElementById("ratingRow").classList.add("hidden");
  document.getElementById("showAnswerBtn").classList.remove("hidden");
}

document.getElementById("importBtn").addEventListener("click", () => {
  const msg = document.getElementById("importMessage");
  try {
    const data = JSON.parse(document.getElementById("jsonInput").value);
    if (!Array.isArray(data)) throw new Error("배열 형식이 아니에요.");
    const count = addItems(data);
    msg.textContent = `${count}개 표현을 추가했어요.`;
    document.getElementById("jsonInput").value = "";
  } catch (e) {
    msg.textContent = "JSON 형식을 확인해 주세요.";
  }
});

document.getElementById("sampleBtn").addEventListener("click", () => {
  document.getElementById("jsonInput").value = JSON.stringify(sampleData, null, 2);
});

document.getElementById("manualForm").addEventListener("submit", e => {
  e.preventDefault();
  const item = {
    original: document.getElementById("manualOriginal").value,
    natural: document.getElementById("manualNatural").value,
    alternative: document.getElementById("manualAlternative").value,
    meaning: document.getElementById("manualMeaning").value,
    context: document.getElementById("manualContext").value,
    tag: document.getElementById("manualTag").value || "daily"
  };
  addItems([item]);
  e.target.reset();
  e.target.closest("details").open = false;
});

document.getElementById("searchInput").addEventListener("input", renderLibrary);

document.querySelectorAll(".chip").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    filterMode = btn.dataset.filter;
    renderLibrary();
  });
});

document.getElementById("showAnswerBtn").addEventListener("click", () => {
  if (!state.items.length) return;
  document.getElementById("answerBox").classList.remove("hidden");
  document.getElementById("ratingRow").classList.remove("hidden");
  document.getElementById("showAnswerBtn").classList.add("hidden");
});

document.querySelectorAll("[data-rating]").forEach(btn => {
  btn.addEventListener("click", () => {
    state.practiced += 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    renderStats();
    pickPracticeItem();
  });
});

document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach(x => x.classList.remove("active"));
    document.querySelectorAll(".view").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.view).classList.add("active");
    if (btn.dataset.view === "practiceView" && !currentPracticeId) {
      pickPracticeItem();
    }
  });
});

document.getElementById("themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(THEME_KEY, document.body.classList.contains("dark") ? "dark" : "light");
});

if (localStorage.getItem(THEME_KEY) === "dark") {
  document.body.classList.add("dark");
}

renderAll();
