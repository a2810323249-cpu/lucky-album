// Lucky stays in the browser only. The small preference record stores her position
// and whether the visitor chose to keep the widget visible or quiet.
const STORAGE_KEY = 'lucky-web-pet-v1';
const SPRITES = Object.freeze({
  idle: 'assets/lucky-cozy-idle.png',
  blink: 'assets/lucky-cozy-blink.png',
  hello: 'assets/lucky-cozy-hello.png',
  play: 'assets/lucky-cozy-play.png',
  sleep: 'assets/lucky-cozy-sleep.png'
});

// All coordinates use the original 1284 × 1225 art board. Keeping them here
// makes the mask easy to tune when Lucky's reference portrait is revised.
const ART = Object.freeze({
  earLeft: 'M 225 430 Q 213 304 226 181 Q 233 118 291 126 Q 371 145 488 354 L 518 431 Z',
  earRight: 'M 614 419 Q 637 258 669 130 Q 693 70 745 95 Q 816 131 854 407 Z',
  chest: 'M 325 637 Q 374 577 478 584 Q 593 572 752 596 Q 832 673 810 843 Q 786 929 719 970 L 387 971 Q 310 893 325 637 Z',
  pawLeft: 'M 373 882 Q 417 876 468 895 Q 527 904 568 943 L 579 1119 Q 514 1156 418 1131 Q 365 1100 373 882 Z',
  pawRight: 'M 574 924 Q 622 884 692 884 Q 766 884 794 949 L 810 1118 Q 723 1160 610 1134 Q 562 1101 574 924 Z',
  tail: 'M 866 1034 Q 916 957 934 870 Q 946 742 906 650 Q 877 566 924 454 Q 989 321 1091 300 Q 1190 285 1230 371 Q 1264 469 1212 590 Q 1161 701 1133 810 Q 1110 948 1061 1050 Q 981 1135 866 1034 Z',
  eyes: 'M 372 349 H 784 V 555 H 372 Z'
});

const partClip = (name) => `<clipPath id="lucky-${name}"><path d="${ART[name]}"/></clipPath>`;
const partImage = (name, className, src = SPRITES.idle) =>
  `<g class="${className}" clip-path="url(#lucky-${name})"><image href="${src}" width="1284" height="1225"/></g>`;
const rigMarkup = `<svg class="lucky-pet-rig" viewBox="0 0 1284 1225" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <defs>
    ${['earLeft', 'earRight', 'chest', 'pawLeft', 'pawRight', 'tail', 'eyes'].map(partClip).join('')}
    <mask id="lucky-core-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1284" height="1225" style="mask-type:luminance">
      <rect width="1284" height="1225" fill="white"/>
      ${['earLeft', 'earRight', 'chest', 'pawLeft', 'pawRight', 'tail'].map(name => `<path d="${ART[name]}" fill="black"/>`).join('')}
    </mask>
  </defs>
  <image class="lucky-pet-underpaint" href="${SPRITES.idle}" width="1284" height="1225"/>
  ${partImage('tail', 'lucky-pet-tail')}
  <image class="lucky-pet-core" href="${SPRITES.idle}" width="1284" height="1225" mask="url(#lucky-core-mask)"/>
  ${partImage('earLeft', 'lucky-pet-ear-left')}
  ${partImage('earRight', 'lucky-pet-ear-right')}
  ${partImage('chest', 'lucky-pet-chest')}
  ${partImage('pawLeft', 'lucky-pet-paw-left')}
  ${partImage('pawRight', 'lucky-pet-paw-right')}
  ${partImage('eyes', 'lucky-pet-blink', SPRITES.blink)}
</svg>`;
let saved = {};
try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { /* Storage can be unavailable. */ }

