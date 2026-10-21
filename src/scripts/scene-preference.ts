import { readSceneTime, type FooterPhase, type HeroPhase, type SceneTime } from './scene-clock';
import type { SceneChoice, SceneRegion } from './scene-catalog';
export type { SceneChoice } from './scene-catalog';
interface Preference { choice: SceneChoice; expiresAt: number }
const eventName='sakura:scene-preference';
const memory:Partial<Record<SceneRegion,Preference>>={};
const key=(region:SceneRegion)=>`sakura-scene-${region}`;
const validChoice=(value:unknown):value is SceneChoice=>typeof value==='string'&&['auto','dawn','day','dusk','night'].includes(value);
export function readScenePreference(time=readSceneTime(),region:SceneRegion='hero'):Preference {
 let value:Partial<Preference>|undefined;
 try {
  // Migrate an earlier shared preview without overwriting either region.
  const saved=localStorage.getItem(key(region))??localStorage.getItem('sakura-scene-preference');
  value=memory[region]??(saved?JSON.parse(saved):undefined);
 }catch{value=memory[region];}
 if(!value||!validChoice(value.choice)||typeof value.expiresAt!=='number'||!Number.isFinite(value.expiresAt))return{choice:'auto',expiresAt:0};
 if(value.choice==='auto'||value.expiresAt<=time.now.getTime())return{choice:'auto',expiresAt:0};
 return{choice:value.choice,expiresAt:Math.min(value.expiresAt,time.nextBoundary)};
}
export function chooseScene(choice:SceneChoice,region:SceneRegion='hero'){
 if(!validChoice(choice))return;
 const time=readSceneTime();
 const next={choice,expiresAt:choice==='auto'?0:Math.min(time.nextBoundary,time.now.getTime()+10*60_000)};
 try{localStorage.setItem(key(region),JSON.stringify(next));delete memory[region];}catch{memory[region]=next;}
 window.dispatchEvent(new CustomEvent(eventName,{detail:{region}}));
}
export function resolveFooterScene(time:SceneTime):FooterPhase{const{choice}=readScenePreference(time,'footer');return choice==='auto'?time.footer:choice;}
export function resolveHeroScene(time:SceneTime):HeroPhase{const{choice}=readScenePreference(time,'hero');return choice==='auto'?time.hero:choice==='night'?'night':'sunset';}
export function subscribeScenePreference(listener:()=>void,region:SceneRegion='hero'):()=>void{
 let timer:number|undefined;
 function schedule(){clearTimeout(timer);const p=readScenePreference(readSceneTime(),region);if(p.choice!=='auto')timer=window.setTimeout(update,Math.max(1,p.expiresAt-Date.now()));}
 function update(){listener();schedule();}
 function preference(event:Event){if((event as CustomEvent).detail?.region===region)update();}
 function storage(event:StorageEvent){if(event.key===key(region)||event.key==='sakura-scene-preference'||event.key===null)update();}
 function resume(){if(!document.hidden)update();}
 window.addEventListener(eventName,preference);window.addEventListener('storage',storage);document.addEventListener('visibilitychange',resume);schedule();
 return()=>{clearTimeout(timer);window.removeEventListener(eventName,preference);window.removeEventListener('storage',storage);document.removeEventListener('visibilitychange',resume);};
}
