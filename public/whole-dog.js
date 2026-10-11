/* Complete painted drawings with registered contact poses and a rear landing. */
(()=>{'use strict';
const FRAME_W=512,FRAME_H=320,COLUMNS=4;
const DURATIONS=[70,60,60,70,70,80,80,70,60,70,70,60,60];
const CYCLE_MS=DURATIONS.reduce((total,duration)=>total+duration,0);
function frameAt(elapsed){
 let time=elapsed%CYCLE_MS;
 for(let frame=0;frame<DURATIONS.length;frame++){
  if(time<DURATIONS[frame])return frame;
  time-=DURATIONS[frame];
 }
 return 0;
}
const states=new WeakMap();
let artwork;
function loadArtwork(){
 if(!artwork)artwork=new Promise(resolve=>{
  const image=new Image();
  image.onload=async()=>{
   try{await image.decode();resolve(image.naturalWidth===2048&&image.naturalHeight===1280?image:null);}
   catch{resolve(null);}
  };
  image.onerror=()=>resolve(null);
  image.src='assets/owney-grounded-run-atlas.webp?v=grounded-run-1';
 });
 return artwork;
}
function draw(state,force=false){
 const frame=frameAt(state.elapsed);
 if(!force&&frame===state.frame)return;
 state.frame=frame;
 const {canvas,context,image}=state;
 context.clearRect(0,0,canvas.width,canvas.height);
 context.drawImage(image,(frame%COLUMNS)*FRAME_W,Math.floor(frame/COLUMNS)*FRAME_H,FRAME_W,FRAME_H,0,0,canvas.width,canvas.height);
 canvas.dataset.frame=String(frame+1);
}
function resize(element){
 const state=states.get(element);
 if(!state)return;
 const width=state.canvas.getBoundingClientRect().width;
 if(!width)return;
 const renderWidth=Math.min(1280,Math.max(FRAME_W,Math.round(width*Math.min(devicePixelRatio||1,1.5))));
 const renderHeight=Math.round(renderWidth*FRAME_H/FRAME_W);
 if(state.canvas.width!==renderWidth||state.canvas.height!==renderHeight){
  state.canvas.width=renderWidth;state.canvas.height=renderHeight;
 }
 draw(state,true);
}
async function prepare(element){
 if(states.has(element))return true;
 const image=await loadArtwork();
 if(!image)return false;
 if(states.has(element))return true;
 const canvas=element.querySelector('.owney-frames');
 const context=canvas?.getContext('2d');
 if(!context)return false;
 states.set(element,{canvas,context,image,elapsed:0,frame:-1,running:false,raf:0,last:0});
 resize(element);return true;
}
function setRunning(element,running){
 const state=states.get(element);
 if(!state||state.running===running)return;
 state.running=running;
 if(!running){cancelAnimationFrame(state.raf);state.raf=0;state.last=0;return;}
 function tick(now){
  if(!state.running)return;
  if(state.last)state.elapsed+=Math.min(now-state.last,100);
  state.last=now;draw(state);
  state.raf=requestAnimationFrame(tick);
 }
 state.raf=requestAnimationFrame(tick);
}
window.OwneyRunner={prepare,setRunning,resize};
})();
