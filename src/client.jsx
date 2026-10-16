import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Renderer } from '@openuidev/react-lang';
import { library, LibraryI18nProvider } from './library.jsx';
import { styles } from './styles.js';
import { MAX_PROGRAM, readToolPayload, validateProgram, boundedState, stateKey, actionPrompt, submitPrompt } from './protocol.js';
import en from '../locale/en.json';
import zh from '../locale/zh.json';

const NS = 'dsh-intelligent-ui';
export const name = 'intelligent-ui-client';
export const inject = ['slots', 'locale', 'sessions'];

class RenderBoundary extends React.Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <p role="alert">{this.props.t('failed')}</p> : this.props.children; }
}

function useFollowup(sessions, sessionId, t) {
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const inflight = useRef(null);
  useEffect(() => () => inflight.current?.abort(), []);
  const send = useCallback(async text => {
    if (inflight.current) return;
    const controller = new AbortController();
    inflight.current = controller;
    setBusy(true); setStatus(t('sending'));
    try {
      await submitPrompt(sessions, sessionId, text, controller.signal);
      if (!controller.signal.aborted) setStatus(t('sent'));
    } catch (error) {
      if (!controller.signal.aborted) setStatus(`${t('actionFailed')}: ${String(error?.message ?? error).slice(0, 240)}`);
    } finally {
      if (inflight.current === controller) inflight.current = null;
      if (!controller.signal.aborted) setBusy(false);
    }
  }, [sessions, sessionId, t]);
  return { send, status, busy };
}

function InteractiveProgram({ program, title, streaming, sessionId, callId, sessions, t }) {
  const [reset, setReset] = useState(0);
  const key = streaming ? null : stateKey(sessionId, callId, program);
  const [initialState] = useState(() => {
    if (!key) return {};
    try { return boundedState(JSON.parse(localStorage.getItem(key) ?? '{}')); } catch { return {}; }
  });
  const currentState = useRef(initialState);
  const { send, status, busy } = useFollowup(sessions, sessionId, t);
  const saveState = useCallback(state => {
    currentState.current = boundedState(state);
    if (key) {
      // State is convenience-only, browser-local and separate from durable DSH history.
      try { localStorage.setItem(key, JSON.stringify(currentState.current)); } catch { /* Storage unavailable/quota exhausted: the interface remains usable. */ }
    }
  }, [key]);
  const onAction = useCallback(event => {
    if (streaming || busy) return;
    try { void send(actionPrompt(event, title)); } catch { /* Unknown external actions are never dispatched. */ }
  }, [streaming, busy, send, title]);
  const resetState = () => {
    currentState.current = {};
    if (key) { try { localStorage.removeItem(key); } catch {} }
    setReset(value => value + 1);
  };
  return <>
    <LibraryI18nProvider t={t}>
      <RenderBoundary key={reset} t={t}>
        <Renderer key={reset} response={program} library={library} isStreaming={streaming || busy} initialState={reset ? {} : initialState} onStateUpdate={saveState} onAction={onAction} toolProvider={null} publishObservability={false}/>
      </RenderBoundary>
    </LibraryI18nProvider>
    {!streaming && <footer className="dsh-iui-footer"><button type="button" onClick={resetState} disabled={busy}>{t('reset')}</button><span role="status" aria-live="polite">{status}</span></footer>}
  </>;
}

export function IntelligentView({ block, phase, sessionId, callId, sessions, t }) {
  // Read at render time: preparing argument views grow in place and track observed fields.
  const payload = readToolPayload(block, phase);
  const program = payload.program ?? '';
  const title = payload.title || t('title');
  const streaming = phase !== 'result';
  let error = payload.error;
  let ready = false;
  if (!error && program) {
    try { validateProgram(program, library, { partial: streaming }); ready = true; }
    catch (cause) { if (!streaming || program.length > MAX_PROGRAM) error = String(cause.message); }
  }
  return <section className="dsh-iui" aria-label={title}>
    <style>{styles}</style>
    <header className="dsh-iui-header"><span className="dsh-iui-spark" aria-hidden="true">✦</span><strong>{title}</strong>{streaming && <span role="status">{t('progress')}</span>}</header>
    {error ? <div role="alert" className="dsh-iui-error"><strong>{t('failed')}</strong><pre>{error}</pre></div> : ready ?
      <InteractiveProgram key={`${callId}:${streaming ? 'stream' : 'settled'}`} program={program} title={title} streaming={streaming} sessionId={sessionId} callId={callId} sessions={sessions} t={t}/> : <p role="status">{t('generating')}</p>}
    {program && <details className="dsh-iui-source"><summary>{t('source')}</summary><pre>{program}</pre></details>}
  </section>;
}

export function Starter({ sessionId, sessions, t }) {
  const { send, status, busy } = useFollowup(sessions, sessionId, t);
  return <div className="dsh-iui-starter"><style>{styles}</style><button type="button" disabled={busy} onClick={() => void send(t('demoPrompt'))} title={t('meta.description')}>✦ {t('demo')}</button><span role="status" aria-live="polite">{status}</span></div>;
}

export function apply(ctx) {
  ctx.locale.register(NS, 'en', en);
  ctx.locale.register(NS, 'zh', zh);
  ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({ name: 'tool.call.toolview', key: 'render_intelligent_ui', locale: NS, inject: () => ({ sessions: ctx.sessions }) }, IntelligentView));
  ctx.slots.inject('conversation.input.left', () => ctx.slots.register({ name: 'conversation.input.left', id: 'intelligent-ui-starter', order: 30, locale: NS, inject: () => ({ sessions: ctx.sessions }) }, Starter));
}
