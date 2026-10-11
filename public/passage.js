(()=>{'use strict';
const passages=[...document.querySelectorAll('.owney-passage')];
if(!passages.length)return;
const motion=matchMedia('(prefers-reduced-motion:reduce)');
const states=new Map(passages.map(element=>[element,{visible:false,ready:false,userPaused:false,optIn:false}]));
const runner=window.OwneyRunner;
function travel(element){
 const width=element.getBoundingClientRect().width;
 const dog=element.querySelector('.owney-runner').getBoundingClientRect().width;
 if(!width||!dog)return;
 const duration=2*width/(dog*.42/.88);
 element.style.setProperty('--road-duration',duration+'s');
 element.style.setProperty('--near-duration',duration*.8+'s');
 runner?.resize(element);
}
function canRun(state){
 return state.ready&&state.visible&&!state.userPaused&&(!motion.matches||state.optIn)&&!document.hidden;
}
function sync(element){
 const state=states.get(element);
 const running=canRun(state);
 element.classList.toggle('motion-opt-in',state.optIn);
 element.classList.toggle('is-running',running);
 runner?.setRunning(element,running);
 const control=element.querySelector('.passage-motion');
 if(control){
  control.setAttribute('aria-label',running?'Pause Owney animation':'Play Owney animation');
  control.querySelector('span').textContent=running?'Pause':'Play';
 }
}
async function prepare(element){
 const state=states.get(element);
 if(state.ready)return;
 if(!runner||!await runner.prepare(element)){element.querySelector('.passage-motion').hidden=true;return;}
 travel(element);state.ready=true;element.classList.add('is-ready');sync(element);
}
for(const element of passages){
 element.querySelector('.passage-motion')?.addEventListener('click',()=>{
  const state=states.get(element);
  if(canRun(state))state.userPaused=true;
  else{state.userPaused=false;state.optIn=true;prepare(element);}
  sync(element);
 });
 sync(element);
}
if('IntersectionObserver'in window){
 const preload=new IntersectionObserver(entries=>{
  for(const entry of entries)if(entry.isIntersecting){prepare(entry.target);preload.unobserve(entry.target);}
 },{rootMargin:'260px 0px'});
 const visible=new IntersectionObserver(entries=>{
  for(const entry of entries){
   const state=states.get(entry.target);
   state.visible=entry.isIntersecting&&entry.intersectionRatio>=.4;
   if(state.visible)prepare(entry.target);
   sync(entry.target);
  }
 },{threshold:[0,.4]});
 passages.forEach(element=>{preload.observe(element);visible.observe(element);});
}else passages.forEach(element=>{element.querySelector('.passage-motion').hidden=true;prepare(element);});
if('ResizeObserver'in window){
 const resize=new ResizeObserver(entries=>entries.forEach(entry=>travel(entry.target)));
 passages.forEach(element=>resize.observe(element));
}else window.addEventListener('resize',()=>passages.forEach(travel));
motion.addEventListener('change',()=>{
 for(const element of passages){states.get(element).optIn=false;sync(element);}
});
document.addEventListener('visibilitychange',()=>passages.forEach(sync));
})();
