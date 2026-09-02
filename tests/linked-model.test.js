import { describe, expect, it, vi } from 'vitest';
import { createLinkedModel } from '../src/interactions/linked-model.js';

describe('Reality ↔ Equation ↔ Graph linked model', () => {
  it('derives once and gives every view the same snapshot in one update', async () => {
    const derive = vi.fn((state) => ({ x: state.independentValue, y: state.constant / state.independentValue }));
    const reality = vi.fn();
    const equation = vi.fn();
    const graph = vi.fn();
    const model = createLinkedModel({
      initialState: { independentValue: 4, constant: 12 },
      reducer: (state, action) => ({ ...state, independentValue: action.value }),
      derive,
      views: { reality, equation, graph },
    });
    model.dispatch({ type: 'set-x', value: 6 });
    await new Promise((resolve) => setTimeout(resolve, 5));
    expect(derive).toHaveBeenCalledTimes(2);
    expect(reality.mock.lastCall[0]).toEqual({ x: 6, y: 2 });
    expect(equation.mock.lastCall[0]).toBe(reality.mock.lastCall[0]);
    expect(graph.mock.lastCall[0]).toBe(reality.mock.lastCall[0]);
    model.destroy();
  });

  it('reset restores the precise initial state', async () => {
    const snapshots = [];
    const model = createLinkedModel({
      initialState: { independentValue: 3, constant: 9 },
      reducer: (state, action) => ({ ...state, independentValue: action.value }),
      derive: (state) => ({ ...state }),
      views: { reality: (snapshot) => snapshots.push(snapshot) },
    });
    model.dispatch({ type: 'set-x', value: 6 });
    model.reset();
    await new Promise((resolve) => setTimeout(resolve, 5));
    expect(model.getState()).toEqual({ independentValue: 3, constant: 9 });
    model.destroy();
  });
});
