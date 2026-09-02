import { describe, expect, it } from 'vitest';
import { createClassroomApp } from '../src/core/classroom-app.js';
import { COURSE } from '../src/core/course-data.js';
import { createStepRegistry } from '../src/core/step-registry.js';

describe('Classroom shell and lesson engine', () => {
  it('renders a course home with a start action and five lesson entrances', () => {
    const root = document.createElement('div');
    const app = createClassroomApp({ root, course: COURSE, registry: createStepRegistry({ withDefaults: true }), initialRoute: { page: 'home' }, useHashRouter: false });
    expect(root.querySelector('[data-course-home]')).not.toBeNull();
    expect(root.querySelector('[data-action="start-learning"]')).not.toBeNull();
    expect(root.querySelectorAll('[data-course-home] [data-route]').length).toBe(5);
    root.querySelector('[data-action="start-learning"]').click();
    expect(root.querySelector('[data-step-id="L01-S01"]')).not.toBeNull();
    app.destroy();
  });

  it('renders the current step with a centered seven-step rail', () => {
    const root = document.createElement('div');
    const app = createClassroomApp({ root, course: COURSE, registry: createStepRegistry({ withDefaults: true }), initialRoute: { lessonId: '02', stepNumber: '04' }, useHashRouter: false });
    expect(root.querySelector('[data-current-step]').textContent).toContain('04 / 19');
    expect(root.querySelector('.step-rail__item.is-current').textContent).toContain('04');
    expect(root.querySelectorAll('.step-rail__item').length).toBeLessThanOrEqual(8);
    expect(root.querySelector('[data-step-id="L02-S04"]')).not.toBeNull();
    app.destroy();
  });

  it('moves across lesson boundaries and exposes Teacher Mode', () => {
    const root = document.createElement('div');
    const app = createClassroomApp({ root, course: COURSE, registry: createStepRegistry({ withDefaults: true }), initialRoute: { lessonId: '01', stepNumber: '15' }, useHashRouter: false });
    root.querySelector('[data-action="next"]').click();
    expect(root.querySelector('[data-step-id="L02-S01"]')).not.toBeNull();
    root.querySelector('[data-action="teacher-mode"]').click();
    expect(root.querySelector('.teacher-panel').hidden).toBe(false);
    expect(root.querySelectorAll('.teacher-panel [data-route]').length).toBe(90);
    app.destroy();
  });
});
