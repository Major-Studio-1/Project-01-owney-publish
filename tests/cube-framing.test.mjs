import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../public/experience.js',import.meta.url),'utf8');
const fitSource=source.slice(source.indexOf('function fitCamera('),source.indexOf('function paintCube('));

test('phone and laptop framing contain every half-width slide throughout rotation and left alignment',()=>{
 for(const width of [260,300,336,390,600,800,1100])for(const rx of [-75,-18,0,35])for(const ry of [-180,-110,-90,-52,-42,-28,-14,0,14,70]){
  const height=360,size=Math.min(440,width*.56),depth=width*.72,reach=size*.5,perspective=1600;
  const {scale,offsetX,offsetY}=vm.runInNewContext(`${fitSource}\nfitCamera(size,depth,width,height,perspective,reach,faceAlignment())`,{rx,ry,width,height,size,depth,perspective,reach});
  const ax=rx*Math.PI/180,ay=ry*Math.PI/180;
  // Check both resting and fully extended cards, including intermediate chronological positions.
  for(const offset of [0,reach])for(const x of [-size/2,size/2])for(const y of [-size/2,size/2])for(const z of [-depth/2,0,depth/2]){
   const x1=(x+offset)*Math.cos(ay)+z*Math.sin(ay),z1=-(x+offset)*Math.sin(ay)+z*Math.cos(ay);
   const y1=y*Math.cos(ax)-z1*Math.sin(ax),z2=y*Math.sin(ax)+z1*Math.cos(ax);
   const screenX=(scale*x1+offsetX)/(1-scale*z2/perspective),screenY=(scale*y1+offsetY)/(1-scale*z2/perspective);
   assert.ok(Math.abs(screenX)<width/2-5,`horizontal clipping at ${width}px, ${rx}/${ry}`);
   assert.ok(Math.abs(screenY)<height/2-5,`vertical clipping at ${width}px, ${rx}/${ry}`);
  }
 }
});

test('face-on framing reaches the left inset and easing has no jumps at its boundaries',()=>{
 for(const width of [336,800]){
  const size=Math.min(440,width*.56),depth=width*.72,rx=0,ry=0,perspective=1600;
  const fit=vm.runInNewContext(`${fitSource}\nfitCamera(size,depth,width,400,perspective,size*.5,faceAlignment())`,{rx,ry,width,size,depth,perspective});
  const left=Math.min(...[-depth/2,depth/2].map(z=>(-fit.scale*size/2+fit.offsetX)/(1-fit.scale*z/perspective)));
  assert.ok(Math.abs(left-(-width/2+12))<.001,'front-facing cards align to the stage left inset');
 }
 const alignment=ry=>vm.runInNewContext(`${fitSource}\nfaceAlignment()`,{rx:-18,ry});
 assert.equal(alignment(-52),0);assert.equal(alignment(-42),0);assert.equal(alignment(0),1);
 assert.ok(alignment(-28)<alignment(-14));
 assert.ok(alignment(-41.9)<.0001);assert.ok(alignment(-.1)>.9999);
});

test('timeline framing remains centered and has no card extension',()=>{
 const fit=vm.runInNewContext(`${fitSource}\nfitCamera(300,280,336,360,Infinity,0)`,{rx:0,ry:-90});
 assert.ok(Math.abs(fit.offsetX)<.001);
 assert.ok(Math.abs(fit.offsetY)<.001);
 assert.ok(fit.scale>0&&fit.scale<=1);
});
