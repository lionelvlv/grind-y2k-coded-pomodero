/* grind.app — app.js
   all the logic. no framework. no drama.
   organized top-to-bottom: state → config → audio → timer → tasks → ui */


/* ─────────────────────────────────────────────────────────
   RING CIRCUMFERENCE  (r=125, c = 2πr)
   ───────────────────────────────────────────────────────── */
const RING_CIRC = 2 * Math.PI * 125; // ~785.4


/* ─────────────────────────────────────────────────────────
   DEFAULT CONFIG  (overwritten by localStorage)
   ───────────────────────────────────────────────────────── */
const DEFAULT_CONFIG = {
  pomodoro:  25,
  short:      5,
  long:      15,
  interval:   4,  // pomodoros before a long break
  autostart: false,
  sound:     true,
};


/* ─────────────────────────────────────────────────────────
   MODE METADATA  — colors, labels, quotes per session type
   ───────────────────────────────────────────────────────── */
const MODES = {
  pomodoro: {
    label:  'FOCUS TIME',
    status: 'locked in bestie',
    quotes: {
      idle:  ['ready when you are bestie 👀', 'the tasks won\'t do themselves fr', 'we\'re about to cook 🍳'],
      start: ['main character mode: activated ✦', 'locked. in. 🧠', 'this is your sign. let\'s go.', 'no thoughts, only tasks fr'],
      mid:   ['halfway there bestie 💪', 'we\'re literally cooking rn', 'this is the delulu grind era', 'don\'t stop now king/queen'],
      end:   ['W behavior tbh 🏆', 'slay! take your break bestie', 'you actually did that 💅', 'that was so real of you'],
    },
    // what the bg tints to during a pomodoro — subtle warm purple/red per theme
    bgTints: {
      phonebooth: 'rgba(120, 40, 200, 0.08)',
      transit:    'rgba(30, 100, 200,  0.06)',
      streetwear: 'rgba(200, 30, 30,   0.10)',
      y2k:        'rgba(220, 60, 140,  0.07)',
    },
  },
  short: {
    label:  'SHORT BREAK',
    status: 'sip that water 💧',
    quotes: {
      idle:  ['take a breath bestie 🌿', 'hydrate. you\'ve earned it.', 'touch grass (briefly)'],
      start: ['short break go brrr 💨', 'stretch. seriously.', 'close your eyes for a sec ✨'],
      mid:   ['still vibing 🌙', 'almost time to get back in it', 'recharge acquired'],
      end:   ['break done. let\'s get it.', 'back to the grind bestie 🍅', 'rested? locked in? let\'s cook.'],
    },
    bgTints: {
      phonebooth: 'rgba(40, 200, 140, 0.09)',
      transit:    'rgba(60, 200, 160, 0.08)',
      streetwear: 'rgba(40, 200, 80,  0.09)',
      y2k:        'rgba(6,  180, 212, 0.08)',
    },
  },
  long: {
    label:  'LONG BREAK',
    status: 'go touch some grass 🌿',
    quotes: {
      idle:  ['big break energy 🛋', 'you\'ve earned this one fr', 'rest is productive. it\'s science.'],
      start: ['okay step AWAY from the screen 😭', 'long break arc begins now', 'we are so resting rn 💤'],
      mid:   ['still resting. as it should be.', 'this break is giving 💆', 'recharge % going up'],
      end:   ['back to world domination bestie 👑', 'rested era complete. let\'s cook.', 'okay we\'re ready fr fr'],
    },
    bgTints: {
      phonebooth: 'rgba(40, 180, 240, 0.10)',
      transit:    'rgba(80, 160, 255, 0.07)',
      streetwear: 'rgba(60, 120, 255, 0.09)',
      y2k:        'rgba(6,  182, 212, 0.09)',
    },
  },
};


/* ─────────────────────────────────────────────────────────
   RING ACCENT COLORS per theme + mode
   ───────────────────────────────────────────────────────── */
const RING_COLORS = {
  phonebooth: { pomodoro: '#c084fc', short: '#34d399', long: '#38bdf8' },
  transit:    { pomodoro: '#38bdf8', short: '#4ade80', long: '#818cf8' },
  streetwear: { pomodoro: '#ef4444', short: '#4ade80', long: '#60a5fa' },
  y2k:        { pomodoro: '#ec4899', short: '#06b6d4', long: '#a78bfa' },
};


