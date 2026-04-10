/* =====================================================
   ASTRO ACADEMY — Application Logic
   ===================================================== */

// ── State ──────────────────────────────────────────
const STATE = {
  currentWeek: 1,       // 1-130
  completedWeeks: [],   // array of completed week numbers
  completedHW: {},      // { "w1_0": true, "w1_1": true, ... }
  currentView: 'home',
  viewingWeek: null,    // week number we're currently reading
  pilotName: '',        // personalised name
  coins: 0,             // gold coins earned
  coinsFromHW: 0,       // breakdown
  coinsFromWeeks: 0,    // breakdown
};

// ── Motivational Quotes ────────────────────────────
const QUOTES = [
  { quote: "Somewhere, something incredible is waiting to be known.", author: "— Carl Sagan" },
  { quote: "The universe is under no obligation to make sense to you.", author: "— Neil deGrasse Tyson" },
  { quote: "We are all made of star-stuff.", author: "— Carl Sagan" },
  { quote: "The important thing is not to stop questioning. Curiosity has its own reason for existing.", author: "— Albert Einstein" },
  { quote: "I have no special talent. I am only passionately curious.", author: "— Albert Einstein" },
  { quote: "Look up at the stars and not down at your feet. Try to make sense of what you see.", author: "— Stephen Hawking" },
  { quote: "Science is not only compatible with spirituality; it is a profound source of spirituality.", author: "— Carl Sagan" },
  { quote: "What is a scientist after all? It is a curious man looking through a keyhole, the keyhole of nature, trying to know what's going on.", author: "— Jacques Cousteau" },
  { quote: "The most beautiful thing we can experience is the mysterious. It is the source of all true art and science.", author: "— Albert Einstein" },
  { quote: "Every star you see in the night sky is bigger and brighter than our Sun.", author: "— Carl Sagan" },
];

// ── DOM References ──────────────────────────────────
const $ = (id) => document.getElementById(id);

// ── Profile File System ────────────────────────────
let profileFileHandle = null;
let _saveDebounce = null;

function getStateObj() {
  return {
    version: 2,
    pilotName: STATE.pilotName,
    currentWeek: STATE.currentWeek,
    completedWeeks: STATE.completedWeeks,
    completedHW: STATE.completedHW,
    coins: STATE.coins,
    coinsFromHW: STATE.coinsFromHW,
    coinsFromWeeks: STATE.coinsFromWeeks,
    savedAt: new Date().toISOString(),
  };
}

function applyStateObj(obj) {
  if (!obj) return;
  if (obj.pilotName)      STATE.pilotName      = obj.pilotName;
  if (obj.currentWeek)    STATE.currentWeek    = obj.currentWeek;
  if (obj.completedWeeks) STATE.completedWeeks = obj.completedWeeks;
  if (obj.completedHW)    STATE.completedHW    = obj.completedHW;
  if (obj.coins != null)          STATE.coins          = obj.coins;
  if (obj.coinsFromHW != null)    STATE.coinsFromHW    = obj.coinsFromHW;
  if (obj.coinsFromWeeks != null) STATE.coinsFromWeeks = obj.coinsFromWeeks;
}

function saveState() {
  // Always cache in localStorage as backup
  try { localStorage.setItem('astro_state', JSON.stringify(getStateObj())); } catch(e) {}
  // Debounced auto-save to file
  if (profileFileHandle) {
    clearTimeout(_saveDebounce);
    _saveDebounce = setTimeout(() => saveToFile(), 1500);
  }
}

function loadStateFromLocalStorage() {
  try {
    const saved = JSON.parse(localStorage.getItem('astro_state') || '{}');
    applyStateObj(saved);
  } catch(e) {}
}

async function saveToFile(pickNew = false) {
  if (!window.showSaveFilePicker) {
    showSaveIndicator('⚠️ Use Chrome for file saving');
    return;
  }
  try {
    if (!profileFileHandle || pickNew) {
      const slug = (STATE.pilotName || 'astronaut').toLowerCase().replace(/\s+/g, '_');
      profileFileHandle = await window.showSaveFilePicker({
        suggestedName: `${slug}_astro_progress.json`,
        types: [{ description: 'Astro Academy Profile', accept: { 'application/json': ['.json'] } }],
      });
    }
    const writable = await profileFileHandle.createWritable();
    await writable.write(JSON.stringify(getStateObj(), null, 2));
    await writable.close();
    showSaveIndicator('✅ Saved');
    try { localStorage.setItem('astro_state', JSON.stringify(getStateObj())); } catch(e) {}
  } catch(e) {
    if (e.name !== 'AbortError') showSaveIndicator('❌ Save failed');
  }
}

