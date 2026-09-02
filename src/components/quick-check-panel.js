import { createQuestionGenerator, QUESTION_FAMILIES } from '../interactions/question-generator.js';

const FAMILY_BY_LESSON = { '01': 'function-recognition', '02': 'graph-match', '03': 'area', '04': 'real-model', '05': 'piecewise' };

export function createQuickCheckPanel({ step, lesson }) {
  const generator = createQuestionGenerator({ seed: Number(`${lesson.id}${step.number}`), families: QUESTION_FAMILIES });
  const element = document.createElement('section');
  element.className = 'quick-check';
  let question;

  const render = () => {
    question = generator.next({ family: FAMILY_BY_LESSON[lesson.id], lessonId: lesson.id });
    element.innerHTML = `
      <div class="quick-check__header"><span>随机检测 · 每轮 1 题</span><strong>先判断，再说明理由</strong></div>
      <h3>${question.prompt}</h3>
      <div class="quick-check__choices" role="group" aria-label="答案选项"></div>
      <p class="quick-check__feedback" aria-live="polite">请选择一个答案。</p>
      <div class="quick-check__actions">
        <button class="button button--quiet" data-action="retry" type="button">重试本题</button>
        <button class="button button--primary" data-action="new-challenge" type="button">New Challenge</button>
      </div>`;
    const choices = element.querySelector('.quick-check__choices');
    question.choices.forEach((choice, index) => {
      const button = document.createElement('button');
      button.className = 'choice-button';
      button.type = 'button';
      button.dataset.answer = String(choice);
      button.textContent = `${String.fromCharCode(65 + index)}. ${choice}`;
      choices.append(button);
    });
  };

  const onClick = (event) => {
    const choice = event.target.closest('[data-answer]');
    const feedback = element.querySelector('.quick-check__feedback');
    if (choice) {
      const correct = String(question.correctAnswer) === choice.dataset.answer;
      element.querySelectorAll('[data-answer]').forEach((button) => button.classList.remove('is-correct', 'is-wrong'));
      choice.classList.add(correct ? 'is-correct' : 'is-wrong');
      feedback.textContent = correct ? `正确。${question.explanation}` : `再想一步：先找出不变量。${question.explanation}`;
      feedback.dataset.state = correct ? 'correct' : 'wrong';
    }
    if (event.target.closest('[data-action="retry"]')) {
      element.querySelectorAll('[data-answer]').forEach((button) => button.classList.remove('is-correct', 'is-wrong'));
      feedback.textContent = '反馈已清空，请重新作答。';
      delete feedback.dataset.state;
    }
    if (event.target.closest('[data-action="new-challenge"]')) render();
  };
  render();
  element.addEventListener('click', onClick);
  return { element, reset: render, destroy: () => element.removeEventListener('click', onClick) };
}
