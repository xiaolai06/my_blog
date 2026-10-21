export interface PetalSample {time:number;x:number;y:number;vx:number;vy:number;angle:number;flip:number;pitch:number}
export interface PetalFlight {samples:PetalSample[];duration:number;terminalSpeed:number}
/** Seeded variations keep individual petals distinct without sudden force changes. */
export function petalRandom(seed:number){
 let state=seed>>>0;
 return ()=>{state+=0x6D2B79F5;let value=state;value=Math.imul(value^(value>>>15),value|1);value^=value+Math.imul(value^(value>>>7),value|61);return((value^(value>>>14))>>>0)/4294967296;};
}
/** Pixel-space visual model: gravity, quadratic vertical drag and damped side wind.
 * Integrate at 60 Hz; only sampled transform keyframes reach the browser renderer.
 * No upward impulse is applied: flutter changes drag and orientation, not gravity.
 */
export function createPetalFlight(seed:number,height:number,depth:number,windTime=0):PetalFlight{
 const random=petalRandom(seed),scale=[.64,.88,1.12][depth]??.88;
 const terminalSpeed=(76+random()*30)*scale,gravity=270*scale,response=1.2+random()*.7;
 const flutter=1.4+random()*1.6,phase=random()*Math.PI*2,flipDirection=random()>.5?1:-1;
 const flipSpeed=(28+random()*38)*flipDirection,initialAngle=random()*360,initialFlip=random()*180;
 const dt=1/60,samples:PetalSample[]=[];
 let x=0,y=0,vx=12*scale,vy=terminalSpeed*.18,angle=initialAngle,omega=(random()-.5)*24,time=0;
 function sample(){
  samples.push({time,x,y,vx,vy,angle,flip:initialFlip+time*flipSpeed+Math.sin(time*flutter+phase)*24,pitch:Math.sin(time*flutter*.7+phase)*18});
 }
 sample();
 for(let step=1;step<=3600;step++){
  const breeze=(17+Math.sin((windTime+time)*.34)*13+Math.sin((windTime+time)*.83)*5)*scale;
  const localFlutter=Math.sin(time*flutter+phase)*7*scale;
  const drag=1+.24*Math.pow(Math.cos((initialFlip+time*flipSpeed)*Math.PI/180),2);
  vx+=(breeze+localFlutter-vx)*response*dt;
  vy+=gravity*(1-drag*Math.pow(vy/terminalSpeed,2))*dt;
  omega+=((breeze-vx)*.8+Math.sin(time*flutter+phase)*22-omega*1.8)*dt;
  x+=vx*dt;y+=vy*dt;angle+=omega*dt;time=step*dt;
  if(step%5===0||y>=height+64)sample();
  if(y>=height+64)break;
 }
 return{samples,duration:time,terminalSpeed};
}
