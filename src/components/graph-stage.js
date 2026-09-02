import { createInverseGraph } from '../graph/inverse-graph.js';

export function createGraphStage(config = {}) {
  const element = document.createElement('div');
  element.className = 'graph-stage';
  element.innerHTML = `
    <canvas class="graph-stage__canvas" tabindex="0" aria-label="${config.ariaLabel ?? '反比例函数图象'}"></canvas>
    <div class="graph-stage__legend" aria-label="图例">
      <span><i class="legend-line"></i>反比例函数</span>
      <span><i class="legend-point"></i>联动点</span>
      <span><i class="legend-dash"></i>辅助线</span>
    </div>
    <p class="graph-stage__hint">键盘 ← → 调整点的 x 坐标</p>`;
  const canvas = element.querySelector('canvas');
  const graph = createInverseGraph(element, {
    canvas,
    k: config.k ?? 6,
    xRange: config.xRange ?? [-10, 10],
    yRange: config.yRange ?? [-10, 10],
    tickStep: config.tickStep ?? 2,
    xTickStep: config.xTickStep,
    yTickStep: config.yTickStep,
    ariaLabel: config.ariaLabel,
  });
  return { element, canvas, graph };
}
