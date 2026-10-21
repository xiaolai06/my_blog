import type {MusicTrack} from '../scripts/music-library';

// Official full mixes published by the artist under CC BY 4.0.
// Keep titles, attribution and the original source available in the player.
const selections = [
  ['in-this-moment','In This Moment','钢琴 · 安静此刻','2026/08/InThisMoment'],
  ['home-was-you','Home Was You','钢琴与弦乐 · 温柔归途','2026/07/HomeWasYou'],
  ['with-these-hands','With These Hands','氛围钢琴 · 浮光','2026/06/WithTheseHands'],
  ['wildflowers','Wildflowers','钢琴与弦乐 · 花间','2025/12/Wildflowers'],
  ['echoes-of-home','Echoes Of Home','管弦乐 · 风的回声','2025/05/EchoesOfHome'],
  ['penumbra','Penumbra','氛围弦乐 · 微光','2025/07/Penumbra'],
];

export const freeMusic: MusicTrack[] = selections.map(([id,title,mood,path],index)=>({
  id:`scott-buckley:${id}`,title,artist:'Scott Buckley',mood,
  src:`https://www.scottbuckley.com.au/library/wp-content/uploads/${path}.mp3`,
  source:'curated',favorite:false,addedAt:index,
  sourceUrl:`https://www.scottbuckley.com.au/library/${id}/`,
  licenseUrl:'https://creativecommons.org/licenses/by/4.0/',
  instrumental:true,
}));
