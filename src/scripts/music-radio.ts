import type {MusicTrack} from './music-library';

// Public directory, not a music licensing service. Radio streams retain their broadcaster's rights.
// Documentation: https://docs.radio-browser.info/
const servers = ['https://de1.api.radio-browser.info','https://nl1.api.radio-browser.info'];
const cache = new Map<string,MusicTrack[]>();
const secureUrl = (value:unknown) => {
  try { const url=new URL(String(value)); return url.protocol==='https:'&&!url.username&&!url.password?url.href:''; } catch { return ''; }
};
type Station = {stationuuid:string;name:string;url_resolved:string;homepage:string;tags:string;country:string;codec:string;hls:number;bitrate:number;lastcheckok:number};

export async function discoverRadio(tag:string,signal:AbortSignal):Promise<MusicTrack[]> {
  if(cache.has(tag))return cache.get(tag)!;
  let lastError:unknown;
  // Randomize the initial mirror to spread read traffic. A failed mirror has a bounded fallback.
  const mirrors = Math.random()<.5 ? servers : [...servers].reverse();
  for(const server of mirrors){
    if(signal.aborted)throw signal.reason;
    const attempt=new AbortController(),abort=()=>attempt.abort();signal.addEventListener('abort',abort,{once:true});
    const timeout=window.setTimeout(abort,7000);
    try{
      const params=new URLSearchParams({tag,tagExact:'true',is_https:'true',hidebroken:'true',order:'votes',reverse:'true',limit:'60'});
      const response=await fetch(`${server}/json/stations/search?${params}`,{signal:attempt.signal});
      if(!response.ok)throw new Error('电台目录暂不可用');
      const stations:Station[]=await response.json();
      if(!Array.isArray(stations))throw new Error('电台目录格式无效');
      const seen=new Set<string>();
      const tracks=stations.filter(station=>{
        const src=secureUrl(station.url_resolved);
        if(!src||seen.has(src)||station.lastcheckok!==1||station.hls||!/^(mp3|aac|aac\+|ogg|opus|vorbis)$/i.test(station.codec)||/somafm/i.test(`${station.name} ${src}`))return false;
        seen.add(src);return true;
      }).slice(0,20).map((station,index):MusicTrack=>({
        id:`radio:${station.stationuuid}`,title:station.name.trim()||'在线电台',artist:station.country||'在线电台',
        mood:`直播 · ${station.bitrate?`${station.bitrate} kbps`:'在线收听'}`,src:secureUrl(station.url_resolved),source:'radio',live:true,
        favorite:false,addedAt:Date.now()+index,sourceUrl:secureUrl(station.homepage)||`https://www.radio-browser.info/history/${encodeURIComponent(station.stationuuid)}`
      }));
      if(tracks.length)cache.set(tag,tracks);return tracks;
    }catch(error){lastError=error;if(signal.aborted)throw error;}
    finally{clearTimeout(timeout);signal.removeEventListener('abort',abort);}
  }
  throw lastError||new Error('电台目录暂不可用');
}
