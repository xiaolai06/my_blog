import type {MusicTrack} from './music-library';
type ArchiveItem = {identifier:string; title?:string; creator?:string|string[]};
export async function searchArchive(query:string, signal:AbortSignal):Promise<MusicTrack[]> {
  const cleanQuery=query.replace(/[+\-&|!(){}\[\]^"~*?:\\/]/g,' ').trim();
  if(!cleanQuery)return [];
  const params=new URLSearchParams({q:`mediatype:audio AND licenseurl:* AND (${cleanQuery})`,rows:'20',output:'json'});
  for(const field of ['identifier','title','creator'])params.append('fl[]',field);
  let response=await fetch(`https://archive.org/advancedsearch.php?${params}`,{signal});
  if(!response.ok)throw new Error('音频目录暂时不可用');
  let data=await response.json();
  let items=(data.response?.docs||[]) as ArchiveItem[];
  if(!items.length){
    params.set('q',`mediatype:audio AND collection:jamendo-albums AND (${cleanQuery})`);
    response=await fetch(`https://archive.org/advancedsearch.php?${params}`,{signal});
    if(!response.ok)throw new Error('音频目录暂时不可用');
    data=await response.json();items=data.response?.docs||[];
  }
  const results=await Promise.all(items.slice(0,16).map(async(item):Promise<MusicTrack|null>=>{
    try{
      const response=await fetch(`https://archive.org/metadata/${encodeURIComponent(item.identifier)}`,{signal});
      if(!response.ok)return null;
      const data=await response.json(),meta=data.metadata||{};
      const licenseUrl=String(meta.licenseurl||'');
      if(!/^https?:\/\/(?:www\.)?creativecommons\.org\//i.test(licenseUrl))return null;
      const files=(data.files||[]) as {name:string;size?:string;title?:string;creator?:string}[];
      const file=files.find(file=>/\.mp3$/i.test(file.name)&&Number(file.size||0)>12000)||files.find(file=>/\.(ogg|m4a|wav)$/i.test(file.name)&&Number(file.size||0)>12000);
      if(!file)return null;
      const artist=meta.creator||item.creator;
      return {id:`archive:${item.identifier}:${file.name}`,title:String(file.title||meta.title||item.title||file.name),artist:Array.isArray(artist)?artist.join(', '):String(artist||'未知艺术家'),source:'archive',favorite:false,addedAt:Date.now(),src:`https://archive.org/download/${encodeURIComponent(item.identifier)}/${file.name.split('/').map(encodeURIComponent).join('/')}`,sourceUrl:`https://archive.org/details/${encodeURIComponent(item.identifier)}`,licenseUrl};
    }catch(error){if(signal.aborted)throw error;return null;}
  }));
  return results.filter((track):track is MusicTrack=>track!==null);
}
