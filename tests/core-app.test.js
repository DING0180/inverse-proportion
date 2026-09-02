import { describe, expect, it, vi } from 'vitest';
import { parseHash, routeToHash } from '../src/core/router.js';
import { createStepRegistry } from '../src/core/step-registry.js';
import { COURSE } from '../src/core/course-data.js';

describe('hash routing', () => {
  it('parses and serializes lesson routes', () => {
    expect(parseHash('#/lesson/02/step/04')).toEqual({ lessonId: '02', stepNumber: '04' });
    expect(parseHash('#/bad')).toEqual({ lessonId: '01', stepNumber: '01' });
    expect(routeToHash({ lessonId: '5', stepNumber: '21' })).toBe('#/lesson/05/step/21');
  });
});

describe('step registry', () => {
  it('normalizes the renderer lifecycle contract', () => {
    const registry = createStepRegistry();
    const destroy = vi.fn();
    registry.register('example', () => ({ element: document.createElement('section'), destroy }));
    const handle = registry.render({ renderer: 'example' }, {});
    expect(handle.element).toBeInstanceOf(HTMLElement);
    expect(handle.teacherActions).toEqual({});
    expect(() => handle.reset()).not.toThrow();
    handle.destroy();
    expect(destroy).toHaveBeenCalledOnce();
  });

  it('knows every renderer used by the 90-step manifest', () => {
    const registry = createStepRegistry({ withDefaults: true });
    const names = new Set(COURSE.lessons.flatMap((lesson) => lesson.steps.map((step) => step.renderer)));
    for (const name of names) expect(registry.has(name)).toBe(true);
  });
});
