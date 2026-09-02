import { expect, test } from '@playwright/test';

const lessonCounts = [15, 19, 17, 18, 21];
const routes = lessonCounts.flatMap((count, lessonIndex) => Array.from({ length: count }, (_, stepIndex) => ({
  lesson: String(lessonIndex + 1).padStart(2, '0'),
  step: String(stepIndex + 1).padStart(2, '0'),
})));
const scanRoutes = process.env.ROUTE_LIMIT ? routes.slice(0, Number(process.env.ROUTE_LIMIT)) : routes;

test.beforeEach(async ({ page }) => {
  const startupErrors = [];
  page.on('pageerror', (error) => startupErrors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') startupErrors.push(message.text()); });
  page.on('response', (response) => { if (response.status() >= 400) startupErrors.push(`${response.status()} ${response.url()}`); });
  await page.goto('./#/lesson/01/step/01');
  await page.waitForTimeout(150);
  if (startupErrors.length) throw new Error(`Startup errors: ${startupErrors.join(' | ')}`);
  await expect(page.locator('.classroom-shell')).toBeVisible();
});

test('all 90 routes fit the classroom viewport and render cleanly', async ({ page }) => {
  test.setTimeout(180_000);
  const errors = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));

  for (const route of scanRoutes) {
    await page.evaluate(({ lesson, step }) => { location.hash = `#/lesson/${lesson}/step/${step}`; }, route);
    const id = `L${route.lesson}-S${route.step}`;
    await expect(page.locator(`[data-step-id="${id}"]`)).toBeVisible();
    await expect(page.locator('[data-main-question]')).toBeVisible();
    await expect(page.locator('[data-ppt-source]')).toContainText('PPT');
    const overflow = await page.evaluate(() => ({
      x: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      y: document.documentElement.scrollHeight - document.documentElement.clientHeight,
      bodyX: document.body.scrollWidth - document.body.clientWidth,
      bodyY: document.body.scrollHeight - document.body.clientHeight,
    }));
    expect(overflow, `${id} should not create main-page scrolling`).toEqual({ x: 0, y: 0, bodyX: 0, bodyY: 0 });
  }
  expect(errors).toEqual([]);
});

test('graph lab, triad, animation, quick check and Teacher Mode are operable', async ({ page }) => {
  await page.goto('./#/lesson/02/step/04');
  const slider = page.locator('.lab-controls input[type="range"]').first();
  await slider.fill('-6');
  await expect(page.locator('.conclusion-card')).toContainText('第二、四象限');
  await page.locator('.graph-stage canvas').press('ArrowRight');
  const ghostControl = page.locator('[data-action="ghost"]');
  await ghostControl.click();
  await expect(ghostControl).toHaveAttribute('aria-pressed', 'true');

  await page.goto('./#/lesson/05/step/03');
  const reality = page.locator('.reality-panel input[type="range"]');
  const before = await page.locator('[data-reality-reading]').textContent();
  await reality.fill('8');
  await expect(page.locator('[data-reality-reading]')).not.toHaveText(before);
  await expect(page.locator('.triad-conclusion')).toContainText('为');

  await page.goto('./#/lesson/05/step/02');
  await page.getByRole('button', { name: /播放/ }).click();
  await page.waitForTimeout(120);
  await page.getByRole('button', { name: /暂停/ }).click();

  await page.goto('./#/lesson/01/step/07');
  const question = await page.locator('.quick-check h3').textContent();
  await page.locator('[data-answer]').first().click();
  await expect(page.locator('.quick-check__feedback')).not.toHaveText('请选择一个答案。');
  await page.getByRole('button', { name: '重试本题' }).click();
  await expect(page.locator('.quick-check__feedback')).toContainText('反馈已清空');
  await page.getByRole('button', { name: 'New Challenge' }).click();
  await expect(page.locator('.quick-check h3')).toBeVisible();
  expect(await page.locator('.quick-check h3').textContent()).toBeTruthy();

  await page.getByRole('button', { name: /教师模式/ }).click();
  await expect(page.locator('.teacher-panel')).toBeVisible();
  await expect(page.locator('.teacher-panel [data-route]')).toHaveCount(90);
  await page.locator('.teacher-panel [data-route="05/21"]').click();
  await expect(page.locator('[data-step-id="L05-S21"]')).toBeVisible();
  expect(question).toBeTruthy();
});

test('key classroom pages fit a 1280×720 display at 125% zoom equivalent', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'classroom-1280', 'One equivalent zoom run is sufficient.');
  await page.setViewportSize({ width: 1024, height: 576 });
  for (const hash of ['#/lesson/02/step/04', '#/lesson/05/step/03', '#/lesson/01/step/07']) {
    await page.goto(`./${hash}`);
    await expect(page.locator('.lesson-step')).toBeVisible();
    const evidence = await page.evaluate(() => {
      const selectors = ['[data-main-question]', '.step-body', '.observation-line', '[data-action="next"]'];
      const rects = selectors.map((selector) => {
        const rect = document.querySelector(selector)?.getBoundingClientRect();
        return rect ? { selector, top: rect.top, left: rect.left, right: rect.right, bottom: rect.bottom } : null;
      });
      return {
        width: innerWidth,
        height: innerHeight,
        overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        overflowY: document.documentElement.scrollHeight - document.documentElement.clientHeight,
        rects,
      };
    });
    expect(evidence.overflowX).toBe(0);
    expect(evidence.overflowY).toBe(0);
    for (const rect of evidence.rects) {
      expect(rect).not.toBeNull();
      expect(rect.left).toBeGreaterThanOrEqual(0);
      expect(rect.top).toBeGreaterThanOrEqual(0);
      expect(rect.right).toBeLessThanOrEqual(evidence.width + 1);
      expect(rect.bottom).toBeLessThanOrEqual(evidence.height + 1);
    }
  }
});
