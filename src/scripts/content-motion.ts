/** One owner per element keeps reveals, filtering and sorting from competing. */
const owners=new WeakMap<HTMLElement,Animation>();
export const contentEase='cubic-bezier(.23,1,.32,1)';
export function cancelContentMotion(element:HTMLElement){owners.get(element)?.cancel();}
export function capturePositions(elements:Iterable<HTMLElement>){
 return new Map(Array.from(elements).filter(element=>!element.hidden).map(element=>[element,element.getBoundingClientRect()]));
}
export function createMotionScope(reduced:MediaQueryList,signal:AbortSignal){
 const root=document.documentElement,animations=new Set<Animation>();
 const enabled=()=>!signal.aborted&&!reduced.matches&&root.dataset.motion!=='off'&&!document.hidden;
 const cancelAll=()=>{animations.forEach(animation=>animation.cancel());animations.clear();};
 function play(element:HTMLElement,keyframes:Keyframe[],options:KeyframeAnimationOptions){
  cancelContentMotion(element);
  if(!enabled())return;
  const animation=element.animate(keyframes,{easing:contentEase,fill:'backwards',...options});
  animations.add(animation);owners.set(element,animation);
  const clear=()=>{animations.delete(animation);if(owners.get(element)===animation)owners.delete(element);};
  animation.addEventListener('finish',clear,{once:true});animation.addEventListener('cancel',clear,{once:true});
  return animation;
 }
 const sync=()=>{if(!enabled())cancelAll();};
 const observer=new MutationObserver(sync);observer.observe(root,{attributes:true,attributeFilter:['data-motion']});
 reduced.addEventListener('change',sync,{signal});document.addEventListener('visibilitychange',sync,{signal});
 signal.addEventListener('abort',()=>{observer.disconnect();cancelAll();},{once:true});
 return {enabled,play,cancelAll};
}
export function animateCollection(scope:ReturnType<typeof createMotionScope>,previous:Map<HTMLElement,DOMRect>,visible:HTMLElement[],options:{replace?:boolean;direction?:number}={}){
 // Capture the old visual positions before cancelling; measure the final layout in one batch.
 previous.forEach((_,element)=>cancelContentMotion(element));visible.forEach(cancelContentMotion);
 const positions=visible.map(element=>element.getBoundingClientRect());
 visible.forEach((element,index)=>{
  element.dataset.motionSeen='true';
  const before=previous.get(element),after=positions[index],retained=before&&!options.replace;
  const x=retained?before.left-after.left:options.direction?options.direction*7:0;
  const y=retained?before.top-after.top:options.direction?0:8;
  if(retained&&Math.abs(x)<.5&&Math.abs(y)<.5)return;
  scope.play(element,[{opacity:retained?1:.5,translate:`${x}px ${y}px`},{opacity:1,translate:'0px 0px'}],{duration:retained?260:240,delay:retained?0:Math.min(index*30,75)});
 });
}
