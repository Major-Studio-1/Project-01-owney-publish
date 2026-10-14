/* User-selected music through the official YouTube player; no audio extraction. */
(()=>{'use strict';
const dock=document.querySelector('.music-dock');if(!dock)return;
const toggle=dock.querySelector('.music-toggle'),panel=dock.querySelector('.music-panel');
const status=dock.querySelector('.music-status'),mute=dock.querySelector('.music-mute');
const volume=dock.querySelector('input');
let player,ready=false,loading=false,wanted=false,failed=false,timer;
function remember(off){try{sessionStorage.setItem('owney-music-off',String(off));}catch{}}
function setOpen(open){panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));}
function stopped(message='Play music'){
 wanted=false;player?.pauseVideo?.();setOpen(false);toggle.textContent=message;
}
function play(){
 wanted=true;setOpen(true);toggle.textContent='Music';
 if(ready){player.playVideo();return;}
 if(loading)return;
 loading=true;status.textContent='Opening music…';
 const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';
 script.onerror=()=>{failed=true;stopped('Music unavailable');};
 window.onYouTubeIframeAPIReady=()=>{
  player=new YT.Player('owney-music-player',{
   width:240,height:200,videoId:'CCSdRKSQXnE',
   playerVars:{playsinline:1,controls:1,rel:0,loop:1,playlist:'CCSdRKSQXnE',origin:location.origin},
   events:{
    onReady(event){
     ready=true;clearTimeout(timer);event.target.setVolume(Number(volume.value));
     event.target.getIframe().title='Broken Vow — YouTube music player';
     status.textContent='Broken Vow · YouTube';
     if(wanted&&!document.hidden)event.target.playVideo();else stopped();
    },
    onAutoplayBlocked(){stopped('Play music');},
    onStateChange(event){
     if(event.data===1){
      if(!wanted||panel.hidden||document.hidden){player.pauseVideo();return;}
      status.textContent='Broken Vow · YouTube';toggle.textContent='Music on';
     }else if(event.data===2)toggle.textContent='Music';
    },
    onError(){failed=true;stopped('Music unavailable');}
   }
  });
 };
 document.head.append(script);
 timer=setTimeout(()=>{if(!ready){failed=true;stopped('Music unavailable');}},15000);
}
toggle.addEventListener('click',()=>{
 if(!panel.hidden){remember(true);stopped();return;}
 if(failed){setOpen(true);status.textContent='Listen using the YouTube link below.';return;}
 remember(false);play();
});
dock.querySelector('.music-close').addEventListener('click',()=>{remember(true);stopped();toggle.focus();});
mute.addEventListener('click',()=>{
 if(!ready)return;
 const muted=!player.isMuted();muted?player.mute():player.unMute();
 mute.textContent=muted?'Unmute':'Mute';mute.setAttribute('aria-pressed',String(muted));
});
volume.addEventListener('input',()=>{
 if(!ready)return;
 player.setVolume(Number(volume.value));player.unMute();mute.textContent='Mute';mute.setAttribute('aria-pressed','false');
});
dock.addEventListener('keydown',event=>{if(event.key==='Escape'){remember(true);stopped();toggle.focus();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&ready)stopped();});
function autoStart(){
 let off=false;try{off=sessionStorage.getItem('owney-music-off')==='true';}catch{}
 if(!off&&!document.hidden)play();
}
// Let the page and its own artwork load before requesting the video player.
if(document.readyState==='complete')autoStart();else window.addEventListener('load',autoStart,{once:true});
})();
