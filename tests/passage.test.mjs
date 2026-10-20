import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../public/passage.js',import.meta.url),'utf8');
const flush=()=>new Promise(resolve=>setImmediate(resolve));
function harness(){
 const observers=[],listeners={},frames=[],running=new Map(),loads={dog:0,country:0};
 let resolveDog,resolveCountry,resizeChanged=false;
 const dog=new Promise(resolve=>resolveDog=resolve),country=new Promise(resolve=>resolveCountry=resolve);
 const elements=[0,1].map(()=>{
  const names=new Set();
  return {names,style:{setProperty(){}},getBoundingClientRect:()=>({width:1366,height:720}),
   querySelector:()=>({getBoundingClientRect:()=>({width:765})}),
   classList:{add:n=>names.add(n),remove:n=>names.delete(n),toggle:(n,on)=>on?names.add(n):names.delete(n)}};
 });
 class Observer{constructor(fn,options){this.fn=fn;this.options=options;observers.push(this);}observe(){}unobserve(){}
  emit(element,ratio){this.fn([{target:element,isIntersecting:ratio>0,intersectionRatio:ratio}]);}}
 const motion={matches:false,addEventListener:(name,fn)=>listeners.motion=fn};
 const document={hidden:false,querySelectorAll:()=>elements,addEventListener:(name,fn)=>listeners[name]=fn};
 const window={IntersectionObserver:Observer,addEventListener:(name,fn)=>listeners[name]=fn,
  OwneyRunner:{prepare:()=>{loads.dog++;return dog;},resize(){},setRunning:(e,on)=>running.set(e,on)},
  OwneyCountry:{prepare:()=>{loads.country++;return country;},resize:()=>resizeChanged}};
 vm.runInNewContext(source,{window,document,matchMedia:()=>motion,IntersectionObserver:Observer,requestAnimationFrame:fn=>{frames.push(fn);return frames.length;}});
 return {elements,observers,listeners,running,loads,motion,document,resolveDog,resolveCountry,
  frame(){const batch=frames.splice(0);batch.forEach(fn=>fn());},changed(){resizeChanged=true;}};
}
test('first playback waits for both decoded scenes and two warm-up frames',async()=>{
 const h=harness(),[a,b]=h.elements;
 h.observers[0].emit(a,1);h.observers[1].emit(a,1);h.observers[1].emit(a,.9);
 assert.deepEqual(h.loads,{dog:1,country:1},'overlapping observers must not start duplicate preparation');
 h.resolveDog(true);await flush();assert.notEqual(h.running.get(a),true);
 h.resolveCountry(true);await flush();assert(a.names.has('is-ready'));assert.notEqual(h.running.get(a),true);
 h.frame();assert.notEqual(h.running.get(a),true);h.frame();assert.equal(h.running.get(a),true);
 assert.notEqual(h.running.get(b),true,'offscreen passage stays stopped');
 h.observers[1].emit(a,.39);assert.equal(h.running.get(a),true,'small edge movement does not restart playback');
 h.observers[1].emit(a,.1);assert.equal(h.running.get(a),false);
 h.observers[1].emit(a,.2);assert.equal(h.running.get(a),false);
 h.observers[1].emit(a,.5);assert.equal(h.running.get(a),true);
 h.document.hidden=true;h.listeners.visibilitychange();assert.equal(h.running.get(a),false);
 h.document.hidden=false;h.listeners.visibilitychange();assert.equal(h.running.get(a),true);
 h.motion.matches=true;h.listeners.motion();assert.equal(h.running.get(a),false);
 h.motion.matches=false;h.listeners.motion();assert.equal(h.running.get(a),true);
});
test('leaving during preparation never starts a hidden animation; failed assets remain still',async()=>{
 const h=harness(),[a]=h.elements;h.observers[1].emit(a,1);h.resolveDog(true);h.resolveCountry(true);
 await flush();h.observers[1].emit(a,0);h.frame();h.frame();assert.equal(h.running.get(a),false);
 const f=harness(),[b]=f.elements;f.observers[1].emit(b,1);f.resolveDog(true);f.resolveCountry(false);
 await flush();f.frame();f.frame();assert.equal(b.names.has('is-ready'),false);assert.notEqual(f.running.get(b),true);
});
test('scenery paints once at a bounded size and reuses the decoded image',async()=>{
 const code=fs.readFileSync(new URL('../public/country-scene.js',import.meta.url),'utf8');
 let requests=0,draws=0,width=1920,height=1080;
 const makeCanvas=()=>({width:0,height:0,style:{setProperty(){}},getContext:()=>({scale(){},drawImage(){draws++;},createLinearGradient:()=>({addColorStop(){}}),fillRect(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){}})});
 class Image{naturalWidth=1672;naturalHeight=941;set src(value){assert.equal(value,'assets/owney-country-scene.png','only the original countryside artwork is loaded');}decode(){requests++;return Promise.resolve();}}
 const window={},document={createElement:makeCanvas};
 vm.runInNewContext(code,{window,document,Image,devicePixelRatio:2});
 const tracks=new Map();const element={getBoundingClientRect:()=>({width,height}),querySelector:selector=>({replaceChildren:(...children)=>tracks.set(selector,children)})};
 await window.OwneyCountry.prepare(element);assert.equal(requests,1);assert.equal(draws,9);
 const canvases=[...tracks.values()].flat();assert.equal(canvases.length,8);
 assert.equal(tracks.get('.country-far .country-track')[1].className,'country-sky');
 assert(canvases.every(c=>c.width<=1920));
 assert(canvases.reduce((total,c)=>total+c.width*c.height,0)<1920*1080*3,'less than three screens of textures');
 assert.equal(window.OwneyCountry.resize(element),false);assert.equal(draws,9,'no per-frame painting or unchanged resize repaint');
 width=390;height=790;assert.equal(window.OwneyCountry.resize(element),true);assert.equal(draws,18);
 await window.OwneyCountry.prepare(element);assert.equal(requests,1);assert.equal(draws,18);
});
