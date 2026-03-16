/* ── QUOTES ─────────────────────────────────────────────────── */
const Q = {
  idle: [
    "ready when you are bestie 👀",
    "we're procrastinating together 🤝",
    "the grind awaits... (no pressure tho)",
    "this is your sign. start. NOW.",
    "imagine actually being productive rn 💭",
    "today we choose violence (on our task list)",
    "the timer is ready. are you though? 🤔",
  ],
  pomStart: [
    "ok bestie let's lock tf in 🔒",
    "main character arc: activated ✨",
    "time to pretend we have it together",
    "channeling our inner that girl (allegedly) 💅",
    "no thoughts, head empty, only grind 💀",
    "slay or be slayed. choose wisely.",
    "we're so cooked if we don't do this fr",
    "it's giving productive. allegedly. 🎭",
    "the delulu-to-reality pipeline is open",
    "23 unread emails but make it fashion 💼",
    "entering our locked-in era bestie",
    "brain cells assemble!!! (please)",
  ],
  pomMid: [
    "you're literally eating rn 👏",
    "stay locked in bestie we're cookin",
    "not you ACTUALLY doing the thing 😭",
    "we're so in our bag rn no cap",
    "the grind never sleeps (it should tho)",
    "ur doing amazing sweetie fr fr 🌟",
    "this is your villain origin story 😈",
    "focus mode: engaged. brain cells: debatable.",
  ],
  pomEnd: [
    "PERIODT. you ate that bestie 💅",
    "omg you actually finished?? unhinged behavior",
    "slay slay slay slay slay ✨✨✨",
    "fr fr you just secured the bag 💼",
    "we did it bestie. we survived. 🫂",
    "not you being productive AND snatched 😤",
    "the bar was low but you cleared it 🥂",
    "your ancestors are crying (happy tears)",
    "mission accomplished king/queen/legend 👑",
    "W behavior. absolutely W.",
    "that was a serve and a half bestie",
  ],
  shortStart: [
    "ok go touch some grass or whatever 🌿",
    "hydrate or diedrate bestie 💧",
    "corpse mode: activated 💀",
    "time to do nothing and justify it",
    "this is your villain rest arc 😈",
    "stare at the wall for 5 mins. heal.",
    "snack run? snack run. 🍕",
    "your braincells need a lil vacay too",
  ],
  shortEnd: [
    "break's over bestie, cope and slay 💅",
    "ok enough rotting, we rise 💪",
    "back to the grind (we're sobbing but ok)",
    "let's get this bread (idk why we do this)",
    "rest arc is over. slay arc begins.",
    "the grind is calling. unfortunately. 📞",
  ],
  longStart: [
    "LONG BREAK ERA FULLY ACTIVATED 🎉",
    "bestie you earned this. rest. rot. heal.",
    "touch grass, drink water, eat food. in that order.",
    "this is not procrastination this is RECOVERY 🧘",
    "we are entering our full rest lore 💤",
    "literally no notes. you did that. relax now.",
  ],
  longEnd: [
    "ok legend, you've rested enough. allegedly.",
    "back to work? (we're crying but it's fine)",
    "rest arc complete. main character arc resuming.",
    "we're fully recharged. (this is a lie but ok)",
    "new session who dis 😤",
  ],
  taskDone: [
    "SLAYED 💅 one less thing to panic about",
    "check!! we're literally that girl rn",
    "bestie ate and LEFT NO CRUMBS",
    "ok that task never stood a chance fr",
    "W ✓ secured. remaining Ls: decreasing.",
  ],
};
const rnd = arr => arr[Math.floor(Math.random() * arr.length)];

