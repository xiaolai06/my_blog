import {setupPetalWind} from './petal-wind';
/** Motion reacts to a person's actions; background work pauses with the scene. */
export function setupInteractionMotion(reduced:MediaQueryList,signal:AbortSignal){
 setupPetalWind(reduced,signal);
 const root=document.documentElement,animations=new Set<Animation>(),current=new WeakMap<HTMLElement,Animation>();
 const enabled=()=>!reduced.matches&&root.dataset.motion!=='off'&&!document.hidden;
 const track=(element:HTMLElement,keyframes:Keyframe[],options:KeyframeAnimationOptions)=>{
  if(!enabled())return;
  current.get(element)?.cancel();
  const animation=element.animate(keyframes,options);animations.add(animation);current.set(element,animation);
  const done=()=>animations.delete(animation);animation.addEventListener('finish',done,{once:true});animation.addEventListener('cancel',done,{once:true});
 };
 if(root.dataset.pageArrival!=='navigation')document.querySelectorAll<HTMLElement>('.hero-content>h1,.hero-content>.hero-english,.hero-content>.hero-description,.hero-content>.hero-buttons,.project-hero-content>:not(.sr-only),.reader-heading-copy>h1,.reader-heading-copy>.reader-description,.reader-heading-copy>.reader-meta').forEach((element,index)=>{
  track(element,[{opacity:0,translate:'0 10px'},{opacity:1,translate:'0 0'}],{duration:320,delay:(index%4)*45,easing:'cubic-bezier(.23,1,.32,1)',fill:'backwards'});
 });
 let frame=0,active:HTMLElement|null=null,point={x:0,y:0};
 const fine=matchMedia('(hover:hover) and (pointer:fine)');
 const draw=()=>{
  frame=0;if(!active||!enabled()||!fine.matches)return;
  const rect=active.getBoundingClientRect(),x=point.x-rect.left,y=point.y-rect.top;
  active.style.setProperty('--pointer-x',`${x}px`);active.style.setProperty('--pointer-y',`${y}px`);
  active.style.setProperty('--art-x',`${(x/rect.width-.5)*7}px`);active.style.setProperty('--art-y',`${(y/rect.height-.5)*5}px`);
 };
 document.querySelectorAll<HTMLElement>('.project-card,.profile-panel,.calendar-panel').forEach(card=>{
  card.classList.add('motion-card');
  card.addEventListener('pointermove',event=>{if(!enabled()||!fine.matches)return;active=card;point={x:event.clientX,y:event.clientY};if(!frame)frame=requestAnimationFrame(draw);},{signal,passive:true});
  card.addEventListener('pointerleave',()=>{card.style.removeProperty('--art-x');card.style.removeProperty('--art-y');if(active===card)active=null;},{signal});
 });
 document.querySelectorAll<HTMLElement>('[data-project-section]').forEach(section=>{
  section.addEventListener('projects:filtered',event=>{
   const previous=(event as CustomEvent<{previous:Map<HTMLElement,DOMRect>}>).detail.previous;
   // FLIP uses independent translate so hovering can still lift a moving card.
   section.querySelectorAll<HTMLElement>('.project-card').forEach(card=>current.get(card)?.cancel());
   const cards=Array.from(section.querySelectorAll<HTMLElement>('.project-card:not([hidden])'));
   const positions=cards.map(card=>card.getBoundingClientRect());
   cards.forEach((card,index)=>{
    const before=previous.get(card),after=positions[index];
    const x=before?before.left-after.left:0,y=before?before.top-after.top:12;
    if(before&&Math.abs(x)<1&&Math.abs(y)<1)return;
    track(card,[{opacity:before?1:0,translate:`${x}px ${y}px`},{opacity:1,translate:'0px 0px'}],{duration:320,delay:before?0:Math.min(index,3)*35,easing:'cubic-bezier(.23,1,.32,1)',fill:'backwards'});
   });
  },{signal});
 });
 document.querySelectorAll<HTMLElement>('[data-calendar]').forEach(calendar=>calendar.addEventListener('calendar:change',()=>{
  const note=calendar.querySelector<HTMLElement>('.calendar-note');if(note)track(note,[{opacity:.4,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:220,easing:'ease-out'});
 },{signal}));
 const sync=()=>{if(!enabled()){animations.forEach(animation=>animation.cancel());if(frame)cancelAnimationFrame(frame);frame=0;}};
 const observer=new MutationObserver(sync);observer.observe(root,{attributes:true,attributeFilter:['data-motion','data-page-hidden']});
 reduced.addEventListener('change',sync,{signal});
 signal.addEventListener('abort',()=>{observer.disconnect();animations.forEach(animation=>animation.cancel());if(frame)cancelAnimationFrame(frame);},{once:true});
}
