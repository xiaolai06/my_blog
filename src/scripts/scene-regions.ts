import {readSceneTime,subscribeSceneClock,type SceneTime,type FooterPhase} from './scene-clock';
import {readScenePreference,subscribeScenePreference} from './scene-preference';
import {sceneAsset,sceneLabels,type SceneFamily,type SceneRegion} from './scene-catalog';
import {setupImageScenes} from './image-scene';
const mounted=new WeakSet<HTMLElement>();
export function setupSceneRegions(){
 setupImageScenes();
 document.querySelectorAll<HTMLElement>('[data-scene-region]').forEach(owner=>{
  if(mounted.has(owner))return;
  const player=owner.querySelector<HTMLElement>('[data-video-scene], [data-image-scene]');if(!player)return;
  const playerEvent=player.hasAttribute('data-image-scene')?'image-scene':'video-scene';
  mounted.add(owner);
  const region=owner.dataset.sceneRegion as SceneRegion,family=owner.dataset.sceneFamily as SceneFamily;
  const abort=new AbortController();let requested:string|undefined;
  const status=owner.querySelector<HTMLElement>('[data-scene-status]');
  function announce(){document.dispatchEvent(new CustomEvent('sakura:scene-state',{detail:{region}}));}
  function update(time:SceneTime,manual=false){
   const{choice}=readScenePreference(time,region);
   let phase:FooterPhase=choice==='auto'?time.footer:choice;
   // The independent music room still uses its existing two-state video wallpaper.
   if(playerEvent==='video-scene'&&family==='home'&&region==='hero')phase=phase==='night'?'night':'dusk';
   const asset=playerEvent==='video-scene'&&family==='home'&&region==='hero'
    ? {src:`/videos/hero-${phase==='night'?'night':'sunset'}-v4.mp4`,poster:phase==='night'?'/images/sakura-moonlight-v3.webp':'/images/sakura-sunset.webp',phase:phase==='night'?'night':'sunset'}
    : sceneAsset(family,region,phase);
   owner.dataset.sceneMode=choice;owner.dataset.ambience=phase;owner.dataset.sceneTarget=asset.phase;
   if(status)status.textContent=`${choice==='auto'?'随本机时间':'预览'} · ${sceneLabels[phase]}`;
   if(requested!==asset.src){
    const duration=requested?manual?900:1800:0;requested=asset.src;owner.dataset.sceneError='false';
    player!.dispatchEvent(new CustomEvent(`${playerEvent}-change`,{detail:{...asset,duration}}));
   }
   announce();
  }
  player.addEventListener(`${playerEvent}-settled`,event=>{owner.dataset.phase=(event as CustomEvent).detail.phase;owner.dataset.sceneReady='true';owner.dataset.sceneError='false';announce();},{signal:abort.signal});
  player.addEventListener(`${playerEvent}-error`,()=>{requested=undefined;owner.dataset.sceneError='true';if(status)status.textContent='场景暂未载入，保留当前画面';announce();},{signal:abort.signal});
  const unsubClock=subscribeSceneClock(update),unsubPreference=subscribeScenePreference(()=>update(readSceneTime(),true),region);
  function cleanup(){unsubClock();unsubPreference();abort.abort();mounted.delete(owner);}
  document.addEventListener('astro:before-swap',cleanup,{once:true,signal:abort.signal});
  window.addEventListener('pagehide',event=>{if(!(event as PageTransitionEvent).persisted)cleanup();},{signal:abort.signal});
 });
}