/* ─────────────────────────────────────────────────────────
   APP STATE
   ───────────────────────────────────────────────────────── */
let config       = { ...DEFAULT_CONFIG };
let tasks        = [];           // [{ id, text, done }]
let focusedTaskId = null;        // id of the task user clicked to focus

let mode         = 'pomodoro';   // 'pomodoro' | 'short' | 'long'
let theme        = 'phonebooth';
let chillMode    = false;
let tickerVisible = true;

let isRunning    = false;
let totalSeconds = 0;
let leftSeconds  = 0;
let timerStart   = null;         // Date.now() when timer last started
let tickerHandle = null;

let pomCount     = 0;            // how many pomodoros completed this cycle
let editingTask  = null;         // id of task being inline-edited


/* ─────────────────────────────────────────────────────────
   DOM REFS  — grab everything once, use everywhere
   ───────────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);

const dom = {
  modeBg:        $('mode-bg'),
  starBg:        $('star-bg'),
  tickerWrap:    $('ticker-wrap'),
  tickerToggle:  $('ticker-toggle'),
  tickerTrack:   $('ticker-track'),

  modeTabs:      $('mode-tabs'),
  themeSwitcher: $('theme-switcher'),
  chillBtn:      $('chill-btn'),
  settingsBtn:   $('settings-btn'),

  ringProg:      $('ring-prog'),
  ringGlow:      $('ring-glow'),
  timeDigits:    $('time-digits'),
  timeMode:      $('time-mode'),
  timeStatus:    $('time-status'),

  focusedChip:      $('focused-chip'),
  focusedChipText:  $('focused-chip-text'),
  focusedChipClear: $('focused-chip-clear'),

  quoteText:   $('quote-text'),
  quoteBox:    $('quote-box'),

  playBtn:     $('play-btn'),
  resetBtn:    $('reset-btn'),
  skipBtn:     $('skip-btn'),
  sessionDots: $('session-dots'),

  taskInput:   $('task-input'),
  taskAddBtn:  $('task-add-btn'),
  taskList:    $('task-list'),
  taskBadge:   $('task-badge'),

  settingsOverlay: $('settings-overlay'),
  modalClose:      $('modal-close'),
  modalSave:       $('modal-save'),
  togAutostart:    $('tog-autostart'),
  togSound:        $('tog-sound'),
  toast:           $('toast'),
};


/* ─────────────────────────────────────────────────────────
   AUDIO  — all sounds baked in via Web Audio API
   ───────────────────────────────────────────────────────── */
const audioCtx = () => new (window.AudioContext || window.webkitAudioContext)();

function playTone(type, freq, duration, gain = 0.18) {
  if (!config.sound) return;
  try {
    const ctx = audioCtx();
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.connect(env); env.connect(ctx.destination);
    osc.type = type; osc.frequency.value = freq;
    env.gain.setValueAtTime(gain, ctx.currentTime);
    env.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(); osc.stop(ctx.currentTime + duration);
  } catch (e) { /* audio blocked, no worries */ }
}

function playTwoTone(freq1, freq2, type = 'sine') {
  if (!config.sound) return;
  try {
    const ctx = audioCtx();
    const mkOsc = (freq, startAt) => {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.connect(env); env.connect(ctx.destination);
      osc.type = type; osc.frequency.value = freq;
      env.gain.setValueAtTime(0.001, startAt);
      env.gain.linearRampToValueAtTime(0.16, startAt + 0.02);
      env.gain.exponentialRampToValueAtTime(0.001, startAt + 0.14);
      osc.start(startAt); osc.stop(startAt + 0.15);
    };
    mkOsc(freq1, ctx.currentTime);
    mkOsc(freq2, ctx.currentTime + 0.11);
  } catch (e) {}
}

function playSweep(freqStart, freqEnd) {
  if (!config.sound) return;
  try {
    const ctx = audioCtx();
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.connect(env); env.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freqStart, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(freqEnd, ctx.currentTime + 0.22);
    env.gain.setValueAtTime(0.14, ctx.currentTime);
    env.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.start(); osc.stop(ctx.currentTime + 0.26);
  } catch (e) {}
}

