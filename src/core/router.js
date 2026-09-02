const DEFAULT_ROUTE = { lessonId: '01', stepNumber: '01' };

export function parseHash(hash = globalThis.location?.hash ?? '') {
  const match = String(hash).match(/^#\/lesson\/(\d{1,2})\/step\/(\d{1,2})$/);
  if (!match) return { ...DEFAULT_ROUTE };
  return { lessonId: match[1].padStart(2, '0'), stepNumber: match[2].padStart(2, '0') };
}

export function routeToHash({ lessonId, stepNumber }) {
  return `#/lesson/${String(lessonId).padStart(2, '0')}/step/${String(stepNumber).padStart(2, '0')}`;
}

export function createHashRouter(onRoute) {
  const notify = () => onRoute(parseHash());
  globalThis.addEventListener?.('hashchange', notify);
  return {
    start() { if (!globalThis.location.hash) globalThis.location.hash = routeToHash(DEFAULT_ROUTE); else notify(); },
    navigate(route) { globalThis.location.hash = routeToHash(route); },
    destroy() { globalThis.removeEventListener?.('hashchange', notify); },
  };
}
