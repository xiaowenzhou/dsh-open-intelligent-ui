import React, { createContext, useContext, useId, useMemo, useState } from 'react';
import { action, createLibrary, defineComponent, defineFunction, reactive, useIsStreaming, useStateField, useTriggerAction } from '@openuidev/react-lang';
import { z } from 'zod/v4';

const I18n = createContext(key => ({ filter: 'Filter rows', empty: 'No matching rows', chart: 'Chart' }[key] ?? key));
export function LibraryI18nProvider({ t, children }) { return <I18n.Provider value={t}>{children}</I18n.Provider>; }
const text = z.string().max(4000);
const short = z.string().max(160);
const tone = z.enum(['default', 'muted', 'success', 'warning', 'error', 'brand']);
const scalar = z.union([text, z.number(), z.boolean(), z.null()]);
// Recursive layout refs cannot be declared before all layouts exist; the Host validates every AST component name.
const children = z.array(z.any()).max(80).describe('Component references or inline components; no raw HTML.');
const finite = (value, fallback = 0) => typeof value === 'number' && Number.isFinite(value) ? value : fallback;
const plain = value => value == null ? '' : ['string', 'number', 'boolean'].includes(typeof value) ? String(value).slice(0, 4000) : '';
const safeTone = value => ['muted', 'success', 'warning', 'error', 'brand'].includes(value) ? value : 'default';
const gapStyle = gap => ({ gap: `${Math.min(32, Math.max(0, finite(gap, 16)))}px` });
const renderChildren = (value, renderNode) => (Array.isArray(value) ? value.slice(0, 80) : []).map((child, index) => <React.Fragment key={index}>{renderNode(child)}</React.Fragment>);

const Dashboard = defineComponent({
  name: 'Dashboard', props: z.object({ children }),
  description: 'Dashboard(children). Required root. children is an array of layout/component references, max 80.',
  component: ({ props, renderNode }) => <div className="dsh-iui-dashboard">{renderChildren(props.children, renderNode)}</div>,
});
const Card = defineComponent({
  name: 'Card', props: z.object({ title: short, children, subtitle: text.optional() }),
  description: 'Card(title, children, subtitle?). Bordered section with title, child components and optional subtitle.',
  component: ({ props, renderNode }) => <section className="dsh-iui-card"><header><h3>{plain(props.title)}</h3>{props.subtitle && <p>{plain(props.subtitle)}</p>}</header><div className="dsh-iui-col">{renderChildren(props.children, renderNode)}</div></section>,
});
const Col = defineComponent({
  name: 'Col', props: z.object({ children, gap: z.number().min(0).max(32).optional() }),
  description: 'Col(children, gap?). Vertical layout; gap in pixels, default 16, range 0–32.',
  component: ({ props, renderNode }) => <div className="dsh-iui-col" style={gapStyle(props.gap)}>{renderChildren(props.children, renderNode)}</div>,
});
const Row = defineComponent({
  name: 'Row', props: z.object({ children, gap: z.number().min(0).max(32).optional() }),
  description: 'Row(children, gap?). Wrapping horizontal layout; gap in pixels, default 16, range 0–32.',
  component: ({ props, renderNode }) => <div className="dsh-iui-row" style={gapStyle(props.gap)}>{renderChildren(props.children, renderNode)}</div>,
});
const Grid = defineComponent({
  name: 'Grid', props: z.object({ children, columns: z.number().int().min(1).max(4).optional() }),
  description: 'Grid(children, columns?). Responsive equal columns, default 2, range 1–4; stacks on narrow screens.',
  component: ({ props, renderNode }) => <div className="dsh-iui-grid" style={{ '--iui-columns': Math.round(Math.max(1, Math.min(4, finite(props.columns, 2)))) }}>{renderChildren(props.children, renderNode)}</div>,
});
const Text = defineComponent({
  name: 'Text', props: z.object({ text, tone: tone.optional() }),
  description: 'Text(text, tone?). Plain text only, max 4000 characters. tone default/muted/success/warning/error/brand; default default.',
  component: ({ props }) => <p className={`dsh-iui-text dsh-iui-tone-${safeTone(props.tone)}`}>{plain(props.text)}</p>,
});
const Title = defineComponent({
  name: 'Title', props: z.object({ text: short, level: z.number().int().min(2).max(4).optional() }),
  description: 'Title(text, level?). Heading with max 160 characters; heading level 2–4, default 2.',
  component: ({ props }) => { const Tag = `h${Math.round(Math.max(2, Math.min(4, finite(props.level, 2))))}`; return <Tag className="dsh-iui-title">{plain(props.text)}</Tag>; },
});
const Metric = defineComponent({
  name: 'Metric', props: z.object({ label: short, value: z.union([text, z.number()]), detail: text.optional(), tone: tone.optional() }),
  description: 'Metric(label, value, detail?, tone?). Large number/text value; optional supporting detail and default/muted/success/warning/error/brand tone, default default.',
  component: ({ props }) => <div className="dsh-iui-metric"><span className="dsh-iui-label">{plain(props.label)}</span><strong className={`dsh-iui-tone-${safeTone(props.tone)}`}>{plain(props.value)}</strong>{props.detail && <small>{plain(props.detail)}</small>}</div>,
});
const Badge = defineComponent({
  name: 'Badge', props: z.object({ text: short, tone: tone.optional() }),
  description: 'Badge(text, tone?). Compact plain-text status; tone default/muted/success/warning/error/brand, default default.',
  component: ({ props }) => <span className={`dsh-iui-badge dsh-iui-tone-${safeTone(props.tone)}`}>{plain(props.text)}</span>,
});
const Divider = defineComponent({ name: 'Divider', props: z.object({}), description: 'Divider(). Horizontal separator; no parameters.', component: () => <hr className="dsh-iui-divider"/> });

