import { describe, expect, it } from 'vitest';
import { COURSE } from '../src/core/course-data.js';
import { createStepRegistry } from '../src/core/step-registry.js';

describe('all lesson renderers', () => {
  it('renders and destroys all 90 steps with a consistent handle', () => {
    const registry = createStepRegistry({ withDefaults: true });
    for (const lesson of COURSE.lessons) {
      for (const step of lesson.steps) {
        const handle = registry.render(step, { lesson });
        expect(handle.element.dataset.stepId).toBe(step.id);
        expect(handle.element.querySelector('[data-main-question]')).not.toBeNull();
        expect(handle.element.querySelector('[data-ppt-source]')?.textContent).toContain(`PPT`);
        handle.reset();
        handle.reveal();
        handle.destroy();
      }
    }
  });

  it('quick checks support retry and New Challenge', () => {
    const registry = createStepRegistry({ withDefaults: true });
    const lesson = COURSE.lessons[0];
    const step = lesson.steps[6];
    const handle = registry.render(step, { lesson });
    expect(handle.element.querySelector('[data-action="new-challenge"]')).not.toBeNull();
    expect(handle.element.querySelector('[data-action="retry"]')).not.toBeNull();
    handle.destroy();
  });
});
