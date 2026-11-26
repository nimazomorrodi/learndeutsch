'use strict';

// Keep the original lesson or dictionary link when retrying a failed navigation.
if (!location.pathname.endsWith('/offline.html')) document.getElementById('retry').href = location.href;
document.getElementById('retry').addEventListener('click', event => {
  if (event.currentTarget.href === location.href) {
    event.preventDefault();
    location.reload();
  }
});

function showOfflineVocabulary(catalog) {
  const select = document.getElementById('lesson-select');
  const groups = new Map();
  for (const [index, lesson] of catalog.entries()) {
    if (!groups.has(lesson.level)) {
      const group = document.createElement('optgroup');
      group.label = lesson.level;
      select.append(group);
      groups.set(lesson.level, group);
    }
    groups.get(lesson.level).append(new Option(lesson.level + ' · ' + lesson.title, index));
  }

  function showLesson() {
    const rows = catalog[select.value].words.map(([de, fa, english]) => {
      const row = document.createElement('div');
      const word = document.createElement('dt');
      word.lang = 'de';
      word.dir = 'ltr';
      word.textContent = de;
      const meaning = document.createElement('dd');
      meaning.textContent = fa;
      if (english) {
        const gloss = document.createElement('span');
        gloss.lang = 'en';
        gloss.dir = 'ltr';
        gloss.className = 'english-gloss';
        gloss.textContent = english;
        meaning.append(gloss);
      }
      row.append(word, meaning);
      return row;
    });
    document.getElementById('offline-words').replaceChildren(...rows);
  }

  showLesson();
  select.addEventListener('change', showLesson);
  document.querySelector('.offline-reader').hidden = false;
}

try {
  const catalog = JSON.parse(localStorage.getItem('lernhaus-offline-words-v1'));
  if (Array.isArray(catalog) && catalog.length) showOfflineVocabulary(catalog);
} catch {}
