(()=>{'use strict';
const passages=[...document.querySelectorAll('.owney-passage')];
if(!passages.length)return;
const motion=matchMedia('(prefers-reduced-motion:reduce)');
const states=new Map(passages.map(element=>[element,{visible:false,ready:false,warmed:false,warming:false,preparing:null,size:'',resizeFrame:0}]));
const runner=window.OwneyRunner,country=window.OwneyCountry;
function travel(element){
 const state=states.get(element),width=element.getBoundingClientRect().width;
 const dog=element.querySelector('.owney-runner').getBoundingClientRect().width;
 if(!width||!dog)return;
 const size=`${Math.round(width)}:${Math.round(dog)}`;
 if(state.size!==size){
  state.size=size;
  const duration=2*width/(dog*.42/.88);
  element.style.setProperty('--road-duration',duration+'s');
  element.style.setProperty('--near-duration',duration*.8+'s');
 }
 runner?.resize(element);
}
function sync(element){
 const state=states.get(element);
 const wanted=state.ready&&state.visible&&!motion.matches&&!document.hidden;
 if(wanted&&!state.warmed&&!state.warming){
  state.warming=true;element.classList.add('is-warming');
  // Give decoded textures two paint opportunities before motion begins.
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   state.warming=false;state.warmed=true;element.classList.remove('is-warming');sync(element);
  }));
 }
 const running=wanted&&state.warmed;
 element.classList.toggle('is-running',running);
 runner?.setRunning(element,running);
}
function prepare(element){
 const state=states.get(element);
 if(state.ready)return Promise.resolve(true);
 if(state.preparing)return state.preparing;
 state.preparing=(async()=>{
  if(!runner||!country)return false;
  const ready=await Promise.all([runner.prepare(element),country.prepare(element)]);
  if(!ready.every(Boolean))return false;
  travel(element);state.ready=true;element.classList.add('is-ready');sync(element);return true;
 })();
 return state.preparing;
}
if('IntersectionObserver'in window){
 const preload=new IntersectionObserver(entries=>{
  for(const entry of entries)if(entry.isIntersecting){prepare(entry.target);preload.unobserve(entry.target);}
 },{rootMargin:'600px 0px'});
 const visible=new IntersectionObserver(entries=>{
  for(const entry of entries){
   const state=states.get(entry.target),ratio=entry.intersectionRatio;
   // Hysteresis prevents repeated stop/start when scrolling near an edge.
   state.visible=entry.isIntersecting&&(state.visible?ratio>.15:ratio>=.4);
   if(state.visible)prepare(entry.target);
   sync(entry.target);
  }
 },{threshold:[0,.15,.4]});
 passages.forEach(element=>{preload.observe(element);visible.observe(element);});
}else passages.forEach(prepare);
function resize(element){
 const state=states.get(element);if(!state.ready||state.resizeFrame)return;
 state.resizeFrame=requestAnimationFrame(()=>{
  state.resizeFrame=0;
  if(country.resize(element)){state.warmed=false;travel(element);sync(element);}
 });
}
if('ResizeObserver'in window){
 const observer=new ResizeObserver(entries=>entries.forEach(entry=>resize(entry.target)));
 passages.forEach(element=>observer.observe(element));
}else window.addEventListener('resize',()=>passages.forEach(resize));
motion.addEventListener('change',()=>passages.forEach(sync));
document.addEventListener('visibilitychange',()=>passages.forEach(sync));
})();