const pet = document.createElement('aside');
pet.className = 'lucky-pet';
pet.setAttribute('aria-label', 'Lucky 网页桌宠，一只奶白色、灰杏色斑块和蓬松长尾巴的三花小猫');
pet.innerHTML = `<div class="lucky-pet-bubble" aria-hidden="true" hidden></div>
  <button class="lucky-pet-character" type="button" aria-label="摸摸 Lucky；拖动或使用方向键可移动桌宠" aria-describedby="lucky-pet-help">
    ${rigMarkup}
    <img class="lucky-pet-pose" src="${SPRITES.sleep}" width="1284" height="1225" alt="" aria-hidden="true" draggable="false">
    <span class="lucky-pet-shadow" aria-hidden="true"></span>
    <span class="lucky-pet-heart" aria-hidden="true">♥</span>
    <span class="lucky-pet-spark" aria-hidden="true">✦</span>
    <span class="lucky-pet-dream" aria-hidden="true">zZ</span>
  </button>
  <div class="lucky-pet-bar"><span class="lucky-pet-name">Lucky <span aria-hidden="true">✦</span></span><button class="lucky-pet-menu-toggle" type="button" aria-label="Lucky 的互动菜单" aria-controls="lucky-pet-menu" aria-expanded="false">···</button></div>
  <div id="lucky-pet-menu" class="lucky-pet-menu" hidden>
    <p class="lucky-pet-menu-title">和 Lucky 玩一会儿</p>
    <p class="lucky-pet-menu-subtitle">三个月大的长尾三花小姑娘</p>
    <button type="button" data-pet-action="pet">♡ 摸摸 Lucky</button>
    <button type="button" data-pet-action="play">✦ 一起玩</button>
    <button type="button" data-pet-action="sleep">☾ 去睡觉</button>
    <button type="button" data-pet-action="sound" aria-pressed="false">♫ 声音：关闭</button>
    <button type="button" data-pet-action="hide">× 收起桌宠</button>
    <p id="lucky-pet-help" class="lucky-pet-menu-help">拖动 Lucky，或用方向键移动。</p>
  </div>
  <span class="lucky-pet-live" role="status" aria-live="polite" aria-atomic="true"></span>`;

const launcher = document.createElement('button');
launcher.className = 'lucky-pet-launcher';
launcher.type = 'button';
launcher.setAttribute('aria-label', '唤回 Lucky 网页桌宠');
launcher.innerHTML = '<span aria-hidden="true">🐾</span><span>Lucky</span>';

document.body.append(pet, launcher);
const character = pet.querySelector('.lucky-pet-character');
const bubble = pet.querySelector('.lucky-pet-bubble');
const live = pet.querySelector('.lucky-pet-live');
const menu = pet.querySelector('.lucky-pet-menu');
const menuToggle = pet.querySelector('.lucky-pet-menu-toggle');
const sleepButton = pet.querySelector('[data-pet-action="sleep"]');
const soundButton = pet.querySelector('[data-pet-action="sound"]');
const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
let isSleeping = false;
let soundEnabled = saved.sound === true;
// Older versions saved even the default left-hand placement. Keep only locations
// the visitor actually moved, so a fresh mobile visit starts at the smaller right edge.
let hasCustomPosition = saved.moved === true || (saved.moved !== false && Number(saved.x) > 14);
let position = { x: hasCustomPosition ? Number(saved.x) : NaN, y: hasCustomPosition ? Number(saved.y) : NaN };
let bubbleTimer;
let actionTimer;
let blinkTimer;
let blinkEndTimer;
let activePointer;
let suppressClick = false;
let audioContext;
const preloadedSprites = new Map();

function preloadSprite(state) {
  if (preloadedSprites.has(state) || !SPRITES[state]) return;
  const image = new Image();
  image.decoding = 'async';
  image.src = SPRITES[state];
  preloadedSprites.set(state, image);
}

function scheduleBlink() {
  clearTimeout(blinkTimer);
  clearTimeout(blinkEndTimer);
  if (pet.hidden || document.hidden || reducedMotion?.matches || pet.dataset.state === 'sleep') return;
  blinkTimer = window.setTimeout(() => {
    if (pet.hidden || document.hidden || pet.dataset.state === 'sleep') return;
    pet.classList.add('is-blinking');
    blinkEndTimer = window.setTimeout(() => {
      pet.classList.remove('is-blinking');
      scheduleBlink();
    }, 190);
  }, 3900 + Math.random() * 2200);
}

function save() {
  try {
    const preference = { visible: !pet.hidden, sound: soundEnabled, moved: hasCustomPosition };
    if (hasCustomPosition) {
      preference.x = Math.round(position.x);
      preference.y = Math.round(position.y);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preference));
  } catch { /* The pet works without storage. */ }
}

function defaultX() {
  return window.innerWidth <= 640 ? window.innerWidth - (pet.offsetWidth || 108) - 12 : 12;
}

