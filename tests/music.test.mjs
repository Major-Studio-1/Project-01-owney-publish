import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../public/music.js',import.meta.url),'utf8');
function harness(off=false){
 const listeners={},calls=[],storage=new Map([['owney-music-off',String(off)]]);
 const control=()=>({hidden:true,value:'12',textContent:'',listeners:{},attributes:{},addEventListener(n,fn){this.listeners[n]=fn;},setAttribute(n,v){this.attributes[n]=v;},focus(){}});
 const nodes=Object.fromEntries(['.music-toggle','.music-panel','.music-status','.music-mute','input','.music-close'].map(s=>[s,control()]));
 const dock={querySelector:s=>nodes[s],addEventListener:(n,fn)=>listeners[n]=fn};
 const document={hidden:false,readyState:'complete',querySelector:()=>dock,createElement:()=>({}),head:{append:()=>calls.push('load')},addEventListener:(n,fn)=>listeners[n]=fn};
 let options,muted=false;
 const player={setVolume:v=>calls.push(['volume',v]),playVideo:()=>calls.push('play'),pauseVideo:()=>calls.push('pause'),getIframe:()=>({}),mute:()=>muted=true,unMute:()=>muted=false,isMuted:()=>muted};
 const window={addEventListener(){}};
 vm.runInNewContext(source,{document,window,YT:{Player:function(id,o){options=o;return player;}},location:{origin:'https://example.test'},sessionStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},setTimeout:()=>1,clearTimeout(){}});
 return {nodes,calls,document,listeners,player,storage,init(){window.onYouTubeIframeAPIReady();options.events.onReady({target:player});},blocked(){options.events.onAutoplayBlocked();}};
}
test('music starts quietly, handles autoplay blocking, and obeys close and mute',()=>{
 const h=harness();h.init();assert.deepEqual(h.calls.slice(-2),[['volume',12],'play']);
 assert.equal(h.nodes['.music-panel'].hidden,false);
 h.blocked();assert.equal(h.nodes['.music-panel'].hidden,true);assert.equal(h.nodes['.music-toggle'].textContent,'Play music');
 h.nodes['.music-toggle'].listeners.click();assert.equal(h.nodes['.music-panel'].hidden,false);assert.equal(h.calls.at(-1),'play');
 h.nodes['.music-mute'].listeners.click();assert.equal(h.player.isMuted(),true);
 h.nodes['input'].value='8';h.nodes['input'].listeners.input();assert.deepEqual(h.calls.at(-1),['volume',8]);assert.equal(h.player.isMuted(),false);
 h.nodes['.music-close'].listeners.click();assert.equal(h.calls.at(-1),'pause');assert.equal(h.nodes['.music-panel'].hidden,true);assert.equal(h.storage.get('owney-music-off'),'true');
});
test('a dismissed soundtrack stays off on the next load',()=>{
 const h=harness(true);assert.equal(h.calls.includes('load'),false);
 h.nodes['.music-toggle'].listeners.click();assert.equal(h.calls.includes('load'),true);
});
