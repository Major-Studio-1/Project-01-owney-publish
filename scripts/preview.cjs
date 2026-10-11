const fs=require('node:fs'),path=require('node:path'),{createRequire}=require('node:module');
const wranglerRequire=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare}=wranglerRequire('miniflare');
const root=path.resolve(__dirname,'..');
const preview=new Miniflare({name:'owney-preview',host:'127.0.0.1',port:Number(process.env.OWNEY_PREVIEW_PORT||8766),modules:true,script:fs.readFileSync(path.join(root,'dist/server/index.js'),'utf8'),compatibilityDate:'2026-05-15',assets:{directory:path.join(root,'public'),binding:'ASSETS',routerConfig:{has_user_worker:true}},d1Databases:{DB:'local-owney-preview'},d1Persist:path.join(root,'.wrangler/state/v3/d1')});
preview.ready.then(url=>console.log('Local preview: '+url));
process.on('SIGINT',async()=>{await preview.dispose();process.exit(0);});
process.stdin.on('data',async data=>{if(data.toString().trim()==='stop'){await preview.dispose();process.exit(0);}});
