const config = window.ELIN_CONFIG || {};
// 외부 이미지 주소는 config.js의 imageBaseUrl에서 수정합니다.
// 외부 이미지가 열리지 않으면 동봉한 이미지로 돌아갑니다.
if (config.useExternalImages && config.imageBaseUrl) {
  document.querySelectorAll('img[src^="assets/"]').forEach(image => {
    const localSource = image.getAttribute('src');
    image.addEventListener('error', () => { image.src = localSource; }, {once: true});
    const baseUrl = config.imageBaseUrl.replace(/\/+$/, '') + '/';
    image.src = baseUrl + localSource.split('/').pop();
  });
}
const panels = Array.from(document.querySelectorAll('[data-step]'));
const comic = document.getElementById('comic');
const ending = document.getElementById('ending');
const invitation = document.getElementById('invitation');
const guide = document.getElementById('guide');
const chat = document.getElementById('chat');
// 버튼 문구는 config.js의 chatButtonText에서 수정합니다.
chat.textContent = config.chatButtonText || '채팅하러 가기';
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let step = -1;
let lastAdvance = -Infinity;
let touchStart = null;
document.querySelector('#whisper p').textContent = config.finalDialogue || '주인님, 일어날 시간입니다.';
try {
  const url = new URL(config.chatUrl);
  if (['https:', 'http:'].includes(url.protocol)) {
    chat.href = url.href;
    chat.removeAttribute('aria-disabled');
    document.getElementById('link-status').hidden = true;
  }
} catch { /* A chat destination can be supplied in config.js. */ }
function advance() {
  const now = performance.now();
  if (now - lastAdvance < 350 || step >= panels.length + 1) return;
  lastAdvance = now;
  step += 1;
  if (step < panels.length) {
    const panel = panels[step];
    panel.classList.add('revealed');
    requestAnimationFrame(() => {
      const rect = panel.getBoundingClientRect();
      if (rect.bottom > innerHeight - 85) {
        window.scrollTo({top: scrollY + rect.bottom - innerHeight + 95, behavior: reduceMotion ? 'instant' : 'smooth'});
      }
    });
    return;
  }
  if (step === panels.length) {
    comic.hidden = true;
    ending.hidden = false;
    document.body.classList.add('ending');
    window.scrollTo(0, 0);
    return;
  }
  ending.classList.add('final');
  document.body.classList.add('final');
  invitation.hidden = false;
  guide.hidden = true;
}
document.addEventListener('keydown', event => {
  if (event.key !== 'Enter' || event.repeat || event.target.closest('button,a,input,textarea')) return;
  event.preventDefault();
  advance();
});
document.addEventListener('pointerdown', event => { touchStart = {x:event.clientX,y:event.clientY}; });
document.addEventListener('click', event => {
  if (event.target.closest('button,a')) return;
  if (touchStart && Math.hypot(event.clientX-touchStart.x,event.clientY-touchStart.y)>15) return;
  advance();
});
document.getElementById('replay').addEventListener('click', () => {
  step = -1;
  lastAdvance = -Infinity;
  panels.forEach(panel => panel.classList.remove('revealed'));
  comic.hidden = false;
  ending.hidden = true;
  ending.classList.remove('final');
  document.body.classList.remove('ending','final');
  invitation.hidden = true;
  guide.hidden = false;
  window.scrollTo(0,0);
  advance();
});
advance();