// ── Profile Screen ──────────────────────────────────
function showProfileScreen() {
  const ps = $('profile-screen');
  if (!ps) return;
  ps.style.display = 'flex';
  // Offer localStorage continue option if data exists
  try {
    const saved = JSON.parse(localStorage.getItem('astro_state') || '{}');
    if (saved.pilotName) {
      $('ps-local-name').textContent = saved.pilotName;
      $('ps-localstorage-option').style.display = 'block';
    }
  } catch(e) {}
}

function hideProfileScreen() {
  const ps = $('profile-screen');
  if (ps) ps.style.display = 'none';
}

function profileShowNew() {
  $('ps-main-btns').style.display = 'none';
  $('ps-new-form').style.display  = 'block';
  setTimeout(() => { const i = $('ps-name-input'); if(i) i.focus(); }, 50);
}

function profileBackToMain() {
  $('ps-new-form').style.display  = 'none';
  $('ps-main-btns').style.display = 'block';
}

function profileCreateNew() {
  const name = ($('ps-name-input').value || '').trim();
  if (!name) { showToast('⚠️ Enter your pilot name!'); return; }
  STATE.pilotName      = name;
  STATE.currentWeek    = 1;
  STATE.completedWeeks = [];
  STATE.completedHW    = {};
  STATE.coins          = 0;
  STATE.coinsFromHW    = 0;
  STATE.coinsFromWeeks = 0;
  profileFileHandle    = null;
  hideProfileScreen();
  updateAll();
  showView('home');
  saveToFile(true);
  showToast(`🚀 Welcome to Astro Academy, Commander ${name}!`);
}

async function profileLoadFile() {
  if (!window.showOpenFilePicker) {
    showToast('File picker not supported — use Chrome.');
    return;
  }
  try {
    const [handle] = await window.showOpenFilePicker({
      types: [{ description: 'Astro Academy Profile', accept: { 'application/json': ['.json'] } }],
    });
    profileFileHandle = handle;
    const file = await handle.getFile();
    const obj  = JSON.parse(await file.text());
    applyStateObj(obj);
    hideProfileScreen();
    updateAll();
    showView('home');
    showSaveIndicator('✅ Profile loaded');
    showToast(`🚀 Welcome back, Commander ${STATE.pilotName}!`);
  } catch(e) {
    if (e.name !== 'AbortError') showToast('Could not load that file. Is it a valid profile?');
  }
}

function profileContinueLocal() {
  loadStateFromLocalStorage();
  hideProfileScreen();
  updateAll();
  showView('home');
  showSaveIndicator('⚡ Using local save');
}

function showSaveIndicator(msg) {
  const el = $('save-indicator');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('visible');
  clearTimeout(el._hideTimer);
  el._hideTimer = setTimeout(() => el.classList.remove('visible'), 3500);
}

// ── Navigation ──────────────────────────────────────
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.topnav-btn').forEach(b => b.classList.remove('active'));

  const view = $('view-' + name);
  if (view) view.classList.add('active');

  const btn = $('nav-' + name);
  if (btn) btn.classList.add('active');

  STATE.currentView = name;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Starfield ───────────────────────────────────────
