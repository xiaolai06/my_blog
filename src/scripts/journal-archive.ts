import {journalTypes,journalPageSize as pageSize} from '../data/journal';
import {setupJournalDatePicker} from './journal-date-picker';
import {animateCollection,capturePositions,createMotionScope} from './content-motion';
import {setupSelectionMotion} from './selection-motion';

/** Calendar, topics and the list share one inclusive, URL-backed date range. */
export function setupJournalArchive(signal:AbortSignal){
 const root=document.querySelector<HTMLElement>('[data-journal-archive]');if(!root)return;
 const find=<T extends Element=HTMLElement>(selector:string)=>root.querySelector<T>(selector)!;
 const query=find<HTMLInputElement>('#journal-query'),sort=find<HTMLDetailsElement>('[data-journal-sort]');
 const sortTrigger=sort.querySelector<HTMLElement>('summary')!,sortOptions=Array.from(sort.querySelectorAll<HTMLButtonElement>('[data-sort-option]'));
 const host=find('.archive-results'),rows=Array.from(host.querySelectorAll<HTMLAnchorElement>('[data-archive-entry]'));
 const pagination=find<HTMLElement>('[data-journal-pagination]'),pageNumbers=find('[data-page-numbers]'),pageJump=find<HTMLFormElement>('[data-page-jump]'),pageInput=find<HTMLInputElement>('#journal-page-number');
 const types=Array.from(root.querySelectorAll<HTMLButtonElement>('[data-journal-type]'));
 const topics=Array.from(root.querySelectorAll<HTMLButtonElement>('[data-journal-topic]'));
 const availableTopics=new Set(topics.map(button=>button.dataset.journalTopic!));
 const rowTopics=new Map(rows.map(row=>[row,new Set<string>(JSON.parse(row.dataset.entryTags??'[]'))]));
 const matchButtons=Array.from(root.querySelectorAll<HTMLButtonElement>('[data-topic-match]'));
 const active=find('[data-journal-active]'),clear=find<HTMLButtonElement>('.journal-query-clear'),empty=find('.journal-empty');
 const days=find('.diary-days'),picker=find('.diary-month-picker'),pickerButton=find<HTMLButtonElement>('[data-calendar-picker]');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),motion=createMotionScope(reduced,signal);
 setupSelectionMotion(root.querySelector('.archive-types'),'button[data-journal-type]','[aria-pressed=true]',reduced,signal);
 let calendarMonth='';
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const key=(date:Date)=>date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');
 const dateObject=(value:string)=>new Date(value+'T12:00:00');
 const valid=(value:string)=>/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value))&&key(dateObject(value))===value;
 type State={q:string;type:string;topics:string[];match:'any'|'all';from:string;to:string;period:string;sort:string;page:number};
 let state:State,view=dateObject(today),pickerYear=view.getFullYear(),focusDate=today;
 const listen=(target:EventTarget,event:string,handler:(event:any)=>void)=>target.addEventListener(event,handler,{signal});
 const monthRange=(value:string)=>{const date=dateObject(value.slice(0,7)+'-01');return [key(date),key(new Date(date.getFullYear(),date.getMonth()+1,0))];};
 function moveView(value:string){view=dateObject(value.length===7?value+'-01':value);pickerYear=view.getFullYear();focusDate=key(view);}
 function read(){
  const params=new URLSearchParams(location.search),type=params.get('type')??'all',date=params.get('date')??'',month=params.get('month')??'',year=params.get('year')??'';
  let from=params.get('from')??'',to=params.get('to')??'';
  if(valid(date))from=to=date;
  else if(/^\d{4}-(0[1-9]|1[0-2])$/.test(month))[from,to]=monthRange(month);
  else if(/^\d{4}$/.test(year)){from=year+'-01-01';to=year+'-12-31';}
  if(!valid(from)||!valid(to)||from>to)from=to='';
  const page=Number(params.get('page')??1);
  state={q:params.get('q')??'',type:journalTypes.some(item=>item.id===type)?type:'all',topics:[...new Set(params.getAll('topic').filter(topic=>availableTopics.has(topic)))],match:params.get('match')==='all'?'all':'any',from,to,period:from?params.get('period')??(from===to?'day':'custom'):'all',sort:['newest','oldest','updated'].includes(params.get('sort')??'')?params.get('sort')!:'newest',page:Number.isSafeInteger(page)&&page>0?page:1};
  if(from)moveView(from);query.value=state.q;
 }
 function writeURL(mode:'replace'|'push'='replace'){
  const url=new URL(location.href);['q','type','topic','match','year','month','date','from','to','period','sort','page'].forEach(name=>url.searchParams.delete(name));
  state.topics.forEach(topic=>url.searchParams.append('topic',topic));if(state.match==='all')url.searchParams.set('match','all');
  if(state.q.trim())url.searchParams.set('q',state.q.trim());if(state.type!=='all')url.searchParams.set('type',state.type);if(state.sort!=='newest')url.searchParams.set('sort',state.sort);
  if(state.from){if(state.from===state.to)url.searchParams.set('date',state.from);else{url.searchParams.set('from',state.from);url.searchParams.set('to',state.to);if(state.period!=='custom')url.searchParams.set('period',state.period);}}
  if(state.page>1)url.searchParams.set('page',String(state.page));
  if(url.search!==location.search)history[mode==='push'?'pushState':'replaceState'](history.state,'',url.pathname+url.search+url.hash);
 }
 function textMatches(row:HTMLElement){
  const tags=rowTopics.get(row as HTMLAnchorElement)!;
  const topicMatch=!state.topics.length||(state.match==='all'?state.topics.every(topic=>tags.has(topic)):state.topics.some(topic=>tags.has(topic)));
  return topicMatch&&(state.type==='all'||row.dataset.entryType===state.type)&&state.q.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean).every(word=>(row.dataset.search??'').toLocaleLowerCase().includes(word));
 }
 function dateLabel(){return !state.from?'全部日期':state.from===state.to?state.from.replaceAll('-','.'):state.from.replaceAll('-','.')+' — '+state.to.replaceAll('-','.');}
 function placePicker(){if(picker.hidden)return;const rect=pickerButton.getBoundingClientRect(),width=Math.min(300,innerWidth-32),height=picker.offsetHeight,below=innerHeight-rect.bottom-12,above=rect.top-12;picker.style.width=width+'px';picker.style.left=Math.max(16,Math.min(rect.left+rect.width/2-width/2,innerWidth-width-16))+'px';picker.style.top=Math.max(12,below<height&&above>below?rect.top-height-7:Math.min(rect.bottom+7,innerHeight-height-12))+'px';}
 function setPicker(open:boolean){picker.hidden=!open;pickerButton.setAttribute('aria-expanded',String(open));if(open){pickerYear=view.getFullYear();renderCalendar();placePicker();picker.querySelector<HTMLButtonElement>('[aria-pressed=true]')?.focus({preventScroll:true});}}
 function renderCalendar(focus=false){
  const keepCalendarFocus=days.contains(document.activeElement);
  const year=view.getFullYear(),month=view.getMonth(),prefix=key(view).slice(0,7),candidates=rows.filter(textMatches),counts=new Map<string,number>();
  const monthDirection=calendarMonth?Math.sign(prefix.localeCompare(calendarMonth)):0;calendarMonth=prefix;
  candidates.forEach(row=>counts.set(row.dataset.date!,1+(counts.get(row.dataset.date!)??0)));
  find('[data-calendar-title]').textContent=year+' 年 '+(month+1)+' 月';
  const start=(new Date(year,month,1).getDay()+6)%7,selected=focusDate.startsWith(prefix)?focusDate:today.startsWith(prefix)?today:prefix+'-01',fragment=document.createDocumentFragment();
  const from=state.from,to=state.to,cells=Math.ceil((start+new Date(year,month+1,0).getDate())/7)*7;
  for(let index=0;index<cells;index++){
   const date=new Date(year,month,index-start+1),value=key(date),count=counts.get(value)??0,button=document.createElement('button'),number=document.createElement('span'),small=document.createElement('small');
   button.type='button';button.dataset.diaryDate=value;button.tabIndex=value===selected?0:-1;number.textContent=String(date.getDate());small.textContent=count?count+'篇':'0';button.append(number,small);
   button.classList.toggle('other-month',date.getMonth()!==month);button.classList.toggle('has-entry',count>0);
   button.classList.toggle('in-range',!!from&&!!to&&value>from&&value<to);button.classList.toggle('range-end',!!to&&value===to&&from!==to);
   button.setAttribute('aria-pressed',String(!!from&&(value===from||value===to)));button.setAttribute('aria-label',value+'，'+count+' 篇符合条件的记录');if(value===today)button.setAttribute('aria-current','date');fragment.append(button);
  }
  days.replaceChildren(fragment);
  if(monthDirection){motion.play(days,[{opacity:.5,translate:`${monthDirection*6}px 0`},{opacity:1,translate:'0 0'}],{duration:180});motion.play(find('[data-calendar-title]'),[{opacity:.5},{opacity:1}],{duration:180});}
  const count=candidates.filter(row=>row.dataset.date!.startsWith(prefix)).length;
  find('[data-calendar-month-count]').textContent=count+' 篇 / 本月';
  find('[data-calendar-note]').textContent=dateLabel();find('.diary-date-state').hidden=!state.from;
  const [monthFrom,monthTo]=monthRange(today),weekFrom=dateObject(today);weekFrom.setDate(weekFrom.getDate()-(weekFrom.getDay()+6)%7);const weekTo=new Date(weekFrom);weekTo.setDate(weekTo.getDate()+6);
  const presets:Record<string,boolean>={today:state.from===today&&state.to===today,latest:!!rows[0]&&state.from===rows[0].dataset.date&&state.to===state.from,month:state.from===monthFrom&&state.to===monthTo,week:state.from===key(weekFrom)&&state.to===key(weekTo)};
  root!.querySelectorAll<HTMLButtonElement>('[data-date-shortcut]').forEach(button=>button.setAttribute('aria-pressed',String(presets[button.dataset.dateShortcut!]??false)));
  if(!picker.hidden){
   find('[data-calendar-year]').textContent=pickerYear+' 年';const months=find('.diary-months');months.replaceChildren();
   for(let value=1;value<=12;value++){const monthKey=pickerYear+'-'+String(value).padStart(2,'0'),button=document.createElement('button');button.type='button';button.dataset.diaryMonth=monthKey;button.textContent=value+' 月';button.setAttribute('aria-pressed',String(monthKey===prefix));const count=candidates.filter(row=>row.dataset.date!.startsWith(monthKey)).length;if(count){const small=document.createElement('small');small.textContent=count+'篇';button.append(small);}months.append(button);}
  }
  if(focus||keepCalendarFocus)days.querySelector<HTMLButtonElement>('[data-diary-date="'+focusDate+'"]')?.focus({preventScroll:true});
 }
 function render(animate=false,historyMode:'replace'|'push'='replace',pageDirection=0){
  const previousPositions=capturePositions(rows);motion.cancelAll();
  const matched=rows.filter(row=>textMatches(row)&&(!state.from||(row.dataset.date!>=state.from&&row.dataset.date!<=state.to)));
  const date=(row:HTMLElement)=>Date.parse(state.sort==='updated'?row.dataset.updated!:row.dataset.date!);matched.sort((a,b)=>(date(a)-date(b))*(state.sort==='oldest'?1:-1));matched.forEach(row=>host.append(row));
  const pages=Math.max(1,Math.ceil(matched.length/pageSize));state.page=Math.min(state.page,pages);
  const start=(state.page-1)*pageSize,visible=matched.slice(start,start+pageSize),visibleSet=new Set(visible);rows.forEach(row=>row.hidden=!visibleSet.has(row));
  types.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.journalType===state.type)));
  sortOptions.forEach(button=>button.setAttribute('aria-checked',String(button.dataset.sortOption===state.sort)));find('[data-sort-label]').textContent=sortOptions.find(button=>button.dataset.sortOption===state.sort)!.querySelector('span')!.textContent;
  const label=journalTypes.find(type=>type.id===state.type)?.label??'全部记录';find('[data-journal-list-title]').textContent=state.from===state.to&&state.from?state.from.replaceAll('-','.')+' · '+label:label;
  find('[data-result-prefix]').textContent=state.q.trim()||state.type!=='all'||state.from||state.topics.length?'找到':'共';find('[data-result-total]').textContent=String(matched.length);
  find('[data-result-range]').textContent=matched.length?`第 ${start+1}–${start+visible.length} 篇 · 第 ${state.page} / ${pages} 页`:'';
  pagination.hidden=!matched.length;pageInput.max=String(pages);pageInput.value=String(state.page);
  pagination.querySelectorAll<HTMLButtonElement>('[data-page-step]').forEach(button=>button.disabled=button.dataset.pageStep==='-1'?state.page===1:state.page===pages);
  empty.hidden=matched.length>0;find('[data-empty-message]').textContent=state.topics.length?'没有记录符合当前组合。可以取消部分主题、切换为任一匹配，或调整日期与关键词。':state.from?'这段时间还没有符合条件的记录，可以选择其他日期，或查看全部。':state.q.trim()?'没有找到匹配的记录，试试其他关键词。':'这一类还没有发布记录，可以先翻翻其他内容。';
  clear.hidden=!state.q;active.replaceChildren();if(state.from){const chip=document.createElement('button');chip.type='button';chip.dataset.removeDate='';chip.textContent=dateLabel();chip.setAttribute('aria-label','移除日期筛选：'+dateLabel());active.append(chip);}active.hidden=!active.children.length;
  state.topics.forEach(topic=>{const chip=document.createElement('button');chip.type='button';chip.dataset.removeTopic=topic;chip.textContent=topic;chip.setAttribute('aria-label','取消主题：'+topic);active.append(chip);});active.hidden=!active.children.length;
  topics.forEach(button=>{button.disabled=false;button.setAttribute('aria-pressed',String(state.topics.includes(button.dataset.journalTopic!)));});
  matchButtons.forEach(button=>{button.disabled=false;button.setAttribute('aria-pressed',String(button.dataset.topicMatch===state.match));});
  find('[data-topic-selection-count]').textContent=state.topics.length?'已选 '+state.topics.length:'可多选';
  find<HTMLButtonElement>('[data-clear-topics]').disabled=!state.topics.length;
  find('[data-topic-help]').textContent=state.match==='all'?'显示同时包含全部已选主题的记录，再次点击可取消。':'显示包含任一已选主题的记录，再次点击可取消。';
  writeURL(historyMode);renderCalendar();
  pageNumbers.replaceChildren();
  const selectedPages=new Set([1,pages,state.page-1,state.page,state.page+1]);let previous=0;
  [...selectedPages].filter(page=>page>=1&&page<=pages).sort((a,b)=>a-b).forEach(page=>{
   if(page-previous>1){const gap=document.createElement('span');gap.textContent='…';gap.setAttribute('aria-hidden','true');pageNumbers.append(gap);}
   const link=document.createElement('a'),url=new URL(location.href);if(page===1)url.searchParams.delete('page');else url.searchParams.set('page',String(page));
   link.href=url.pathname+url.search;link.dataset.page=String(page);link.textContent=String(page);link.setAttribute('aria-label',`第 ${page} 页`);if(page===state.page)link.setAttribute('aria-current','page');pageNumbers.append(link);previous=page;
  });
  if(animate){animateCollection(motion,previousPositions,visible,{replace:!!pageDirection,direction:pageDirection});if(!matched.length)motion.play(empty,[{opacity:.5},{opacity:1}],{duration:160});}
 }
 function choosePage(page:number){if(page===state.page)return;const direction=Math.sign(page-state.page);state.page=page;render(true,'push',direction);find('.archive-tools').scrollIntoView({block:'start',behavior:'instant'});find('[data-journal-list-title]').focus({preventScroll:true});}
 listen(pagination,'click',(event:MouseEvent)=>{const target=(event.target as Element).closest<HTMLElement>('[data-page],[data-page-step]');if(!target||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();choosePage(target.dataset.page?Number(target.dataset.page):state.page+Number(target.dataset.pageStep));});
 listen(pageJump,'submit',event=>{event.preventDefault();if(pageJump.reportValidity())choosePage(Number(pageInput.value));});
 function chooseRange(from:string,to:string,period:string){state.from=from;state.to=to;state.period=period;state.page=1;moveView(from);setPicker(false);render(true);}
 function clearDates(){state.from=state.to='';state.period='all';state.page=1;render(true);}
 types.forEach(button=>listen(button,'click',()=>{state.type=button.dataset.journalType!;state.page=1;render(true);}));
 listen(query,'input',()=>{state.q=query.value;state.page=1;render();});listen(clear,'click',()=>{state.q='';state.page=1;query.value='';render();query.focus();});
 listen(find('.archive-search-form'),'submit',event=>{event.preventDefault();state.q=query.value;state.page=1;render();});
 function toggleTopic(topic:string){state.topics=state.topics.includes(topic)?state.topics.filter(value=>value!==topic):[...state.topics,topic];state.page=1;render(true,'push');}
 listen(active,'click',event=>{const target=event.target as Element;if(target.closest('[data-remove-date]'))clearDates();const chip=target.closest<HTMLElement>('[data-remove-topic]');if(chip){const topic=chip.dataset.removeTopic!;toggleTopic(topic);topics.find(button=>button.dataset.journalTopic===topic)?.focus({preventScroll:true});}});
 listen(find('[data-journal-reset]'),'click',()=>{state={q:'',type:'all',topics:[],match:'any',from:'',to:'',period:'all',sort:'newest',page:1};query.value='';render(true);query.focus();});
 topics.forEach(button=>listen(button,'click',()=>toggleTopic(button.dataset.journalTopic!)));
 matchButtons.forEach(button=>listen(button,'click',()=>{state.match=button.dataset.topicMatch==='all'?'all':'any';state.page=1;render(true,'push');}));
 listen(find('[data-clear-topics]'),'click',()=>{state.topics=[];state.page=1;render(true,'push');topics[0]?.focus({preventScroll:true});});
 listen(sort,'toggle',()=>{if(sort.open&&!sortOptions.includes(document.activeElement as HTMLButtonElement))sortOptions.find(button=>button.dataset.sortOption===state.sort)?.focus({preventScroll:true});});
 sortOptions.forEach(button=>listen(button,'click',()=>{state.sort=button.dataset.sortOption!;state.page=1;sort.open=false;render(true);sortTrigger.focus({preventScroll:true});}));
 listen(sort,'keydown',(event:KeyboardEvent)=>{const index=sortOptions.indexOf(document.activeElement as HTMLButtonElement);if(event.key==='Escape'){event.preventDefault();sort.open=false;sortTrigger.focus();}else if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){event.preventDefault();sort.open=true;const next=event.key==='Home'?0:event.key==='End'?sortOptions.length-1:event.key==='ArrowDown'?(index+1)%sortOptions.length:(index<1?sortOptions.length-1:index-1);sortOptions[next].focus();}});
 listen(document,'click',event=>{if(!sort.contains(event.target as Node))sort.open=false;});listen(document,'focusin',event=>{if(!sort.contains(event.target as Node))sort.open=false;});
 listen(days,'click',event=>{const button=(event.target as Element).closest<HTMLButtonElement>('[data-diary-date]');if(button){const value=button.dataset.diaryDate!;chooseRange(value,value,value===today?'today':'day');}});
 listen(days,'keydown',(event:KeyboardEvent)=>{const button=(event.target as Element).closest<HTMLButtonElement>('[data-diary-date]');if(!button)return;const date=dateObject(button.dataset.diaryDate!),weekday=(date.getDay()+6)%7,offsets:Record<string,number>={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7,Home:-weekday,End:6-weekday};if(event.key in offsets){event.preventDefault();date.setDate(date.getDate()+offsets[event.key]);}else if(event.key==='PageUp'||event.key==='PageDown'){event.preventDefault();const day=date.getDate();date.setDate(1);date.setMonth(date.getMonth()+(event.key==='PageUp'?-1:1));date.setDate(Math.min(day,new Date(date.getFullYear(),date.getMonth()+1,0).getDate()));}else return;moveView(key(date));renderCalendar(true);});
 listen(find('[data-calendar-prev]'),'click',()=>{view=new Date(view.getFullYear(),view.getMonth()-1,1);setPicker(false);renderCalendar();});listen(find('[data-calendar-next]'),'click',()=>{view=new Date(view.getFullYear(),view.getMonth()+1,1);setPicker(false);renderCalendar();});listen(pickerButton,'click',()=>setPicker(picker.hidden));
 listen(find('[data-calendar-year-prev]'),'click',()=>{pickerYear--;renderCalendar();});listen(find('[data-calendar-year-next]'),'click',()=>{pickerYear++;renderCalendar();});
 listen(picker,'click',event=>{const button=(event.target as Element).closest<HTMLButtonElement>('[data-diary-month]');if(button){moveView(button.dataset.diaryMonth!);setPicker(false);renderCalendar();pickerButton.focus({preventScroll:true});}});
 listen(find('.archive-date-panel'),'keydown',(event:KeyboardEvent)=>{if(event.key==='Escape'&&!picker.hidden){event.preventDefault();setPicker(false);pickerButton.focus();}});
 listen(document,'click',event=>{if(!picker.hidden&&!picker.contains(event.target as Node)&&!pickerButton.contains(event.target as Node))setPicker(false);});
 listen(document,'focusin',event=>{if(!picker.hidden&&!picker.contains(event.target as Node)&&!pickerButton.contains(event.target as Node))setPicker(false);});
 listen(window,'resize',placePicker);window.addEventListener('scroll',placePicker,{passive:true,signal});
 listen(find('[data-calendar-month-filter]'),'click',()=>{const [from,to]=monthRange(key(view));chooseRange(from,to,'month');});listen(find('[data-clear-date]'),'click',clearDates);
 root.querySelectorAll<HTMLButtonElement>('[data-date-shortcut]').forEach(button=>listen(button,'click',()=>{const shortcut=button.dataset.dateShortcut!;if(shortcut==='month'){const [from,to]=monthRange(today);chooseRange(from,to,'month');}else if(shortcut==='week'){const from=dateObject(today);from.setDate(from.getDate()-(from.getDay()+6)%7);const to=new Date(from);to.setDate(to.getDate()+6);chooseRange(key(from),key(to),'week');}else{const date=shortcut==='latest'?(rows[0]?.dataset.date??today):today;chooseRange(date,date,shortcut);}}));
 listen(root,'click',(event:MouseEvent)=>{if((event.target as Element).closest('[data-archive-entry]'))try{sessionStorage.setItem('sakura-journal-return',location.pathname+location.search);}catch{}});
 listen(window,'popstate',()=>{read();render();});
 read();render();
 setupJournalDatePicker(root,signal,{selection:()=>({from:state.from,to:state.to}),entries:()=>rows.filter(textMatches).map(row=>row.dataset.date!),apply:(from,to)=>chooseRange(from,to,'custom')});
 root.dataset.archiveReady='true';
}
