import type {APIRoute} from 'astro';
import {retrospectiveDemos} from '../../../data/retrospective-demos';
export function getStaticPaths(){
 return Object.entries(retrospectiveDemos).map(([demo,value])=>({params:{demo},props:{source:value.source}}));
}
export const GET:APIRoute=({props})=>new Response(props.source,{headers:{'Content-Type':'text/html; charset=utf-8','X-Robots-Tag':'noindex'}});
