import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../public/experience.js',import.meta.url),'utf8');
const fitSource=source.slice(source.indexOf('function fitCamera('),source.indexOf('function paintCube('));

test('phone framing contains every full-width slide at each depth and rotation',()=>{
 for(const width of [260,300,336,390,600])for(const rx of [-75,-18,0,35])for(const ry of [-180,-110,-90,-52,0,70]){
  const height=360,size=width*.56,depth=width*.72,reach=size*.58,perspective=1600;
  const {scale,offsetX,offsetY}=vm.runInNewContext(`${fitSource}\nfitCamera(size,depth,width,height,perspective,reach)`,{rx,ry,width,height,size,depth,perspective,reach});
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

test('timeline framing remains centered and has no card extension',()=>{
 const fit=vm.runInNewContext(`${fitSource}\nfitCamera(300,280,336,360,Infinity,0)`,{rx:0,ry:-90});
 assert.ok(Math.abs(fit.offsetX)<.001);
 assert.ok(Math.abs(fit.offsetY)<.001);
 assert.ok(fit.scale>0&&fit.scale<=1);
});
