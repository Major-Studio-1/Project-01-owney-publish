/* Pointer handling is separate from painting: one drag updates one parent transform. */
(() => {
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  function angles(start, dx, dy, width, touch) {
    const gain = touch ? clamp(180 / Math.max(200, width), .45, .9) : .28;
    return {rx:clamp(start.rx - dy * gain * .8,-75,75), ry:clamp(start.ry + dx * gain,-180,180)};
  }
  function mount(stage, options) {
    let drag = null, suppressUntil = 0;
    function finish(event, cancelled = false) {
      if (!drag || (event.pointerId !== undefined && event.pointerId !== drag.id)) return;
      const previous = drag;
      drag = null;
      if (previous.moved) suppressUntil = performance.now() + 350;
      if (stage.hasPointerCapture(previous.id)) stage.releasePointerCapture(previous.id);
      options.end({moved:previous.moved, cancelled});
    }
    stage.addEventListener('pointerdown', event => {
      const touch = event.pointerType !== 'mouse';
      if (drag || event.isPrimary === false || event.button !== 0 || (touch && !options.touchEnabled())) return;
      drag = {id:event.pointerId,x:event.clientX,y:event.clientY,width:stage.clientWidth,touch,moved:false,...options.angles()};
      suppressUntil = 0;
      options.start();
      // Capture immediately on touch so Safari cannot lose a swipe between layers.
      if (touch) { stage.setPointerCapture(event.pointerId); event.preventDefault(); }
    }, {passive:false});
    stage.addEventListener('pointermove', event => {
      if (!drag || event.pointerId !== drag.id) return;
      const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx,dy) < 4) return;
      drag.moved = true;
      if (!stage.hasPointerCapture(drag.id)) stage.setPointerCapture(drag.id);
      event.preventDefault();
      options.change(angles(drag,dx,dy,drag.width,drag.touch));
    }, {passive:false});
    window.addEventListener('pointerup', event => finish(event));
    window.addEventListener('pointercancel', event => finish(event,true));
    stage.addEventListener('lostpointercapture', event => finish(event,true));
    window.addEventListener('blur', () => finish({},true));
    return {cancel:() => finish({},true), get suppressClick(){return !!drag?.moved || performance.now() < suppressUntil;}};
  }
  window.OWNEY_CUBE_GESTURE = {angles,mount};
})();
