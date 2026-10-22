import {createMotionScope} from './content-motion';

/** Animate the picture within the native dialog, preserving its focus trap. */
export function createImageViewerMotion(dialog:HTMLDialogElement|null,reduced:MediaQueryList,signal:AbortSignal){
 const motion=createMotionScope(reduced,signal);
 let source:HTMLImageElement|undefined,revision=0,desired=false;
 const picture=()=>dialog?.querySelector<HTMLImageElement>('.work-lightbox-viewport>img');
 function sourceTransform(image:HTMLImageElement){
  if(!source?.isConnected||dialog?.classList.contains('is-zoomed'))return 'scale(.985)';
  const from=source.getBoundingClientRect(),to=image.getBoundingClientRect();
  if(!from.width||!to.width||from.bottom<0||from.top>innerHeight)return 'scale(.985)';
  const fit=Math.min(to.width/(image.naturalWidth||1600),to.height/(image.naturalHeight||960));
  const scale=Math.min(1,from.width/((image.naturalWidth||1600)*fit));
  return `translate(${from.left+from.width/2-to.left-to.width/2}px,${from.top+from.height/2-to.top-to.height/2}px) scale(${scale})`;
 }
 function openFrom(original:HTMLImageElement){
  if(!dialog||signal.aborted)return;
  source=original;desired=true;revision++;
  const image=picture(),wasOpen=dialog.open;
  const current=image&&wasOpen?getComputedStyle(image).transform:undefined;
  motion.cancelAll();dialog.inert=false;dialog.removeAttribute('data-closing');
  if(!wasOpen)dialog.showModal();
  if(image)motion.play(image,[{opacity:.5,transform:current||sourceTransform(image)},{opacity:1,transform:'none'}],{duration:280});
  motion.play(dialog,[{opacity:wasOpen?1:.7},{opacity:1}],{duration:180});
 }
 function close(){
  if(!dialog?.open||!desired)return;
  desired=false;const token=++revision,image=picture();
  const style=image?getComputedStyle(image):undefined;
  const from={opacity:style?.opacity||'1',transform:style?.transform||'none'};
  const target=image?sourceTransform(image):'none';
  motion.cancelAll();dialog.inert=true;dialog.setAttribute('data-closing','');
  const animation=image?motion.play(image,[from,{opacity:0,transform:target}],{duration:200,easing:'cubic-bezier(.4,0,1,1)'}):undefined;
  const finish=()=>{if(revision!==token||desired)return;dialog.close();dialog.inert=false;dialog.removeAttribute('data-closing');motion.cancelAll();};
  if(animation)animation.finished.then(finish,finish);else finish();
 }
 return {openFrom,close};
}
