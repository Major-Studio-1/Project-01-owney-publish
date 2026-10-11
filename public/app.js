(() => {
  'use strict';
  const data = window.OWNEY_DATA;
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let selected = 0,selectionSource='select';
  let visibleIndices = data.events.map((_,i)=>i);
  let mapGroups = [];
  let mapNodes=[],activePin=null,highlightedIndices=null;
  $('#map-land').innerHTML = data.countries.map(c => `<path class="land" d="${c.path}"/>`).join('');
  function renderMap(){
    mapGroups=[];
    visibleIndices.forEach(i=>{const e=data.events[i];if(!e.point||e.mapLocation?.status!=='confirmed')return;let group=mapGroups.find(g=>g.place===e.place);if(!group){group={place:e.place,point:e.point,indices:[]};mapGroups.push(group);}group.indices.push(i);});
    $('#map-pins').innerHTML=mapGroups.map((g,i)=>`<g class="pin" data-map-group="${i}" role="button" tabindex="0" aria-label="Explore ${esc(g.place)}, ${g.indices.length} ${g.indices.length===1?'tag':'tags'}" transform="translate(${g.point})"><circle class="halo" r="19"/><circle r="6"/><text text-anchor="${g.point[0]>690?'end':'start'}" x="${g.point[0]>690?-14:14}" y="-16">${esc(g.place.split(',')[0].split(' / ')[0])}</text></g>`).join('');
    mapNodes=$$('.pin');activePin=null;
    if(highlightedIndices)setHighlightedIndices(highlightedIndices);
  }
  function setHighlightedIndices(indices){
    highlightedIndices=new Set(indices);
    mapNodes.forEach((pin,id)=>pin.classList.toggle('in-range',mapGroups[id].indices.some(i=>highlightedIndices.has(i))));
    updateMapFocus();
  }
  function updateMapFocus(preview=false){
    const e=data.events[selected],inRange=highlightedIndices===null||highlightedIndices.has(selected);
    const nextPin=(inRange||preview)?mapNodes.find((_,id)=>mapGroups[id].indices.includes(selected)):null;
    if(activePin!==nextPin){if(activePin){activePin.classList.remove('active');activePin.setAttribute('aria-pressed','false');}if(nextPin){nextPin.classList.add('active');nextPin.setAttribute('aria-pressed','true');nextPin.parentNode.append(nextPin);}activePin=nextPin;}
    const count=mapNodes.filter(pin=>pin.classList.contains('in-range')).length;
    $('.map-selection-label').textContent=(count?count+' in selected dates':'None in selected dates')+(nextPin&&!inRange?' + preview':'');
    $('#map-location-note').textContent=!e?'No tags match the current filters.':nextPin?'Museum-recorded encounter · Approximate city center.':!e.point?'Unconfirmed location: no point for this tag.':!count?'No confirmed encounters in the highlighted dates.':'Only museum-recorded encounters are mapped.';
    $('#map-caption').innerHTML=`<div><strong>${nextPin?esc(e.place):'No selected map point'}</strong><span>${!e?'No matching tags':nextPin?esc(e.label):!e.point?'Location unconfirmed':count+' confirmed places in the highlighted dates'}</span></div>`;
  }
  function setVisibleIndices(indices){
    visibleIndices=[...new Set(indices.filter(i=>Number.isInteger(i)&&i>=0&&i<data.events.length))].sort((a,b)=>data.events[a].date.localeCompare(data.events[b].date)||a-b);
    if(!visibleIndices.includes(selected))selected=visibleIndices[0]??null;
    renderMap();
    window.dispatchEvent(new CustomEvent('owney:scope'));
    if(selected!==null)selectEvent(selected,true,'scope');else updateMapFocus();
  }
  function selectMapGroup(id){
    let indices=mapGroups[id]?.indices;if(!indices)return;
    const inRange=indices.filter(i=>highlightedIndices?.has(i));if(inRange.length)indices=inRange;
    const pos=indices.indexOf(selected);selectEvent(indices[(pos+1)%indices.length]);
  }
  function selectEvent(i,force=false,source='select') {
    if (!Number.isInteger(i) || i < 0 || i >= data.events.length) return;
    if(i===selected&&!force&&(source==='hover'||selectionSource===source))return;
    selected = i;selectionSource=source;
    updateMapFocus(source==='hover');
    window.dispatchEvent(new CustomEvent('owney:selection', {detail:{index:i,source}}));
  }
  let openItem=null;
  function openObject(id) {
    const t = data.items.find(t => t.id === id);
    if (!t) return;
    openItem=t;
    $('#object-content').innerHTML = `<div class="object-layout"><div><img class="object-photo" src="${t.image}" alt="${esc(t.title)}"><div class="object-views" role="group" aria-label="Museum photograph views">${t.media.map((m,i)=>`<button type="button" class="quiet-button" data-media-index="${i}" aria-pressed="${i===0}">View ${i+1}</button>`).join('')}</div><p class="object-credit">Museum photograph · Smithsonian National Postal Museum · CC0</p></div><div><p class="eyebrow">THE OBJECT / ${esc(t.category)}</p><h2 id="object-title">${esc(t.title)}</h2><dl class="object-meta"><dt>Object no.</dt><dd>0.052985.${t.id}</dd><dt>Date field</dt><dd>${esc(t.date)}</dd><dt>Place field</dt><dd>${esc(t.places.join('; ') || 'Not recorded')}</dd><dt>Medium</dt><dd>${esc(t.medium)}</dd><dt>Dimensions</dt><dd>${esc(t.dimensions)}</dd></dl><h3>The museum’s record</h3><p>${esc(t.description || "No description is provided in this record.")}</p><a href="${t.url}" target="_blank" rel="noopener">Read the original museum record ↗</a></div></div>`;
    $('#object-dialog').showModal();
  }
  $('#object-content').addEventListener('click',e=>{const b=e.target.closest('[data-media-index]');if(!b||!openItem)return;const index=Number(b.dataset.mediaIndex),media=openItem.media[index];if(!media)return;const photo=$('#object-content .object-photo');photo.src=index===0?openItem.image:media.url;photo.alt=openItem.title+' — museum view '+(index+1);$$('[data-media-index]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));});
  document.addEventListener('click', e => {
    const object = e.target.closest('[data-object]'); if (object) openObject(object.dataset.object);
    const pin = e.target.closest('[data-event]'); if (pin) selectEvent(+pin.dataset.event);
    const group=e.target.closest('[data-map-group]');if(group)selectMapGroup(+group.dataset.mapGroup);
  });
  $('#map-pins').addEventListener('keydown', e => {const pin=e.target.closest('[data-map-group]');if(pin&&(e.key==='Enter'||e.key===' ')){e.preventDefault();selectMapGroup(+pin.dataset.mapGroup);}});
  $('.close-dialog').addEventListener('click', () => $('#object-dialog').close());
  $('#object-dialog').addEventListener('click', e => {
    if (e.target !== $('#object-dialog')) return;
    const r = e.target.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) e.target.close();
  });
  renderMap();selectEvent(0,true);
  window.owney = {data, selectEvent, setVisibleIndices, setHighlightedIndices,openObject, get visibleIndices(){return visibleIndices;},get selected() {return selected;}};
})();
