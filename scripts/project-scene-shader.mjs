// Offline scene motion: camera and architecture remain fixed. All frequencies
// are integral multiples of 24 seconds, including the value and velocity seam.
export const vertex = `attribute vec2 position;varying vec2 uv;
void main(){uv=(position+1.0)*.5;gl_Position=vec4(position,0.,1.);}`;
export const fragment = `precision highp float;
varying vec2 uv;uniform sampler2D image;uniform float time;uniform float footer;
float band(float a,float b,float c,float d,float v){return smoothstep(a,b,v)*(1.-smoothstep(c,d,v));}
float ellipse(vec2 p,vec2 c,vec2 r){vec2 q=(p-c)/r;return exp(-dot(q,q)*2.);}
void main(){
 vec2 p=vec2(uv.x,1.-uv.y);float phase=time*6.28318530718/24.;
 float wind=(sin(phase*2.)+.22*sin(phase*3.+.4))/1.22;
 vec2 delta=vec2(0.);
 // Window-frame, notebook and laptop are deliberately excluded from the wind.
 float studioBranch=band(.48,.52,.97,1.,p.x)*(1.-smoothstep(.27,.40,p.y));
 float streamBranch=smoothstep(.70,.83,p.x)*(1.-smoothstep(.32,.43,p.y));
 float branches=mix(studioBranch,streamBranch,footer);
 delta.x+=branches*max(.44-p.y,0.)*.008*wind;
 delta.y+=branches*(p.x-.94)*.006*wind;
 float studioSky=band(.59,.70,.96,1.,p.x)*band(.16,.24,.46,.52,p.y);
 float streamSky=(1.-smoothstep(.27,.42,p.y))*(1.-smoothstep(.64,.77,p.x));
 float sky=mix(studioSky,streamSky,footer);
 delta.x+=sky*.0035*sin(phase+p.y*2.);
 delta.y+=sky*.0012*sin(phase*2.+p.x*2.);
 float water=ellipse(p,vec2(.77,.88),vec2(.28,.18))*smoothstep(.68,.76,p.y)*footer;
 delta.x+=water*.0007*sin(p.y*72.+phase*3.);
 delta.y+=water*.0005*sin(p.x*85.+phase*4.);
 // Never stretch an edge pixel into a stripe.
 vec2 edge=min(p,1.-p);delta*=smoothstep(0.,.025,min(edge.x,edge.y));
 vec3 color=texture2D(image,vec2(p.x+delta.x,1.-p.y-delta.y)).rgb;
 float halo=ellipse(p,mix(vec2(.905,.38),vec2(.62,.52),footer),vec2(.09,.16));
 color+=vec3(1.,.58,.30)*halo*.018*(.5+.5*sin(phase*2.))*(1.-color);
 color+=vec3(1.,.75,.50)*water*.012*(.5+.5*sin(phase*3.+p.y*65.));
 gl_FragColor=vec4(color,1.);
}`;