function playFanfare() {
  if (!config.sound) return;
  const notes = [523, 587, 659, 698, 784, 880, 1047];
  notes.forEach((freq, i) => playTone('square', freq, 0.18, 0.12 - i * 0.01));
}

const sfx = {
  click:    () => playTone('square', 880, 0.07, 0.09),
  play:     () => playTwoTone(330, 523),
  pause:    () => playTwoTone(523, 330),
  skip:     () => playSweep(400, 800),
  complete: () => playFanfare(),
  breakEnd: () => { [660, 587, 523, 440].forEach((f, i) => playTone('sine', f, 0.18, 0.15)); },
  taskDone: () => playTwoTone(523, 784),
};


/* ─────────────────────────────────────────────────────────
   STORAGE  — thin wrappers, never throws
   ───────────────────────────────────────────────────────── */
function saveToStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
}
function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch (e) { return fallback; }
}


/* ─────────────────────────────────────────────────────────
   TIMER CORE
   ───────────────────────────────────────────────────────── */

function startTimer() {
  if (isRunning) return;
  isRunning  = true;
  timerStart = Date.now() - ((totalSeconds - leftSeconds) * 1000);
  tickerHandle = setInterval(tickTimer, 200);
  updatePlayButton();
  updateTimerStatus();
  if (leftSeconds === totalSeconds) {
    setQuote(getQuoteFor('start'));
  }
}

function pauseTimer() {
  if (!isRunning) return;
  isRunning = false;
  clearInterval(tickerHandle);
  updatePlayButton();
  updateTimerStatus();
}

function resetTimer() {
  pauseTimer();
  leftSeconds = totalSeconds;
  updateTimerDisplay();
  updateRingProgress();
  dom.timeStatus.textContent = '';
  setQuote(getQuoteFor('idle'));
}

function skipToNextSession() {
  pauseTimer();
  advanceMode();
}

// called every 200ms — uses Date.now() delta to stay accurate
function tickTimer() {
  const elapsed = Math.floor((Date.now() - timerStart) / 1000);
  leftSeconds   = Math.max(0, totalSeconds - elapsed);

  updateTimerDisplay();
  updateRingProgress();

  // mid-session quote trigger
  if (leftSeconds === Math.floor(totalSeconds / 2)) {
    setQuote(getQuoteFor('mid'));
  }

  if (leftSeconds <= 0) {
    onSessionComplete();
  }
}

function onSessionComplete() {
  clearInterval(tickerHandle);
  isRunning = false;

  setQuote(getQuoteFor('end'));
  if (mode === 'pomodoro') { pomCount++; sfx.complete(); spawnBurstParticles(); }
  else                      { sfx.breakEnd(); }

  showToast(mode === 'pomodoro' ? '🍅 pomodoro done! take a break bestie' : '⏰ break over! back to the grind');

  advanceMode();

  if (config.autostart) startTimer();
}

// moves to the next logical mode after a session ends
function advanceMode() {
  if (mode === 'pomodoro') {
    const nextMode = (pomCount % config.interval === 0 && pomCount > 0) ? 'long' : 'short';
    switchMode(nextMode);
  } else {
    switchMode('pomodoro');
  }
  updateSessionDots();
}

function switchMode(newMode) {
  mode        = newMode;
  totalSeconds = config[newMode] * 60;
  leftSeconds  = totalSeconds;
  isRunning    = false;
  clearInterval(tickerHandle);

  updateTimerDisplay();
  updateRingProgress();
  updateModeUI();
  setQuote(getQuoteFor('idle'));
  dom.timeStatus.textContent = '';
  updatePlayButton();
  applyModeTint();
}


/* ─────────────────────────────────────────────────────────
   TASKS
   ───────────────────────────────────────────────────────── */

function addTask(text) {
  const trimmed = text.trim();
  if (!trimmed) return;
  tasks.unshift({ id: Date.now(), text: trimmed, done: false });
  saveToStorage('ga3_tasks', tasks);
  renderTasks();
  sfx.click();
}

