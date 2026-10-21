import type { FooterPhase } from './scene-clock';
import images from '../data/scene-images.json';
export type SceneRegion = 'hero' | 'footer';
export type SceneFamily = 'home' | 'projects' | 'journal' | 'about';
export type SceneChoice = FooterPhase | 'auto';
export const sceneLabels: Record<SceneChoice,string> = {auto:'随时间',dawn:'晨曦',day:'晴昼',dusk:'落日',night:'月夜'};
export function availableChoices(family: SceneFamily, region: SceneRegion): SceneChoice[] {
 return ['auto','dawn','day','dusk','night'];
}
export function sceneAsset(family: SceneFamily, region: SceneRegion, phase: FooterPhase) {
 const catalog = images as Record<string,{src:string;srcset:string;width:number;height:number}>;
 const image = catalog[`${family}-${region}-${phase}-desktop`];
 if (!image) throw new Error(`Missing scene: ${family}-${region}-${phase}`);
 return {src:image.src,poster:image.src,srcset:image.srcset,width:image.width,height:image.height,phase};
}
