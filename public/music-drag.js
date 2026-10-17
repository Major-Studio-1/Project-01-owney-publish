/* Move the visible player, keeping its native controls and full video in view. */
(() => {
  const dock=document.querySelector('.music-dock');
  if(!dock)return;
  const panel=dock.querySelector('.music-panel'),handle=dock.querySelector('.music-drag');
  const status=dock.querySelector('.music-position-status');
  if(!handle)return;
  let position=null,drag=null,size=null,frame=0,ignoreClickUntil=0;
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  function limits(){
    const viewport=window.visualViewport;
    const left=(viewport?.offsetLeft||0)+8,top=(viewport?.offsetTop||0)+8;
    return {left,top,right:Math.max(left,(viewport?.offsetLeft||0)+(viewport?.width||document.documentElement.clientWidth)-size.width-8),bottom:Math.max(top,(viewport?.offsetTop||0)+(viewport?.height||document.documentElement.clientHeight)-size.height-8)};
  }
  function paint(){
    frame=0;if(panel.hidden||!position)return;
    dock.style.left='0';dock.style.top='0';dock.style.right='auto';dock.style.bottom='auto';
    dock.style.transform='translate3d('+position.x+'px,'+position.y+'px,0)';
  }
  function place(x,y){
    const bounds=limits();position={x:clamp(x,bounds.left,bounds.right),y:clamp(y,bounds.top,bounds.bottom)};
    if(!frame)frame=requestAnimationFrame(paint);
  }
  function measure(){
    if(panel.hidden)return;
    const box=panel.getBoundingClientRect();size={width:box.width,height:box.height};
    place(position?.x??box.left,position?.y??box.top);
  }
  function finish(event){
    if(!drag||(event.pointerId!==undefined&&event.pointerId!==drag.id))return;
    const previous=drag;drag=null;dock.classList.remove('music-dragging');
    if(handle.hasPointerCapture(previous.id))handle.releasePointerCapture(previous.id);
    if(previous.moved){ignoreClickUntil=performance.now()+350;status.textContent='Music player moved.';}
  }
  dock.addEventListener('music:open',measure);
  dock.addEventListener('music:close',()=>{
    finish({});if(frame)cancelAnimationFrame(frame);frame=0;
    for(const key of ['left','top','right','bottom','transform'])dock.style.removeProperty(key);
  });
  handle.addEventListener('pointerdown',event=>{
    if(event.button!==0||event.isPrimary===false||drag||panel.hidden)return;
    measure();drag={id:event.pointerId,x:event.clientX,y:event.clientY,start:{...position},moved:false};
    handle.setPointerCapture(event.pointerId);event.preventDefault();
  },{passive:false});
  handle.addEventListener('pointermove',event=>{
    if(!drag||event.pointerId!==drag.id)return;
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
    if(!drag.moved&&Math.hypot(dx,dy)<4)return;
    drag.moved=true;dock.classList.add('music-dragging');event.preventDefault();
    place(drag.start.x+dx,drag.start.y+dy);
  },{passive:false});
  window.addEventListener('pointerup',finish);window.addEventListener('pointercancel',finish);
  handle.addEventListener('lostpointercapture',finish);window.addEventListener('blur',()=>finish({}));
  handle.addEventListener('click',()=>{
    if(performance.now()<ignoreClickUntil)return;
    measure();const b=limits(),corners=[[b.right,b.bottom],[b.left,b.bottom],[b.left,b.top],[b.right,b.top]];
    let nearest=0;corners.forEach((c,i)=>{if(Math.hypot(position.x-c[0],position.y-c[1])<Math.hypot(position.x-corners[nearest][0],position.y-corners[nearest][1]))nearest=i;});
    place(...corners[(nearest+1)%4]);status.textContent='Music player moved to the next corner.';
  });
  handle.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(event.key))return;
    event.preventDefault();measure();const step=event.shiftKey?60:20,b=limits();
    if(event.key==='Home')place(b.right,b.bottom);
    else place(position.x+(event.key==='ArrowLeft'?-step:event.key==='ArrowRight'?step:0),position.y+(event.key==='ArrowUp'?-step:event.key==='ArrowDown'?step:0));
  });
  function resize(){finish({});measure();}
  window.addEventListener('resize',resize);
  window.visualViewport?.addEventListener('resize',resize);
  window.visualViewport?.addEventListener('scroll',measure);
})();
