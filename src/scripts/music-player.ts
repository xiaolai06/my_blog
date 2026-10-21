import {readLibrary,writeTrack,deleteTrack,type MusicTrack} from './music-library';
import {parseLrc,findLyrics,searchLyrics,type LyricLine,type LyricMatch} from './music-lyrics';
import {searchArchive} from './music-archive';
import {SITE_TITLE} from '../consts';
import {freeMusic} from '../data/free-music';
import {setupPlayerDrag} from './music-drag';
import {setupStudySpace} from './music-study';
import {discoverRadio} from './music-radio';

const element = <T extends HTMLElement>(id:string) => document.getElementById(id) as T;
const player=element<HTMLElement>('music-player');
const shell=element<HTMLElement>('music-shell');
const audio=element<HTMLAudioElement>('music-audio');
const list=element<HTMLElement>('track-list');
const emptyList=list.innerHTML;
const status=element<HTMLElement>('music-status');
const seek=element<HTMLInputElement>('seek-bar');
const volume=element<HTMLInputElement>('volume-bar');
const favorite=element<HTMLButtonElement>('favorite-current');
const play=element<HTMLButtonElement>('play-toggle');
const lyrics=element<HTMLElement>('lyrics-scroll');
const expandedLyrics=element<HTMLElement>('lyrics-expanded');
const lyricsDialog=element<HTMLDialogElement>('lyrics-dialog');
const lyricSearchForm=element<HTMLFormElement>('lyric-search');
const lyricQuery=element<HTMLInputElement>('lyric-query');
const lyricResults=element<HTMLElement>('lyric-results');
const files=element<HTMLInputElement>('music-files');
const lyricFile=element<HTMLInputElement>('lyric-file');
const searchForm=element<HTMLFormElement>('music-search');
const searchToggle=element<HTMLButtonElement>('search-toggle');
const query=element<HTMLInputElement>('music-query');
const library:MusicTrack[]=[];
const objectUrls=new Set<string>();
let current:MusicTrack|undefined;
let view:'discover'|'radio'|'playlist'|'favorites'|'search'='discover';
let searchResults:MusicTrack[]=[];
let radioResults:MusicTrack[]=[];
let radioTag='ambient';
let radioRequest:AbortController|undefined;
let manualLyricRequest:AbortController|undefined;
let lyricMatches:LyricMatch[]=[];
let searchRequest:AbortController|undefined;
let lyricRequest:AbortController|undefined;
let playRevision=0;
let lyricLines:LyricLine[]=[];
let lyricIndex=-2;
let shuffle=false;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const safe=(value:string)=>value.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[char]!);
const time=(value:number)=>Number.isFinite(value)&&value>=0?`${Math.floor(value/60)}:${String(Math.floor(value%60)).padStart(2,'0')}`:'0:00';
const icon=(name:'heart'|'close'|'arrow')=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${{heart:'M20.8 8.8c0 5.2-8.8 10-8.8 10s-8.8-4.8-8.8-10A4.8 4.8 0 0 1 12 6.7a4.8 4.8 0 0 1 8.8 2.1Z',close:'m6 6 12 12M6 18 18 6',arrow:'M5 12h14m-6-6 6 6-6 6'}[name]}"/></svg>`;
const save=(track:MusicTrack)=>void writeTrack(track).catch(()=>{status.textContent='音乐可继续播放；浏览器存储不足，暂时只保留在本次访问。';});

