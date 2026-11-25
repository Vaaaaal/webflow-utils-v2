/**
 * webflow-utils v2 / core/gsap
 *
 * Garantit que GSAP (et les plugins demandés) sont disponibles.
 * - Déjà sur la page (GSAP natif Webflow, ou <script> posé à la main) :
 *   on l'utilise tel quel, rien n'est chargé.
 * - Absent : chargé une seule fois depuis jsDelivr, partagé entre tous les
 *   modules (et entre plusieurs bundles webflow-utils sur la même page).
 *
 * Renvoie window.gsap, ou rejette si le chargement échoue.
 */

export const GSAP_VERSION = '3.15.1';
const CDN = `https://cdn.jsdelivr.net/npm/gsap@${GSAP_VERSION}/dist/`;

function loadScript(src) {
  const cache = (window.__wuScripts = window.__wuScripts || {});
  if (!cache[src]) {
    cache[src] = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = false;
      s.onload = () => resolve();
      s.onerror = () => {
        delete cache[src];
        reject(new Error(`[wu] impossible de charger ${src}`));
      };
      document.head.appendChild(s);
    });
  }
  return cache[src];
}

/**
 * @param {string[]} plugins Noms globaux des plugins (ex. ['ScrollTrigger']).
 */
export async function ensureGsap(plugins = []) {
  if (typeof window.gsap === 'undefined') {
    await loadScript(CDN + 'gsap.min.js');
  }
  for (const name of plugins) {
    if (typeof window[name] === 'undefined') {
      await loadScript(CDN + name + '.min.js');
    }
    window.gsap.registerPlugin(window[name]);
  }
  return window.gsap;
}
