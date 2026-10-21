type Theme='light'|'dark';
const key='sakura-theme',system=matchMedia('(prefers-color-scheme: dark)');
let memory:Theme|undefined,started=false;
let transitionTimer:ReturnType<typeof setTimeout>|undefined;
const valid=(value:unknown):value is Theme=>value==='light'||value==='dark';
function preference():Theme{
 try{const saved=localStorage.getItem(key);if(valid(saved))return saved;}catch{}
 return memory??(system.matches?'dark':'light');
}
function apply(target:Document=document){
 const theme=preference();target.documentElement.dataset.theme=theme;
 target.querySelectorAll<HTMLButtonElement>('.theme-toggle').forEach(button=>{
  button.setAttribute('aria-label',theme==='dark'?'切换浅色主题':'切换深色主题');
  button.setAttribute('aria-pressed',String(theme==='dark'));
 });
}
export function setSiteTheme(theme:Theme){
 const root=document.documentElement;
 clearTimeout(transitionTimer);
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&root.dataset.motion!=='off'){
  root.classList.add('theme-changing');
  transitionTimer=setTimeout(()=>root.classList.remove('theme-changing'),300);
 }
 memory=theme;try{localStorage.setItem(key,theme);}catch{}
 apply();
}
export function setupThemePreference(){
 if(started)return;started=true;apply();
 // Set the destination root before Astro swaps it into the visible document.
 document.addEventListener('astro:before-swap',event=>apply((event as Event&{newDocument:Document}).newDocument));
 document.addEventListener('astro:after-swap',()=>apply());
 document.addEventListener('astro:page-load',()=>apply());
 window.addEventListener('pageshow',()=>apply());
 system.addEventListener('change',()=>apply());
 window.addEventListener('storage',event=>{
  if(event.key===key||event.key===null){memory=undefined;apply();}
 });
}