/* ── TICKER ──────────────────────────────────────────────────── */
const TICKER_ITEMS = [
  "✦ you got this bestie", "✦ no cap you're built for this",
  "✦ slay the task list", "✦ stay hydrated king/queen",
  "✦ we're so in our bag", "✦ this is your sign to focus",
  "✦ 25 minutes and we're free", "✦ brain cells please show up",
  "✦ main character energy only", "✦ we're literally cooking rn",
  "✦ the delulu always wins", "✦ secure the bag bestie",
  "✦ fr fr you're doing amazing", "✦ locked in. dialed in. cooked in.",
  "✦ it's giving W behavior",
];
(function initTicker() {
  const el = document.getElementById('tickerEl');
  /* duplicate twice so the seamless loop works at any viewport width */
  const row = TICKER_ITEMS.join('   ');
  const s = document.createElement('span');
  s.textContent = row + '   ' + row;   /* one seamless repeat */
  el.appendChild(s);
})();

/* ── TICKER TOGGLE ───────────────────────────────────────────── */
let tickerVisible = true;
(function initTickerToggle() {
  try {
    const saved = localStorage.getItem('ga3_ticker');
    if (saved === 'hidden') tickerVisible = false;
  } catch (e) {}
  applyTickerState(false);
  document.getElementById('tickerToggle').addEventListener('click', () => {
    tickerVisible = !tickerVisible;
    applyTickerState(true);
    sfxClick();
    try { localStorage.setItem('ga3_ticker', tickerVisible ? 'visible' : 'hidden'); } catch (e) {}
  });
})();
function applyTickerState(animate) {
  const wrap = document.getElementById('tickerWrap');
  const btn  = document.getElementById('tickerToggle');
  if (!animate) wrap.style.transition = 'none';
  wrap.classList.toggle('hidden', !tickerVisible);
  btn.textContent = tickerVisible ? 'ticker ✦' : 'ticker ○';
  btn.title = tickerVisible ? 'hide ticker' : 'show ticker';
  if (!animate) void wrap.offsetWidth, wrap.style.transition = '';
}

/* ── STARS ───────────────────────────────────────────────────── */
function makeStars() {
  const bg = document.getElementById('starbg');
  while (bg.firstChild) bg.removeChild(bg.firstChild);
  const chars = ['✦', '✧', '⊹', '×', '◦', '·', '⋆', '⊛'];
  for (let i = 0; i < 28; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    s.textContent = chars[i % chars.length];
    s.style.cssText = `left:${Math.random() * 100}%;top:${10 + Math.random() * 90}%;--dur:${6 + Math.random() * 12}s;--d:${Math.random() * 10}s;font-size:${7 + Math.random() * 13}px`;
    bg.appendChild(s);
  }
}
makeStars();

/* ── RING CONSTANTS ──────────────────────────────────────────── */
const CIRC = 2 * Math.PI * 125;
document.getElementById('rprog').style.strokeDasharray = CIRC;
document.getElementById('rglow').style.strokeDasharray = CIRC;

/* ── APP STATE ───────────────────────────────────────────────── */
let cfg = { pomodoro: 25, short: 5, long: 15, interval: 4, autoStart: false, sound: true };
let tmp = {};
let tasks = [];
let mode = 'pomodoro';
let totalS = 25 * 60, remS = 25 * 60;
let running = false, startT = null, elap = 0, tid = null;
let donePomos = 0;
let curTheme = 'phonebooth';

/* ── PERSISTENCE ─────────────────────────────────────────────── */
function loadData() {
  try {
    const c = localStorage.getItem('ga3_cfg');   if (c) cfg   = { ...cfg,   ...JSON.parse(c) };
    const t = localStorage.getItem('ga3_tasks');  if (t) tasks = JSON.parse(t);
    const th = localStorage.getItem('ga3_theme'); if (th) applyTheme(th, true);
  } catch (e) {}
  totalS = cfg[mode] * 60;
  remS   = totalS;
}
function saveData() {
  try {
    localStorage.setItem('ga3_cfg',   JSON.stringify(cfg));
    localStorage.setItem('ga3_tasks', JSON.stringify(tasks));
    localStorage.setItem('ga3_theme', curTheme);
  } catch (e) {}
}

/* ── THEME ───────────────────────────────────────────────────── */
function applyTheme(t, silent) {
  curTheme = t;
  document.documentElement.setAttribute('data-theme', t);
  document.querySelectorAll('.tb').forEach(b => b.classList.toggle('on', b.dataset.t === t));
  if (!silent) { makeStars(); saveData(); }
}