function toggleTaskDone(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.done = !task.done;
  if (task.done) {
    sfx.taskDone();
    if (focusedTaskId === id) clearFocusedTask();
  }
  saveToStorage('ga3_tasks', tasks);
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  if (focusedTaskId === id) clearFocusedTask();
  saveToStorage('ga3_tasks', tasks);
  renderTasks();
  sfx.click();
}

function editTaskText(id, newText) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  const trimmed = newText.trim();
  if (!trimmed) { deleteTask(id); return; }
  task.text = trimmed;
  if (focusedTaskId === id) dom.focusedChipText.textContent = trimmed;
  saveToStorage('ga3_tasks', tasks);
}

// set a task as the "focused" one — shown in the chip above the timer
function focusTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task || task.done) return;

  focusedTaskId = (focusedTaskId === id) ? null : id;  // toggle
  saveToStorage('ga3_focus', focusedTaskId);
  renderTasks();
  updateFocusedChip();
  sfx.click();
}

function clearFocusedTask() {
  focusedTaskId = null;
  saveToStorage('ga3_focus', null);
  renderTasks();
  updateFocusedChip();
}


/* ─────────────────────────────────────────────────────────
   RENDER: TASKS
   ───────────────────────────────────────────────────────── */

function renderTasks() {
  const list = dom.taskList;
  list.innerHTML = '';

  if (tasks.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'task-empty';
    empty.innerHTML = 'no tasks yet bestie ✦<br><small>add something above to grind on</small>';
    list.appendChild(empty);
    dom.taskBadge.textContent = '0 tasks';
    return;
  }

  const remaining = tasks.filter(t => !t.done).length;
  dom.taskBadge.textContent = `${remaining} left`;

  tasks.forEach(task => {
    const item = buildTaskElement(task);
    list.appendChild(item);
  });
}

function buildTaskElement(task) {
  const item = document.createElement('div');
  item.className = 'task-item' + (task.done ? ' done' : '') + (task.id === focusedTaskId ? ' focused' : '');
  item.dataset.id = task.id;

  // checkbox
  const check = document.createElement('div');
  check.className = 'task-check';
  check.textContent = task.done ? '✓' : '';
  check.title = task.done ? 'mark undone' : 'mark done';
  check.addEventListener('click', e => { e.stopPropagation(); toggleTaskDone(task.id); });

  // text (inline-editable on double-click)
  const text = document.createElement('div');
  text.className = 'task-text';
  text.textContent = task.text;
  text.setAttribute('tabindex', '0');
  text.addEventListener('dblclick', () => startInlineEdit(task.id, text));

  // actions (focus icon + delete)
  const actions = document.createElement('div');
  actions.className = 'task-actions';

  const focusBtn = document.createElement('button');
  focusBtn.className = 'task-action';
  focusBtn.title = task.id === focusedTaskId ? 'clear focus' : 'focus on this';
  focusBtn.textContent = task.id === focusedTaskId ? '★' : '☆';
  focusBtn.style.color = task.id === focusedTaskId ? 'var(--ring)' : '';
  focusBtn.addEventListener('click', e => { e.stopPropagation(); focusTask(task.id); });

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'task-action delete';
  deleteBtn.title = 'delete';
  deleteBtn.textContent = '×';
  deleteBtn.addEventListener('click', e => { e.stopPropagation(); deleteTask(task.id); });

  actions.appendChild(focusBtn);
  actions.appendChild(deleteBtn);

  // clicking the row (not check/buttons) focuses the task
  item.addEventListener('click', () => {
    if (!task.done) focusTask(task.id);
  });

  item.appendChild(check);
  item.appendChild(text);
  item.appendChild(actions);
  return item;
}

function startInlineEdit(id, textEl) {
  editingTask = id;
  textEl.setAttribute('contenteditable', 'true');
  textEl.focus();
  // select all
  const range = document.createRange();
  range.selectNodeContents(textEl);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);

  function commit() {
    textEl.removeAttribute('contenteditable');
    editTaskText(id, textEl.textContent);
    editingTask = null;
  }
  textEl.addEventListener('blur',    commit, { once: true });
  textEl.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); textEl.blur(); }
    if (e.key === 'Escape') { textEl.textContent = tasks.find(t => t.id === id)?.text || ''; textEl.blur(); }
  }, { once: true });
}


