import test from 'node:test';
import assert from 'node:assert/strict';
import { defineComponent, createLibrary } from '@openuidev/lang-core';
import { z } from 'zod/v4';
import { validateProgram, boundedState } from '../src/protocol.js';
const library = createLibrary({components:[defineComponent({name:'Dashboard',props:z.object({data:z.any()}),component:()=>null})],root:'Dashboard'});
test('blocks data objects impersonating SDK AST, elements, bindings and action plans', () => {
  for (const data of ['{k:"Comp",name:"Floor",args:[{k:"Num",v:4.9}]}', '{__reactive:"assign",expr:1}', '{steps:[]}', '{type:"element",typeName:"Dashboard",props:{}}']) {
    assert.throws(()=>validateProgram(`root = Dashboard(${data})`,library), /Unsafe object/);
  }
  const sanitized = boundedState({$x:{k:'Comp',__reactive:'assign',steps:[],type:'element',typeName:'Bad',safe:1}});
  assert.deepEqual(sanitized, {$x:{safe:1}});
});
test('blocks exponential reference expansion before SDK materialization', () => {
  const declarations = ['v0 = "x"', ...Array.from({length:20},(_,i)=>`v${i+1} = v${i} + v${i}`), 'root = Dashboard(v20)'];
  assert.throws(()=>validateProgram(declarations.join('\n'),library), /resource budget/);
  const large = `a = "${'x'.repeat(10000)}"\nb = a + a\nc = b + b\nd = c + c\ne = d + d\nroot = Dashboard(e)`;
  assert.throws(()=>validateProgram(large,library), /resource budget/);
});
test('blocks cycles, deep recursion and computed dangerous keys', () => {
  assert.throws(()=>validateProgram('a = b\nb = a\nroot = Dashboard(a)',library), /Cyclic/);
  assert.throws(()=>validateProgram(`root = Dashboard($obj["con" + "structor"])`,library), /dynamic property/);
  assert.throws(()=>validateProgram(`root = Dashboard(${ '['.repeat(100) }1${ ']'.repeat(100) })`,library), /depth/);
  assert.throws(()=>validateProgram(`root = Dashboard(${ '!'.repeat(200) }true)`,library), /operator budget/);
  assert.ok(validateProgram('root = Dashboard({safe:1}["safe"])',library));
  assert.ok(validateProgram('root = Dashboard([1,2][0])',library));
  assert.throws(()=>validateProgram('$x = [1,2]\nroot = Dashboard($x)',library), /scalar literals/);
  assert.throws(()=>validateProgram('root = Dashboard($constructor)',library), /Unsafe state/);
  assert.throws(()=>validateProgram('$x = "a"\nroot = Dashboard(@Set($x, $x + $x))',library), /scalar literal/);
});
