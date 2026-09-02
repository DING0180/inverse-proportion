const clone = (value) => globalThis.structuredClone ? structuredClone(value) : JSON.parse(JSON.stringify(value));

export function createLinkedModel({ initialState, reducer, derive, views = {} }) {
  const pristine = clone(initialState);
  let state = clone(initialState);
  let frame = null;
  let destroyed = false;

  const render = () => {
    frame = null;
    if (destroyed) return;
    const snapshot = derive(state);
    Object.values(views).forEach((view) => view?.(snapshot, state));
  };

  const schedule = () => {
    if (frame === null) frame = requestAnimationFrame(render);
  };

  const dispatch = (action) => {
    if (destroyed) return;
    state = reducer(state, action);
    schedule();
  };

  render();

  return {
    dispatch,
    reset() {
      state = clone(pristine);
      schedule();
    },
    getState: () => clone(state),
    destroy() {
      destroyed = true;
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
    },
  };
}

export function inverseScenarioReducer(state, action) {
  if (action.type === 'set-independent') {
    const [min, max] = state.constraints.domain;
    if (!Number.isFinite(action.value) || action.value === 0 || action.value < min || action.value > max) {
      return { ...state, feedback: '该数值超出现实定义域' };
    }
    return { ...state, independentValue: action.value, feedback: '' };
  }
  if (action.type === 'set-playing') return { ...state, playbackState: action.value ? 'playing' : 'paused' };
  return state;
}

export function deriveInverseScenario(state) {
  const x = state.independentValue;
  const y = state.constant / x;
  const status = state.constraints.maxY == null || y <= state.constraints.maxY ? 'safe' : 'warning';
  return {
    scenario: state.scenario,
    x,
    y,
    k: state.constant,
    formulaLatex: `y=\\frac{${state.constant}}{x}`,
    graphPoint: { x, y },
    realityReading: y,
    status,
    domain: state.constraints.domain,
    units: state.units,
    conclusion: `${state.labels.y}为 ${Number(y.toFixed(2))}${state.units.y}`,
  };
}
