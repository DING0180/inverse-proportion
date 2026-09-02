const HOME_ROUTE = { page: 'home' };

export function parseHash(hash = globalThis.location?.hash ?? '') {
  const match = String(hash).match(/^#\/lesson\/(\d{1,2})\/step\/(\d{1,2})$/);
  if (!match) return { ...HOME_ROUTE };
  return { lessonId: match[1].padStart(2, '0'), stepNumber: match[2].padStart(2, '0') };
}

export function routeToHash({ page, lessonId, stepNumber }) {
  if (page === 'home') return '#/';
  return `#/lesson/${String(lessonId).padStart(2, '0')}/step/${String(stepNumber).padStart(2, '0')}`;
}

export function createHashRouter(onRoute) {
  const notify = () => onRoute(parseHash());
  globalThis.addEventListener?.('hashchange', notify);
  return {
    start() { notify(); },
    navigate(route) { globalThis.location.hash = routeToHash(route); },
    destroy() { globalThis.removeEventListener?.('hashchange', notify); },
  };
}
