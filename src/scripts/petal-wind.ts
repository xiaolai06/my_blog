import {createPetalFlight,petalRandom} from './petal-physics';
type Petal={element:HTMLElement;depth:number;seed:number;animation:Animation|null;started:boolean};
export function setupPetalWind(reduced:MediaQueryList,signal:AbortSignal){
 const root=document.documentElement;
 const layers=Array.from(document.querySelectorAll<HTMLElement>('.wind-petals')).map(element=>({
  element,visible:false,height:element.clientHeight,width:element.clientWidth,
  petals:Array.from(element.querySelectorAll<HTMLElement>('.wind-petal')).map((element,index):Petal=>({element,depth:Number(element.dataset.depth),seed:(index+1)*7919+Math.floor(Math.random()*0xffffff),animation:null,started:false})),
 }));
 const allowed=()=>!signal.aborted&&!reduced.matches&&root.dataset.motion!=='off'&&!document.hidden;
 function flight(layer:typeof layers[number],petal:Petal){
  if(!allowed()||!layer.visible)return;
  const random=petalRandom(petal.seed^0x9E3779B9),height=layer.element.clientHeight;
  const model=createPetalFlight(petal.seed,height,petal.depth,performance.now()/1000);
  petal.element.style.left=`${(random()*108-8).toFixed(2)}%`;
  const alpha=Number(petal.element.style.getPropertyValue('--wind-alpha'))||.6;
  const animation=petal.element.animate(model.samples.map(sample=>({
   offset:sample.time/model.duration,
   transform:`translate3d(${sample.x.toFixed(2)}px,${sample.y.toFixed(2)}px,0) rotate(${sample.angle.toFixed(2)}deg) rotateY(${sample.flip.toFixed(2)}deg) rotateX(${sample.pitch.toFixed(2)}deg)`,
   opacity:alpha*Math.min(1,sample.time/.35,Math.max(0,(height+64-sample.y)/55)),
  })),{duration:model.duration*1000,easing:'linear',fill:'both'});
  petal.animation=animation;
  if(!petal.started){animation.currentTime=model.duration*1000*(.04+random()*.9);petal.started=true;}
  animation.onfinish=()=>{
   animation.cancel();petal.animation=null;petal.seed=(petal.seed+104729)>>>0;
   flight(layer,petal);
  };
 }
 function sync(){
  layers.forEach(layer=>{
   const running=allowed()&&layer.visible;layer.element.dataset.windState=running?'running':'paused';
   layer.petals.forEach(petal=>{
    const visible=running&&getComputedStyle(petal.element).display!=='none';
    if(!visible){petal.animation?.pause();return;}
    if(petal.animation)petal.animation.play();else flight(layer,petal);
   });
  });
 }
 const visibility=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{const layer=layers.find(layer=>layer.element===entry.target);if(layer)layer.visible=entry.isIntersecting;});sync();
 },{rootMargin:'25px 0px'});
 layers.forEach(layer=>visibility.observe(layer.element));
 let resizeTimer=0;
 const resize=new ResizeObserver(()=>{
  let changed=false;
  layers.forEach(layer=>{const height=layer.element.clientHeight,width=layer.element.clientWidth;if(height!==layer.height||width!==layer.width){layer.height=height;layer.width=width;changed=true;}});
  if(!changed)return;
  clearTimeout(resizeTimer);resizeTimer=window.setTimeout(()=>{
   layers.forEach(layer=>layer.petals.forEach(petal=>{petal.animation?.cancel();petal.animation=null;petal.started=false;}));sync();
  },150);
 });
 layers.forEach(layer=>resize.observe(layer.element));
 const preference=new MutationObserver(sync);preference.observe(root,{attributes:true,attributeFilter:['data-motion','data-page-hidden']});
 reduced.addEventListener('change',sync,{signal});document.addEventListener('visibilitychange',sync,{signal});
 signal.addEventListener('abort',()=>{clearTimeout(resizeTimer);visibility.disconnect();resize.disconnect();preference.disconnect();layers.forEach(layer=>layer.petals.forEach(petal=>petal.animation?.cancel()));},{once:true});
}
