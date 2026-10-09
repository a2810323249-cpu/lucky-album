import { site, notes } from './content.js';
import { renderAlbum, mountAlbum, destroyAlbum } from './album.js?v=lucky-character-1';

const main = document.querySelector('main');
const dialog = document.querySelector('.lightbox');
const image = dialog.querySelector('img');
const video = dialog.querySelector('video');
let activePhoto = 0;
let lastPhotoButton;
let lastRoute = '';
const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const dateText = (date) => date.replaceAll('-', '.');
const duration = (note) => note.video ? `视频 · ${escape(note.duration)}` : '照片';
const albumCount = `${String(notes.filter(note => note.video).length).padStart(2,'0')} 段视频 · ${String(notes.filter(note => !note.video).length).padStart(2,'0')} 张照片`;

function renderCharacter() {
  return `<section class="character-view" aria-labelledby="character-title">
    <div class="character-hero"><div class="character-copy"><p class="character-kicker">LUCKY / CHARACTER 01</p><h1 id="character-title">如果 Lucky<br>走进绘本</h1><p class="character-lead">真实的 Lucky 有一身蓬松的奶白色长毛，头顶和尾巴沾着一点银灰。这里是根据它的照片想象出的另一个模样。</p><a class="character-back" href="#/">回到相册 <span aria-hidden="true">↗</span></a></div><figure class="character-portrait"><img src="assets/lucky-character.png" alt="Lucky 的虚拟形象：白灰色短发、猫耳、蓝灰色眼睛，穿着森林绿背带裤的猫耳角色" width="1024" height="1536"><figcaption>Lucky 的虚拟形象 · 根据真实照片创作</figcaption></figure></div>
    <div class="character-origin"><figure><img src="assets/lucky-photo-03.jpg" alt="真实的 Lucky 仰面躺着，举着毛茸茸的爪子" width="719" height="1280" loading="lazy"><figcaption>现实里的 Lucky</figcaption></figure><div class="character-origin-copy"><p class="character-kicker">A LITTLE BIT OF LUCKY</p><h2>一眼就认得出你</h2><p>灰色的小发梢、圆圆的眼睛、粉色鼻子和蓬松的尾巴，都来自 Lucky 自己。奶油色衬衫与绿色背带裤，是它在绘本里的新衣服。</p><a href="#/notes">去看 Lucky 的真实日常 <span aria-hidden="true">↗</span></a></div></div>
    <div class="character-stickers"><div class="character-stickers-heading"><p class="character-kicker">LUCKY / LITTLE EXPRESSIONS</p><h2>Lucky 的小表情</h2><p>挥挥手，或是把脸藏进爪爪里。</p></div><div class="character-sticker-grid"><figure><img src="assets/lucky-sticker-hello.png" alt="虚拟 Lucky 开开心心地挥手" loading="lazy"><figcaption>你好呀</figcaption></figure><figure><img src="assets/lucky-sticker-sleepy.png" alt="虚拟 Lucky 害羞地遮住脸，困困地眯起眼睛" loading="lazy"><figcaption>困困啦</figcaption></figure></div></div>
  </section>`;
}

document.querySelector('.skip-link').addEventListener('click', event => {
  event.preventDefault();
  main.focus();
  main.scrollIntoView({block:'start'});
});
document.querySelector('.site-title').firstChild.textContent = site.title;
document.querySelector('.site-description').textContent = site.description;
document.querySelector('.site-title').setAttribute('aria-label', `${site.title}，首页`);
document.querySelector('.site-footer > p').textContent = `© 2026 · ${site.title}`;

