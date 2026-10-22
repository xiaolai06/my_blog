/** Navigation listeners live once; page-specific interactions clean up on swap. */
export function setupPageTransitions(){
 let source:HTMLElement|undefined;
 let destination='';
 let restorePosition:{x:number;y:number}|undefined;
 let restoreFilter:string|undefined;
 const clear=()=>{source?.style.removeProperty('view-transition-name');source=undefined;destination='';};
 document.addEventListener('astro:before-preparation',event=>{
  clear();
  restorePosition=event.navigationType==='traverse'&&Number.isFinite(history.state?.scrollY)?{x:history.state.scrollX||0,y:history.state.scrollY}:undefined;
  restoreFilter=event.navigationType==='traverse'?history.state?.sakuraProjectFilter:undefined;
  if(!document.startViewTransition||matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.dataset.motion==='off')return;
  if(!/^\/(projects|blog)\/[^/]+\/$/.test(event.to.pathname))return;
  const link=event.sourceElement?.closest('a')||Array.from(document.querySelectorAll<HTMLAnchorElement>('main a[href]')).find(anchor=>anchor.pathname===event.to.pathname&&anchor.getClientRects().length);
  const title=link?.querySelector<HTMLElement>('h3');
  if(!title)return;
  const rect=title.getBoundingClientRect();
  if(rect.bottom<0||rect.top>innerHeight||rect.width===0)return;
  source=title;destination=event.to.pathname;title.style.viewTransitionName='content-title';
  event.signal.addEventListener('abort',clear,{once:true});
 });
 document.addEventListener('astro:before-swap',event=>{
  const navigation=event;
  const root=document.documentElement;
  navigation.newDocument.documentElement.dataset.motion=root.dataset.motion||'on';
  // Avoid a second entrance on top of the route's crossfade, including history back.
  navigation.newDocument.documentElement.dataset.pageArrival='navigation';
  // Restore the filtered geometry before the browser captures the destination.
  if(restoreFilter)navigation.newDocument.querySelectorAll<HTMLElement>('[data-project-section]').forEach(section=>{
   const buttons=Array.from(section.querySelectorAll<HTMLElement>('[data-filter]'));
   if(!buttons.some(button=>button.dataset.filter===restoreFilter))return;
   buttons.forEach(button=>{const active=button.dataset.filter===restoreFilter;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
   section.querySelectorAll<HTMLElement>('.project-card').forEach(card=>card.hidden=restoreFilter!=='全部'&&card.dataset.category!==restoreFilter);
  });
  const title=navigation.newDocument.querySelector<HTMLElement>('.work-brand h1,.reader-heading h1');
  if(source&&destination===navigation.to.pathname&&title?.textContent?.trim()===source.textContent?.trim())title.style.viewTransitionName='content-title';
  root.classList.remove('theme-changing');
 });
 document.addEventListener('astro:after-swap',()=>{
  // CSS smooth scrolling is for deliberate reading, not history restoration.
  if(restorePosition)scrollTo({left:restorePosition.x,top:restorePosition.y,behavior:'instant'});
  restorePosition=undefined;restoreFilter=undefined;
 });
 document.addEventListener('astro:page-load',()=>{
  clear();
  document.querySelectorAll<HTMLElement>('.work-brand h1,.reader-heading h1').forEach(title=>{if(title.style.viewTransitionName==='content-title')title.style.removeProperty('view-transition-name');});
 });
}