function renderList(){
  const tracks=view==='discover'?freeMusic:view==='radio'?radioResults:view==='search'?searchResults:view==='favorites'?library.filter(track=>track.favorite):library;
  element<HTMLButtonElement>('discover-tab').setAttribute('aria-pressed',String(view==='discover'));
  element<HTMLButtonElement>('playlist-tab').setAttribute('aria-pressed',String(view==='playlist'||view==='search'));
  element<HTMLButtonElement>('favorites-tab').setAttribute('aria-pressed',String(view==='favorites'));
  element('radio-tab').setAttribute('aria-pressed',String(view==='radio'));
  element('discovery-note').hidden=view!=='discover';
  element('radio-genres').hidden=view!=='radio';
  list.setAttribute('aria-busy','false');
  if(!tracks.length){
    if(view==='playlist')list.innerHTML=emptyList;
    else list.innerHTML=`<div class="music-empty"><p>${view==='favorites'?'点击歌曲旁的爱心，收藏喜欢的音乐':view==='radio'?'没有找到合适的电台，试试其他风格':'没有找到可播放的开放音频'}</p>${view==='radio'?'<button class="music-add-button" type="button" data-radio-retry>重新加载电台</button>':''}</div>`;
    return;
  }
  list.innerHTML=tracks.map((track,index)=>{
    const saved=library.find(item=>item.id===track.id)||track;
    return `<div class="music-track-row${current?.id===track.id?' is-active':''}"><button type="button" class="music-track-select" data-play="${safe(track.id)}" aria-label="播放 ${safe(track.title)}"><span class="music-track-number">${current?.id===track.id?'♪':String(index+1).padStart(2,'0')}</span><span class="music-track-copy"><strong>${safe(track.title)}</strong><small>${safe(track.mood||track.artist)}</small></span></button><button type="button" class="music-control" data-favorite="${safe(track.id)}" aria-label="${saved.favorite?'取消收藏':'收藏'} ${safe(track.title)}" aria-pressed="${saved.favorite}">${icon('heart')}</button>${['search','discover','radio'].includes(view)?`<a class="music-track-source" href="${safe(track.sourceUrl||'https://archive.org/details/audio')}" target="_blank" rel="noreferrer" aria-label="查看 ${safe(track.title)} 的来源与授权">${icon('arrow')}</a>`:`<button type="button" class="music-control" data-remove="${safe(track.id)}" aria-label="从列表移除 ${safe(track.title)}">${icon('close')}</button>`}</div>`;
  }).join('');
}
function updateFavorite(){
  favorite.setAttribute('aria-pressed',String(Boolean(current?.favorite)));
  favorite.setAttribute('aria-label',current?.favorite?'取消收藏当前歌曲':'收藏当前歌曲');
  favorite.title=current?.favorite?'取消收藏当前歌曲':'收藏当前歌曲';
}
function setLyrics(source?:string,emptyMessage?:string){
  lyricLines=source?parseLrc(source):[];lyricIndex=-2;
  const isInstrumental=Boolean(current?.instrumental&&!source),isLive=Boolean(current?.live);
  const message=emptyMessage||(isLive?'直播电台 · 让声音持续陪伴':isInstrumental?'纯音乐，无人声歌词':'暂未找到歌词，可在线查找或导入 LRC');
  const markup=lyricLines.length?lyricLines.map((line,index)=>`<button type="button" class="lyric-line" data-line="${index}">${safe(line.text)}</button>`).join(''):source?`<p class="lyric-plain">${safe(source)}</p>`:`<div class="lyrics-empty"><span class="lyric-empty-note" aria-hidden="true">♪</span><p>${safe(message)}</p></div>`;
  lyrics.innerHTML=markup;expandedLyrics.innerHTML=markup;
  const kind=lyricLines.length?'同步歌词':source?'文本歌词':isLive?'电台直播':isInstrumental?'纯音乐':'歌词';
  element('lyrics-kind').textContent=kind;element('lyric-format').textContent=kind;
  element('lyric-help').textContent=isLive?'电台目录不提供正在播出曲目的逐曲歌词':isInstrumental?'这首作品是纯音乐；添加自己的人声歌曲后可匹配歌词':lyricLines.length?'当前行随播放同步 · 点击任意歌词跳转':'可在线匹配，或导入 LRC / TXT 歌词';
  element('lyric-offset').hidden=!lyricLines.length;
  updateLyricOffset();lyrics.scrollTop=0;expandedLyrics.scrollTop=0;syncLyrics();
}
function updateLyricOffset(){const offset=current?.lyricOffset||0;element('lyric-offset-reset').textContent=`${offset>0?'延后':offset<0?'提前':'同步'} ${Math.abs(offset).toFixed(1)}s`;}
function syncLyrics(){
  if(!lyricLines.length)return;
  let index=-1;
  for(let i=0;i<lyricLines.length&&lyricLines[i].time<=audio.currentTime-(current?.lyricOffset||0);i++)index=i;
  if(index===lyricIndex)return;
  lyricIndex=index;
  for(const container of [lyrics,expandedLyrics])container.querySelectorAll<HTMLElement>('[data-line]').forEach((line,i)=>{
      line.classList.toggle('is-current',i===index);
      if(i===index){line.setAttribute('aria-current','true');if(container.clientHeight)container.scrollTo({top:line.offsetTop-container.clientHeight/2+line.offsetHeight/2,behavior:reduced.matches?'instant':'smooth'});}
      else line.removeAttribute('aria-current');
    });
}
async function loadLyrics(track:MusicTrack){
  if(track.lyrics){setLyrics(track.lyrics);return;}
  if(track.instrumental||track.live){setLyrics();return;}
  lyricRequest?.abort();const request=new AbortController();lyricRequest=request;
  const timeout=window.setTimeout(()=>request.abort(),8000);
  try{
    const source=await findLyrics(track.title,track.artist,audio.duration,request.signal);
    if(current?.id!==track.id||request.signal.aborted)return;
    if(source){track.lyrics=source;save(track);setLyrics(source);}else setLyrics();
  }catch{/* A local LRC remains available even when the lyric service is offline. */}
  finally{clearTimeout(timeout);}
}
function ensureInLibrary(track:MusicTrack){
  const saved=library.find(item=>item.id===track.id);
  if(saved)return saved;
  library.push(track);save(track);return track;
}
async function playTrack(track:MusicTrack,autoplay=true){
  const revision=++playRevision;
  lyricRequest?.abort();manualLyricRequest?.abort();current=ensureInLibrary(track);track=current;
  element<HTMLElement>('now-title').textContent=track.title;
  element<HTMLElement>('now-artist').textContent=track.artist;
  syncMusicState();
  const credit=element('music-credit');credit.hidden=!track.sourceUrl;
  credit.innerHTML=track.sourceUrl?`<a href="${safe(track.sourceUrl)}" target="_blank" rel="noreferrer">${safe(track.title)} · ${safe(track.artist)}</a>${track.licenseUrl?` · <a href="${safe(track.licenseUrl)}" target="_blank" rel="noreferrer">${track.source==='curated'?'CC BY 4.0':'授权'}</a>`:''}`:'';
  element<HTMLButtonElement>('import-lyrics').disabled=false;
  element<HTMLButtonElement>('lyric-search-toggle').disabled=Boolean(track.live);
  element('lyrics-dialog-track').textContent=`${track.title} · ${track.artist}`;
  lyricQuery.value=`${track.title} ${track.artist==='本地音乐'?'':track.artist}`.trim();lyricResults.replaceChildren();lyricMatches=[];
  element<HTMLElement>('current-time').textContent='0:00';
  element<HTMLElement>('duration').textContent='0:00';
  seek.value='0';seek.disabled=true;seek.style.setProperty('--range-value','0%');
  audio.src=track.src;audio.load();updateFavorite();setLyrics(track.lyrics);renderList();
  try{localStorage.setItem('sakura-music-current',track.id);}catch{}
  if('mediaSession' in navigator){
    navigator.mediaSession.metadata=new MediaMetadata({title:track.title,artist:track.artist,album:SITE_TITLE,artwork:[{src:new URL('/images/sakura-sunset.webp',location.origin).href,type:'image/webp'}]});
  }
  status.textContent=track.live?'直播电台 · 免费收听，内容由电台提供':track.source==='local'?'本地音乐仅保存在当前浏览器':track.source==='curated'?'免费完整播放 · Scott Buckley 原创音乐':'来自 Internet Archive · 授权见曲目来源页';
  if(!autoplay)return;
  try{await audio.play();if(revision!==playRevision)return;}
  catch{if(revision===playRevision)status.textContent='暂时无法播放这首歌，请尝试另一首或重新添加音乐。';}
}
function nextTrack(direction=1){
  const queue=view==='discover'?freeMusic:view==='radio'?radioResults:view==='favorites'?library.filter(track=>track.favorite):view==='search'?searchResults:library;
  if(!queue.length)return;
  const index=queue.findIndex(track=>track.id===current?.id);
  let next=index<0?(direction>0?0:queue.length-1):(index+direction+queue.length)%queue.length;
  if(shuffle&&queue.length>1){do{next=Math.floor(Math.random()*queue.length);}while(next===index);}
  void playTrack(queue[next]);
}
function toggleFavorite(track:MusicTrack){
  const saved=ensureInLibrary(track);saved.favorite=!saved.favorite;save(saved);updateFavorite();renderList();
}
function removeTrack(id:string){
  const index=library.findIndex(track=>track.id===id);if(index<0)return;
  const [removed]=library.splice(index,1);void deleteTrack(id).catch(()=>{});
  if(current?.id===id){audio.pause();audio.removeAttribute('src');audio.load();current=undefined;playRevision++;lyricRequest?.abort();manualLyricRequest?.abort();element('now-title').textContent='未选择歌曲';element('now-artist').textContent='选择一首喜欢的音乐';element<HTMLButtonElement>('import-lyrics').disabled=true;element<HTMLButtonElement>('lyric-search-toggle').disabled=true;element('lyrics-dialog-track').textContent='选择一首音乐';setLyrics(undefined,'选择音乐，歌词将在这里显示');seek.value='0';seek.disabled=true;seek.style.setProperty('--range-value','0%');element('current-time').textContent='0:00';element('duration').textContent='0:00';element('music-credit').hidden=true;updateFavorite();}
  if(removed.src.startsWith('blob:')){URL.revokeObjectURL(removed.src);objectUrls.delete(removed.src);}
  syncMusicState();renderList();status.textContent='已从播放列表移除，原文件不受影响';
}
async function importFiles(selected:File[]){
  const audioFiles=selected.filter(file=>file.type.startsWith('audio/')||/\.(mp3|flac|wav|ogg|oga|m4a|opus|aac)$/i.test(file.name));
  const added:MusicTrack[]=[];
  for(const file of audioFiles){
    const id=`local:${file.name}:${file.size}:${file.lastModified}`;
    const existing=library.find(track=>track.id===id);if(existing){added.push(existing);continue;}
    const name=file.name.replace(/\.[^.]+$/,'');const parts=name.split(/\s+-\s+/);
    const track:MusicTrack={id,title:parts.length>1?parts.slice(1).join(' - '):name,artist:parts.length>1?parts[0]:'本地音乐',src:URL.createObjectURL(file),source:'local',favorite:false,addedAt:Date.now(),blob:file,filename:file.name};
    objectUrls.add(track.src);library.push(track);added.push(track);save(track);
  }
  for(const file of selected.filter(file=>/\.(lrc|txt)$/i.test(file.name))){
    const base=file.name.replace(/\.[^.]+$/,'').toLowerCase();
    const track=library.find(track=>track.filename?.replace(/\.[^.]+$/,'').toLowerCase()===base)||(added.length===1?added[0]:current);
    if(track){track.lyrics=await file.text();save(track);if(current?.id===track.id){lyricRequest?.abort();setLyrics(track.lyrics);}}
  }
  view='playlist';searchForm.hidden=true;searchToggle.setAttribute('aria-expanded','false');renderList();
  if(added.length){status.textContent=`已添加 ${added.length} 首音乐`;if(!current)void playTrack(added[0]);}
  else if(!current)status.textContent='请先添加音乐，再为歌曲导入 LRC 歌词';
  files.value='';lyricFile.value='';
}
function setView(next:'discover'|'radio'|'playlist'|'favorites'){
  searchRequest?.abort();radioRequest?.abort();searchForm.hidden=true;searchToggle.setAttribute('aria-expanded','false');view=next;status.textContent='';renderList();
  if(next==='radio')void loadRadio();
}
async function loadRadio(){
  radioRequest?.abort();const request=new AbortController();radioRequest=request;
  list.setAttribute('aria-busy','true');list.innerHTML='<div class="music-empty"><p>正在寻找适合专注的电台…</p></div>';
  status.textContent='Radio Browser · 公开电台直播';
  try{const results=await discoverRadio(radioTag,request.signal);if(request.signal.aborted||view!=='radio')return;radioResults=results;renderList();status.textContent=`${results.length} 个电台 · 直播无法拖动进度`;}
  catch{if(!request.signal.aborted&&view==='radio'){radioResults=[];renderList();status.textContent='电台目录暂时连不上，可重新加载或使用精选音乐';}}
}
element('radio-genres').addEventListener('click',event=>{const button=(event.target as HTMLElement).closest<HTMLElement>('[data-radio-tag]');if(!button)return;radioTag=button.dataset.radioTag!;element('radio-genres').querySelectorAll('[data-radio-tag]').forEach(item=>item.setAttribute('aria-pressed',String((item as HTMLElement).dataset.radioTag===radioTag)));void loadRadio();});
list.addEventListener('click',event=>{
  const button=(event.target as HTMLElement).closest<HTMLElement>('button');if(!button)return;
  if(button.hasAttribute('data-import')){files.click();return;}
  if(button.hasAttribute('data-radio-retry')){void loadRadio();return;}
  const id=button.dataset.play||button.dataset.favorite||button.dataset.remove;
  const track=library.find(track=>track.id===id)||freeMusic.find(track=>track.id===id)||searchResults.find(track=>track.id===id)||radioResults.find(track=>track.id===id);if(!track)return;
  if(button.dataset.play)void playTrack(track);
  else if(button.dataset.favorite)toggleFavorite(track);
  else if(button.dataset.remove)removeTrack(track.id);
});
function togglePlayback(){
  if(!current){void playTrack(library[0]||freeMusic[0]);return;}
  if(audio.paused)void audio.play().catch(()=>{status.textContent='播放未能开始，请重新选择歌曲。';});else audio.pause();
}
play.addEventListener('click',togglePlayback);
document.addEventListener('click',event=>{const button=(event.target as HTMLElement).closest<HTMLElement>('[data-dock-music-play],[data-dock-music-next]');if(!button)return;if(button.hasAttribute('data-dock-music-play'))togglePlayback();else nextTrack();});
element('next-track').addEventListener('click',()=>nextTrack());
element('previous-track').addEventListener('click',()=>{if(audio.currentTime>3)audio.currentTime=0;else nextTrack(-1);});
favorite.addEventListener('click',()=>{if(current)toggleFavorite(current);});
element('shuffle-toggle').addEventListener('click',()=>{shuffle=!shuffle;element('shuffle-toggle').setAttribute('aria-pressed',String(shuffle));});
element('playlist-tab').addEventListener('click',()=>setView('playlist'));
element('discover-tab').addEventListener('click',()=>setView('discover'));
element('radio-tab').addEventListener('click',()=>setView('radio'));
element('favorites-tab').addEventListener('click',()=>setView('favorites'));
element('import-music').addEventListener('click',()=>files.click());
element('import-lyrics').addEventListener('click',()=>{if(current)lyricFile.click();});
files.addEventListener('change',()=>void importFiles(Array.from(files.files||[])));
lyricFile.addEventListener('change',async()=>{
  const file=lyricFile.files?.[0],track=current;if(!file||!track)return;
  track.lyrics=await file.text();save(track);
  if(current?.id===track.id){lyricRequest?.abort();setLyrics(track.lyrics);}
  status.textContent='歌词已导入并保存在当前浏览器';lyricFile.value='';
});
// Dialogs stay in the persisted player; close before navigation so they never cover another page.
shell.querySelectorAll<HTMLElement>('[data-close-dialog]').forEach(button=>button.addEventListener('click',()=>button.closest<HTMLDialogElement>('dialog')?.close()));
shell.querySelectorAll<HTMLDialogElement>('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}));
shell.querySelectorAll<HTMLElement>('[data-open-resources]').forEach(button=>button.addEventListener('click',()=>element<HTMLDialogElement>('resources-dialog').showModal()));
element('open-lyrics').addEventListener('click',()=>{lyricsDialog.showModal();lyricIndex=-2;syncLyrics();});
element('lyric-search-toggle').addEventListener('click',()=>{lyricSearchForm.hidden=!lyricSearchForm.hidden;element('lyric-search-toggle').setAttribute('aria-expanded',String(!lyricSearchForm.hidden));if(!lyricSearchForm.hidden)lyricQuery.focus();});
lyricSearchForm.addEventListener('submit',async event=>{
  event.preventDefault();const track=current,q=lyricQuery.value.trim();if(!track||!q)return;
  manualLyricRequest?.abort();const request=new AbortController();manualLyricRequest=request;
  const timeout=window.setTimeout(()=>request.abort(),10000);
  lyricResults.textContent='正在查找歌词…';lyricResults.setAttribute('aria-busy','true');
  try{
    const matches=await searchLyrics(q,request.signal);if(current?.id!==track.id||request.signal.aborted)return;
    lyricMatches=matches;
    lyricResults.innerHTML=matches.length?matches.map((match,index)=>`<button type="button" data-lyric-match="${index}"><span><strong>${safe(match.trackName)}</strong><small>${safe(match.artistName)} · ${time(match.duration)}</small></span><em>${match.syncedLyrics?'同步':'文本'}</em></button>`).join(''):'没有匹配结果，可换个关键词或导入本地 LRC。';
  }catch{if(current?.id===track.id&&manualLyricRequest===request)lyricResults.textContent='歌词服务暂时无法连接，可稍后重试或导入 LRC。';}
  finally{clearTimeout(timeout);if(manualLyricRequest===request)lyricResults.setAttribute('aria-busy','false');}
});
lyricResults.addEventListener('click',event=>{
  const button=(event.target as HTMLElement).closest<HTMLElement>('[data-lyric-match]'),match=button&&lyricMatches[Number(button.dataset.lyricMatch)];
  if(!match||!current)return;
  lyricRequest?.abort();current.lyrics=match.syncedLyrics||match.plainLyrics;current.lyricOffset=0;save(current);setLyrics(current.lyrics);
  lyricSearchForm.hidden=true;element('lyric-search-toggle').setAttribute('aria-expanded','false');status.textContent='已为当前曲目保存歌词';
});
element('lyric-offset').addEventListener('click',event=>{
  if(!current)return;const button=(event.target as HTMLElement).closest<HTMLButtonElement>('button');if(!button)return;
  current.lyricOffset=button.id==='lyric-offset-reset'?0:Math.max(-10,Math.min(10,(current.lyricOffset||0)+Number(button.dataset.lyricOffset||0)));
  save(current);updateLyricOffset();lyricIndex=-2;syncLyrics();
});
document.addEventListener('astro:before-swap',()=>{shell.querySelectorAll<HTMLDialogElement>('dialog[open]').forEach(dialog=>dialog.close());});
setupStudySpace(audio,shell);
searchToggle.addEventListener('click',()=>{searchForm.hidden=!searchForm.hidden;searchToggle.setAttribute('aria-expanded',String(!searchForm.hidden));if(!searchForm.hidden){radioRequest?.abort();if(view==='radio')renderList();query.focus();}else if(view==='search')setView('playlist');});
searchForm.addEventListener('submit',async event=>{
  event.preventDefault();if(!query.value.trim())return;
  searchRequest?.abort();radioRequest?.abort();const request=new AbortController();searchRequest=request;
  const timeout=window.setTimeout(()=>request.abort(),18000);
  view='search';renderList();list.setAttribute('aria-busy','true');list.innerHTML='<div class="music-empty"><p>正在搜索开放音频…</p></div>';status.textContent='Internet Archive · 仅显示有开放授权的音频';
  try{const results=await searchArchive(query.value.trim(),request.signal);if(!request.signal.aborted){searchResults=results;renderList();status.textContent=results.length?`找到 ${results.length} 首，点击即可加入播放列表`:'换个关键词，或添加自己的本地音乐';}}
  catch{if(searchRequest===request&&view==='search'){searchResults=[];renderList();status.textContent='暂时连不上音频目录，可使用添加本地音乐。';}}
  finally{clearTimeout(timeout);}
});
for(const container of [lyrics,expandedLyrics])container.addEventListener('click',event=>{const line=(event.target as HTMLElement).closest<HTMLElement>('[data-line]');const lyric=line&&lyricLines[Number(line.dataset.line)];if(lyric&&Number.isFinite(audio.duration))audio.currentTime=Math.max(0,Math.min(audio.duration,lyric.time+(current?.lyricOffset||0)));});
audio.addEventListener('loadedmetadata',()=>{element('duration').textContent=current?.live?'直播':time(audio.duration);seek.disabled=Boolean(current?.live)||!Number.isFinite(audio.duration);if(current)void loadLyrics(current);});
audio.addEventListener('play',()=>{player.classList.add('is-playing');play.setAttribute('aria-label','暂停');play.title='暂停';syncMusicState();if('mediaSession' in navigator)navigator.mediaSession.playbackState='playing';});
audio.addEventListener('pause',()=>{player.classList.remove('is-playing');player.dataset.loading='false';play.setAttribute('aria-label','播放');play.title='播放';syncMusicState();if('mediaSession' in navigator)navigator.mediaSession.playbackState='paused';});
audio.addEventListener('waiting',()=>{player.dataset.loading='true';});
audio.addEventListener('playing',()=>{player.dataset.loading='false';});
audio.addEventListener('timeupdate',()=>{element('current-time').textContent=time(audio.currentTime);const progress=!current?.live&&Number.isFinite(audio.duration)&&audio.duration>0?audio.currentTime/audio.duration*100:0;seek.value=String(Math.round(progress*10));seek.style.setProperty('--range-value',`${progress}%`);if(document.body.classList.contains('music-mode'))syncLyrics();});
audio.addEventListener('ended',()=>nextTrack());
audio.addEventListener('error',()=>{player.dataset.loading='false';syncMusicState();if(current)status.textContent='这首歌暂时无法播放，可换一首或重新添加文件。';});
seek.addEventListener('input',()=>{if(Number.isFinite(audio.duration)&&audio.duration>0)audio.currentTime=Number(seek.value)/1000*audio.duration;});
function syncVolume(){
  volume.style.setProperty('--range-value',`${audio.muted?0:audio.volume*100}%`);element<HTMLElement>('volume-value').textContent=audio.muted?'静音':`${Math.round(audio.volume*100)}%`;
  const label=audio.muted?'取消静音':'静音';element('mute-toggle').setAttribute('aria-label',label);element('mute-toggle').title=label;
}
try{const saved=localStorage.getItem('sakura-music-volume');audio.volume=saved === null ? .7 : Math.max(0,Math.min(1,Number(saved)||0));}catch{audio.volume=.7;}
volume.value=String(audio.volume*100);syncVolume();
volume.addEventListener('input',()=>{audio.volume=Number(volume.value)/100;audio.muted=false;syncVolume();try{localStorage.setItem('sakura-music-volume',String(audio.volume));}catch{}});
element('mute-toggle').addEventListener('click',()=>{audio.muted=!audio.muted;syncVolume();});

function syncMusicState(){
  shell.classList.toggle('is-playing',!audio.paused);
  document.documentElement.dataset.musicPlaying=String(!audio.paused);
  document.documentElement.dataset.musicSelected=String(Boolean(current));
  document.querySelectorAll<HTMLElement>('[data-dock-music-play]').forEach(button=>{
    const label=!current?'播放精选':audio.paused?'继续音乐':'暂停音乐';button.setAttribute('aria-label',label);button.setAttribute('aria-pressed',String(!audio.paused));
    button.querySelector<HTMLElement>('[data-music-label]')!.textContent=label;
    button.querySelector<HTMLElement>('[data-music-pause]')!.hidden=audio.paused;button.querySelector<HTMLElement>('[data-music-play]')!.hidden=!audio.paused;
  });
  document.querySelectorAll<HTMLButtonElement>('[data-dock-music-next]').forEach(button=>button.disabled=!current);
  document.querySelectorAll<HTMLElement>('[data-dock-track]').forEach(label=>label.textContent=current?`${current.title} · ${current.artist}`:'选择音乐，开始聆听');
  document.querySelectorAll<HTMLElement>('.scene-dock-flower').forEach(trigger=>{trigger.title=current?`${audio.paused?'已暂停':'正在播放'} · ${current.title} · 点击打开菜单`:'场景设置 · 拖动可移动';});
  document.dispatchEvent(new CustomEvent('sakura:music-state'));
}
// The persistent player owns audio. Only wallpaper controls are rebound per page.
let roomEvents:AbortController|undefined;
function setupRoom(){
  roomEvents?.abort();roomEvents=new AbortController();const {signal}=roomEvents;
  syncMusicState();syncLyrics();
  const wallpaperToggle=document.getElementById('wallpaper-toggle');
  if(!wallpaperToggle)return;
  function syncWallpaper(){const off=document.documentElement.dataset.motion==='off'||reduced.matches;wallpaperToggle!.setAttribute('aria-pressed',String(off));wallpaperToggle!.setAttribute('aria-label',off?'播放动态壁纸':'暂停动态壁纸');wallpaperToggle!.title=off?'播放动态壁纸':'暂停动态壁纸';}
  wallpaperToggle.addEventListener('click',()=>{const value=document.documentElement.dataset.motion==='off'?'on':'off';document.documentElement.dataset.motion=value;try{localStorage.setItem('sakura-motion',value);}catch{}syncWallpaper();},{signal});syncWallpaper();
  const observer=new MutationObserver(syncWallpaper);observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-motion']});signal.addEventListener('abort',()=>observer.disconnect(),{once:true});
  const fullscreen=element<HTMLButtonElement>('room-fullscreen');
  fullscreen.hidden=!document.fullscreenEnabled;
  fullscreen.addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{status.textContent='浏览器暂不支持切换全屏。';}},{signal});
  document.addEventListener('fullscreenchange',()=>{const label=document.fullscreenElement?'退出全屏':'进入全屏';fullscreen.setAttribute('aria-label',label);fullscreen.title=label;},{signal});
  const exit=element<HTMLAnchorElement>('music-exit');
  try{const back=sessionStorage.getItem('sakura-music-return');if(back?.startsWith('/')&&!back.startsWith('//')&&!back.startsWith('/music'))exit.href=back;}catch{}
  exit.addEventListener('click',()=>{if(document.fullscreenElement)void document.exitFullscreen().catch(()=>{});},{signal});
}
document.addEventListener('astro:page-load',setupRoom);setupRoom();
document.addEventListener('click',event=>{
  if(location.pathname.startsWith('/music'))return;
  const link=(event.target as HTMLElement).closest<HTMLAnchorElement>('a[href]');
  if(link&&new URL(link.href).origin===location.origin&&new URL(link.href).pathname==='/music/')try{sessionStorage.setItem('sakura-music-return',location.pathname+location.search+location.hash);}catch{}
});
setupPlayerDrag(player,element<HTMLButtonElement>('music-drag'));

