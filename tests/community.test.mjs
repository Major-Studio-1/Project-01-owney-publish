import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import worker from '../worker/index.js';
function environment(){
 const sqlite=new DatabaseSync(':memory:');
 for(const name of readdirSync('drizzle').filter(n=>n.endsWith('.sql')))sqlite.exec(readFileSync('drizzle/'+name,'utf8'));
 sqlite.exec('PRAGMA optimize');
 return {sqlite,DB:{prepare(sql){const stmt=sqlite.prepare(sql);let values=[];return{bind(...args){values=args;return this;},async first(){return stmt.get(...values)||null;},async all(){return{results:stmt.all(...values)};}};}}};
}
const origin='https://owney.test';
const post=(body,headers={})=>new Request(origin+'/api/community-tags',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','CF-Connecting-IP':'192.0.2.1',...headers},body:JSON.stringify(body)});
const draft=()=>({city:'Albany',message:'Safe travels, little friend!',submissionId:crypto.randomUUID()});
test('submissions persist, retries do not duplicate, and internal data stays private',async()=>{
 const env=environment(),body=draft();
 assert.equal((await worker.fetch(post(body),env)).status,201);
 assert.equal((await worker.fetch(post(body),env)).status,200);
 const list=await(await worker.fetch(new Request(origin+'/api/community-tags'),env)).json();
 assert.equal(list.tags.length,1);assert.equal(list.tags[0].city,'Albany');assert.equal(list.tags[0].message,body.message);
 assert.deepEqual(Object.keys(list.tags[0]).sort(),['city','created_at','id','message']);
 const shared=await(await worker.fetch(new Request(origin+'/api/community-tags?tag='+list.tags[0].id),env)).json();
 assert.equal(shared.tag.message,body.message);
 assert.equal((await worker.fetch(new Request(origin+'/api/community-tags?tag=999'),env)).status,404);
 assert.equal((await worker.fetch(post({...body,message:'Different message'}),env)).status,409);
 env.sqlite.close();
});
test('invalid, cross-origin, oversized and repeated requests are rejected',async()=>{
 const env=environment();
 assert.equal((await worker.fetch(post({...draft(),city:' '}),env)).status,400);
 assert.equal((await worker.fetch(post({...draft(),message:'https://example.com'}),env)).status,400);
 assert.equal((await worker.fetch(post(draft(),{Origin:'https://elsewhere.test'}),env)).status,403);
 assert.equal((await worker.fetch(post({...draft(),message:'a'.repeat(5000)}),env)).status,400);
 for(let i=0;i<3;i++)assert.equal((await worker.fetch(post(draft()),env)).status,201);
 assert.equal((await worker.fetch(post(draft()),env)).status,429);
 env.sqlite.close();
});
test('pagination is stable and unavailable storage produces a recoverable error',async()=>{
 const env=environment();
 for(let i=0;i<26;i++)assert.equal((await worker.fetch(post(draft(),{'CF-Connecting-IP':'192.0.2.'+(i+1)}),env)).status,201);
 const first=await(await worker.fetch(new Request(origin+'/api/community-tags'),env)).json();
 assert.equal(first.tags.length,24);assert.equal(first.next,3);
 const second=await(await worker.fetch(new Request(origin+'/api/community-tags?before='+first.next),env)).json();
 assert.equal(second.tags.length,2);assert.equal(second.next,null);
 assert.equal((await worker.fetch(new Request(origin+'/api/community-tags?before=nope'),env)).status,400);
 assert.equal((await worker.fetch(post(draft()),{})).status,503);
 const plan=env.sqlite.prepare('EXPLAIN QUERY PLAN SELECT count(*) FROM visitor_tags WHERE requester_hash = ? AND created_at > ?').all('x',0);
 assert.match(JSON.stringify(plan),/idx_visitor_tags_requester_time/);env.sqlite.close();
});
