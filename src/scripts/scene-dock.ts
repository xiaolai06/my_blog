import {animate} from 'motion/mini';
import {availableChoices,sceneLabels,type SceneRegion,type SceneFamily,type SceneChoice} from './scene-catalog';
import {chooseScene,readScenePreference,subscribeScenePreference} from './scene-preference';
import {readSceneTime} from './scene-clock';
import {setupSceneRegions} from './scene-regions';

type Branch=SceneRegion|'experience';
const CENTER=352,SIZE=56,MARGIN=12,POSITION_KEY='sakura-scene-dock-position';
const ease:[number,number,number,number]=[.23,1,.32,1];
// All hit areas, labels and SVG paths share the same polar geometry.
function polar(radius:number,angle:number){const a=angle*Math.PI/180;return{x:CENTER+radius*Math.cos(a),y:CENTER+radius*Math.sin(a)};}
function sectorPath(inner:number,outer:number,start:number,end:number){
 const a=polar(outer,start),b=polar(outer,end),c=polar(inner,end),d=polar(inner,start);
 const p=(v:{x:number;y:number})=>`${v.x.toFixed(3)} ${v.y.toFixed(3)}`;
 return `M ${p(a)} A ${outer} ${outer} 0 0 1 ${p(b)} L ${p(c)} A ${inner} ${inner} 0 0 0 ${p(d)} Z`;
}
type LabelRow={x:number;y:number;w:number;h:number};
// Measure the flex content without animated transforms, so larger text stays inside its wedge.
function labelRows(label:HTMLElement):LabelRow[]{
 const style=getComputedStyle(label),gap=parseFloat(style.gap)||0;
 const children=Array.from(label.children).map(el=>({el,style:getComputedStyle(el)})).filter(({style})=>style.display!=='none');
 const flowing=children.filter(({style})=>style.position!=='absolute');
 const size=(style:CSSStyleDeclaration)=>({w:parseFloat(style.width)||0,h:parseFloat(style.height)||0});
 const total=flowing.reduce((sum,{style})=>sum+size(style).h,0)+gap*Math.max(0,flowing.length-1);
 let y=-total/2;
 const rows=flowing.map(({style})=>{const {w,h}=size(style),row={x:0,y:y+h/2,w:w+3,h:h+3};y+=h+gap;return row;});
 children.filter(({style})=>style.position==='absolute').forEach(({el,style})=>{
  const {w,h}=size(style),element=el as HTMLElement;
  rows.push({x:element.offsetLeft+w/2-label.offsetWidth/2,y:element.offsetTop+h/2-label.offsetHeight/2,w:w+3,h:h+3});
 });
 return rows;
}
function labelPoint(inner:number,outer:number,start:number,end:number,rows:LabelRow[]){
 const desired=polar((inner+outer)/2,(start+end)/2);
 const fits=(point:{x:number;y:number})=>rows.every(row=>[-row.w/2,row.w/2].every(dx=>[-row.h/2,row.h/2].every(dy=>{
  const x=point.x-CENTER+row.x+dx,y=point.y-CENTER+row.y+dy,r=Math.hypot(x,y);
  const angle=(Math.atan2(y,x)*180/Math.PI-start+720)%360;
  return r>=inner+1&&r<=outer-1&&angle<=end-start;
 })));
 if(fits(desired))return desired;
 let best=desired,score=Infinity;
 for(let r=inner+12;r<=outer-12;r+=2)for(let a=start+2;a<end-2;a+=.5){
  const point=polar(r,a),distance=(point.x-desired.x)**2+(point.y-desired.y)**2;
  if(distance<score&&fits(point)){best=point;score=distance;}
 }
 return best;
}

