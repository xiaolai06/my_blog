export function setupPlayerDrag(panel:HTMLElement,handle:HTMLButtonElement){
  return setupFloatingPanelDrag(panel,[handle],{key:'sakura-music-player-position',resetIds:['music-position-reset']});
}

export function setupFloatingPanelDrag(panel:HTMLElement,handles:HTMLButtonElement[],options:{key:string;resetIds:string[]}){
  const KEY=options.key;
  let position:{x:number;y:number}|undefined;
  let drag:{id:number;x:number;y:number;left:number;top:number;active:boolean}|undefined;
  const visible=()=>document.body.classList.contains('music-mode')&&panel.getClientRects().length>0;
  const bounds=()=>({x:Math.max(16,innerWidth-panel.offsetWidth-16),y:Math.max(16,(visualViewport?.height||innerHeight)-panel.offsetHeight-16)});
  const clamp=(value:number,max:number)=>Math.max(16,Math.min(max,value));
  function place(x:number,y:number){
    if(!visible())return;
    const max=bounds();
    panel.dataset.positioned='true';
    Object.assign(panel.style,{left:`${clamp(x,max.x)}px`,top:`${clamp(y,max.y)}px`,right:'auto',bottom:'auto',transform:'none'});
  }
  function save(){
    const rect=panel.getBoundingClientRect(),max=bounds();
    position={x:(rect.left-16)/Math.max(1,max.x-16),y:(rect.top-16)/Math.max(1,max.y-16)};
    try{localStorage.setItem(KEY,JSON.stringify(position));}catch{}
  }
  function restore(){
    if(!visible()||!position)return;
    const max=bounds();place(16+position.x*(max.x-16),16+position.y*(max.y-16));
  }
  try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved&&Number.isFinite(saved.x)&&Number.isFinite(saved.y))position={x:Math.max(0,Math.min(1,saved.x)),y:Math.max(0,Math.min(1,saved.y))};}catch{}
  function reset(){position=undefined;delete panel.dataset.positioned;for(const property of ['left','top','right','bottom','transform'])panel.style.removeProperty(property);try{localStorage.removeItem(KEY);}catch{}}
  handles.forEach(handle=>{
  let suppressClick=false;
  handle.addEventListener('pointerdown',event=>{
    if(event.button!==0||!event.isPrimary)return;
    const rect=panel.getBoundingClientRect();
    drag={id:event.pointerId,x:event.clientX,y:event.clientY,left:rect.left,top:rect.top,active:false};
    handle.setPointerCapture(event.pointerId);
  });
  handle.addEventListener('pointermove',event=>{
    if(!drag||drag.id!==event.pointerId)return;
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
    if(!drag.active&&Math.hypot(dx,dy)<5)return;
    drag.active=true;panel.dataset.dragging='true';event.preventDefault();place(drag.left+dx,drag.top+dy);
  });
  function finish(event:PointerEvent){
    if(!drag||drag.id!==event.pointerId)return;
    if(drag.active){save();suppressClick=event.type==='pointerup';window.setTimeout(()=>suppressClick=false,0);}drag=undefined;delete panel.dataset.dragging;
    if(handle.hasPointerCapture(event.pointerId))handle.releasePointerCapture(event.pointerId);
  }
  handle.addEventListener('pointerup',finish);handle.addEventListener('pointercancel',finish);
  handle.addEventListener('click',event=>{if(suppressClick){suppressClick=false;event.preventDefault();event.stopImmediatePropagation();}},true);
  handle.addEventListener('keydown',event=>{
    if(event.key==='Home'){event.preventDefault();reset();return;}
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
    event.preventDefault();const rect=panel.getBoundingClientRect(),step=event.shiftKey?40:12;
    place(rect.left+(event.key==='ArrowRight'?step:event.key==='ArrowLeft'?-step:0),rect.top+(event.key==='ArrowDown'?step:event.key==='ArrowUp'?-step:0));save();
  });
  });
  options.resetIds.forEach(id=>document.getElementById(id)?.addEventListener('click',reset));
  window.addEventListener('resize',restore);visualViewport?.addEventListener('resize',restore);
  new ResizeObserver(()=>{if(visible()&&position)restore();}).observe(panel);
  document.addEventListener('astro:after-swap',restore);
  restore();
}
