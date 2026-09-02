import { createFormula, renderFormula } from '../components/formula-renderer.js';
import { createGraphStage } from '../components/graph-stage.js';
import { createQuickCheckPanel } from '../components/quick-check-panel.js';
import { createLinkedModel, deriveInverseScenario, inverseScenarioReducer } from '../interactions/linked-model.js';
import { getScenarioConfig, getStepContent } from './step-content.js';

const button = (label, action, className = 'button button--quiet') => {
  const element = document.createElement('button');
  element.type = 'button'; element.className = className; element.dataset.action = action; element.textContent = label;
  return element;
};

function createBase(step, layout) {
  const content = getStepContent(step);
  const element = document.createElement('section');
  element.className = `lesson-step layout-${layout} step-kind-${step.kind}`;
  element.dataset.stepId = step.id;
  element.innerHTML = `
    <header class="step-heading">
      <div><span class="step-kind-label">${step.kind === 'quick-check' ? 'QUICK CHECK' : step.phase.toUpperCase()}</span><h2 data-main-question>${content.question}</h2></div>
      <span class="ppt-source" data-ppt-source>PPT ${step.ppt.slides.join('、')} · ${step.ppt.concept}</span>
    </header>
    <div class="step-body"></div>
    <footer class="observation-line"><span>观察任务</span><strong>${content.observation}</strong></footer>`;
  return { element, body: element.querySelector('.step-body'), content };
}

function normalizeHandle({ element, reset, reveal, destroy, teacherActions = {} }) {
  return { element, reset: reset ?? (() => {}), reveal: reveal ?? (() => {}), destroy: destroy ?? (() => {}), teacherActions };
}

export function renderExplanation(step) {
  const base = createBase(step, step.renderer === 'comparison' ? 'comparison' : 'explanation');
  const statements = [
    '先锁定两个变化的量与一个不变量。',
    step.ppt.concept,
    '用式、图和中文结论互相验证。',
  ];
  const panel = document.createElement('div');
  panel.className = 'explanation-panel';
  panel.innerHTML = `<div class="explanation-copy"><span class="eyebrow">核心结论</span><h3>${step.title}</h3><ol class="reveal-list"></ol></div><div class="explanation-visual"></div>`;
  const list = panel.querySelector('.reveal-list');
  statements.forEach((text, index) => {
    const item = document.createElement('li'); item.textContent = text; item.dataset.reveal = String(index); if (index > 0) item.hidden = true; list.append(item);
  });
  const visual = panel.querySelector('.explanation-visual');
  visual.append(createFormula(base.content.formula, 'formula-card formula-card--large'));
  const conclusion = document.createElement('p'); conclusion.className = 'conclusion-card'; conclusion.textContent = step.boardNote; visual.append(conclusion);
  let graphStage;
  if (step.capabilities.includes('graph')) {
    graphStage = createGraphStage({ k: base.content.k, ariaLabel: `${step.title}图象` });
    graphStage.graph.setPointX('focus', 3);
    visual.append(graphStage.element);
  }
  base.body.append(panel);
  let revealIndex = 0;
  const reveal = () => { revealIndex = Math.min(revealIndex + 1, statements.length - 1); list.querySelector(`[data-reveal="${revealIndex}"]`)?.removeAttribute('hidden'); };
  const reset = () => { revealIndex = 0; list.querySelectorAll('[data-reveal]').forEach((item, index) => { item.hidden = index > 0; }); graphStage?.graph.reset(); };
  return normalizeHandle({ element: base.element, reset, reveal, destroy: () => graphStage?.graph.destroy(), teacherActions: { reveal, reset } });
}

