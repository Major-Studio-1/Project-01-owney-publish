(()=>{'use strict';
const $=s=>document.querySelector(s),form=$('#tag-form'),city=$('#tag-city'),message=$('#tag-message'),status=$('#tag-status'),submit=$('#tag-submit'),container=$('#visitor-tags');
let next=null,loading=false,submissionId=crypto.randomUUID(),lastDraft='';
const offline=location.protocol==='file:';
if(offline){form.hidden=true;$('#community-offline').hidden=false;$('#tags-loading').hidden=true;$('#refresh-tags').hidden=true;$('#tags-empty').hidden=false;$('#tags-empty').textContent='The living collection is online. Visit the website to meet today’s travelers.';return;}
function renderTag(tag,fresh=false){
 const card=document.createElement('article');card.className='visitor-tag'+(fresh?' fresh':'');card.dataset.tagId=String(tag.id);
 const heading=document.createElement('h4');heading.textContent=tag.city;
 const words=document.createElement('p');words.textContent=tag.message;
 const time=document.createElement('time');time.dateTime=new Date(tag.created_at).toISOString();time.textContent=new Date(tag.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})+' · COMMUNITY TAG';
 const share=document.createElement('button');share.type='button';share.className='text-link share-tag';share.textContent='Share this tag ↗';share.setAttribute('aria-label','Share the tag from '+tag.city);share.addEventListener('click',()=>window.owneyShare.open(tag));
 card.append(heading,words,time,share);return card;
}
async function loadTags(more=false){
 if(loading)return;loading=true;$('#tags-loading').hidden=false;$('#tags-error').hidden=true;$('#refresh-tags').disabled=true;$('#more-tags').disabled=true;
 try{
  const response=await fetch('/api/community-tags'+(more&&next?'?before='+next:''),{cache:'no-store'});const body=await response.json();if(!response.ok)throw Error(body.error||'The collection could not load.');
  if(!more)container.replaceChildren();
  for(const tag of body.tags)if(!container.querySelector('[data-tag-id="'+Number(tag.id)+'"]'))container.append(renderTag(tag));
  const linkedId=Number(new URLSearchParams(location.search).get('tag'));
  if(!more&&Number.isSafeInteger(linkedId)&&linkedId>0){
    const linkedResponse=await fetch('/api/community-tags?tag='+linkedId,{cache:'no-store'});
    const linked=await linkedResponse.json();
    if(linkedResponse.ok){container.querySelector('[data-tag-id="'+linkedId+'"]')?.remove();container.prepend(renderTag(linked.tag,true));}
    else {$('#tags-error').hidden=false;$('#tags-error').textContent='That shared tag is unavailable. Browse the latest tags below.';}
  }
  next=body.next;$('#more-tags').hidden=!next;$('#tags-empty').hidden=container.childElementCount>0;
 }catch(error){$('#tags-error').hidden=false;$('#tags-error').textContent='The collection could not load. Your draft is safe here. Use Refresh to try again.';}
 finally{loading=false;$('#tags-loading').hidden=true;$('#refresh-tags').disabled=false;$('#more-tags').disabled=false;}
}
function updateCount(){ $('#tag-count').textContent=message.value.length+' / 180'; }
message.addEventListener('input',updateCount);
async function saveTag(){
 if(!form.reportValidity())throw Error('Add a place and a message within the displayed limits.');
 const draft=JSON.stringify({city:city.value.trim(),message:message.value.trim()});
 if(lastDraft!==draft){submissionId=crypto.randomUUID();lastDraft=draft;}
 submit.disabled=true;city.readOnly=true;message.readOnly=true;submit.textContent='Adding your tag…';status.dataset.error='false';status.textContent='';
 try{
  const response=await fetch('/api/community-tags',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...JSON.parse(draft),submissionId,website:$('#tag-website').value})});
  const body=await response.json().catch(()=>{throw Error('Your tag could not be saved. Your message is still here—please try again.');});if(!response.ok)throw Error(body.error||'Your tag could not be saved. Please try again.');
  const old=container.querySelector('[data-tag-id="'+Number(body.tag.id)+'"]');if(old)old.remove();
  container.prepend(renderTag(body.tag,true));$('#tags-empty').hidden=true;
  status.textContent='Your tag is now part of the shared collection. Thank you for welcoming Owney.';form.reset();updateCount();lastDraft='';submissionId=crypto.randomUUID();return body.tag;
 }catch(error){status.dataset.error='true';status.textContent=error.message==='Failed to fetch'?'Your tag could not be saved. Your message is still here—please try again.':error.message;throw error;}
 finally{submit.disabled=false;city.readOnly=false;message.readOnly=false;submit.innerHTML='Add my tag <span aria-hidden="true">↗</span>';}
}
form.addEventListener('submit',event=>{event.preventDefault();saveTag().catch(()=>{});});$('#refresh-tags').addEventListener('click',()=>loadTags());$('#more-tags').addEventListener('click',()=>loadTags(true));
const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){loadTags();observer.disconnect();}},{rootMargin:'300px'});observer.observe($('#community'));
// Draft preparation changes only the visible form. Publishing stays an explicit visitor action.
if(document.modelContext?.registerTool){for(const tool of [
 {name:'read_owney_community_tags',title:'Read visible visitor tags',description:'Read visitor-created messages currently shown in the shared collection, which are distinct from museum records.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:true},execute:()=>({tags:[...container.children].map(c=>({city:c.querySelector('h4').textContent,message:c.querySelector('p').textContent})),moreAvailable:!!next})},
 {name:'draft_owney_community_tag',title:'Draft a tag for Owney',description:'Fill the visible place and message fields without submitting. The visitor reviews the public-sharing note and clicks Add my tag to publish.',inputSchema:{type:'object',properties:{city:{type:'string',minLength:2,maxLength:60},message:{type:'string',minLength:3,maxLength:180}},required:['city','message'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:true},execute:input=>{if(typeof input?.city!=='string'||input.city.trim().length<2||input.city.length>60||typeof input.message!=='string'||input.message.trim().length<3||input.message.length>180)throw Error('Use a place of 2–60 characters and a message of 3–180 characters.');city.value=input.city;message.value=input.message;updateCount();window.owneyExperience.setView('community');return {drafted:true,published:false};}}
]){try{Promise.resolve(document.modelContext.registerTool(tool)).catch(()=>{});}catch{}}}
})();
