import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../public/music-drag.js',import.meta.url),'utf8');
function harness(){
 let clock=1000,capture=null,id=0;
 const frames=new Map(),events={},global={},viewportEvents={};
 const handle={events:{},addEventListener(n,fn){this.events[n]=fn;},setPointerCapture:n=>capture=n,hasPointerCapture:n=>capture===n,releasePointerCapture:()=>capture=null};
 const panel={hidden:false,getBoundingClientRect:()=>({left:174,top:586,width:202,height:244})};
 const status={textContent:''},classes=new Set();
 const dock={querySelector:n=>({'.music-panel':panel,'.music-drag':handle,'.music-position-status':status})[n],addEventListener:(n,fn)=>events[n]=fn,style:{removeProperty(k){delete this[k];}},classList:{add:k=>classes.add(k),remove:k=>classes.delete(k)}};
 const viewport={width:390,height:844,offsetLeft:0,offsetTop:0,addEventListener:(n,fn)=>viewportEvents[n]=fn};
 const window={visualViewport:viewport,addEventListener:(n,fn)=>global[n]=fn};
 vm.runInNewContext(source,{window,document:{querySelector:()=>dock,documentElement:{clientWidth:390,clientHeight:844}},performance:{now:()=>clock},requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id)});
 const flush=()=>{const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn());};
 const position=()=>dock.style.transform?.match(/translate3d\(([-\d.]+)px,([-\d.]+)px/).slice(1).map(Number);
 const pointer=(x,y)=>({button:0,pointerId:7,isPrimary:true,clientX:x,clientY:y,preventDefault(){}});
 return {dock,panel,handle,viewport,status,position,flush,events,global,viewportEvents,pointer,capture:()=>capture,advance:()=>clock+=400};
}
test('dragging stays inside a phone viewport and never hides or resizes the player',()=>{
 const h=harness();h.events['music:open']();h.flush();
 h.handle.events.pointerdown(h.pointer(200,700));h.handle.events.pointermove(h.pointer(-900,-900));h.flush();assert.deepEqual(h.position(),[8,8]);
 h.handle.events.pointermove(h.pointer(1900,1900));h.flush();assert.deepEqual(h.position(),[180,592]);
 h.global.pointerup(h.pointer(1900,1900));assert.equal(h.capture(),null);assert.equal(h.panel.hidden,false);
 h.handle.events.click();h.flush();assert.deepEqual(h.position(),[180,592]);
});
test('tap and keyboard offer precise movement, and rotation reclamps to visible screen',()=>{
 const h=harness();h.events['music:open']();h.flush();h.handle.events.click();h.flush();assert.deepEqual(h.position(),[8,592]);
 h.handle.events.keydown({key:'ArrowRight',preventDefault(){}});h.flush();assert.deepEqual(h.position(),[28,592]);
 h.viewport.width=844;h.viewport.height=390;h.viewportEvents.resize();h.flush();assert.deepEqual(h.position(),[28,138]);
 h.handle.events.keydown({key:'Home',preventDefault(){}});h.flush();assert.deepEqual(h.position(),[634,138]);
});
test('closing during drag releases capture, resets the small launcher and remembers the panel position',()=>{
 const h=harness();h.events['music:open']();h.flush();h.handle.events.pointerdown(h.pointer(200,700));h.handle.events.pointermove(h.pointer(100,500));h.flush();const moved=h.position();
 h.panel.hidden=true;h.events['music:close']();assert.equal(h.capture(),null);assert.equal(h.dock.style.transform,undefined);
 h.panel.hidden=false;h.events['music:open']();h.flush();assert.deepEqual(h.position(),moved);
});