/* ── AUDIO ENGINE ────────────────────────────────────────────── */
let ac;
function getAC() {
  if (!ac || ac.state === 'closed') ac = new AudioContext();
  if (ac.state === 'suspended')     ac.resume();
  return ac;
}

/* tiny square blip – every button press */
function sfxClick() {
  if (!cfg.sound) return;
  try {
    const a = getAC(), o = a.createOscillator(), g = a.createGain();
    o.connect(g); g.connect(a.destination);
    o.type = 'square'; o.frequency.value = 880;
    g.gain.setValueAtTime(.07, a.currentTime);
    g.gain.exponentialRampToValueAtTime(.001, a.currentTime + .07);
    o.start(); o.stop(a.currentTime + .07);
  } catch (e) {}
}

/* punchy sine pop – play button (start) */
function sfxPlay() {
  if (!cfg.sound) return;
  try {
    const a = getAC();
    // rising two-tone pop
    [330, 523].forEach((f, i) => {
      const o = a.createOscillator(), g = a.createGain();
      o.connect(g); g.connect(a.destination);
      o.type = 'sine'; o.frequency.value = f;
      const t = a.currentTime + i * .07;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(.18, t + .02);
      g.gain.exponentialRampToValueAtTime(.001, t + .18);
      o.start(t); o.stop(t + .18);
    });
  } catch (e) {}
}

/* soft descending click – pause button */
function sfxPause() {
  if (!cfg.sound) return;
  try {
    const a = getAC();
    [523, 330].forEach((f, i) => {
      const o = a.createOscillator(), g = a.createGain();
      o.connect(g); g.connect(a.destination);
      o.type = 'sine'; o.frequency.value = f;
      const t = a.currentTime + i * .07;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(.14, t + .02);
      g.gain.exponentialRampToValueAtTime(.001, t + .16);
      o.start(t); o.stop(t + .16);
    });
  } catch (e) {}
}

/* ascending whoosh – skip / mode switch */
function sfxWoosh() {
  if (!cfg.sound) return;
  try {
    const a = getAC(), o = a.createOscillator(), g = a.createGain();
    o.connect(g); g.connect(a.destination);
    o.type = 'sine'; o.frequency.value = 400;
    o.frequency.linearRampToValueAtTime(800, a.currentTime + .15);
    g.gain.setValueAtTime(.08, a.currentTime);
    g.gain.exponentialRampToValueAtTime(.001, a.currentTime + .2);
    o.start(); o.stop(a.currentTime + .2);
  } catch (e) {}
}

/* loud fanfare + noise – pomodoro complete */
function sfxComplete() {
  if (!cfg.sound) return;
  try {
    const a = getAC();
    [[523,.00,.32],[659,.15,.32],[784,.30,.32],[1047,.45,.55],
     [784,.65,.22],[1047,.75,.22],[1319,.88,.75]].forEach(([f, d, l]) => {
      const o = a.createOscillator(), g = a.createGain();
      o.connect(g); g.connect(a.destination);
      o.type = 'square'; o.frequency.value = f;
      const t = a.currentTime + d;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(.35, t + .025);
      g.gain.exponentialRampToValueAtTime(.001, t + l);
      o.start(t); o.stop(t + l);
    });
    // noise burst
    const buf = a.createBuffer(1, a.sampleRate * .5, a.sampleRate);
    const dat = buf.getChannelData(0);
    for (let i = 0; i < dat.length; i++) dat[i] = (Math.random() * 2 - 1) * .13;
    const src = a.createBufferSource(), gn = a.createGain();
    src.buffer = buf; src.connect(gn); gn.connect(a.destination);
    gn.gain.setValueAtTime(.18, a.currentTime);
    gn.gain.exponentialRampToValueAtTime(.001, a.currentTime + .5);
    src.start();
  } catch (e) {}
}

