import { notes } from './content.js?v=lucky-pixel-2';

const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia?.('(hover: hover) and (pointer: fine)');
const chapters = [
  { id: 'all', name: '全部片段', subtitle: 'Lucky 的小日子', ids: null },
  { id: 'home', name: '家里的新日常', subtitle: '窗边、书桌与沙发', ids: ['lucky-at-the-night-window','lucky-touching-a-finger-at-keyboard','lucky-reaching-toward-the-desk','lucky-by-the-floral-cushion','lucky-fluffy-back','lucky-peeking-over-the-table','lucky-curled-up'] },
  { id: 'together', name: '相伴时光', subtitle: '怀里与沙发旁的小日子', ids: ['lucky-holding-a-finger','lucky-and-the-blue-feather','lucky-by-the-sofa-cover'] },
  { id: 'window', name: '窗边小家', subtitle: '黄色小窝与窗边一角', ids: ['lucky-in-the-yellow-bed','lucky-in-the-litter-box','lucky-window-corner'] },
  { id: 'first', name: '初见 Lucky', subtitle: '航空箱里的小眼神', ids: ['lucky-in-the-carrier','lucky-looking-up','lucky-looking-up-at-the-carrier-door','lucky-turning-in-the-carrier','lucky-exploring'] },
  { id: 'bird', name: '和小鸟', subtitle: '一位黄绿色的小邻居', ids: ['lucky-watching-the-bird','lucky-and-a-small-neighbor'] },
  { id: 'rest', name: '吃饭与小睡', subtitle: '小脑袋，小爪爪', ids: ['lucky-at-the-bowl','lucky-sleeping-on-the-back','lucky-little-paws','lucky-hiding-the-face'] },
];
const escape = value => String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const number = value => String(value).padStart(2,'0');
const videoCount = notes.filter(note=>note.video).length;
const photoCount = notes.length-videoCount;
let chapter = 'all';
let page = 0;
let opened = !!reduced?.matches;
let introSeen = opened;
let opening = false;
let turning = false;
let timers = new Set();
let observers = new Set();
let mountedRoot;
let openMedia;

function later(fn,ms) {
  const timer = window.setTimeout(()=>{timers.delete(timer);fn();},ms);
  timers.add(timer);
  return timer;
}
function selection() {
  const selected = chapters.find(item=>item.id === chapter);
  return selected.ids ? selected.ids.map(id=>notes.find(note=>note.id === id)).filter(Boolean) : notes;
}
function card(note) {
  const index = notes.indexOf(note);
  const rotation = [-2,1.5,-1,2][index % 4];
  return `<button type="button" class="sticker-card" data-sticker="${index}" style="--rotation:${rotation}deg" aria-label="${note.video?'播放视频':'查看照片'}：${escape(note.title)}">
    <span class="sticker-image"><img src="${escape(note.photo)}" alt="${escape(note.alt)}" width="${note.width}" height="${note.height}" ${note.previewFit === 'contain' ? 'style="object-fit:contain"' : ''} loading="lazy" draggable="false">${note.video ? `<video class="sticker-preview" muted playsinline loop preload="none" data-source="${escape(note.video)}" aria-hidden="true" hidden></video><span class="sticker-media-label">视频 · ${escape(note.duration)}</span>` : '<span class="sticker-media-label">照片</span>'}<span class="sticker-sheen" aria-hidden="true"></span></span>
    <span class="sticker-caption"><span class="sticker-number">${number(index+1)}</span><span>${escape(note.title)}</span></span>
  </button>`;
}
function bookPage(items,side) {
  const selected = chapters.find(item=>item.id === chapter);
  return `<section class="book-page book-page-${side}" aria-label="${side==='left'?'左':'右'}页">
    <div class="paper-heading"><span>${escape(side==='left'?selected.name:'LUCKY / LITTLE MOMENTS')}</span><span>${number(page*2+(side==='left'?1:2))}</span></div>
    ${items.length ? `<div class="sticker-grid">${items.map(card).join('')}</div>` : `<div class="chapter-end"><p class="chapter-end-label">这一页，先写到这里。</p><p>${selection().length} 个小片段，都收好了。</p><button type="button" data-book-action="first">回到第一页</button></div>`}
    <div class="paper-footer"><span>${escape(selected.subtitle)}</span><span>2026</span></div>
  </section>`;
}
function cover() {
  const portrait=notes.find(note=>note.id==='lucky-in-the-carrier');
  return `<div class="cover-shell"><div class="cover-face"><div class="cover-copy">
    <p class="cover-edition">THE LITTLE ALBUM · 2026</p><h2 class="cover-title">Lucky<span>的日常</span></h2><p class="cover-description">有 Lucky 的普通日子。</p>
    <button class="cover-open" type="button" data-book-action="open">翻开相册</button><button class="cover-skip" type="button" data-book-action="skip">直接浏览</button><a class="cover-character-link" href="#/character">认识画里的 Lucky <span aria-hidden="true">↗</span></a>
    <p class="cover-count">${number(notes.length)} 个片段 · ${number(videoCount)} 段视频 · ${number(photoCount)} 张照片</p>
    </div><div class="cover-collage" aria-hidden="true"><div class="cover-photo cover-photo-main"><img src="${portrait.photo}" alt="" width="${portrait.width}" height="${portrait.height}" draggable="false"><span>hello, Lucky.</span></div><div class="cover-photo cover-photo-character"><img src="assets/lucky-pixel-idle.png?v=2" alt="" width="1284" height="1225" draggable="false"><span>像素 Lucky</span></div></div>
    </div></div>`;
}

