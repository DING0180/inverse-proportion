function mulberry32(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6D2B79F5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = (random, values) => values[Math.floor(random() * values.length)];
const shuffle = (random, values) => values.map((value) => ({ value, key: random() })).sort((a, b) => a.key - b.key).map(({ value }) => value);

function questionBase({ id, family, prompt, correctAnswer, choices, explanation, sourceStep, formula = '', misconceptionFeedback = {} }) {
  return { id, family, prompt, formula, choices, correctAnswer, acceptedAnswers: [String(correctAnswer)], explanation, misconceptionFeedback, visualScene: null, sourceStep };
}

export const QUESTION_FAMILIES = {
  'function-recognition': ({ random, serial }) => {
    const k = pick(random, [-12, -8, -6, 4, 6, 9, 12]);
    const correct = `y=${k}/x`;
    const choices = shuffle(random, [correct, `y=${k}x`, `y=x/${k}`, `y=${k}/(x+1)`]);
    return questionBase({ id: `recognition-${k}-${serial}`, family: 'function-recognition', prompt: '下列哪个是反比例函数？', correctAnswer: correct, choices, explanation: '反比例函数可写成 y=k/x，且 k≠0。', sourceStep: 'L01-S07' });
  },
  'point-to-k': ({ random, serial }) => {
    const x = pick(random, [-6, -4, -3, -2, 2, 3, 4, 6]);
    const y = pick(random, [-6, -4, -3, -2, 2, 3, 4, 6]);
    const answer = x * y;
    return questionBase({ id: `point-${x}-${y}-${serial}`, family: 'point-to-k', prompt: `点 (${x}, ${y}) 在 y=k/x 上，k=?`, correctAnswer: answer, choices: shuffle(random, [answer, x + y, x - y, Math.abs(answer)]).filter((value, index, all) => all.indexOf(value) === index), explanation: `k=xy=${x}×${y}=${answer}。`, sourceStep: 'L01-S09' });
  },
  'graph-match': ({ random, serial }) => {
    const k = pick(random, [-8, -6, 4, 6, 8]);
    const answer = k > 0 ? '第一、三象限' : '第二、四象限';
    return questionBase({ id: `graph-${k}-${serial}`, family: 'graph-match', prompt: `y=${k}/x 的图象位于？`, formula: `y=\\frac{${k}}{x}`, correctAnswer: answer, choices: shuffle(random, [answer, k > 0 ? '第二、四象限' : '第一、三象限']), explanation: `k${k > 0 ? '>' : '<'}0，所以图象位于${answer}。`, sourceStep: 'L02-S14' });
  },
  'area': ({ random, serial }) => {
    const k = pick(random, [-12, -8, 6, 10, 12]);
    const answer = Math.abs(k);
    return questionBase({ id: `area-${k}-${serial}`, family: 'area', prompt: `点在 y=${k}/x 上，与坐标轴围成的矩形面积为？`, correctAnswer: answer, choices: shuffle(random, [answer, answer / 2, Math.abs(k * 2), Math.abs(k) + 2]), explanation: `矩形面积 |xy|=|k|=${answer}。`, sourceStep: 'L03-S08' });
  },
  'real-model': ({ random, serial }) => {
    const constant = pick(random, [24, 36, 48, 60, 72, 96]);
    const x = pick(random, [2, 3, 4, 6, 8, 12].filter((value) => constant % value === 0));
    const answer = constant / x;
    return questionBase({ id: `model-${constant}-${x}-${serial}`, family: 'real-model', prompt: `两个量乘积恒为 ${constant}，当 x=${x} 时，y=?`, correctAnswer: answer, choices: shuffle(random, [answer, answer + 2, Math.max(1, answer - 2), constant - x]).filter((value, index, all) => all.indexOf(value) === index), explanation: `y=${constant}÷${x}=${answer}。`, sourceStep: 'L04-S07' });
  },
  'piecewise': ({ random, serial }) => {
    const threshold = pick(random, [3, 4, 5, 6]);
    const constant = threshold * pick(random, [24, 30, 36]);
    const answer = constant / threshold;
    return questionBase({ id: `piecewise-${threshold}-${constant}-${serial}`, family: 'piecewise', prompt: `在 y=${constant}/x 中，y 降到 ${threshold} 时 x=?`, correctAnswer: answer, choices: shuffle(random, [answer, answer - 4, answer + 4, constant - threshold]), explanation: `令 ${threshold}=${constant}/x，得 x=${answer}。`, sourceStep: 'L05-S09' });
  },
};

export function createQuestionGenerator({ seed = 1, families = QUESTION_FAMILIES, historySize = 5 }) {
  let currentSeed = Number(seed) || 1;
  let random = mulberry32(currentSeed);
  let serial = 0;
  const history = [];

  const next = ({ family, difficulty = 1, lessonId = '' }) => {
    const factory = families[family] ?? families['real-model'];
    let question;
    for (let attempt = 0; attempt < 20; attempt += 1) {
      serial += 1;
      question = factory({ random, serial, difficulty, lessonId });
      if (!history.includes(question.id)) break;
    }
    history.push(question.id);
    while (history.length > historySize) history.shift();
    return question;
  };

  return {
    next,
    reset(nextSeed = currentSeed) {
      currentSeed = Number(nextSeed) || 1;
      random = mulberry32(currentSeed);
      serial = 0;
      history.length = 0;
    },
  };
}
