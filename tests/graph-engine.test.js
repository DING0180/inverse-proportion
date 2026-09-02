import { describe, expect, it, vi } from 'vitest';
import { createCartesianGraph } from '../src/graph/cartesian-graph.js';
import { createInverseGraph } from '../src/graph/inverse-graph.js';

function makeCanvas(width = 800, height = 500) {
  const context = new Proxy({}, { get: (target, key) => target[key] ?? vi.fn() });
  const canvas = document.createElement('canvas');
  canvas.getContext = () => context;
  canvas.getBoundingClientRect = () => ({ width, height, left: 0, top: 0, right: width, bottom: height });
  Object.defineProperty(canvas, 'clientWidth', { value: width });
  Object.defineProperty(canvas, 'clientHeight', { value: height });
  return { canvas, context };
}

describe('Cartesian graph core', () => {
  it('uses one reversible coordinate transform', () => {
    const { canvas } = makeCanvas();
    const graph = createCartesianGraph(canvas, { xRange: [-10, 10], yRange: [-5, 5], padding: 40 });
    const pixel = graph.toScreen({ x: 3, y: -2 });
    const point = graph.toGraph(pixel);
    expect(point.x).toBeCloseTo(3, 5);
    expect(point.y).toBeCloseTo(-2, 5);
    graph.destroy();
  });

  it('stores series, helpers and regions in a serializable snapshot', () => {
    const { canvas } = makeCanvas();
    const graph = createCartesianGraph(canvas, { xRange: [-10, 10], yRange: [-10, 10] });
    graph.setScene({ series: [{ id: 'line', type: 'line', m: 1, b: 0 }], points: [{ id: 'p', x: 2, y: 2 }], helpers: [], regions: [] });
    expect(graph.getSnapshot().scene.points[0]).toEqual({ id: 'p', x: 2, y: 2 });
    graph.destroy();
  });

  it('supports independent x/y tick steps for mixed-unit reality models', () => {
    const { canvas } = makeCanvas();
    const graph = createCartesianGraph(canvas, { xRange: [0, 12], yRange: [0, 200], xTickStep: 2, yTickStep: 20 });
    expect(graph.getSnapshot().config).toMatchObject({ xTickStep: 2, yTickStep: 20 });
    graph.destroy();
  });
});

describe('inverse graph adapter', () => {
  it('rejects k=0 and keeps draggable points on their branch', () => {
    const { canvas } = makeCanvas();
    const stage = document.createElement('div');
    stage.append(canvas);
    const graph = createInverseGraph(stage, { canvas, k: 6, xRange: [-10, 10], yRange: [-10, 10] });
    expect(() => graph.setK(0)).toThrow(/k/);
    graph.setPointX('focus', 3);
    expect(graph.getState().points.focus).toEqual({ x: 3, y: 2, branch: 1 });
    graph.setPointX('focus', -3);
    expect(graph.getState().points.focus.x).toBeGreaterThan(0);
    graph.destroy();
  });

  it('supports lines, thresholds, layers, ghosts and reset', () => {
    const { canvas } = makeCanvas();
    const stage = document.createElement('div');
    stage.append(canvas);
    const graph = createInverseGraph(stage, { canvas, k: -8, xRange: [-10, 10], yRange: [-10, 10] });
    graph.setLine({ m: 1, b: 2 });
    graph.setThreshold({ axis: 'y', value: 4 });
    graph.setLayers({ grid: false, points: true });
    graph.setGhosts([{ k: -4 }, { k: -12 }]);
    expect(graph.getState()).toMatchObject({ k: -8, line: { m: 1, b: 2 }, threshold: { axis: 'y', value: 4 } });
    graph.reset();
    expect(graph.getState().ghosts).toEqual([]);
    graph.destroy();
  });
});