export function renderAlbum() {
  const items=selection();
  const pages=Math.max(1,Math.ceil(items.length/4));
  page=Math.min(page,pages-1);
  const visible=items.slice(page*4,page*4+4);
  return `<section class="album-experience" aria-label="Lucky 的贴纸相册">
    <div class="album-heading"><div><p class="eyebrow">A LITTLE COLLECTION</p><h1>Lucky 的小相册</h1></div><span class="album-total">${videoCount} 段视频 · ${photoCount} 张照片</span></div>
    <a class="character-teaser" href="#/character"><span class="character-teaser-art"><img src="assets/lucky-pixel-hello.png?v=2" alt="" width="1284" height="1225"></span><span class="character-teaser-copy"><strong>像素 Lucky</strong><span>认识三花小姑娘的像素形象</span></span><span class="character-teaser-arrow" aria-hidden="true">↗</span></a>
    <div class="chapter-tabs" role="group" aria-label="相册章节">${chapters.map((item,index)=>`<button type="button" class="chapter-tab" data-chapter="${item.id}" aria-pressed="${item.id===chapter}"><span class="chapter-index">${number(index)}</span>${escape(item.name)}</button>`).join('')}</div>
    <div class="book-stage ${opened?'is-open':'is-closed'} ${opening?'is-opening':''}" tabindex="0" aria-label="相册第 ${page+1} 页，共 ${pages} 页，使用方向键翻页">
      <div class="book-spread" ${opened?'':'inert aria-hidden="true"'}>${bookPage(visible.slice(0,2),'left')}${bookPage(visible.slice(2),'right')}</div>
      ${opened?'':cover()}
    </div>
    <div class="book-controls"><button type="button" class="cover-toggle" data-book-action="cover" ${opened?'':'hidden'}>看封面</button><div class="page-controls" ${opened?'':'hidden'}><button type="button" data-book-action="previous" ${page===0?'disabled':''}>上一页</button><span class="page-status" role="status" aria-live="polite">${number(page+1)} / ${number(pages)}</span><button type="button" data-book-action="next" ${page===pages-1?'disabled':''}>下一页</button></div><span class="book-hint" ${opened?'':'hidden'}>点开片段，看大图或视频</span></div>
  </section>`;
}

function refresh(focusSelector) {
  if(!mountedRoot?.isConnected)return;
  const root=mountedRoot,callback=openMedia;
  destroyAlbum();
  root.innerHTML=renderAlbum();
  mountAlbum(root,callback);
  if(focusSelector)root.querySelector(focusSelector)?.focus({preventScroll:true});
}
function finishOpening(moveFocus=false) {
  opened=true;opening=false;introSeen=true;
  refresh(moveFocus?`[data-chapter="${chapter}"]`:undefined);
}
function openCover(manual=false,skip=false) {
  if(opened)return;
  introSeen=true;
  if(skip||reduced?.matches){finishOpening(manual);return;}
  if(opening)return;
  opening=true;
  const stage=mountedRoot.querySelector('.book-stage');
  stage.classList.add('is-opening');
  mountedRoot.querySelector('.cover-open')?.setAttribute('aria-busy','true');
  later(()=>{
    const stage=mountedRoot?.querySelector('.book-stage');
    finishOpening(!!stage?.contains(document.activeElement));
  },1450);
}
function turnPage(direction) {
  const max=Math.ceil(selection().length/4)-1;
  if(!opened||turning||page+direction<0||page+direction>max)return;
  mountedRoot.querySelectorAll('.sticker-preview').forEach(video=>video.pause());
  const focusSelector=`[data-book-action="${direction>0?'next':'previous'}"]`;
  if(reduced?.matches){page+=direction;refresh('.book-stage');return;}
  turning=true;
  const stage=mountedRoot.querySelector('.book-stage');
  stage.classList.add('is-turning',direction>0?'turn-forward':'turn-back');
  const source=stage.querySelector(direction>0?'.book-page-right':'.book-page-left');
  const leaf=document.createElement('div');leaf.className='turning-leaf';leaf.setAttribute('aria-hidden','true');
  leaf.innerHTML=source.outerHTML;
  leaf.querySelectorAll('video').forEach(video=>video.remove());
  leaf.querySelectorAll('button').forEach(button=>{button.disabled=true;button.tabIndex=-1;});
  stage.append(leaf);
  mountedRoot.querySelectorAll('.page-controls button').forEach(button=>{button.disabled=true;});
  later(()=>{page+=direction;turning=false;refresh(focusSelector);const target=mountedRoot.querySelector(focusSelector);if(target?.disabled)mountedRoot.querySelector('.book-stage').focus({preventScroll:true});},650);
}
function stopPreview(card) {
  card.dataset.hovering='false';
  const video=card.querySelector('video');
  if(video){video.pause();video.hidden=true;video.removeAttribute('src');video.load();}
  card.style.removeProperty('--tilt-x');card.style.removeProperty('--tilt-y');card.style.removeProperty('--shine-x');card.style.removeProperty('--shine-y');
}