/* descending "uh oh" – break over */
function sfxBreakEnd() {
  if (!cfg.sound) return;
  try {
    const a = getAC();
    [660, 550, 440, 330].forEach((f, i) => {
      const o = a.createOscillator(), g = a.createGain();
      o.connect(g); g.connect(a.destination);
      o.type = 'sine'; o.frequency.value = f;
      const t = a.currentTime + i * .15;
      g.gain.setValueAtTime(.1, t);
      g.gain.exponentialRampToValueAtTime(.001, t + .28);
      o.start(t); o.stop(t + .28);
    });
  } catch (e) {}
}

/* quick rising ping – task checked off */
function sfxTaskDone() {
  if (!cfg.sound) return;
  try {
    const a = getAC(), o = a.createOscillator(), g = a.createGain();
    o.connect(g); g.connect(a.destination);
    o.type = 'sine'; o.frequency.value = 523;
    o.frequency.linearRampToValueAtTime(784, a.currentTime + .12);
    g.gain.setValueAtTime(.08, a.currentTime);
    g.gain.exponentialRampToValueAtTime(.001, a.currentTime + .25);
    o.start(); o.stop(a.currentTime + .25);
  } catch (e) {}
}

/* ── DISPLAY ──────────────────────────────────────────────────── */
const MODE_LABEL = { pomodoro: 'FOCUS TIME', short: 'SHORT BREAK', long: 'LONG BREAK' };

function fmt(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function redraw() {
  document.getElementById('tdisp').textContent = fmt(remS);
  document.title = `${fmt(remS)} — grind.app`;
  const off = CIRC * (1 - remS / totalS);
  document.getElementById('rprog').style.strokeDashoffset = off;
  document.getElementById('rglow').style.strokeDashoffset = off;
  const st = document.getElementById('tstat');
  if (running) {
    st.textContent = '● RUNNING'; st.style.animation = 'blk 1s steps(1) infinite';
  } else if (remS < totalS) {
    st.textContent = '❚❚ PAUSED'; st.style.animation = '';
  } else {
    st.textContent = '\u00a0'; st.style.animation = '';
  }
}

/* ── TIMER LOGIC ─────────────────────────────────────────────── */
function tick() {
  remS = Math.max(0, totalS - Math.floor((Date.now() - startT + elap) / 1000));
  redraw();
  if (remS === 0) { clearInterval(tid); tid = null; running = false; onEnd(); }
}

function toggleTimer() {
  if (running) {
    elap += Date.now() - startT;
    clearInterval(tid); tid = null;
    running = false;
    sfxPause();
    setPlayIcon(false); redraw();
    setQuote('idle');
  } else {
    startT = Date.now();
    tid = setInterval(tick, 200);
    running = true;
    sfxPlay();
    setPlayIcon(true); redraw();
    setQuote(mode === 'pomodoro' ? 'pomStart' : mode === 'short' ? 'shortStart' : 'longStart');
  }
}

function resetTimer() {
  if (tid) { clearInterval(tid); tid = null; }
  running = false; elap = 0; remS = totalS;
  sfxClick(); setPlayIcon(false); redraw(); setQuote('idle');
}

function skipSession() {
  if (tid) { clearInterval(tid); tid = null; }
  running = false; elap = 0;
  sfxWoosh(); advance();
}

function setPlayIcon(playing) {
  document.getElementById('playBtn').textContent = playing ? '⏸' : '▶';
}

function onEnd() {
  setPlayIcon(false);
  if (mode === 'pomodoro') {
    donePomos++; renderDots();
    sfxComplete(); doBurst();
    setQuote('pomEnd');
    toast('🎉 session complete bestie!');
  } else {
    sfxBreakEnd(); doBurst();
    setQuote(mode === 'long' ? 'longEnd' : 'shortEnd');
    toast('⚡ break over — back to the grind');
  }
  if (cfg.autoStart) {
    setTimeout(() => { advance(); setTimeout(toggleTimer, 400); }, 1000);
  } else {
    advance();
  }
}

function advance() {
  if (mode === 'pomodoro') {
    mode = (donePomos > 0 && donePomos % cfg.interval === 0) ? 'long' : 'short';
  } else {
    mode = 'pomodoro';
  }
  document.querySelectorAll('.mb').forEach(b => b.classList.toggle('on', b.dataset.mode === mode));
  applyMode(); sfxWoosh();
}

function switchMode(m) {
  if (running) { clearInterval(tid); tid = null; running = false; elap = 0; setPlayIcon(false); }
  mode = m;
  document.querySelectorAll('.mb').forEach(b => b.classList.toggle('on', b.dataset.mode === m));
  applyMode(); setQuote('idle'); sfxWoosh();
}

function applyMode() {
  totalS = cfg[mode] * 60; remS = totalS; elap = 0;
  document.getElementById('tlbl').textContent = MODE_LABEL[mode];
  redraw();
}

/* ── QUOTES ──────────────────────────────────────────────────── */
function setQuote(cat) {
  const el = document.getElementById('qtxt');
  const box = document.getElementById('qbox');
  el.textContent = rnd(Q[cat]);
  box.classList.remove('qf');
  void box.offsetWidth;
  box.classList.add('qf');
}

/* ── BURST PARTICLES ─────────────────────────────────────────── */
function doBurst() {
  const em = ['✨','🎉','💅','🔥','⭐','💫','🌟','🎊','✦','🏆'];
  const cx = window.innerWidth / 2, cy = window.innerHeight * .4;
  for (let i = 0; i < 10; i++) {
    const el = document.createElement('div');
    el.className = 'burst';
    el.textContent = em[i % em.length];
    el.style.left = (cx + (Math.random() - .5) * 280) + 'px';
    el.style.top  = (cy + (Math.random() - .5) * 180) + 'px';
    el.style.animationDelay = (Math.random() * .3) + 's';
    document.body.appendChild(el);
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 1300);
  }
}

