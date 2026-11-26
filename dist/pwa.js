'use strict';

if ('serviceWorker' in navigator && window.isSecureContext) {
  const worker = new URL('sw.js', document.currentScript.src);
  worker.search = new URL(document.currentScript.src).search;
  navigator.serviceWorker.register(worker, {updateViaCache: 'none'}).catch(error => {
    console.warn('Lernhaus offline mode is unavailable.', error);
  });

  // Only the shared course vocabulary belongs in the offline reader.
  const key = 'lernhaus-offline-words-v1';
  try {
    if (typeof account !== 'undefined') {
      const catalog = lessons.map(({level, fa, words}) => ({
        level, title: fa,
        words: words.map(([de, meaning]) => [de, meaning, englishTranslation(de, meaning)])
      }));
      const snapshot = JSON.stringify(catalog);
      if (localStorage.getItem(key) !== snapshot) localStorage.setItem(key, snapshot);
    } else if (document.querySelector('.auth-page')) {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.warn('Offline vocabulary is unavailable.', error);
  }
}
