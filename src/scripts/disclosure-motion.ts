/** Reversible entrances and exits for the menu and native search dialog. */
export function createDisclosureMotion(element:HTMLElement|null,reduced:MediaQueryList,signal:AbortSignal){
 let animation:Animation|undefined;
 let desired=false;
 const dialog=element instanceof HTMLDialogElement?element:null;
 const enabled=()=>!reduced.matches&&document.documentElement.dataset.motion!=='off'&&!document.hidden;
 const settle=()=>{
  if(!element)return;
  if(!desired){if(dialog?.open)dialog.close();else if(!dialog)element.hidden=true;}
  element.inert=false;
  element.removeAttribute('data-closing');
 };
 const cancel=()=>{animation?.cancel();animation=undefined;};
 const setOpen=(open:boolean)=>{
  if(!element||signal.aborted||desired===open)return;
  desired=open;
  // Read before canceling so a rapid reversal continues from its current frame.
  const style=getComputedStyle(element);
  const opacity=animation?style.opacity:open?'0':'1';
  const transform=animation?style.transform:open?'translateY(-8px) scale(.985)':'none';
  cancel();
  if(open){if(dialog&&!dialog.open)dialog.showModal();else element.hidden=false;}
  element.inert=!open;
  element.toggleAttribute('data-closing',!open);
  if(!enabled()){settle();return;}
  animation=element.animate([
   {opacity,transform},
   {opacity:open?1:0,transform:open?'translateY(0) scale(1)':'translateY(-5px) scale(.99)'},
  ],{duration:open?260:160,easing:open?'cubic-bezier(.23,1,.32,1)':'cubic-bezier(.4,0,1,1)',fill:'both'});
  const running=animation;
  running.finished.then(()=>{if(animation!==running)return;settle();cancel();},()=>{});
 };
 const sync=()=>{if(!enabled()){cancel();settle();}};
 const observer=new MutationObserver(sync);
 observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-motion']});
 reduced.addEventListener('change',sync,{signal});
 document.addEventListener('visibilitychange',sync,{signal});
 signal.addEventListener('abort',()=>{cancel();observer.disconnect();},{once:true});
 return {setOpen,finish:()=>{cancel();settle();},isOpen:()=>desired};
}
