import { describe, expect, it } from 'vitest';
import {
  evaluateInverse,
  getAreaFromK,
  getInverseBranches,
  getInverseMonotonicity,
  intersectInverseWithLine,
  projectRange,
  sampleInverseBranches,
  solveInverseLineInequality,
} from '../src/math/inverse-math.js';

describe('inverse proportion mathematics', () => {
  it('evaluates only valid inverse functions', () => {
    expect(evaluateInverse(12, 3)).toBe(4);
    expect(() => evaluateInverse(0, 3)).toThrow(/k/);
    expect(() => evaluateInverse(12, 0)).toThrow(/x/);
  });

  it('derives branches, monotonicity and invariant areas', () => {
    expect(getInverseBranches(5)).toEqual(['I', 'III']);
    expect(getInverseBranches(-5)).toEqual(['II', 'IV']);
    expect(getInverseMonotonicity(5)).toBe('decreasing');
    expect(getInverseMonotonicity(-5)).toBe('increasing');
    expect(getAreaFromK(-8, 'rectangle')).toBe(8);
    expect(getAreaFromK(-8, 'triangle')).toBe(4);
  });

  it('samples two paths without crossing x=0', () => {
    const branches = sampleInverseBranches(6, { xMin: -10, xMax: 10, samples: 80, epsilon: 0.05 });
    expect(branches).toHaveLength(2);
    expect(branches[0].every(({ x }) => x < 0)).toBe(true);
    expect(branches[1].every(({ x }) => x > 0)).toBe(true);
    expect(branches.flat().every(({ y }) => Number.isFinite(y))).toBe(true);
  });

  it('finds intersections with lines', () => {
    expect(intersectInverseWithLine(6, { m: 1, b: -1 })).toEqual([
      { x: -2, y: -3 },
      { x: 3, y: 2 },
    ]);
  });

  it('projects ranges and solves graph inequalities by intervals', () => {
    expect(projectRange(12, { xMin: 3, xMax: 6 })).toEqual({ yMin: 2, yMax: 4 });
    const result = solveInverseLineInequality({ k: 6, line: { m: 1, b: -1 }, relation: '>' });
    expect(result.intersections).toEqual([-2, 3]);
    expect(result.intervals.length).toBeGreaterThan(0);
  });
});
