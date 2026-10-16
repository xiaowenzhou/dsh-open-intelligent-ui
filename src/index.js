import { readFileSync } from 'node:fs';
import { library } from './library.jsx';
import { validateProgram, MAX_PROGRAM } from './protocol.js';

export const name = 'intelligent-ui';
export const inject = ['tools', 'systemPrompt'];
export const metadata = { title: { en: 'Intelligent UI', zh: '智能交互界面' }, description: { en: 'OpenUI-powered interactive answers in your existing conversations.', zh: '在现有聊天中呈现由模型生成的交互界面。' } };

export function apply(ctx) {
  ctx.tools.register({
    name: 'intelligent_ui_guide',
    description: 'Read the OpenUI component signatures, syntax and working examples before using render_intelligent_ui. Read-only; no network or model call.',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
    output: {
      schema: { type: 'object', properties: { guide: { type: 'string' } }, required: ['guide'], additionalProperties: false },
      render: (_args, value) => [{ type: 'text', text: value.guide }],
    },
    isConcurrencySafe: () => true,
    async execute() { return { guide: readFileSync(new URL('./guide.txt', import.meta.url), 'utf8') }; },
  });
  ctx.tools.register({
    name: 'render_intelligent_ui',
    description: 'Render a model-composed interactive answer in this conversation: cards, tables, charts and reactive inputs. Read intelligent_ui_guide first. Pure presentation; no network, code execution, booking or business side effect. User clicks may submit an ordinary follow-up message.',
    parameters: {
      type: 'object', properties: {
        title: { type: 'string', description: 'Short title in the user language, up to 160 characters.' },
        program: { type: 'string', description: `Complete plain OpenUI Lang program using the guide library, root = Dashboard(...). Bind inputs to $variables and compute derived results locally. No Markdown fences, Query/Mutation, JavaScript, HTML, Run/OpenUrl, Each/Range or external data. At most ${MAX_PROGRAM} characters and 150 statements.` },
      }, required: ['title', 'program'], additionalProperties: false,
    },
    output: {
      schema: { type: 'object', properties: { version: { type: 'integer' }, title: { type: 'string' }, program: { type: 'string' } }, required: ['version', 'title', 'program'], additionalProperties: false },
      render: (_args, value) => [{ type: 'text', text: `Interactive answer rendered: ${value.title}. Inputs update locally; follow-up buttons send user messages. The program remains in the call record; do not repeat its source in chat.` }],
      presentationMeta: (_args, value) => ({ intelligentUi: value }),
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      if (!args || typeof args !== 'object' || typeof args.title !== 'string' || !args.title.trim() || args.title.length > 160) throw new Error('title must be 1–160 characters.');
      if (Object.keys(args).some(key => !['title', 'program'].includes(key))) throw new Error('Only title and program are accepted.');
      validateProgram(args.program, library);
      return { version: 1, title: args.title.trim(), program: args.program };
    },
  });
  ctx.systemPrompt.section({ name: 'intelligent-ui', order: 850, text: 'For user-requested interactive answers, planners, calculators, comparisons or dashboards, use intelligent_ui_guide once to discover the OpenUI library, then render_intelligent_ui. Generate useful locally reactive controls, not decorative forms. Use normal text/tools for other tasks. Gather real facts through existing tools first; label example data. Do not fabricate external services or claim UI actions performed a transaction. Do not output the UI source as Markdown.' });
}
