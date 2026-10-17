import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../public/cube-gesture.js',import.meta.url),'utf8');
function harness(){
 const local={},global={},calls=[];let capture=null,enabled=false,clock=1000;
 const stage={clientWidth:300,addEventListener:(n,fn)=>local[n]=fn,setPointerCapture:id=>capture=id,hasPointerCapture:id=>capture===id,releasePointerCapture:()=>capture=null};
 const window={addEventListener:(n,fn)=>global[n]=fn};
 vm.runInNewContext(source,{window,performance:{now:()=>clock}});
 const controller=window.OWNEY_CUBE_GESTURE.mount(stage,{touchEnabled:()=>enabled,angles:()=>({rx:-18,ry:-52}),start:()=>calls.push('start'),change:a=>calls.push(a),end:r=>calls.push(r)});
 const event=(x,y,extra={})=>({pointerId:1,pointerType:'touch',isPrimary:true,button:0,clientX:x,clientY:y,preventDefault(){},...extra});
 return {calls,controller,enable(){enabled=true;},down:(x,y,extra)=>local.pointerdown(event(x,y,extra)),move:(x,y,extra)=>local.pointermove(event(x,y,extra)),up:()=>global.pointerup(event(0,0)),cancel:()=>global.pointercancel(event(0,0)),capture:()=>capture,advance:()=>clock+=400};
}
test('normal touch leaves page scrolling alone; rotation mode captures one finger immediately',()=>{
 const h=harness();h.down(10,10);h.move(100,100);assert.equal(h.calls.length,0);
 h.enable();h.down(10,10);assert.equal(h.capture(),1);
 h.down(20,20,{pointerId:2,isPrimary:false});h.move(200,200,{pointerId:2,isPrimary:false});assert.equal(h.calls.length,1);
 h.move(130,10);assert.equal(h.calls.at(-1).ry,20);assert.equal(h.calls.at(-1).rx,-18);
 h.up();assert.equal(h.capture(),null);assert.equal(h.controller.suppressClick,true);
 h.advance();assert.equal(h.controller.suppressClick,false);
});
test('cancel releases capture and a fresh gesture works without a stuck drag',()=>{
 const h=harness();h.enable();h.down(0,0);h.move(-1000,1000);
 assert.equal(h.calls.at(-1).ry,-180);assert.equal(h.calls.at(-1).rx,-75);
 h.cancel();assert.equal(h.capture(),null);assert.equal(h.calls.at(-1).cancelled,true);
 const count=h.calls.length;h.move(100,100);assert.equal(h.calls.length,count);
 h.down(0,0);h.move(80,-20);assert.equal(h.calls.at(-1).ry,-4);h.up();
});
test('mouse clicks are preserved and a deliberate drag cannot click a tag afterwards',()=>{
 const h=harness();h.down(0,0,{pointerType:'mouse'});h.move(2,1,{pointerType:'mouse'});h.up();assert.equal(h.controller.suppressClick,false);
 h.down(0,0,{pointerType:'mouse'});h.move(100,0,{pointerType:'mouse'});assert.ok(Math.abs(h.calls.at(-1).ry+24)<.0001);h.up();assert.equal(h.controller.suppressClick,true);
});
