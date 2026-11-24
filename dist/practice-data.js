function questionsFor(lesson, kind) {
  const [question, choices, answer, why] = lesson.extraGrammar;
  const grammar = [
    {question: lesson.question, choices: lesson.choices, answer: lesson.answer, why: lesson.why},
    {question, choices, answer, why}
  ];
  const [first, second, third] = lesson.words;
  const vocab = [
    {question: 'معنی «' + second[0] + '» چیست؟', choices: [third[1], first[1], second[1]], answer: 2,
     why: second[0] + ' یعنی «' + second[1] + '».'},
    {question: 'برای «' + first[1] + '» کدام واژه را به کار می‌بری؟', choices: [second[0], first[0], third[0]], answer: 1,
     why: first[0] + ' به معنی «' + first[1] + '» است.'}
  ];
  if (kind === 'grammar') return grammar;
  if (kind === 'words') return vocab;
  if (kind === 'chapter') return [...grammar, ...(lesson.examVocabulary || vocab), ...lesson.communication, lesson.reading, lesson.listening];
  return [...grammar, ...vocab];
}
