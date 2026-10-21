import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const root = process.cwd();
const manifestPath = path.join(root, 'src/data/scene-images.json');
const [action, name, source] = process.argv.slice(2);
if (action === 'prompts') {
 const text = await fs.readFile('docs/scene-generation-prompts.md', 'utf8');
 const rows = [...text.matchAll(/#### (\d+)\.[\s\S]*?建议文件名：`([^`]+)`[\s\S]*?```text\r?\n([\s\S]*?)```/g)].map(m => ({number:Number(m[1]),name:m[2].replace('.png',''),prompt:m[3]}));
 console.log(JSON.stringify(name ? rows.filter(r=>name.split(',').map(Number).includes(r.number)) : rows));
} else if (action === 'ingest') {
 if (!/^(home|projects|journal|about)-(hero|footer)-(dawn|day|dusk|night)-(desktop|mobile)$/.test(name)) throw Error('Invalid scene name');
 const master = path.join(root,'artwork/scenes-v2',name+'.png');
 const out = path.join(root,'public/images/scenes-v2');
 await fs.mkdir(path.dirname(master),{recursive:true}); await fs.mkdir(out,{recursive:true});
 await fs.copyFile(source,master);
 const meta=await sharp(master).metadata();
 const mobile=name.endsWith('mobile');
 const widths=[...new Set([mobile?640:1280,meta.width].filter(w=>w<=meta.width))].sort((a,b)=>a-b);
 const variants=[];
 for(const width of widths){
  const filename=`${name}-${width}.webp`;
  await sharp(master).resize({width,withoutEnlargement:true}).webp({quality:88,effort:5}).toFile(path.join(out,filename));
  const stat=await fs.stat(path.join(out,filename));
  variants.push({src:'/images/scenes-v2/'+filename,width,bytes:stat.size});
 }
 const manifest=await fs.readFile(manifestPath,'utf8').then(JSON.parse).catch(()=>({}));
 manifest[name]={width:meta.width,height:meta.height,src:variants.at(-1).src,srcset:variants.map(v=>`${v.src} ${v.width}w`).join(', '),variants};
 await fs.writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n');
 console.log(JSON.stringify({name,...manifest[name]}));
}
