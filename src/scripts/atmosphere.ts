/** Keep ambient work in view, and reveal each editorial element only once. */
export function setupAtmosphere(reduced: MediaQueryList) {
 const root=document.documentElement;
 const entrances=new Set<Animation>();
 const ambient=new IntersectionObserver(entries=>{
  entries.forEach(entry=>entry.target.classList.toggle('is-in-view',entry.isIntersecting));
 },{rootMargin:'30px 0px'});
 document.querySelectorAll('.home-page .project-art,.home-page .profile-avatar,.footer-landscape,.project-hero,.hero').forEach(el=>ambient.observe(el));

 const reveals=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
   if(!entry.isIntersecting)return;
   reveals.unobserve(entry.target);
   if(reduced.matches||root.dataset.motion==='off'||document.hidden)return;
   const element=entry.target as HTMLElement;
   const resumeModule=element.closest('.about-content')!==null;
   const siblings=element.parentElement?.children;
   const order=siblings?Array.from(siblings).indexOf(element):0;
   // Content stays readable before JS runs; only newly entering modules move.
   if(element.getBoundingClientRect().top<window.innerHeight-24&&window.scrollY<8)return;
   const entrance=element.animate([
    {opacity:resumeModule ? .65 : .4,translate:`0 ${resumeModule ? 8 : 12}px`},
    {opacity:1,translate:'0 0'},
   ],{duration:320,delay:Math.max(0,order%3)*35,easing:'cubic-bezier(.23,1,.32,1)',fill:'backwards'});
   entrances.add(entrance);
   const clear=()=>entrances.delete(entrance);
   entrance.addEventListener('finish',clear,{once:true});
   entrance.addEventListener('cancel',clear,{once:true});
   element.addEventListener('pointerenter',()=>entrance.cancel(),{once:true});
   element.addEventListener('focusin',()=>entrance.cancel(),{once:true});
  });
 },{threshold:.08,rootMargin:'0px 0px -24px 0px'});
 document.querySelectorAll('main .project-card,main .panel,main .journal-row,main .section-heading,main .welcome-line,.case-heading,.case-meta,.case-prose>section,.article-heading,.article-image,.reader-summary,.reader-related-heading,.reader-related-card,.about-grid>*,.about-content .about-resume-card,.about-content .about-section-heading,.about-content .about-skill,.about-content .about-background-grid>article,.about-content .about-experience-list>li,.about-content .about-strength-card,.about-content .about-interest,.archive-heading,.archive-rail>section').forEach(el=>reveals.observe(el));

 const syncVisibility=()=>{
  root.toggleAttribute('data-page-hidden',document.hidden);
  if(document.hidden)entrances.forEach(animation=>animation.cancel());
 };
 const preference=new MutationObserver(()=>{
  if(root.dataset.motion==='off')entrances.forEach(animation=>animation.cancel());
 });
 preference.observe(root,{attributes:true,attributeFilter:['data-motion']});
 document.addEventListener('visibilitychange',syncVisibility);
 syncVisibility();
 document.addEventListener('astro:before-swap',()=>{ambient.disconnect();reveals.disconnect();preference.disconnect();entrances.forEach(animation=>animation.cancel());document.removeEventListener('visibilitychange',syncVisibility);},{once:true});
 return ()=>{
  if(reduced.matches||root.dataset.motion==='off')entrances.forEach(animation=>animation.cancel());
 };
}
