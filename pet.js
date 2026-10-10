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

// These shapes sit inside the 1329 × 1183 illustration. The full idle image
// stays opaque beneath them; animation never cuts holes through Lucky.
const ART = Object.freeze({
  earLeft: 'M 314 319 Q 318 228 347 192 Q 375 194 421 262 L 432 335 Q 387 363 337 347 Z',
  earRight: 'M 680 319 Q 696 215 732 169 Q 768 204 789 291 L 778 347 Q 734 360 680 319 Z',
  chest: 'M 443 744 Q 461 679 569 654 Q 691 647 747 711 Q 781 785 747 859 Q 674 903 531 880 Q 454 857 443 744 Z',
  pawLeft: 'M 432 984 Q 475 950 536 977 Q 558 1020 547 1084 Q 501 1103 448 1081 Q 424 1040 432 984 Z',
  pawRight: 'M 590 978 Q 641 946 704 974 Q 735 1018 717 1083 Q 665 1104 609 1082 Q 587 1047 590 978 Z',
  tail: 'M 954 452 Q 1012 392 1090 400 Q 1167 412 1188 482 Q 1194 554 1153 648 Q 1097 674 1036 632 Q 987 585 954 452 Z',
  eyeLeft: 'M 375 420 Q 408 373 483 374 Q 548 383 559 450 Q 554 518 483 526 Q 408 520 375 471 Z',
  eyeRight: 'M 595 413 Q 630 363 697 370 Q 767 385 773 449 Q 760 515 691 521 Q 621 514 595 471 Z'
});
const partClip = (name) => `<clipPath id="lucky-${name}"><path d="${ART[name]}"/></clipPath>`;
const partImage = (name, className, src = SPRITES.idle) =>
  `<g class="${className}" clip-path="url(#lucky-${name})"><image href="${src}" width="1329" height="1183"/></g>`;
const rigMarkup = `<svg class="lucky-pet-rig" viewBox="0 0 1329 1183" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <defs>
    ${['earLeft', 'earRight', 'chest', 'pawLeft', 'pawRight', 'tail', 'eyeLeft', 'eyeRight'].map(partClip).join('')}
  </defs>
  <image class="lucky-pet-base" href="${SPRITES.idle}" width="1329" height="1183"/>
  ${partImage('tail', 'lucky-pet-tail')}
  ${partImage('earLeft', 'lucky-pet-ear-left')}
  ${partImage('earRight', 'lucky-pet-ear-right')}
  ${partImage('chest', 'lucky-pet-chest')}
  ${partImage('pawLeft', 'lucky-pet-paw-left')}
  ${partImage('pawRight', 'lucky-pet-paw-right')}
  ${partImage('eyeLeft', 'lucky-pet-blink', SPRITES.blink)}
  ${partImage('eyeRight', 'lucky-pet-blink', SPRITES.blink)}
</svg>`;
let saved = {};
try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { /* Storage can be unavailable. */ }

const pet = document.createElement('aside');
pet.className = 'lucky-pet';
pet.setAttribute('aria-label', 'Lucky 网页桌宠，一只奶白色、灰杏色斑块和蓬松长尾巴的三花小猫');
pet.innerHTML = `<div class="lucky-pet-bubble" aria-hidden="true" hidden></div>
  <button class="lucky-pet-character" type="button" aria-label="摸摸 Lucky；拖动或使用方向键可移动桌宠" aria-describedby="lucky-pet-help">
    ${rigMarkup}
    <img class="lucky-pet-pose" src="${SPRITES.sleep}" width="1329" height="1183" alt="" aria-hidden="true" draggable="false">
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
    }, 240);
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
