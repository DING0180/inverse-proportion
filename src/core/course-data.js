const KINDS = { E: 'explanation', A: 'animation', L: 'lab', Q: 'quick-check' };

const parseSlides = (value) => String(value).split(',').flatMap((part) => {
  if (!part.includes('-')) return [Number(part)];
  const [start, end] = part.split('-').map(Number);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
});

const lessonSpecs = [
  {
    id: '01', code: '27.1', title: '反比例函数的概念', ability: 'RELATION',
    steps: [
      ['Bridge In', '15', '原材料模型前置导入：两个变量变化、乘积不变', 'L', 'reality-lab', ['drag', 'graph']],
      ['正式定义', '2', '定义、k≠0、x≠0', 'E', 'explanation', ['reveal']],
      ['三种表达形式', '2', 'y=k/x、y=kx⁻¹、xy=k', 'A', 'formula-animation', ['play', 'reveal']],
      ['判断关系', '3', '定义法、乘积定值法', 'L', 'relation-lab', ['predict', 'reveal']],
      ['函数识别', '5,8', '识别反比例函数', 'L', 'classification-lab', ['random']],
      ['参数陷阱', '6-7,9', '指数为 -1 且系数不为 0', 'L', 'parameter-lab', ['predict']],
      ['Quick Check A', '5-9', '识别、参数、k≠0', 'Q', 'quick-check', ['random']],
      ['待定系数四步法', '4', '设—代—解—定', 'A', 'formula-animation', ['play', 'reveal']],
      ['Hidden Constant', '10-12', '由点求解析式及新函数值', 'L', 'graph-lab', ['random', 'graph']],
      ['正比例+反比例', '13-14', 'y=y₁+y₂ 综合', 'L', 'formula-builder', ['drag']],
      ['原材料建模', '15', '总量、每日用量、天数', 'L', 'reality-lab', ['drag', 'graph']],
      ['固定面积三角形', '16', '1/2xy=2', 'L', 'geometry-lab', ['drag', 'graph']],
      ['速度×时间', '17', '固定路程模型', 'L', 'reality-lab', ['drag', 'play', 'graph']],
      ['气压×体积', '18', '表格反推反比例模型', 'L', 'reality-lab', ['graph']],
      ['梯形固定面积', '19-21', '梯形面积、解析式、已知高求边', 'L', 'geometry-lab', ['drag', 'reveal']],
    ],
  },
  {
    id: '02', code: '27.1', title: '反比例函数的图象和性质', ability: 'GRAPH',
    steps: [
      ['Curve Builder', '2', '列表—描点—连线', 'L', 'graph-lab', ['drag', 'play', 'graph']],
      ['为什么没有 x=0', '3', '定义域、值域、不与坐标轴相交', 'L', 'graph-lab', ['drag', 'graph']],
      ['无限接近', '3,5', '渐近性', 'A', 'graph-animation', ['play', 'graph']],
      ['k>0 与 k<0', '4-5', '象限由 k 符号决定', 'L', 'graph-lab', ['drag', 'graph']],
      ['Ghost Curves', '4-5', '|k| 的视觉补充', 'L', 'graph-lab', ['freeze', 'ghost', 'graph']],
      ['增减性', '5', '每个分支内的增减性', 'L', 'graph-lab', ['drag', 'graph']],
      ['“每一个象限内”', '17-18,20,24', '跨分支不可直接套增减性', 'E', 'explanation', ['predict', 'reveal', 'graph']],
      ['轴对称', '6', '关于 y=x、y=-x 对称', 'A', 'graph-animation', ['play', 'graph']],
      ['给点求 k', '7-8', '点坐标代入 k=xy', 'A', 'graph-animation', ['play', 'reveal', 'graph']],
      ['画函数图象', '9', '由解析式判断象限并作图', 'L', 'graph-lab', ['predict', 'reveal', 'graph']],
      ['点是否在图象上', '10', '用 xy=k 判点', 'L', 'graph-lab', ['drag', 'graph']],
      ['从 x 范围读 y', '11', '区间投影', 'L', 'range-lab', ['drag', 'graph']],
      ['从 y 范围求 x', '11', '反向读图', 'L', 'range-lab', ['drag', 'graph']],
      ['随机图象判断', '15', '反比例函数与一次函数示意图判断', 'Q', 'quick-check', ['random', 'graph']],
      ['性质判断', '13-14,16,19', '性质选择与辨析', 'Q', 'quick-check', ['random', 'graph']],
      ['比较函数值三法', '17-18', '性质法、求值法、图象法', 'E', 'comparison', ['reveal', 'graph']],
      ['参数与增减性', '21', 'y=(k-3)/x', 'L', 'parameter-lab', ['drag', 'graph']],
      ['指数参数与象限', '22-23', '指数、系数符号、象限综合', 'E', 'explanation', ['reveal', 'graph']],
      ['Final Check', '20,24', '三点函数值比较', 'Q', 'quick-check', ['random', 'graph']],
    ],
  },
  {
    id: '03', code: '27.1', title: '图象和性质综合应用', ability: 'REASON',
    steps: [
      ['Hidden Area', '2-3', '矩形面积为 |k|', 'L', 'area-lab', ['drag', 'graph']],
      ['为什么有绝对值', '3', '代数乘积与几何面积', 'L', 'area-lab', ['drag', 'graph']],
      ['三角形面积', '4', '面积为 |k|/2', 'A', 'area-animation', ['play', 'graph']],
      ['Model Gallery', '5-8', '常见面积模型', 'A', 'area-animation', ['play', 'graph']],
      ['Area Decomposer', '5-8', '面积差与面积和', 'A', 'area-animation', ['play', 'graph']],
      ['面积反求 k', '9', '面积给 |k|，象限给符号', 'E', 'explanation', ['reveal', 'graph']],
      ['两条双曲线矩形', '10', '|k₁|-|k₂|', 'L', 'area-lab', ['drag', 'graph']],
      ['随机面积图', '11-12', '矩形、三角形、双曲线间区域', 'Q', 'quick-check', ['random', 'graph']],
      ['一次×反比例', '13-14', '由交点求两个解析式', 'E', 'explanation', ['reveal', 'graph']],
      ['交点三联动', '13-14', '点同时满足两式', 'L', 'intersection-lab', ['drag', 'graph']],
      ['AOB 面积', '15', '垂线分割、三角形与梯形法', 'A', 'area-animation', ['play', 'graph']],
      ['图象解不等式', '16', '比较两图象高低', 'A', 'range-animation', ['play', 'graph']],
      ['Random Inequality', '16', '图象解不等式应用', 'Q', 'quick-check', ['random', 'graph']],
      ['过原点直线综合', '17-18', '由横坐标求点、求反比例式', 'E', 'explanation', ['reveal', 'graph']],
      ['直接解不等式', '19', '同一图象读解集', 'L', 'range-lab', ['predict', 'graph']],
      ['平移直线', '20-21', 'y=-2x+b', 'L', 'intersection-lab', ['drag', 'graph']],
      ['面积确定平移量', '20-22', '由面积求 b', 'L', 'area-lab', ['drag', 'graph']],
    ],
  },
  {
    id: '04', code: '27.2', title: '实际问题与反比例函数（一）', ability: 'MODEL', modelingRibbon: true,
    steps: [
      ['三个角色', '2', '两个变量与一个常量', 'L', 'relation-lab', ['drag']],
      ['五步建模法', '3-4', '审、设、列、写、解', 'E', 'explanation', ['reveal']],
      ['现实关系 Gallery', '5-6', '物理中的反比例关系', 'A', 'reality-animation', ['play']],
      ['杠杆模拟', '7-8', 'F=800/l', 'L', 'reality-lab', ['drag', 'graph']],
      ['最大力量限制', '9', 'F≤200 推出 l≥4', 'L', 'reality-lab', ['drag', 'graph']],
      ['已有 2.5m 杠杆', '10', '至少需要 320N', 'E', 'explanation', ['reveal']],
      ['Random Lever', '7-10', '杠杆综合', 'Q', 'quick-check', ['random']],
      ['分期付款识别', '11-13', '表格、乘积 14、解析式', 'L', 'reality-lab', ['graph']],
      ['求首付款', '14', '总价减分期金额', 'A', 'reality-animation', ['play']],
      ['Repayment Slider', '15', '40 个月时月付 0.35 万', 'L', 'reality-lab', ['drag', 'graph']],
      ['反向决策', '16', '月付上限与期限可行性', 'L', 'range-lab', ['drag', 'graph']],
      ['圆锥漏斗', '17-18', 'S=3/d', 'L', 'reality-lab', ['drag', 'graph']],
      ['制造限制', '19', 'S≤100 推出 d≥30', 'L', 'reality-lab', ['drag', 'graph']],
      ['圆柱迁移', '20', 'S=2/h', 'L', 'reality-lab', ['drag', 'graph']],
      ['校园园圃', '21', 'xy=12', 'L', 'reality-lab', ['drag', 'graph']],
      ['现实定义域', '21', '墙长限制与 x≥6/5', 'E', 'comparison', ['reveal', 'graph']],
      ['新限制 y≥4', '22', '合法区域', 'L', 'range-lab', ['drag', 'graph']],
      ['已知一边求另一边', '22', '变量判断与分步计算', 'E', 'explanation', ['reveal']],
    ],
  },
  {
    id: '05', code: '27.2', title: '实际问题与反比例函数（二）', ability: 'DECIDE', modelingRibbon: true,
    steps: [
      ['Pressure Lab', '2-4', '表格、pV=96、解析式', 'L', 'reality-lab', ['drag', 'graph']],
      ['表格→图象', '3-5', '数据点描图', 'A', 'graph-animation', ['play', 'graph']],
      ['气体压力实验', '2-5', '活塞三联动', 'L', 'reality-lab', ['drag', 'graph']],
      ['Safety Zone', '6', 'p≤140 的安全范围', 'L', 'range-lab', ['drag', 'graph']],
      ['电流与电阻', '7', '由点求 k，再求电流', 'L', 'reality-lab', ['drag', 'graph']],
      ['小孔成像背景', '8-9', '墨子、小孔成像原理', 'A', 'reality-animation', ['play']],
      ['Pinhole Lab', '10-11', 'y=24/x', 'L', 'reality-lab', ['drag', 'graph']],
      ['成像限制', '12', '像高不超过 5cm', 'L', 'range-lab', ['drag', 'graph']],
      ['现实图象 Quick Check', '2-12', '气压、电路、成像综合', 'Q', 'quick-check', ['random', 'graph']],
      ['升级到分阶段', '13-14', '一个过程需要两种模型', 'E', 'explanation', ['predict', 'reveal']],
      ['金属加热', '15', 'y=128x+32', 'A', 'piecewise-animation', ['play', 'graph']],
      ['冷却/锻造', '14,16', 'y=4800/x', 'A', 'piecewise-animation', ['play', 'graph']],
      ['分段函数 Reveal', '15-16', '两段公式合并', 'E', 'explanation', ['reveal', 'graph']],
      ['温度阈值', '17', '480℃、锻造 4 分钟', 'L', 'range-lab', ['drag', 'graph']],
      ['校园消毒任务', '18', 'AB→BC→CD', 'A', 'mission-animation', ['play', 'graph']],
      ['读图', '19', '10 分钟时效力为 3', 'L', 'range-lab', ['drag', 'graph']],
      ['深消毒阶段', '20-21', '一次函数解析式与定义域', 'E', 'explanation', ['reveal', 'graph']],
      ['降消毒阶段', '21', 'y=180/x', 'E', 'explanation', ['reveal', 'graph']],
      ['函数拼装器', '22', '分段函数', 'A', 'piecewise-animation', ['play', 'graph']],
      ['有效阈值', '23', 'y≥4 的两个交点', 'L', 'range-lab', ['drag', 'graph']],
      ['Effective Window', '24', '持续时间与 28 分钟比较', 'A', 'mission-animation', ['play', 'graph']],
    ],
  },
];

