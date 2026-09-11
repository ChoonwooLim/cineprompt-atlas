import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
const require = createRequire(
  new URL('../components/preset-preview.tsx', import.meta.url),
);
const source = fs.readFileSync('components/preset-preview.tsx', 'utf8');
const js = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    jsx: ts.JsxEmit.ReactJSX,
    esModuleInterop: true,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const module = { exports: {} };
new Function('require', 'exports', 'module', js)(
  require,
  module.exports,
  module,
);
const {
  PreviewPoster,
  PreviewPlayer,
  previewInfo,
  renderedPreviewIds,
  studies,
} = module.exports;
const prompts = JSON.parse(fs.readFileSync('data/prompts.json'));
const sourceIds = new Set(
  JSON.parse(fs.readFileSync('data/sources.json')).map((s) => s.id),
);
const groups = {};
for (const p of prompts) {
  groups[p.category] = (groups[p.category] ?? 0) + 1;
  assert(
    p.sourceIds.every((id) => sourceIds.has(id)),
    'Broken source ' + p.id,
  );
  assert(previewInfo(p).steps.length > 0, 'Missing instructions ' + p.id);
  for (const v of p.variables)
    assert(p.prompt.includes('{{' + v.key + '}}'), 'Missing variable ' + p.id);
  const poster = renderToStaticMarkup(
    createElement(PreviewPoster, { item: p }),
  );
  const detail = renderToStaticMarkup(
    createElement(PreviewPlayer, { item: p }),
  );
  assert(
    !poster.includes('<video') && !detail.includes('<video'),
    'Unverified legacy video ' + p.id,
  );
  if (renderedPreviewIds.has(p.id)) {
    assert(
      detail.includes('type="range"') && detail.includes('<dialog'),
      'Missing comparison controls ' + p.id,
    );
    for (const field of [
      'change',
      'observe',
      'scope',
      'beforeLabel',
      'afterLabel',
    ])
      assert(studies[p.id][field], 'Missing methodology ' + p.id);
    for (const side of ['before', 'after']) {
      const path = 'public/previews/studies/' + p.id + '-' + side + '.webp';
      assert(fs.statSync(path).size > 1000, 'Empty media ' + path);
      assert(
        poster.includes(
          path.replace('public', '').replace('.webp', '-thumb.webp'),
        ),
        'Unmapped media ' + p.id,
      );
    }
    assert(
      !fs
        .readFileSync('public/previews/studies/' + p.id + '-before.webp')
        .equals(
          fs.readFileSync('public/previews/studies/' + p.id + '-after.webp'),
        ),
      'Identical pair ' + p.id,
    );
  } else {
    assert(!poster.includes('<img'), 'Unverified placeholder image ' + p.id);
    assert(
      detail.includes('실제 렌더가 아직 없습니다'),
      'Missing unavailability disclosure ' + p.id,
    );
  }
}
assert.equal(prompts.length, 240);
assert.equal(new Set(prompts.map((p) => p.id)).size, 240);
assert(Object.values(groups).every((n) => n === 20));
assert(
  [...renderedPreviewIds].every((id) => prompts.some((p) => p.id === id)),
  'Orphaned studies',
);
assert.equal(renderedPreviewIds.size, 33);
console.log(
  'PASS: 240 preserved presets; 33 actual comparison pairs with controls and provenance; 207 explicitly unavailable, no schematic substitutes.',
);