function InputView({ props, statementId }) {
  const id = useId();
  const field = useStateField(statementId ?? id, props.value);
  const streaming = useIsStreaming();
  return <label className="dsh-iui-field"><span>{plain(props.label)}</span><input type="text" name={field.name} value={plain(field.value)} maxLength={4000} placeholder={plain(props.placeholder)} disabled={streaming} onChange={event => field.setValue(event.target.value)}/></label>;
}
const Input = defineComponent({
  name: 'Input', props: z.object({ label: short, value: reactive(z.string().max(4000)), placeholder: short.optional() }),
  description: 'Input(label, value, placeholder?). Text input; bind value using $variable for live updates. Optional placeholder, default empty. Disabled during streaming.', component: InputView,
});
function NumericView({ props, statementId, slider = false }) {
  const id = useId();
  const field = useStateField(statementId ?? id, props.value);
  const streaming = useIsStreaming();
  const min = typeof props.min === 'number' ? finite(props.min) : slider ? 0 : undefined;
  const max = typeof props.max === 'number' ? Math.max(min ?? -Infinity, finite(props.max)) : slider ? 100 : undefined;
  const step = Math.max(0.001, finite(props.step, 1));
  const clamp = value => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, finite(value)));
  const value = clamp(finite(field.value, min ?? 0));
  return <label className={`dsh-iui-field ${slider ? 'dsh-iui-slider' : ''}`}><span>{plain(props.label)}{slider && <output>{value}</output>}</span><input type={slider ? 'range' : 'number'} name={field.name} value={value} min={min} max={max} step={step} disabled={streaming} onChange={event => field.setValue(clamp(event.target.valueAsNumber))}/></label>;
}
const NumberInput = defineComponent({
  name: 'NumberInput', props: z.object({ label: short, value: reactive(z.number()), min: z.number().optional(), max: z.number().optional(), step: z.number().positive().optional() }),
  description: 'NumberInput(label, value, min?, max?, step?). Editable finite number, value may bind a $variable. Bounds optional, step default 1. Disabled during streaming.', component: NumericView,
});
const Slider = defineComponent({
  name: 'Slider', props: z.object({ label: short, value: reactive(z.number()), min: z.number().optional(), max: z.number().optional(), step: z.number().positive().optional() }),
  description: 'Slider(label, value, min?, max?, step?). Numeric range with displayed value; bind $variable. Defaults min 0, max 100, step 1. Disabled during streaming.', component: componentProps => <NumericView {...componentProps} slider/>,
});
function CheckboxView({ props, statementId }) {
  const id = useId();
  const field = useStateField(statementId ?? id, props.value);
  const streaming = useIsStreaming();
  return <label className={`dsh-iui-checkbox ${field.value === true ? 'is-checked' : ''}`}><input type="checkbox" name={field.name} checked={field.value === true} disabled={streaming} onChange={event => field.setValue(event.target.checked)}/><span>{plain(props.label)}</span></label>;
}
const Checkbox = defineComponent({
  name: 'Checkbox', props: z.object({ label: short, value: reactive(z.boolean()) }),
  description: 'Checkbox(label, value). Boolean checkbox; bind value to a $variable to update dependent components. Disabled during streaming.', component: CheckboxView,
});
function SelectView({ props, statementId }) {
  const id = useId();
  const field = useStateField(statementId ?? id, props.value);
  const streaming = useIsStreaming();
  const options = (Array.isArray(props.options) ? props.options : []).slice(0, 80);
  return <label className="dsh-iui-field"><span>{plain(props.label)}</span><select name={field.name} value={plain(field.value)} disabled={streaming} onChange={event => field.setValue(event.target.value)}>{options.map((option, index) => <option key={index} value={plain(option.value)}>{plain(option.label)}</option>)}</select></label>;
}
const Select = defineComponent({
  name: 'Select', props: z.object({ label: short, value: reactive(z.string().max(160)), options: z.array(z.object({ label: short, value: short })).min(1).max(80) }),
  description: 'Select(label, value, options). Single choice; value may bind a $variable. options is [{label: string, value: string}], 1–80 entries. Disabled during streaming.', component: SelectView,
});
function ButtonView({ props }) {
  const streaming = useIsStreaming();
  const trigger = useTriggerAction();
  return <button type="button" className={`dsh-iui-button ${props.variant === 'secondary' ? 'is-secondary' : ''}`} disabled={streaming} onClick={() => trigger(plain(props.label), undefined, props.action)}>{plain(props.label)}</button>;
}
const Button = defineComponent({
  name: 'Button', props: z.object({ label: short, action: action().optional(), variant: z.enum(['primary', 'secondary']).optional() }),
  description: 'Button(label, action?, variant?). Action only @Set($variable,value), @Reset($variable), @ToAssistant(message,context?) or Action([...]) combining those. Missing action sends label to assistant. variant primary/secondary, default primary; disabled during streaming.', component: ButtonView,
});

