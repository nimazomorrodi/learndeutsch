'use strict';
const account = JSON.parse(document.getElementById('account-data').textContent);
const {levels, lessons} = account;
const exams = levels.map(level => [level.code, ...level.exam]);

// The original four section IDs also identify saved progress and bookmarked tabs.
const tutorialPart = 4;
const lessonParts = [
  {id:tutorialPart, label:'آموزش'}, {id:0, label:'گفت‌وگو'}, {id:1, label:'گرامر'},
  {id:2, label:'واژگان'}, {id:3, label:'تمرین'}
];

function lessonPath(id, part = tutorialPart) {
  return 'lesson/'+id+(part === tutorialPart ? '' : '/'+part);
}
