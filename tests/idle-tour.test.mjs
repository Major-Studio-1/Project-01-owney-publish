import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../public/idle-tour.js',import.meta.url),'utf8');
function harness(){
 let now=0,id=0,available=true,ids=[61,62,63,64,65];const timers=new Map(),selected=[],states=[],window={};
 const setTimeout=(fn,ms)=>{timers.set(++id,{fn,time:now+ms});return id;};
 const clearTimeout=id=>timers.delete(id);
 vm.runInNewContext(source,{window,setTimeout,clearTimeout});
 const tour=window.OWNEY_IDLE_TOUR.create({getIds:()=>ids,canRun:()=>available,select:i=>selected.push(i),onRunning:on=>states.push(on)});
 return {tour,selected,states,timers,setAvailable:value=>available=value,setIds:value=>ids=value,
  advance(ms){const end=now+ms;while(true){const next=[...timers].sort((a,b)=>a[1].time-b[1].time)[0];if(!next||next[1].time>end)break;now=next[1].time;timers.delete(next[0]);next[1].fn();}now=end;}};
}
test('idle tour waits, follows selected dates chronologically, and rests before looping',()=>{
 const h=harness();h.advance(11999);assert.deepEqual(h.selected,[]);h.advance(1);assert.deepEqual(h.selected,[61]);
 h.advance(4*4600);assert.deepEqual(h.selected,[61,62,63,64,65]);h.advance(7999);assert.equal(h.selected.length,5);h.advance(1);assert.equal(h.selected.at(-1),61);
});
test('interaction and changed filters cancel the next step and restart the idle delay',()=>{
 const h=harness();h.advance(12000);h.advance(2000);h.tour.activity();assert.equal(h.tour.running,false);
 h.setIds([3,8]);h.advance(11999);assert.deepEqual(h.selected,[61]);h.advance(1);h.advance(4600);assert.deepEqual(h.selected,[61,3,8]);
});
test('hidden, reduced-motion, reading, or disabled tours do not advance; empty scopes are safe',()=>{
 const h=harness();h.setAvailable(false);h.advance(36000);assert.deepEqual(h.selected,[]);
 h.setAvailable(true);h.setIds([]);h.advance(12000);assert.deepEqual(h.selected,[]);
 h.setIds([1]);h.advance(12000);assert.deepEqual(h.selected,[]);
 h.setIds([1,2]);h.tour.setEnabled(false);h.advance(60000);assert.deepEqual(h.selected,[]);assert.equal(h.timers.size,0);
 h.tour.setEnabled(true);h.advance(12000);assert.deepEqual(h.selected,[1]);h.tour.destroy();assert.equal(h.timers.size,0);
});
test('the opening range is May through December 1896 and includes exactly five dated tags',()=>{
 const window={};vm.runInNewContext(fs.readFileSync(new URL('../public/timeline-model.js',import.meta.url),'utf8'),{window});
 const dataContext={window:{}};vm.runInNewContext(fs.readFileSync(new URL('../public/data.js',import.meta.url),'utf8'),dataContext);
 const model=window.OWNEY_TIMELINE_MODEL,events=dataContext.window.OWNEY_DATA.events,domain=model.makeDomain(events),range=model.initialRange(domain);
 assert.equal(new Date(range.start*model.dayMs).toISOString().slice(0,10),'1896-05-01');assert.equal(new Date(range.end*model.dayMs).toISOString().slice(0,10),'1896-12-31');
 assert.deepEqual(Array.from(model.members(domain,range.start,range.end),i=>events[i].tag),['368','203','84','451','96.11']);
});
