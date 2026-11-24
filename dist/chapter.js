'use strict';

function endQuiz(lesson) {
  return lesson.listening ? 'chapter' : 'mixed';
}

function courseSources(level) {
  if (!level.sources) return '';
  return '<details class="panel resource-panel chapter-sources"><summary>منابع دوره و نمونه‌آزمون رسمی</summary>' +
    '<p class="hint">فصل‌بندی، مثال‌ها و آزمون‌های داخل لرن‌هاوس تألیفی‌اند. پیوندهای زیر منابع رسمی بزرگسالان هستند و با اینترنت باز می‌شوند.</p>' +
    level.sources.map(([title,url]) => '<a class="word-link" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(title)+'</a>').join('')+'</details>';
}

function grammarSections(lesson) {
  const sections = [[lesson.rule,lesson.explain,lesson.example,lesson.exampleFa], ...(lesson.notes || [])];
  return sections.map(([title,body,de,fa]) => '<section class="grammar-note"><h2>'+esc(title)+'</h2><p class="body-text">'+esc(body)+'</p>' +
    '<div class="german-example" lang="de" dir="ltr">'+esc(de)+'</div>'+(fa ? '<p class="hint">'+esc(fa)+'</p>' : '')+'</section>').join('');
}

function lessonTutorial(lesson) {
  const {title, intro, steps, check} = lesson.tutorial;
  const examples = steps.map(step => '<li><h3>'+esc(step.title)+'</h3><p>'+esc(step.body)+'</p>'+
    '<div class="tutorial-example"><p lang="de" dir="ltr">'+esc(step.de)+'</p><p>'+esc(step.fa)+'</p></div></li>').join('');
  return '<article class="tutorial"><h2>'+esc(title)+'</h2><p>'+esc(intro)+'</p>'+
    '<ol class="tutorial-steps">'+examples+'</ol><section class="tutorial-check"><h3>حالا خودت بگو</h3><p>'+esc(check.prompt)+'</p>'+
    '<details class="practice-model"><summary>دیدن پاسخ و دلیل</summary><p lang="de" dir="ltr">'+esc(check.de)+'</p>'+
    '<div>'+esc(check.why)+'</div></details></section></article>';
}

function answerFeedback(drill, answer) {
  if (!answer) return '';
  return drill.answers.some(expected => normalized(expected) === normalized(answer))
    ? 'درست است.' : 'پاسخ پیشنهادی: '+drill.answers[0];
}

function clozePractice(lesson, entry) {
  let index = 0;
  return lesson.clozeGroups.map(group => {
    const instruction = group.bank ? 'برای هر جای خالی یک واژه از بانک مشترک انتخاب کن. سه واژه اضافه است.' :
      'متن را بخوان و برای هر جای خالی یکی از سه گزینه را انتخاب کن.';
    const bank = group.bank ? '<p class="cloze-bank" lang="de" dir="ltr">'+group.bank.map(esc).join(' · ')+'</p>' : '';
    const controls = Array.from(group.passage.matchAll(/\[(\d+)\]/g), match => {
      const saved = entry?.answers[index] || '';
      const drill = lesson.drills[index++];
      const options = (group.bank || drill.choices).map(word =>
        '<option value="'+esc(word)+'"'+(saved===word?' selected':'')+'>'+esc(word)+'</option>').join('');
      return '<label class="practice-field">جای خالی '+num(Number(match[1]))+
        '<select class="auth-input" name="answer" dir="ltr" lang="de"><option value="">—</option>'+options+'</select>'+
        '<span class="practice-result">'+esc(answerFeedback(drill,saved))+'</span></label>';
    }).join('');
    return '<fieldset><legend>Sprachbausteine · '+(group.bank?'بانک واژه':'انتخاب واژه')+'</legend><p>'+instruction+
      '</p><p class="exam-passage" lang="de" dir="ltr">'+esc(group.passage)+'</p>'+bank+'<div class="cloze-controls">'+controls+'</div></fieldset>';
  }).join('');
}

function chapterPractice(lesson) {
  const entry = state.practice?.[lesson.id];
  const drills = lesson.clozeGroups ? clozePractice(lesson,entry) : '<fieldset><legend>جای خالی را پر کن</legend>'+lesson.drills.map((drill,i) => {
    const value = entry?.answers[i] || '';
    return '<label class="practice-field"><b lang="de" dir="ltr">'+esc(drill.prompt)+'</b><small>'+esc(drill.hint)+'</small>' +
      '<input class="auth-input" name="answer" dir="ltr" lang="de" autocomplete="off" maxlength="100" value="'+esc(value)+'">' +
      '<span class="practice-result">'+esc(answerFeedback(drill,value))+'</span></label>';
  }).join('')+'</fieldset>';
  function model(text) {
    return '<details class="practice-model"><summary>دیدن یک پاسخ نمونه</summary><p lang="de" dir="ltr">'+esc(text)+'</p></details>';
  }
  const brief = lesson.writingBrief;
  const letter = brief ? '<p class="exam-passage" lang="de" dir="ltr">'+esc(brief.message)+'</p><p>در پاسخت به هر چهار نکته بپرداز.</p>'+
    '<ul class="letter-points" lang="de" dir="ltr">'+brief.points.map(p=>'<li>'+esc(p)+'</li>').join('')+'</ul>' : '';
  const partner = lesson.partnerPrompt ? '<p class="hint">طرف مقابل می‌گوید</p><blockquote class="exam-passage" lang="de" dir="ltr">'+esc(lesson.partnerPrompt)+'</blockquote>' : '';
  return '<h2>تمرین فصل</h2><form class="chapter-practice" id="chapter-practice">'+drills+
    '<fieldset><legend>نوشتن</legend>'+letter+'<label class="practice-field">'+esc(lesson.writing[0])+
    '<textarea class="auth-input" lang="de" dir="ltr" rows="3" name="writing" maxlength="2000">'+esc(entry?.writing || '')+'</textarea></label>'+
    model(lesson.writing[1])+'</fieldset><button type="submit" class="primary">بررسی جای‌خالی‌ها و ذخیرهٔ نوشته</button>' +
    '<span role="status" class="practice-status"></span></form><section class="speaking-task"><h3>گفتن</h3><p>'+esc(lesson.speaking[0])+'</p>'+partner+model(lesson.speaking[1])+'</section>'+
    '<h2>آزمون فصل</h2><p class="hint">به سؤال‌های گرامر، واژگان، موقعیت روزمره، خواندن و شنیدن پاسخ بده.</p>' +
    '<div class="test-links">'+quizLink(lesson,'chapter')+'</div>';
}

document.addEventListener('submit', async event => {
  const form = event.target;
  if (form.id !== 'chapter-practice') return;
  event.preventDefault();
  const {lesson} = readRoute();
  const answers = new FormData(form).getAll('answer').map(value => value.trim());
  const writing = form.elements.writing.value.trim();
  const status = form.querySelector('.practice-status');
  if (!answers.some(Boolean) && !writing && !state.practice?.[lesson.id]) {
    status.textContent = 'اول یک پاسخ بنویس.';
    return;
  }
  state.practice ??= {};
  const studied = !state.practice[lesson.id];
  state.practice[lesson.id] = {answers,writing};
  if (studied) state.days[key(today())] = (state.days[key(today())] || 0)+1;
  form.querySelectorAll('.practice-result').forEach((el,i) => { el.textContent = answerFeedback(lesson.drills[i],answers[i]); });
  status.textContent = 'در حال ذخیره…';
  status.textContent = await save() ? 'پاسخ‌ها در حسابت ذخیره شدند.' : 'پاسخ‌ها هنوز ذخیره نشده‌اند.';
});

function lessonAudio(lesson, type) {
  const dialogue = type === 'dialogue';
  const name = encodeURIComponent(lesson.id) + (dialogue ? '-dialogue' : '');
  const src = 'assets/audio/' + encodeURIComponent(lesson.level.toLowerCase()) + '/' + name + '.mp3?v=supertonic3';
  const label = dialogue ? 'شنیدن گفت‌وگوی آلمانی' : 'پیام شنیداری آلمانی';
  return '<audio class="lesson-audio" controls preload="metadata" dir="ltr" aria-label="'+label+'" src="'+src+'"></audio>';
}

function questionMaterial(lesson, question, showTranscript) {
  if (question !== lesson.listening) return question.passage ? '<p class="exam-passage" lang="de" dir="ltr">'+esc(question.passage)+'</p>' : '';
  return '<div class="listening-task"><p>پیام را گوش کن و پاسخ را انتخاب کن.</p>' +
    lessonAudio(lesson, 'listening')+
    (showTranscript ? '<details class="practice-model"><summary>متن پیام شنیداری</summary><p lang="de" dir="ltr">'+esc(question.passage)+'</p></details>' : '')+'</div>';
}

function afterChapter(lesson) {
  const group = lessons.filter(l => l.level === lesson.level);
  const next = group[group.indexOf(lesson)+1];
  return next ? '<a class="primary" href="#'+lessonPath(next.id)+'">فصل بعدی · '+esc(next.fa)+'</a>'
    : '<a class="primary" href="#courses/'+lesson.level+'/lessons">بازگشت به فهرست فصل‌ها</a>';
}

function wordCard(lesson, index, revealed = false) {
  const [de,fa] = lesson.words[index];
  const next = (index+1) % lesson.words.length;
  const change = (label, target, show) => '<button type="button" class="secondary" data-word-index="'+target+
    '" data-reveal="'+show+'">'+label+'</button>';
  return '<div class="review-meta">واژهٔ '+num(index+1)+' از '+num(lesson.words.length)+'</div>' +
    '<div class="flash-card"><b dir="ltr" lang="de">'+esc(de)+'</b><p>'+(revealed?esc(fa):'معنی فارسی را به یاد بیاور.')+'</p></div>' +
    (revealed?pairedSentences(lesson.examples[de].slice(0,1)):'')+
    '<div class="test-links">'+(revealed ? '' : change('نمایش معنی',index,true)) +
    change(next===0?'برگشت به اولین واژه':'واژهٔ بعدی',next,false)+'</div>';
}

document.addEventListener('click', event => {
  const button = event.target.closest('[data-word-index]');
  if (!button) return;
  const host = button.closest('.chapter-word-card');
  host.innerHTML = wordCard(readRoute().lesson,Number(button.dataset.wordIndex),button.dataset.reveal==='true');
  host.querySelector('button').focus({preventScroll:true});
});
