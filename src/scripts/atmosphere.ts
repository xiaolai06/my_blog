import {cancelContentMotion,createMotionScope} from './content-motion';
/** Keep ambient work in view, and reveal each editorial element only once. */
export function setupAtmosphere(reduced: MediaQueryList,signal:AbortSignal) {
 const root=document.documentElement;
 const motion=createMotionScope(reduced,signal);
 const ambient=new IntersectionObserver(entries=>{
  entries.forEach(entry=>entry.target.classList.toggle('is-in-view',entry.isIntersecting));
 },{rootMargin:'30px 0px'});
 document.querySelectorAll('.home-page .project-art,.home-page .profile-avatar,.footer-landscape,.project-hero,.hero').forEach(el=>ambient.observe(el));

 let firstDelivery=true;
 const reveals=new IntersectionObserver(entries=>{
  const groups=new Map<Element|null,number>();
  entries.sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top||a.boundingClientRect.left-b.boundingClientRect.left).forEach(entry=>{
   if(!entry.isIntersecting)return;
   reveals.unobserve(entry.target);
   const element=entry.target as HTMLElement;
   if(element.dataset.motionSeen==='true')return;
   element.dataset.motionSeen='true';
   if(!motion.enabled()||firstDelivery&&(root.dataset.pageArrival==='navigation'||entry.boundingClientRect.top<innerHeight-24))return;
   const resumeModule=element.closest('.about-content')!==null;
   const order=groups.get(element.parentElement)||0;groups.set(element.parentElement,order+1);
   // Content stays readable before JS runs; only newly entering modules move.
   motion.play(element,[
    {opacity:resumeModule ? .65 : .5,translate:`0 ${resumeModule ? 8 : 10}px`},
    {opacity:1,translate:'0 0'},
   ],{duration:280,delay:Math.min(order*35,70)});
  });
  firstDelivery=false;
 },{threshold:.08,rootMargin:'0px 0px -24px 0px'});
 document.querySelectorAll<HTMLElement>('main .project-card,main .panel,main .journal-row,main .section-heading,main .welcome-line,.case-heading,.case-meta,.case-prose>section,.article-heading,.article-image,.reader-summary,.reader-related-heading,.reader-related-card,.about-grid>*,.about-content .about-resume-card,.about-content .about-section-heading,.about-content .about-skill,.about-content .about-background-grid>article,.about-content .about-experience-list>li,.about-content .about-strength-card,.about-content .about-interest,.archive-heading,.archive-rail>section').forEach(element=>{
  reveals.observe(element);
  element.addEventListener('pointerenter',()=>cancelContentMotion(element),{signal,passive:true});
  element.addEventListener('focusin',()=>cancelContentMotion(element),{signal});
 });

 const syncVisibility=()=>{
  root.toggleAttribute('data-page-hidden',document.hidden);
 };
 document.addEventListener('visibilitychange',syncVisibility,{signal});
 syncVisibility();
 signal.addEventListener('abort',()=>{ambient.disconnect();reveals.disconnect();},{once:true});
 return ()=>{
  if(!motion.enabled())motion.cancelAll();
 };
}