function thumbnail(note, index, album = false) {
  return `<span class="media-thumbnail ${album ? 'album-thumbnail' : ''}"><img class="${album ? '' : 'post-thumbnail'}" src="${escape(note.photo)}" alt="${escape(note.alt)}" width="${album ? 400 : 144}" height="${album ? 400 : 144}" ${note.previewFit === 'contain' ? 'style="object-fit:contain"' : ''} ${index > 1 ? 'loading="lazy"' : ''}>${note.video ? `<span class="video-badge">视频 ${escape(note.duration)}</span>` : ''}</span>`;
}
function pauseInlineVideos() {
  main.querySelectorAll('video').forEach(element => element.pause());
}
function render() {
  if (dialog.open) closePhoto();
  pauseInlineVideos();
  destroyAlbum();
  const route = location.hash === '#main' ? '/' : (location.hash.slice(1) || '/');
  document.querySelectorAll('[data-nav]').forEach(link => link.removeAttribute('aria-current'));
  document.querySelector(`[data-nav="${route === '/' || route === '/photos' ? 'photos' : route === '/character' ? 'character' : 'notes'}"]`).setAttribute('aria-current', 'page');
  if (route === '/' || route === '/photos') {
    document.title = `${site.title} · 贴纸小相册`;
    main.innerHTML = renderAlbum();
    mountAlbum(main,openPhoto);
  } else if (route === '/character') {
    document.title = `Lucky 的虚拟形象 · ${site.title}`;
    main.innerHTML = renderCharacter();
  } else if (route === '/notes') {
    document.title = `${site.title} · 猫咪小相册`;
    main.innerHTML = `<section class="journal-view"><div class="section-heading"><h1>最近的日记</h1><span>${albumCount}</span></div><div class="post-list">${notes.map((note,index) => `<article class="post-item"><a class="post-link" href="#/note/${escape(note.id)}"><div class="post-info"><time class="post-date" datetime="${note.date}">收录于 ${dateText(note.date)}</time><h2 class="post-title">${escape(note.title)}</h2><p class="post-description">${escape(note.description)}</p></div>${thumbnail(note,index)}</a></article>`).join('')}</div></section>`;
  } else {
    const note = notes.find(n => route === `/note/${n.id}`);
    if (note) {
      document.title = `${note.title} · ${site.title}`;
      const media = note.video
        ? `<video class="note-video" controls playsinline preload="none" poster="${escape(note.photo)}" width="${note.width}" height="${note.height}" aria-label="${escape(note.alt)}"><source src="${escape(note.video)}" type="video/mp4">无法播放视频，<a href="${escape(note.video)}">打开视频文件</a>。</video><button class="expand-video" data-photo="${notes.indexOf(note)}" type="button">放大观看</button>`
        : `<button type="button" class="photo-button" data-photo="${notes.indexOf(note)}" aria-label="查看大图：${escape(note.caption)}"><img class="note-photo" src="${escape(note.photo)}" alt="${escape(note.alt)}"></button>`;
      main.innerHTML = `<article class="note-view"><a class="back-link" href="#/notes">返回日记</a><h1 class="note-title">${escape(note.title)}</h1><div class="note-meta"><time datetime="${note.date}">收录于 ${dateText(note.date)}</time><span>${duration(note)}</span></div><div class="note-body">${note.paragraphs.map(p => `<p>${escape(p)}</p>`).join('')}</div><figure class="note-photo-block">${media}<figcaption class="photo-caption">${escape(note.caption)}</figcaption></figure><div class="note-end"><a class="back-link" href="#/notes">返回所有日记</a></div></article>`;
    } else {
      document.title = `未找到日记 · ${site.title}`;
      main.innerHTML = '<h1 class="note-title">这篇日记还没有写。</h1><a class="back-link" href="#/notes">返回日记</a>';
    }
  }
  if (lastRoute && route !== lastRoute) { window.scrollTo(0,0); main.focus({preventScroll:true}); }
  lastRoute = route;
}

function updatePhoto() {
  const note = notes[activePhoto];
  video.pause();
  video.removeAttribute('src');
  video.hidden = !note.video;
  image.hidden = !!note.video;
  if (note.video) {
    video.poster = note.photo;
    video.src = note.video;
    video.setAttribute('aria-label', note.alt);
    image.removeAttribute('src');
  } else {
    image.src = note.photo;
    image.alt = note.alt;
  }
  video.load();
  dialog.querySelector('.lightbox-caption').textContent = note.caption;
  document.querySelector('#media-note-link').href = `#/note/${note.id}`;
  document.querySelector('#photo-position').textContent = `${activePhoto + 1} / ${notes.length}`;
  document.querySelector('#previous-photo').disabled = activePhoto === 0;
  document.querySelector('#next-photo').disabled = activePhoto === notes.length - 1;
}
function openPhoto(index,button) {
  pauseInlineVideos();
  activePhoto = index;
  lastPhotoButton = button;
  updatePhoto();
  dialog.showModal();
  document.documentElement.classList.add('modal-open');
}
function closePhoto() {
  video.pause();
  video.removeAttribute('src');
  video.load();
  dialog.close();
  document.documentElement.classList.remove('modal-open');
  if (lastPhotoButton?.isConnected) lastPhotoButton.focus({preventScroll:true});
}
main.addEventListener('click', event => {
  const button = event.target.closest('[data-photo]');
  if (button) openPhoto(Number(button.dataset.photo),button);
});
dialog.querySelector('.close-button').addEventListener('click',closePhoto);
document.querySelector('#media-note-link').addEventListener('click',closePhoto);
dialog.addEventListener('cancel', event => { event.preventDefault(); closePhoto(); });
dialog.addEventListener('click', event => { if (event.target === dialog) closePhoto(); });
document.querySelector('#previous-photo').addEventListener('click', () => { if(activePhoto > 0) { activePhoto--; updatePhoto(); } });
document.querySelector('#next-photo').addEventListener('click', () => { if(activePhoto < notes.length - 1) { activePhoto++; updatePhoto(); } });
dialog.addEventListener('keydown', event => {
  // Native video controls use arrows for seeking and volume.
  if(event.target.closest('video')) return;
  if(event.key === 'ArrowLeft' && activePhoto > 0) {event.preventDefault(); activePhoto--;updatePhoto();}
  if(event.key === 'ArrowRight' && activePhoto < notes.length - 1) {event.preventDefault(); activePhoto++;updatePhoto();}
});
window.addEventListener('hashchange',render);
render();
