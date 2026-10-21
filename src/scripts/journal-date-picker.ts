type DateSelection={from:string;to:string};
type DatePickerOptions={selection:()=>DateSelection;entries:()=>string[];apply:(from:string,to:string)=>void};

/** A modal draft: browsing or cancelling never changes the applied query. */
export function setupJournalDatePicker(root:HTMLElement,signal:AbortSignal,options:DatePickerOptions){
 const dialog=root.querySelector<HTMLDialogElement>('[data-date-dialog]')!,trigger=root.querySelector<HTMLButtonElement>('[data-range-open]')!;
 const find=<T extends Element=HTMLElement>(selector:string)=>dialog.querySelector<T>(selector)!;
 const calendars=find('.range-calendars'),navigation=find('.range-calendar-navigation'),jump=find('.range-month-jump'),apply=find<HTMLButtonElement>('[data-range-apply]');
 const compact=matchMedia('(max-width:640px)'),today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const key=(date:Date)=>date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');
 const object=(value:string)=>new Date(value+'T12:00:00');
 let from='',to='',boundary='start',view=object(today),focusDate=today,jumpYear=view.getFullYear(),jumpPanel=0,yearMode=false,applied=false,backdropStart=false;
 const listen=(target:EventTarget,event:string,handler:(event:any)=>void)=>target.addEventListener(event,handler,{signal});
 function setJump(open:boolean){
  jump.hidden=!open;calendars.inert=open;navigation.inert=open;
  dialog.querySelectorAll('[data-range-month-title]').forEach(button=>button.setAttribute('aria-expanded',String(open&&button.getAttribute('data-range-month-title')===String(jumpPanel))));
  if(open){renderJump();jump.querySelector<HTMLButtonElement>('[aria-pressed=true]')?.focus({preventScroll:true});}
 }
 function renderJump(){
  const yearStart=Math.floor(jumpYear/12)*12;
  find('[data-range-year]').textContent=yearMode?yearStart+' — '+(yearStart+11):jumpYear+' 年';
  find('[data-range-year]').setAttribute('aria-expanded',String(yearMode));
  find('[data-range-year-prev]').setAttribute('aria-label',yearMode?'前十二年':'上一年');find('[data-range-year-next]').setAttribute('aria-label',yearMode?'后十二年':'下一年');
  const host=find('[data-range-months]');host.setAttribute('aria-label',yearMode?'选择年份':'选择月份');host.replaceChildren();
  for(let index=0;index<12;index++){
   const button=document.createElement('button');button.type='button';
   if(yearMode){const value=yearStart+index;button.dataset.rangeYearOption=String(value);button.textContent=value+' 年';button.setAttribute('aria-pressed',String(value===jumpYear));}
   else{const month=new Date(view.getFullYear(),view.getMonth()+jumpPanel,1),value=jumpYear+'-'+String(index+1).padStart(2,'0');button.dataset.rangeMonthOption=String(index);button.textContent=(index+1)+' 月';button.setAttribute('aria-pressed',String(value===key(month).slice(0,7)));const count=options.entries().filter(date=>date.startsWith(value)).length;if(count){const small=document.createElement('small');small.textContent=count+'篇';button.append(small);}}
   host.append(button);
  }
 }
 function render(focus=false){
  const counts=new Map<string,number>();options.entries().forEach(date=>counts.set(date,1+(counts.get(date)??0)));
  find('[data-range-start]').textContent=from?from.replaceAll('-','.'):'选择日期';find('[data-range-end]').textContent=to?to.replaceAll('-','.'):'选择日期';
  dialog.querySelectorAll<HTMLButtonElement>('[data-range-boundary]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.rangeBoundary===boundary)));
  const complete=!!from&&!!to;
  apply.disabled=!complete;
  const weekStart=object(today);weekStart.setDate(weekStart.getDate()-(weekStart.getDay()+6)%7);const weekEnd=new Date(weekStart);weekEnd.setDate(weekEnd.getDate()+6);const recentStart=object(today);recentStart.setDate(recentStart.getDate()-29);
  const presets:Record<string,string[]>={today:[today,today],week:[key(weekStart),key(weekEnd)],month:[today.slice(0,7)+'-01',key(new Date(object(today).getFullYear(),object(today).getMonth()+1,0))],recent:[key(recentStart),today]};
  dialog.querySelectorAll<HTMLButtonElement>('[data-range-preset]').forEach(button=>{const range=presets[button.dataset.rangePreset!];button.setAttribute('aria-pressed',String(complete&&from===range[0]&&to===range[1]));});
  const count=complete?options.entries().filter(date=>date>=from&&date<=to).length:0,days=complete?Math.round((Date.parse(to)-Date.parse(from))/86400000)+1:0;
  find('[data-range-status]').textContent=complete?'已选 '+days+' 天 · '+count+' 篇记录':from?'再选择结束日期，可切换月份。':'先选择开始日期，再选择结束日期。';
  for(let panel=0;panel<2;panel++){
   const month=new Date(view.getFullYear(),view.getMonth()+panel,1),year=month.getFullYear(),number=month.getMonth();
   find('[data-range-month-title="'+panel+'"] span').textContent=year+' 年 '+(number+1)+' 月';
   const host=find('[data-range-days="'+panel+'"]');host.setAttribute('aria-label',year+'年'+(number+1)+'月');
   const start=(month.getDay()+6)%7,fragment=document.createDocumentFragment(),prefix=key(month).slice(0,7),roving=focusDate.startsWith(prefix)?focusDate:prefix+'-01';
   for(let index=0;index<42;index++){
    const date=new Date(year,number,index-start+1),value=key(date),outside=date.getMonth()!==number,count=counts.get(value)??0,cell=document.createElement(outside?'span':'button');
    if(cell instanceof HTMLButtonElement){cell.type='button';cell.dataset.rangeDate=value;cell.tabIndex=value===roving?0:-1;cell.setAttribute('aria-pressed',String(!!from&&(value===from||value===to)));cell.setAttribute('aria-label',value+'，'+count+' 篇记录');if(value===today)cell.setAttribute('aria-current','date');}
    else{cell.className='other-month';cell.setAttribute('aria-hidden','true');}
    cell.classList.toggle('in-range',!!from&&!!to&&value>from&&value<to);cell.classList.toggle('has-entry',count>0);
    const label=document.createElement('span'),small=document.createElement('small');label.textContent=String(date.getDate());small.textContent=count?count+'篇':'';cell.append(label,small);fragment.append(cell);
   }
   host.replaceChildren(fragment);
  }
  if(!jump.hidden)renderJump();
  if(focus)find<HTMLButtonElement>('[data-range-date="'+focusDate+'"]')?.focus({preventScroll:true});
 }
 function monthVisible(value:string){const month=value.slice(0,7),first=key(new Date(view.getFullYear(),view.getMonth(),1)).slice(0,7),last=key(new Date(view.getFullYear(),view.getMonth()+(compact.matches?0:1),1)).slice(0,7);return month>=first&&month<=last;}
 function choose(value:string){
  if(boundary==='start'||!from){from=value;to='';boundary='end';}
  else{[from,to]=[from,value].sort();boundary='start';}
  focusDate=value;render(true);
 }
 function clearPreview(){dialog.querySelectorAll('.range-preview').forEach(cell=>cell.classList.remove('range-preview'));}
 function preview(value:string){clearPreview();if(!from||to||boundary!=='end')return;const [start,end]=[from,value].sort();dialog.querySelectorAll<HTMLButtonElement>('[data-range-date]').forEach(button=>button.classList.toggle('range-preview',button.dataset.rangeDate!>start&&button.dataset.rangeDate!<end));}
 function unlock(){document.documentElement.classList.remove('journal-date-open');}
 function close(){setJump(false);unlock();dialog.close();}
 listen(trigger,'click',()=>{
  const selected=options.selection();from=selected.from;to=selected.to;boundary='start';focusDate=from||today;view=object(focusDate);view.setDate(1);applied=false;setJump(false);render();
  document.documentElement.classList.add('journal-date-open');dialog.showModal();find<HTMLButtonElement>('[data-range-boundary="start"]').focus({preventScroll:true});
 });
 dialog.querySelectorAll('[data-range-close],[data-range-cancel]').forEach(button=>listen(button,'click',close));
 listen(dialog,'close',()=>{unlock();if(!applied&&!signal.aborted)trigger.focus({preventScroll:true});});
 listen(dialog,'pointerdown',(event:PointerEvent)=>{const rect=dialog.getBoundingClientRect();backdropStart=event.target===dialog&&(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom);});
 listen(dialog,'click',(event:MouseEvent)=>{const rect=dialog.getBoundingClientRect();if(backdropStart&&event.target===dialog&&(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom))close();backdropStart=false;});
 listen(dialog,'keydown',(event:KeyboardEvent)=>{if(event.key==='Escape'&&!jump.hidden){event.preventDefault();setJump(false);find<HTMLButtonElement>('[data-range-month-title="'+jumpPanel+'"]').focus({preventScroll:true});}});
 dialog.querySelectorAll<HTMLButtonElement>('[data-range-boundary]').forEach(button=>listen(button,'click',()=>{boundary=button.dataset.rangeBoundary!;const date=boundary==='start'?from:to||from;if(date){focusDate=date;if(!monthVisible(date)){view=object(date);view.setDate(1);}}setJump(false);render(true);}));
 listen(calendars,'click',event=>{const button=(event.target as Element).closest<HTMLButtonElement>('[data-range-date]');if(button)choose(button.dataset.rangeDate!);});
 listen(calendars,'pointerover',event=>{const button=(event.target as Element).closest<HTMLButtonElement>('[data-range-date]');if(button)preview(button.dataset.rangeDate!);});listen(calendars,'pointerleave',clearPreview);
 listen(calendars,'focusin',event=>{const button=(event.target as Element).closest<HTMLButtonElement>('[data-range-date]');if(button)preview(button.dataset.rangeDate!);});
 listen(calendars,'keydown',(event:KeyboardEvent)=>{
  const button=(event.target as Element).closest<HTMLButtonElement>('[data-range-date]');if(!button)return;
  const date=object(button.dataset.rangeDate!),weekday=(date.getDay()+6)%7,offsets:Record<string,number>={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7,Home:-weekday,End:6-weekday};
  if(event.key in offsets){event.preventDefault();date.setDate(date.getDate()+offsets[event.key]);}
  else if(event.key==='PageUp'||event.key==='PageDown'){event.preventDefault();const day=date.getDate();date.setDate(1);date.setMonth(date.getMonth()+(event.key==='PageUp'?-1:1));date.setDate(Math.min(day,new Date(date.getFullYear(),date.getMonth()+1,0).getDate()));}else return;
  focusDate=key(date);if(!monthVisible(focusDate)){view=new Date(date.getFullYear(),date.getMonth(),1);}render(true);
 });
 listen(find('[data-range-prev]'),'click',()=>{view=new Date(view.getFullYear(),view.getMonth()-1,1);render();});listen(find('[data-range-next]'),'click',()=>{view=new Date(view.getFullYear(),view.getMonth()+1,1);render();});
 dialog.querySelectorAll<HTMLButtonElement>('[data-range-month-title]').forEach(button=>listen(button,'click',()=>{jumpPanel=Number(button.dataset.rangeMonthTitle);jumpYear=new Date(view.getFullYear(),view.getMonth()+jumpPanel,1).getFullYear();yearMode=false;setJump(true);}));
 listen(find('[data-range-year]'),'click',()=>{yearMode=!yearMode;renderJump();});
 listen(find('[data-range-year-prev]'),'click',()=>{jumpYear=Math.max(100,jumpYear-(yearMode?12:1));renderJump();});listen(find('[data-range-year-next]'),'click',()=>{jumpYear=Math.min(9987,jumpYear+(yearMode?12:1));renderJump();});
 listen(jump,'click',event=>{
  const year=(event.target as Element).closest<HTMLButtonElement>('[data-range-year-option]'),month=(event.target as Element).closest<HTMLButtonElement>('[data-range-month-option]');
  if(year){jumpYear=Number(year.dataset.rangeYearOption);yearMode=false;renderJump();}
  if(month){view=new Date(jumpYear,Number(month.dataset.rangeMonthOption)-jumpPanel,1);focusDate=key(new Date(jumpYear,Number(month.dataset.rangeMonthOption),1));setJump(false);render(true);}
 });
 listen(find('[data-range-jump-back]'),'click',()=>{setJump(false);find<HTMLButtonElement>('[data-range-month-title="'+jumpPanel+'"]').focus({preventScroll:true});});
 dialog.querySelectorAll<HTMLButtonElement>('[data-range-preset]').forEach(button=>listen(button,'click',()=>{
  const first=object(today),last=object(today),preset=button.dataset.rangePreset;
  if(preset==='week'){first.setDate(first.getDate()-(first.getDay()+6)%7);last.setTime(first.getTime());last.setDate(last.getDate()+6);}
  if(preset==='month'){first.setDate(1);last.setMonth(last.getMonth()+1,0);}
  if(preset==='recent')first.setDate(first.getDate()-29);
  from=key(first);to=key(last);view=new Date(first.getFullYear(),first.getMonth(),1);focusDate=from;boundary='start';setJump(false);render();
 }));
 listen(apply,'click',()=>{if(!from||!to)return;applied=true;close();options.apply(from,to);});
 listen(compact,'change',()=>{if(dialog.open){if(!monthVisible(focusDate)){view=object(focusDate);view.setDate(1);}render();}});
 signal.addEventListener('abort',()=>{unlock();if(dialog.open)dialog.close();},{once:true});
}
