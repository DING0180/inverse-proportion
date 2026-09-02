import { sampleInverseBranches } from '../math/inverse-math.js';
import { createCartesianGraph } from './cartesian-graph.js';

const clone = (value) => globalThis.structuredClone ? structuredClone(value) : JSON.parse(JSON.stringify(value));

export function createInverseGraph(stage, config = {}) {
  const canvas = config.canvas ?? stage.querySelector('canvas');
  if (!canvas) throw new Error('Inverse graph requires a canvas');
  if (!Number.isFinite(config.k ?? 6) || (config.k ?? 6) === 0) throw new RangeError('k must be non-zero');
  const initial = {
    k: config.k ?? 6,
    line: null,
    threshold: null,
    layers: { grid: true, curve: true, points: true, helpers: true, regions: true },
    ghosts: [],
    regions: [],
    points: {},
  };
  let state = clone(initial);
  const core = createCartesianGraph(canvas, config);

  const buildSeries = () => {
    const series = [];
    if (state.layers.curve) series.push({ id: 'inverse', type: 'inverse', paths: sampleInverseBranches(state.k, { xMin: config.xRange?.[0] ?? -10, xMax: config.xRange?.[1] ?? 10, yMin: config.yRange?.[0] ?? -10, yMax: config.yRange?.[1] ?? 10, epsilon: 0.05 }), color: '#0b9aa3', width: 3.5 });
    state.ghosts.forEach((ghost, index) => series.push({ id: `ghost-${index}`, paths: sampleInverseBranches(ghost.k, { xMin: config.xRange?.[0] ?? -10, xMax: config.xRange?.[1] ?? 10, yMin: config.yRange?.[0] ?? -10, yMax: config.yRange?.[1] ?? 10, epsilon: 0.05 }), color: ghost.color ?? '#8da2bf', width: 2, dash: [6, 7] }));
    if (state.line) series.push({ id: 'line', type: 'line', ...state.line, color: '#ff623e', width: 2.5 });
    return series;
  };

  const render = () => core.setScene({
    series: buildSeries(),
    points: state.layers.points ? Object.entries(state.points).map(([id, point]) => ({ id, ...point, label: `(${Number(point.x.toFixed(2))}, ${Number(point.y.toFixed(2))})` })) : [],
    helpers: state.threshold && state.layers.helpers ? [{ type: 'threshold', ...state.threshold }] : [],
    regions: state.layers.regions ? state.regions : [],
  });

  render();
  return {
    setK(k) {
      if (!Number.isFinite(k) || k === 0) throw new RangeError('k must be non-zero');
      state.k = k;
      Object.values(state.points).forEach((point) => { point.y = k / point.x; point.branch = Math.sign(point.x); });
      render();
    },
    setLine(line) { state.line = line ? { m: Number(line.m), b: Number(line.b) } : null; render(); },
    setPointX(id, value) {
      if (!Number.isFinite(value) || value === 0) return;
      const existing = state.points[id];
      const branch = existing?.branch ?? Math.sign(value);
      const x = branch * Math.max(Math.abs(value), 0.08);
      state.points[id] = { x, y: state.k / x, branch };
      render();
    },
    setThreshold(threshold) { state.threshold = threshold ? { axis: threshold.axis, value: Number(threshold.value) } : null; render(); },
    setLayers(next) { state.layers = { ...state.layers, ...next }; render(); },
    setGhosts(curves = []) { state.ghosts = curves.filter(({ k }) => Number.isFinite(k) && k !== 0).map((curve) => ({ ...curve })); render(); },
    setRegions(regions = []) { state.regions = clone(regions); render(); },
    reset() { state = clone(initial); render(); },
    getState: () => clone(state),
    getSnapshot: core.getSnapshot,
    toScreen: core.toScreen,
    toGraph: core.toGraph,
    resize: core.resize,
    destroy: core.destroy,
  };
}
