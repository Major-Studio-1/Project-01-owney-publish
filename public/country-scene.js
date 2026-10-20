/* Prepare small scenery textures once; only transforms move during playback. */
(()=>{'use strict';
const states=new WeakMap();
let artwork;
// A soft, conservative sky contour in the original 1672 × 941 painting.
// Leave room around treetops and hills for the small wind displacement.
const skyline=[[0,205],[40,192],[70,180],[110,170],[150,175],[190,185],[210,220],[245,260],[276,310],[290,340],[320,340],[340,325],[370,322],[400,343],[430,365],[455,360],[475,375],[500,375],[520,365],[550,375],[580,395],[620,395],[660,390],[700,395],[750,380],[800,390],[850,400],[900,410],[950,398],[1000,382],[1050,385],[1100,395],[1150,396],[1200,388],[1250,390],[1300,400],[1350,376],[1370,360],[1400,345],[1430,355],[1460,370],[1500,370],[1540,355],[1570,310],[1610,280],[1640,260],[1672,268]];
function skyTexture(image,width,height){
 const scale=Math.min(devicePixelRatio||1,1.25,1920/width),cover=Math.max(width/image.naturalWidth,height/image.naturalHeight);
 const w=image.naturalWidth*cover,h=image.naturalHeight*cover,dx=(width-w)/2,dy=(height-h)/2;
 const canvas=document.createElement('canvas');canvas.className='country-sky';
 canvas.width=Math.max(1,Math.round(width*scale));canvas.height=Math.max(1,Math.ceil(Math.min(height,Math.max(0,dy+450*cover))*scale));
 canvas.style.setProperty('--sky-travel',24*cover+'px');
 const context=canvas.getContext('2d'),mask=document.createElement('canvas');mask.width=canvas.width;mask.height=canvas.height;
 context.drawImage(image,dx*scale,dy*scale,w*scale,h*scale);
 const ink=mask.getContext('2d');ink.filter=`blur(${12*cover*scale}px)`;ink.fillStyle='#fff';ink.beginPath();
 ink.moveTo(-100,-100);ink.lineTo(canvas.width+100,-100);
 const contour=skyline.map(([x,y])=>[(dx+x*cover)*scale,(dy+(y-48)*cover)*scale]);
 ink.lineTo(canvas.width+100,contour.at(-1)[1]);
 for(let i=contour.length-1;i>=0;i--)ink.lineTo(...contour[i]);
 ink.lineTo(-100,contour[0][1]);ink.closePath();ink.fill();
 context.globalCompositeOperation='destination-in';context.drawImage(mask,0,0);return canvas;
}
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
 element.querySelector('.country-far .country-track').replaceChildren(far,skyTexture(state.image,width*1.08,height));
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
