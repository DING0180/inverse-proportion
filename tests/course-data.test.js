import { describe, expect, it } from 'vitest';
import { COURSE, getStepByRoute, validateCourse } from '../src/core/course-data.js';

describe('course manifest', () => {
  it('locks five lessons and the approved 90-step distribution', () => {
    expect(COURSE.lessons.map((lesson) => lesson.steps.length)).toEqual([15, 19, 17, 18, 21]);
    expect(COURSE.lessons.flatMap((lesson) => lesson.steps)).toHaveLength(90);
  });

  it('locks the approved primary type totals', () => {
    const totals = COURSE.lessons.flatMap((lesson) => lesson.steps).reduce((result, step) => {
      result[step.kind] = (result[step.kind] ?? 0) + 1;
      return result;
    }, {});
    expect(totals).toEqual({ explanation: 15, animation: 19, lab: 48, 'quick-check': 8 });
  });

  it('requires unique ids, complete PPT provenance and renderers', () => {
    expect(validateCourse(COURSE)).toEqual({ valid: true, errors: [] });
    const all = COURSE.lessons.flatMap((lesson) => lesson.steps);
    expect(new Set(all.map((step) => step.id)).size).toBe(90);
    for (const step of all) {
      expect(step.ppt.deck).toMatch(/^L0[1-5]$/);
      expect(step.ppt.slides.length).toBeGreaterThan(0);
      expect(step.ppt.concept.length).toBeGreaterThan(0);
      expect(typeof step.renderer).toBe('string');
    }
  });

  it('resolves routes deterministically', () => {
    expect(getStepByRoute('02', '04').title).toBe('k>0 与 k<0');
    expect(getStepByRoute('05', '21').title).toBe('Effective Window');
    expect(getStepByRoute('99', '01')).toBeNull();
  });
});
