/**
 * webflow-utils v2 / core/queue
 *
 * File d'attente globale `window.WebflowUtils`, sur le modèle de
 * `window.FinsweetAttributes`. Elle permet d'écrire du code qui dépend d'un
 * module sans savoir s'il est déjà chargé (le loader est asynchrone) :
 *
 *   window.WebflowUtils = window.WebflowUtils || [];
 *   window.WebflowUtils.push(['animate', (api) => {
 *     api.presets['pop'] = o => ({ from: { scale: 0.7 }, to: { scale: 1 } });
 *   }]);
 *
 * Le callback reçoit l'API du module (celle exposée sur window.WU.{key}).
 * Poussé avant le chargement du module, il s'exécute AVANT son premier init()
 * — c'est ce qui permet d'ajouter des presets. Poussé après, il s'exécute
 * tout de suite.
 *
 * Plusieurs bundles (loader + scripts standalone) peuvent cohabiter sur une
 * page : l'état est stocké sur l'objet global lui-même, pas dans ce fichier.
 */

const GLOBAL = 'WebflowUtils';

function getQueue() {
  const existing = window[GLOBAL];
  if (existing && existing.__wu) return existing;

  const pending = Array.isArray(existing) ? existing.slice() : [];
  const queue = {
    __wu: true,
    apis: {},
    waiting: {},
    push(...entries) {
      entries.forEach(entry => handle(queue, entry));
      return entries.length;
    }
  };
  window[GLOBAL] = queue;
  pending.forEach(entry => handle(queue, entry));
  return queue;
}

function handle(queue, entry) {
  if (!Array.isArray(entry) || typeof entry[1] !== 'function') {
    console.warn('[wu] WebflowUtils.push attend [nomDuModule, callback] — entrée ignorée :', entry);
    return;
  }
  const [key, callback] = entry;
  if (queue.apis[key]) {
    run(key, callback, queue.apis[key]);
  } else {
    (queue.waiting[key] = queue.waiting[key] || []).push(callback);
  }
}

function run(key, callback, api) {
  try {
    callback(api);
  } catch (err) {
    console.error(`[wu] callback WebflowUtils "${key}" en erreur :`, err);
  }
}

/**
 * Enregistre l'API d'un module et exécute les callbacks en attente.
 * Appelé par boot() juste avant le premier init().
 */
export function register(key, api) {
  const queue = getQueue();
  queue.apis[key] = api;
  const callbacks = queue.waiting[key] || [];
  delete queue.waiting[key];
  callbacks.forEach(cb => run(key, cb, api));
}
