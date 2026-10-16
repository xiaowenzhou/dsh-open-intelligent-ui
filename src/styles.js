export const styles = `
.dsh-iui, .dsh-iui-starter { --iui-bg:var(--dsw-alias-bg-layer-1,#fff); --iui-surface:var(--dsw-alias-bg-layer-2,#f5f6f8); --iui-border:var(--dsw-alias-border-l1,#e3e5e8); --iui-text:var(--dsw-alias-label-primary,#1b2130); --iui-muted:var(--dsw-alias-label-secondary,#697180); --iui-brand:var(--dsw-alias-brand-primary,#5668dc); --iui-success:var(--dsw-alias-state-success-primary,#27845d); --iui-error:var(--dsw-alias-state-error-primary,#cf4256); color:var(--iui-text); font:inherit; }
.dsh-iui { box-sizing:border-box; container-type:inline-size; width:100%; max-width:1100px; margin:8px 0; padding:20px; border:1px solid var(--iui-border); border-radius:18px; background:var(--iui-bg); line-height:1.5; }
.dsh-iui *, .dsh-iui-starter * { box-sizing:border-box; }
.dsh-iui .dsh-iui-header { display:flex; gap:10px; align-items:center; margin-bottom:22px; font-size:14px; }
.dsh-iui .dsh-iui-header strong { flex:1; }
.dsh-iui .dsh-iui-header > [role=status] { color:var(--iui-muted); font-size:12px; }
.dsh-iui .dsh-iui-spark { display:grid; place-items:center; width:30px; height:30px; border-radius:10px; color:var(--iui-brand); background:color-mix(in srgb,var(--iui-brand) 12%,var(--iui-bg)); font-size:21px; }
.dsh-iui .dsh-iui-dashboard, .dsh-iui .dsh-iui-col { display:flex; flex-direction:column; gap:16px; min-width:0; }
.dsh-iui .dsh-iui-row { display:flex; flex-wrap:wrap; align-items:center; gap:16px; min-width:0; }
.dsh-iui .dsh-iui-row > * { min-width:0; }
.dsh-iui .dsh-iui-grid { display:grid; grid-template-columns:repeat(var(--iui-columns,2),minmax(0,1fr)); gap:16px; min-width:0; }
.dsh-iui .dsh-iui-card { padding:20px; border:1px solid var(--iui-border); border-radius:14px; min-width:0; background:var(--iui-bg); }
.dsh-iui .dsh-iui-card > header { margin-bottom:18px; }
.dsh-iui .dsh-iui-card h3 { margin:0; font-size:15px; font-weight:650; letter-spacing:-.015em; }
.dsh-iui .dsh-iui-card header p { margin:5px 0 0; color:var(--iui-muted); font-size:12px; }
.dsh-iui .dsh-iui-title { margin:0; font-weight:650; letter-spacing:-.035em; line-height:1.3; overflow-wrap:anywhere; }
.dsh-iui h2.dsh-iui-title { font-size:26px; }
.dsh-iui h3.dsh-iui-title { font-size:20px; }
.dsh-iui h4.dsh-iui-title { font-size:16px; }
.dsh-iui .dsh-iui-text { margin:0; white-space:pre-wrap; overflow-wrap:anywhere; font-size:14px; }
.dsh-iui .dsh-iui-muted, .dsh-iui .dsh-iui-tone-muted { color:var(--iui-muted); }
.dsh-iui .dsh-iui-tone-success { color:var(--iui-success); }
.dsh-iui .dsh-iui-tone-error { color:var(--iui-error); }
.dsh-iui .dsh-iui-tone-warning { color:var(--dsw-alias-state-warning-primary,var(--iui-text)); }
.dsh-iui .dsh-iui-tone-brand { color:var(--iui-brand); }
.dsh-iui .dsh-iui-metric { display:flex; flex-direction:column; gap:6px; padding:18px; background:var(--iui-surface); border-radius:12px; min-width:0; }
.dsh-iui .dsh-iui-label, .dsh-iui .dsh-iui-metric small { color:var(--iui-muted); font-size:12px; }
.dsh-iui .dsh-iui-metric strong { font-size:30px; font-weight:650; letter-spacing:-.04em; line-height:1.25; font-variant-numeric:tabular-nums; overflow-wrap:anywhere; }
.dsh-iui .dsh-iui-badge { display:inline-flex; align-self:flex-start; padding:4px 9px; border:1px solid currentColor; border-radius:7px; font-size:11px; font-weight:600; line-height:1.3; }
.dsh-iui .dsh-iui-divider { width:100%; margin:0; border:0; border-top:1px solid var(--iui-border); }
.dsh-iui .dsh-iui-field { display:flex; flex-direction:column; gap:7px; min-width:0; font-size:12px; font-weight:550; }
.dsh-iui .dsh-iui-field > span { display:flex; justify-content:space-between; gap:12px; }
.dsh-iui input:not([type=range]):not([type=checkbox]), .dsh-iui select { display:block; width:100%; min-width:0; min-height:38px; padding:8px 11px; color:var(--iui-text); background:var(--iui-bg); border:1px solid var(--iui-border); border-radius:8px; font:inherit; font-size:14px; }
.dsh-iui input::placeholder { color:var(--iui-muted); }
.dsh-iui input[type=range] { width:100%; height:25px; margin:0; accent-color:var(--iui-brand); cursor:pointer; }
.dsh-iui .dsh-iui-slider output { color:var(--iui-brand); font-variant-numeric:tabular-nums; }
.dsh-iui .dsh-iui-checkbox { display:flex; align-items:center; gap:10px; padding:11px 12px; border:1px solid var(--iui-border); border-radius:9px; font-size:14px; cursor:pointer; }
.dsh-iui .dsh-iui-checkbox input { width:16px; height:16px; flex-shrink:0; margin:0; accent-color:var(--iui-brand); }
.dsh-iui .dsh-iui-checkbox.is-checked span { color:var(--iui-muted); text-decoration:line-through; }
.dsh-iui button { font:inherit; cursor:pointer; }
.dsh-iui .dsh-iui-button { align-self:flex-start; padding:10px 15px; color:var(--iui-bg); background:var(--iui-brand); border:1px solid var(--iui-brand); border-radius:9px; font-size:13px; font-weight:600; }
.dsh-iui .dsh-iui-button.is-secondary { color:var(--iui-text); border-color:var(--iui-border); background:var(--iui-bg); }
.dsh-iui button:hover:not(:disabled) { filter:brightness(.95); }
.dsh-iui :is(input,select,button,summary):focus-visible, .dsh-iui-starter button:focus-visible { outline:2px solid var(--iui-brand); outline-offset:3px; }
.dsh-iui :disabled, .dsh-iui-starter :disabled { opacity:.55; cursor:not-allowed; }
.dsh-iui .dsh-iui-chart { margin:0; min-width:0; }
.dsh-iui .dsh-iui-chart figcaption { font-size:13px; font-weight:600; margin-bottom:15px; }
.dsh-iui .dsh-iui-chart svg { display:block; width:100%; height:auto; overflow:visible; }
.dsh-iui .dsh-iui-chart svg text { font-size:12px; fill:var(--iui-muted); }
.dsh-iui .dsh-iui-chart-grid { stroke:var(--iui-border); stroke-width:1; }
.dsh-iui .dsh-iui-chart-bar, .dsh-iui .dsh-iui-chart-dot { fill:var(--iui-brand); }
.dsh-iui .dsh-iui-chart-bar.is-negative { fill:var(--iui-error); }
.dsh-iui .dsh-iui-chart-line { stroke:var(--iui-brand); stroke-width:3; stroke-linejoin:round; stroke-linecap:round; }
.dsh-iui .dsh-iui-table-wrap { min-width:0; }
.dsh-iui .dsh-iui-table-filter { display:flex; gap:12px; align-items:center; margin-bottom:14px; font-size:12px; color:var(--iui-muted); }
.dsh-iui .dsh-iui-table-filter input { max-width:280px; }
.dsh-iui .dsh-iui-table-scroll { overflow:auto; max-height:450px; border:1px solid var(--iui-border); border-radius:9px; }
.dsh-iui table { width:100%; border-collapse:collapse; font-size:13px; text-align:left; }
.dsh-iui th { position:sticky; top:0; background:var(--iui-surface); color:var(--iui-muted); font-size:12px; }
.dsh-iui th button { width:100%; text-align:left; white-space:nowrap; padding:11px 14px; border:0; background:transparent; color:inherit; font-size:inherit; }
.dsh-iui th button span { margin-left:6px; color:var(--iui-brand); }
.dsh-iui td { padding:12px 14px; border-top:1px solid var(--iui-border); overflow-wrap:anywhere; font-variant-numeric:tabular-nums; }
.dsh-iui tbody tr:hover { background:var(--iui-surface); }
.dsh-iui .dsh-iui-list { margin:0; padding-left:22px; display:flex; flex-direction:column; gap:8px; font-size:14px; overflow-wrap:anywhere; }
.dsh-iui .dsh-iui-footer { display:flex; align-items:center; gap:12px; margin-top:18px; color:var(--iui-muted); font-size:12px; }
.dsh-iui .dsh-iui-footer button { padding:5px 9px; border:1px solid var(--iui-border); border-radius:6px; color:var(--iui-muted); background:var(--iui-bg); font-size:12px; }
.dsh-iui .dsh-iui-source { margin-top:14px; border-top:1px solid var(--iui-border); padding-top:10px; color:var(--iui-muted); font-size:12px; }
.dsh-iui .dsh-iui-source summary { cursor:pointer; width:fit-content; }
.dsh-iui .dsh-iui-source pre, .dsh-iui .dsh-iui-error pre { white-space:pre-wrap; overflow-wrap:anywhere; font-size:11px; max-height:320px; overflow:auto; padding:12px; border-radius:8px; background:var(--iui-surface); }
.dsh-iui .dsh-iui-error { color:var(--iui-error); }
.dsh-iui-starter { display:flex; gap:8px; align-items:center; }
.dsh-iui-starter button { font:inherit; font-size:12px; padding:5px 10px; background:var(--iui-bg); color:var(--iui-brand); border:1px solid var(--iui-border); border-radius:7px; cursor:pointer; }
.dsh-iui-starter [role=status] { font-size:11px; color:var(--iui-muted); }
@container (max-width:560px) { .dsh-iui .dsh-iui-grid { grid-template-columns:1fr; } .dsh-iui .dsh-iui-card { padding:15px; } .dsh-iui .dsh-iui-metric strong { font-size:26px; } .dsh-iui .dsh-iui-table-filter { align-items:flex-start; flex-direction:column; } .dsh-iui .dsh-iui-table-filter input { max-width:none; } }
@media (max-width:600px) { .dsh-iui { padding:14px; border-radius:13px; } }
`;
