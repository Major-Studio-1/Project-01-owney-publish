(()=>{
 'use strict';
 const $=s=>document.querySelector(s),model=window.OWNEY_TIMELINE_MODEL,{data}=window.owney;
 const startInput=$('#range-start'),endInput=$('#range-end'),track=$('#range-track');
 const date=day=>new Date(day*model.dayMs).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
 const eventDay=i=>Math.floor(Date.parse(data.events[i].date)/model.dayMs);
 let domain,sourceIds,start,end,highlighted=[],rangeFrame=0,brush=null,editing=false,bars=[],firstRange=true;
 function rebuild(){
  if(brush&&track.hasPointerCapture(brush.id))track.releasePointerCapture(brush.id);
  brush=null;editing=false;
  sourceIds=window.owney.visibleIndices;domain=model.makeDomain(data.events,sourceIds);
  start=domain.firstDay;end=domain.lastDay;
  const empty=!domain.ids.length;
  track.hidden=empty;$('#range-ticks').hidden=empty;$('#range-all').disabled=empty;
  for(const input of [startInput,endInput]){input.min=empty?0:domain.firstDay;input.max=empty?0:domain.lastDay;input.disabled=empty||domain.firstDay===domain.lastDay;}
  if(empty){$('#range-distribution').innerHTML='';$('#range-ticks').innerHTML='';bars=[];return;}
  if(firstRange){({start,end}=model.initialRange(domain));firstRange=false;}
  const grouped=new Map();sourceIds.forEach(i=>{const d=eventDay(i);grouped.set(d,(grouped.get(d)||0)+1);});
  $('#range-distribution').innerHTML=[...grouped].map(([d,n])=>`<rect data-day="${d}" x="${Math.min(997,Math.max(0,model.fraction(d,domain.firstDay,domain.lastDay)*1000-1.5))}" y="${30-Math.min(28,8+n*5)}" width="3" height="${Math.min(28,8+n*5)}"/>`).join('');
  bars=[...$('#range-distribution').querySelectorAll('rect')];
  const firstYear=new Date(domain.firstDay*model.dayMs).getUTCFullYear(),lastYear=new Date(domain.lastDay*model.dayMs).getUTCFullYear();
  let ticks=[{p:0,label:firstYear===lastYear?date(domain.firstDay).replace(' '+firstYear,''):String(firstYear)},{p:1,label:firstYear===lastYear?date(domain.lastDay).replace(' '+lastYear,''):String(lastYear)}];
  if(domain.firstDay===domain.lastDay)ticks=[{p:.5,label:date(domain.firstDay)}];
  for(let y=firstYear+1;y<lastYear;y++)ticks.push({p:model.fraction(Math.floor(Date.UTC(y,0,1)/model.dayMs),domain.firstDay,domain.lastDay),label:String(y)});
  $('#range-ticks').innerHTML=ticks.map(t=>`<span class="${t.p===0?'first':t.p===1?'last':''}" style="left:${t.p*100}%">${t.label}</span>`).join('');
 }
 function render(){
  if(rangeFrame){cancelAnimationFrame(rangeFrame);rangeFrame=0;}
  if(sourceIds!==window.owney.visibleIndices)rebuild();
  if(!domain.ids.length){
   highlighted=[];start=end=null;startInput.value=endInput.value=0;
   for(const input of [startInput,endInput]){input.setAttribute('aria-valuetext','No matching dates');input.setAttribute('aria-valuemin',0);input.setAttribute('aria-valuemax',0);}
   $('#range-dates').textContent='No dated tags match these filters';$('#range-count').textContent='0 tags highlighted';
   window.owney.setHighlightedIndices([]);window.dispatchEvent(new CustomEvent('owney:range'));return;
  }
  ({start,end}=model.clampRange(start,end,domain.firstDay,domain.lastDay));
  highlighted=model.members(domain,start,end);
  startInput.value=start;endInput.value=end;
  startInput.setAttribute('aria-valuetext',date(start));endInput.setAttribute('aria-valuetext',date(end));
  startInput.setAttribute('aria-valuemin',domain.firstDay);endInput.setAttribute('aria-valuemax',domain.lastDay);
  startInput.setAttribute('aria-valuemax',end);endInput.setAttribute('aria-valuemin',start);
  track.style.setProperty('--range-start',model.fraction(start,domain.firstDay,domain.lastDay));
  track.style.setProperty('--range-end',model.fraction(end,domain.firstDay,domain.lastDay));
  $('#range-dates').textContent=start===end?date(start):date(start)+' — '+date(end);
  $('#range-count').textContent=highlighted.length+' '+(highlighted.length===1?'tag':'tags')+' highlighted';
  const days=new Set(highlighted.map(eventDay));
  bars.forEach(bar=>bar.classList.toggle('in-range',days.has(+bar.dataset.day)));
  window.owney.setHighlightedIndices(highlighted);
  // Keep the prominent map marker and story in the brush while it moves.
  if(editing&&highlighted.length&&!highlighted.includes(window.owney.selected))window.owney.selectEvent(highlighted[0],false,'range');
  window.dispatchEvent(new CustomEvent('owney:range'));
 }
 function includeSelection(){
  const day=domain.dayById[window.owney.selected];if(!Number.isFinite(day))return false;
  const next=model.includeDay(start,end,day,domain.firstDay,domain.lastDay);
  if(next.start===start&&next.end===end)return false;
  ({start,end}=next);return true;
 }
 function queue(){if(!rangeFrame)rangeFrame=requestAnimationFrame(render);}
 function commit(){editing=false;render();if(highlighted.length&&!highlighted.includes(window.owney.selected))window.owney.selectEvent(highlighted[0]);}
 for(const input of [startInput,endInput]){
  input.addEventListener('input',()=>{editing=true;({start,end}=model.clampRange(input===startInput?+input.value:start,input===endInput?+input.value:end,domain.firstDay,domain.lastDay,input===startInput?'start':'end'));queue();});
  input.addEventListener('change',commit);
 }
 function showAll(){start=domain.firstDay;end=domain.lastDay;commit();}
 $('#range-all').addEventListener('click',showAll);
 function dayAt(x,bounds){return Math.round(domain.firstDay+Math.max(0,Math.min(1,(x-bounds.left)/bounds.width))*(domain.lastDay-domain.firstDay));}
 track.addEventListener('pointerdown',e=>{
  if(e.button!==0||e.target.closest('input')||domain.firstDay===domain.lastDay)return;
  const bounds=track.getBoundingClientRect(),anchor=dayAt(e.clientX,bounds);brush={id:e.pointerId,bounds,anchor};editing=true;
  track.setPointerCapture(e.pointerId);start=end=anchor;queue();
 });
 track.addEventListener('pointermove',e=>{if(!brush||e.pointerId!==brush.id)return;const d=dayAt(e.clientX,brush.bounds);start=Math.min(brush.anchor,d);end=Math.max(brush.anchor,d);queue();});
 function finish(e){if(!brush||e.pointerId!==brush.id)return;brush=null;if(track.hasPointerCapture(e.pointerId))track.releasePointerCapture(e.pointerId);commit();}
 track.addEventListener('pointerup',finish);track.addEventListener('pointercancel',finish);
 window.addEventListener('owney:selection',e=>{
  if(e.detail?.source==='hover'||e.detail?.source==='idle')return;
  if(sourceIds!==window.owney.visibleIndices){rebuild();if(!editing)includeSelection();render();}
  else if(!editing&&includeSelection())render();
 });
 window.addEventListener('owney:scope',()=>{rebuild();includeSelection();render();});
 window.owneyRange={contains:i=>highlighted.includes(i),get editing(){return editing;},get members(){return highlighted;},get start(){return start;},get end(){return end;},refresh:render,showAll};
 rebuild();render();if(highlighted.length)window.owney.selectEvent(highlighted[0],true,'range');
})();
