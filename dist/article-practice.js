'use strict';

const articleChoices = {der:'der', die:'die', das:'das', unknown:'نمی‌دانم'};
let articleRound = null;

function shufflePractice(cards) {
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

function articleDeck(level) {
  const cards = [];
  for (const entry of dictionaryIndex.values()) {
    const noun = entry.noun;
    const match = /^(der|die|das) (.+)$/.exec(noun?.singular || '');
    if (!match || (entry.de === noun.plural && entry.de !== noun.singular)) continue;
    const source = entry.lessons.find(w => level === 'all' || w.lesson.level === level);
    if (!source) continue;
    // The same noun keeps one schedule even when it occurs in several courses.
    const id = entry.lessons[0].id;
    cards.push({id, entry, level:source.lesson.level, article:match[1], word:match[2]});
  }
  return cards;
}

function startPracticeRound(level, deck, records) {
  const day = key(today());
  const due = [], fresh = [], later = [];
  for (const card of deck) {
    const saved = records?.[card.id];
    if (!saved) fresh.push(card);
    else if (saved.due <= day) due.push(card);
    else later.push(card);
  }
  const free = due.length + fresh.length === 0;
  const queue = free ? shufflePractice(later) : shufflePractice(due).concat(shufflePractice(fresh));
  return {level, day, queue, free, number:1, answer:null};
}

function articleUrl(level, report = false) {
  return '#articles'+(level === 'all' ? '' : '/'+level)+(report ? '/report' : '');
}

function articleToolbar(level, report = false) {
  return practiceToolbar(level, l => articleUrl(l, report), articleUrl(level,true), report);
}

function articleReportPage(level) {
  const deck = articleDeck(level);
  const counts = {correct:0, wrong:0, unknown:0, unsplit:0};
  let legacy = 0;
  for (const card of deck) {
    const saved = state.articleCards?.[card.id];
    if (!saved) continue;
    if (saved.lastResult) counts[saved.lastResult]++;
    else {
      legacy++;
      // Older schedules record a pass in boxes 2–5. Box 1 combines both kinds of miss.
      counts[saved.box > 1 ? 'correct' : 'unsplit']++;
    }
  }
  const note = legacy ? 'برای '+num(legacy)+' واژهٔ قدیمی، آخرین مرور زمان‌بندی‌شده ملاک است. در خانهٔ اول، «اشتباه» و «نمی‌دانم» جدا ثبت نمی‌شدند.' : '';
  return heading('کارنامهٔ آرتیکل‌ها','هر واژه یک‌بار شمرده می‌شود. «بلدم» یعنی آخرین پاسخ ثبت‌شده‌ات به آن واژه درست بوده.')+
    articleToolbar(level,true)+practiceReportPanels(level,counts,deck.length,'اسم',articleUrl(level),note);
}

function practiceWordButton(card) {
  const sources = card.entry.lessons;
  const word = sources.find(w=>state.cards[w.id]) || sources.find(w=>w.lesson.level===card.level);
  return wordButton(word);
}

function articleBack(card, answer) {
  const {noun, meanings} = card.entry;
  const correct = answer === card.article;
  let verdict = 'آرتیکل درست این اسم';
  if (correct) verdict = 'درست انتخاب کردی';
  else if (answer !== 'unknown') verdict = 'نادرست، پاسخ تو <bdi lang="de">'+esc(answer)+'</bdi> بود';
  const plural = noun.plural ? '<bdi lang="de">'+nounFormMarkup(noun.plural,noun.singular)+'</bdi>' : 'در این معنی جمع رایج ندارد';
  return '<div class="article-verdict '+(correct?'right':'wrong')+'" id="article-verdict" tabindex="-1" aria-describedby="article-forms">'+
    ic(answer==='unknown'?'book':correct?'check':'close',18)+verdict+'</div>'+
    '<div id="article-forms" class="article-forms"><div class="review-utterance" dir="ltr"><strong lang="de" dir="ltr">'+nounFormMarkup(noun.singular)+'</strong>'+
    pronunciationButton(card.id,'de',card.entry.de === noun.singular ? 'word' : 'article','تلفظ '+noun.singular)+practiceWordButton(card)+'</div>'+
    '<p><span>جمع</span> '+plural+'</p><p><span>معنی</span> '+esc(meanings.join('، '))+'</p>'+
    (noun.note?'<small>'+esc(noun.note)+'</small>':'')+'</div>'+
    '<button type="button" class="primary" data-act="article-next">کارت بعدی'+ic('left',17)+'</button>';
}

function articlePracticePage(level) {
  if (!articleRound || articleRound.level !== level || articleRound.day !== key(today())) {
    articleRound = startPracticeRound(level,articleDeck(level),state.articleCards);
  }
  const {queue, answer, number, free} = articleRound;
  const card = queue[0];
  const autoplay = autoplaySwitch('article-autoplay',state.articleAutoplay);
  const intro = heading('تمرین آرتیکل', 'آرتیکل اسم را انتخاب کن تا شکل مفرد، جمع و معنی آن را ببینی.', autoplay)+
    articleToolbar(level);
  if (!card) {
    return intro+'<section class="panel review-surface empty"><h2>'+
      (number > 1 ? 'این دور تمام شد' : 'برای این سطح کارتی پیدا نشد')+'</h2>'+
      (number > 1 ? '<button class="secondary" data-act="article-restart">شروع دور بعدی</button>' : '')+'</section>';
  }
  const saved = state.articleCards?.[card.id];
  const mode = free ? 'مرور آزاد' : !saved ? 'کارت تازه' : 'خانهٔ '+num(saved.box);
  const answered = answer !== null;
  const choices = Object.entries(articleChoices).map(([value,label]) =>
    '<button type="button" data-act="article-answer" data-value="'+value+'"'+
    (value==='unknown'?' lang="fa" dir="rtl"':'')+'>'+label+'</button>'
  ).join('');
  return intro+'<section class="panel review-surface article-practice"><div class="review-meta"><span>'+ic('cards')+
    'کارت '+num(number)+' · <bdi>'+esc(card.level)+'</bdi></span><span class="practice-schedule" id="article-schedule">'+mode+'</span></div>'+
    '<div class="review-card-stage"><div class="review-sheet'+(answered?' article-answered':'')+'">'+
    '<div class="review-face front"'+(answered?' inert aria-hidden="true"':'')+'>'+
    '<span class="review-language">آرتیکل این اسم چیست؟</span><div class="article-headword"><strong id="article-word" tabindex="-1" lang="de" dir="ltr">'+esc(card.word)+'</strong>'+practiceWordButton(card)+'</div>'+
    '<div class="article-choices" dir="ltr" lang="de" role="group" aria-labelledby="article-word">'+choices+'</div></div>'+
    '<div class="review-face back"'+(answered?'':' inert aria-hidden="true"')+'>'+
    (answered?articleBack(card,answer):'')+'</div></div></div></section>';
}

function answerArticle(answer) {
  const round = articleRound;
  if (readRoute().page !== 'articles' || !round?.queue.length || round.answer !== null || !Object.hasOwn(articleChoices,answer)) return;
  const card = round.queue[0];
  const result = answer === card.article ? 'correct' : answer === 'unknown' ? 'unknown' : 'wrong';
  const schedule = recordPracticeAnswer(round,state.articleCards ??= {},answer,result);
  revealPracticeAnswer(articleBack(card,answer),schedule,state.articleAutoplay);
}

function recordPracticeAnswer(round, records, answer, result) {
  const card=round.queue[0];
  const previous=records[card.id];
  round.answer=answer;
  if (!round.free && (!previous || previous.due <= key(today()))) {
    const box=result==='correct' ? Math.min(boxDays.length,(previous?.box || 1)+1) : 1;
    records[card.id]={box,due:key(moveDay(today(),boxDays[box-1]))};
    if (result!=='correct') round.queue.splice(4,0,card);
  }
  records[card.id].lastResult=result;
  study();
  return records[card.id];
}

function revealPracticeAnswer(markup, schedule, autoplay) {
  const sheet = $('.article-practice .review-sheet');
  const front = sheet.querySelector('.front'), back = sheet.querySelector('.back');
  back.innerHTML = markup;
  back.inert = false;
  back.removeAttribute('aria-hidden');
  front.inert = true;
  front.setAttribute('aria-hidden','true');
  sheet.classList.add('article-answered');
  $('.practice-schedule').textContent = 'خانهٔ '+num(schedule.box)+' · مرور بعدی '+fmt(new Date(schedule.due+'T12:00:00'),{day:'numeric',month:'long'});
  back.querySelector('.article-verdict').focus({preventScroll:true});
  if (autoplay === true) playReviewAudio(...back.querySelectorAll('[data-act="pronounce"]'));
}

function nextPractice(restart = false) {
  const page=readRoute().page;
  const round=page==='articles' ? articleRound : page==='words' ? vocabRound : null;
  if (!round) return;
  if (restart) {
    if (round.queue.length) return;
    if (page==='articles') articleRound=null;
    else vocabRound=null;
  } else {
    if (round.answer===null) return;
    round.queue.shift();
    round.number++;
    round.answer=null;
    if (page==='words') round.options=null;
  }
  render();
  ($('.article-headword strong') || $('.review-surface.empty button'))?.focus({preventScroll:true});
}
