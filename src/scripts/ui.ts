import {setupJournalCalendar} from './journal-calendar';
import {setupInteractionMotion} from './interaction-motion';

import { setupAtmosphere } from './atmosphere';
import {setSiteTheme} from './theme-preference';
import {createDisclosureMotion} from './disclosure-motion';
export function setupSiteUI(){
const controller=new AbortController();
const signal=controller.signal;
const listen=(target:EventTarget,type:string,callback:(event:any)=>void,options:AddEventListenerOptions={})=>target.addEventListener(type,callback,{...options,signal});
document.addEventListener('astro:before-swap',()=>controller.abort(),{once:true,signal});
const root=document.documentElement;
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
function save(key:string,value:string){try{localStorage.setItem(key,value);}catch{}}
const themeButtons=document.querySelectorAll<HTMLButtonElement>('.theme-toggle');
themeButtons.forEach(b=>b.addEventListener('click',()=>setSiteTheme(root.dataset.theme==='dark'?'light':'dark'),{signal}));
const menu=document.querySelector<HTMLButtonElement>('.menu-toggle');
const mobileNav=document.querySelector<HTMLElement>('.mobile-nav');
const menuMotion=createDisclosureMotion(mobileNav,reduced,signal);
function setMenu(open:boolean){
 if(!menu||!mobileNav)return;
 if(!open&&mobileNav.contains(document.activeElement))menu.focus({preventScroll:true});
 menuMotion.setOpen(open);menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'关闭导航菜单':'打开导航菜单');
}
function closeMenu(){setMenu(false);}
menu?.addEventListener('click',()=>setMenu(!menuMotion.isOpen()),{signal});
listen(document,'keydown',e=>{if(e.key==='Escape')closeMenu();});
listen(document,'click',e=>{if(!((e.target as HTMLElement).closest('.site-header')))closeMenu();});
listen(window.matchMedia('(min-width:761px)'),'change',e=>{if(e.matches)closeMenu();});

document.querySelectorAll<HTMLElement>('[data-project-section]').forEach(section=>{
 const filters=section.querySelectorAll<HTMLButtonElement>('[data-filter]');
 const cards=section.querySelectorAll<HTMLElement>('.project-card');
 filters.forEach(button=>button.addEventListener('click',()=>{
  if(button.getAttribute('aria-pressed')==='true')return;
  const previous=new Map(Array.from(cards).filter(card=>!card.hidden).map(card=>[card,card.getBoundingClientRect()]));
  filters.forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  let count=0;cards.forEach(card=>{card.hidden=button.dataset.filter!=='全部'&&card.dataset.category!==button.dataset.filter;if(!card.hidden)count++;});
  const status=section.querySelector('.filter-status');if(status)status.textContent=button.dataset.filter+'，共 '+count+' 个项目';
  section.dispatchEvent(new CustomEvent('projects:filtered',{detail:{previous}}));
 },{signal}));
});

type SearchEntry={title:string;description:string;type:string;url:string;keywords:string};
const dialog=document.querySelector<HTMLDialogElement>('.search-dialog');
const searchMotion=createDisclosureMotion(dialog,reduced,signal);
const search=document.querySelector<HTMLInputElement>('#site-search');
const results=dialog?.querySelector<HTMLElement>('.search-results');
const index:SearchEntry[]=JSON.parse(dialog?.dataset.index||'[]');
function renderSearch(){
 if(!results||!search)return;
 const words=search.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
 const matched=index.filter(item=>words.every(word=>(item.title+' '+item.description+' '+item.keywords).toLocaleLowerCase().includes(word)));
 results.replaceChildren();
 if(!matched.length){const empty=document.createElement('p');empty.className='search-empty';empty.textContent='暂时没有找到，试试别的关键词吧。';results.append(empty);return;}
 matched.forEach(item=>{const a=document.createElement('a');a.className='search-result';a.href=item.url;const type=document.createElement('span');type.textContent=item.type;const title=document.createElement('h3');title.textContent=item.title;const description=document.createElement('p');description.textContent=item.description;a.append(type,title,description);results.append(a);});
}
function closeSearch(){searchMotion.setOpen(false);}
function openSearch(){if(dialog&&!searchMotion.isOpen()){closeMenu();renderSearch();searchMotion.setOpen(true);search?.focus({preventScroll:true});}}
document.querySelectorAll('.search-trigger').forEach(b=>b.addEventListener('click',openSearch,{signal}));
dialog?.querySelector('.search-close')?.addEventListener('click',closeSearch,{signal});
dialog?.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeSearch();}},{signal});
dialog?.addEventListener('cancel',e=>{e.preventDefault();closeSearch();},{signal});
search?.addEventListener('input',renderSearch,{signal});
listen(document,'keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if(searchMotion.isOpen())closeSearch();else openSearch();}});
dialog?.addEventListener('keydown',e=>{
 if(e.key==='Escape'){e.preventDefault();closeSearch();return;}
 const links=Array.from(dialog.querySelectorAll<HTMLAnchorElement>('.search-result'));
 if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();const n=links.indexOf(document.activeElement as HTMLAnchorElement);const next=e.key==='ArrowDown'?(n+1)%links.length:(n<=0?links.length-1:n-1);links[next]?.focus();}
 if(e.key==='Enter'&&document.activeElement===search&&links[0]){e.preventDefault();links[0].click();}
},{signal});

setupJournalCalendar(signal);


setupInteractionMotion(reduced,signal);
const motionButtons=document.querySelectorAll<HTMLButtonElement>('[data-motion-toggle]');
const syncAtmosphere=setupAtmosphere(reduced);
function syncMotion(){
 syncAtmosphere();
 const off=root.dataset.motion==='off'||reduced.matches;
 motionButtons.forEach(motion=>{
 motion.setAttribute('aria-pressed',String(off));motion.setAttribute('aria-label',off?'开启背景动效':'暂停背景动效');
 const label=motion.querySelector('.motion-label');if(label)label.textContent=reduced.matches?'已跟随系统减少动效':off?'风暂歇，花停留':'风起，花落';
 motion.disabled=reduced.matches;
 });
}
syncMotion();listen(reduced,'change',syncMotion);
motionButtons.forEach(motion=>motion.addEventListener('click',()=>{root.dataset.motion=root.dataset.motion==='off'?'on':'off';save('sakura-motion',root.dataset.motion!);syncMotion();}));
const hero=document.querySelector<HTMLElement>('.hero');
if(hero){
 const visibility=new IntersectionObserver(([entry])=>hero.classList.toggle('is-outside',!entry.isIntersecting));visibility.observe(hero);signal.addEventListener('abort',()=>visibility.disconnect(),{once:true});
}
const progress=document.querySelector<HTMLElement>('.reading-progress');
if(progress){
 const toc=Array.from(document.querySelectorAll<HTMLAnchorElement>('.toc a'));
 let frame=false;
 function update(){const total=document.documentElement.scrollHeight-window.innerHeight;progress!.style.transform='scaleX('+Math.max(0,Math.min(1,window.scrollY/Math.max(total,1)))+')';let current='';toc.forEach(a=>{const id=decodeURIComponent(a.hash.slice(1));const h=document.getElementById(id);if(h&&h.getBoundingClientRect().top<window.innerHeight*.35)current=a.hash;});toc.forEach(a=>{a.classList.toggle('active',a.hash===current);if(a.hash===current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});frame=false;}
 listen(window,'scroll',()=>{if(!frame){frame=true;requestAnimationFrame(update);}},{passive:true});listen(window,'resize',update);update();
}

}