/* ─────────────────────────────────────────────────────────
   RENDER: TIMER UI
   ───────────────────────────────────────────────────────── */

function updateTimerDisplay() {
  const m = String(Math.floor(leftSeconds / 60)).padStart(2, '0');
  const s = String(leftSeconds % 60).padStart(2, '0');
  dom.timeDigits.textContent = `${m}:${s}`;
}

function updateRingProgress() {
  const pct    = totalSeconds > 0 ? leftSeconds / totalSeconds : 1;
  const offset = RING_CIRC * (1 - pct);
  dom.ringProg.style.strokeDashoffset = offset;
  dom.ringGlow.style.strokeDashoffset = offset;
}

function updatePlayButton() {
  dom.playBtn.textContent = isRunning ? '⏸' : '▶';
}

function updateTimerStatus() {
  dom.timeStatus.textContent = isRunning ? MODES[mode].status : '';
}

function updateModeUI() {
  dom.timeMode.textContent = MODES[mode].label;

  // sync mode tab highlight
  dom.modeTabs.querySelectorAll('.mode-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
}

function updateSessionDots() {
  dom.sessionDots.innerHTML = '';
  const total = config.interval;
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('div');
    dot.className = 'session-dot' + (i < pomCount % total ? ' done' : '');
    dom.sessionDots.appendChild(dot);
  }
}

function updateFocusedChip() {
  const task = tasks.find(t => t.id === focusedTaskId);
  if (task) {
    dom.focusedChip.style.display = 'flex';
    dom.focusedChipText.textContent = task.text;
  } else {
    dom.focusedChip.style.display = 'none';
    dom.focusedChipText.textContent = '';
  }
}


/* ─────────────────────────────────────────────────────────
   QUOTES
   ───────────────────────────────────────────────────────── */

function getQuoteFor(phase) {
  const pool = MODES[mode].quotes[phase];
  return pool[Math.floor(Math.random() * pool.length)];
}

function setQuote(text) {
  dom.quoteText.textContent = text;
  dom.quoteBox.classList.remove('quote-flash');
  void dom.quoteBox.offsetWidth;  // force reflow so animation re-triggers
  dom.quoteBox.classList.add('quote-flash');
}


/* ─────────────────────────────────────────────────────────
   THEMES & MODE TINTS
   ───────────────────────────────────────────────────────── */

function applyTheme(newTheme) {
  theme = newTheme;
  document.documentElement.dataset.theme = theme;

  // sync theme button active state
  dom.themeSwitcher.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });

  applyModeTint();
  saveToStorage('ga3_theme', theme);
}

// sets the ring color + full-page tint based on current mode + theme
function applyModeTint() {
  const ringColor = RING_COLORS[theme][mode];
  const tintColor = MODES[mode].bgTints[theme];

  // ring stroke + glow CSS vars
  document.documentElement.style.setProperty('--ring',      ringColor);
  document.documentElement.style.setProperty('--ring-glow', hexToRgba(ringColor, 0.22));

  // ring element strokes
  dom.ringProg.style.stroke = ringColor;
  dom.ringGlow.style.stroke = ringColor;

  // full-page mode tint
  dom.modeBg.style.background = tintColor || 'transparent';

  // keep the ring dasharray set
  dom.ringProg.style.strokeDasharray = RING_CIRC;
  dom.ringGlow.style.strokeDasharray = RING_CIRC;
}

// util: hex color → rgba string for glow vars
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}


/* ─────────────────────────────────────────────────────────
   CHILL MODE  — kills stars, ticker, and glow animations
   ───────────────────────────────────────────────────────── */

function applyChillMode(chill) {
  chillMode = chill;
  document.documentElement.classList.toggle('chill', chill);
  saveToStorage('ga3_chill', chill);
}


/* ─────────────────────────────────────────────────────────
   TICKER TAPE
   ───────────────────────────────────────────────────────── */
