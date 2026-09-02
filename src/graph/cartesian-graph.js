const clone = (value) => globalThis.structuredClone ? structuredClone(value) : JSON.parse(JSON.stringify(value));
const emptyScene = () => ({ series: [], points: [], helpers: [], regions: [], labels: [] });

export function createCartesianGraph(canvas, config = {}) {
  const context = canvas.getContext?.('2d');
  const settings = {
    xRange: config.xRange ?? [-10, 10],
    yRange: config.yRange ?? [-10, 10],
    tickStep: config.tickStep ?? 2,
    xTickStep: config.xTickStep ?? config.tickStep ?? 2,
    yTickStep: config.yTickStep ?? config.tickStep ?? 2,
    equalScale: config.equalScale ?? false,
    padding: config.padding ?? 42,
    ariaLabel: config.ariaLabel ?? '反比例函数坐标图',
  };
  let scene = emptyScene();
  let width = 1;
  let height = 1;
  let destroyed = false;
  let observer;
  let fallback;

  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', settings.ariaLabel);

  const plot = () => ({
    left: settings.padding,
    top: settings.padding * 0.55,
    right: width - settings.padding * 0.55,
    bottom: height - settings.padding,
  });

  const toScreen = ({ x, y }) => {
    const area = plot();
    return {
      x: area.left + ((x - settings.xRange[0]) / (settings.xRange[1] - settings.xRange[0])) * (area.right - area.left),
      y: area.bottom - ((y - settings.yRange[0]) / (settings.yRange[1] - settings.yRange[0])) * (area.bottom - area.top),
    };
  };

  const toGraph = ({ x, y }) => {
    const area = plot();
    return {
      x: settings.xRange[0] + ((x - area.left) / (area.right - area.left)) * (settings.xRange[1] - settings.xRange[0]),
      y: settings.yRange[0] + ((area.bottom - y) / (area.bottom - area.top)) * (settings.yRange[1] - settings.yRange[0]),
    };
  };

  const strokePath = (points, color = '#0b9aa3', lineWidth = 3, dash = []) => {
    if (!points.length) return;
    context.save();
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.setLineDash(dash);
    context.beginPath();
    points.forEach((point, index) => {
      const pixel = toScreen(point);
      if (index === 0 || point.breakBefore) context.moveTo(pixel.x, pixel.y);
      else context.lineTo(pixel.x, pixel.y);
    });
    context.stroke();
    context.restore();
  };

  const drawGrid = () => {
    const area = plot();
    context.save();
    context.clearRect(0, 0, width, height);
    context.font = '12px system-ui';
    context.lineWidth = 1;
    for (let x = Math.ceil(settings.xRange[0] / settings.xTickStep) * settings.xTickStep; x <= settings.xRange[1]; x += settings.xTickStep) {
      const pixel = toScreen({ x, y: 0 });
      context.strokeStyle = x === 0 ? '#12316a' : '#dbe4ef';
      context.beginPath(); context.moveTo(pixel.x, area.top); context.lineTo(pixel.x, area.bottom); context.stroke();
      if (x !== 0) { context.fillStyle = '#52647f'; context.fillText(String(x), pixel.x + 4, toScreen({ x: 0, y: 0 }).y + 16); }
    }
    for (let y = Math.ceil(settings.yRange[0] / settings.yTickStep) * settings.yTickStep; y <= settings.yRange[1]; y += settings.yTickStep) {
      const pixel = toScreen({ x: 0, y });
      context.strokeStyle = y === 0 ? '#12316a' : '#dbe4ef';
      context.beginPath(); context.moveTo(area.left, pixel.y); context.lineTo(area.right, pixel.y); context.stroke();
      if (y !== 0) { context.fillStyle = '#52647f'; context.fillText(String(y), toScreen({ x: 0, y: 0 }).x + 6, pixel.y - 4); }
    }
    context.fillStyle = '#12316a';
    context.font = '600 15px system-ui';
    context.fillText('x', area.right - 10, toScreen({ x: 0, y: 0 }).y - 8);
    context.fillText('y', toScreen({ x: 0, y: 0 }).x + 10, area.top + 12);
    context.restore();
  };

  const draw = () => {
    if (destroyed || !context) return;
    drawGrid();
    for (const region of scene.regions) {
      const first = toScreen({ x: region.xMin ?? settings.xRange[0], y: region.yMax ?? settings.yRange[1] });
      const second = toScreen({ x: region.xMax ?? settings.xRange[1], y: region.yMin ?? settings.yRange[0] });
      context.save(); context.fillStyle = region.color ?? 'rgba(11,154,163,.12)'; context.fillRect(first.x, first.y, second.x - first.x, second.y - first.y); context.restore();
    }
    for (const helper of scene.helpers) {
      if (helper.type === 'threshold') {
        const point = toScreen({ x: helper.axis === 'x' ? helper.value : 0, y: helper.axis === 'y' ? helper.value : 0 });
        const area = plot();
        strokePath(helper.axis === 'y' ? [toGraph({ x: area.left, y: point.y }), toGraph({ x: area.right, y: point.y })] : [toGraph({ x: point.x, y: area.top }), toGraph({ x: point.x, y: area.bottom })], helper.color ?? '#ff623e', 2, [8, 6]);
      }
    }
    for (const series of scene.series) {
      if (series.type === 'line') {
        const [x0, x1] = settings.xRange;
        strokePath([{ x: x0, y: series.m * x0 + series.b }, { x: x1, y: series.m * x1 + series.b }], series.color, series.width, series.dash);
      } else if (series.paths) {
        series.paths.forEach((path) => strokePath(path, series.color, series.width, series.dash));
      } else if (series.points) strokePath(series.points, series.color, series.width, series.dash);
    }
    for (const point of scene.points) {
      const pixel = toScreen(point);
      context.save(); context.fillStyle = point.color ?? '#ff623e'; context.strokeStyle = '#fff'; context.lineWidth = 3;
      context.beginPath(); context.arc(pixel.x, pixel.y, point.radius ?? 7, 0, Math.PI * 2); context.fill(); context.stroke();
      if (point.label) { context.fillStyle = '#12316a'; context.font = '600 13px system-ui'; context.fillText(point.label, pixel.x + 12, pixel.y - 10); }
      context.restore();
    }
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width || canvas.clientWidth || 640);
    height = Math.max(1, rect.height || canvas.clientHeight || 420);
    const dpr = Math.min(globalThis.devicePixelRatio || 1, 3);
    const pixelWidth = Math.round(width * dpr);
    const pixelHeight = Math.round(height * dpr);
    if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
    if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
    if (context) context.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  };

  if (!context) {
    fallback = document.createElement('p');
    fallback.className = 'graph-fallback';
    fallback.textContent = '图象暂不可用。可通过解析式、关键点和区间摘要继续学习。';
    canvas.hidden = true;
    canvas.after(fallback);
  } else {
    observer = new ResizeObserver(resize);
    observer.observe(canvas.parentElement ?? canvas);
    resize();
  }

  return {
    setScene(nextScene = {}) { scene = { ...emptyScene(), ...nextScene }; draw(); },
    toScreen,
    toGraph,
    resize,
    getSnapshot: () => ({ config: clone(settings), scene: clone(scene), size: { width, height } }),
    destroy() { destroyed = true; observer?.disconnect(); fallback?.remove(); },
  };
}
