import { setupMusicDisplay } from './music-display';
import { setupFloatingPanelDrag } from './music-drag';
import {createMotionScope} from './content-motion';

export function setupStudySpace(audio: HTMLAudioElement, shell: HTMLElement) {
  const controller=new AbortController(),motion=createMotionScope(matchMedia('(prefers-reduced-motion: reduce)'),controller.signal);
  window.addEventListener('pagehide',event=>{if(!event.persisted)controller.abort();});
  const el = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
  const key = 'sakura-study-session';
  let minutes = 25, remaining = minutes * 60000, endAt = 0, completed = false;
  let rounds = 0, roundDate = new Date().toLocaleDateString('en-CA');
  try {
    const saved = JSON.parse(sessionStorage.getItem(key) || 'null');
    if (saved && Number.isInteger(saved.minutes) && saved.minutes >= 1 && saved.minutes <= 180 && Number.isFinite(saved.remaining) && Number.isFinite(saved.endAt)) {
      minutes = saved.minutes; remaining = Math.max(0, Math.min(minutes * 60000, saved.remaining)); endAt = Math.max(0,saved.endAt); completed = Boolean(saved.completed);
      if (saved.roundDate === roundDate) rounds = Math.max(0, Math.floor(saved.rounds) || 0);
    }
  } catch {}
  const dialog = el<HTMLDialogElement>('focus-dialog');
  const start = el<HTMLButtonElement>('focus-start');
  const custom = el<HTMLInputElement>('focus-custom-minutes');
  const customForm = el<HTMLFormElement>('focus-custom-form');
  const display = setupMusicDisplay(shell);
  function celebrate(){
    const anchor=el('study-focus');
    if(!motion.enabled()||!document.body.classList.contains('music-mode')||!anchor.getClientRects().length||document.documentElement.dataset.musicAmbience==='off')return;
    for(let i=0;i<6;i++){
      const petal=document.createElement('i');petal.className='music-completion-petal';petal.setAttribute('aria-hidden','true');anchor.append(petal);
      const animation=motion.play(petal,[{opacity:0,transform:`translate(0,0) rotate(${i*45}deg)`},{opacity:.8,offset:.2},{opacity:0,transform:`translate(${(i-2.5)*20}px,${-35-i%3*12}px) rotate(${i*45+90}deg)`}],{duration:650,delay:i*20});
      if(animation)animation.finished.then(()=>petal.remove(),()=>petal.remove());else petal.remove();
    }
  }
  setupFloatingPanelDrag(el('study-focus'),[el<HTMLButtonElement>('focus-drag'),el<HTMLButtonElement>('focus-time-drag')],{key:'sakura-study-focus-position',resetIds:['focus-position-reset','focus-position-reset-dialog']});
  custom.value = String(minutes);
  function save() { try { sessionStorage.setItem(key, JSON.stringify({minutes,remaining,endAt,completed,rounds,roundDate})); } catch {} }
  function render() {
    const now = new Date();
    display.renderClock(now);
    const today = now.toLocaleDateString('en-CA');
    if (today !== roundDate) { rounds = 0; roundDate = today; save(); }
    if (endAt) {
      remaining = Math.max(0,endAt-Date.now());
      if (!remaining) { endAt = 0; completed = true; rounds++; save(); el('focus-announcement').textContent = `已完成 ${minutes} 分钟专注，休息一下吧。音乐继续播放。`;celebrate(); }
    }
    const seconds = Math.ceil(remaining/1000);
    el('focus-remaining').textContent = `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
    el('focus-state').textContent = completed ? '完成了，休息一下' : endAt ? '专注进行中' : remaining < minutes*60000 ? '已暂停' : '准备专注';
    const focusToggle=el('room-focus-toggle');
    focusToggle.title=`${focusToggle.getAttribute('aria-expanded')==='true'?'收起':'展开'}专注计时 · ${el('focus-state').textContent}`;
    const label = endAt ? '暂停专注' : completed ? '再开始一轮专注' : remaining < minutes*60000 ? '继续专注' : '开始专注';
    start.setAttribute('aria-label',label); start.title = label;
    el('focus-dialog-start').textContent = label;
    start.querySelector<HTMLElement>('[data-focus-play]')!.hidden = Boolean(endAt);
    start.querySelector<HTMLElement>('[data-focus-pause]')!.hidden = !endAt;
    const progress = Math.min(100,Math.max(0,(1-remaining/(minutes*60000))*100));
    el('focus-ring').style.setProperty('--focus-progress',String(progress)); el('focus-ring').setAttribute('aria-valuenow',String(Math.round(progress)));
    el('focus-duration-label').textContent = `${minutes} 分钟`;
    el('focus-duration-hint').textContent = endAt ? '暂停计时后可以切换时长' : '更改时长会重置本轮，点击开始后计时';
    dialog.querySelectorAll<HTMLButtonElement>('[data-focus-duration]').forEach(button=>{button.disabled=Boolean(endAt);button.setAttribute('aria-pressed',String(Number(button.dataset.focusDuration)===minutes));});
    custom.disabled = Boolean(endAt);
    customForm.querySelector<HTMLButtonElement>('button')!.disabled = Boolean(endAt);
    el('focus-summary').textContent = rounds ? `今天已完成 ${rounds} 轮专注` : '从一小段专注开始';
    shell.dataset.focusing = String(Boolean(endAt));
  }
  function toggleTimer(){
    if (endAt) { remaining=Math.max(0,endAt-Date.now()); endAt=0; }
    else { if (completed || !remaining) { remaining=minutes*60000; completed=false; } endAt=Date.now()+remaining; }
    save();render();
  }
  start.addEventListener('click',toggleTimer);
  el('focus-dialog-start').addEventListener('click',toggleTimer);
  function setDuration(value:number){
    if(endAt||!Number.isInteger(value)||value<1||value>180)return;
    minutes=value;remaining=minutes*60000;completed=false;custom.value=String(minutes);save();render();
    el('focus-announcement').textContent=`本轮专注已设为 ${minutes} 分钟`;
  }
  dialog.querySelectorAll<HTMLButtonElement>('[data-focus-duration]').forEach(button=>button.addEventListener('click',()=>{
    setDuration(Number(button.dataset.focusDuration));
  }));
  customForm.addEventListener('submit',event=>{event.preventDefault();if(custom.reportValidity())setDuration(custom.valueAsNumber);});
  el('focus-reset').addEventListener('click',()=>{endAt=0;remaining=minutes*60000;completed=false;save();render();el('focus-announcement').textContent='本轮专注计时已重置';});
  shell.querySelectorAll<HTMLElement>('[data-open-focus]').forEach(button=>button.addEventListener('click',()=>{render();dialog.showModal();}));
  const syncSound=()=>{const playing=document.documentElement.dataset.musicPlaying==='true',waiting=!audio.paused&&!playing&&!audio.error;el('room-sound-label').textContent=playing?'音乐正在轻轻流动':waiting?'正在准备声音…':'让音乐陪你一会儿';el('room-sound-label').parentElement!.setAttribute('aria-label',playing?'音乐正在播放':waiting?'音乐正在缓冲':'音乐已暂停');};
  audio.addEventListener('play',syncSound);audio.addEventListener('pause',syncSound);
  document.addEventListener('sakura:music-state',syncSound);
  document.addEventListener('astro:page-load',render);document.addEventListener('visibilitychange',render);
  window.setInterval(render,1000);render();syncSound();
}
