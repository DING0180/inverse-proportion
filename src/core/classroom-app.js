import { createHashRouter } from './router.js';

const flattenCourse = (course) => course.lessons.flatMap((lesson) => lesson.steps.map((step) => ({ lesson, step })));

function stepRail(lesson, currentIndex) {
  const start = Math.max(0, Math.min(currentIndex - 3, lesson.steps.length - 7));
  const visible = lesson.steps.slice(start, start + 7);
  const parts = visible.map((step) => `<button type="button" class="step-rail__item ${step.number === lesson.steps[currentIndex].number ? 'is-current' : ''}" data-route="${lesson.id}/${step.number}" aria-label="步骤 ${step.number} ${step.title}" ${step.number === lesson.steps[currentIndex].number ? 'aria-current="step"' : ''}><span>${step.number}</span><small>${step.title}</small></button>`);
  if (start + 7 < lesson.steps.length) parts.push(`<span class="step-rail__more">… ${lesson.steps.length}</span>`);
  return parts.join('');
}

function teacherPanel(course) {
  return `<aside class="teacher-panel" hidden aria-label="教师模式面板"><div class="teacher-panel__head"><div><span class="eyebrow">TEACHER MODE</span><h2>课堂控制台</h2></div><button type="button" class="icon-button" data-action="close-teacher" aria-label="关闭教师模式">×</button></div><div class="teacher-actions"><button type="button" data-action="reveal">揭示下一步</button><button type="button" data-action="reset">重置当前页</button><button type="button" data-action="fullscreen">全屏</button></div><div class="teacher-routes">${course.lessons.map((lesson) => `<section><h3>Lesson ${lesson.id} · ${lesson.title}</h3><div>${lesson.steps.map((step) => `<button type="button" data-route="${lesson.id}/${step.number}"><b>${step.number}</b><span>${step.title}</span></button>`).join('')}</div></section>`).join('')}</div></aside>`;
}

function courseHome(course) {
  return `<section class="course-home" data-course-home>
    <div class="course-home__hero">
      <div class="course-home__copy">
        <span class="eyebrow">INVERSE PROPORTION · 反比例函数</span>
        <h1>让关系可操作，<br>让图象会说话。</h1>
        <p>从不变量出发，穿过双曲线、面积与真实问题。五节课把 Reality、Equation、Graph 连成同一条思考链。</p>
        <button type="button" class="home-start" data-action="start-learning">开始学习 <span>→</span></button>
        <div class="course-home__facts" aria-label="课程概览"><strong>5 <small>LESSONS</small></strong><strong>90 <small>STEPS</small></strong><strong>1 <small>CORE IDEA</small></strong></div>
      </div>
      <div class="course-home__visual" aria-hidden="true">
        <div class="home-axis home-axis--x"></div><div class="home-axis home-axis--y"></div>
        <svg viewBox="0 0 520 360" role="presentation"><path d="M28 38 C94 43 143 68 183 113 C218 153 235 189 254 282"/><path d="M270 82 C290 177 308 217 342 257 C380 301 430 324 496 329"/></svg>
        <span class="home-point home-point--one">xy = k</span><span class="home-point home-point--two">k ≠ 0</span>
        <div class="home-invariant">不变量<br><strong>k</strong></div>
      </div>
    </div>
    <div class="course-home__map">
      <div><span class="eyebrow">LEARNING PATH</span><h2>五节课，一条能力主线</h2></div>
      <div class="lesson-entrances">${course.lessons.map((lesson) => `<button type="button" data-route="${lesson.id}/01"><span>0${Number(lesson.id)}</span><b>${lesson.ability}</b><small>${lesson.title}</small></button>`).join('')}</div>
    </div>
  </section>`;
}

