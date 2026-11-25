/**
 * webflow-utils v2 / core/boot
 *
 * Démarre un module, de la même façon qu'il soit chargé par le loader (wu.js),
 * par un script standalone, ou importé depuis npm :
 *
 *   1. expose son API sur window.WU.{key}  (compatible v1 : WU.animate.init()…)
 *   2. exécute les callbacks WebflowUtils.push en attente (presets, etc.)
 *   3. attend le DOM, puis lance init()
 *   4. émet `wu:ready` sur document  (detail : { key, api })
 *
 * Un module est un objet { key, api, init } :
 *   - key  : nom sur window.WU et dans WebflowUtils.push
 *   - api  : ce qui est exposé publiquement (au minimum { init })
 *   - init : premier démarrage (peut être async, ex. chargement de GSAP)
 */
import { register } from './queue.js';
import { domReady } from './dom.js';

export async function boot(mod) {
  if (!mod || !mod.key) throw new Error('[wu] module invalide');

  const WU = (window.WU = window.WU || {});
  // Garde partagée entre bundles : un module chargé deux fois (loader +
  // standalone, ou deux balises) ne démarre qu'une fois.
  if (!WU.__started) Object.defineProperty(WU, '__started', { value: {} });
  if (WU.__started[mod.key]) {
    console.warn(`[wu] ${mod.key} est chargé plusieurs fois sur la page — second chargement ignoré.`);
    return WU[mod.key];
  }
  WU.__started[mod.key] = true;
  WU[mod.key] = mod.api;

  register(mod.key, mod.api);

  await domReady();
  try {
    await mod.init();
  } catch (err) {
    console.error(`[wu] ${mod.key} : init en erreur`, err);
  }

  document.dispatchEvent(new CustomEvent('wu:ready', { detail: { key: mod.key, api: mod.api } }));
  return mod.api;
}
