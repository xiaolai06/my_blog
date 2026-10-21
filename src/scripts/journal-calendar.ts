type Entry={date:string;title:string;url:string};
const dateKey=(date:Date)=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export function setupJournalCalendar(signal:AbortSignal){
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const [ty,tm,td]=today.split('-').map(Number);
 document.querySelectorAll<HTMLElement>('[data-calendar]').forEach(calendar=>{
  const entries:Entry[]=JSON.parse(calendar.dataset.entries||'[]');
  const byDate=new Map<string,Entry[]>();
  entries.forEach(entry=>byDate.set(entry.date,[...(byDate.get(entry.date)||[]),entry]));
  let year=ty,month=tm-1,selected=today;
  const days=calendar.querySelector<HTMLElement>('.calendar-days')!;
  const title=calendar.querySelector<HTMLElement>('.calendar-month')!;
  const note=calendar.querySelector<HTMLElement>('.calendar-note')!;
  const summary=calendar.querySelector<HTMLElement>('.calendar-summary')!;
  function render(focus=false){
   title.textContent=`${year} 年 ${month+1} 月`;
   const fragment=document.createDocumentFragment();
   const start=(new Date(year,month,1).getDay()+6)%7,total=new Date(year,month+1,0).getDate();
   const previous=new Date(year,month,0).getDate(),cells=42;
   for(let i=0;i<cells;i++){
    const day=i-start+1;
    if(day<1||day>total){const span=document.createElement('span');span.className='other-month';span.textContent=String(day<1?previous+day:day-total);span.setAttribute('aria-hidden','true');fragment.append(span);continue;}
    const key=dateKey(new Date(year,month,day)),count=byDate.get(key)?.length||0;
    const button=document.createElement('button');button.type='button';button.textContent=String(day);button.dataset.date=key;
    button.classList.toggle('today',key===today);button.classList.toggle('selected',key===selected);button.classList.toggle('has-post',count>0);
    button.tabIndex=key===selected?0:-1;button.setAttribute('aria-label',`${year}年${month+1}月${day}日，${count?count+' 篇手记':'暂无手记'}`);button.setAttribute('aria-pressed',String(key===selected));
    if(key===today)button.setAttribute('aria-current','date');
    fragment.append(button);
   }
   days.replaceChildren(fragment);
   const prefix=`${year}-${String(month+1).padStart(2,'0')}`,monthEntries=entries.filter(entry=>entry.date.startsWith(prefix));
   summary.textContent=monthEntries.length?`本月 ${monthEntries.length} 篇手记 · ${new Set(monthEntries.map(entry=>entry.date)).size} 个记录日`:'点亮的日子，有文字留下';
   const matches=byDate.get(selected)||[];
   const label=document.createElement('strong');label.textContent=`${month+1} 月 ${Number(selected.slice(-2))} 日${selected===today?' · 今天':''}`;
   note.replaceChildren(label);
   if(matches.length){
    const list=document.createElement('div');list.className='calendar-entry-list';
    matches.slice(0,2).forEach(entry=>{
     const link=document.createElement('a');link.href=entry.url;link.title=entry.title;
     const text=document.createElement('span');text.textContent=entry.title;link.append(text);list.append(link);
    });
    const more=document.createElement('a');more.className='calendar-more';more.href=`/blog/?date=${selected}`;
    more.textContent=matches.length>2?`查看当天全部 ${matches.length} 篇手记`:'查看当天手记';
    note.append(list,more);
   }else{
    const empty=document.createElement('span');empty.textContent='这一天留白，灵感还在路上。';
    const link=document.createElement('a');link.className='calendar-more';link.href='/blog/';link.textContent='去看看其他日子的手记';note.append(empty,link);
   }
   if(focus)days.querySelector<HTMLButtonElement>('[tabindex="0"]')?.focus({preventScroll:true});
   calendar.dispatchEvent(new CustomEvent('calendar:change'));
  }
  function choose(date:Date,focus=false){year=date.getFullYear();month=date.getMonth();selected=dateKey(date);render(focus);}
  function changeMonth(delta:number){
   const date=new Date(year,month+delta,1),prefix=dateKey(date).slice(0,7);
   const recorded=entries.find(entry=>entry.date.startsWith(prefix));
   choose(recorded?new Date(`${recorded.date}T12:00:00`):date);
  }
  days.addEventListener('click',event=>{const button=(event.target as Element).closest<HTMLButtonElement>('button[data-date]');if(button)choose(new Date(`${button.dataset.date}T12:00:00`),true);},{signal});
  days.addEventListener('keydown',event=>{
   const button=(event.target as Element).closest<HTMLButtonElement>('button[data-date]');if(!button)return;
   const date=new Date(`${button.dataset.date}T12:00:00`),day=date.getDate(),weekday=(date.getDay()+6)%7;
   const offsets:Record<string,number>={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7,Home:-weekday,End:6-weekday};
   if(event.key in offsets){event.preventDefault();date.setDate(day+offsets[event.key]);choose(date,true);}
   else if(event.key==='PageUp'||event.key==='PageDown'){
    event.preventDefault();const next=new Date(year,month+(event.key==='PageUp'?-1:1),1);next.setDate(Math.min(day,new Date(next.getFullYear(),next.getMonth()+1,0).getDate()));choose(next,true);
   }
  },{signal});
  calendar.querySelector('.calendar-prev')?.addEventListener('click',()=>changeMonth(-1),{signal});
  calendar.querySelector('.calendar-next')?.addEventListener('click',()=>changeMonth(1),{signal});
  calendar.querySelector('.calendar-today')?.addEventListener('click',()=>choose(new Date(ty,tm-1,td)),{signal});
  render();
 });
}