function ChartView({ props }) {
  const t = useContext(I18n);
  const id = useId();
  const data = (Array.isArray(props.data) ? props.data : []).slice(0, 80).map(item => ({ label: plain(item.label).slice(0, 160), value: finite(item.value) }));
  const min = Math.min(0, ...data.map(item => item.value));
  const max = Math.max(0, ...data.map(item => item.value));
  const span = max - min || 1;
  const x = value => 145 + (value - min) / span * 390;
  const zero = x(0);
  const line = props.type === 'line';
  const height = line ? 240 : Math.max(90, data.length * 36 + 24);
  const pointX = index => 48 + index * 500 / Math.max(1, data.length - 1);
  const pointY = value => 184 - (value - min) / span * 150;
  const title = plain(props.title) || t('chart');
  const unit = plain(props.unit).slice(0, 40);
  return <figure className="dsh-iui-chart"><figcaption>{title}</figcaption>{data.length ? <svg viewBox={`0 0 600 ${height}`} role="img" aria-labelledby={id}><title id={id}>{`${title}: ${data.map(item => `${item.label}: ${item.value}${unit}`).join('; ')}`}</title>{line ? <>
    {[0, 1, 2].map(index => <line key={index} className="dsh-iui-chart-grid" x1="48" x2="548" y1={34 + index * 75} y2={34 + index * 75}/>)}
    <polyline className="dsh-iui-chart-line" points={data.map((item, index) => `${pointX(index)},${pointY(item.value)}`).join(' ')} fill="none"/>
    {data.map((item, index) => <g key={index}><circle className="dsh-iui-chart-dot" cx={pointX(index)} cy={pointY(item.value)} r="4"><title>{`${item.label}: ${item.value}${unit}`}</title></circle>{(data.length <= 8 || index === 0 || index === data.length - 1) && <text x={pointX(index)} y="212" textAnchor="middle">{item.label.slice(0, 12)}</text>}</g>)}
    <text x="5" y="38">{max}</text><text x="5" y="184">{min}</text>
  </> : <>
    <line className="dsh-iui-chart-grid" x1={zero} x2={zero} y1="8" y2={height - 8}/>
    {data.map((item, index) => <g key={index}><text x="0" y={index * 36 + 30}>{item.label.slice(0, 20)}</text><rect className={`dsh-iui-chart-bar ${item.value < 0 ? 'is-negative' : ''}`} x={Math.min(zero, x(item.value))} y={index * 36 + 12} width={Math.max(1, Math.abs(x(item.value) - zero))} height="24" rx="4"/><text x="545" y={index * 36 + 30}>{item.value}{unit}</text></g>)}
  </>}</svg> : <p className="dsh-iui-muted">{t('empty')}</p>}</figure>;
}
const Chart = defineComponent({
  name: 'Chart', props: z.object({ title: short, type: z.enum(['bar', 'line']), data: z.array(z.object({ label: short, value: z.number() })).max(80), unit: z.string().max(40).optional() }),
  description: 'Chart(title, type, data, unit?). Accessible SVG bar or line chart. data=[{label:string,value:number}], max 80 points; supports reactive values and negative numbers. Optional unit suffix, default empty.', component: ChartView,
});
function TableView({ props }) {
  const t = useContext(I18n);
  const streaming = useIsStreaming();
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState({ column: -1, direction: 1 });
  const columns = (Array.isArray(props.columns) ? props.columns : []).slice(0, 12);
  const rows = useMemo(() => {
    const query = filter.trim().toLocaleLowerCase();
    const result = (Array.isArray(props.rows) ? props.rows : []).slice(0, 200).filter(row => Array.isArray(row) && (!query || row.some(cell => plain(cell).toLocaleLowerCase().includes(query))));
    if (sort.column < 0) return result;
    return result.map((row, index) => ({ row, index })).sort((a, b) => {
      const av = a.row[sort.column]; const bv = b.row[sort.column];
      const compared = typeof av === 'number' && typeof bv === 'number' ? finite(av) - finite(bv) : plain(av).localeCompare(plain(bv), undefined, { numeric: true });
      return compared * sort.direction || a.index - b.index;
    }).map(item => item.row);
  }, [props.rows, filter, sort]);
  return <div className="dsh-iui-table-wrap">{props.filterable !== false && <label className="dsh-iui-table-filter"><span>{t('filter')}</span><input type="search" value={filter} maxLength={160} disabled={streaming} onChange={event => setFilter(event.target.value)}/></label>}<div className="dsh-iui-table-scroll"><table><thead><tr>{columns.map((column, index) => <th key={index} scope="col" aria-sort={sort.column === index ? sort.direction === 1 ? 'ascending' : 'descending' : 'none'}><button type="button" disabled={streaming} onClick={() => setSort(current => ({ column: index, direction: current.column === index ? -current.direction : 1 }))}>{plain(column)} <span aria-hidden="true">{sort.column === index ? sort.direction === 1 ? '↑' : '↓' : '↕'}</span></button></th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{columns.map((_, column) => <td key={column}>{plain(row[column])}</td>)}</tr>)}</tbody></table></div>{!rows.length && <p role="status" className="dsh-iui-muted">{t('empty')}</p>}</div>;
}
const Table = defineComponent({
  name: 'Table', props: z.object({ columns: z.array(short).min(1).max(12), rows: z.array(z.array(scalar).max(12)).max(200), filterable: z.boolean().optional() }),
  description: 'Table(columns, rows, filterable?). columns=[heading strings], 1–12; rows=[[string/number/boolean/null cells]], max 200. All headings support ascending/descending sort, searchable by default; filterable false hides search. Interactions disabled during streaming.', component: TableView,
});
const List = defineComponent({
  name: 'List', props: z.object({ items: z.array(text).max(80), ordered: z.boolean().optional() }),
  description: 'List(items, ordered?). Plain-text list, max 80 items; ordered false by default, true uses numbered steps.',
  component: ({ props }) => { const Tag = props.ordered ? 'ol' : 'ul'; return <Tag className="dsh-iui-list">{(Array.isArray(props.items) ? props.items : []).slice(0, 80).map((item, index) => <li key={index}>{plain(item)}</li>)}</Tag>; },
});

export const components = [Dashboard, Card, Col, Row, Grid, Text, Title, Metric, Badge, Divider, Input, NumberInput, Slider, Checkbox, Select, Button, Chart, Table, List];
export const functions = [defineFunction({
  name: 'Format', description: '@Format(value, prefix?, digits?). Finite number formatted with comma grouping; optional prefix default empty, fraction digits 0–4 default 0. No locale, network or arbitrary code.',
  params: z.object({ value: z.number(), prefix: z.string().max(40).optional(), digits: z.number().int().min(0).max(4).optional() }), returns: z.string().max(300),
  fn: ({ value, prefix = '', digits = 0 }) => `${plain(prefix).slice(0, 40)}${finite(value).toLocaleString('en-US', { minimumFractionDigits: Math.max(0, Math.min(4, digits)), maximumFractionDigits: Math.max(0, Math.min(4, digits)) })}`,
})];
export const library = createLibrary({ components, functions, root: 'Dashboard' });
