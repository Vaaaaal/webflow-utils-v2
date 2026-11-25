/**
 * webflow-utils v2 / core/dom
 * Résout quand le DOM est parsé : DOMContentLoaded si la page charge encore,
 * immédiatement sinon (même comportement que le démarrage des modules v1).
 */
export function domReady() {
  if (document.readyState !== 'loading') return Promise.resolve();
  return new Promise(resolve => {
    document.addEventListener('DOMContentLoaded', () => resolve(), { once: true });
  });
}
