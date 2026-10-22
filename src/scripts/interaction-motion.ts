import {setupPetalWind} from './petal-wind';
import {animateCollection,createMotionScope} from './content-motion';
import {setupSelectionMotion} from './selection-motion';
/** Motion reacts to a person's actions; background work pauses with the scene. */
export function setupInteractionMotion(reduced:MediaQueryList,signal:AbortSignal){
 setupPetalWind(reduced,signal);
 const root=document.documentElement,motion=createMotionScope(reduced,signal),enabled=motion.enabled,track=motion.play;
 if(root.dataset.pageArrival!=='navigation')document.querySelectorAll<HTMLElement>('.hero-content>h1,.hero-content>.hero-english,.hero-content>.hero-description,.hero-content>.hero-buttons,.project-hero-content>:not(.sr-only),.reader-heading-copy>h1,.reader-heading-copy>.reader-description,.reader-heading-copy>.reader-meta').forEach((element,index)=>{
  track(element,[{opacity:.25,translate:'0 8px'},{opacity:1,translate:'0 0'}],{duration:300,delay:(index%4)*35});
 });
 let frame=0,active:HTMLElement|null=null,point={x:0,y:0};
 const fine=matchMedia('(hover:hover) and (pointer:fine)');
 const draw=()=>{
  frame=0;if(!active||!enabled()||!fine.matches)return;
  const rect=active.getBoundingClientRect(),x=point.x-rect.left,y=point.y-rect.top;
  active.style.setProperty('--pointer-x',`${x}px`);active.style.setProperty('--pointer-y',`${y}px`);
  active.style.setProperty('--art-x',`${(x/rect.width-.5)*3}px`);active.style.setProperty('--art-y',`${(y/rect.height-.5)*2}px`);
 };
 document.querySelectorAll<HTMLElement>('.project-card,.profile-panel,.calendar-panel').forEach(card=>{
  card.classList.add('motion-card');
  card.addEventListener('pointermove',event=>{if(!enabled()||!fine.matches)return;active=card;point={x:event.clientX,y:event.clientY};if(!frame)frame=requestAnimationFrame(draw);},{signal,passive:true});
  card.addEventListener('pointerleave',()=>{card.style.removeProperty('--art-x');card.style.removeProperty('--art-y');if(active===card)active=null;},{signal});
 });
 document.querySelectorAll<HTMLElement>('[data-project-section]').forEach(section=>{
  setupSelectionMotion(section.querySelector('.project-filters'),'.filter-button','[aria-pressed=true]',reduced,signal);
  section.addEventListener('projects:filtered',event=>{
   const previous=(event as CustomEvent<{previous:Map<HTMLElement,DOMRect>}>).detail.previous;
   const cards=Array.from(section.querySelectorAll<HTMLElement>('.project-card:not([hidden])'));
   animateCollection(motion,previous,cards);
  },{signal});
 });
 document.querySelectorAll<HTMLElement>('[data-calendar]').forEach(calendar=>calendar.addEventListener('calendar:change',()=>{
  const note=calendar.querySelector<HTMLElement>('.calendar-note');if(note)track(note,[{opacity:.4,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:220,easing:'ease-out'});
 },{signal}));
 const sync=()=>{if(!enabled()){if(frame)cancelAnimationFrame(frame);frame=0;}};
 const observer=new MutationObserver(sync);observer.observe(root,{attributes:true,attributeFilter:['data-motion','data-page-hidden']});
 reduced.addEventListener('change',sync,{signal});
 signal.addEventListener('abort',()=>{observer.disconnect();if(frame)cancelAnimationFrame(frame);},{once:true});
}