const TICKER_PHRASES = [
  '✦ you got this bestie',     '✦ no cap you\'re built for this',
  '✦ slay the task list',      '✦ stay hydrated king/queen',
  '✦ we\'re so in our bag',    '✦ this is your sign to focus',
  '✦ 25 minutes and we\'re free', '✦ brain cells please show up',
  '✦ main character energy only', '✦ we\'re literally cooking rn',
  '✦ the delulu always wins',  '✦ secure the bag bestie',
  '✦ fr fr you\'re doing amazing', '✦ locked in. dialed in. cooked in.',
  '✦ it\'s giving W behavior',
];

function initTicker() {
  // duplicate the row so the CSS loop is seamless
  const row  = TICKER_PHRASES.join('   ');
  const span = document.createElement('span');
  span.textContent = row + '   ' + row;
  dom.tickerTrack.appendChild(span);
}

function applyTickerState(animate) {
  if (!animate) dom.tickerWrap.style.transition = 'none';
  dom.tickerWrap.classList.toggle('hidden', !tickerVisible);
  dom.tickerToggle.textContent = tickerVisible ? 'ticker ✦' : 'ticker ○';
  dom.tickerToggle.title       = tickerVisible ? 'hide ticker' : 'show ticker';
  if (!animate) { void dom.tickerWrap.offsetWidth; dom.tickerWrap.style.transition = ''; }
  saveToStorage('ga3_ticker', tickerVisible);
}


/* ─────────────────────────────────────────────────────────
   STAR PARTICLES  — spawned once on load
   ───────────────────────────────────────────────────────── */

function spawnStars(count = 16) {
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.textContent = '✦';
    star.style.cssText = `
      left: ${Math.random() * 100}%;
      font-size: ${0.6 + Math.random() * 0.9}rem;
      --dur:   ${7 + Math.random() * 10}s;
      --delay: ${-Math.random() * 15}s;
    `;
    dom.starBg.appendChild(star);
  }
}


/* ─────────────────────────────────────────────────────────
   BURST PARTICLES  — emoji confetti on session complete
   ───────────────────────────────────────────────────────── */

const BURST_EMOJIS = ['🍅', '✦', '🏆', '💅', '⚡', '🎉', '✨'];