/* ── SESSION DOTS ────────────────────────────────────────────── */
function renderDots() {
  const wrap = document.getElementById('dotsEl');
  while (wrap.firstChild) wrap.removeChild(wrap.firstChild);
  const n = cfg.interval, filled = donePomos % n;
  for (let i = 0; i < n; i++) {
    const d = document.createElement('div');
    d.className = 'dot' + (i < filled ? ' on' : '');
    wrap.appendChild(d);
  }
}

/* ── TASKS ───────────────────────────────────────────────────── */
function renderTasks() {
  const list = document.getElementById('tlist');
  while (list.firstChild) list.removeChild(list.firstChild);
  document.getElementById('tcnt').textContent = `${tasks.length} task${tasks.length !== 1 ? 's' : ''}`;

  if (tasks.length === 0) {
    const e = document.createElement('div');
    e.className = 'tempty';
    e.innerHTML = 'no tasks yet bestie<br>add something to the grind list<br><br>✦ the queue is empty ✦';
    list.appendChild(e);
    return;
  }

  tasks.forEach((task, i) => {
    const item = document.createElement('div');
    item.className = 'titem' + (task.done ? ' done' : '');

    const chk = document.createElement('div');
    chk.className = 'tchk';
    chk.textContent = task.done ? '✓' : '';
    chk.addEventListener('click', () => toggleTask(i));

    const txt = document.createElement('div');
    txt.className = 'ttxt';
    txt.textContent = task.text;

    const acts = document.createElement('div');
    acts.className = 'tacts';

    const eb = document.createElement('button');
    eb.className = 'ta'; eb.title = 'edit'; eb.textContent = '✏';
    eb.addEventListener('click', () => editTask(i, txt));

    const db = document.createElement('button');
    db.className = 'ta del'; db.title = 'delete'; db.textContent = '🗑';
    db.addEventListener('click', () => deleteTask(i));

    acts.appendChild(eb);
    acts.appendChild(db);
    item.appendChild(chk);
    item.appendChild(txt);
    item.appendChild(acts);
    list.appendChild(item);
  });
}

function addTask() {
  const inp = document.getElementById('tinput');
  const v = inp.value.trim();
  if (!v) return;
  tasks.unshift({ text: v, done: false });
  inp.value = '';
  saveData(); renderTasks(); sfxClick();
  if (Math.random() < .35) toast(rnd(Q.pomMid));
}

function toggleTask(i) {
  tasks[i].done = !tasks[i].done;
  saveData(); renderTasks(); sfxTaskDone();
  if (tasks[i].done) toast(rnd(Q.taskDone));
}

