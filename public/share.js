(()=>{'use strict';
const modal=document.createElement('dialog');modal.className='share-dialog';modal.setAttribute('aria-labelledby','share-title');
modal.innerHTML=`<button class="close-dialog" id="close-share" aria-label="Close sharing">×</button><div class="share-layout"><div class="share-preview"><img id="share-image" alt="Instagram image of the selected community tag"></div><div><p class="eyebrow">PASS THE STORY ON</p><h2 id="share-title">A tag worth sharing.</h2><p>Take this little piece of Owney’s journey with you.</p><p class="community-note">Save the image for an Instagram post, or use your device’s share menu. You choose where and when to post.</p><div class="share-actions"><button class="intro-start" id="share-device">Share image ↗</button><button class="quiet-button" id="share-download">Save Instagram image ↓</button><button class="quiet-button" id="share-caption">Copy caption &amp; link</button><a href="https://www.instagram.com/" target="_blank" rel="noopener" class="text-link">Open Instagram ↗</a></div><p class="tag-status" id="share-status" role="status"></p><p class="community-note">1080 × 1350 · portrait post<br>Visitor-created words · museum portrait of Owney</p></div></div>`;
document.body.append(modal);
const $=s=>modal.querySelector(s);let current=null,blob=null,objectURL=null,returnFocus=null;
$('#close-share').addEventListener('click',()=>modal.close());modal.addEventListener('close',()=>{returnFocus?.focus();if(objectURL)URL.revokeObjectURL(objectURL);objectURL=null;blob=null;});
const site='https://owney-through-time.hihaolong.chatgpt.site/';
function link(){return site+'?tag='+current.id+'#community';}
function caption(){return 'A tag for Owney, from '+current.city+'.\n\n“'+current.message+'”\n\nA visitor contribution to Owney — A Life in Tags.\n'+link()+'\n\n#Owney #PostalDog #ALifeInTags';}
function lines(ctx,text,maxWidth){const result=[];let line='';for(const word of text.split(/\s+/)){const next=line?line+' '+word:word;if(ctx.measureText(next).width<=maxWidth){line=next;continue;}if(line)result.push(line);line='';for(const char of word){if(ctx.measureText(line+char).width>maxWidth&&line){result.push(line);line='';}line+=char;}}if(line)result.push(line);return result;}
async function makeImage(tag){
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;const ctx=canvas.getContext('2d');ctx.fillStyle='#101c29';ctx.fillRect(0,0,1080,1350);
 const image=new Image();image.src='assets/owney-portrait.jpg';await image.decode();
 ctx.save();ctx.globalAlpha=.38;ctx.drawImage(image,275,0,805,1006);ctx.restore();
 const shade=ctx.createLinearGradient(0,0,0,1350);shade.addColorStop(0,'#101c2933');shade.addColorStop(.35,'#101c29a8');shade.addColorStop(.75,'#101c29f0');shade.addColorStop(1,'#101c29');ctx.fillStyle=shade;ctx.fillRect(0,0,1080,1350);
 ctx.fillStyle='#d8b770';ctx.font='22px Arial';ctx.fillText('A NEW GENERATION OF FRIENDS',76,96);
 ctx.fillStyle='#f3eee3';ctx.font='78px Georgia';ctx.fillText('A tag for Owney.',72,204);
 ctx.strokeStyle='#d8b770';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(76,258);ctx.lineTo(220,258);ctx.stroke();
 ctx.fillStyle='#d8b770';ctx.font='32px Arial';const placeLines=lines(ctx,'FROM '+tag.city.toLocaleUpperCase('en-US'),920);placeLines.forEach((line,i)=>ctx.fillText(line,76,335+i*42));
 let size=58,wrapped=[];do{ctx.font=size+'px Georgia';wrapped=lines(ctx,'“'+tag.message+'”',920);if(wrapped.length*size*1.32<=550)break;size-=2;}while(size>30);
 ctx.fillStyle='#f3eee3';const top=415+(placeLines.length-1)*42;wrapped.forEach((line,i)=>ctx.fillText(line,76,top+i*size*1.32));
 ctx.strokeStyle='#52606a';ctx.beginPath();ctx.moveTo(76,1120);ctx.lineTo(1004,1120);ctx.stroke();
 ctx.fillStyle='#d8b770';ctx.font='23px Arial';ctx.fillText('OWNEY — A LIFE IN TAGS',76,1174);
 ctx.fillStyle='#c0c9cf';ctx.font='20px Arial';ctx.fillText('COMMUNITY TAG · '+new Date(tag.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}),76,1216);
 ctx.font='19px Arial';ctx.fillText('owney-through-time.hihaolong.chatgpt.site',76,1272);
 return new Promise((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(Error('Could not create the image.')),'image/png'));
}
async function open(tag){current=tag;blob=null;returnFocus=document.activeElement;$('#share-image').removeAttribute('src');$('#share-status').textContent='Preparing your image…';$('#share-device').disabled=true;$('#share-download').disabled=true;modal.showModal();
 try{const rendered=await makeImage(tag);if(!modal.open)return;blob=rendered;objectURL=URL.createObjectURL(blob);$('#share-image').src=objectURL;$('#share-device').disabled=false;$('#share-download').disabled=false;$('#share-status').textContent='';}
 catch{$('#share-status').textContent='The image could not be prepared. You can still copy the caption and link.';}}
function save(){if(!blob)return;const a=document.createElement('a');a.href=objectURL;a.download='a-tag-for-owney-'+current.id+'.png';document.body.append(a);a.click();a.remove();$('#share-status').textContent='Download requested. Add the image to an Instagram post and paste the caption.';}
$('#share-download').addEventListener('click',save);
$('#share-device').addEventListener('click',async()=>{if(!blob)return;const file=new File([blob],'a-tag-for-owney-'+current.id+'.png',{type:'image/png'});if(navigator.canShare?.({files:[file]})){try{await navigator.share({files:[file],title:'A tag for Owney',text:caption()});$('#share-status').textContent='Your image was passed to the share menu.';}catch(error){if(error.name!=='AbortError')$('#share-status').textContent='Sharing is unavailable here. Use Save Instagram image instead.';}}else save();});
$('#share-caption').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(caption());$('#share-status').textContent='Caption and tag link copied.';}catch{$('#share-status').textContent=caption();}});
window.owneyShare={open};
})();