const opacity=element<HTMLInputElement>('glass-opacity');
try{const saved=localStorage.getItem('sakura-music-glass');if(saved!==null&&Number.isFinite(Number(saved)))opacity.value=String(Math.min(80,Math.max(20,Number(saved))));}catch{}
function syncGlass(){shell.style.setProperty('--glass-alpha',String(1-Number(opacity.value)/100));element('glass-value').textContent=`${opacity.value}%`;}
opacity.addEventListener('input',()=>{syncGlass();try{localStorage.setItem('sakura-music-glass',opacity.value);}catch{}});syncGlass();
const settings=player.querySelector<HTMLDetailsElement>('.music-settings')!;
settings.addEventListener('toggle',()=>{
  if(!settings.open)return;
  const anchor=settings.querySelector('summary')!.getBoundingClientRect();
  const height=settings.querySelector<HTMLElement>('.music-settings-popover')!.offsetHeight;
  settings.dataset.up=String(anchor.bottom+8+height>innerHeight&&anchor.top>height+8);
});
document.addEventListener('click',event=>{const settings=player.querySelector<HTMLDetailsElement>('.music-settings');if(settings?.open&&!settings.contains(event.target as Node))settings.open=false;});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){const settings=player.querySelector<HTMLDetailsElement>('.music-settings');if(settings)settings.open=false;}});
document.addEventListener('visibilitychange',()=>document.documentElement.toggleAttribute('data-page-hidden',document.hidden));

renderList();

void readLibrary().then(saved=>{
  for(const track of saved){if(!library.some(item=>item.id===track.id)){library.push(track);if(track.src.startsWith('blob:'))objectUrls.add(track.src);}}
  renderList();
  if(!current){let id='';try{id=localStorage.getItem('sakura-music-current')||'';}catch{}const selected=library.find(track=>track.id===id);if(selected)void playTrack(selected,false);}
  syncMusicState();
}).catch(()=>{status.textContent='本次添加的音乐将仅保留在当前访问中';});

if('mediaSession'in navigator){
  for(const [action,handler] of Object.entries({play:()=>void audio.play().catch(()=>{}),pause:()=>audio.pause(),previoustrack:()=>nextTrack(-1),nexttrack:()=>nextTrack()}))try{navigator.mediaSession.setActionHandler(action as MediaSessionAction,handler);}catch{}
}
window.addEventListener('pagehide',event=>{if(event.persisted)return;searchRequest?.abort();lyricRequest?.abort();manualLyricRequest?.abort();radioRequest?.abort();for(const url of objectUrls)URL.revokeObjectURL(url);});