function clamp(value, min, max) { return Math.min(Math.max(value, min), Math.max(min, max)); }
function setPosition(x, y, persist = false) {
  const width = pet.offsetWidth || (window.innerWidth <= 640 ? 108 : 176);
  const height = pet.offsetHeight || (window.innerWidth <= 640 ? 143 : 204);
  position = {
    x: clamp(x, 6, window.innerWidth - width - 6),
    y: clamp(y, 6, window.innerHeight - height - 6)
  };
  pet.style.left = `${position.x}px`;
  pet.style.top = `${position.y}px`;
  const above = position.y - 8;
  const below = window.innerHeight - position.y - height - 8;
  const menuBelow = above < 315 && below > above;
  pet.classList.toggle('lucky-pet-near-top', menuBelow);
  pet.classList.toggle('lucky-pet-near-right', position.x + 200 > window.innerWidth - 6);
  menu.style.maxHeight = `${Math.max(80, Math.floor(menuBelow ? below : above))}px`;
  if (persist) save();
}

function showBubble(message, duration = 2400) {
  clearTimeout(bubbleTimer);
  bubble.textContent = message;
  live.textContent = message;
  bubble.hidden = false;
  bubbleTimer = window.setTimeout(() => { bubble.hidden = true; }, duration);
}

function setState(state, duration = 0) {
  clearTimeout(actionTimer);
  clearTimeout(blinkTimer);
  clearTimeout(blinkEndTimer);
  pet.classList.remove('is-blinking');
  pet.dataset.state = state;
  // The awake figure is assembled from independently animated regions.
  // Sleeping is one deliberate pose transition rather than a loop of whole images.
  if (state !== 'sleep') scheduleBlink();
  if (duration) actionTimer = window.setTimeout(() => setState(isSleeping ? 'sleep' : 'idle'), duration);
}

function chirp() {
  if (!soundEnabled) return;
  try {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return;
    audioContext ||= new Context();
    if (audioContext.state === 'suspended') void audioContext.resume().catch(() => {});
    const oscillator = audioContext.createOscillator();
    const volume = audioContext.createGain();
    const now = audioContext.currentTime;
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(480, now);
    oscillator.frequency.exponentialRampToValueAtTime(690, now + 0.12);
    oscillator.frequency.exponentialRampToValueAtTime(390, now + 0.31);
    volume.gain.setValueAtTime(0.0001, now);
    volume.gain.exponentialRampToValueAtTime(0.035, now + 0.025);
    volume.gain.exponentialRampToValueAtTime(0.0001, now + 0.33);
    oscillator.connect(volume).connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.34);
  } catch { /* Audio is an optional effect. */ }
}

function closeMenu(restoreFocus = false) {
  if (menu.hidden) return;
  menu.hidden = true;
  menuToggle.setAttribute('aria-expanded', 'false');
  if (restoreFocus) menuToggle.focus();
}

function toggleSleep() {
  isSleeping = !isSleeping;
  sleepButton.textContent = isSleeping ? '☀ 叫醒 Lucky' : '☾ 去睡觉';
  setState(isSleeping ? 'sleep' : 'hello', isSleeping ? 0 : 1500);
  showBubble(isSleeping ? '呼噜……晚安呀 ☾' : '醒啦，喵～');
  if (!isSleeping) chirp();
}

function petLucky() {
  if (isSleeping) {
    toggleSleep();
    return;
  }
  setState('hello', 2300);
  showBubble('喵～送你一颗小心心 ♡');
  chirp();
}

function playLucky() {
  if (isSleeping) toggleSleep();
  setState('play', 2900);
  showBubble('来玩呀！尾巴都摇起来啦 ✦', 2900);
  chirp();
}

function showPet() {
  pet.hidden = false;
  launcher.hidden = true;
  setState(isSleeping ? 'sleep' : 'idle');
  setPosition(hasCustomPosition && Number.isFinite(position.x) ? position.x : defaultX(),
    hasCustomPosition && Number.isFinite(position.y) ? position.y : window.innerHeight - pet.offsetHeight - 16, true);
  character.focus({ preventScroll: true });
  showBubble(isSleeping ? 'Lucky 还在做梦，轻轻点她就会醒。' : 'Lucky 来啦，摸摸我吧！');
}

function hidePet() {
  closeMenu();
  clearTimeout(actionTimer);
  clearTimeout(blinkTimer);
  clearTimeout(blinkEndTimer);
  clearTimeout(bubbleTimer);
  bubble.hidden = true;
  pet.hidden = true;
  launcher.hidden = false;
  launcher.focus({ preventScroll: true });
  save();
}

