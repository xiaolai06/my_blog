export type LyricLine = { time: number; text: string };
export function parseLrc(source: string): LyricLine[] {
  const offset = Number(source.match(/\[offset:([+-]?\d+)\]/i)?.[1] || 0) / 1000;
  const result: LyricLine[] = [];
  for (const line of source.split(/\r?\n/)) {
    const times = [...line.matchAll(/\[(\d+):(\d{1,2})(?:[.:](\d{1,3}))?\]/g)];
    const text = line.replace(/\[[^\]]*\]/g, '').trim();
    for (const match of times) {
      const fraction = match[3] ? Number(`0.${match[3]}`) : 0;
      const time = Number(match[1]) * 60 + Number(match[2]) + fraction + offset;
      result.push({ time: Math.max(0, time), text: text || '♪' });
    }
  }
  return result.sort((a,b) => a.time - b.time);
}
export async function findLyrics(title: string, artist: string, duration: number, signal: AbortSignal): Promise<string | undefined> {
  if (!title || !artist || artist === '本地音乐' || artist === '未知艺术家') return;
  const params = new URLSearchParams({ track_name: title, artist_name: artist });
  if (Number.isFinite(duration) && duration > 0) params.set('duration', String(Math.round(duration)));
  const response = await fetch(`https://lrclib.net/api/get?${params}`, { signal });
  if (!response.ok) return;
  const lyrics = await response.json();
  return lyrics.syncedLyrics || lyrics.plainLyrics || (lyrics.instrumental ? '纯音乐，无人声歌词' : undefined);
}

export type LyricMatch = {id:number;trackName:string;artistName:string;duration:number;syncedLyrics?:string;plainLyrics?:string;instrumental?:boolean};
export async function searchLyrics(query:string,signal:AbortSignal):Promise<LyricMatch[]> {
  const response=await fetch(`https://lrclib.net/api/search?${new URLSearchParams({q:query})}`,{signal});
  if(!response.ok)throw new Error('歌词服务暂不可用');
  const results=await response.json();
  return Array.isArray(results)?results.filter(item=>typeof item.id==='number'&&typeof item.trackName==='string'&&typeof item.artistName==='string'&&(typeof item.syncedLyrics==='string'||typeof item.plainLyrics==='string')).slice(0,12):[];
}
