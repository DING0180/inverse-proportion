const requireNonZero = (value, name) => {
  if (!Number.isFinite(value) || value === 0) throw new RangeError(`${name} must be a finite non-zero number`);
};

const round = (value) => Math.abs(value) < 1e-12 ? 0 : Number(value.toFixed(10));

export function evaluateInverse(k, x) {
  requireNonZero(k, 'k');
  requireNonZero(x, 'x');
  return k / x;
}

export function getInverseBranches(k) {
  requireNonZero(k, 'k');
  return k > 0 ? ['I', 'III'] : ['II', 'IV'];
}

export function getInverseMonotonicity(k) {
  requireNonZero(k, 'k');
  return k > 0 ? 'decreasing' : 'increasing';
}

export function getAreaFromK(k, shape = 'rectangle') {
  requireNonZero(k, 'k');
  if (shape === 'rectangle') return Math.abs(k);
  if (shape === 'triangle') return Math.abs(k) / 2;
  throw new RangeError(`Unknown area shape: ${shape}`);
}

export function sampleInverseBranches(k, {
  xMin = -10,
  xMax = 10,
  samples = 240,
  epsilon = 0.02,
  yMin = -Infinity,
  yMax = Infinity,
} = {}) {
  requireNonZero(k, 'k');
  if (!(xMin < xMax) || samples < 4 || epsilon <= 0) throw new RangeError('Invalid sampling range');
  const domains = [];
  if (xMin < -epsilon) domains.push([xMin, Math.min(xMax, -epsilon)]);
  if (xMax > epsilon) domains.push([Math.max(xMin, epsilon), xMax]);
  return domains.map(([start, end]) => {
    const count = Math.max(2, Math.round(samples * ((end - start) / (xMax - xMin))));
    const points = [];
    for (let index = 0; index <= count; index += 1) {
      const x = start + ((end - start) * index) / count;
      const y = k / x;
      if (Number.isFinite(y) && y >= yMin && y <= yMax) points.push({ x, y });
    }
    return points;
  });
}

export function intersectInverseWithLine(k, { m, b }) {
  requireNonZero(k, 'k');
  if (![m, b].every(Number.isFinite)) throw new RangeError('Line coefficients must be finite');
  if (m === 0) return b === 0 ? [] : [{ x: round(k / b), y: b }];
  const discriminant = b * b + 4 * m * k;
  if (discriminant < 0) return [];
  const root = Math.sqrt(discriminant);
  const xs = discriminant === 0 ? [(-b) / (2 * m)] : [(-b - root) / (2 * m), (-b + root) / (2 * m)];
  return xs
    .filter((x) => x !== 0 && Number.isFinite(x))
    .sort((a, c) => a - c)
    .map((x) => ({ x: round(x), y: round(m * x + b) }));
}

export function projectRange(k, { xMin, xMax }) {
  requireNonZero(k, 'k');
  if (!(xMin < xMax) || xMin <= 0 && xMax >= 0) throw new RangeError('Range must stay inside one branch');
  const values = [evaluateInverse(k, xMin), evaluateInverse(k, xMax)];
  return { yMin: Math.min(...values), yMax: Math.max(...values) };
}

export function solveInverseLineInequality({ k, line, relation = '>' }) {
  const points = intersectInverseWithLine(k, line);
  const cuts = [-Infinity, 0, ...points.map(({ x }) => x), Infinity]
    .filter((value, index, all) => index === 0 || value !== all[index - 1])
    .sort((a, b) => a - b);
  const intervals = [];
  for (let index = 0; index < cuts.length - 1; index += 1) {
    const left = cuts[index];
    const right = cuts[index + 1];
    if (left === 0 && right === 0) continue;
    let probe;
    if (!Number.isFinite(left)) probe = right - Math.max(1, Math.abs(right));
    else if (!Number.isFinite(right)) probe = left + Math.max(1, Math.abs(left));
    else probe = (left + right) / 2;
    if (probe === 0) probe = right > 0 ? right / 2 : left / 2;
    const difference = evaluateInverse(k, probe) - (line.m * probe + line.b);
    const accepted = relation.includes('>') ? difference > 0 : difference < 0;
    if (accepted) intervals.push({ from: left, to: right });
  }
  return { intersections: points.map(({ x }) => x), intervals, relation };
}

export function evaluatePiecewise(pieces, x) {
  const piece = pieces.find(({ domain }) => x >= domain[0] && x <= domain[1]);
  if (!piece) return null;
  return piece.type === 'inverse' ? evaluateInverse(piece.k, x) : piece.m * x + piece.b;
}

export function getThresholdIntersections({ type, k, m, b }, threshold) {
  if (type === 'inverse') return [round(k / threshold)];
  if (m === 0) return [];
  return [round((threshold - b) / m)];
}
