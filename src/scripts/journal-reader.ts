/** Enhance the document without making reading depend on JavaScript. */
export function setupJournalReader(signal:AbortSignal){
 const root=document.querySelector<HTMLElement>('[data-journal-reader]');if(!root)return;
 const body=root.querySelector<HTMLElement>('[data-reading-body]')!,progress=document.querySelector<HTMLElement>('[data-reader-progress]');
 const percent=root.querySelector<HTMLElement>('[data-reader-percent]'),toc=root.querySelector<HTMLDetailsElement>('.reader-toc');
 const links=Array.from(root.querySelectorAll<HTMLAnchorElement>('[data-toc-link]'));
 const headings=links.map(link=>document.getElementById(decodeURIComponent(link.hash.slice(1))));
 const timers=new Map<HTMLButtonElement,number>(),tocTrigger=toc?.querySelector<HTMLElement>('summary'),tocPanel=toc?.querySelector<HTMLElement>('.reader-toc-panel');
 const listen=(target:EventTarget,event:string,handler:(event:any)=>void,options:AddEventListenerOptions={})=>target.addEventListener(event,handler,{...options,signal});
 function placeToc(){
  if(!toc?.open||!tocTrigger||!tocPanel)return;
  const rect=tocTrigger.getBoundingClientRect(),headerBottom=document.querySelector('.site-header')?.getBoundingClientRect().bottom??0;
  const below=innerHeight-rect.bottom-26,above=rect.top-Math.max(12,headerBottom+12)-14,up=below<220&&above>below;
  tocPanel.style.top=up?'auto':'calc(100% + 14px)';tocPanel.style.bottom=up?'calc(100% + 14px)':'auto';
  const nav=tocPanel.querySelector<HTMLElement>('nav')!;nav.style.maxHeight=`${Math.max(80,Math.min(460,(up?above:below)-82))}px`;
 }
 if(toc){toc.open=false;listen(toc,'toggle',placeToc);listen(toc.querySelector('[data-toc-close]')!,'click',()=>{toc.open=false;tocTrigger?.focus({preventScroll:true});});}
 listen(document,'click',event=>{if(toc&&!toc.contains(event.target as Node))toc.open=false;});
 listen(document,'keydown',(event:KeyboardEvent)=>{if(event.key==='Escape'&&toc?.open){event.preventDefault();toc.open=false;tocTrigger?.focus({preventScroll:true});}});
 listen(document,'focusin',event=>{if(toc&&!toc.contains(event.target as Node))toc.open=false;});
 // Saved size changes the prose, not the article's available width.
 let fontSize=19;
 try{const saved=localStorage.getItem('sakura-reader-font-px');if(saved&&Number.isFinite(Number(saved)))fontSize=Math.max(16,Math.min(24,Number(saved)));}catch{}
 const fontButtons=Array.from(root.querySelectorAll<HTMLButtonElement>('[data-reader-font]'));
 function setFont(){root!.style.setProperty('--reader-font',fontSize+'px');root!.querySelector('[data-reader-font-label]')!.textContent=fontSize+'px';fontButtons.forEach(button=>button.disabled=button.dataset.readerFont==='smaller'?fontSize===16:fontSize===24);}
 fontButtons.forEach(button=>listen(button,'click',()=>{fontSize=Math.max(16,Math.min(24,fontSize+(button.dataset.readerFont==='larger'?1:-1)));setFont();try{localStorage.setItem('sakura-reader-font-px',String(fontSize));}catch{}schedule();}));setFont();
 links.forEach((link,index)=>{
  headings[index]?.setAttribute('tabindex','-1');
  listen(link,'click',()=>{if(toc)toc.open=false;headings[index]?.focus({preventScroll:true});});
 });
 try{const saved=sessionStorage.getItem('sakura-journal-return');if(saved?.startsWith('/blog/')){const url=new URL(saved,location.origin);if(url.origin===location.origin&&url.pathname==='/blog/')root.querySelectorAll<HTMLAnchorElement>('[data-reader-back]').forEach(link=>link.href=url.pathname+url.search);}}catch{}
 const feedback=document.createElement('span');feedback.className='sr-only';feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');root.append(feedback);
 body.querySelectorAll<HTMLPreElement>('pre').forEach(pre=>{
  if(pre.closest('.reader-code-block'))return;
  const wrapper=document.createElement('div');wrapper.className='reader-code-block';
  const toolbar=document.createElement('div');toolbar.className='reader-code-toolbar';
  const language=document.createElement('span'),name=pre.dataset.language??'code';
  language.textContent=({ts:'TypeScript',js:'JavaScript',html:'HTML',css:'CSS',md:'Markdown',py:'Python',sh:'Shell',text:'TEXT'} as Record<string,string>)[name]??name.toUpperCase();
  const button=document.createElement('button');button.type='button';button.textContent='复制';button.setAttribute('aria-label',`复制 ${language.textContent} 代码`);
  toolbar.append(language,button);pre.before(wrapper);wrapper.append(toolbar,pre);pre.tabIndex=0;pre.setAttribute('aria-label',`${language.textContent} 代码，可横向滚动`);
  listen(button,'click',async()=>{
   clearTimeout(timers.get(button));button.disabled=true;
   try{await navigator.clipboard.writeText(pre.querySelector('code')?.textContent??pre.textContent??'');if(signal.aborted)return;button.textContent='已复制';feedback.textContent='代码已复制。';}
   catch{if(signal.aborted)return;button.textContent='请手动复制';feedback.textContent='暂时无法自动复制，请选中代码后复制。';}
   finally{if(!signal.aborted){button.disabled=false;timers.set(button,window.setTimeout(()=>{button.textContent='复制';timers.delete(button);},1800));}}
  });
 });
 body.querySelectorAll<HTMLTableElement>('table').forEach((table,index)=>{
  if(table.closest('.reader-table-wrap'))return;
  const wrapper=document.createElement('div');wrapper.className='reader-table-wrap';wrapper.tabIndex=0;wrapper.setAttribute('role','region');wrapper.setAttribute('aria-label',`表格 ${index+1}，宽表可横向滚动`);table.before(wrapper);wrapper.append(table);
 });
 let frame=0,lastActive=-2,lastPercent=-1;
 function update(){
  frame=0;if(signal.aborted)return;
  const rect=body.getBoundingClientRect(),value=Math.max(0,Math.min(1,(innerHeight*.2-rect.top)/Math.max(1,rect.height-innerHeight*.6)));
  if(progress)progress.style.transform=`scaleX(${value})`;
  const rounded=Math.round(value*100);if(percent&&rounded!==lastPercent){percent.textContent=`${rounded}%`;lastPercent=rounded;}
  let active=-1;headings.forEach((heading,index)=>{if(heading&&heading.getBoundingClientRect().top<Math.max(150,innerHeight*.2))active=index;});
  if(active!==lastActive){links.forEach((link,index)=>{if(index===active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});const section=root!.querySelector('[data-reader-section]');if(section)section.textContent=active>=0?headings[active]?.textContent??'正在阅读':'开始阅读';lastActive=active;}
  placeToc();
 }
 function schedule(){if(!signal.aborted&&!frame)frame=requestAnimationFrame(update);}
 listen(window,'scroll',schedule,{passive:true});listen(window,'resize',schedule);listen(window,'hashchange',schedule);
 const resize=new ResizeObserver(schedule);resize.observe(body);document.fonts.ready.then(schedule);update();root.dataset.readerReady='true';
 signal.addEventListener('abort',()=>{resize.disconnect();if(frame)cancelAnimationFrame(frame);timers.forEach(timer=>clearTimeout(timer));},{once:true});
}
