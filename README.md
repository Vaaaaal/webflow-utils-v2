# webflow-utils v2

Scripts prêts à l'emploi pour étendre Webflow, pilotés par **custom attributes** (`wu-*`).

Nouveauté de la v2 : **un seul lien** pour tous les modules, sur le modèle de Finsweet Attributes v2. Tu listes les modules voulus en attributs sur la balise, et seuls ceux-là sont téléchargés.

```html
<script async type="module"
  src="https://cdn.jsdelivr.net/npm/@vaaal/webflow-utils@2/dist/wu.js"
  wu-animate wu-transition wu-anchor></script>
```

> La v1 ([`Vaaaaal/webflow-utils`](https://github.com/Vaaaaal/webflow-utils)) reste en ligne et inchangée : les sites existants continuent de fonctionner. Les **custom attributes des modules sont identiques** entre v1 et v2 — voir [MIGRATION.md](./MIGRATION.md).

---

## 🧰 Modules

| Attribut sur le loader | Module | Description | Doc |
|---|---|---|---|
| `wu-combine` | `cms/combine` | Fusionne plusieurs Collection Lists en une, avec tri et limite. | [doc](./docs/modules/cms/combine.md) |
| `wu-localize-date` | `cms/localize-date` | Reformate les dates CMS selon la langue de la page (Intl). | [doc](./docs/modules/cms/localize-date.md) |
| `wu-sort-direction` | `finsweet/sort-direction` | Direction fixe (asc/desc) pour les sort triggers Finsweet List Sort. | [doc](./docs/modules/finsweet/sort-direction.md) |
| `wu-list-variants` | `rich-text/list-variants` | Variantes de listes Rich Text (checks, flèches…) via un marqueur. | [doc](./docs/modules/rich-text/list-variants.md) |
| `wu-blockquote-author` | `rich-text/blockquote-author` | Blockquotes Rich Text → `<figure>` + `<figcaption>` auteur. | [doc](./docs/modules/rich-text/blockquote-author.md) |
| `wu-ask-ai` | `ai/ask-ai` | Liens vers ChatGPT / Claude / Perplexity… avec prompt pré-rempli. | [doc](./docs/modules/ai/ask-ai.md) |
| `wu-obfuscate` | `links/obfuscate` | Liens / emails / tél. encodés en Base64, décodés au runtime. | [doc](./docs/modules/links/obfuscate.md) |
| `wu-obfuscate-onclick` | `links/obfuscate-onclick` | Obfuscation SEO simplifiée (onclick) sur n'importe quel élément. | [doc](./docs/modules/links/obfuscate-onclick.md) |
| `wu-anchor` | `links/anchor` | Ajoute une ancre `#id` à un lien de page Webflow. | [doc](./docs/modules/links/anchor.md) |
| `wu-animate` | `animation/animate` | Apparitions au scroll (fade, scale, blur…) + groupes en stagger. GSAP. | [doc](./docs/modules/animation/animate.md) |
| `wu-transition` | `animation/page-transition` | Transitions de page sans Barba (overlay GSAP). + snippet `<head>`. | [doc](./docs/modules/animation/page-transition.md) |

---

## 🚀 Installation

### 1. Le loader (recommandé)

Dans **Project Settings → Custom Code → Footer Code** :

```html
<script async type="module"
  src="https://cdn.jsdelivr.net/npm/@vaaal/webflow-utils@2/dist/wu.js"
  wu-combine wu-animate></script>
```

- `@2` suit la dernière 2.x. Pour figer une version exacte en prod : `@2.0.0`.
- Un attribut mal orthographié (`wu-animat`) affiche un warning dans la console.
- Une fois chargé, le loader retire ces attributs de sa balise et pose `wu-loaded="combine animate"` (pratique pour vérifier dans l'inspecteur).
- **GSAP** : s'il est déjà sur la page (GSAP natif de Webflow, ou `<script>` manuel), il est réutilisé. Sinon `animate` / `page-transition` le chargent eux-mêmes depuis jsDelivr, une seule fois.
- `page-transition` a toujours besoin de son **snippet inline dans le `<head>`** : voir [sa doc](./docs/modules/animation/page-transition.md) ou [`snippets/page-transition/head.html`](./snippets/page-transition/head.html).

### 2. Script seul (comme en v1)

Chaque module existe aussi en script classique autonome :

```html
<script src="https://cdn.jsdelivr.net/npm/@vaaal/webflow-utils@2/dist/standalone/links/anchor.js"></script>
```

### 3. npm (projets avec bundler : Astro, Vite, Webflow Cloud…)

```bash
npm i @vaaal/webflow-utils
```

```js
import { start, animate, anchor } from '@vaaal/webflow-utils';
start(animate, anchor); // expose window.WU.*, puis init au DOM ready
```

Ou module par module : `import animate from '@vaaal/webflow-utils/animation/animate'`.

---

## 🔌 API JavaScript

### `window.WU.{module}` — comme en v1

Chaque module expose son API sur `window.WU` : `WU.combine.init()`, `WU.animate.presets`, `WU.transition.go('/contact')`, `WU.obfuscate.encode('…')`… Utile pour relancer un module après injection de contenu (CMS Load, modals, AJAX).

### `window.WebflowUtils.push` — code qui dépend d'un module

Le loader est asynchrone : un `<script>` posé après lui s'exécute **avant** que les modules soient chargés. Pour ajouter un preset ou appeler l'API d'un module sans se soucier de l'ordre :

```html
<script>
  window.WebflowUtils = window.WebflowUtils || [];
  window.WebflowUtils.push(['animate', (animate) => {
    animate.presets['mon-site-pop'] = o => ({ from: { scale: 0.7 }, to: { scale: 1 } });
  }]);
</script>
```

Le callback reçoit l'API du module. Poussé avant son chargement, il s'exécute **avant son premier `init()`** (c'est ce qui permet d'ajouter des presets) ; poussé après, il s'exécute tout de suite.

### Événement `wu:ready`

Émis sur `document` après le premier `init()` de chaque module :

```js
document.addEventListener('wu:ready', (e) => console.log(e.detail.key, e.detail.api));
```

---

## 🛠️ Développement

```bash
npm install
npm run build    # dist/
npm run dev      # rebuild à chaque modification
npm run serve    # http://localhost:4173/test/
```

| Page de test | Vérifie |
|---|---|
| `test/index.html` | Loader + 9 modules, GSAP chargé automatiquement, preset via `WebflowUtils.push`. Le titre de l'onglet affiche `DONE 0 KO` si tout passe. |
| `test/standalone.html` | Scripts standalone + pattern v1 (`WU.animate.presets[…] =` juste après le script). |
| `test/transition-a.html` ↔ `transition-b.html` | Transition de page avec snippet `<head>` + retenue des apparitions `wu-animate`. |

### Structure

```
src/
├── wu.js              ← loader (entrée CDN)
├── index.js           ← entrée npm
├── registry.js        ← attribut → import() du module
├── core/              ← code partagé (boot, file WebflowUtils, DOM ready, GSAP)
└── modules/<catégorie>/<module>.js
docs/modules/…         ← doc de chaque module
snippets/              ← HTML à coller inline (head page-transition, prompts ask-ai)
dist/                  ← généré par npm run build (publié sur npm, servi par jsDelivr)
```

### Ajouter un module

1. Créer `src/modules/<catégorie>/<nom>.js` qui exporte `export default { key, api, init }` :
   - `key` : nom sur `window.WU` et dans `WebflowUtils.push` (camelCase) ;
   - `api` : ce qui est exposé (au minimum `{ init }`) ;
   - `init` : premier démarrage, appelé au DOM ready (peut être `async`).
2. L'ajouter dans `src/registry.js` (attribut `wu-<nom>`) et dans `src/index.js`.
3. Documenter dans `docs/modules/<catégorie>/<nom>.md` et dans le tableau ci-dessus.

Conventions des modules inchangées depuis la v1 : attributs préfixés `wu-<module>-`, échecs silencieux, idempotence via `wu-<module>-applied`, compatibles IX2 / Finsweet.

### Publier

```bash
npm version patch   # ou minor / major
npm publish --access public
```

jsDelivr sert automatiquement la nouvelle version (`@2` suit la dernière 2.x, le cache peut prendre quelques minutes).

---

## 📄 Licence

[MIT](./LICENSE) — [Valentin Cassus](https://vaaal.fr)