export function createClassroomApp({ root, course, registry, initialRoute = { lessonId: '01', stepNumber: '01' }, useHashRouter = true }) {
  const allSteps = flattenCourse(course);
  let route = { ...initialRoute };
  let currentHandle = null;
  let router = null;
  let destroyed = false;

  root.innerHTML = `<div class="classroom-shell">
    <header class="app-header">
      <div class="brand-mark" aria-hidden="true">∝</div>
      <div class="app-title"><strong>${course.title}</strong><span>${course.subtitle}</span></div>
      <div class="header-divider"></div>
      <div class="lesson-identity"><span data-lesson-code></span><strong data-lesson-title></strong></div>
      <div class="step-counter" data-current-step></div>
      <button type="button" class="teacher-button" data-action="teacher-mode">◎ 教师模式</button>
    </header>
    <nav class="step-rail" aria-label="本课步骤"></nav>
    <main class="classroom-stage" id="main-content" tabindex="-1"></main>
    <footer class="classroom-footer">
      <button type="button" class="nav-button nav-button--previous" data-action="previous">← <span>上一步</span></button>
      <div class="ability-track"><span>能力主线</span><strong data-ability></strong><i></i><small data-position></small></div>
      <button type="button" class="nav-button nav-button--next" data-action="next"><span>下一步</span> →</button>
    </footer>
    ${teacherPanel(course)}
    <div class="teacher-backdrop" hidden data-action="close-teacher"></div>
  </div>`;

  const shell = root.querySelector('.classroom-shell');
  const stage = root.querySelector('.classroom-stage');
  const rail = root.querySelector('.step-rail');
  const panel = root.querySelector('.teacher-panel');
  const backdrop = root.querySelector('.teacher-backdrop');

  const findIndex = (nextRoute) => allSteps.findIndex(({ lesson, step }) => lesson.id === String(nextRoute.lessonId).padStart(2, '0') && step.number === String(nextRoute.stepNumber).padStart(2, '0'));

  const renderRoute = (nextRoute) => {
    if (destroyed) return;
    if (nextRoute?.page === 'home') {
      currentHandle?.destroy(); currentHandle = null;
      route = { page: 'home' };
      shell.classList.add('is-home');
      stage.innerHTML = courseHome(course);
      rail.replaceChildren();
      root.querySelector('[data-lesson-code]').textContent = '5 Lessons';
      root.querySelector('[data-lesson-title]').textContent = '从关系到决策';
      root.querySelector('[data-current-step]').textContent = '90 Steps';
      document.title = course.title;
      return;
    }
    let index = findIndex(nextRoute);
    if (index < 0) index = 0;
    const { lesson, step } = allSteps[index];
    route = { lessonId: lesson.id, stepNumber: step.number };
    shell.classList.remove('is-home');
    currentHandle?.destroy();
    currentHandle = registry.render(step, { lesson, course });
    stage.replaceChildren(currentHandle.element);
    root.querySelector('[data-lesson-code]').textContent = `Lesson ${lesson.id} · ${lesson.code}`;
    root.querySelector('[data-lesson-title]').textContent = lesson.title;
    root.querySelector('[data-current-step]').textContent = `${step.number} / ${lesson.steps.length}`;
    root.querySelector('[data-ability]').textContent = lesson.ability;
    root.querySelector('[data-position]').textContent = `${index + 1} / ${allSteps.length}`;
    root.querySelector('.ability-track i').style.width = `${((index + 1) / allSteps.length) * 100}%`;
    rail.innerHTML = stepRail(lesson, lesson.steps.indexOf(step));
    root.querySelector('[data-action="previous"]').disabled = index === 0;
    root.querySelector('[data-action="next"]').disabled = index === allSteps.length - 1;
    panel.querySelectorAll('[data-route]').forEach((button) => button.classList.toggle('is-current', button.dataset.route === `${lesson.id}/${step.number}`));
    document.title = `${step.title} · ${course.title}`;
  };

  const navigateIndex = (offset) => {
    const index = findIndex(route);
    const target = allSteps[Math.max(0, Math.min(allSteps.length - 1, index + offset))];
    if (!target) return;
    const nextRoute = { lessonId: target.lesson.id, stepNumber: target.step.number };
    if (useHashRouter) router.navigate(nextRoute); else renderRoute(nextRoute);
  };

  const setTeacherOpen = (open) => {
    panel.hidden = !open; backdrop.hidden = !open; shell.classList.toggle('teacher-open', open);
    if (open) panel.querySelector('button')?.focus();
  };

  const onClick = (event) => {
    const routeButton = event.target.closest('[data-route]');
    if (routeButton) {
      const [lessonId, stepNumber] = routeButton.dataset.route.split('/');
      if (useHashRouter) router.navigate({ lessonId, stepNumber }); else renderRoute({ lessonId, stepNumber });
      setTeacherOpen(false); return;
    }
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'start-learning') {
      const firstRoute = { lessonId: '01', stepNumber: '01' };
      if (useHashRouter) router.navigate(firstRoute); else renderRoute(firstRoute);
    }
    if (action === 'previous') navigateIndex(-1);
    if (action === 'next') navigateIndex(1);
    if (action === 'teacher-mode') setTeacherOpen(true);
    if (action === 'close-teacher') setTeacherOpen(false);
    if (action === 'reveal') currentHandle?.reveal();
    if (action === 'reset') currentHandle?.reset();
    if (action === 'fullscreen') document.documentElement.requestFullscreen?.();
  };
  const onKey = (event) => {
    if (event.key === 'Escape') setTeacherOpen(false);
    if (event.altKey && event.key === 'ArrowRight') navigateIndex(1);
    if (event.altKey && event.key === 'ArrowLeft') navigateIndex(-1);
  };
  shell.addEventListener('click', onClick); globalThis.addEventListener?.('keydown', onKey);
  if (useHashRouter) { router = createHashRouter(renderRoute); router.start(); } else renderRoute(initialRoute);

  return {
    renderRoute,
    getRoute: () => ({ ...route }),
    destroy() { destroyed = true; currentHandle?.destroy(); router?.destroy(); shell.removeEventListener('click', onClick); globalThis.removeEventListener?.('keydown', onKey); root.replaceChildren(); },
  };
}
