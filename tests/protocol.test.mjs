import test from 'node:test';
import assert from 'node:assert/strict';
import { defineComponent, createLibrary } from '@openuidev/lang-core';
import { z } from 'zod/v4';
import { validateProgram, readToolPayload, boundedState, stateKey, actionPrompt, submitPrompt, MAX_PROGRAM } from '../src/protocol.js';

const Dashboard = defineComponent({ name: 'Dashboard', props: z.object({ title: z.string() }), component: () => null, description: 'Test root' });
const library = createLibrary({ components: [Dashboard], root: 'Dashboard' });
test('accepts complete program and rejects invalid props and undefined references', () => {
  assert.ok(validateProgram('root = Dashboard("Hello")', library).root);
  assert.throws(() => validateProgram('root = Dashboard()', library), /Invalid component props/);
  assert.throws(() => validateProgram('root = missing', library), /Undefined/);
  assert.throws(() => validateProgram('root = Dashboard("hello', library), /Incomplete/);
});
test('rejects arbitrary external actions, tools and unbounded builtins even in orphan declarations', () => {
  for (const name of ['HtmlView', 'Query', 'Mutation', 'Run', 'OpenUrl', 'Each', 'Range', 'Unknown']) {
    assert.throws(() => validateProgram(`unused = @${name}("bad")\nroot = Dashboard("Hello")`, library), /Unsupported/);
  }
  assert.throws(() => validateProgram('root = Dashboard({constructor: "bad"})', library), /Unsafe/);
  assert.throws(() => validateProgram('root = Dashboard($x.constructor)', library), /Unsafe/);
});
test('enforces source and statement bounds', () => {
  assert.throws(() => validateProgram('x'.repeat(MAX_PROGRAM + 1), library), /exceeds/);
  assert.throws(() => validateProgram(Array.from({length: 151}, (_, i) => `a${i} = "x"`).join('\n'), library), /150 statements/);
  assert.throws(() => validateProgram('```openui\nroot = Dashboard("Hello")\n```', library), /Markdown/);
});
test('metadata survives missing paired call and errors never appear as successful interface', () => {
  const meta = { intelligentUi: { version: 1, title: 'Saved', program: 'root = Dashboard("Saved")' } };
  assert.equal(readToolPayload({ meta }, 'result').title, 'Saved');
  assert.equal(readToolPayload({ meta, isError: true, content: [{type:'text', text:'Denied'}] }, 'result').error, 'Denied');
  const args = { textPrefix: key => key === 'program' ? 'prefix' : 'Title' };
  assert.equal(readToolPayload({ args }, 'preparing').program, 'prefix');
});
test('state persistence is bounded and scoped to session/call/program', () => {
  assert.deepEqual(boundedState(JSON.parse('{"$budget":100,"__proto__":{"bad":true}}')), { $budget: 100 });
  assert.deepEqual(boundedState({ a: 'x'.repeat(33000) }), {});
  assert.notEqual(stateKey('s1', 'c', 'p'), stateKey('s2', 'c', 'p'));
  assert.notEqual(stateKey('s', 'c', 'p1'), stateKey('s', 'c', 'p2'));
});
test('only explicit assistant action becomes a normal bounded user prompt', () => {
  assert.throws(() => actionPrompt({type: 'open_url'}, 'title'), /Unsupported/);
  assert.throws(() => actionPrompt({type: 'continue_conversation', humanFriendlyMessage: ''}, 'title'), /short/);
  const text = actionPrompt({type:'continue_conversation', humanFriendlyMessage:'Advise me', params:{context:{budget: 100}}}, 'Budget');
  assert.match(text, /Advise me/); assert.match(text, /"budget":100/);
});
test('submits to exact retained session through native prompt and surfaces remote failure', async () => {
  const calls = [];
  const sessions = { binding: id => ({session: {prompt: async (...args) => {calls.push([id, ...args]); return {ok:true,value:{accepted:true}};}}}) };
  assert.deepEqual(await submitPrompt(sessions, 's1', 'Hello'), {accepted:true});
  assert.deepEqual(calls[0].slice(0, 3), ['s1', [{type:'text',text:'Hello'}], 'queue']);
  await assert.rejects(submitPrompt({binding:()=>undefined}, 'gone', 'hello'), /retained/);
  await assert.rejects(submitPrompt({binding:()=>({session:{prompt:async()=>({ok:false,error:{message:'Denied'}})}})}, 's', 'hello'), /Denied/);
});