export function mountAlbum(root,onMedia) {
  mountedRoot=root;openMedia=onMedia;
  root.querySelectorAll('[data-sticker]').forEach(card=>{
    card.addEventListener('click',()=>{stopPreview(card);onMedia(Number(card.dataset.sticker),card);});
    if(!finePointer?.matches||reduced?.matches)return;
    card.addEventListener('pointermove',event=>{
      if(reduced?.matches)return;
      const bounds=card.getBoundingClientRect();if(!bounds.width||!bounds.height)return;
      const x=(event.clientX-bounds.left)/bounds.width,y=(event.clientY-bounds.top)/bounds.height;
      card.style.setProperty('--tilt-x',`${(0.5-y)*8}deg`);card.style.setProperty('--tilt-y',`${(x-0.5)*10}deg`);
      card.style.setProperty('--shine-x',`${x*100}%`);card.style.setProperty('--shine-y',`${y*100}%`);
    });
    card.addEventListener('pointerenter',()=>{
      if(reduced?.matches||document.hidden)return;
      card.dataset.hovering='true';const video=card.querySelector('video');
      if(!video||window.navigator.connection?.saveData)return;
      later(()=>{if(card.dataset.hovering!=='true'||!card.isConnected||reduced?.matches||document.hidden)return;video.muted=true;video.src=video.dataset.source;
        video.play()?.then(()=>{if(card.dataset.hovering==='true'&&card.isConnected)video.hidden=false;else stopPreview(card);}).catch(()=>{video.hidden=true;});
      },250);
    });
    card.addEventListener('pointerleave',()=>stopPreview(card));
  });
  if(window.IntersectionObserver){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)stopPreview(entry.target);}));
    root.querySelectorAll('[data-sticker]').forEach(card=>observer.observe(card));
    observers.add(observer);
  }
  root.querySelectorAll('[data-chapter]').forEach(button=>button.addEventListener('click',()=>{
    if(button.dataset.chapter===chapter && opened)return;
    chapter=button.dataset.chapter;page=0;opened=true;opening=false;turning=false;introSeen=true;
    refresh(`[data-chapter="${chapter}"]`);
  }));
  root.querySelectorAll('[data-book-action]').forEach(button=>button.addEventListener('click',()=>{
    const action=button.dataset.bookAction;
    if(action==='open'||action==='skip')openCover(true,action==='skip');
    else if(action==='next'||action==='previous')turnPage(action==='next'?1:-1);
    else if(action==='first'){page=0;refresh('.book-stage');}
    else if(action==='cover'){opened=false;opening=false;turning=false;introSeen=true;refresh('[data-book-action="open"]');}
  }));
  const stage=root.querySelector('.book-stage');
  stage.addEventListener('keydown',event=>{
    if(event.key==='Escape' && !opened){event.preventDefault();finishOpening(true);return;}
    if(event.target.closest('video'))return;
    if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();turnPage(event.key==='ArrowRight'?1:-1);}
  });
  let touch;
  stage.addEventListener('touchstart',event=>{if(event.touches.length===1&&!event.target.closest('video'))touch={x:event.touches[0].clientX,y:event.touches[0].clientY};},{passive:true});
  stage.addEventListener('touchend',event=>{if(!touch)return;const point=event.changedTouches[0],dx=point.clientX-touch.x,dy=point.clientY-touch.y;touch=null;if(Math.abs(dx)>65&&Math.abs(dy)<60)turnPage(dx<0?1:-1);},{passive:true});
  if(!opened&&!introSeen){introSeen=true;later(()=>openCover(),1600);}
}
export function destroyAlbum() {
  timers.forEach(timer=>window.clearTimeout(timer));timers.clear();
  observers.forEach(observer=>observer.disconnect());observers.clear();
  mountedRoot?.querySelectorAll('.sticker-preview').forEach(video=>{video.pause();video.removeAttribute('src');video.load();});
  mountedRoot=undefined;openMedia=undefined;turning=false;opening=false;
}
document.addEventListener('visibilitychange',()=>{
  if(document.hidden)mountedRoot?.querySelectorAll('[data-sticker]').forEach(stopPreview);
});
reduced?.addEventListener('change',()=>{
  if(!reduced.matches||!mountedRoot?.isConnected)return;
  mountedRoot.querySelectorAll('[data-sticker]').forEach(stopPreview);
  if(!opened)finishOpening(!!mountedRoot.querySelector('.book-stage')?.contains(document.activeElement));
});
