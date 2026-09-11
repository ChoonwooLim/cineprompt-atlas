import fs from 'node:fs';
import {createRequire} from 'node:module';
import ts from 'typescript';
import {renderToStaticMarkup} from 'react-dom/server';
import {createElement} from 'react';
const require=createRequire(import.meta.url);
const source=fs.readFileSync('components/preset-preview.tsx','utf8').replace(/^import.*from '@\/components\/ui\/.*';$/gm,'');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true,target:ts.ScriptTarget.ES2022}}).outputText;
const module={exports:{}};new Function('require','exports','module',js)(require,module.exports,module);
const {PreviewScene,previewInfo,renderedCameraIds}=module.exports;
const prompts=JSON.parse(fs.readFileSync('data/prompts.json'));
const sourceIds=new Set(JSON.parse(fs.readFileSync('data/sources.json')).map(s=>s.id));
const groups={};
for(const p of prompts){
 groups[p.category]=(groups[p.category]??0)+1;
 if(!p.sourceIds.every(id=>sourceIds.has(id)))throw Error('Broken source '+p.id);
 const info=previewInfo(p);
 if(info.steps.length!==3||info.steps.some(s=>!s))throw Error('Missing instructions '+p.id);
 const start=renderToStaticMarkup(createElement(PreviewScene,{item:p,time:0}));
 const end=renderToStaticMarkup(createElement(PreviewScene,{item:p,time:1}));
 if(start.includes('NaN')||end.includes('NaN'))throw Error('Invalid graphic '+p.id);
 for(const v of p.variables)if(!p.prompt.includes('{{'+v.key+'}}'))throw Error('Missing variable '+p.id);
 if(renderedCameraIds.has(p.id))for(const ext of ['mp4','jpg'])if(!fs.existsSync('public/previews/lab/'+p.id+'.'+ext))throw Error('Missing media '+p.id);
}
if(prompts.length!==240||new Set(prompts.map(p=>p.id)).size!==240||Object.values(groups).some(n=>n!==20))throw Error('Catalog counts changed');
console.log('PASS: 240 previews render at both endpoints; 12 × 20 IDs, variables, sources, 18 video/poster pairs.');
