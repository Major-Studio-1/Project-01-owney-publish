/* Prepare small scenery textures once; only transforms move during playback. */
(()=>{'use strict';
const states=new WeakMap();
let artwork;
function loadArtwork(){
 if(!artwork)artwork=(async()=>{
  const image=new Image();image.src='assets/owney-country-scene.png';
  try{await image.decode();return image;}catch{return null;}
 })();
 return artwork;
}
function texture(image,width,height,top=0,bottom=1,fade=null,blur=0){
 const scale=Math.min(devicePixelRatio||1,1.25,1920/width);
 const canvas=document.createElement('canvas');
 canvas.width=Math.max(1,Math.round(width*scale));
 canvas.height=Math.max(1,Math.round(height*(bottom-top)*scale));
 const context=canvas.getContext('2d',{alpha:!!fade});
 const cover=Math.max(width/image.naturalWidth,height/image.naturalHeight);
 const w=image.naturalWidth*cover,h=image.naturalHeight*cover;
 context.scale(scale,scale);
 if(blur)context.filter=`blur(${blur}px)`;
 context.drawImage(image,(width-w)/2,(height-h)/2-height*top,w,h);
 context.filter='none';
 if(fade){
  const gradient=context.createLinearGradient(0,0,0,height*(bottom-top));
  fade.forEach(([stop,alpha])=>gradient.addColorStop(stop,`rgba(0,0,0,${alpha})`));
  context.globalCompositeOperation='destination-in';
  context.fillStyle=gradient;context.fillRect(0,0,width,height*(bottom-top));
 }
 return canvas;
}
function copies(canvas){
 return [canvas,...[1,2].map(()=>{
  const copy=document.createElement('canvas');copy.width=canvas.width;copy.height=canvas.height;
  copy.getContext('2d').drawImage(canvas,0,0);return copy;
 })];
}
function resize(element){
 const state=states.get(element);if(!state)return false;
 const {width,height}=element.getBoundingClientRect();
 if(!width||!height)return false;
 const size=`${Math.round(width)}:${Math.round(height)}:${Math.min(devicePixelRatio||1,1.25)}`;
 if(state.size===size)return false;
 state.size=size;
 const far=texture(state.image,width*1.08,height);
 const middle=texture(state.image,width,height,.60,.87,[[0,0],[1/3,1],[20/27,1],[1,0]]);
 const near=texture(state.image,width,height,.79,1,[[0,0],[8/21,1],[1,1]],.65);
 element.querySelector('.country-far .country-track').replaceChildren(far);
 element.querySelector('.country-middle .country-track').replaceChildren(...copies(middle));
 element.querySelector('.country-near .country-track').replaceChildren(...copies(near));
 return true;
}
async function prepare(element){
 const image=await loadArtwork();if(!image)return false;
 if(!states.has(element))states.set(element,{image,size:''});
 resize(element);return true;
}
window.OwneyCountry={prepare,resize};
})();
