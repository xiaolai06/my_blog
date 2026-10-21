/** Navigation listeners live once; page-specific interactions clean up on swap. */
export function setupPageTransitions(){
 document.addEventListener('astro:before-swap',event=>{
  const navigation=event;
  const root=document.documentElement;
  navigation.newDocument.documentElement.dataset.motion=root.dataset.motion||'on';
  // Avoid a second entrance on top of the route's crossfade, including history back.
  navigation.newDocument.documentElement.dataset.pageArrival='navigation';
  root.classList.remove('theme-changing');
 });
}
