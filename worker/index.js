import {listTags, addTag, getTag} from './db.js';
const json = (data, status=200) => Response.json(data, {status, headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const clean = value => typeof value === 'string' ? value.trim().replace(/\s+/g,' ') : '';
async function readSmallBody(request) {
  if (!request.body) throw new Error('empty');
  const reader = request.body.getReader(), chunks=[];
  let length=0;
  while (true) {
    const {done,value}=await reader.read();
    if(done) break;
    length+=value.byteLength;
    if(length>4096) {await reader.cancel();throw new Error('large');}
    chunks.push(value);
  }
  const body=new Uint8Array(length);let offset=0;
  for(const chunk of chunks){body.set(chunk,offset);offset+=chunk.length;}
  return JSON.parse(new TextDecoder().decode(body));
}
export default {
  async fetch(request,env) {
    const url=new URL(request.url);
    if(url.pathname !== '/api/community-tags') {
      if(url.pathname.startsWith('/api/')) return json({error:'Not found'},404);
      if(!['GET','HEAD'].includes(request.method)) return new Response('Method not allowed',{status:405});
      return env.ASSETS.fetch(request);
    }
    try {
      if(request.method === 'GET') {
        if(url.searchParams.has('tag')) {
          const id=Number(url.searchParams.get('tag'));
          if(!Number.isSafeInteger(id)||id<=0)return json({error:'That tag link is not valid.'},400);
          const tag=await getTag(env,id);
          return tag?json({tag}):json({error:'That tag could not be found.'},404);
        }
        const raw=url.searchParams.get('before'), before=raw===null ? null : Number(raw);
        if(raw!==null && (!Number.isSafeInteger(before)||before<=0)) return json({error:'Invalid page. Refresh the collection.'},400);
        return json(await listTags(env,before));
      }
      if(request.method !== 'POST') return json({error:'Method not allowed'},405);
      if(request.headers.get('Origin') !== url.origin || request.headers.get('Sec-Fetch-Site') === 'cross-site') return json({error:'Please add your tag from this website.'},403);
      if(!(request.headers.get('Content-Type')||'').startsWith('application/json')) return json({error:'Please use the tag form.'},415);
      let body;
      try {body=await readSmallBody(request);} catch {return json({error:'We could not read that tag. Please try again.'},400);}
      if(!body || typeof body!=='object') return json({error:'Please use the tag form.'},400);
      const city=clean(body.city),message=clean(body.message),submissionId=clean(body.submissionId);
      if(city.length<2||city.length>60) return json({error:'Add a city or place between 2 and 60 characters.'},400);
      if(message.length<3||message.length>180) return json({error:'Write a message between 3 and 180 characters.'},400);
      if(!/^[a-f0-9-]{36}$/i.test(submissionId)||body.website) return json({error:'Please refresh and try again.'},400);
      if(/[\u0000-\u001f\u007f]/.test(city+message)||/https?:\/\/|www\./i.test(city+' '+message)) return json({error:'Please keep your tag to plain words, without links.'},400);
      const createdAt=Date.now();
      // No raw network addresses are stored or exposed in the collection.
      const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode((request.headers.get('CF-Connecting-IP')||'local-preview')+'|owney|'+new Date(createdAt).toISOString().slice(0,10)));
      const requesterHash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
      const result=await addTag(env,{city,message,submissionId,createdAt,requesterHash});
      if(result.conflict) return json({error:'This tag was already sent. Refresh before creating another.'},409);
      if(result.limited) return json({error:'Thank you for leaving your mark. Please wait an hour before adding another tag.'},429);
      return json({tag:result.tag},result.replay?200:201);
    } catch(error) {
      console.error('Owney community storage unavailable:',error.message);
      return json({error:'The shared collection is temporarily unavailable. Your message is still here; please try again shortly.'},503);
    }
  }
};
