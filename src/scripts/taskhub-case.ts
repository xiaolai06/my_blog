export function setupProjectCase(){
 const host=document.querySelector<HTMLElement>('[data-project-case]');
 if(!host||host.dataset.mounted==='true')return;
 host.dataset.mounted='true';
 const controller=new AbortController(),signal=controller.signal;
 const controls=Array.from(host.querySelectorAll<HTMLButtonElement>('[data-view]'));
 const panels=Array.from(host.querySelectorAll<HTMLElement>('[data-view-panel]'));
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let current=0;
 const selectView=(index:number,focus=false)=>{
  current=(index+controls.length)%controls.length;
  const control=controls[current];
  if(!control)return;
  controls.forEach(button=>{
   const selected=button===control;
   button.setAttribute('aria-selected',String(selected));
   button.tabIndex=selected?0:-1;
  });
  panels.forEach(panel=>{
   panel.getAnimations().forEach(animation=>animation.cancel());
   panel.hidden=panel.dataset.viewPanel!==control.dataset.view;
   if(!panel.hidden&&!reduced.matches)panel.animate([{opacity:.65},{opacity:1}],{duration:180,easing:'ease-out'});
  });
  const count=host.querySelector('[data-view-count]');
  if(count?.firstChild)count.firstChild.textContent=String(current+1).padStart(2,'0')+' ';
  const status=host.querySelector('[data-view-status]');
  if(status)status.textContent='当前展示：'+control.textContent?.trim();
  if(focus)control.focus({preventScroll:true});
 };
 controls.forEach((control,index)=>{
  control.addEventListener('click',()=>selectView(index),{signal});
  control.addEventListener('keydown',event=>{
   const next=event.key==='ArrowRight'?index+1:event.key==='ArrowLeft'?index-1:event.key==='Home'?0:event.key==='End'?controls.length-1:null;
   if(next===null)return;
   event.preventDefault();selectView(next,true);
  },{signal});
 });
 host.querySelector('[data-view-prev]')?.addEventListener('click',()=>selectView(current-1),{signal});
 host.querySelector('[data-view-next]')?.addEventListener('click',()=>selectView(current+1),{signal});
 // Small responsive previews are ready before a visitor switches cards.
 panels.forEach(panel=>{const image=panel.querySelector('img');if(image)image.loading='eager';});
 const dialog=host.querySelector<HTMLDialogElement>('.work-lightbox');
 const zoom=dialog?.querySelector<HTMLButtonElement>('[data-zoom]');
 const viewport=dialog?.querySelector<HTMLElement>('.work-lightbox-viewport');
 const resetZoom=()=>{
  dialog?.classList.remove('is-zoomed');
  zoom?.setAttribute('aria-pressed','false');
  if(zoom)zoom.textContent='原尺寸';
  if(viewport){viewport.scrollTop=0;viewport.scrollLeft=0;}
 };
 let trigger:HTMLAnchorElement|null=null;
 host.querySelectorAll<HTMLAnchorElement>('[data-shot]').forEach(link=>link.addEventListener('click',event=>{
  if(!dialog||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  const original=link.querySelector<HTMLImageElement>('img');
  const image=dialog.querySelector('img');
  if(!original||!image)return;
  event.preventDefault();trigger=link;resetZoom();
  image.src=link.href;image.alt=original.alt;
  dialog.querySelector('p')!.textContent=link.dataset.caption||'';
  dialog.querySelector<HTMLAnchorElement>('.work-original')!.href=link.href;
  dialog.showModal();
 },{signal}));
 zoom?.addEventListener('click',()=>{
  const enlarged=dialog?.classList.toggle('is-zoomed')||false;
  zoom.setAttribute('aria-pressed',String(enlarged));
  zoom.textContent=enlarged?'适应窗口':'原尺寸';
  if(!enlarged&&viewport){viewport.scrollTop=0;viewport.scrollLeft=0;}
 },{signal});
 dialog?.querySelector('[data-close]')?.addEventListener('click',()=>dialog.close(),{signal});
 dialog?.addEventListener('click',event=>{if(event.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();},{signal});
 dialog?.addEventListener('close',()=>trigger?.focus({preventScroll:true}),{signal});
 document.addEventListener('astro:before-swap',()=>{controller.abort();dialog?.close();},{once:true,signal});
}
