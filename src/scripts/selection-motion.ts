import {createMotionScope} from './content-motion';

/** The indicator is absolute: selecting a tab never changes its layout or hit area. */
export function setupSelectionMotion(host:HTMLElement|null,selector:string,activeSelector:string,reduced:MediaQueryList,signal:AbortSignal){
 if(!host)return;
 const scope=createMotionScope(reduced,signal),indicator=document.createElement('span');
 indicator.className='selection-indicator';indicator.setAttribute('aria-hidden','true');
 host.append(indicator);host.dataset.selectionMotion='true';
 let initialized=false;
 function update(animate=true){
  const selected=host!.querySelector<HTMLElement>(`${selector}${activeSelector}`);
  if(!selected||!selected.getClientRects().length)return;
  const old=indicator.getBoundingClientRect(),target=selected.getBoundingClientRect(),parent=host!.getBoundingClientRect();
  const underline=host!.classList.contains('archive-types'),targetTop=underline?target.bottom-1:target.top,targetHeight=underline?2:target.height;
  indicator.style.left=`${target.left-parent.left+host!.scrollLeft-host!.clientLeft}px`;
  indicator.style.top=`${targetTop-parent.top+host!.scrollTop-host!.clientTop}px`;
  indicator.style.width=`${target.width}px`;indicator.style.height=`${targetHeight}px`;
  indicator.style.borderRadius=getComputedStyle(selected).borderRadius;
  if(initialized&&animate&&target.width&&targetHeight)scope.play(indicator,[{transform:`translate(${old.left-target.left}px,${old.top-targetTop}px) scale(${old.width/target.width},${old.height/targetHeight})`},{transform:'translate(0px,0px) scale(1,1)'}],{duration:240});
  else scope.cancelAll();
  initialized=true;
 }
 update(false);
 const selection=new MutationObserver(()=>update());
 selection.observe(host,{subtree:true,attributes:true,attributeFilter:['aria-selected','aria-pressed']});
 const resize=new ResizeObserver(()=>update());resize.observe(host);
 host.querySelectorAll(selector).forEach(button=>resize.observe(button));
 document.fonts.ready.then(()=>{if(!signal.aborted)update(false);});
 signal.addEventListener('abort',()=>{selection.disconnect();resize.disconnect();indicator.remove();delete host.dataset.selectionMotion;},{once:true});
 return {update};
}
