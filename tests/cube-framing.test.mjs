import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../public/experience.js',import.meta.url),'utf8');
const fitSource=source.slice(source.indexOf('function fitCamera('),source.indexOf('function paintCube('));
function fit(params){return vm.runInNewContext(`${fitSource}\nfitCamera(size,depth,width,height,perspective,reach)`,params);}
function footprint(params,camera){
 const {rx,ry,size,depth,perspective,reach}=params,{scale,offsetX,offsetY}=camera;
 const ax=rx*Math.PI/180,ay=ry*Math.PI/180,points=[];
 // Include resting, intermediate and fully extended cards at several chronological depths.
 for(const offset of [0,reach/2,reach])for(const x of [-size/2,size/2])for(const y of [-size/2,size/2])for(const z of [-depth/2,0,depth/2]){
  const x1=(x+offset)*Math.cos(ay)+z*Math.sin(ay),z1=-(x+offset)*Math.sin(ay)+z*Math.cos(ay);
  const y1=y*Math.cos(ax)-z1*Math.sin(ax),z2=y*Math.sin(ax)+z1*Math.cos(ax);
  points.push([(scale*x1+offsetX)/(1-scale*z2/perspective),(scale*y1+offsetY)/(1-scale*z2/perspective)]);
 }
 return {left:Math.min(...points.map(p=>p[0])),right:Math.max(...points.map(p=>p[0])),top:Math.min(...points.map(p=>p[1])),bottom:Math.max(...points.map(p=>p[1]))};
}

test('balanced framing contains resting and extended cards at phone and laptop sizes throughout rotation',()=>{
 for(const width of [260,300,336,390,600,800,1100])for(const rx of [-75,-18,0,35])for(const ry of [-180,-110,-90,-52,-42,-28,-14,0,14,70]){
  const params={width,height:360,size:Math.min(440,width*.56),depth:width*.72,perspective:1600,rx,ry};params.reach=params.size*.5;
  const box=footprint(params,fit(params)),margin=Math.max(16,Math.min(28,width*.04));
  assert.ok(box.left>=-width/2+margin-.01&&box.right<=width/2-margin+.01,`horizontal clipping at ${width}px, ${rx}/${ry}`);
  assert.ok(box.top>=-180+28-.01&&box.bottom<=180-28+.01,`vertical clipping at ${width}px, ${rx}/${ry}`);
  assert.ok(Math.abs(box.left+box.right)<.1,'combined interaction footprint is horizontally balanced');
  assert.ok(Math.abs(box.top+box.bottom)<.1,'combined interaction footprint is vertically balanced');
  const used=Math.max((box.right-box.left)/(width-2*margin),(box.bottom-box.top)/304);
  assert.ok(used>.999||fit(params).scale>1.499,'uses available space until a margin or enlargement ceiling is reached');
 }
});

test('front-facing placement balances the slide instead of anchoring the cube to the left edge',()=>{
 for(const width of [336,800]){
  const params={width,height:400,size:Math.min(440,width*.56),depth:width*.72,perspective:1600,rx:0,ry:0};params.reach=params.size*.5;
  const camera=fit(params),box=footprint(params,camera),base=footprint({...params,reach:0},camera);
  assert.ok(Math.abs(box.left+box.right)<.1);
  assert.ok((base.left+base.right)/2<0,'cube rests left of center to balance the extension');
  assert.ok(base.left>=-width/2+Math.max(16,Math.min(28,width*.04))-.01,'respects the responsive left margin');
  if(width>=800)assert.ok(base.left>-width/2+80,'desktop cube stays away from the left edge when height limits the fit');
 }
 const params={width:800,height:500,size:380,depth:576,perspective:1600,reach:190,rx:-18};
 for(const ry of [-52,-42,-28,-14,0]){
  const a=fit({...params,ry:ry-.001}),b=fit({...params,ry:ry+.001});
  assert.ok(Math.abs(a.scale-b.scale)<.001&&Math.abs(a.offsetX-b.offsetX)<.1,'no framing jumps during rotation');
 }
});

test('framing can enlarge compact geometry and leaves edge-on Timeline centered',()=>{
 const enlarged=fit({width:1100,height:800,size:300,depth:300,perspective:1600,reach:150,rx:0,ry:0});
 assert.ok(enlarged.scale>1.25,'can grow beyond the old scale-one limit');
 const camera=fit({width:336,height:360,size:300,depth:280,perspective:Infinity,reach:0,rx:0,ry:-90});
 assert.ok(Math.abs(camera.offsetX)<.05&&Math.abs(camera.offsetY)<.05);
 assert.ok(camera.scale>0&&camera.scale<=1.5);
});