export function renderAnimation(step) {
  const base = createBase(step, 'animation');
  const stage = document.createElement('div'); stage.className = 'animation-stage';
  const visual = document.createElement('div'); visual.className = 'animation-visual';
  const formula = createFormula(base.content.formula, 'formula-card formula-card--hero');
  const orbit = document.createElement('div'); orbit.className = 'invariant-orbit'; orbit.innerHTML = `<span>x 改变</span><strong>乘积 k 不变</strong><span>y 响应</span>`;
  visual.append(formula, orbit);
  let graphStage;
  if (step.capabilities.includes('graph')) {
    visual.innerHTML = '';
    graphStage = createGraphStage({ k: base.content.k, ariaLabel: `${step.title}动态演示` });
    graphStage.graph.setPointX('focus', 2);
    if (step.renderer.includes('piecewise') || step.renderer.includes('mission')) graphStage.graph.setLine({ m: 0.8, b: 1 });
    visual.append(graphStage.element);
  }
  const controls = document.createElement('div'); controls.className = 'playback-controls';
  const playButton = button('▶ 播放', 'play', 'button button--primary'); const pauseButton = button('Ⅱ 暂停', 'pause'); const replayButton = button('↻ 重播', 'replay');
  const progress = document.createElement('div'); progress.className = 'animation-progress'; progress.innerHTML = '<i></i>';
  controls.append(playButton, pauseButton, replayButton, progress);
  stage.append(visual, controls); base.body.append(stage);
  let value = 0; let timer = null;
  const render = () => { progress.querySelector('i').style.width = `${value}%`; visual.style.setProperty('--animation-progress', value / 100); if (graphStage) graphStage.graph.setPointX('focus', 1.2 + value / 12); };
  const pause = () => { clearInterval(timer); timer = null; playButton.textContent = value >= 100 ? '▶ 再播放' : '▶ 继续'; };
  const play = () => { if (globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { value = 100; render(); return; } if (value >= 100) value = 0; if (timer) return; playButton.textContent = '播放中…'; timer = setInterval(() => { value += 2; render(); if (value >= 100) pause(); }, 45); };
  const reset = () => { pause(); value = 0; render(); graphStage?.graph.reset(); if (graphStage) graphStage.graph.setPointX('focus', 2); };
  const onClick = (event) => { const action = event.target.dataset.action; if (action === 'play') play(); if (action === 'pause') pause(); if (action === 'replay') { reset(); play(); } };
  controls.addEventListener('click', onClick); render();
  return normalizeHandle({ element: base.element, reset, reveal: play, destroy: () => { pause(); controls.removeEventListener('click', onClick); graphStage?.graph.destroy(); }, teacherActions: { play, pause, replay: () => { reset(); play(); } } });
}

function renderGraphLab(step) {
  const base = createBase(step, step.renderer.includes('area') ? 'area' : 'visual-lab');
  const lab = document.createElement('div'); lab.className = 'visual-lab';
  const controls = document.createElement('aside'); controls.className = 'lab-controls';
  controls.innerHTML = `<span class="eyebrow">控制变量</span><h3>${step.title}</h3><label class="parameter-label" for="${step.id}-k">参数 k <output>+6</output></label><input id="${step.id}-k" type="range" min="-12" max="12" step="1" value="${base.content.k === -8 ? -8 : 6}" aria-label="参数 k"><div class="lab-formula"></div><p class="conclusion-card" aria-live="polite"></p><div class="control-row"></div>`;
  const formula = controls.querySelector('.lab-formula');
  const conclusion = controls.querySelector('.conclusion-card');
  const slider = controls.querySelector('input');
  const output = controls.querySelector('output');
  const row = controls.querySelector('.control-row');
  const resetButton = button('↻ 重置', 'reset'); const ghostButton = button('◌ Ghost', 'ghost'); row.append(resetButton, ghostButton);
  if (step.renderer.includes('range')) {
    const threshold = document.createElement('input'); threshold.type = 'range'; threshold.min = '-8'; threshold.max = '8'; threshold.value = '4'; threshold.dataset.control = 'threshold'; threshold.setAttribute('aria-label', '阈值'); controls.insertBefore(threshold, row);
  }
  if (step.renderer.includes('area')) {
    const area = document.createElement('div'); area.className = 'area-readout'; area.innerHTML = '<span>锁定面积</span><strong data-area>8</strong><small>S=|k|</small>'; controls.insertBefore(area, row);
  }
  const graphStage = createGraphStage({ k: Number(slider.value), ariaLabel: `${step.title}交互图象` });
  graphStage.graph.setPointX('focus', Number(slider.value) > 0 ? 3 : -3);
  if (step.renderer.includes('intersection')) graphStage.graph.setLine({ m: -0.5, b: 4 });
  if (step.renderer.includes('range')) graphStage.graph.setThreshold({ axis: 'y', value: 4 });
  const update = () => {
    let k = Number(slider.value); if (k === 0) { k = 1; slider.value = '1'; }
    output.value = `${k > 0 ? '+' : ''}${k}`; output.textContent = output.value;
    renderFormula(formula, `y=\\frac{${k}}{x}`);
    conclusion.textContent = k > 0 ? 'k>0，图象位于第一、三象限；每个分支内 y 随 x 增大而减小。' : 'k<0，图象位于第二、四象限；每个分支内 y 随 x 增大而增大。';
    graphStage.graph.setK(k); graphStage.graph.setPointX('focus', graphStage.graph.getState().points.focus?.x ?? (k > 0 ? 3 : -3));
    controls.querySelector('[data-area]')?.replaceChildren(String(Math.abs(k)));
  };
  const updateThreshold = (event) => graphStage.graph.setThreshold({ axis: 'y', value: Number(event.target.value) });
  const onInput = (event) => event.target.dataset.control === 'threshold' ? updateThreshold(event) : update();
  let ghostVisible = false;
  const onClick = (event) => {
    if (event.target.closest('[data-action="reset"]')) { slider.value = base.content.k === -8 ? '-8' : '6'; ghostVisible = false; graphStage.graph.reset(); update(); }
    if (event.target.closest('[data-action="ghost"]')) { ghostVisible = !ghostVisible; const k = Number(slider.value); graphStage.graph.setGhosts(ghostVisible ? [{ k: k / 2 }, { k: k * 1.5 }] : []); ghostButton.setAttribute('aria-pressed', String(ghostVisible)); }
  };
  const onKey = (event) => { if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return; event.preventDefault(); const current = graphStage.graph.getState().points.focus?.x ?? 3; graphStage.graph.setPointX('focus', current + (event.key === 'ArrowRight' ? 0.5 : -0.5)); };
  const onPointer = (event) => { if (!step.capabilities.includes('drag')) return; const rect = graphStage.canvas.getBoundingClientRect(); const point = graphStage.graph.toGraph({ x: event.clientX - rect.left, y: event.clientY - rect.top }); graphStage.graph.setPointX('focus', point.x); };
  controls.addEventListener('input', onInput); controls.addEventListener('click', onClick); graphStage.canvas.addEventListener('keydown', onKey); graphStage.canvas.addEventListener('pointerdown', onPointer);
  lab.append(controls, graphStage.element); base.body.append(lab); update();
  const reset = () => { slider.value = base.content.k === -8 ? '-8' : '6'; graphStage.graph.reset(); update(); };
  return normalizeHandle({ element: base.element, reset, reveal: () => conclusion.classList.add('is-emphasized'), destroy: () => { controls.removeEventListener('input', onInput); controls.removeEventListener('click', onClick); graphStage.canvas.removeEventListener('keydown', onKey); graphStage.canvas.removeEventListener('pointerdown', onPointer); graphStage.graph.destroy(); }, teacherActions: { reset, ghost: () => ghostButton.click(), layers: (state) => graphStage.graph.setLayers(state) } });
}

function renderRealityLab(step) {
  const base = createBase(step, 'triad');
  const config = getScenarioConfig(step);
  const triad = document.createElement('div'); triad.className = 'representation-triad';
  triad.innerHTML = `
    <section class="triad-panel reality-panel"><span class="eyebrow">REALITY · 现实</span><h3>${config.scenario}</h3><div class="apparatus" data-scenario="${config.scenario}"><i></i><b></b><span data-reality-reading></span></div><label>${config.labels.x}<input type="range" min="${config.domain[0]}" max="${config.domain[1]}" step="${config.step ?? 0.5}" value="${config.initial}"></label><p class="reality-status" aria-live="polite"></p></section>
    <section class="triad-panel equation-panel"><span class="eyebrow">EQUATION · 关系</span><div class="triad-formula"></div><dl><div><dt>不变量 k</dt><dd>${config.constant}</dd></div><div><dt>现实定义域</dt><dd>${config.domain[0]} ≤ x ≤ ${config.domain[1]}</dd></div></dl><p class="triad-conclusion"></p></section>
    <section class="triad-panel graph-panel"><span class="eyebrow">GRAPH · 图象</span><div class="triad-graph-slot"></div></section>`;
  const niceStep = (span) => {
    const raw = span / 8;
    const magnitude = 10 ** Math.floor(Math.log10(raw));
    const normalized = raw / magnitude;
    const multiplier = normalized <= 1.5 ? 1 : normalized <= 3 ? 2 : normalized <= 7 ? 5 : 10;
    return multiplier * magnitude;
  };
  const graphXMax = Math.max(12, config.domain[1] * 1.05);
  const graphYMax = Math.max(12, Math.ceil((config.constant / config.domain[0]) * 1.05));
  const graphStage = createGraphStage({ k: config.constant, xRange: [0, graphXMax], yRange: [0, graphYMax], xTickStep: niceStep(graphXMax), yTickStep: niceStep(graphYMax), ariaLabel: `${config.scenario}三联动图象` });
  triad.querySelector('.triad-graph-slot').append(graphStage.element);
  const input = triad.querySelector('input');
  const formula = triad.querySelector('.triad-formula');
  const reading = triad.querySelector('[data-reality-reading]');
  const status = triad.querySelector('.reality-status');
  const conclusion = triad.querySelector('.triad-conclusion');
  const initialState = { scenario: config.scenario, independentValue: config.initial, constant: config.constant, constraints: { domain: config.domain, maxY: config.maxY }, playbackState: 'paused', labels: config.labels, units: config.units };
  const model = createLinkedModel({
    initialState,
    reducer: inverseScenarioReducer,
    derive: deriveInverseScenario,
    views: {
      reality(snapshot) { reading.textContent = `${Number(snapshot.realityReading.toFixed(2))} ${snapshot.units.y}`; status.textContent = snapshot.status === 'safe' ? '✓ 在现实约束内' : '! 超出限制，请调整'; status.dataset.state = snapshot.status; triad.style.setProperty('--reality-ratio', String((snapshot.x - config.domain[0]) / (config.domain[1] - config.domain[0]))); },
      equation(snapshot) { renderFormula(formula, snapshot.formulaLatex); conclusion.textContent = snapshot.conclusion; },
      graph(snapshot) { graphStage.graph.setK(snapshot.k); graphStage.graph.setPointX('focus', snapshot.x); if (config.maxY) graphStage.graph.setThreshold({ axis: 'y', value: config.maxY }); },
    },
  });
  const onInput = () => model.dispatch({ type: 'set-independent', value: Number(input.value) });
  input.addEventListener('input', onInput); base.body.append(triad);
  const reset = () => { input.value = String(config.initial); model.reset(); };
  return normalizeHandle({ element: base.element, reset, reveal: () => conclusion.classList.add('is-emphasized'), destroy: () => { input.removeEventListener('input', onInput); model.destroy(); graphStage.graph.destroy(); }, teacherActions: { reset } });
}

function renderInteractiveBoard(step) {
  const base = createBase(step, 'visual-lab');
  const board = document.createElement('div'); board.className = 'concept-lab';
  board.innerHTML = `<div class="concept-lab__prompt"><span class="eyebrow">动手判断</span><h3>${step.title}</h3><div class="concept-options"></div><p aria-live="polite">选择一个表达式，检查乘积是否为定值。</p></div><div class="concept-lab__visual"><div class="variable-balance"><span>x</span><strong>×</strong><span>y</span><b>= k</b></div><div class="product-table"><span>x</span><span>2</span><span>3</span><span>6</span><span>y</span><span>6</span><span>4</span><span>2</span><span>xy</span><strong>12</strong><strong>12</strong><strong>12</strong></div></div>`;
  const options = board.querySelector('.concept-options');
  ['y=12/x', 'y=12x', 'y=x+12'].forEach((text, index) => { const choice = button(text, `choice-${index}`, 'choice-button'); choice.dataset.correct = String(index === 0); options.append(choice); });
  const feedback = board.querySelector('[aria-live]');
  const onClick = (event) => { const choice = event.target.closest('[data-correct]'); if (!choice) return; feedback.textContent = choice.dataset.correct === 'true' ? '正确：每组 xy 都等于同一个非零常数。' : '再检查：x 变化后，xy 并没有保持不变。'; options.querySelectorAll('button').forEach((item) => item.classList.remove('is-correct', 'is-wrong')); choice.classList.add(choice.dataset.correct === 'true' ? 'is-correct' : 'is-wrong'); };
  options.addEventListener('click', onClick); base.body.append(board);
  const reset = () => { feedback.textContent = '选择一个表达式，检查乘积是否为定值。'; options.querySelectorAll('button').forEach((item) => item.classList.remove('is-correct', 'is-wrong')); };
  return normalizeHandle({ element: base.element, reset, reveal: () => options.querySelector('[data-correct="true"]')?.classList.add('is-correct'), destroy: () => options.removeEventListener('click', onClick), teacherActions: { reset } });
}

export function renderQuickCheck(step, context) {
  const base = createBase(step, 'quick-check');
  const panel = createQuickCheckPanel({ step, lesson: context.lesson });
  base.body.append(panel.element);
  return normalizeHandle({ element: base.element, reset: panel.reset, reveal: () => {}, destroy: panel.destroy, teacherActions: { newChallenge: panel.reset } });
}

export const DEFAULT_RENDERERS = {
  explanation: renderExplanation,
  comparison: renderExplanation,
  'formula-animation': renderAnimation,
  'graph-animation': renderAnimation,
  'area-animation': renderAnimation,
  'range-animation': renderAnimation,
  'reality-animation': renderAnimation,
  'piecewise-animation': renderAnimation,
  'mission-animation': renderAnimation,
  'graph-lab': renderGraphLab,
  'range-lab': renderGraphLab,
  'area-lab': renderGraphLab,
  'intersection-lab': renderGraphLab,
  'reality-lab': renderRealityLab,
  'relation-lab': renderInteractiveBoard,
  'classification-lab': renderInteractiveBoard,
  'parameter-lab': renderInteractiveBoard,
  'formula-builder': renderInteractiveBoard,
  'geometry-lab': renderGraphLab,
  'quick-check': renderQuickCheck,
};