function editTask(i, txtEl) {
  txtEl.contentEditable = 'true'; txtEl.focus();
  const r = document.createRange();
  r.selectNodeContents(txtEl); r.collapse(false);
  const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);

  const fin = () => {
    txtEl.contentEditable = 'false';
    const nv = txtEl.textContent.trim();
    if (nv) tasks[i].text = nv;
    txtEl.removeEventListener('blur', fin);
    txtEl.removeEventListener('keydown', kh);
    saveData(); renderTasks();
  };
  const kh = e => { if (e.key === 'Enter') { e.preventDefault(); fin(); } };
  txtEl.addEventListener('blur', fin);
  txtEl.addEventListener('keydown', kh);
}

function deleteTask(i) {
  tasks.splice(i, 1);
  saveData(); renderTasks(); sfxClick();
}

/* ── SETTINGS ────────────────────────────────────────────────── */
const LIMITS = { pomodoro: [1, 90], short: [1, 30], long: [1, 60], interval: [1, 10] };

function openSettings() {
  tmp = { ...cfg };
  ['pomodoro', 'short', 'long', 'interval'].forEach(k => {
    document.getElementById(`s-${k}`).textContent = tmp[k];
  });
  document.getElementById('tog-auto').classList.toggle('on',   tmp.autoStart);
  document.getElementById('tog-sound').classList.toggle('on',  tmp.sound);
  document.getElementById('ovl').classList.add('open');
  sfxClick();
}
function closeSettings() {
  document.getElementById('ovl').classList.remove('open');
  sfxClick();
}
function adjSetting(k, d) {
  const [mn, mx] = LIMITS[k];
  tmp[k] = Math.min(mx, Math.max(mn, tmp[k] + d));
  document.getElementById(`s-${k}`).textContent = tmp[k];
  sfxClick();
}
function togSetting(k) {
  tmp[k] = !tmp[k];
  document.getElementById(k === 'autoStart' ? 'tog-auto' : 'tog-sound').classList.toggle('on', tmp[k]);
  sfxClick();
}
function saveSettings() {
  cfg = { ...tmp }; saveData();
  if (!running) { totalS = cfg[mode] * 60; remS = totalS; elap = 0; redraw(); }
  renderDots(); closeSettings();
  toast('settings saved bestie ✦');
}

/* ── TOAST ───────────────────────────────────────────────────── */
let toastTimer;
function toast(msg) {
  const el = document.getElementById('toastEl');
  el.textContent = msg; el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
}

/* ── EVENT WIRING ────────────────────────────────────────────── */
document.getElementById('playBtn').addEventListener('click', toggleTimer);
document.getElementById('resetBtn').addEventListener('click', resetTimer);
document.getElementById('skipBtn').addEventListener('click', skipSession);
document.getElementById('settBtn').addEventListener('click', openSettings);
document.getElementById('mxBtn').addEventListener('click', closeSettings);
document.getElementById('saveBtn').addEventListener('click', saveSettings);
document.getElementById('addBtn').addEventListener('click', addTask);
document.getElementById('tinput').addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });

document.getElementById('ovl').addEventListener('click', e => {
  if (e.target === document.getElementById('ovl')) closeSettings();
});

document.getElementById('modeWrap').addEventListener('click', e => {
  const b = e.target.closest('.mb');
  if (b) switchMode(b.dataset.mode);
});

document.getElementById('themeWrap').addEventListener('click', e => {
  const b = e.target.closest('.tb');
  if (b) { applyTheme(b.dataset.t); sfxClick(); }
});

document.querySelectorAll('.nb').forEach(b => {
  b.addEventListener('click', () => adjSetting(b.dataset.k, parseInt(b.dataset.d)));
});

document.getElementById('tog-auto').addEventListener('click',  () => togSetting('autoStart'));
document.getElementById('tog-sound').addEventListener('click', () => togSetting('sound'));

/* ── INIT ────────────────────────────────────────────────────── */
loadData();
applyMode();
setQuote('idle');
renderDots();
renderTasks();
