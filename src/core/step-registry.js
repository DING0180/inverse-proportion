import { DEFAULT_RENDERERS } from '../lessons/renderers.js';

const noop = () => {};

export function createStepRegistry({ withDefaults = false } = {}) {
  const renderers = new Map(withDefaults ? Object.entries(DEFAULT_RENDERERS) : []);
  return {
    register(name, renderer) { if (!name || typeof renderer !== 'function') throw new TypeError('Renderer registration is invalid'); renderers.set(name, renderer); return this; },
    has: (name) => renderers.has(name),
    render(step, context = {}) {
      const renderer = renderers.get(step.renderer);
      if (!renderer) throw new Error(`Unknown renderer: ${step.renderer}`);
      const result = renderer(step, context) ?? {};
      if (!(result.element instanceof HTMLElement)) throw new TypeError(`${step.renderer} did not return an element`);
      return { element: result.element, reset: result.reset ?? noop, reveal: result.reveal ?? noop, destroy: result.destroy ?? noop, teacherActions: result.teacherActions ?? {} };
    },
  };
}
