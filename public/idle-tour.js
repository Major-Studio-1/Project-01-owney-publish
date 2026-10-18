/* An idle tour follows the current date/filter selection and yields to input. */
(()=>{'use strict';
 function create(options){
  const delay=options.delay??12000,interval=options.interval??4600;
  const later=options.setTimeout??setTimeout,cancel=options.clearTimeout??clearTimeout;
  let timer=0,enabled=true,running=false,cursor=0;
  function state(value){if(running!==value){running=value;options.onRunning?.(value);}}
  function schedule(ms){if(timer)cancel(timer);timer=enabled?later(step,ms):0;}
  function activity(){cursor=0;state(false);schedule(delay);}
  function step(){
   timer=0;if(!enabled)return;
   const ids=options.getIds();
   if(!options.canRun()||ids.length<2){activity();return;}
   state(true);options.select(ids[cursor%ids.length]);cursor++;
   if(cursor>=ids.length){cursor=0;schedule(8000);}else schedule(interval);
  }
  function setEnabled(value){enabled=!!value;activity();}
  activity();
  return {activity,setEnabled,get enabled(){return enabled;},get running(){return running;},destroy(){enabled=false;if(timer)cancel(timer);timer=0;state(false);}};
 }
 window.OWNEY_IDLE_TOUR={create};
})();