function spawnBurstParticles() {
  if (chillMode) return;  // skip in chill mode
  for (let i = 0; i < 9; i++) {
    const el = document.createElement('div');
    el.className = 'burst-particle';
    el.textContent = BURST_EMOJIS[Math.floor(Math.random() * BURST_EMOJIS.length)];
    el.style.left = `${25 + Math.random() * 50}%`;
    el.style.top  = `${30 + Math.random() * 30}%`;
    el.style.animationDelay = `${Math.random() * 0.4}s`;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}


/* ─────────────────────────────────────────────────────────
   TOAST
   ───────────────────────────────────────────────────────── */
let toastTimer = null;

function showToast(message) {
  clearTimeout(toastTimer);
  dom.toast.textContent = message;
  dom.toast.classList.add('visible');
  toastTimer = setTimeout(() => dom.toast.classList.remove('visible'), 3200);
}


/* ─────────────────────────────────────────────────────────
   SETTINGS MODAL
   ───────────────────────────────────────────────────────── */

function openSettings() {
  // populate fields from current config
  ['pomodoro', 'short', 'long', 'interval'].forEach(key => {
    document.getElementById(`s-${key}`).textContent = config[key];
  });
  dom.togAutostart.classList.toggle('on', config.autostart);
  dom.togSound.classList.toggle('on', config.sound);
  dom.settingsOverlay.classList.add('open');
}

function closeSettings() {
  dom.settingsOverlay.classList.remove('open');
}

function saveSettings() {
  ['pomodoro', 'short', 'long', 'interval'].forEach(key => {
    config[key] = parseInt(document.getElementById(`s-${key}`).textContent) || DEFAULT_CONFIG[key];
  });
  config.autostart = dom.togAutostart.classList.contains('on');
  config.sound     = dom.togSound.classList.contains('on');
  saveToStorage('ga3_cfg', config);

  // reset timer to new duration
  totalSeconds = config[mode] * 60;
  leftSeconds  = totalSeconds;
  pauseTimer();
  updateTimerDisplay();
  updateRingProgress();
  updateSessionDots();
  closeSettings();
  showToast('settings saved ✦');
  sfx.click();
}

function nudgeSetting(key, delta) {
  const el  = document.getElementById(`s-${key}`);
  const min = key === 'interval' ? 1 : 1;
  const max = key === 'interval' ? 10 : 60;
  el.textContent = Math.min(max, Math.max(min, (parseInt(el.textContent) || 0) + delta));
}


/* ─────────────────────────────────────────────────────────
   EVENT LISTENERS
   ───────────────────────────────────────────────────────── */

function bindEvents() {

  // play / pause
  dom.playBtn.addEventListener('click', () => {
    if (isRunning) { sfx.pause(); pauseTimer(); }
    else           { sfx.play();  startTimer(); }
  });

  // reset
  dom.resetBtn.addEventListener('click', () => { sfx.click(); resetTimer(); });

  // skip
  dom.skipBtn.addEventListener('click', () => { sfx.skip(); skipToNextSession(); });

  // mode tabs
  dom.modeTabs.addEventListener('click', e => {
    const btn = e.target.closest('.mode-tab');
    if (!btn) return;
    sfx.click();
    switchMode(btn.dataset.mode);
  });

  // theme buttons
  dom.themeSwitcher.addEventListener('click', e => {
    const btn = e.target.closest('.theme-btn');
    if (!btn) return;
    sfx.click();
    applyTheme(btn.dataset.theme);
  });

  // chill mode toggle
  dom.chillBtn.addEventListener('click', () => {
    sfx.click();
    applyChillMode(!chillMode);
  });

  // ticker toggle
  dom.tickerToggle.addEventListener('click', () => {
    tickerVisible = !tickerVisible;
    applyTickerState(true);
    sfx.click();
  });

  // settings open / close / save
  dom.settingsBtn.addEventListener('click', () => { sfx.click(); openSettings(); });
  dom.modalClose.addEventListener('click',  () => { sfx.click(); closeSettings(); });
  dom.modalSave.addEventListener('click',   saveSettings);
  dom.settingsOverlay.addEventListener('click', e => {
    if (e.target === dom.settingsOverlay) closeSettings();
  });

  // settings: +/- buttons
  document.querySelectorAll('.num-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sfx.click();
      nudgeSetting(btn.dataset.key, parseInt(btn.dataset.delta));
    });
  });

  // settings: toggles
  [dom.togAutostart, dom.togSound].forEach(tog => {
    tog.addEventListener('click', () => {
      sfx.click();
      tog.classList.toggle('on');
    });
  });

  // add task
  dom.taskAddBtn.addEventListener('click', () => {
    addTask(dom.taskInput.value);
    dom.taskInput.value = '';
  });
  dom.taskInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') { addTask(dom.taskInput.value); dom.taskInput.value = ''; }
  });

  // clear focused task chip
  dom.focusedChipClear.addEventListener('click', () => {
    sfx.click();
    clearFocusedTask();
  });

  // close settings on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSettings();
  });
}


/* ─────────────────────────────────────────────────────────
   BOOT  — load state, render everything, start listening
   ───────────────────────────────────────────────────────── */

function boot() {
  // load persisted state
  config        = { ...DEFAULT_CONFIG, ...loadFromStorage('ga3_cfg', {}) };
  tasks         = loadFromStorage('ga3_tasks', []);
  focusedTaskId = loadFromStorage('ga3_focus', null);
  theme         = loadFromStorage('ga3_theme', 'phonebooth');
  chillMode     = loadFromStorage('ga3_chill', false);
  tickerVisible = loadFromStorage('ga3_ticker', true);

  // set initial timer state
  totalSeconds  = config[mode] * 60;
  leftSeconds   = totalSeconds;

  // init all the things
  initTicker();
  spawnStars();
  applyTheme(theme);
  applyChillMode(chillMode);
  applyTickerState(false);
  updateTimerDisplay();
  updateRingProgress();
  updateModeUI();
  updateSessionDots();
  updateFocusedChip();
  renderTasks();
  setQuote(getQuoteFor('idle'));
  bindEvents();

  // ring dasharray fixed values
  dom.ringProg.style.strokeDasharray = RING_CIRC;
  dom.ringGlow.style.strokeDasharray = RING_CIRC;
}

boot(); 