const phases = { explanation: 'explain', animation: 'explore', lab: 'apply', 'quick-check': 'check' };

export const COURSE = {
  id: 'inverse-proportion',
  title: '反比例函数互动课堂',
  subtitle: 'Reality · Equation · Graph',
  lessons: lessonSpecs.map((lesson) => ({
    ...lesson,
    steps: lesson.steps.map(([title, slides, concept, kindCode, renderer, capabilities], index) => {
      const kind = KINDS[kindCode];
      return {
        id: `L${lesson.id}-S${String(index + 1).padStart(2, '0')}`,
        number: String(index + 1).padStart(2, '0'),
        title,
        phase: index === 0 ? 'think' : phases[kind],
        kind,
        renderer,
        ppt: { deck: `L${lesson.id}`, slides: parseSlides(slides), concept },
        capabilities,
        props: { variant: renderer },
        boardNote: concept,
      };
    }),
  })),
};

export function getStepByRoute(lessonId, stepNumber) {
  const lesson = COURSE.lessons.find(({ id }) => id === String(lessonId).padStart(2, '0'));
  return lesson?.steps.find(({ number }) => number === String(stepNumber).padStart(2, '0')) ?? null;
}

export function validateCourse(course) {
  const errors = [];
  const ids = new Set();
  if (course.lessons.length !== 5) errors.push('课程必须包含 5 个 Lesson');
  for (const lesson of course.lessons) {
    for (const step of lesson.steps) {
      if (ids.has(step.id)) errors.push(`重复 Step ID: ${step.id}`);
      ids.add(step.id);
      if (!step.title || !step.kind || !step.renderer) errors.push(`${step.id} 缺少基本字段`);
      if (!step.ppt?.deck || !step.ppt?.slides?.length || !step.ppt?.concept) errors.push(`${step.id} 缺少 PPT 映射`);
      if (!['explanation', 'animation', 'lab', 'quick-check'].includes(step.kind)) errors.push(`${step.id} kind 非法`);
    }
  }
  if (ids.size !== 90) errors.push(`Step 总数应为 90，实际为 ${ids.size}`);
  return { valid: errors.length === 0, errors };
}
