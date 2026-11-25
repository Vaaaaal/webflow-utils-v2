/**
 * webflow-utils v2 / registry
 *
 * Attribut posé sur la balise <script> du loader → module à charger.
 * Les import() doivent rester STATIQUES (chaîne littérale) : c'est ce qui
 * permet au bundler de découper chaque module en fichier séparé.
 *
 * L'attribut est le préfixe des custom attributes du module (wu-combine,
 * wu-animate…) pour qu'il n'y ait qu'un seul nom à retenir.
 */
export const registry = {
  // CMS
  'wu-combine': () => import('./modules/cms/combine.js'),
  'wu-localize-date': () => import('./modules/cms/localize-date.js'),
  // Finsweet
  'wu-sort-direction': () => import('./modules/finsweet/sort-direction.js'),
  // Rich Text
  'wu-list-variants': () => import('./modules/rich-text/list-variants.js'),
  'wu-blockquote-author': () => import('./modules/rich-text/blockquote-author.js'),
  // AI
  'wu-ask-ai': () => import('./modules/ai/ask-ai.js'),
  // Links
  'wu-obfuscate': () => import('./modules/links/obfuscate.js'),
  'wu-obfuscate-onclick': () => import('./modules/links/obfuscate-onclick.js'),
  'wu-anchor': () => import('./modules/links/anchor.js'),
  // Animation
  'wu-animate': () => import('./modules/animation/animate.js'),
  'wu-transition': () => import('./modules/animation/page-transition.js')
};
