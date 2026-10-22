import {createMotionScope} from './content-motion';
import {setupSelectionMotion} from './selection-motion';
import {createImageViewerMotion} from './image-viewer-motion';
export function setupProjectCase(){
 const host=document.querySelector<HTMLElement>('[data-project-case]');
 if(!host||host.dataset.mounted==='true')return;
 host.dataset.mounted='true';
 const controller=new AbortController(),signal=controller.signal;
 const controls=Array.from(host.querySelectorAll<HTMLButtonElement>('[data-view]'));
 const panels=Array.from(host.querySelectorAll<HTMLElement>('[data-view-panel]'));
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const motion=createMotionScope(reduced,signal);
 setupSelectionMotion(host.querySelector('.work-view-controls'),'button[data-view]','[aria-selected=true]',reduced,signal);
 const stage=host.querySelector<HTMLElement>('.work-deck-stage');
 const feedback=host.querySelector<HTMLElement>('.work-gallery-note>span');
 const originalFeedback=feedback?.textContent||'';
 let current=0,shown=0,request=0;
 const selectView=async(index:number,focus=false)=>{
  if(!controls.length)return;
  current=(index+controls.length)%controls.length;
  const control=controls[current];
  if(!control)return;
  const selected=current,token=++request;
  controls.forEach(button=>{
   const selected=button===control;
   button.setAttribute('aria-selected',String(selected));
   button.tabIndex=selected?0:-1;
  });
  if(focus)control.focus({preventScroll:true});
  const panel=panels.find(panel=>panel.dataset.viewPanel===control.dataset.view);
  if(!panel)return;
  const image=panel.querySelector<HTMLImageElement>('img');
  stage?.setAttribute('aria-busy','true');
  if(image&&(!image.complete||!image.naturalWidth)){
   if(feedback)feedback.textContent='正在准备界面预览…';
   try{await image.decode();}catch{
    if(signal.aborted||token!==request)return;
    current=shown;controls.forEach((button,i)=>{button.setAttribute('aria-selected',String(i===shown));button.tabIndex=i===shown?0:-1;});
    stage?.setAttribute('aria-busy','false');
    if(feedback)feedback.textContent='界面图片暂时未能加载，请再次点击标签重试。';
    return;
   }
  }
  if(signal.aborted||token!==request)return;
  motion.cancelAll();
  panels.forEach(item=>item.hidden=item!==panel);
  const direction=Math.sign(selected-shown);shown=selected;
  if(direction){
   const copy=panel.querySelector<HTMLElement>('.work-view-copy'),screen=panel.querySelector<HTMLElement>('.work-screen-card');
   if(copy)motion.play(copy,[{opacity:.5,translate:`${direction*5}px 0`},{opacity:1,translate:'0 0'}],{duration:200});
   if(screen)motion.play(screen,[{opacity:.4,translate:`${direction*7}px 0`},{opacity:1,translate:'0 0'}],{duration:240});
  }
  stage?.setAttribute('aria-busy','false');if(feedback)feedback.textContent=originalFeedback;
  const count=host.querySelector('[data-view-count]');
  if(count?.firstChild)count.firstChild.textContent=String(current+1).padStart(2,'0')+' ';
  const status=host.querySelector('[data-view-status]');
  if(status)status.textContent='当前展示：'+control.textContent?.trim();
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
 const viewer=createImageViewerMotion(dialog,reduced,signal);
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
  image.src=original.currentSrc||original.src;image.alt=original.alt;image.dataset.fullSource=link.href;
  dialog.querySelector('p')!.textContent=link.dataset.caption||'';
  dialog.querySelector<HTMLAnchorElement>('.work-original')!.href=link.href;
  viewer.openFrom(original);
  const full=new Image();full.src=link.href;
  void full.decode().then(()=>{if(!signal.aborted&&dialog.open&&image.dataset.fullSource===link.href)image.src=link.href;},()=>{});
 },{signal}));
 zoom?.addEventListener('click',()=>{
  const enlarged=dialog?.classList.toggle('is-zoomed')||false;
  zoom.setAttribute('aria-pressed',String(enlarged));
  zoom.textContent=enlarged?'适应窗口':'原尺寸';
  if(!enlarged&&viewport){viewport.scrollTop=0;viewport.scrollLeft=0;}
 },{signal});
 dialog?.querySelector('[data-close]')?.addEventListener('click',()=>viewer.close(),{signal});
 dialog?.addEventListener('cancel',event=>{event.preventDefault();viewer.close();},{signal});
 dialog?.addEventListener('click',event=>{if(event.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)viewer.close();},{signal});
 dialog?.addEventListener('close',()=>{resetZoom();trigger?.focus({preventScroll:true});},{signal});
 document.addEventListener('astro:before-swap',()=>{controller.abort();dialog?.close();},{once:true,signal});
}