export function setupSceneDock(){
 const dock=document.querySelector<HTMLElement>('[data-scene-dock]');if(!dock||dock.dataset.setup)return;dock.dataset.setup='true';
 setupSceneRegions();
 const trigger=dock.querySelector<HTMLButtonElement>('.scene-dock-flower')!,fan=dock.querySelector<HTMLElement>('.scene-fan')!;
 const roots=dock.querySelector<HTMLElement>('[data-fan-roots]')!;
 const title=dock.querySelector<HTMLElement>('#scene-fan-title')!,caption=dock.querySelector<HTMLElement>('#scene-fan-caption')!;
 const status=dock.querySelector<HTMLElement>('[data-wheel-status]')!;
 const parents=Array.from(roots.querySelectorAll<HTMLButtonElement>('[data-fan-branch]'));
 const groups=Array.from(dock.querySelectorAll<HTMLElement>('[data-fan-options]'));
 const choices=Array.from(dock.querySelectorAll<HTMLButtonElement>('[data-wheel-choice]'));
 const musicLink=dock.querySelector<HTMLAnchorElement>('[data-music-mode]')!,motionButton=dock.querySelector<HTMLButtonElement>('[data-dock-motion]')!;
 const abort=new AbortController(),{signal}=abort,reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const motions=new Map<Element,ReturnType<typeof animate>>(),generations=new WeakMap<Element,number>();
 let open=false,branch:Branch|undefined,x=0,y=0,ax=0,ay=0,startAngle=180,radius=336,version=0,suppressClick=false;
 let drag:{id:number;sx:number;sy:number;x:number;y:number;active:boolean}|undefined;
 const viewport=()=>({width:document.documentElement.clientWidth,height:window.visualViewport?.height||innerHeight});
 const clamp=(n:number,min:number,max:number)=>Math.min(Math.max(n,min),Math.max(min,max));
 const owner=(region:SceneRegion)=>document.querySelector<HTMLElement>(`[data-scene-region="${region}"]`);
 const gentle=()=>reduced.matches||document.documentElement.dataset.motion==='off';
 const groupFor=(id:Branch)=>groups.find(g=>g.dataset.fanOptions===id)!;
 const items=(group:HTMLElement)=>Array.from(group.querySelectorAll<HTMLButtonElement|HTMLAnchorElement>('.scene-fan-sector')).filter(b=>!b.hidden&&!(b instanceof HTMLButtonElement&&b.disabled));
 function stop(element:Element){motions.get(element)?.stop();motions.delete(element);}
 function move(element:HTMLElement,values:Parameters<typeof animate>[1],duration:number,delay=0){
  stop(element);const animation=animate(element,values,{duration,ease,delay});motions.set(element,animation);return animation;
 }
 function anchor(nx:number,ny:number,animated=false){
  ax=nx;ay=ny;const transform=`translate3d(${ax}px,${ay}px,0)`;
  if(animated&&!gentle())move(trigger,{transform},.22);else{stop(trigger);trigger.style.transform=transform;}
 }
 function layoutGroup(group:HTMLElement,inner:number,outer:number){
  if(group.hidden)return;
  const buttons=Array.from(group.querySelectorAll<HTMLElement>('.scene-fan-sector')).filter(b=>!b.hidden),step=90/buttons.length;
  buttons.forEach((button,i)=>{
   const start=startAngle+i*step+1.7,end=startAngle+(i+1)*step-1.7,path=sectorPath(inner,outer,start,end);
   const label=button.querySelector<HTMLElement>('.scene-fan-label')!,point=labelPoint(inner,outer,start,end,labelRows(label));
   button.style.clipPath=`path('${path}')`;
   button.querySelector('path')!.setAttribute('d',path);
   label.style.left=`${point.x}px`;label.style.top=`${point.y}px`;
  });
 }
 function layout(animated=false){
  const v=viewport();radius=Math.min(336,v.width-SIZE/2-MARGIN*2,v.height-SIZE/2-MARGIN*2);
  dock!.toggleAttribute('data-compact',radius<300);
  const left=x+SIZE/2>=v.width/2,up=y+SIZE/2>=v.height/2;
  startAngle=up?(left?180:270):(left?90:0);
  const cx=left?clamp(x+SIZE/2,radius+MARGIN,v.width-SIZE/2-MARGIN):clamp(x+SIZE/2,SIZE/2+MARGIN,v.width-radius-MARGIN);
  const cy=up?clamp(y+SIZE/2,radius+MARGIN,v.height-SIZE/2-MARGIN):clamp(y+SIZE/2,SIZE/2+MARGIN,v.height-radius-MARGIN);
  const dx=ax+SIZE/2-cx,dy=ay+SIZE/2-cy;
  anchor(cx-SIZE/2,cy-SIZE/2,animated);
  fan.style.left=`${cx-CENTER}px`;fan.style.top=`${cy-CENTER}px`;
  if(animated&&!gentle()&&(Math.abs(dx)>1||Math.abs(dy)>1))move(fan,{transform:[`translate(${dx}px,${dy}px)`,'translate(0px,0px)'],opacity:1},.22);
  const rootOuter=Math.min(224,radius*.55+40),ringGap=radius<300?10:28;
  layoutGroup(roots,Math.max(72,radius*.25),rootOuter);groups.forEach(g=>layoutGroup(g,rootOuter+ringGap,radius));
 }
 function place(nx:number,ny:number){const v=viewport();x=clamp(nx,MARGIN,v.width-SIZE-MARGIN);y=clamp(ny,MARGIN,v.height-SIZE-MARGIN);if(open)layout();else anchor(x,y);}
 function save(){const v=viewport();try{localStorage.setItem(POSITION_KEY,JSON.stringify({x:(x-MARGIN)/Math.max(1,v.width-SIZE-MARGIN*2),y:(y-MARGIN)/Math.max(1,v.height-SIZE-MARGIN*2)}));}catch{}}
 function restore(){
  const v=viewport();let saved;try{saved=JSON.parse(localStorage.getItem(POSITION_KEY)||'null');}catch{}
  if(saved&&Number.isFinite(saved.x)&&Number.isFinite(saved.y))place(MARGIN+clamp(saved.x,0,1)*(v.width-SIZE-MARGIN*2),MARGIN+clamp(saved.y,0,1)*(v.height-SIZE-MARGIN*2));
  else place(v.width-SIZE-24,v.height-SIZE-28);
 }
 function showGroup(group:HTMLElement,keyboard=false){
  generations.set(group,(generations.get(group)||0)+1);stop(group);group.hidden=false;group.inert=false;group.style.opacity='1';
  items(group).forEach((button,i)=>{
   stop(button);
   if(keyboard){button.style.opacity='1';button.style.transform='none';return;}
   move(button,{opacity:[0,1],transform:gentle()?['none','none']:['rotate(-4deg) scale(.95)','rotate(0deg) scale(1)']},gentle()?.08:.2,gentle()?0:i*.018);
  });
 }
 function hideGroup(group:HTMLElement,immediate=false){
  const current=(generations.get(group)||0)+1;generations.set(group,current);group.inert=true;
  if(immediate||group.hidden){stop(group);group.hidden=true;return;}
  move(group,{opacity:0},gentle()?.06:.12).finished.then(()=>{if(generations.get(group)===current)group.hidden=true;});
 }
 function sync(){
  const time=readSceneTime();
  parents.forEach(button=>{
   const id=button.dataset.fanBranch as Branch;button.setAttribute('aria-expanded',String(branch===id));
   if(id==='experience'){button.querySelector('small')!.textContent=document.documentElement.dataset.musicPlaying==='true'?'正在播放':document.documentElement.dataset.musicSelected==='true'?'音乐已暂停':'音乐·动效';return;}
   const el=owner(id);button.disabled=!el;button.querySelector('small')!.textContent=el?sceneLabels[readScenePreference(time,id).choice]:`本页无${id==='hero'?'顶部':'底部'}`;
  });
  choices.forEach(button=>{
   const region=button.dataset.region as SceneRegion,el=owner(region),choice=button.dataset.wheelChoice as SceneChoice;
   button.hidden=!el||!availableChoices(el.dataset.sceneFamily as SceneFamily,region).includes(choice)||!!(el.querySelector('[data-video-scene]')&&['dawn','day'].includes(choice));
   button.setAttribute('aria-pressed',String(choice===readScenePreference(time,region).choice));
  });
  const off=document.documentElement.dataset.motion==='off'||reduced.matches;
  motionButton.setAttribute('aria-pressed',String(off));motionButton.disabled=reduced.matches;
  motionButton.querySelector<HTMLElement>('[data-motion-label]')!.textContent=reduced.matches?'跟随系统':off?'开启动效':'暂停动效';
  motionButton.querySelector<HTMLElement>('[data-dock-pause]')!.hidden=off;motionButton.querySelector<HTMLElement>('[data-dock-play]')!.hidden=!off;
  if(branch==='hero'||branch==='footer'){
   const el=owner(branch),player=el?.querySelector<HTMLElement>('[data-video-scene], [data-image-scene]'),selected=readScenePreference(time,branch).choice;
   title.textContent=branch==='hero'?(location.pathname.startsWith('/music')?'壁纸场景':'顶部场景'):'底部场景';
   caption.textContent=el?.dataset.sceneError==='true'?'加载未完成，点击可重试':player?.dataset.transitioning==='true'||player?.dataset.loading==='true'?'风景渐转中…':selected==='auto'?'随本机时间，风景流转':`${sceneLabels[selected]} · 已为你留住这一刻`;
  }else{title.textContent=branch?'沉浸体验':'风景随心';caption.textContent=branch?'听点音乐，让风暂歇':'选一处风景，留一点从容';}
 }
 function selectBranch(next:Branch|undefined,keyboard=false){
  branch=next;groups.forEach(g=>{if(g.dataset.fanOptions===next)showGroup(g,keyboard);else hideGroup(g,keyboard);});
  sync();layout();
  if(next){const options=items(groupFor(next));(options.find(b=>b.getAttribute('aria-pressed')==='true')||options[0])?.focus({preventScroll:true});}
 }
 function close(focus=false,immediate=false){
  if(!open)return;open=false;branch=undefined;const current=++version;
  fan.inert=true;trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-label',document.documentElement.dataset.musicPlaying==='true'?'音乐正在播放，打开场景与音乐设置；可拖动':'打开场景与音乐设置；可拖动，Alt 加方向键移动');
  if(immediate){stop(fan);fan.hidden=true;anchor(x,y);}
  else{move(fan,{opacity:0,transform:gentle()?'none':'scale(.96)'},gentle()?.06:.14).finished.then(()=>{if(version===current)fan.hidden=true;});anchor(x,y,true);}
  if(focus)trigger.focus({preventScroll:true});
 }
 function expand(keyboard=false){
  open=true;branch=undefined;++version;stop(fan);fan.hidden=false;fan.inert=false;fan.style.opacity='1';fan.style.transform='none';
  groups.forEach(g=>hideGroup(g,true));sync();layout(!keyboard);showGroup(roots,keyboard);
  trigger.setAttribute('aria-expanded','true');trigger.setAttribute('aria-label','关闭场景设置');
  parents.find(b=>!b.disabled)?.focus({preventScroll:true});
 }
 trigger.addEventListener('click',event=>{if(suppressClick){suppressClick=false;event.preventDefault();return;}open?close(true):expand(event.detail===0);},{signal});
 parents.forEach(button=>button.addEventListener('click',event=>{const next=button.dataset.fanBranch as Branch;selectBranch(branch===next?undefined:next,event.detail===0);},{signal}));
 choices.forEach(button=>button.addEventListener('click',()=>{
  const region=button.dataset.region as SceneRegion,choice=button.dataset.wheelChoice as SceneChoice;
  chooseScene(choice,region);sync();status.textContent=`${region==='hero'?'顶部':'底部'}已选择${sceneLabels[choice]}${choice==='auto'?'':'，预览至下个时段或十分钟后'}`;
 },{signal}));
 musicLink.addEventListener('click',()=>{if(!location.pathname.startsWith('/music'))try{sessionStorage.setItem('sakura-music-return',location.pathname+location.search+location.hash);}catch{}},{signal});
 if(location.pathname.startsWith('/music'))try{const previous=sessionStorage.getItem('sakura-music-return');if(previous?.startsWith('/')&&!previous.startsWith('//')&&!previous.startsWith('/music'))musicLink.href=previous;}catch{}
 motionButton.addEventListener('click',()=>{
  const value=document.documentElement.dataset.motion==='off'?'on':'off';document.documentElement.dataset.motion=value;
  try{localStorage.setItem('sakura-motion',value);}catch{}sync();status.textContent=value==='off'?'背景动效已暂停':'背景动效已开启';
 },{signal});
 dock.querySelector<HTMLButtonElement>('[data-dock-reset]')!.addEventListener('click',()=>{close(false,true);try{localStorage.removeItem(POSITION_KEY);}catch{}restore();trigger.focus({preventScroll:true});status.textContent='樱花按钮已回到右下角';},{signal});
 document.addEventListener('pointerdown',event=>{if(open&&!dock.contains(event.target as Node))close();},{signal});
 document.addEventListener('keydown',event=>{
  if(event.key!=='Escape'||!open)return;event.preventDefault();
  if(branch){const previous=branch;selectBranch(undefined,true);parents.find(b=>b.dataset.fanBranch===previous)?.focus({preventScroll:true});}else close(true);
 },{signal});
 fan.addEventListener('keydown',event=>{
  if(!['ArrowRight','ArrowLeft','ArrowDown','ArrowUp','Home','End'].includes(event.key)||event.altKey)return;
  const target=document.activeElement as HTMLElement,group=target.closest<HTMLElement>('[data-fan-options]'),options=items(group||roots),i=options.indexOf(target);
  event.preventDefault();const n=event.key==='Home'?0:event.key==='End'?options.length-1:(i+(['ArrowLeft','ArrowUp'].includes(event.key)?-1:1)+options.length)%options.length;options[n]?.focus({preventScroll:true});
 },{signal});
 dock.addEventListener('focusout',()=>{requestAnimationFrame(()=>{if(open&&!dock.contains(document.activeElement))close();});},{signal});
 trigger.addEventListener('keydown',event=>{
  if(!event.altKey||!['ArrowRight','ArrowLeft','ArrowDown','ArrowUp','Home'].includes(event.key))return;event.preventDefault();close(false,true);
  if(event.key==='Home'){try{localStorage.removeItem(POSITION_KEY);}catch{}restore();}else{place(x+(event.key==='ArrowRight'?20:event.key==='ArrowLeft'?-20:0),y+(event.key==='ArrowDown'?20:event.key==='ArrowUp'?-20:0));save();}
 },{signal});
 trigger.addEventListener('pointerdown',event=>{if(event.button!==0||!event.isPrimary)return;suppressClick=false;drag={id:event.pointerId,sx:event.clientX,sy:event.clientY,x:ax,y:ay,active:false};trigger.setPointerCapture(event.pointerId);},{signal});
 trigger.addEventListener('pointermove',event=>{
  if(!drag||drag.id!==event.pointerId)return;const dx=event.clientX-drag.sx,dy=event.clientY-drag.sy;
  if(!drag.active&&Math.hypot(dx,dy)>6){drag.active=true;close(false,true);dock.dataset.dragging='true';}
  if(drag.active){event.preventDefault();place(drag.x+dx,drag.y+dy);}
 },{signal});
 function finishDrag(event:PointerEvent){if(!drag||drag.id!==event.pointerId)return;if(drag.active){suppressClick=true;save();}drag=undefined;delete dock!.dataset.dragging;if(trigger.hasPointerCapture(event.pointerId))trigger.releasePointerCapture(event.pointerId);}
 trigger.addEventListener('pointerup',finishDrag,{signal});trigger.addEventListener('pointercancel',finishDrag,{signal});
 window.addEventListener('resize',restore,{signal});window.visualViewport?.addEventListener('resize',()=>place(x,y),{signal});
 document.addEventListener('sakura:scene-state',sync,{signal});document.addEventListener('sakura:music-state',()=>{sync();if(open)layout();},{signal});document.addEventListener('visibilitychange',()=>{if(document.hidden)close(false,true);},{signal});
 reduced.addEventListener('change',sync,{signal});
 const observer=new MutationObserver(sync);observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-motion']});
 const unsubHero=subscribeScenePreference(sync,'hero'),unsubFooter=subscribeScenePreference(sync,'footer');
 restore();sync();dock.hidden=false;
 document.fonts.ready.then(()=>{if(open&&!signal.aborted)layout();});
 document.addEventListener('astro:before-swap',()=>{unsubHero();unsubFooter();observer.disconnect();motions.forEach(m=>m.stop());abort.abort();},{once:true,signal});
}
