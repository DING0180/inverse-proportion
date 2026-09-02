import katex from 'katex';

export function renderFormula(target, latex, options = {}) {
  target.dataset.latex = latex;
  target.setAttribute('aria-label', options.ariaLabel ?? latex.replaceAll('\\', ''));
  try {
    katex.render(latex, target, {
      throwOnError: false,
      strict: false,
      trust: false,
      displayMode: options.displayMode ?? true,
      output: 'htmlAndMathml',
    });
  } catch {
    target.textContent = latex;
    target.classList.add('formula-fallback');
  }
  return target;
}

export function createFormula(latex, className = 'formula-card') {
  const element = document.createElement('div');
  element.className = className;
  return renderFormula(element, latex);
}
