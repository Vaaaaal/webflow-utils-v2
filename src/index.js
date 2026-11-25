/**
 * webflow-utils v2 / entrée npm
 *
 *   import { start, animate, anchor } from '@vaaal/webflow-utils';
 *   start(animate, anchor);
 *
 * Chaque module s'importe aussi seul (meilleur tree-shaking) :
 *   import animate from '@vaaal/webflow-utils/animation/animate';
 */
import { boot } from './core/boot.js';

export { default as combine } from './modules/cms/combine.js';
export { default as localizeDate } from './modules/cms/localize-date.js';
export { default as sortDirection } from './modules/finsweet/sort-direction.js';
export { default as listVariants } from './modules/rich-text/list-variants.js';
export { default as blockquoteAuthor } from './modules/rich-text/blockquote-author.js';
export { default as askAi } from './modules/ai/ask-ai.js';
export { default as obfuscate } from './modules/links/obfuscate.js';
export { default as obfuscateOnclick } from './modules/links/obfuscate-onclick.js';
export { default as anchor } from './modules/links/anchor.js';
export { default as animate } from './modules/animation/animate.js';
export { default as transition } from './modules/animation/page-transition.js';

export { boot };
export { ensureGsap } from './core/gsap.js';

/** Démarre un ou plusieurs modules (API sur window.WU, puis init au DOM ready). */
export function start(...modules) {
  return Promise.all(modules.map(boot));
}
