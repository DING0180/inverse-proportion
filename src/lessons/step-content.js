const formulaById = {
  'L01-S02': 'y=\\frac{k}{x}\quad(k\\ne0,\ x\\ne0)', 'L01-S03': 'y=\\frac{k}{x}=kx^{-1}\Longleftrightarrow xy=k',
  'L01-S08': 'xy=k\Longrightarrow k=x_0y_0\Longrightarrow y=\\frac{k}{x}', 'L01-S10': 'y=y_1+y_2=ax+\\frac{b}{x}',
  'L01-S11': 'xy=k', 'L01-S12': '\\frac12xy=2', 'L01-S13': 'vt=s', 'L01-S14': 'pV=k',
  'L02-S04': 'y=\\frac{k}{x}', 'L02-S06': 'k>0:\\downarrow\quad k<0:\\uparrow', 'L02-S07': '\\text{每一个分支内}',
  'L02-S08': 'y=x\quad\text{与}\quad y=-x', 'L02-S09': 'k=x_0y_0', 'L02-S11': 'xy\\stackrel{?}{=}k',
  'L02-S17': 'y=\\frac{k-3}{x}', 'L02-S18': 'y=(m^2-m-2)x^{m^2-5}',
  'L03-S01': 'S_{矩形}=|xy|=|k|', 'L03-S02': 'xy=k,\quad S=|xy|', 'L03-S03': 'S_{三角形}=\\frac{|k|}{2}',
  'L03-S06': 'S\Rightarrow |k|,\quad 象限\Rightarrow k的符号', 'L03-S07': 'S=|k_1|-|k_2|',
  'L03-S09': 'y=mx+b\quad\text{与}\quad y=\\frac{k}{x}', 'L03-S16': 'y=-2x+b',
  'L04-S02': '\\text{审}\to\\text{设}\to\\text{列}\to\\text{写}\to\\text{解}', 'L04-S04': 'F=\\frac{800}{l}',
  'L04-S05': 'F\\le200\\Longrightarrow l\\ge4', 'L04-S06': 'F=800\\div2.5=320', 'L04-S08': 'xy=14',
  'L04-S10': 'y=\\frac{14}{x}', 'L04-S12': 'S=\\frac{3}{d}', 'L04-S14': 'S=\\frac{2}{h}', 'L04-S15': 'xy=12',
  'L05-S01': 'pV=96,\quad p=\\frac{96}{V}', 'L05-S03': 'p=\\frac{96}{V}', 'L05-S05': 'I=\\frac{k}{R}',
  'L05-S07': 'y=\\frac{24}{x}', 'L05-S11': 'y=128x+32', 'L05-S12': 'y=\\frac{4800}{x}',
  'L05-S17': 'y=mx+b', 'L05-S18': 'y=\\frac{180}{x}', 'L05-S20': 'y\\ge4',
};

const promptByKind = {
  explanation: '这条结论为什么成立？', animation: '变化过程中，什么保持不变？', lab: '拖动参数，寻找不变量。', 'quick-check': '独立判断，并说明依据。',
};

export function getStepContent(step) {
  return {
    question: promptByKind[step.kind],
    formula: formulaById[step.id] ?? (step.capabilities.includes('graph') ? 'y=\\frac{k}{x}' : 'xy=k'),
    insight: step.ppt.concept,
    observation: `观察：${step.boardNote}`,
    k: step.id.startsWith('L02') ? 6 : step.id.startsWith('L03') ? -8 : 12,
  };
}

export function getScenarioConfig(step) {
  const title = step.title;
  const isPressure = ['气压', '压力', 'Pressure', 'Safety'].some((token) => title.includes(token));
  if (isPressure) return { scenario: '气体压力', constant: 96, domain: [0.5, 12], initial: 4, maxY: title.includes('Safety') ? 140 : null, labels: { x: '体积', y: '气压' }, units: { x: 'L', y: 'kPa' }, step: 0.5 };
  if (title.includes('杠杆') || title.includes('力量')) return { scenario: '杠杆', constant: 800, domain: [1, 8], initial: 4, maxY: 200, labels: { x: '动力臂', y: '所需力量' }, units: { x: 'm', y: 'N' } };
  if (title.includes('付款') || title.includes('Repayment') || title.includes('决策')) return { scenario: '分期付款', constant: 14, domain: [10, 60], initial: 40, maxY: 0.5, labels: { x: '期数', y: '月付款' }, units: { x: '个月', y: '万元' } };
  if (title.includes('漏斗') || title.includes('制造')) return { scenario: '圆锥漏斗', constant: 3, domain: [0.03, 0.12], initial: 0.06, maxY: 100, labels: { x: '深度', y: '液面面积' }, units: { x: 'm', y: 'cm²' }, step: 0.01 };
  if (title.includes('园圃')) return { scenario: '校园园圃', constant: 12, domain: [1.2, 10], initial: 3, labels: { x: '宽', y: '长' }, units: { x: 'm', y: 'm' }, step: 0.1 };
  if (title.includes('电流')) return { scenario: '电路', constant: 12, domain: [1, 20], initial: 6, maxY: 3, labels: { x: '电阻', y: '电流' }, units: { x: 'Ω', y: 'A' } };
  if (title.includes('成像') || title.includes('Pinhole')) return { scenario: '小孔成像', constant: 24, domain: [2, 16], initial: 6, maxY: 5, labels: { x: '物距', y: '像高' }, units: { x: 'cm', y: 'cm' } };
  if (title.includes('速度')) return { scenario: '固定路程', constant: 120, domain: [20, 100], initial: 40, labels: { x: '速度', y: '时间' }, units: { x: 'km/h', y: 'h' } };
  return { scenario: '定值关系', constant: 12, domain: [1, 12], initial: 4, maxY: null, labels: { x: '独立变量', y: '因变量' }, units: { x: '', y: '' } };
}