function buildStarfield() {
  const sf = $('starfield');
  if (!sf) return;

  const W = window.innerWidth;
  const H = window.innerHeight;

  // Stars
  for (let i = 0; i < 220; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = Math.random() * 2.5 + 0.5;
    s.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random()*100}%;
      top:${Math.random()*100}%;
      animation-duration:${2 + Math.random()*4}s;
      animation-delay:${Math.random()*5}s;
      opacity:${0.2 + Math.random()*0.8};
    `;
    sf.appendChild(s);
  }

  // Shooting stars
  for (let i = 0; i < 5; i++) {
    const ss = document.createElement('div');
    ss.className = 'shooting-star';
    const w = 80 + Math.random() * 160;
    ss.style.cssText = `
      width:${w}px;
      left:${40 + Math.random()*60}%;
      top:${Math.random()*50}%;
      animation-duration:${4 + Math.random()*6}s;
      animation-delay:${Math.random()*8}s;
    `;
    sf.appendChild(ss);
  }
}

// ── Progress Ring ────────────────────────────────────
function updateProgressRing() {
  const total = 130;
  const done  = STATE.completedWeeks.length;
  const pct   = Math.round((done / total) * 100);

  const fill  = $('progress-ring-fill');
  const pctEl = $('progress-pct');
  if (fill) {
    const circumference = 502;
    const offset = circumference - (done / total) * circumference;
    fill.style.strokeDashoffset = offset;
  }
  if (pctEl) pctEl.textContent = pct + '%';
}

// ── Stats ────────────────────────────────────────────
function updateStats() {
  const done = STATE.completedWeeks.length;
  const weeksLeft = 130 - done;

  const el = $('stat-weeks-done');
  if (el) el.textContent = done;

  const el2 = $('stat-weeks-left');
  if (el2) el2.textContent = weeksLeft;

  const el3 = $('stat-current-week');
  if (el3) el3.textContent = STATE.currentWeek;
}

// ── Week Badge in Topbar ─────────────────────────────
function updateWeekBadge() {
  const el = $('week-badge-text');
  if (el) el.textContent = `Week ${STATE.currentWeek} of 130`;
}

// ── Achievements ─────────────────────────────────────
function updateAchievements() {
  const list = $('achievements-list');
  if (!list) return;
  list.innerHTML = '';

  CURRICULUM.achievements.forEach(a => {
    const earned = STATE.completedWeeks.includes(a.week) ||
                   STATE.completedWeeks.length >= a.week;
    const el = document.createElement('div');
    el.className = 'achievement-badge' + (earned ? ' earned' : '');
    el.title = a.desc;
    el.textContent = a.title;
    list.appendChild(el);
  });
}

// ── Current Week Card on Home ─────────────────────────
function renderCurrentWeekCard() {
  const card = $('current-week-card');
  if (!card) return;

  const weekData = getWeekData(STATE.currentWeek);
  if (!weekData) return;

  card.innerHTML = `
    <div class="cwc-label">📍 Your Current Mission — Week ${STATE.currentWeek}</div>
    <h2>${weekData.topic}</h2>
    <div class="cwc-lesson">${weekData.lesson}</div>
    <div style="display:flex;gap:12px;flex-wrap:wrap;">
      <button class="btn-primary" onclick="openWeek(${STATE.currentWeek})">
        🚀 Start This Week's Work
      </button>
      <button class="btn-secondary" onclick="showView('plan')">
        📋 View Full Plan
      </button>
    </div>
  `;
}

// ── Motivational Quote ────────────────────────────────
function renderQuote() {
  const banner = $('motivational-banner');
  if (!banner) return;
  const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  banner.innerHTML = `
    <div class="quote">"${q.quote}"</div>
    <div class="quote-author">${q.author}</div>
  `;
}

// ── Get Week Data from CURRICULUM ─────────────────────
function getWeekData(weekNum) {
  const allUnits = [
    ...CURRICULUM.year1.units,
    ...CURRICULUM.year2.units,
    ...CURRICULUM.year3.units,
  ];
  for (const unit of allUnits) {
    for (const w of unit.weeks_detail) {
      if (w.week === weekNum) {
        return { ...w, unitEmoji: unit.emoji, unitColor: unit.color, unitTitle: unit.title };
      }
    }
  }
  return null;
}

// ── Build Plan View ───────────────────────────────────
function buildPlanView() {
  const container = $('plan-units-container');
  if (!container) return;
  container.innerHTML = '';

  // Year 1
  const y1 = buildYearSection(CURRICULUM.year1);
  container.appendChild(y1);

  // Year 2
  const y2 = buildYearSection(CURRICULUM.year2);
  container.appendChild(y2);

  // Year 3
  const y3 = buildYearSection(CURRICULUM.year3);
  container.appendChild(y3);
}

function buildYearSection(yearData) {
  const sec = document.createElement('div');
  sec.className = 'year-section';
  sec.innerHTML = `
    <div class="year-label">
      <span class="year-emoji">${yearData.emoji}</span>
      <div>
        <h2>${yearData.title}</h2>
        <div class="year-sub">${yearData.subtitle}</div>
      </div>
    </div>
  `;
  yearData.units.forEach(unit => {
    sec.appendChild(buildUnitCard(unit));
  });
  return sec;
}

function buildUnitCard(unit) {
  const card = document.createElement('div');
  card.className = 'unit-card';
  card.id = 'unit-' + unit.id;

  const topicsHtml = unit.topics.map(t => `<div class="topic-pill">${t}</div>`).join('');

  const weeksHtml = unit.weeks_detail.map(w => {
    const done = STATE.completedWeeks.includes(w.week);
    return `
      <button class="week-pill-btn ${done ? 'completed' : ''}" onclick="openWeek(${w.week})">
        <span class="wpb-num">W${w.week}</span>
        <span class="wpb-topic">${w.topic}</span>
        <span class="wpb-check"></span>
      </button>
    `;
  }).join('');

  card.innerHTML = `
    <div class="unit-card-header" onclick="toggleUnit('${unit.id}')">
      <div class="unit-color-bar" style="background:${unit.color}"></div>
      <span class="unit-emoji">${unit.emoji}</span>
      <div class="unit-info">
        <div class="unit-title">${unit.title}</div>
        <div class="unit-weeks">${unit.weeks} &nbsp;•&nbsp; ${unit.weeks_detail.length} weeks</div>
      </div>
      <span class="unit-chevron">▾</span>
    </div>
    <div class="unit-body">
      <div class="unit-meta">
        <div class="unit-meta-box">
          <div class="mb-label">🌟 Big Idea</div>
          <div class="mb-text">${unit.bigIdea}</div>
        </div>
        <div class="unit-meta-box">
          <div class="mb-label">🌍 Real World</div>
          <div class="mb-text">${unit.realWorldConnection}</div>
        </div>
        <div class="unit-meta-box">
          <div class="mb-label">💡 Fun Fact</div>
          <div class="mb-text">${unit.funFact}</div>
        </div>
      </div>
      <div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--accent1);font-weight:700;margin-bottom:10px;">Topics Covered</div>
      <div class="unit-topics-grid">${topicsHtml}</div>
      <div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--accent2);font-weight:700;margin:20px 0 10px;">Weekly Lessons</div>
      <div class="weeks-grid">${weeksHtml}</div>
    </div>
  `;

  return card;
}

function toggleUnit(id) {
  const card = document.getElementById('unit-' + id);
  if (!card) return;
  card.classList.toggle('open');
}

// ── Open Week View ────────────────────────────────────
function openWeek(weekNum) {
  STATE.viewingWeek = weekNum;
  const data = getWeekData(weekNum);
  if (!data) return;

  // Hero banner
  const banner = $('week-hero-banner');
  banner.setAttribute('data-emoji', data.unitEmoji);
  banner.style.borderColor = data.unitColor + '55';
  banner.innerHTML = `
    <div class="whb-week-num">${data.unitTitle} &nbsp;·&nbsp; Week ${weekNum} of 130</div>
    <h2>${data.topic}</h2>
    <div class="whb-lesson">${data.lesson}</div>
  `;

  // Homework section
  const hwSection = $('hw-section');
  const hwList = document.createElement('ul');
  hwList.className = 'hw-list';

  data.homework.forEach((item, idx) => {
    const key = `w${weekNum}_${idx}`;
    const done = !!STATE.completedHW[key];
    const isBonus = item.toUpperCase().startsWith('BONUS');
    const li = document.createElement('li');
    li.className = 'hw-item' + (done ? ' done' : '');
    li.dataset.key = key;
    li.innerHTML = `
      <div class="hw-checkbox"></div>
      <span class="hw-text ${isBonus ? 'bonus' : ''}">${item}</span>
    `;
    li.addEventListener('click', () => toggleHW(key, li));
    hwList.appendChild(li);
  });

  hwSection.innerHTML = '';
  hwSection.appendChild(hwList);

  // Fun activity
  $('fun-activity-content').innerHTML = `<div class="fun-activity-card">${data.funActivity}</div>`;

  // Video tip
  $('video-tip-content').innerHTML = `<div class="video-tip-card">🎬 ${data.videoTip}</div>`;

  // Mark complete button
  const btn = $('mark-complete-btn');
  const isComplete = STATE.completedWeeks.includes(weekNum);
  btn.textContent = isComplete ? '✅ Already Completed!' : '🎯 Mark Week as Complete!';
  btn.className = 'btn-primary' + (isComplete ? ' done' : '');
  btn.onclick = () => markWeekComplete(weekNum);

  // Prev / Next
  const prevBtn = $('prev-week-btn');
  const nextBtn = $('next-week-btn');
  prevBtn.disabled = weekNum <= 1;
  nextBtn.disabled = weekNum >= 130;
  prevBtn.onclick = () => openWeek(weekNum - 1);
  nextBtn.onclick = () => openWeek(weekNum + 1);

  // Update title
  $('week-title-header').textContent = `Week ${weekNum}: ${data.topic}`;

  showView('week');
}

function toggleHW(key, li) {
  if (STATE.completedHW[key]) {
    delete STATE.completedHW[key];
    li.classList.remove('done');
    // refund coin only if we have some
    STATE.coins = Math.max(0, STATE.coins - 5);
    STATE.coinsFromHW = Math.max(0, STATE.coinsFromHW - 5);
  } else {
    STATE.completedHW[key] = true;
    li.classList.add('done');
    STATE.coins += 5;
    STATE.coinsFromHW += 5;
    spawnCoinBurst();
  }
  saveState();
  updateCoins();
}

// ── Mark Week Complete ─────────────────────────────────
function markWeekComplete(weekNum) {
  if (!STATE.completedWeeks.includes(weekNum)) {
    STATE.completedWeeks.push(weekNum);
    // Advance current week
    if (weekNum >= STATE.currentWeek && weekNum < 130) {
      STATE.currentWeek = weekNum + 1;
    }
    // Award coins
    STATE.coins += 10;
    STATE.coinsFromWeeks += 10;
    saveState();
    launchConfetti();
    spawnCoinBurst();
    const name = STATE.pilotName ? STATE.pilotName : 'future astrophysicist';
    showToast(`🎉 Week ${weekNum} complete, ${name}! +10 🪙 coins!`);
    updateAll();

    // Check achievements
    checkAchievements(weekNum);

    // Refresh mark button
    const btn = $('mark-complete-btn');
    btn.textContent = '✅ Already Completed!';
    btn.className = 'btn-primary done';
  }
}

function checkAchievements(weekNum) {
  const achieved = CURRICULUM.achievements.find(a => a.week === weekNum);
  if (achieved) {
    setTimeout(() => {
      showToast('🏆 Achievement Unlocked: ' + achieved.title);
    }, 2000);
  }
}

// ── Update All Home View Elements ─────────────────────
function updateAll() {
  updateProgressRing();
  updateStats();
  updateWeekBadge();
  updateAchievements();
  updateCoins();
  updateHero();
  updateRocket();
  renderCurrentWeekCard();
  buildPlanView();  // refresh completed state in plan
}

// ── Hero Personalisation ─────────────────────────────────
function updateHero() {
  const greeting = $('hero-greeting');
  const sub = $('hero-subtitle');
  if (!greeting) return;
  if (STATE.pilotName) {
    greeting.textContent = `👨‍🚀 Welcome back, ${STATE.pilotName}!`;
    if (sub) sub.textContent = `Mission in progress, Commander ${STATE.pilotName}. The universe is waiting — keep pushing!`;
  } else {
    greeting.textContent = 'Your Journey to the Stars Starts Here';
    if (sub) sub.textContent = 'A 3-year adventure from Grade 4 math all the way to the edge of the universe. One week at a time. You\'ve got this, future astrophysicist! 🌌';
  }
}

// ── Name Modal ────────────────────────────────────────────
function openNameModal() {
  const overlay = $('name-modal-overlay');
  if (!overlay) return;
  const input = $('name-input');
  if (input && STATE.pilotName) input.value = STATE.pilotName;
  overlay.classList.add('visible');
  if (input) setTimeout(() => input.focus(), 100);
}

function savePilotName() {
  const input = $('name-input');
  const name = input ? input.value.trim() : '';
  if (!name) { showToast('⚠️ Please enter your pilot name!'); return; }
  STATE.pilotName = name;
  saveState();
  const overlay = $('name-modal-overlay');
  if (overlay) overlay.classList.remove('visible');
  updateHero();
  showToast(`🚀 Welcome aboard, Commander ${name}!`);
}

function initNameModal() {
  // Close on overlay click
  const overlay = $('name-modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay && STATE.pilotName) overlay.classList.remove('visible');
    });
  }
  // Enter key submits
  const input = $('name-input');
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') savePilotName();
    });
  }
}

// ── Gold Coins Display ───────────────────────────────────────
function updateCoins() {
  const cc = $('coin-count');
  if (cc) cc.textContent = STATE.coins.toLocaleString();

  const total = $('total-coins-display');
  if (total) total.textContent = `${STATE.coins.toLocaleString()} Gold Coins`;

  const hw = $('coins-hw');
  if (hw) hw.textContent = `+${STATE.coinsFromHW} from homework tasks`;

  const wk = $('coins-weeks');
  if (wk) wk.textContent = `+${STATE.coinsFromWeeks} from completed weeks`;
}

function spawnCoinBurst() {
  for (let i = 0; i < 8; i++) {
    const coin = document.createElement('div');
    coin.className = 'coin-burst';
    coin.textContent = '🪙';
    coin.style.cssText = `
      left:${30 + Math.random()*40}vw;
      animation-delay:${Math.random()*0.4}s;
      font-size:${1.2+Math.random()*1}rem;
    `;
    document.body.appendChild(coin);
    setTimeout(() => coin.remove(), 1800);
  }
}

// ── Rocket Builder ────────────────────────────────────────────
const ROCKET_STAGES = [
  { id: 'rp-nose',     label: 'Nose Cone',       emoji: '🧡', partEmoji: '▲',  fromWeek: 1,   toWeek: 13,  cost: 100 },
  { id: 'rp-body-top', label: 'Cockpit',          emoji: '🔭', partEmoji: '🔭', fromWeek: 14,  toWeek: 26,  cost: 100 },
  { id: 'rp-body-mid', label: 'Main Body',        emoji: '📦', partEmoji: '📦', fromWeek: 27,  toWeek: 39,  cost: 100 },
  { id: 'rp-body-bot', label: 'Lower Body',       emoji: '⚪', partEmoji: '⚪', fromWeek: 40,  toWeek: 52,  cost: 100 },
  { id: 'rp-fin-l',   label: 'Left Fin',         emoji: '◄',  partEmoji: '◄',  fromWeek: 53,  toWeek: 65,  cost: 150 },
  { id: 'rp-fin-r',   label: 'Right Fin',        emoji: '►',  partEmoji: '►',  fromWeek: 66,  toWeek: 78,  cost: 150 },
  { id: 'rp-details', label: 'Fuel Systems',     emoji: '⚡', partEmoji: '⚡', fromWeek: 79,  toWeek: 91,  cost: 120 },
  { id: 'rp-nozzle',  label: 'Engine Nozzle',    emoji: '🔥', partEmoji: '🔥', fromWeek: 92,  toWeek: 104, cost: 120 },
  { id: 'rp-pad',     label: 'Launch Pad',       emoji: '🏛️', partEmoji: '🏛️', fromWeek: 105, toWeek: 117, cost: 100 },
  { id: 'rp-flames',  label: 'LAUNCH READY! 🚀', emoji: '🔥', partEmoji: '🔥', fromWeek: 118, toWeek: 130, cost: 100 },
];

function getRocketStage() {
  const done = STATE.completedWeeks.length;
  // Each stage unlocks when the week threshold is passed
  let stage = 0;
  for (let i = 0; i < ROCKET_STAGES.length; i++) {
    if (STATE.completedWeeks.some(w => w >= ROCKET_STAGES[i].fromWeek)) {
      stage = i + 1;
    }
  }
  return stage; // 0 = nothing built, 10 = fully complete
}

function updateRocket() {
  const stage = getRocketStage();
  const done  = STATE.completedWeeks.length;

  // Show/hide ghost
  const ghost = $('rocket-ghost');
  if (ghost) ghost.style.opacity = stage >= 10 ? '0' : '0.07';

  // Reveal parts with a glowing transition
  ROCKET_STAGES.forEach((s, idx) => {
    const el = $(s.id);
    if (!el) return;
    const unlocked = stage > idx;
    el.style.opacity    = unlocked ? '1' : '0';
    el.style.transition = 'opacity 0.8s ease';
    if (unlocked) {
      el.style.filter = 'drop-shadow(0 0 6px rgba(108,99,255,0.6))';
    }
  });

  // Stage label
  const stageName = $('rocket-stage-name');
  if (stageName) {
    if (stage === 0) {
      stageName.textContent = 'Complete your first week to start building!';
    } else if (stage >= 10) {
      stageName.textContent = '🚀 LAUNCH READY! Your rocket is complete!';
      stageName.style.color = '#ffd700';
      // animate flames
      const flames = $('rp-flames');
      if (flames) flames.style.animation = 'flameFlicker 0.4s ease-in-out infinite alternate';
    } else {
      const next = ROCKET_STAGES[stage];
      stageName.textContent = `Part ${stage}/${ROCKET_STAGES.length} built — Next: ${next.label} (Week ${next.fromWeek})`;
      stageName.style.color = '';
    }
  }

  // Parts checklist
  const partsList = $('rocket-parts-list');
  if (partsList) {
    partsList.innerHTML = ROCKET_STAGES.map((s, idx) => {
      const unlocked = stage > idx;
      return `
        <div class="rocket-part-item ${unlocked ? 'unlocked' : ''}">
          <span class="rpi-icon">${unlocked ? '✅' : '🔒'}</span>
          <span class="rpi-label">${s.label}</span>
          <span class="rpi-weeks">Wk ${s.fromWeek}–${s.toWeek}</span>
          <span class="rpi-cost">🪙${s.cost}</span>
        </div>
      `;
    }).join('');
  }
}

// ── Resources View ─────────────────────────────────────
function buildResourcesView() {
  const res = CURRICULUM.resources;

  // Websites
  const webGrid = $('resources-websites');
  if (webGrid) {
    webGrid.innerHTML = res.websites.map(w => `
      <div class="resource-card">
        <a href="${w.url}" target="_blank" rel="noopener">🌐 ${w.name}</a>
        <div class="rc-desc">${w.desc}</div>
      </div>
    `).join('');
  }

  // Books
  const booksGrid = $('resources-books');
  if (booksGrid) {
    booksGrid.innerHTML = res.books.map(b => `
      <div class="resource-card">
        <div class="rc-name">📚 ${b.title}</div>
        <div class="rc-by">by ${b.author}</div>
        <div class="rc-desc">${b.reason}</div>
      </div>
    `).join('');
  }

  // YouTube
  const ytGrid = $('resources-youtube');
  if (ytGrid) {
    ytGrid.innerHTML = res.youtubeChannels.map(y => `
      <div class="resource-card">
        <div class="rc-name">📺 ${y.name}</div>
        <div class="rc-by">${y.handle}</div>
        <div class="rc-desc">${y.desc}</div>
      </div>
    `).join('');
  }
}

// ── Confetti ────────────────────────────────────────────
function launchConfetti() {
  const colors = ['#6c63ff','#00d4ff','#f7971e','#f953c6','#11998e','#ffd700','#ff6b6b'];
  for (let i = 0; i < 80; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.cssText = `
      left:${Math.random()*100}vw;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      width:${6+Math.random()*10}px;
      height:${6+Math.random()*10}px;
      animation-delay:${Math.random()*0.8}s;
      animation-duration:${2.5+Math.random()*1.5}s;
      border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
    `;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 4000);
  }
}

// ── Toast ────────────────────────────────────────────────
function showToast(msg) {
  const t = $('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 4000);
}

// ── Scroll-to-top ────────────────────────────────────────
function initScrollTop() {
  const btn = $('scroll-top-btn');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ── Keyboard Navigation ──────────────────────────────────
function initKeyboard() {
  document.addEventListener('keydown', (e) => {
    if (STATE.currentView !== 'week') return;
    if (e.key === 'ArrowRight') {
      const next = $('next-week-btn');
      if (next && !next.disabled) next.click();
    }
    if (e.key === 'ArrowLeft') {
      const prev = $('prev-week-btn');
      if (prev && !prev.disabled) prev.click();
    }
    if (e.key === 'Escape') {
      showView('plan');
    }
  });
}

// ── Back button in week view ────────────────────────────
function initBackBtn() {
  const btn = $('back-btn');
  if (btn) btn.addEventListener('click', () => showView('plan'));
}

// ── Init ─────────────────────────────────────────────────
function init() {
  buildStarfield();
  buildPlanView();
  buildResourcesView();
  renderQuote();
  initScrollTop();
  initKeyboard();
  initBackBtn();
  initNameModal();     // wires up the 'Change Pilot Name' button modal
  showProfileScreen(); // show profile picker first; it calls updateAll+showView when done
}

document.addEventListener('DOMContentLoaded', init);
