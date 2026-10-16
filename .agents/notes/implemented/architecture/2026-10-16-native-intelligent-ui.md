# Agent Note: Native chat tool for Intelligent UI

Status: implemented

## Problem

The requested Intelligent UI effect needs model-composed, locally reactive answers in the existing DSH conversation. The reference Next app owns a separate model stream, history and action protocol, and its demo source has no explicit license. Copying that application would duplicate the agent loop and lose the selected session model, tool approvals and accounting.

## Decision

Use the MIT OpenUI 1.0.1 engine with original, bounded DSH-themed components. Register `intelligent_ui_guide` for on-demand signatures and `render_intelligent_ui` for presentation; mount only native `tool.call.toolview` and `conversation.input.left` slots. The small additive system prompt points to the guide instead of injecting its ~12k characters into every request.

Persist complete programs in tool output `presentationMeta.intelligentUi` version 1. Client tool result projections expose metadata, not raw output values; paired calls may be outside the active history window. Browser-local controls persist separately by session/call/program and become model-visible only through an explicit ordinary user follow-up. No custom business service or direct LLM stream is needed.

Treat OpenUI as a trusted renderer, not a code sandbox. Validate all source statements, including unused ones; reject unknown functions, network actions, dangerous properties and data keys recognized by the SDK as AST/element/reactive/action-plan objects. Count reference-expanded nodes, text and depth before SDK materialization because small repeated-reference programs expand exponentially. Restrict state defaults and `@Set` values to scalar literals to keep live updates bounded. React escapes text; no HTML/iframe/media components are provided.

## Alternatives considered

- Copy the reference Next app: rejected because no explicit demo source license and it owns a second session/model loop.
- A custom JSON UI DSL: rejected because it loses OpenUI bindings/action compatibility and adds an unnecessary parser.
- Inject the entire library prompt globally: rejected because most turns do not need interactive rendering.
- Forward OpenUI Query/Mutation to arbitrary tools: rejected because it creates a second permission path; existing agent tools fetch facts first.

## Consequences

Generation quality still depends on the selected model. The first version intentionally omits maps, remote photos, arbitrary games and external navigation. Strict reserved-key and expansion limits reject some valid general OpenUI programs; the guide documents the supported subset. localStorage is convenience-only, sensitive values stay on the browser until a user explicitly sends them, and cross-device synchronization is not implemented.

Validation includes 14 Node tests: full bundled Client view SSR, actual reactive evaluation, Host output/metadata, module-loader slot registration, AST impersonation, computed property access, cyclic/exponential references and bounded persistence/native follow-up. Browser DOM clicks and visual acceptance are not proven by SSR or slot registration. Installation returned application=applied, the Host fiber and both live Client slots were active, and a real render_intelligent_ui call generated a budget interface in this conversation. The user confirmed after refreshing the existing GUI that the starter and budget card were visible and moving the slider updated the balance/chart. No automated browser screenshot or exhaustive interaction pass was available.
