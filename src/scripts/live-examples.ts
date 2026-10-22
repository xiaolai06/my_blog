// Opaque sandbox origins cannot request dev-server subresources in Astro 7.
// Transfer this one public image as data, keeping the frame without same-origin
// access. The raw example also works independently outside a sandbox.
let sceneData:Promise<string>|undefined;
function publicSceneData(){
 if(!sceneData)sceneData=fetch('/images/scenes-v2/home-hero-dusk-desktop-1280.webp')
  .then(response=>{if(!response.ok)throw new Error('Scene unavailable');return response.blob();})
  .then(blob=>new Promise<string>((resolve,reject)=>{
   const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob);
  })).catch(error=>{sceneData=undefined;throw error;});
 return sceneData;
}
export function setupLiveExamples(signal:AbortSignal){
 document.querySelectorAll<HTMLElement>('[data-live-example]').forEach(example=>{
  const details=example.querySelector<HTMLDetailsElement>('[data-demo-preview]')!;
  const frame=example.querySelector<HTMLIFrameElement>('[data-demo-frame]')!;
  const status=example.querySelector<HTMLElement>('[data-demo-status]')!;
  const reset=example.querySelector<HTMLButtonElement>('[data-demo-reset]')!;
  let loaded=false;
  function load(){
   const url=new URL(frame.dataset.src!,location.origin);
   url.searchParams.set('theme',document.documentElement.dataset.theme==='dark'?'dark':'light');
   if(document.documentElement.dataset.motion==='off'||matchMedia('(prefers-reduced-motion: reduce)').matches)url.searchParams.set('motion','off');
   status.textContent='正在加载样例…';
   frame.src=url.pathname+url.search;loaded=true;
  }
  details.addEventListener('toggle',()=>{
   if(details.open&&!loaded)load();
   // Destroy the isolated document when closed, so animations and timers stop.
   if(!details.open&&loaded){frame.removeAttribute('src');loaded=false;status.textContent='展开后加载样例';}
  },{signal});
  frame.addEventListener('load',async()=>{
   if(!loaded)return;
   status.textContent='可在下方操作 · 样例与正文相互独立';
   if(example.dataset.exampleId==='blog-shell')try{
    const image=await publicSceneData();
    if(!signal.aborted&&loaded)frame.contentWindow?.postMessage({type:'blog-demo-scene',image},'*');
   }catch{if(!signal.aborted&&loaded)status.textContent='风景素材暂时不可用，可重新演示；导航仍可操作';}
  },{signal});
  reset.addEventListener('click',load,{signal});
  // Only the active, known sandbox document can resize its own preview.
  // No same-origin access is needed; other windows cannot target this frame.
  window.addEventListener('message',event=>{
   if(!loaded||!details.open||event.source!==frame.contentWindow)return;
   const data=event.data;
   if(!data||data.type!=='blog-demo-resize'||typeof data.height!=='number'||!Number.isFinite(data.height))return;
   frame.style.setProperty('--demo-height',`${Math.max(240,Math.min(1800,Math.ceil(data.height)))}px`);
  },{signal});
  const theme=new MutationObserver(()=>{if(details.open)load();});
  theme.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme','data-motion']});
  signal.addEventListener('abort',()=>{theme.disconnect();frame.removeAttribute('src');},{once:true});
 });
}
