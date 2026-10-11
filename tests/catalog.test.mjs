import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'public/data.js'),'utf8'),context);
const data=context.window.OWNEY_DATA;
test('the complete snapshot has unique museum identities and usable primary photographs',()=>{
 assert.equal(data.items.length,377);assert.equal(new Set(data.items.map(t=>t.recordId)).size,377);
 assert.equal(data.items.reduce((sum,t)=>sum+t.media.length,0),742);
 for(const t of data.items){assert.ok(t.url.startsWith('https://postalmuseum.si.edu/object/'));assert.ok(fs.existsSync(path.join(root,'public',t.image)),t.id);assert.ok(fs.existsSync(path.join(root,'public',t.galleryImage)),t.id);assert.notEqual(t.image,t.galleryImage);assert.ok(t.media.every(m=>m.license==='CC0'));}
});
test('all guided encounters and related objects resolve, in chronological order',()=>{
 assert.equal(data.events.length,67);assert.equal(data.events[0].slug,'tag-96.7');assert.equal(data.events.at(-1).slug,'scotland');
 for(const [i,e] of data.events.entries()){
  assert.ok(Number.isFinite(Date.parse(e.date)));if(i)assert.ok(e.date>=data.events[i-1].date);
  assert.ok(e.fact&&e.imagined);assert.ok(fs.existsSync(path.join(root,'public',e.image)));
  for(const id of [e.tag,...(e.relatedTags||[])]){const t=data.items.find(t=>t.id===id);assert.ok(t,id);if(id===e.tag)assert.equal(t.scene,e.slug);}
  if(e.point){assert.ok(e.point.every(Number.isFinite));assert.ok(e.point[0]>=0&&e.point[0]<=920&&e.point[1]>=0&&e.point[1]<=540);}
 }
});

test('only explicitly evidenced, unconflicted encounters receive map coordinates',()=>{
 const audit=JSON.parse(fs.readFileSync(path.join(root,'map-location-evidence.json'),'utf8'));
 const mapped=data.events.filter(e=>e.point);
 assert.equal(mapped.length,23);assert.equal(new Set(mapped.map(e=>e.place)).size,21);
 for(const e of data.events){
  const t=data.items.find(t=>t.id===e.tag),entry=audit.records[e.tag];
  assert.equal(e.mapLocation.status,entry.status);assert.equal(entry.source,t.url);assert.equal(entry.place,e.place);
  assert.ok(entry.evidence.split(' … ').every(part=>t.description.includes(part)),e.tag);
  assert.equal(Boolean(e.point),entry.status==='confirmed'&&!e.dateCaution,e.tag);
  if(!e.point){assert.equal(e.lon,null);assert.equal(e.lat,null);}
 }
 for(const tag of ['463','196','104','60','457','153','481','482','84','19'])assert.equal(data.events.find(e=>e.tag===tag).point,null,tag);
});

test('every collection shape is a documented visual observation linked to its museum object',()=>{
 const audit=JSON.parse(fs.readFileSync(path.join(root,'tag-shape-evidence.json'),'utf8'));
 assert.equal(Object.keys(audit.records).length,377);
 for(const item of data.items){
  const entry=audit.records[item.id];
  assert.equal(entry.source,item.url);assert.equal(item.shape,entry.shape);assert.equal(item.shapeEvidence,entry.evidence);
  assert.ok(data.shapes[item.shape]);assert.ok(entry.evidence.length>20);
 }
 const counts={};
 for(const e of data.events){
  const item=data.items.find(t=>t.id===e.tag),entry=audit.records[e.tag];
  assert.equal(entry.source,item.url);assert.equal(e.shape,entry.shape);assert.equal(e.shapeEvidence,entry.evidence);
  assert.ok(data.shapes[e.shape]);assert.ok(entry.evidence.length>20);counts[e.shape]=(counts[e.shape]||0)+1;
 }
 assert.deepEqual(counts,{polygon:4,rectangle:16,circle:25,shield:9,oval:6,irregular:6,triangle:1});
});
