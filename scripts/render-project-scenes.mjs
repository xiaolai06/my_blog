import {createRequire} from 'node:module';
import {readFile,stat} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {fileURLToPath} from 'node:url';
import {vertex,fragment} from './project-scene-shader.mjs';

// Build-time tool only. PLAYWRIGHT_MODULE and CHROME_PATH can point at an
// existing browser runtime; the deployed blog needs neither it nor WebGL.
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=new URL('../',import.meta.url);
const frames=576,fps=24,width=1728,height=576;
const variants=process.argv.includes('--variants');
const jobs=['studio','stream'].flatMap(name=>(variants?['dawn','day','night']:['dusk']).map(phase=>({name,phase})));
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{}),args:['--enable-unsafe-swiftshader']});
try{
 async function render({name,phase}){
  const suffix=phase==='dusk'?'':`-${phase}-v2`;
  const label=`${name}-${phase}`;
  const context=await browser.newContext({viewport:{width,height}});
  const page=await context.newPage();await page.setContent('<canvas></canvas>');
  const bytes=await readFile(new URL(`public/images/projects-${name}${suffix}.webp`,root));
  await page.evaluate(async({vertex,fragment,image,width,height,footer})=>{
   const canvas=document.querySelector('canvas');canvas.width=width;canvas.height=height;
   const gl=canvas.getContext('webgl',{alpha:false,preserveDrawingBuffer:true});
   if(!gl)throw new Error('Offline renderer needs a WebGL context');
   const compile=(type,source)=>{const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader));return shader};
   const program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));gl.useProgram(program);
   const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
   const bitmap=new Image();bitmap.src=image;await bitmap.decode();const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,bitmap);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
   gl.uniform1i(gl.getUniformLocation(program,'image'),0);gl.uniform1f(gl.getUniformLocation(program,'footer'),footer);gl.viewport(0,0,width,height);
   const tick=gl.getUniformLocation(program,'time');window.renderFrame=time=>{gl.uniform1f(tick,((time%24)+24)%24);gl.drawArrays(gl.TRIANGLES,0,6);return canvas.toDataURL('image/jpeg',.98).split(',')[1]};
  },{vertex,fragment,image:`data:image/webp;base64,${bytes.toString('base64')}`,width,height,footer:name==='stream'?1:0});
  const zero=await page.evaluate(()=>window.renderFrame(0)),end=await page.evaluate(()=>window.renderFrame(24));
  if(zero!==end)throw new Error(`${label}: loop endpoint mismatch`);
  const output=fileURLToPath(new URL(`public/videos/projects-${name}${phase==='dusk'?'-v1':suffix}.mp4`,root));
  const ff=spawn(process.env.FFMPEG_PATH||'ffmpeg',['-hide_banner','-loglevel','error','-y','-f','image2pipe','-vcodec','mjpeg','-framerate',String(fps),'-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','23','-g','48','-keyint_min','48','-sc_threshold','0','-pix_fmt','yuv420p','-movflags','+faststart',output],{windowsHide:true,stdio:['pipe','ignore','pipe']});
  let errors='';ff.stderr.on('data',chunk=>errors+=chunk);const done=new Promise((resolve,reject)=>{ff.on('error',reject);ff.on('close',code=>code===0?resolve():reject(new Error(errors)))});
  for(let i=0;i<frames;i++){const frame=i===0?zero:await page.evaluate(t=>window.renderFrame(t),i/fps);if(!ff.stdin.write(Buffer.from(frame,'base64')))await once(ff.stdin,'drain');if(i%144===0)console.log(`${label}: ${i}/${frames}`);}
  ff.stdin.end();await done;await context.close();console.log(JSON.stringify({output,bytes:(await stat(output)).size,seconds:24,frames,width,height,loop:'identical endpoints'}));
 }
 await Promise.all([0,1].map(async()=>{let job;while(job=jobs.shift())await render(job);}));
}finally{await browser.close()}
