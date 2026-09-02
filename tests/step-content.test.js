import { describe, expect, it } from 'vitest';
import { COURSE } from '../src/core/course-data.js';
import { getScenarioConfig } from '../src/lessons/step-content.js';

const step = (lesson, number) => COURSE.lessons[lesson - 1].steps[number - 1];

describe('lesson-specific reality scenarios', () => {
  it('maps the gas pressure experiment and safety zone to pV=96', () => {
    expect(getScenarioConfig(step(5, 3))).toMatchObject({ scenario: '气体压力', constant: 96 });
    expect(getScenarioConfig(step(5, 4))).toMatchObject({ scenario: '气体压力', constant: 96, maxY: 140 });
  });

  it('keeps lever, repayment and pinhole units explicit', () => {
    expect(getScenarioConfig(step(4, 4))).toMatchObject({ constant: 800, units: { x: 'm', y: 'N' } });
    expect(getScenarioConfig(step(4, 10))).toMatchObject({ constant: 14, units: { x: '个月', y: '万元' } });
    expect(getScenarioConfig(step(5, 7))).toMatchObject({ constant: 24, units: { x: 'cm', y: 'cm' } });
  });
});
