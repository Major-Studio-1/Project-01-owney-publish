(function prepare(){
 const fs=require('node:fs'),path=require('node:path');const read=n=>JSON.parse(fs.readFileSync(path.join(__dirname,n),'utf8'));
 const tags=read('catalog-source.json'),highlights=read('story-sequence.json'),assignments=read('category-overrides.json');
 const evidence=read('dated-tag-evidence.json'),cutouts=read('token-cutout-processing.json'),mapEvidence=read('map-location-evidence.json'),shapeEvidence=read('tag-shape-evidence.json');
 const shapes={circle:'Circle',oval:'Oval',rectangle:'Rectangle',shield:'Shield',triangle:'Triangle',polygon:'Other polygons',irregular:'Irregular',unclassified:'Unclassified'};
 const events=tags.filter(t=>t.datePrecision==='Exact day'||evidence.descriptionDates[t.id.replace('npm_0.052985.','')]).map(t=>{
  const tag=t.id.replace('npm_0.052985.',''),highlight=highlights.find(e=>e.tag===tag),entry=evidence.records[tag];
  const date=evidence.descriptionDates[tag]||new Date(t.date+' UTC').toISOString().slice(0,10);
  if(!highlight&&!entry)throw Error('Missing dated-tag evidence: '+tag);
  const label=new Date(date+'T12:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
  const coords=entry&&evidence.places[entry.place],mask=cutouts.find(c=>c.id===tag);
  if(!mask)throw Error('Missing reviewed cutout: '+tag);
  const bounds=mask.objectBounds,tagScale=.88*mask.canvas[0]/Math.max(bounds[2]-bounds[0]+1,bounds[3]-bounds[1]+1);
  return {...(highlight||{slug:'tag-'+tag,tag,place:entry.place,lon:coords?.[0]??null,lat:coords?.[1]??null,title:t.title.replace(/ Owney tag/i,''),story:entry.story,kind:coords?'Associated city':'Location unresolved',image:'assets/san-antonio.jpg',tagImage:'assets/tag-'+tag+'.jpg',imagined:'This shared railway atmosphere is an illustration, not a reconstruction of this place, date, or exchange.'}),date,label,highlight:!!highlight,tagScale,dateCaution:!!entry?.dateCaution,note:entry?.note||'',fact:highlight?.fact||('Date source: '+(evidence.descriptionDates[tag]?'the museum description.':'the museum catalog date field ('+t.date+').')+' '+(entry.note||'The named city is an association in the museum record; a marker does not prove the exact place of exchange.'))};
 }).sort((a,b)=>a.date.localeCompare(b.date)||a.tag.localeCompare(b.tag,'en',{numeric:true}));
 const categories={'Rail & post':{color:'#88b9d0',symbol:'square'},'Coins & medals':{color:'#e1b264',symbol:'circle'},'Hotels & keys':{color:'#d7ab9b',symbol:'key'},'Commerce':{color:'#a8c0a0',symbol:'diamond'},'Civic & events':{color:'#b8afd2',symbol:'hex'},'Personal & licenses':{color:'#a1bec2',symbol:'triangle'},'Other connections':{color:'#b6b2a3',symbol:'circle'}};
 const items=tags.map(t=>{const id=t.id.replace('npm_0.052985.',''),category=assignments[id]||'Other connections',c=categories[category],scene=events.find(e=>e.tag===id)||events.find(e=>e.relatedTags?.includes(id));return{id,recordId:t.id,title:t.title,category,color:c.color,symbol:c.symbol,date:t.date,datePrecision:t.datePrecision,places:t.places,medium:t.medium,dimensions:t.dimensions,description:t.descriptions.join('\n\n'),image:'assets/tag-'+id+'.jpg',url:t.source,media:t.images,scene:scene?.slug||null};});
 const gallery=read('gallery-image-processing.json');
 if(gallery.records.length!==items.length||new Set(gallery.records.map(r=>r.id)).size!==items.length)throw Error('Incomplete transparent gallery image audit');
 items.forEach(item=>{
  const image=gallery.records.find(r=>r.id===item.id);
  if(!image?.transparent||!image.lossless||!fs.existsSync(path.join(__dirname,'public',image.image)))throw Error('Missing transparent gallery photograph: '+item.id);
  item.galleryImage=image.image;item.imageDetail=!!image.detail;
  const outline=shapeEvidence.records[item.id];
  if(!outline||!shapes[outline.shape]||outline.source!==item.url||!outline.evidence)throw Error('Missing or mismatched collection shape audit: '+item.id);
  item.shape=outline.shape;item.shapeEvidence=outline.evidence;
 });
 const topology=read('countries-110m.json'),project=([lon,lat])=>[(lon+129)/64*920,(56-lat)/32*540];
 const arc=i=>{let x=0,y=0;const p=topology.arcs[i<0?~i:i].map(d=>{x+=d[0];y+=d[1];return project([x*topology.transform.scale[0]+topology.transform.translate[0],y*topology.transform.scale[1]+topology.transform.translate[1]])});return i<0?p.reverse():p;};
 const ring=indices=>indices.flatMap((n,i)=>{const p=arc(n);return i?p.slice(1):p;});
 const polygon=rs=>rs.map(r=>ring(r).map(([x,y],i)=>(i?'L':'M')+x.toFixed(1)+','+y.toFixed(1)).join('')+'Z').join('');
 const countries=topology.objects.countries.geometries.filter(g=>['124','840','484'].includes(g.id)).map(g=>({id:g.id,name:g.properties.name,path:g.type==='Polygon'?polygon(g.arcs):g.arcs.map(polygon).join('')}));
 events.forEach(e=>{
  const entry=mapEvidence.records[e.tag],item=items.find(t=>t.id===e.tag);
  const outline=shapeEvidence.records[e.tag];
  if(!outline||!shapes[outline.shape]||outline.source!==item.url||!outline.evidence)throw Error('Missing or mismatched shape audit: '+e.tag);
  e.shape=outline.shape;e.shapeEvidence=outline.evidence;
  if(!entry||entry.place!==e.place||entry.source!==item.url)throw Error('Missing or mismatched map-location audit: '+e.tag);
  if(!entry.evidence.split(' … ').every(part=>item.description.includes(part)))throw Error('Map-location evidence differs from museum snapshot: '+e.tag);
  const confirmed=entry.status==='confirmed'&&!e.dateCaution;
  if(confirmed&&(!Number.isFinite(e.lon)||!Number.isFinite(e.lat)))throw Error('Missing coordinates for confirmed location: '+e.tag);
  e.mapLocation=entry;
  e.point=confirmed?project([e.lon,e.lat]):null;
  if(!confirmed){e.lon=null;e.lat=null;}
 });
 const data={events,items,categories,shapes,countries,snapshot:'22 September 2026',totalTags:items.length,totalImages:items.reduce((n,t)=>n+t.media.length,0)};
 fs.writeFileSync(path.join(__dirname,'public/data.js'),'window.OWNEY_DATA='+JSON.stringify(data)+';\n');
 fs.writeFileSync(path.join(__dirname,'events-source.json'),JSON.stringify({events,items},null,2));
 console.log(JSON.stringify({events:events.length,items:items.length,images:data.totalImages}));
})();
