/**
 * webflow-utils v2 / loader
 *
 * Un seul script pour tous les modules, sur le modèle de Finsweet Attributes v2 :
 *
 *   <script async type="module"
 *     src="https://cdn.jsdelivr.net/npm/@vaaal/webflow-utils@2/dist/wu.js"
 *     wu-animate wu-transition wu-anchor></script>
 *
 * Le loader lit les attributs wu-* de SA propre balise, et ne télécharge que
 * les modules demandés (import() dynamique, un fichier par module).
 */
import { registry } from './registry.js';
import { boot } from './core/boot.js';

const PREFIX = 'wu-';

// Avec type="module", document.currentScript vaut null : on retrouve la
// balise en comparant son URL résolue à celle de ce fichier.
function findOwnScript() {
  const here = import.meta.url;
  const scripts = Array.from(document.querySelectorAll('script[src]'));
  return (
    scripts.find(s => s.src === here) ||
    scripts.find(s => /webflow-utils.*\/wu(\.min)?\.js(\?|$)/.test(s.src) && hasModuleAttr(s)) ||
    null
  );
}

function hasModuleAttr(script) {
  return Array.from(script.attributes).some(a => a.name in registry);
}

function start() {
  const script = findOwnScript();
  if (!script) {
    console.warn('[wu] balise <script> du loader introuvable — aucun module chargé.');
    return;
  }

  const requested = [];
  Array.from(script.attributes).forEach(attr => {
    if (!attr.name.startsWith(PREFIX) || attr.name === 'wu-loaded') return;
    if (attr.name in registry) {
      requested.push(attr.name);
    } else if (!Object.keys(registry).some(name => attr.name.startsWith(name + '-'))) {
      // (wu-animate-applied, wu-transition-… sont des attributs d'état ou
      // d'options d'un module connu : pas de warning pour eux.)
      console.warn(`[wu] module inconnu : "${attr.name}" — vérifier l'orthographe.`);
    }
  });

  // On retire les attributs de la balise : sinon les sélecteurs des modules
  // ([wu-animate], [wu-combine]…) la prendraient pour un élément à traiter.
  // wu-loaded garde une trace lisible dans l'inspecteur.
  requested.forEach(name => script.removeAttribute(name));
  script.setAttribute('wu-loaded', requested.map(n => n.slice(PREFIX.length)).join(' '));

  requested.forEach(name => {
    registry[name]()
      .then(m => boot(m.default))
      .catch(err => console.error(`[wu] impossible de charger ${name}`, err));
  });
}

start();
