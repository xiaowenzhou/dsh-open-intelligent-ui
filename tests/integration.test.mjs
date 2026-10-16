import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { evaluateElementProps } from '@openuidev/lang-core';
import { library } from '../dist/library.js';
import { apply } from '../dist/index.js';
import { examples } from '../src/examples.js';
import { validateProgram } from '../src/protocol.js';

function walkElements(node, visit) {
  if (!node || typeof node !== 'object') return;
  if (node.type === 'element') visit(node);
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach(item => walkElements(item, visit));
    else if (value && typeof value === 'object') walkElements(value, visit);
  }
}
function evaluated(result, state) {
  const context = { getState: key => state[key], resolveRef: () => undefined, functions: Object.fromEntries(Object.entries(library.functions).map(([name, fn]) => [name, {...library.toJSONSchema().functions[name],fn:fn.fn}])) };
  const entries = [];
  walkElements(evaluateElementProps(result.root, {ctx:context,library,store:null}), element => entries.push(element));
  return entries;
}
function clientPlugin() {
  const require=createRequire(import.meta.url); let descriptor;
  new Function('window',readFileSync(new URL('../dist/client.js',import.meta.url),'utf8'))({__ModuleLoader__:{load:value=>{descriptor=value;}}});
  return descriptor.factory(require);
}
test('all examples pass hardened validation and render escaped SSR', () => {
  const { IntelligentView } = clientPlugin();
  for (const example of examples) {
    const result = validateProgram(example.program,library);
    assert.equal(result.meta.errors.length,0);
    const html = renderToStaticMarkup(React.createElement(IntelligentView,{block:{meta:{intelligentUi:{version:1,title:example.title,program:example.program}}},phase:'result',sessionId:'test',callId:example.id,sessions:{},t:key=>key}));
    assert.match(html,/dsh-iui-dashboard/); assert.doesNotMatch(html,/\[object Object\]/);
  }
});
test('budget and travel examples evaluate reactively from selected state', () => {
  const budget = validateProgram(examples[0].program,library);
  const initial = {$income:8000,$housing:2600,$food:1200,$transport:500};
  const values = evaluated(budget,initial);
  assert.ok(values.some(element=>element.typeName==='Metric' && element.props.value==='¥3,700'));
  const next = evaluated(budget,{...initial,$income:9000});
  assert.ok(next.some(element=>element.typeName==='Metric' && element.props.value==='¥4,700'));
  assert.ok(next.some(element=>element.typeName==='Chart' && element.props.data.at(-1).value===4700));
  const travel = validateProgram(examples[1].program,library);
  const ready = evaluated(travel,{$passport:true,$tickets:true,$charger:false,$medicine:false,$destination:'京都',$style:'relaxed'});
  assert.ok(ready.some(element=>element.typeName==='Metric' && element.props.value==='2 / 4'));
});
test('Host tools preserve durable presentation and reject invalid sources', async () => {
  const tools=[]; const sections=[];
  apply({tools:{register:definition=>tools.push(definition)},systemPrompt:{section:section=>sections.push(section)}});
  assert.deepEqual(tools.map(tool=>tool.name),['intelligent_ui_guide','render_intelligent_ui']);
  assert.ok(sections[0].text.length<1000);
  const guide=await tools[0].execute({}); assert.match(guide.guide,/Dashboard/);
  const tool=tools[1];
  const output=await tool.execute({title:'Budget',program:examples[0].program});
  assert.equal(tool.output.presentationMeta({},output).intelligentUi.program,examples[0].program);
  assert.ok(tool.output.render({},output)[0].text.length<500);
  await assert.rejects(tool.execute({title:'Bad',program:'root=HtmlView("bad")'}),/Unsupported/);
});
test('browser bundle exports a Cordis plugin and registers exact native slots', () => {
  const require=createRequire(import.meta.url);
  let descriptor; const registrations=[];
  // Evaluate only the module-loader wrapper, not an emulated DOM or screenshot.
  new Function('window',readFileSync(new URL('../dist/client.js',import.meta.url),'utf8'))({__ModuleLoader__:{load:value=>{descriptor=value;}}});
  assert.equal(descriptor.id,JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8')).name);
  const plugin=descriptor.factory(require);
  plugin.apply({locale:{register:()=>{}},sessions:{},slots:{inject:(_key,fn)=>fn(),register:(entry)=>registrations.push(entry)}});
  assert.deepEqual(registrations.map(entry=>[entry.name,entry.key??entry.id]),[['tool.call.toolview','render_intelligent_ui'],['conversation.input.left','intelligent-ui-starter']]);
});
