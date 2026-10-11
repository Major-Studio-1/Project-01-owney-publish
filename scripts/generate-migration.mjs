import {generateSQLiteDrizzleJson,generateSQLiteMigration} from 'drizzle-kit/api';
import * as schema from '../db/schema.ts';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
let journal={version:'7',dialect:'sqlite',entries:[]},previous;
try{journal=JSON.parse(await readFile('drizzle/meta/_journal.json','utf8'));const last=journal.entries.at(-1);previous=JSON.parse(await readFile(`drizzle/meta/${String(last.idx).padStart(4,'0')}_snapshot.json`,'utf8'));}
catch(error){if(error.code!=='ENOENT')throw error;previous=await generateSQLiteDrizzleJson({});previous.id='00000000-0000-0000-0000-000000000000';}
const current=await generateSQLiteDrizzleJson(schema,previous.id);
const statements=await generateSQLiteMigration(previous,current);
if(!statements.length){console.log('Schema is unchanged.');process.exit(0);}
const idx=journal.entries.length,prefix=String(idx).padStart(4,'0'),tag=prefix+'_visitor_tags';
await mkdir('drizzle/meta',{recursive:true});
await writeFile(`drizzle/${tag}.sql`,statements.join('\n--> statement-breakpoint\n')+'\n',{flag:'wx'});
await writeFile(`drizzle/meta/${prefix}_snapshot.json`,JSON.stringify(current,null,2),{flag:'wx'});
journal.entries.push({idx,version:current.version,when:Date.now(),tag,breakpoints:true});
await writeFile('drizzle/meta/_journal.json',JSON.stringify(journal,null,2));
console.log(`Generated ${tag}: ${statements.length} schema statements.`);
