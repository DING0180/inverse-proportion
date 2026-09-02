import { describe, expect, it } from 'vitest';
import { createQuestionGenerator, QUESTION_FAMILIES } from '../src/interactions/question-generator.js';

describe('random question generator', () => {
  it('is reproducible with a seed', () => {
    const first = createQuestionGenerator({ seed: 2026, families: QUESTION_FAMILIES });
    const second = createQuestionGenerator({ seed: 2026, families: QUESTION_FAMILIES });
    expect(first.next({ family: 'function-recognition', lessonId: '01' })).toEqual(
      second.next({ family: 'function-recognition', lessonId: '01' }),
    );
  });

  it('produces complete questions and avoids immediate repeats', () => {
    const generator = createQuestionGenerator({ seed: 8, families: QUESTION_FAMILIES, historySize: 5 });
    const questions = Array.from({ length: 6 }, () => generator.next({ family: 'point-to-k', lessonId: '01' }));
    for (const question of questions) {
      expect(question.id).toBeTruthy();
      expect(question.correctAnswer).not.toBeUndefined();
      expect(question.explanation).toBeTruthy();
      expect(question.sourceStep).toBeTruthy();
    }
    expect(new Set(questions.slice(0, 5).map((question) => question.id)).size).toBe(5);
  });
});
