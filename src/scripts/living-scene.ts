/** Local illustration motion, rather than translating the entire picture.
 * Every temporal frequency is an integer harmonic of a seamless 24 s loop.
 * Source UV masks stay attached to the artwork through every cover crop.
 */
const VERTEX = `attribute vec2 aPosition;varying vec2 vUV;void main(){vUV=(aPosition+1.0)*.5;gl_Position=vec4(aPosition,0.0,1.0);}`;
const FRAGMENT = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D uImage;
uniform sampler2D uPrevious;
uniform float uBlend;
uniform vec2 uSpan;
uniform vec2 uOffset;
uniform float uTime;
uniform float uFooter;
uniform float uNight;
varying vec2 vUV;
const float TAU=6.28318530718;
float ellipse(vec2 p,vec2 c,vec2 r){return 1.0-smoothstep(.46,1.0,length((p-c)/r));}
vec3 source(vec2 uv){vec2 sampleUV=vec2(clamp(uv.x,.001,.999),1.0-clamp(uv.y,.001,.999));vec3 current=texture2D(uImage,sampleUV).rgb;if(uBlend>.999)return current;return mix(texture2D(uPrevious,sampleUV).rgb,current,uBlend);}
void main(){
 vec2 p=vec2(vUV.x,1.0-vUV.y)*uSpan+uOffset;
 float phase=uTime*TAU/24.0;
 // A coherent inverse warp bends the crown AND its branches around a fixed root.
 // Never mask by pixel colour: that splits blossoms from dark branches and looks
 // like boiling water. The feathered spatial field also avoids cut-out seams.
 float heroHeight=clamp((.82-p.y)/.72,0.0,1.0);
 float heroLeft=mix(.27,-.17,heroHeight);
 float heroRight=mix(.43,.64,heroHeight);
 float heroTree=smoothstep(heroLeft-.07,heroLeft+.015,p.x);
 heroTree*=1.0-smoothstep(heroRight-.035,heroRight+.065,p.x);
 heroTree*=1.0-smoothstep(.74,.825,p.y);
 float footerHeight=clamp((.82-p.y)/.53,0.0,1.0);
 float footerLeft=mix(.9,.795,footerHeight);
 float footerTree=smoothstep(footerLeft-.008,footerLeft+.025,p.x);
 footerTree*=smoothstep(.25,.34,p.y)*(1.0-smoothstep(.76,.835,p.y));
 // 12 s main sway + an 8 s soft gust; value and velocity repeat at 24 s.
 float wind=(sin(phase*2.0)+.22*sin(phase*3.0+.45))/1.22;
 float heroAngle=.0182*wind;
 float footerAngle=.0105*wind;
 vec2 heroBend=vec2(-max(.82-p.y,0.0)*heroAngle,
   (p.x-.36)*heroAngle*1.45)*heroTree;
 vec2 footerBend=vec2(-max(.82-p.y,0.0)*footerAngle,
   (p.x-.93)*footerAngle*2.15)*footerTree;
 vec2 displacement=mix(heroBend,footerBend,uFooter);
 float crown=mix(heroTree*smoothstep(.3,.76,heroHeight),
   footerTree*smoothstep(.25,.75,footerHeight),uFooter);
 // Only the outer hair tips respond. The head, central back and clothing stay still.
 float hairHero=ellipse(p,vec2(.756,.819),vec2(.023,.046));
 hairHero*=smoothstep(.792,.817,p.y)*(1.0-smoothstep(.841,.858,p.y));
 hairHero*=smoothstep(.004,.013,abs(p.x-.756));
 float hairFooter=ellipse(p,vec2(.797,.661),vec2(.017,.061));
 hairFooter*=smoothstep(.642,.667,p.y)*(1.0-smoothstep(.699,.721,p.y));
 hairFooter*=smoothstep(.003,.010,abs(p.x-.797));
 float hair=mix(hairHero,hairFooter,uFooter);
 displacement.x+=hair*mix(.0025,.0016,uFooter)*sin(phase*3.0+1.6);
 displacement.y+=hair*.00034*sin(phase*2.0);
 float skyHero=(1.0-smoothstep(.25,.62,p.y))*smoothstep(.55,.70,p.x);
 float skyFooter=(1.0-smoothstep(.52,.60,p.y))*(1.0-smoothstep(.75,.87,p.x));
 float sky=mix(skyHero,skyFooter,uFooter);
 // Clouds drift different distances in the soft sky region, without moving terrain.
 displacement.x+=sky*mix(.013,.0065,uFooter)*sin(phase+p.y*2.0);
 displacement.y+=sky*mix(.0026,.0013,uFooter)*sin(phase*2.0+p.x*2.0);
 float water=ellipse(p,vec2(.55,.853),vec2(.115,.09))*uFooter;
 // A broad, slow reflection shimmer instead of high-frequency image ripples.
 displacement.x+=water*.00035*sin(p.y*25.0+phase*3.0);
 // Settle the wind before the source boundary; clamping a displaced edge would
 // stretch one pixel into a visible stripe in the exported film.
 vec2 edgeDistance=min(p,vec2(1.0)-p);
 displacement*=smoothstep(0.0,.035,min(edgeDistance.x,edgeDistance.y));
 vec3 color=source(p+displacement);
 vec2 sunHero=mix(vec2(.894,.783),vec2(.894,.754),uNight);
 vec2 sunFooter=mix(vec2(.55,.739),vec2(.651,.397),uNight);
 vec2 sun=mix(sunHero,sunFooter,uFooter);
 vec2 sunRadius=mix(vec2(.12,.17),vec2(.13,.13),uFooter);
 float halo=ellipse(p,sun,sunRadius);
 float breathe=.5+.5*sin(phase*2.0-.8);
 vec3 light=mix(vec3(1.0,.48,.19),vec3(.39,.52,.75),uNight);
 color+=light*halo*(.011+.021*breathe)*(1.0-color);
 color+=vec3(1.0,.67,.38)*water*.012*(.5+.5*sin(phase*3.0+p.y*25.0));
 // Fine illumination on blossoms, never a full-screen brightness pulse.
 color+=vec3(1.0,.43,.35)*crown*.006*(.5+.5*sin(phase*2.0+.4));
 gl_FragColor=vec4(color,1.0);
}`;

type SceneDetail = { src?: string; period?: string };
const instances = new WeakSet<HTMLElement>();

export function setupLivingScenes() {
  document.querySelectorAll<HTMLElement>('[data-living-scene]').forEach(host => {
    if (instances.has(host)) return;
    instances.add(host);
    createScene(host);
  });
}

function createScene(host: HTMLElement) {
  const image = host.querySelector<HTMLImageElement>('img')!;
  const canvas = host.querySelector<HTMLCanvasElement>('canvas')!;
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const limited = connection?.saveData || (memory !== undefined && memory <= 2) || (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 2);
  let gl: WebGLRenderingContext | null = null;
  let program: WebGLProgram | null = null;
  let texture: WebGLTexture | null = null;
  let previousTexture: WebGLTexture | null = null;
  let blend = 1;
  let buffer: WebGLBuffer | null = null;
  let uniforms: Record<string, WebGLUniformLocation | null> = {};
  let visible = false, ready = false, failed = false, disposed = false;
  let exporting = false;
  let raf = 0, probe = 0, last = 0, elapsed = 0, loadVersion = 0;
  let spanX = 1, spanY = 1, offsetX = 0, offsetY = 0;
  let resizePending = false;
  let period = host.closest<HTMLElement>('[data-phase]')?.dataset.phase || '';

  function markReady() {
    image.dataset.livingSourceReady = image.currentSrc || image.src;
    host.dataset.sourceReady = image.currentSrc || image.src;
    image.dispatchEvent(new CustomEvent('living-scene-ready', { bubbles: true, detail: { src: image.currentSrc || image.src } }));
  }

  function stop() {
    if (raf) cancelAnimationFrame(raf);
    if (probe) clearTimeout(probe);
    raf = probe = 0;
    last = 0;
    host.dataset.running = 'false';
  }

  function staticFallback() {
    stop(); ready = false; failed = true;
    host.dataset.renderer = 'static';
    if (gl) {
      if (texture) gl.deleteTexture(texture);
      if (previousTexture && previousTexture !== texture) gl.deleteTexture(previousTexture);
      if (buffer) gl.deleteBuffer(buffer);
      if (program) gl.deleteProgram(program);
    }
    texture = previousTexture = buffer = program = null;
    markReady();
  }

  function initialize() {
    if (gl || failed || limited || reduced.matches) return;
    gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power', preserveDrawingBuffer: new URLSearchParams(location.search).has('scene-export') });
    if (!gl) { staticFallback(); return; }
    const context = gl;
    function compile(type: number, source: string) {
      const shader = context.createShader(type);
      if (!shader) throw new Error('Shader allocation failed');
      context.shaderSource(shader, source); context.compileShader(shader);
      if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) { context.deleteShader(shader); throw new Error('Shader compilation failed'); }
      return shader;
    }
    let vertex: WebGLShader | null = null, fragment: WebGLShader | null = null;
    try {
      vertex = compile(context.VERTEX_SHADER, VERTEX); fragment = compile(context.FRAGMENT_SHADER, FRAGMENT);
      program = context.createProgram();
      if (!program) throw new Error('Program allocation failed');
      context.attachShader(program, vertex); context.attachShader(program, fragment); context.linkProgram(program);
      if (!context.getProgramParameter(program, context.LINK_STATUS)) throw new Error('Shader link failed');
      context.useProgram(program);
      buffer = context.createBuffer(); context.bindBuffer(context.ARRAY_BUFFER, buffer);
      context.bufferData(context.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), context.STATIC_DRAW);
      const position = context.getAttribLocation(program, 'aPosition');
      context.enableVertexAttribArray(position); context.vertexAttribPointer(position, 2, context.FLOAT, false, 0, 0);
      ['uImage','uPrevious','uBlend','uSpan','uOffset','uTime','uFooter','uNight'].forEach(name => uniforms[name] = context.getUniformLocation(program!, name));
      context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, true);
    } catch { staticFallback(); }
    finally { if (vertex) context.deleteShader(vertex); if (fragment) context.deleteShader(fragment); }
  }

  function objectPosition(value: string) {
    const parts = value.split(/\s+/);
    const number = (part: string | undefined, fallback: number) => {
      if (!part) return fallback;
      if (part === 'left' || part === 'top') return 0;
      if (part === 'right' || part === 'bottom') return 1;
      if (part === 'center') return .5;
      return part.endsWith('%') ? parseFloat(part) / 100 : fallback;
    };
    return [number(parts[0], .5), number(parts[1], .5)];
  }

  function resize() {
    resizePending = false;
    if (disposed) return;
    canvas.className = image.className.replace('living-scene-image', 'living-scene-canvas');
    canvas.style.cssText = image.style.cssText;
    const style = getComputedStyle(image), width = image.offsetWidth, height = image.offsetHeight;
    if (!width || !height || !image.naturalWidth || !image.naturalHeight) return;
    Object.assign(canvas.style, { position: 'absolute', left: image.offsetLeft + 'px', top: image.offsetTop + 'px', width: width + 'px', height: height + 'px', right: 'auto', bottom: 'auto', margin: '0', maxWidth: 'none' });
    const dpr = Math.min(devicePixelRatio || 1, 1.5, Math.sqrt(1_800_000 / (width * height)));
    const w = Math.max(1, Math.round(width * dpr)), h = Math.max(1, Math.round(height * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    const imageAspect = image.naturalWidth / image.naturalHeight, boxAspect = width / height;
    spanX = Math.min(1, boxAspect / imageAspect); spanY = Math.min(1, imageAspect / boxAspect);
    const [x, y] = objectPosition(style.objectPosition);
    offsetX = (1 - spanX) * x; offsetY = (1 - spanY) * y;
    if (ready) draw();
  }

  function scheduleResize() {
    if (!resizePending) { resizePending = true; requestAnimationFrame(resize); }
  }

  function draw() {
    if (!gl || !program || !ready) return;
    gl.viewport(0, 0, canvas.width, canvas.height); gl.useProgram(program);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, previousTexture || texture);
    gl.uniform1i(uniforms.uImage, 0); gl.uniform1i(uniforms.uPrevious, 1); gl.uniform1f(uniforms.uBlend, blend * blend * (3 - 2 * blend));
    gl.uniform2f(uniforms.uSpan, spanX, spanY);
    gl.uniform2f(uniforms.uOffset, offsetX, offsetY); gl.uniform1f(uniforms.uTime, elapsed);
    gl.uniform1f(uniforms.uFooter, host.dataset.kind === 'footer' ? 1 : 0);
    gl.uniform1f(uniforms.uNight, period === 'night' ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  function layerHidden() {
    const layer = host.closest<HTMLElement>('.footer-scene-layer');
    return Number(getComputedStyle(layer || image).opacity) < .001;
  }

  function allowed() {
    return !exporting && visible && ready && !failed && !reduced.matches && !document.hidden && root.dataset.motion !== 'off' && !root.hasAttribute('data-page-hidden');
  }

  function frame(now: number) {
    raf = 0;
    if (!allowed()) { stop(); return; }
    if (layerHidden()) {
      host.dataset.running = 'false'; last = 0;
      probe = window.setTimeout(() => { probe = 0; sync(); }, 400);
      return;
    }
    if (!last) last = now;
    const delta = now - last;
    if (delta >= 1000 / 30) {
      const advance = delta - delta % (1000 / 30);
      elapsed = (elapsed + Math.min(advance, 100) / 1000) % 24;
      blend = Math.min(1, blend + Math.min(advance, 100) / 900);
      if (blend === 1 && previousTexture && previousTexture !== texture) { gl?.deleteTexture(previousTexture); previousTexture = null; }
      last = now - delta % (1000 / 30);
      draw();
      host.dataset.frame = String((Number(host.dataset.frame || 0) + 1) % 1_000_000);
    }
    host.dataset.running = 'true';
    raf = requestAnimationFrame(frame);
  }

  function sync() {
    if (disposed) return;
    period = host.closest<HTMLElement>('[data-phase]')?.dataset.phase || period;
    if (allowed()) { if (!raf && !probe) raf = requestAnimationFrame(frame); }
    else { stop(); if (blend < 1) { blend = 1; draw(); } }
  }

  async function loadSource() {
    const version = ++loadVersion;
    try { await image.decode(); } catch { return; }
    if (version !== loadVersion || disposed) return;
    if (limited || reduced.matches || failed) { ready = false; host.dataset.renderer = 'static'; markReady(); return; }
    initialize();
    if (!gl || failed) return;
    try {
      const outgoing = texture;
      texture = gl.createTexture();
      if (!texture) throw new Error('Texture allocation failed');
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      if (previousTexture && previousTexture !== outgoing) gl.deleteTexture(previousTexture);
      previousTexture = host.dataset.kind === 'hero' ? outgoing : null;
      if (host.dataset.kind !== 'hero' && outgoing) gl.deleteTexture(outgoing);
      blend = previousTexture && visible && !reduced.matches && root.dataset.motion !== 'off' && !document.hidden ? 0 : 1;
      ready = true; resize(); draw(); host.dataset.renderer = 'webgl';
      host.dataset.source = image.currentSrc || image.src;
      markReady(); sync();
    } catch { staticFallback(); }
  }

  image.addEventListener('load', loadSource);
  image.addEventListener('error', () => { host.dataset.renderer = 'static'; stop(); });
  const imageChanges = new MutationObserver(records => {
    if (records.some(record => record.attributeName === 'src' || record.attributeName === 'srcset')) loadSource();
    if (records.some(record => record.attributeName === 'class' || record.attributeName === 'style')) { scheduleResize(); sync(); }
  });
  imageChanges.observe(image, { attributes: true, attributeFilter: ['src','srcset','class','style'] });
  const attributes = new MutationObserver(() => { if (probe) clearTimeout(probe); probe = 0; scheduleResize(); sync(); });
  attributes.observe(root, { attributes: true, attributeFilter: ['data-motion','data-page-hidden','data-theme'] });
  const layer = host.closest<HTMLElement>('.footer-scene-layer');
  if (layer) attributes.observe(layer, { attributes: true, attributeFilter: ['style','class'] });
  const landscape = host.closest<HTMLElement>('[data-phase]');
  if (landscape) attributes.observe(landscape, { attributes: true, attributeFilter: ['data-phase','data-scene-ready'] });
  const observer = new IntersectionObserver(entries => {
    visible = entries.some(entry => entry.isIntersecting);
    if (visible && !ready && !failed && image.complete && image.naturalWidth) loadSource();
    sync();
  }, { rootMargin: '60px' });
  observer.observe(host.closest('.footer-landscape,.hero-scene') || image);
  const size = new ResizeObserver(scheduleResize); size.observe(image);
  host.addEventListener('living-scene-change', event => {
    const detail = (event as CustomEvent<SceneDetail>).detail;
    if (detail?.period) period = detail.period;
    if (detail?.src && detail.src !== image.getAttribute('src')) image.src = detail.src;
    else { draw(); sync(); }
  });
  host.addEventListener('living-scene-refresh', () => { if (probe) clearTimeout(probe); probe = 0; sync(); });
  // Deterministic offline rendering: identical times always produce identical
  // source frames, independent of tab scheduling, frame loss or display refresh.
  host.addEventListener('living-scene-seek', event => {
    const time = (event as CustomEvent<{ time: number }>).detail?.time;
    if (!new URLSearchParams(location.search).has('scene-export') || typeof time !== 'number' || !Number.isFinite(time)) return;
    exporting = true; stop();
    elapsed = ((time % 24) + 24) % 24;
    blend = 1; draw();
    host.dataset.exportFrame = String(time);
  });
  host.addEventListener('living-scene-export-end', () => {
    exporting = false; delete host.dataset.exportFrame; sync();
  });
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', () => {
    if (reduced.matches) stop();
    else if (!ready && !failed) loadSource();
    else sync();
  });
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); staticFallback(); });
  window.addEventListener('pagehide', event => {
    stop();
    if (!(event as PageTransitionEvent).persisted) {
      disposed = true; observer.disconnect(); size.disconnect(); imageChanges.disconnect(); attributes.disconnect();
      if (gl) { if (texture) gl.deleteTexture(texture); if (previousTexture && previousTexture !== texture) gl.deleteTexture(previousTexture); if (buffer) gl.deleteBuffer(buffer); if (program) gl.deleteProgram(program); }
    }
  });
  window.addEventListener('pageshow', sync);
  if (image.complete && image.naturalWidth) loadSource();
}