soundButton.setAttribute('aria-pressed', String(soundEnabled));
soundButton.textContent = soundEnabled ? '♫ 声音：开启' : '♫ 声音：关闭';
pet.hidden = saved.visible === false;
launcher.hidden = !pet.hidden;
preloadSprite('blink');
preloadSprite('sleep');
setState('idle');
setPosition(hasCustomPosition && Number.isFinite(position.x) ? position.x : defaultX(),
  hasCustomPosition && Number.isFinite(position.y) ? position.y : window.innerHeight - pet.offsetHeight - 16);

launcher.addEventListener('click', showPet);
character.addEventListener('pointerenter', () => preloadSprite('blink'));
character.addEventListener('click', () => {
  if (suppressClick) { suppressClick = false; return; }
  petLucky();
});
character.addEventListener('keydown', (event) => {
  const steps = { ArrowLeft: [-20, 0], ArrowRight: [20, 0], ArrowUp: [0, -20], ArrowDown: [0, 20] };
  if (!steps[event.key]) return;
  event.preventDefault();
  const [dx, dy] = steps[event.key];
  hasCustomPosition = true;
  setPosition(position.x + dx, position.y + dy, true);
});
character.addEventListener('pointerdown', (event) => {
  if (event.button !== 0) return;
  activePointer = {
    id: event.pointerId, startX: event.clientX, startY: event.clientY,
    x: position.x, y: position.y, dragged: false
  };
  character.setPointerCapture?.(event.pointerId);
});
character.addEventListener('pointermove', (event) => {
  if (!activePointer || event.pointerId !== activePointer.id) return;
  const dx = event.clientX - activePointer.startX;
  const dy = event.clientY - activePointer.startY;
  if (!activePointer.dragged && Math.hypot(dx, dy) < 7) return;
  activePointer.dragged = true;
  closeMenu();
  pet.classList.add('lucky-pet-dragging');
  setPosition(activePointer.x + dx, activePointer.y + dy);
  event.preventDefault();
});
function finishDrag(event) {
  if (!activePointer || event.pointerId !== activePointer.id) return;
  if (activePointer.dragged) {
    suppressClick = true;
    hasCustomPosition = true;
    setPosition(position.x, position.y, true);
    window.setTimeout(() => { suppressClick = false; }, 500);
  }
  activePointer = null;
  pet.classList.remove('lucky-pet-dragging');
}
character.addEventListener('pointerup', finishDrag);
character.addEventListener('pointercancel', finishDrag);

menuToggle.addEventListener('click', () => {
  menu.hidden = !menu.hidden;
  menuToggle.setAttribute('aria-expanded', String(!menu.hidden));
  if (!menu.hidden) {
    bubble.hidden = true;
    preloadSprite('sleep');
  }
});
menu.addEventListener('click', (event) => {
  const button = event.target.closest('[data-pet-action]');
  if (!button) return;
  const action = button.dataset.petAction;
  if (action === 'pet') petLucky();
  else if (action === 'play') playLucky();
  else if (action === 'sleep') toggleSleep();
  else if (action === 'sound') {
    soundEnabled = !soundEnabled;
    soundButton.setAttribute('aria-pressed', String(soundEnabled));
    soundButton.textContent = soundEnabled ? '♫ 声音：开启' : '♫ 声音：关闭';
    showBubble(soundEnabled ? '轻轻地喵一声 ♪' : '安静陪着你 ♡');
    if (soundEnabled) chirp();
    save();
  } else if (action === 'hide') { hidePet(); return; }
  closeMenu(true);
});
document.addEventListener('pointerdown', (event) => {
  if (!pet.contains(event.target)) closeMenu();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !menu.hidden) closeMenu(true);
});
window.addEventListener('resize', () => {
  if (hasCustomPosition) setPosition(position.x, position.y, true);
  else setPosition(defaultX(), window.innerHeight - (pet.offsetHeight || (window.innerWidth <= 640 ? 143 : 204)) - 16);
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    clearTimeout(blinkTimer);
    clearTimeout(blinkEndTimer);
  } else if (pet.dataset.state !== 'sleep') scheduleBlink();
  else if (!isSleeping) setState('idle');
});
reducedMotion?.addEventListener?.('change', () => setState(isSleeping ? 'sleep' : 'idle'));
