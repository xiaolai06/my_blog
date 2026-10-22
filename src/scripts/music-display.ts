import {cancelContentMotion,createMotionScope} from './content-motion';
type Widget = 'player' | 'clock' | 'focus';
type DisplayPreferences = {
  player: boolean; clock: boolean; focus: boolean; ambience: boolean; date: boolean; seconds: boolean;
  format: '12' | '24'; size: 'small' | 'normal' | 'large'; position: 'left' | 'center' | 'lower-left';
};

export function setupMusicDisplay(shell: HTMLElement) {
  const el = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
  const defaults: DisplayPreferences = { player:false, clock:true, focus:false, ambience:true, date:true, seconds:true, format:'24', size:'normal', position:'left' };
  const preferences = { ...defaults };
  const key = 'sakura-music-display';
  try {
    const saved = JSON.parse(localStorage.getItem(key) || 'null');
    if (saved) {
      for (const name of ['clock','ambience','date','seconds'] as const) if (typeof saved[name] === 'boolean') preferences[name] = saved[name];
      if(saved.version===2) for(const name of ['player','focus'] as const) if(typeof saved[name]==='boolean') preferences[name]=saved[name];
      if (['12','24'].includes(saved.format)) preferences.format = saved.format;
      if (['small','normal','large'].includes(saved.size)) preferences.size = saved.size;
      if (['left','center','lower-left'].includes(saved.position)) preferences.position = saved.position;
    } else {
      preferences.clock = localStorage.getItem('sakura-study-clock') !== 'off';
      preferences.ambience = localStorage.getItem('sakura-study-ambience') !== 'off';
    }
    sessionStorage.removeItem('sakura-music-wallpaper-only');
  } catch {}
  const widgets: Record<Widget,HTMLElement> = {player:el('music-player'),clock:el('study-clock'),focus:el('study-focus')};
  const controller=new AbortController(),motion=createMotionScope(matchMedia('(prefers-reduced-motion: reduce)'),controller.signal);
  const closing=new Set<Widget>(),revisions:Record<Widget,number>={player:0,clock:0,focus:0};
  window.addEventListener('pagehide',event=>{if(!event.persisted)controller.abort();});
  const dialog = el<HTMLDialogElement>('focus-dialog');
  const toggles = {player:el<HTMLButtonElement>('room-music-toggle'),focus:el<HTMLButtonElement>('room-focus-toggle')};
  function save() { try { localStorage.setItem(key,JSON.stringify({...preferences,version:2})); } catch {} }
  function renderClock(now = new Date()) {
    const hours = now.getHours();
    const clock = el<HTMLTimeElement>('room-clock');
    const text = `${String(preferences.format === '12' ? hours % 12 || 12 : hours).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    const main = el('clock-hours-minutes');
    if (main.textContent !== text) main.textContent = text;
    const seconds = el('clock-seconds');
    const secondsText = `:${String(now.getSeconds()).padStart(2,'0')}`;
    seconds.hidden = !preferences.seconds;
    if (preferences.seconds && seconds.textContent !== secondsText) seconds.textContent = secondsText;
    clock.dateTime = now.toISOString();
    const period = el('clock-period');
    period.hidden = preferences.format !== '12';
    period.textContent = hours < 12 ? '上午' : '下午';
    const date = el('room-date');
    const dateText = new Intl.DateTimeFormat('zh-CN',{month:'long',day:'numeric',weekday:'long'}).format(now);
    if (date.textContent !== dateText) date.textContent = dateText;
    date.hidden = !preferences.date;
    el('clock-settings-button').setAttribute('aria-label',`当前时间 ${preferences.format==='12' ? period.textContent : ''}${text}${preferences.seconds ? secondsText : ''}，调整时钟与专注设置`);
  }
  function apply() {
    for (const name of ['player','clock','focus'] as const) {
      const expanded = preferences[name];
      widgets[name].dataset.widgetMinimized = String(!expanded&&!closing.has(name));
      const restore = widgets[name].querySelector<HTMLButtonElement>('[data-show-widget]');
      if(restore){
        restore.hidden = expanded;
        restore.setAttribute('aria-label','展开时钟');
        restore.title = '展开时钟';
        restore.setAttribute('aria-expanded',String(expanded));
        restore.setAttribute('aria-controls',widgets[name].id);
      }
      el<HTMLInputElement>(`${name}-visible`).checked = expanded;
      widgets[name].querySelectorAll<HTMLButtonElement>('[data-minimize-widget]').forEach(button=>button.setAttribute('aria-expanded',String(expanded)));
      if(name!=='clock'){
        const label = `${expanded?'收起':'展开'}${name==='player'?'音乐播放器':'专注计时'}`;
        toggles[name].setAttribute('aria-expanded',String(expanded));
        toggles[name].setAttribute('aria-label',label);
        toggles[name].title = label;
      }
    }
    el('panel-toggle').setAttribute('aria-expanded',String(preferences.player));
    el<HTMLInputElement>('ambience-visible').checked = preferences.ambience;
    el<HTMLInputElement>('clock-date-visible').checked = preferences.date;
    el<HTMLInputElement>('clock-seconds-visible').checked = preferences.seconds;
    el<HTMLSelectElement>('clock-format').value = preferences.format;
    el<HTMLSelectElement>('clock-size').value = preferences.size;
    el<HTMLSelectElement>('clock-position').value = preferences.position;
    shell.dataset.clockSize = preferences.size;
    shell.dataset.clockPosition = preferences.position;
    delete shell.dataset.wallpaperOnly;
    document.documentElement.dataset.musicAmbience = preferences.ambience ? 'on' : 'off';
    renderClock();
  }
  function setWidget(name: Widget, expanded: boolean, source?:HTMLElement) {
    const widget=widgets[name],token=++revisions[name],visible=!!widget.getClientRects().length,style=getComputedStyle(widget);
    const from={opacity:visible?style.opacity:'0',translate:visible?style.translate:'0 8px'};
    cancelContentMotion(widget);
    if (!expanded) widgets[name].querySelectorAll<HTMLDetailsElement>('details[open]').forEach(details=>details.open=false);
    if(!expanded&&name!=='clock'&&visible&&motion.enabled())closing.add(name);else closing.delete(name);
    preferences[name] = expanded; save(); apply();
    widget.inert=closing.has(name);
    const animation=name==='clock'&&!expanded?undefined:motion.play(widget,[from,{opacity:expanded?1:0,translate:expanded?'0 0':'0 6px'}],{duration:expanded?220:150});
    const settle=()=>{if(revisions[name]!==token)return;closing.delete(name);widget.inert=false;apply();};
    if(animation)animation.finished.then(settle,settle);else settle();
    if (!dialog.open) {
      const selector = expanded ? '[data-minimize-widget], #clock-settings-button' : '[data-show-widget]';
      const target = source?.getClientRects().length ? source : name!=='clock' ? toggles[name] : Array.from(widgets[name].querySelectorAll<HTMLButtonElement>(selector)).find(button=>button.getClientRects().length>0);
      target?.focus({preventScroll:true});
    }
  }
  shell.querySelectorAll<HTMLButtonElement>('[data-minimize-widget]').forEach(button => button.addEventListener('click',()=>setWidget(button.dataset.minimizeWidget as Widget,false)));
  shell.querySelectorAll<HTMLButtonElement>('[data-show-widget]').forEach(button => button.addEventListener('click',()=>setWidget(button.dataset.showWidget as Widget,true)));
  shell.querySelectorAll<HTMLButtonElement>('[data-toggle-widget]').forEach(button=>button.addEventListener('click',()=>{const name=button.dataset.toggleWidget as 'player'|'focus';setWidget(name,!preferences[name],button);}));
  for (const name of ['player','clock','focus'] as const) el<HTMLInputElement>(`${name}-visible`).addEventListener('change',event=>setWidget(name,(event.target as HTMLInputElement).checked));
  for (const [id,name] of [['ambience-visible','ambience'],['clock-date-visible','date'],['clock-seconds-visible','seconds']] as const) el<HTMLInputElement>(id).addEventListener('change',event=>{preferences[name]=(event.target as HTMLInputElement).checked;save();apply();});
  for (const [id,name] of [['clock-format','format'],['clock-size','size'],['clock-position','position']] as const) el<HTMLSelectElement>(id).addEventListener('change',event=>{
    const value=(event.target as HTMLSelectElement).value;
    if (name==='format' && (value==='12'||value==='24')) preferences.format=value;
    if (name==='size' && (value==='small'||value==='normal'||value==='large')) preferences.size=value;
    if (name==='position' && (value==='left'||value==='center'||value==='lower-left')) preferences.position=value;
    save();apply();
  });
  el('space-display-reset').addEventListener('click',()=>{Object.assign(preferences,defaults);save();apply();el('focus-announcement').textContent='已恢复默认显示，从右上角展开音乐和计时，音乐和计时状态保持不变';});
  document.addEventListener('astro:page-load',apply);
  save();apply();
  return {renderClock};
}
