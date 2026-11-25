# Migrer un site de la v1 à la v2

Les **custom attributes posés dans le Designer ne changent pas**. Seul le Custom Code change.

## 1. Remplacer les balises v1 par le loader

Avant (v1) :

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/Vaaaaal/webflow-utils@main/animation/animate/animate.js"></script>
<script src="https://cdn.jsdelivr.net/gh/Vaaaaal/webflow-utils@anchor-1.0.2/links/anchor/anchor.js"></script>
```

Après (v2) :

```html
<script async type="module"
  src="https://cdn.jsdelivr.net/npm/@vaaal/webflow-utils@2/dist/wu.js"
  wu-animate wu-anchor></script>
```

Les balises GSAP peuvent rester (elles seront réutilisées) ou être retirées (GSAP est alors chargé automatiquement). Si GSAP est activé nativement dans les réglages Webflow, rien à faire.

| Script v1 | Attribut v2 |
|---|---|
| `cms/combine/combine.js` | `wu-combine` |
| `cms/localize-date/localize-date.js` | `wu-localize-date` |
| `finsweet/sort-direction/sort-direction.js` | `wu-sort-direction` |
| `rich-text/list-variants/list-variants.js` | `wu-list-variants` |
| `rich-text/blockquote-author/blockquote-author.js` | `wu-blockquote-author` |
| `ai/ask-ai/ask-ai.js` | `wu-ask-ai` |
| `links/obfuscate/obfuscate.js` | `wu-obfuscate` |
| `links/obfuscate-onclick/obfuscate-onclick.js` | `wu-obfuscate-onclick` |
| `links/anchor/anchor.js` | `wu-anchor` |
| `animation/animate/animate.js` | `wu-animate` |
| `animation/page-transition/page-transition.js` | `wu-transition` |

## 2. Code custom qui touche à `WU.*` juste après un script

C'est le seul vrai changement de comportement. En v1, un `<script>` posé juste après `animate.js` pouvait écrire `WU.animate.presets[…] = …`. Avec le loader (asynchrone), ce script s'exécute **avant** le module : `WU.animate` n'existe pas encore.

À remplacer par la file `WebflowUtils` :

```html
<script>
  window.WebflowUtils = window.WebflowUtils || [];
  window.WebflowUtils.push(['animate', (animate) => {
    animate.presets['iskera-blur-in'] = o => ({ from: { filter: 'blur(12px)' }, to: { filter: 'blur(0px)' } });
  }]);
</script>
```

Même chose pour `WU.transition.presets`. Les appels faits plus tard (au clic, après un CMS Load…) comme `WU.combine.init()` ou `WU.transition.go()` n'ont pas besoin de changer.

> Les scripts **standalone** (`dist/standalone/…`) se comportent exactement comme en v1 : l'ancienne façon de faire y marche toujours.

## 3. page-transition : mettre à jour le snippet `<head>`

Une seule ligne change dans le snippet : les balises `<script>` sont exclues de la retenue des apparitions (sinon la balise du loader, qui porte `wu-animate`, était marquée elle aussi).

```diff
- var a = document.querySelectorAll('[wu-animate], [wu-animate-group]');
+ var a = document.querySelectorAll('[wu-animate]:not(script), [wu-animate-group]');
```

Le snippet complet est dans [`snippets/page-transition/head.html`](./snippets/page-transition/head.html).

## Autres différences

- GSAP n'est plus obligatoire avant les scripts : chargé automatiquement s'il manque. `page-transition` ne le charge que si la page a un overlay.
- Code minifié : par exemple `animate` passe de 13 Ko à 5,7 Ko, `page-transition` de 19,5 Ko à 10,2 Ko.
- Versioning unique pour tous les modules (`@2`, `@2.0.0`…) au lieu des tags par module.
- Un module chargé deux fois sur la même page (loader + standalone) ne démarre qu'une fois, avec un warning.
