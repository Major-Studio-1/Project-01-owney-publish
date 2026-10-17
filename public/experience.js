(()=>{'use strict';const {$,$$}={$:s=>document.querySelector(s),$$:s=>[...document.querySelectorAll(s)]};const {data}=window.owney;const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));let currentView='intro',theme='all',spread=false,rx=-18,ry=-52,dragStart=null,moved=false,lastWheel=0;const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
let touchRotate=false,perspectiveMode='corner',cameraFrame=0,cameraTarget=null;
let cubeGeometry=null,cameraLayoutFrom=null,cameraLayoutProgress=1,cubeGesture=null,liftedIndex=null;
const chapters = ['intro','journey','collection','community'];
const initialChapter = location.hash.slice(1);
let chapterFrame = 0, navigationLock = false, navigationTimer;
const header = $('.masthead');
// Preserve document positions when the sticky header changes height.
const headerSpace = document.createElement('div');
headerSpace.className = 'masthead-space';
headerSpace.setAttribute('aria-hidden','true');
header.after(headerSpace);
let expandedHeaderHeight = header.getBoundingClientRect().height;
function measureHeader() {
  const height = header.getBoundingClientRect().height;
  if(!header.classList.contains('compact')) expandedHeaderHeight = height;
  headerSpace.style.height = Math.max(0,expandedHeaderHeight-height)+'px';
  document.documentElement.style.setProperty('--nav-height',height+'px');
  document.documentElement.style.setProperty('--page-width',document.documentElement.clientWidth+'px');
}
function compactHeader(compact) {
  if(header.classList.contains('compact') === compact) return;
  header.classList.toggle('compact',compact);
  measureHeader();
  requestAnimationFrame(drawCube);
}
function markView(name) {
  currentView = name;
  $$('.chapter').forEach(s => s.classList.toggle('active', s.id === name));
  $$('.nav').forEach(b => {
    const active = b.dataset.view === name;
    b.classList.toggle('active', active);
    if(active) b.setAttribute('aria-current','location'); else b.removeAttribute('aria-current');
  });
  const hash = name;
  if(location.hash !== '#'+hash) history.replaceState(null,'','#'+hash);
}
function trackChapter() {
  chapterFrame = 0;
  if(navigationLock) return;
  if(scrollY > expandedHeaderHeight + 16) compactHeader(true);
  else if(scrollY < 24) compactHeader(false);
  const line = header.getBoundingClientRect().height + Math.min(160, innerHeight*.18);
  let name = 'intro';
  chapters.forEach(id => {if($('#'+id).getBoundingClientRect().top <= line) name = id;});
  if(name !== currentView) markView(name);
}
function queueChapter() {if(!chapterFrame) chapterFrame = requestAnimationFrame(trackChapter);}
function unlockNavigation() {navigationLock = false; clearTimeout(navigationTimer); queueChapter();}
function setView(name, options = {}) {
  const target = name === 'cube' ? 'journey' : name;
  if(!chapters.includes(target)) throw Error('Unknown view');
  navigationLock = true;
  clearTimeout(navigationTimer);
  compactHeader(target !== 'intro');
  if(Number.isInteger(options.encounter)) window.owney.selectEvent(options.encounter);
  markView(target);
  const behavior = options.behavior || (reduced ? 'auto' : 'smooth');
  $('#'+target).scrollIntoView({block:'start',behavior});
  navigationTimer = setTimeout(unlockNavigation, behavior === 'auto' ? 0 : 1500);
}
new ResizeObserver(() => {measureHeader();queueChapter();}).observe(header);
window.addEventListener('scroll',queueChapter,{passive:true});
window.addEventListener('scrollend',unlockNavigation);
window.addEventListener('resize',()=>{
  const compact = header.classList.contains('compact');
  if(compact) {header.classList.remove('compact');expandedHeaderHeight=header.getBoundingClientRect().height;header.classList.add('compact');}
  measureHeader();queueChapter();
});
window.addEventListener('hashchange',()=>{const name=location.hash.slice(1);if(chapters.includes(name)||name==='cube')setView(name);});
document.addEventListener('click',e=>{const b=e.target.closest('[data-view]');if(b)setView(b.dataset.view);});
$('.brand').addEventListener('click',e=>{e.preventDefault();setView('intro');});
// Correctly use the Postal Museum object number, not a specimen catalog label.
$$('.badge-snippet').forEach(b=>{b.querySelector('small').textContent='Object 0.052985.'+b.dataset.object+' · Museum photograph';});
const themeIcons={
 'Rail & post':'<rect x="6" y="3" width="12" height="14" rx="3"/><path d="M7 9h10M9 3v6m6-6v6M8 21l2-4m6 4-2-4"/><circle cx="9" cy="13" r=".7"/><circle cx="15" cy="13" r=".7"/>',
 'Coins & medals':'<ellipse cx="9" cy="6" rx="6" ry="3"/><path d="M3 6v7c0 1.7 2.7 3 6 3M3 10c0 1.7 2.7 3 6 3M15 6v3"/><circle cx="16" cy="16" r="5"/><path d="M16 13v6m-2-4h4"/>',
 'Hotels & keys':'<path d="M3 7v14M21 12v9M3 17h18M3 12h18v5"/><rect x="6" y="8" width="5" height="4" rx="1"/>',
 Commerce:'<path d="M3 10l2-6h14l2 6M4 12v8h16v-8M9 20v-6h6v6M3 10c0 4 6 4 6 0 0 4 6 4 6 0 0 4 6 4 6 0"/>',
 'Civic & events':'<path d="M5 21V3m0 1h14l-3 4 3 4H5"/>',
 'Personal & licenses':'<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8" cy="10" r="2"/><path d="M5.5 16c0-3 5-3 5 0M14 9h4M14 13h4"/>',
 'Other connections':'<path d="M10 13a4 4 0 0 1 0-6l3-3a4 4 0 0 1 6 6l-2 2M14 11a4 4 0 0 1 0 6l-3 3a4 4 0 0 1-6-6l2-2M9 15l6-6"/>'
};
function themeIcon(name){return `<svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true">${themeIcons[name]}</svg>`;}
$('#theme-filters').innerHTML=`<button data-theme="all" class="active" aria-pressed="true">All themes</button>`+Object.entries(data.categories).map(([name,c])=>`<button data-theme="${esc(name)}" aria-pressed="false" style="--category:${c.color}">${themeIcon(name)}${esc(name)}</button>`).join('');
let catalogPage=0;const pageSize=24;
let collectionLinked=false,collectionJourneyIds=null,collectionFocused=null,catalogRenderKey='',collectionFrame=0;
let collectionPendingFocus=false,collectionPendingReset=false,collectionFromControls=false;
$('.catalog-filters').insertAdjacentHTML('afterend','<div id="collection-journey-link" class="collection-journey-link" hidden><div><span class="collection-link-label">Following the Journey</span><span id="collection-journey-context"></span></div><button id="collection-show-all" class="text-link" type="button">Show all '+data.items.length+' tags</button></div>');
const places=[...new Set(data.items.flatMap(t=>t.places))].sort((a,b)=>a.localeCompare(b));
const materials=[...new Set(data.items.map(t=>t.medium).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
const precisions=[...new Set(data.items.map(t=>t.datePrecision).filter(Boolean))].sort();
$('#place-filter').insertAdjacentHTML('beforeend',places.map(p=>'<option value="'+esc(p)+'">'+esc(p)+'</option>').join('')+'<option value="__missing">Place not recorded</option>');
$('#material-filter').insertAdjacentHTML('beforeend','<optgroup label="Museum material descriptions" data-recorded-materials>'+materials.map(p=>'<option value="'+esc(p)+'">'+esc(p)+'</option>').join('')+'</optgroup>');
$('#date-filter').insertAdjacentHTML('beforeend',precisions.map(p=>'<option value="'+esc(p)+'">'+esc(p)+'</option>').join(''));
$('#shape-filter').insertAdjacentHTML('beforeend',Object.entries(data.shapes).filter(([shape])=>data.items.some(t=>t.shape===shape)).map(([shape,label])=>'<option value="'+esc(shape)+'">'+esc(label)+'</option>').join(''));
function renderCollection(reset=true,focusSelection=false){
 if(reset)catalogPage=0;
 const q=$('#collection-search').value.trim().toLocaleLowerCase(),place=$('#place-filter').value,material=$('#material-filter').value,precision=$('#date-filter').value,shape=$('#shape-filter').value;
 const items=data.items.filter(t=>(!collectionJourneyIds||collectionJourneyIds.has(t.id))&&(theme==='all'||t.category===theme)&&(!place||(place==='__missing'?!t.places.length:t.places.includes(place)))&&(!material||(material.startsWith('group:')?materialGroup(t.medium)===material.slice(6):t.medium===material))&&(!precision||t.datePrecision===precision)&&(!shape||t.shape===shape)&&[t.title,t.description,t.medium,t.date,t.id,...t.places].join(' ').toLocaleLowerCase().includes(q));
 const focusedIndex=items.findIndex(item=>item.id===collectionFocused);
 if(focusSelection&&focusedIndex>=0)catalogPage=Math.floor(focusedIndex/pageSize);
 const pages=Math.ceil(items.length/pageSize);catalogPage=Math.min(catalogPage,Math.max(0,pages-1));const first=catalogPage*pageSize,visible=items.slice(first,first+pageSize);
 const renderKey=visible.map(t=>t.id).join('|');
 if(renderKey!==catalogRenderKey){
  catalogRenderKey=renderKey;
  $('#clusters').innerHTML=visible.map((t,i)=>'<div class="catalog-entry" role="listitem" style="--category:'+t.color+'"><button class="token" data-object="'+esc(t.id)+'" style="--tilt:'+((i%3-1)*3)+'deg" aria-label="Open '+esc(t.title)+'"><span class="token-photo"><img src="'+esc(t.galleryImage)+'" alt="" loading="lazy" decoding="async" width="320" height="320"></span><span class="token-name">'+esc(t.title.replace(/ Owney [Tt]ag/,'').replace(/^Owney tag /,''))+'</span><small>'+esc(t.date)+'</small>'+(t.imageDetail?'<i class="image-detail">Tag detail</i>':'')+(t.scene?'<i class="has-scene">IN THE JOURNEY</i>':'')+'</button></div>').join('');
 }
 $$('#clusters .token').forEach(button=>{const focused=button.dataset.object===collectionFocused;button.classList.toggle('journey-focused',focused);if(focused)button.setAttribute('aria-current','true');else button.removeAttribute('aria-current');const label=button.querySelector('.has-scene');if(label)label.textContent=focused?'SELECTED IN JOURNEY':'IN THE JOURNEY';});
 $('#collection').dataset.journeyLinked=String(collectionLinked);
 $('#collection-journey-link').hidden=!collectionLinked;
 const recorded=$('#material-filter [data-recorded-materials]');if(recorded)recorded.disabled=collectionLinked;
 $('#collection-count').textContent=items.length?(first+1)+'–'+(first+visible.length)+' of '+items.length+' tags'+(items.length!==data.items.length?' · '+data.items.length+' in the collection':''):'No matching tags · '+data.items.length+' in the collection';
 $('#collection-empty').hidden=items.length>0;$('#catalog-page').textContent=pages?'Page '+(catalogPage+1)+' of '+pages:'';
 $('#previous-page').disabled=catalogPage===0;$('#next-page').disabled=catalogPage>=pages-1;$('.catalog-pagination').hidden=!items.length;
 $$('[data-theme]').forEach(b=>{const on=b.dataset.theme===theme;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});return items.length;
}
function resetCollection(){if(collectionFrame)cancelAnimationFrame(collectionFrame);collectionFrame=0;collectionPendingFocus=collectionPendingReset=false;collectionLinked=false;collectionJourneyIds=null;collectionFocused=null;theme='all';['collection-search','place-filter','material-filter','date-filter','shape-filter'].forEach(id=>$('#'+id).value='');renderCollection();}
$('#theme-filters').addEventListener('click',e=>{const b=e.target.closest('[data-theme]');if(b){theme=b.dataset.theme;if(collectionLinked)changeCollectionFacet('theme',theme);else renderCollection();}});
$('#collection-search').addEventListener('input',()=>renderCollection());['place-filter','date-filter'].forEach(id=>$('#'+id).addEventListener('change',()=>renderCollection()));
$('#shape-filter').addEventListener('change',()=>{if(collectionLinked)changeCollectionFacet('shape',$('#shape-filter').value||'all');else renderCollection();});
$('#material-filter').addEventListener('change',()=>{if(collectionLinked)changeCollectionFacet('material',$('#material-filter').value.replace(/^group:/,'')||'all');else renderCollection();});
$('#collection-show-all').addEventListener('click',resetCollection);
$('#clear-search').addEventListener('click',resetCollection);$('#reset-collection').addEventListener('click',resetCollection);
function turnPage(delta){catalogPage+=delta;renderCollection(false);$('#collection-title').focus({preventScroll:true});$('#collection-title').scrollIntoView({block:'start',behavior:'auto'});}
$('#previous-page').addEventListener('click',()=>turnPage(-1));$('#next-page').addEventListener('click',()=>turnPage(1));renderCollection();
// Fixed chronological planes: move the camera, never reorder the objects.
const allIndices=data.events.map((_,i)=>i),years=[...new Set(data.events.map(e=>e.date.slice(0,4)))];
$('#journey-scope').innerHTML=`<option value="all">All dated tags (${data.events.length})</option><option value="highlights">Story highlights (${data.events.filter(e=>e.highlight).length})</option>`+years.map(year=>{const n=data.events.filter(e=>e.date.startsWith(year)).length;return `<option value="${year}">${year} (${n} ${n===1?'tag':'tags'})</option>`;}).join('');
const compactControls=matchMedia('(max-width:420px)');
function labelCompactControls(){
 const compact=compactControls.matches;
 for(const option of $('#journey-scope').options){
  const value=option.value,n=data.events.filter(e=>value==='all'||(value==='highlights'?e.highlight:e.date.startsWith(value))).length;
  option.textContent=value==='all'?(compact?'All '+n+' tags':'All dated tags ('+n+')'):value==='highlights'?(compact?'Highlights':'Story highlights ('+n+')'):value+' ('+n+(compact?'':n===1?' tag':' tags')+')';
 }
 $('#spacing').options[0].textContent=compact?'Even':'Even spacing';$('#spacing').options[1].textContent=compact?'Calendar':'Calendar time';
}
labelCompactControls();compactControls.addEventListener('change',labelCompactControls);
const shapeLabels=data.shapes;
let selectedShape='all',journeyTheme='all',selectedMaterial='all',facetActivated=false,facetLead=null,facetOrder=[];
const categoriesById=new Map(data.items.map(item=>[item.id,item.category]));
const mediaById=new Map(data.items.map(item=>[item.id,item.medium]));
const eventThemes=data.events.map(event=>categoriesById.get(event.tag));
function materialGroup(medium){
 const text=String(medium||'').toLowerCase();
 if(text.includes('enamel'))return 'enamel';
 if(text.includes('brass'))return 'brass';
 if(text.includes('copper'))return 'copper';
 if(text.includes('silver'))return 'silver';
 if(text.includes('leather'))return 'leather';
 if(text.includes('metal')||text.includes('mdtal'))return 'metal';
 return text?'other':'unrecorded';
}
const eventMaterials=data.events.map(event=>materialGroup(mediaById.get(event.tag)));
const materialLabels={metal:'Metal, unspecified',brass:'Brass',copper:'Copper',silver:'Silver',enamel:'Metal & enamel',leather:'Leather',other:'Other materials',unrecorded:'Not recorded'};
$('#material-filter').insertAdjacentHTML('beforeend','<optgroup label="Journey material groups">'+Object.entries(materialLabels).map(([key,label])=>'<option value="group:'+key+'">'+esc(label)+'</option>').join('')+'</optgroup>');
const materialGlyphs={metal:'M',brass:'B',copper:'C',silver:'S',enamel:'E',leather:'L',other:'?',unrecorded:'?'};
const shapeIcons={all:'<circle cx="7" cy="7" r="3"/><rect x="14" y="4" width="7" height="6"/><path d="M8 20L15 12L22 20Z"/>',circle:'<circle cx="12" cy="12" r="8"/>',oval:'<ellipse cx="12" cy="12" rx="9" ry="6"/>',rectangle:'<path d="M3 6H21V18H3Z"/>',shield:'<path d="M4 4H20V10C20 15 16 19 12 21C8 19 4 15 4 10Z"/>',triangle:'<path d="M12 3L22 20H2Z"/>',polygon:'<path d="M7 3H17L22 12L17 21H7L2 12Z"/>',irregular:'<path d="M4 4L15 3L17 8L21 9L19 18L11 21L8 16L3 13Z"/>'};
const shapeChoices=[['all','All shapes'],...Object.entries(shapeLabels).filter(([shape])=>data.events.some(e=>e.shape===shape))];
const themeChoices=[['all','All themes'],...Object.keys(data.categories).map(name=>[name,name])];
const materialChoices=[['all','All materials'],...Object.entries(materialLabels).filter(([key])=>eventMaterials.includes(key))];
const facetRails=$('.cube-filter-rails'),facetLinks=$('#facet-links'),facetMobile=matchMedia('(max-width:979px)'),facetHover=matchMedia('(hover:hover) and (pointer:fine)');
const facets={
 shape:{nav:$('#tag-shapes'),choices:shapeChoices,labels:shapeLabels,icon:value=>shapeIcons[value],field:'shape'},
 theme:{nav:$('#tag-themes'),choices:themeChoices,labels:Object.fromEntries(themeChoices),icon:value=>value==='all'?'<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/>':themeIcons[value],field:'journeyTheme'},
 material:{nav:$('#tag-materials'),choices:materialChoices,labels:materialLabels,icon:value=>value==='all'?'<path d="M3 7l9-4 9 4-9 4zM3 12l9 4 9-4M3 17l9 4 9-4"/>':`<text x="12" y="16" text-anchor="middle" class="material-glyph">${materialGlyphs[value]}</text>`,field:'material'}
};
const disclosures={},facetHint=$('#facet-tooltip');let facetLinkFrame=0,facetHintFrame=0,facetHoverButton=null,facetFocusButton=null;
function positionFacetHint(){
 const button=facetHoverButton||facetFocusButton;if(!button||facetHint.hidden||facetMobile.matches)return;
 const canvas=$('.cube-canvas').getBoundingClientRect(),anchor=button.getBoundingClientRect(),viewport=document.documentElement.clientWidth;
 const boxes=[...facetRails.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width&&+getComputedStyle(b).opacity>0).map(b=>b.getBoundingClientRect());
 const railLeft=Math.min(...boxes.map(b=>b.left)),railRight=Math.max(...boxes.map(b=>b.right));
 const leftRoom=Math.max(0,railLeft-24),rightRoom=Math.max(0,viewport-railRight-24);
 facetHint.style.maxWidth='320px';facetHint.style.left='0px';
 const width=facetHint.getBoundingClientRect().width,left=leftRoom>=width||(rightRoom<width&&leftRoom>=rightRoom);
 facetHint.style.maxWidth=Math.min(320,left?leftRoom:rightRoom)+'px';
 const hint=facetHint.getBoundingClientRect(),x=left?railLeft-hint.width-12:railRight+12;
 const top=Math.max(12,header.getBoundingClientRect().bottom+8),bottom=Math.max(top,innerHeight-hint.height-12);
 facetHint.style.left=Math.max(12,Math.min(viewport-hint.width-12,x))-canvas.left+'px';
 facetHint.style.top=Math.max(top,Math.min(bottom,anchor.top+(anchor.height-hint.height)/2))-canvas.top+'px';
 facetHint.dataset.side=left?'left':'right';
}
function queueFacetHint(){if(!facetHint.hidden&&!facetHintFrame)facetHintFrame=requestAnimationFrame(()=>{facetHintFrame=0;positionFacetHint();});}
window.addEventListener('scroll',queueFacetHint,{passive:true});window.addEventListener('resize',queueFacetHint);
function updateFacetHint(){
 const visible=button=>button&&button.getBoundingClientRect().width>0;
 if(!visible(facetHoverButton))facetHoverButton=null;if(!visible(facetFocusButton))facetFocusButton=null;
 const button=facetHoverButton||facetFocusButton;
 facetHint.hidden=!button;facetHint.textContent=button?button.querySelector('.facet-description').textContent:'';
 positionFacetHint();
}
function updateProgressiveControls(){
 const theme=disclosures.theme,material=disclosures.material;if(!theme||!material)return;
 const available=theme.pinned||material.pinned||selectedMaterial!=='all'||(!facetMobile.matches&&(!theme.group.hidden||!material.group.hidden));
 facetRails.classList.toggle('material-available',available);material.expand.tabIndex=available?0:-1;
 material.expand.setAttribute('aria-hidden',String(!available));
}
function facetValue(kind){return kind==='shape'?selectedShape:kind==='theme'?journeyTheme:selectedMaterial;}
function assignFacet(kind,value){if(kind==='shape')selectedShape=value;else if(kind==='theme')journeyTheme=value;else selectedMaterial=value;}
function facetLabel(kind,value=facetValue(kind)){return value==='all'?facets[kind].choices[0][1]:facets[kind].labels[value];}
function scopeIncludes(i){const scope=$('#journey-scope').value;return scope==='all'||(scope==='highlights'?data.events[i].highlight:data.events[i].date.startsWith(scope));}
function facetIncludes(i,kind,value=facetValue(kind)){return value==='all'||(kind==='shape'?data.events[i].shape:kind==='theme'?eventThemes[i]:eventMaterials[i])===value;}
function pathOrder(){const extra=facetLead==='material'?['theme','shape']:facetLead==='theme'?['shape','material']:['shape','theme','material'];return [...facetOrder,...extra.filter(kind=>!facetOrder.includes(kind))];}
function queueFacetLinks(){if(!facetLinkFrame)facetLinkFrame=requestAnimationFrame(drawFacetLinks);}
Object.entries(facets).forEach(([kind,facet])=>{
 facet.nav.innerHTML=facet.choices.map(([value,label],index)=>`<button class="shape-icon ${kind}-icon-button" type="button" data-${kind==='theme'?'journey-theme':kind}="${esc(value)}" aria-label="${esc(label)}" aria-pressed="false" aria-describedby="${kind}-tip-${index}"><svg viewBox="0 0 24 24" aria-hidden="true">${facet.icon(value)}</svg><span class="facet-count" aria-hidden="true"></span><span id="${kind}-tip-${index}" class="facet-description sr-only"></span></button>`).join('');
 facet.nav.addEventListener('pointerover',e=>{if(e.pointerType==='touch')return;const button=e.target.closest('button');if(button&&facet.nav.contains(button)){facetHoverButton=button;updateFacetHint();}});
 facet.nav.addEventListener('pointerleave',()=>{facetHoverButton=null;updateFacetHint();});
 facet.nav.addEventListener('focusin',e=>{facetFocusButton=e.target.closest('button');updateFacetHint();});
 facet.nav.addEventListener('focusout',()=>{facetFocusButton=null;updateFacetHint();});
 facet.nav.addEventListener('scroll',queueFacetLinks,{passive:true});
 facet.nav.addEventListener('click',e=>{
  const button=e.target.closest('button');if(!button||!facet.nav.contains(button))return;
  const disclosure=disclosures[kind];
  if(disclosure&&!disclosure.pinned){disclosure.pinned=true;disclosure.suppressed=false;updateDisclosure(kind);return;}
  selectFacet(kind,button.dataset[facet.field]);
 });
});
function updateDisclosure(kind){
 const d=disclosures[kind],child=kind==='theme'&&disclosures.material&&!disclosures.material.pinned&&(disclosures.material.pointer||disclosures.material.focus);
 const open=d.pinned||(!d.suppressed&&(d.pointer||d.focus||child)),peek=open&&!d.pinned;
 const all=d.nav.querySelector('button');
 d.group.hidden=!open;facetRails.classList.toggle(kind+'-open',open);facetRails.classList.toggle(kind+'-peek',peek);
 d.expand.setAttribute('aria-expanded',String(d.pinned));d.expand.classList.toggle('is-pinned',d.pinned);
 d.expand.classList.toggle('is-filtered',facetValue(kind)!=='all');
 const name=kind==='theme'?'themes':'materials';
 d.expand.setAttribute('aria-label',d.pinned?'Fold '+name:open?'Expand '+name:'Explore '+name);
 d.expand.title=d.pinned?'Fold '+name:open?'Expand '+name:'Explore '+name;
 d.expand.querySelector('.expand-vertical').style.display=d.pinned?'none':'';
 all.setAttribute('aria-label',peek?'Show '+kind+' choices':facetLabel(kind,'all'));
 if(peek){all.removeAttribute('aria-pressed');all.setAttribute('aria-expanded','false');all.setAttribute('aria-controls',d.nav.id);}
 else{all.setAttribute('aria-pressed',String(facetValue(kind)==='all'));all.removeAttribute('aria-expanded');all.removeAttribute('aria-controls');}
 all.querySelector('.facet-description').textContent=peek?'Click to expand '+name+'.':all.dataset.description||'';
 updateProgressiveControls();updateFacetHint();queueFacetLinks();
}
function foldDisclosure(kind){
 const d=disclosures[kind];if(d.group.contains(document.activeElement))d.expand.focus();
 d.pinned=false;d.suppressed=true;updateDisclosure(kind);
}
function previewDisclosure(kind){
 Object.entries(disclosures).forEach(([other,d])=>{if(other!==kind&&!(kind==='material'&&other==='theme')){d.pointer=false;updateDisclosure(other);}});
 const d=disclosures[kind];d.pointer=true;d.suppressed=false;updateDisclosure(kind);
}
['theme','material'].forEach(kind=>{
 const d=disclosures[kind]={group:$('#'+kind+'-facet'),nav:facets[kind].nav,expand:$('#'+kind+'-expand'),pinned:false,pointer:false,focus:false,suppressed:false};
 d.expand.addEventListener('pointerenter',()=>{if(facetHover.matches)previewDisclosure(kind);});
 d.group.addEventListener('pointerenter',()=>{if(facetHover.matches&&!d.group.hidden)previewDisclosure(kind);});
 facetRails.addEventListener('pointerleave',()=>{d.pointer=false;updateDisclosure(kind);});
 facetRails.addEventListener('focusin',e=>{if(e.target===d.expand||d.group.contains(e.target)){d.focus=true;d.suppressed=false;updateDisclosure(kind);}});
 facetRails.addEventListener('focusout',()=>requestAnimationFrame(()=>{d.focus=document.activeElement===d.expand||d.group.contains(document.activeElement);updateDisclosure(kind);}));
 d.expand.addEventListener('click',()=>{if(d.pinned)foldDisclosure(kind);else{d.pinned=true;d.suppressed=false;updateDisclosure(kind);}});
 $('#'+kind+'-collapse').addEventListener('click',()=>cancelFacet(kind));
});
facetRails.addEventListener('keydown',e=>{if(e.key==='Escape'){facetHoverButton=facetFocusButton=null;updateFacetHint();const kind=['theme','material'].find(key=>disclosures[key].group.contains(e.target)||disclosures[key].expand===e.target);if(kind){e.preventDefault();foldDisclosure(kind);}}});
function drawFacetLinks(){
 facetLinkFrame=0;const group=facetLinks.querySelector('g'),defs=facetLinks.querySelector('defs');
 group.innerHTML='';defs.innerHTML='';if(!facetActivated)return;
 const visible=['shape','theme','material'].filter(kind=>kind==='shape'||disclosures[kind].pinned),order=pathOrder();
 const bounds=facetRails.getBoundingClientRect(),mobile=facetMobile.matches;
 facetLinks.setAttribute('viewBox',`0 0 ${bounds.width} ${bounds.height}`);
 let clips='',paths='';
 for(let n=0;n<visible.length-1;n++){
  const a=visible[n],b=visible[n+1],leftNav=facets[a].nav.getBoundingClientRect(),rightNav=facets[b].nav.getBoundingClientRect();
  const sourceKind=order.indexOf(a)<order.indexOf(b)?a:b,targetKind=sourceKind===a?b:a;
  const sourceNav=facets[sourceKind].nav.getBoundingClientRect(),targetNav=facets[targetKind].nav.getBoundingClientRect();
  const origin=facets[sourceKind].nav.querySelector('[aria-pressed="true"]'),source=origin.getBoundingClientRect(),sourceGlyph=origin.querySelector('svg').getBoundingClientRect(),sourceX=sourceGlyph.left+sourceGlyph.width/2;
  if(mobile&&(sourceX<sourceNav.left||sourceX>sourceNav.right))continue;
  const top=mobile?leftNav.bottom-bounds.top:0,bottom=mobile?rightNav.top-bounds.top:bounds.height;
  const clipX=mobile?0:leftNav.right-bounds.left,clipWidth=mobile?bounds.width:Math.max(0,rightNav.left-leftNav.right);
  clips+=`<clipPath id="facet-gap-${n}"><rect x="${clipX}" y="${top}" width="${clipWidth}" height="${Math.max(0,bottom-top)}"/></clipPath>`;
  const forward=sourceKind===a;
  const links=[...facets[targetKind].nav.querySelectorAll('button')].filter(button=>button.dataset[facets[targetKind].field]!=='all'&&+button.dataset.matchCount>0).map(button=>{
   const target=button.getBoundingClientRect(),glyph=button.querySelector('svg').getBoundingClientRect(),targetX=glyph.left+glyph.width/2;
   if(mobile&&(targetX<targetNav.left||targetX>targetNav.right))return '';
   const sx=mobile?sourceX-bounds.left:(forward?source.right:source.left)-bounds.left,sy=mobile?(forward?top:bottom):sourceGlyph.top+sourceGlyph.height/2-bounds.top;
   const tx=mobile?targetX-bounds.left:(forward?target.left:target.right)-bounds.left,ty=mobile?(forward?bottom:top):glyph.top+glyph.height/2-bounds.top;
   const bend=mobile?(ty-sy)*.55:(tx-sx)*.5,value=button.dataset[facets[targetKind].field];
   const path=mobile?`M${sx},${sy} C${sx},${sy+bend} ${tx},${ty-bend} ${tx},${ty}`:`M${sx},${sy} C${sx+bend},${sy} ${tx-bend},${ty} ${tx},${ty}`;
   return `<path d="${path}" data-link-source="${sourceKind}" data-link-target="${targetKind}" data-link-value="${esc(value)}" class="${facetValue(targetKind)===value?'is-selected':''}"/>`;
  }).join('');
  paths+=`<g clip-path="url(#facet-gap-${n})">${links}</g>`;
 }
 defs.innerHTML=clips;group.innerHTML=paths;
}
new ResizeObserver(()=>{queueFacetLinks();queueFacetHint();}).observe(facetRails);
facetMobile.addEventListener('change',()=>{updateProgressiveControls();queueFacetLinks();queueFacetHint();});
function updateFacetButtons(){
 const ids=allIndices.filter(scopeIncludes),order=pathOrder();
 Object.entries(facets).forEach(([kind,facet])=>{
  const rank=order.indexOf(kind),previous=order.slice(0,rank),prefix=ids.filter(i=>previous.every(key=>facetIncludes(i,key)));
  [...facet.nav.querySelectorAll('button')].forEach(button=>{
   const value=button.dataset[facet.field],count=prefix.filter(i=>facetIncludes(i,kind,value)).length,on=value===facetValue(kind),related=facetActivated&&rank>0&&value!=='all'&&count>0;
   button.setAttribute('aria-pressed',String(on));button.classList.toggle('is-empty',count===0);button.classList.toggle('is-related',related);button.dataset.matchCount=count;
   button.querySelector('.facet-count').textContent=facetActivated&&(on||related)?'['+count+']':'';
   const before=previous.filter(key=>facetValue(key)!=='all');
   button.dataset.description=facetLabel(kind,value)+' · '+count+(count===1?' tag':' tags')+(before.length?' with '+before.map(key=>facetLabel(key)).join(' + '):facetActivated?' before other filters':'');
   button.querySelector('.facet-description').textContent=button.dataset.description;
  });
 });
 let running=ids;
 $('#journey-filter-path').innerHTML=facetOrder.map((kind,n)=>{
  running=running.filter(i=>facetIncludes(i,kind));
  return `${n?'<span class="facet-path-arrow" aria-hidden="true">→</span>':''}<span class="facet-crumb"><span>${esc(facetLabel(kind))} [${running.length}]</span><button type="button" data-clear-facet="${kind}" aria-label="Clear ${esc(kind)} filter" title="Clear ${esc(kind)} filter">×</button></span>`;
 }).join('');
 $('.journey-filter-summary').classList.toggle('is-active',facetActivated);$('#journey-clear-facets').disabled=!facetActivated;
 ['theme','material'].forEach(updateDisclosure);
}
function changeScope(){clearHover();updateFacetButtons();window.owney.setVisibleIndices(allIndices.filter(i=>scopeIncludes(i)&&['shape','theme','material'].every(kind=>facetIncludes(i,kind))));}
function syncFacetOrder(){facetOrder=facetOrder.filter(kind=>facetValue(kind)!=='all');facetLead=facetOrder[0]||null;facetActivated=!!facetOrder.length;}
function selectFacet(kind,value){
 const next=value==='all'||value===facetValue(kind)?'all':value;assignFacet(kind,next);
 if(next!=='all'&&!facetOrder.includes(kind))facetOrder.push(kind);syncFacetOrder();
 if(disclosures[kind]&&next!=='all'){disclosures[kind].pinned=true;disclosures[kind].suppressed=false;}
 changeScope();window.owneyRange.showAll();
}
function cancelFacet(kind){
 if(document.activeElement?.dataset.clearFacet===kind)(disclosures[kind]?.expand||facets[kind].nav.querySelector('button')).focus({preventScroll:true});
 assignFacet(kind,'all');syncFacetOrder();if(disclosures[kind])foldDisclosure(kind);
 changeScope();window.owneyRange.showAll();
}
$('#journey-filter-path').addEventListener('click',e=>{const button=e.target.closest('[data-clear-facet]');if(button)cancelFacet(button.dataset.clearFacet);});
function clearFacets(){
 selectedShape=journeyTheme=selectedMaterial='all';facetOrder=[];syncFacetOrder();['theme','material'].forEach(foldDisclosure);changeScope();window.owneyRange.showAll();
}
$('#journey-clear-facets').addEventListener('click',clearFacets);$('#journey-reset-facets').addEventListener('click',clearFacets);
$('#journey-scope').addEventListener('change',changeScope);
$('#journey-reset-scope').addEventListener('click',()=>{$('#journey-scope').value='all';changeScope();window.owneyRange.showAll();});
updateFacetButtons();
function browsingIndices(){return window.owneyRange.members.length?window.owneyRange.members:window.owney.visibleIndices;}
function stepTag(delta){const indices=browsingIndices();if(!indices.length)return;const pos=indices.indexOf(window.owney.selected);window.owney.selectEvent(indices[pos<0?(delta<0?indices.length-1:0):Math.max(0,Math.min(indices.length-1,pos+delta))]);}
$('#previous-tag').addEventListener('click',()=>stepTag(-1));$('#next-tag').addEventListener('click',()=>stepTag(1));
function updateStepper(){
 const indices=browsingIndices(),pos=indices.indexOf(window.owney.selected);
 $('#tag-position').textContent=!indices.length?'0 tags':pos<0?'Preview':(pos+1)+' / '+indices.length;
 $('#previous-tag').disabled=!indices.length||pos===0;$('#next-tag').disabled=!indices.length||pos===indices.length-1;
}
window.addEventListener('owney:range',updateStepper);
const stage=$('#cube-stage'),world=$('#cube-world');
world.innerHTML=`<div class="cube-boundary"></div><div class="cube-boundary cube-front"></div><div class="volume-face volume-top"></div><div class="volume-face volume-bottom"></div><div class="volume-face volume-side"></div>`+data.events.map((e,i)=>`<button class="time-layer" style="--tag-scale:${e.tagScale||1}" data-slice="${i}" aria-label="Select ${esc(e.place)}, ${esc(e.label)}, tag ${esc(e.tag)}"><img src="assets/token-cutouts/tag-${e.tag}.png" alt="Museum tag associated with ${esc(e.place)}, ${esc(e.label)}" draggable="false" decoding="async"><span class="slab-side slab-left" aria-hidden="true"></span><span class="slab-side slab-right" aria-hidden="true"></span><span class="layer-edge"><b>${String(i+1).padStart(2,'0')}</b> ${esc(e.place.split(',')[0])}<small>${esc(e.label)}</small></span></button>`).join('');
const layers=$$('.time-layer'),layerImages=layers.map(layer=>layer.querySelector('img'));
let geometryIds=null,geometryCalendar=null,geometryDomain,drawFrame=0,hoverTimer=0,hoverCandidate=null,liftHoverUntil=0;
function style(element,key,value){if(element.style.getPropertyValue(key)!==String(value))element.style.setProperty(key,value);}
function syncGeometry(){
 const visible=window.owney.visibleIndices,calendar=$('#spacing').value==='calendar';
 if(geometryIds===visible&&geometryCalendar===calendar)return;
 geometryIds=visible;geometryCalendar=calendar;
 geometryDomain=window.OWNEY_TIMELINE_MODEL.makeDomain(data.events,visible);
 const positions=new Map(visible.map((id,i)=>[id,i]));
 layers.forEach((layer,i)=>{
  const pos=positions.get(i);layer.hidden=pos===undefined;if(layer.hidden)return;
  const t=calendar?geometryDomain.positions[i]:visible.length>1?pos/(visible.length-1):.5;
  style(layer,'--layer-t',t);
 });
 updateTagEmphasis();
}
function updateTagEmphasis(){
 const highlighted=new Set(window.owneyRange.members),idx=window.owney.selected,many=window.owney.visibleIndices.length>30;
 layers.forEach((layer,i)=>{
  if(layer.hidden)return;
  const active=i===idx,inRange=highlighted.has(i);
  layer.classList.toggle('selected',active);layer.classList.toggle('in-range',inRange);
  layer.classList.toggle('is-lifted',active&&i===liftedIndex);
  layer.setAttribute('aria-pressed',String(active));
  style(layer,'--tag-opacity',active?1:inRange?(many?.20:.25):(many?.035:.06));
  style(layer,'--frame-opacity',active?1:inRange?.30:.05);
 });
}
// Fit eight volume corners. Per-frame work changes the parent, not 67 layers.
function fitCamera(size,depth,width,height,perspective){
 const xAngle=rx*Math.PI/180,yAngle=ry*Math.PI/180,points=[];
 for(const x of [-size/2,size/2])for(const y of [-size/2,size/2])for(const z of [-depth/2,depth/2]){
  const x1=x*Math.cos(yAngle)+z*Math.sin(yAngle),z1=-x*Math.sin(yAngle)+z*Math.cos(yAngle);
  points.push([x1,y*Math.cos(xAngle)-z1*Math.sin(xAngle),y*Math.sin(xAngle)+z1*Math.cos(xAngle)]);
 }
 let scale=1,offsetX=0,offsetY=0;
 for(let pass=0;pass<6;pass++){
  const projected=points.map(([x,y,z])=>[(scale*x+offsetX)/(1-scale*z/perspective),(scale*y+offsetY)/(1-scale*z/perspective)]);
  const left=Math.min(...projected.map(p=>p[0])),right=Math.max(...projected.map(p=>p[0]));
  const top=Math.min(...projected.map(p=>p[1])),bottom=Math.max(...projected.map(p=>p[1]));
  const ratio=Math.min(1,(width-24)/(right-left),(height-32)/(bottom-top));
  if(ratio<1){scale*=ratio*.995;offsetX=0;offsetY=0;}else{offsetX-=(left+right)/2;offsetY-=(top+bottom)/2;}
 }
 return {scale,offsetX,offsetY};
}
function paintCube(geometry){
 const {size,total,width,height,blend}=geometry;
 const perspective=blend>.99999?Infinity:1600/(1-blend);
 const fit=fitCamera(size,total,width,height,perspective);
 world.style.transform='translate3d('+fit.offsetX+'px,'+fit.offsetY+'px,0) scale('+fit.scale+') rotateX('+rx+'deg) rotateY('+ry+'deg) translateZ('+(total/2)+'px)';
}
function drawCube(){
 drawFrame=0;
 // A swipe only changes the parent transform. No inherited CSS variables or layout reads.
 if(dragStart?.geometry){paintCube(dragStart.geometry);return;}
 syncGeometry();
 const distance=Math.hypot(rx,(ry+90)*.65),progress=Math.max(0,Math.min(1,1-distance/31));
 const targetBlend=progress*progress*(3-2*progress),profile=distance<.05;
 syncPerspectiveControls(cameraTarget||(profile?'profile':'corner'));
 const width=stage.clientWidth,height=stage.clientHeight;
 if(width<=0)return;
 const wide=matchMedia('(min-width:1100px) and (min-aspect-ratio:3/2)').matches;
 const cubeSize=Math.min(wide?440:380,Math.max(128,(height-(wide?24:48))*(wide?1:.9)),width*.56),profileSize=Math.min(340,Math.max(128,height-32));
 const cubeDepth=Math.min(spread?880:700,width*(spread?.84:.72));
 let size=cubeSize+(profileSize-cubeSize)*targetBlend,total=cubeDepth+(width*.82-cubeDepth)*targetBlend,blend=targetBlend;
 if(cameraLayoutFrom&&cameraLayoutProgress<1){
  const t=cameraLayoutProgress;
  size=cameraLayoutFrom.size+(size-cameraLayoutFrom.size)*t;
  total=cameraLayoutFrom.total+(total-cameraLayoutFrom.total)*t;
  blend=cameraLayoutFrom.blend+(blend-cameraLayoutFrom.blend)*t;
 }
 style(world,'--plane',size+'px');style(world,'--depth',total+'px');
 style(stage,'perspective',blend>.99999?'none':1600/(1-blend)+'px');
 style(stage,'--profile-blend',blend);
 world.style.top='50%';stage.classList.toggle('time-profile',profile);world.classList.toggle('spread',spread);
 cubeGeometry={size,total,width,height,blend};paintCube(cubeGeometry);
}
function queueCube(){if(!drawFrame)drawFrame=requestAnimationFrame(drawCube);}
// Reuse identical backdrop assets and debounce rapid hover selections.
const atmosphereLayers=$$('.atmosphere-layer');
let atmosphereIndex=0,atmosphereRevision=0,atmosphereKey='assets/san-antonio.jpg|false',atmosphereTimer=0;
function updateAtmosphere(event){
 const key=event.image+'|'+(event.slug==='st-louis');
 if(key===atmosphereKey)return;
 atmosphereKey=key;clearTimeout(atmosphereTimer);
 const revision=++atmosphereRevision;
 atmosphereTimer=setTimeout(()=>{
  const next=1-atmosphereIndex,layer=atmosphereLayers[next],image=layer.querySelector('img');
  layer.classList.toggle('st-louis-crop',event.slug==='st-louis');image.src=event.image;
  image.decode().then(()=>{
   if(revision!==atmosphereRevision)return;
   atmosphereLayers.forEach((element,index)=>element.classList.toggle('is-visible',index===next));atmosphereIndex=next;
  }).catch(()=>{if(revision===atmosphereRevision)atmosphereKey='';});
 },120);
}
const objectsById=new Map(data.items.map(item=>[item.id,item]));
function renderScene(){
 const i=window.owney.selected,e=data.events[i];
 const empty=!e||!window.owney.visibleIndices.length;
 world.hidden=empty;$('#cube-empty').hidden=!empty;$('.stage-instruction').hidden=empty;
 if(empty){
  $('#scene-title').innerHTML='<h3 class="scene-place">No matching tags.</h3>';
  $('#scene-panel').innerHTML='<p class="shape-empty-note">Try another shape, theme, or material, clear the filters, or explore this combination across all dates.</p>';
  syncGeometry();updateStepper();return;
 }
 const object=objectsById.get(e.tag);
 if(!window.owney.visibleIndices.includes(i)){$('#journey-scope').value='all';selectedShape=journeyTheme=selectedMaterial='all';facetOrder=[];facetLead=null;facetActivated=false;changeScope();return;}
 const evidenceOpen=$('#scene-panel .evidence')?.open;
 $('#scene-title').innerHTML=`<h3 class="scene-place">${esc(e.place)}</h3><p class="scene-date">${esc(e.label)}</p>${e.dateCaution?'<p class="date-caution">Recorded date · conflicting evidence</p>':''}`;
 $('#scene-panel').innerHTML=`<div class="scene-copy"><h4 class="sr-only">${esc(e.title)}</h4><p>${esc(e.story)}</p><button class="text-link museum-record" data-object="${e.tag}" aria-label="View original museum record: ${esc(object.title)}">View museum record · ${esc(e.tag)}</button><details class="evidence" ${evidenceOpen?'open':''}><summary>What the record supports</summary><p>${esc(e.fact)}</p><p><strong>Shape:</strong> ${esc(shapeLabels[e.shape])}. ${esc(e.shapeEvidence)} <span class="shape-note">Visual grouping; not a museum catalog field.</span></p><p><strong>Recorded material:</strong> ${esc(object.medium||'Not recorded')}. Journey group: ${esc(materialLabels[eventMaterials[i]])}.</p><p><strong>${e.point?'Map evidence:':'Not mapped:'}</strong> ${esc(e.mapLocation.reason)}</p><p class="imagined"><strong>Imagined in the background:</strong> ${esc(e.imagined)}</p>${(e.relatedTags||[]).map(id=>`<button class="text-link related-object" data-object="${esc(id)}">Also from this encounter: ${esc(objectsById.get(id).title.replace(/ Owney [Tt]ag/,''))}</button>`).join('')}</details></div>`;
 updateAtmosphere(e);syncGeometry();updateTagEmphasis();updateStepper();
}
window.addEventListener('owney:selection',event=>{if(event.detail?.source!=='cube')liftedIndex=null;renderScene();});
window.addEventListener('owney:scope',()=>{renderScene();queueCube();});
window.addEventListener('owney:range',updateTagEmphasis);
function clearHover(){clearTimeout(hoverTimer);hoverTimer=0;hoverCandidate=null;}
function hoverBlocked(){return navigationLock||cameraFrame||dragStart||moved||performance.now()<liftHoverUntil||window.owneyRange.editing;}
function previewHover(e){
 if(e.pointerType==='touch'||hoverBlocked()){clearHover();return;}
 const layer=e.target.closest('[data-slice]');
 if(!layer||layer.hidden){clearHover();return;}
 if(layer===hoverCandidate&&(hoverTimer||+layer.dataset.slice===window.owney.selected))return;
 clearHover();hoverCandidate=layer;
 const index=+layer.dataset.slice;if(index===window.owney.selected)return;
 hoverTimer=setTimeout(()=>{
  hoverTimer=0;
  if(hoverCandidate!==layer||hoverBlocked()||layer.hidden){hoverCandidate=null;return;}
  window.owney.selectEvent(index,false,'hover');
 },75);
}
world.addEventListener('click',e=>{clearHover();if(moved||cubeGesture?.suppressClick)return;const b=e.target.closest('[data-slice]');if(b){const index=+b.dataset.slice;liftedIndex=liftedIndex===index?null:index;liftHoverUntil=performance.now()+350;window.owney.selectEvent(index,true,'cube');}});
world.addEventListener('pointerover',previewHover);
world.addEventListener('pointermove',previewHover);
world.addEventListener('pointerout',e=>{if(e.target.closest('[data-slice]')!==e.relatedTarget?.closest?.('[data-slice]'))clearHover();});
stage.addEventListener('pointerleave',clearHover);
world.addEventListener('focusin',e=>{const layer=e.target.closest('[data-slice]');if(layer&&!dragStart&&layer.matches(':focus-visible'))window.owney.selectEvent(+layer.dataset.slice);});
$('#spacing').addEventListener('change',queueCube);
function rotationMode(enabled){if(!enabled)cubeGesture?.cancel();touchRotate=enabled;stage.classList.toggle('rotation-enabled',enabled);const button=$('#rotate-cube');button.setAttribute('aria-pressed',String(enabled));button.setAttribute('aria-label',enabled?'Finish rotating cube':'Rotate cube');button.querySelector('.rotate-label').textContent=enabled?'Done':'Rotate';updateRotationHint();}
function updateRotationHint(){
 $('.mouse-hint').textContent=perspectiveMode==='profile'?'Drag to rotate · Browse tags beside the story':'Hover to preview · Drag to rotate';
 $('.touch-hint').textContent=touchRotate?'Swipe to rotate · Tap Done to scroll':perspectiveMode==='profile'?'Browse tags beside the story':'Tap a tag to explore';
}
function syncPerspectiveControls(mode){
 if(perspectiveMode===mode)return;perspectiveMode=mode;
 $('#spacing').value=mode==='profile'?'calendar':'encounters';syncGeometry();
 ['corner','profile'].forEach(name=>{const b=$('#'+name+'-view');b.classList.toggle('chosen',name===mode);b.setAttribute('aria-pressed',String(name===mode));});updateRotationHint();
}
function stopCamera(){if(cameraFrame)cancelAnimationFrame(cameraFrame);cameraFrame=0;cameraTarget=null;cameraLayoutFrom=null;cameraLayoutProgress=1;stage.classList.remove('camera-moving');}
function animateCamera(x,y,mode,duration=760,fromLayout=null){
 stopCamera();clearHover();cameraLayoutFrom=fromLayout;cameraLayoutProgress=fromLayout?0:1;stage.classList.add('camera-moving');
 const fromX=rx,fromY=ry,start=performance.now();cameraTarget=mode;
 if(reduced){rx=x;ry=y;cameraTarget=null;cameraLayoutFrom=null;cameraLayoutProgress=1;stage.classList.remove('camera-moving');drawCube();return;}
 function frame(now){
  const t=Math.min(1,(now-start)/duration),ease=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  rx=fromX+(x-fromX)*ease;ry=fromY+(y-fromY)*ease;cameraLayoutProgress=ease;
  if(t===1){rx=x;ry=y;cameraFrame=0;cameraTarget=null;cameraLayoutFrom=null;stage.classList.remove('camera-moving');}drawCube();if(t<1)cameraFrame=requestAnimationFrame(frame);
 }
 cameraFrame=requestAnimationFrame(frame);
}
function setPerspective(mode){rotationMode(false);$('#spacing').value=mode==='profile'?'calendar':'encounters';animateCamera(mode==='profile'?0:-18,mode==='profile'?-90:-52,mode);}
$('#corner-view').addEventListener('click',()=>setPerspective('corner'));$('#profile-view').addEventListener('click',()=>setPerspective('profile'));
$('#rotate-cube').addEventListener('click',()=>rotationMode(!touchRotate));
cubeGesture=window.OWNEY_CUBE_GESTURE.mount(stage,{
 touchEnabled:()=>touchRotate,
 angles:()=>({rx,ry}),
 start(){stopCamera();clearHover();if(!cubeGeometry)drawCube();dragStart={geometry:{...cubeGeometry}};moved=false;},
 change(angles){rx=angles.rx;ry=angles.ry;moved=true;stage.classList.add('dragging');queueCube();},
 end(result){
  const fromLayout=dragStart?.geometry;dragStart=null;stage.classList.remove('dragging');
  const shouldAlign=!result.cancelled&&result.moved&&Math.abs(ry+90)<12&&Math.abs(rx)<24;
  if(shouldAlign)animateCamera(0,-90,'profile',240,fromLayout);
  else if(result.moved&&!result.cancelled)animateCamera(rx,ry,'corner',180,fromLayout);
  else queueCube();
  setTimeout(()=>moved=false,0);
 }
});
window.addEventListener('blur',clearHover);
stage.addEventListener('keydown',e=>{if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();const indices=browsingIndices();if(!indices.length)return;if(e.key==='Home'||e.key==='End')window.owney.selectEvent(e.key==='Home'?indices[0]:indices.at(-1));else stepTag(e.key==='ArrowRight'?1:-1);}});
new ResizeObserver(queueCube).observe(stage);window.addEventListener('resize',()=>{cubeGesture.cancel();queueCube();});renderScene();queueCube();

function openAbout(){$('#about-dialog').showModal();}
$('#journey-about').addEventListener('click',openAbout);
$('#about-button').addEventListener('click',openAbout);$('#close-about').addEventListener('click',()=>$('#about-dialog').close());
// Objects associated with a scene provide a direct route into the same selection.
const originalOpen=window.owney.openObject;
const observer=new MutationObserver(()=>{const title=$('#object-title');if(!title||$('#object-to-scene'))return;const t=data.items.find(t=>t.title===title.textContent&&$('#object-content').textContent.includes('0.052985.'+t.id));if(t?.scene){const b=document.createElement('button');b.id='object-to-scene';b.className='quiet-button';b.textContent='Find this in the journey';b.addEventListener('click',()=>{$('#object-dialog').close();window.owney.selectEvent(data.events.findIndex(e=>e.slug===t.scene));setView('cube',{keepSelection:true})});$('#object-content .object-layout>div:last-child').append(b)}});observer.observe($('#object-content'),{childList:true,subtree:true});
// Optional WebMCP uses the same selection and controls as the visible page.
const context=document.modelContext;if(context?.registerTool){const register=t=>{try{Promise.resolve(context.registerTool(t)).catch(()=>{})}catch{}};register({name:'read_owney_selection',title:'Read the current Owney encounter',description:'Read the active visualization view and selected encounter, including the distinction between evidence and illustration.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:true},execute:()=>({view:currentView,mode:'combined',encounter:data.events[window.owney.selected]??null})});register({name:'navigate_owney_encounter',title:'Explore an Owney encounter',description:'Select a documented Owney encounter by slug. The map, time cube, token, and story update together. Both view names open the combined journey. Changes only the visible selection.',inputSchema:{type:'object',properties:{slug:{type:'string',enum:data.events.map(e=>e.slug)},view:{type:'string',enum:['journey','cube']}},required:['slug','view'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:true},execute:input=>{if(!input||!['journey','cube'].includes(input.view))throw Error('Choose journey or cube');const i=data.events.findIndex(e=>e.slug===input.slug);if(i<0)throw Error('Unknown encounter');window.owney.selectEvent(i);setView(input.view,{encounter:i,behavior:'auto'});return {view:currentView,mode:'combined',slug:data.events[i].slug,date:data.events[i].label}}});}
// Collection follows the same dated membership and focused object as the Journey.
// Coalesce brush/scope/selection notifications, and reuse card DOM when only focus changes.
function queueCollectionLink({activate=false,focus=false,reset=false}={}){
 if(activate)collectionLinked=true;
 collectionPendingFocus=collectionPendingFocus||focus;
 collectionPendingReset=collectionPendingReset||reset;
 if(!collectionFrame)collectionFrame=requestAnimationFrame(flushCollectionLink);
}
function flushCollectionLink(){
 collectionFrame=0;
 const focus=collectionPendingFocus,reset=collectionPendingReset;
 collectionPendingFocus=collectionPendingReset=false;
 collectionFocused=data.events[window.owney.selected]?.tag||null;
 if(collectionLinked){
  collectionJourneyIds=new Set(window.owneyRange.members.map(i=>data.events[i].tag));
  theme=journeyTheme;$('#shape-filter').value=selectedShape==='all'?'':selectedShape;
  $('#material-filter').value=selectedMaterial==='all'?'':'group:'+selectedMaterial;
  if(reset)['collection-search','place-filter','date-filter'].forEach(id=>$('#'+id).value='');
  const parts=[];
  if(selectedShape!=='all')parts.push(shapeLabels[selectedShape]);
  if(journeyTheme!=='all')parts.push(journeyTheme);
  if(selectedMaterial!=='all')parts.push(materialLabels[selectedMaterial]);
  const scope=$('#journey-scope').value;if(scope==='highlights')parts.push('Story highlights');else if(scope&&scope!=='all')parts.push(scope);
  parts.push($('#range-dates').textContent);
  $('#collection-journey-context').textContent=parts.filter(Boolean).join(' · ');
 }
 renderCollection(reset,focus);
}
function changeCollectionFacet(kind,value){
 collectionFromControls=true;
 try{
  assignFacet(kind,value);
  if(value!=='all'&&!facetOrder.includes(kind))facetOrder.push(kind);
  syncFacetOrder();
  if(disclosures[kind]){disclosures[kind].pinned=value!=='all';disclosures[kind].suppressed=false;}
  changeScope();window.owneyRange.showAll();
 }finally{collectionFromControls=false;}
}
window.addEventListener('owney:scope',()=>queueCollectionLink({activate:true,focus:true,reset:!collectionFromControls}));
window.addEventListener('owney:range',()=>queueCollectionLink({activate:true,focus:true,reset:!collectionFromControls}));
window.addEventListener('owney:selection',event=>queueCollectionLink({activate:event.detail?.source!=='hover',focus:true,reset:event.detail?.source!=='hover'&&!collectionFromControls}));
window.owneyExperience={setView,get mode(){return 'combined'},get view(){return currentView},get navigating(){return navigationLock},filterCollection:(category,query='')=>{if(category!=='all'&&!data.categories[category])throw Error('Unknown category');resetCollection();theme=category;$('#collection-search').value=query;return renderCollection()}};
if(chapters.includes(initialChapter)||initialChapter==='cube')requestAnimationFrame(()=>setView(initialChapter,{behavior:'auto'}));else markView('intro');
})();
