'use strict';

const articleChoices = ['der', 'die', 'das'];
let articleRound = null;

function shuffleArticles(cards) {
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

function startArticleRound(level) {
  const day = key(today());
  const due = [], fresh = [], later = [];
  for (const entry of dictionaryIndex.values()) {
    const noun = entry.noun;
    const match = /^(der|die|das) (.+)$/.exec(noun?.singular || '');
    if (!match || (entry.de === noun.plural && entry.de !== noun.singular)) continue;
    const source = entry.lessons.find(w => level === 'all' || w.lesson.level === level);
    if (!source) continue;
    // The same noun keeps one schedule even when it occurs in several courses.
    const id = entry.lessons[0].id;
    const card = {id, entry, level:source.lesson.level, article:match[1], word:match[2]};
    const saved = state.articleCards?.[id];
    if (!saved) fresh.push(card);
    else if (saved.due <= day) due.push(card);
    else later.push(card);
  }
  const free = due.length + fresh.length === 0;
  const queue = free ? shuffleArticles(later) : shuffleArticles(due).concat(shuffleArticles(fresh));
  return {level, day, queue, free, number:1, answer:null};
}

function articleBack(card, answer) {
  const {noun, meanings} = card.entry;
  const correct = answer === card.article;
  const verdict = correct ? 'درست انتخاب کردی' : 'پاسخ تو <bdi lang="de">'+esc(answer)+'</bdi> بود';
  const plural = noun.plural ? '<bdi lang="de">'+nounFormMarkup(noun.plural,noun.singular)+'</bdi>' : 'در این معنی جمع رایج ندارد';
  return '<div class="article-verdict '+(correct?'right':'wrong')+'" id="article-verdict" tabindex="-1" aria-describedby="article-forms">'+
    ic(correct?'check':'close',18)+(correct?'':'نادرست، ')+verdict+'</div>'+
    '<div id="article-forms" class="article-forms"><strong lang="de" dir="ltr">'+nounFormMarkup(noun.singular)+'</strong>'+
    '<p><span>جمع</span> '+plural+'</p><p><span>معنی</span> '+esc(meanings.join('، '))+'</p>'+
    (noun.note?'<small>'+esc(noun.note)+'</small>':'')+'</div>'+
    '<button type="button" class="primary" data-act="article-next">کارت بعدی'+ic('left',17)+'</button>';
}

function articlePracticePage(level) {
  if (!articleRound || articleRound.level !== level || articleRound.day !== key(today())) {
    articleRound = startArticleRound(level);
  }
  const {queue, answer, number, free} = articleRound;
  const card = queue[0];
  const intro = heading('تمرین آرتیکل', 'آرتیکل اسم را انتخاب کن تا شکل مفرد، جمع و معنی آن را ببینی.')+
    levelLinks(level, l => l === 'all' ? '#articles' : '#articles/'+l, true);
  if (!card) {
    return intro+'<section class="panel review-surface empty"><h2>'+
      (number > 1 ? 'این دور تمام شد' : 'برای این سطح کارتی پیدا نشد')+'</h2>'+
      (number > 1 ? '<button class="secondary" data-act="article-restart">شروع دور بعدی</button>' : '')+'</section>';
  }
  const saved = state.articleCards?.[card.id];
  const mode = free ? 'مرور آزاد' : !saved ? 'کارت تازه' : 'خانهٔ '+num(saved.box);
  const answered = answer !== null;
  const choices = articleChoices.map(a => '<button type="button" data-act="article-answer" data-value="'+a+'">'+a+'</button>').join('');
  return intro+'<section class="panel review-surface article-practice"><div class="review-meta"><span>'+ic('cards')+
    'کارت '+num(number)+' · <bdi>'+esc(card.level)+'</bdi></span><span id="article-schedule">'+mode+'</span></div>'+
    '<div class="review-card-stage"><div class="review-sheet'+(answered?' article-answered':'')+'">'+
    '<div class="review-face front"'+(answered?' inert aria-hidden="true"':'')+'>'+
    '<span class="review-language">آرتیکل این اسم چیست؟</span><strong id="article-word" tabindex="-1" lang="de" dir="ltr">'+esc(card.word)+'</strong>'+
    '<div class="article-choices" dir="ltr" lang="de" role="group" aria-labelledby="article-word">'+choices+'</div></div>'+
    '<div class="review-face back"'+(answered?'':' inert aria-hidden="true"')+'>'+
    (answered?articleBack(card,answer):'')+'</div></div></div></section>';
}

function answerArticle(answer) {
  const round = articleRound;
  if (readRoute().page !== 'articles' || !round?.queue.length || round.answer !== null || !articleChoices.includes(answer)) return;
  const card = round.queue[0];
  round.answer = answer;
  const cards = state.articleCards ??= {};
  const previous = cards[card.id];
  if (!round.free && (!previous || previous.due <= key(today()))) {
    const correct = answer === card.article;
    const box = correct ? Math.min(boxDays.length, (previous?.box || 1) + 1) : 1;
    cards[card.id] = {box, due:key(moveDay(today(), boxDays[box-1]))};
    if (!correct) round.queue.splice(4, 0, card);
  }
  study();
  const sheet = $('.article-practice .review-sheet');
  const front = sheet.querySelector('.front'), back = sheet.querySelector('.back');
  back.innerHTML = articleBack(card,answer);
  back.inert = false;
  back.removeAttribute('aria-hidden');
  front.inert = true;
  front.setAttribute('aria-hidden','true');
  sheet.classList.add('article-answered');
  const schedule = cards[card.id];
  $('#article-schedule').textContent = 'خانهٔ '+num(schedule.box)+' · مرور بعدی '+fmt(new Date(schedule.due+'T12:00:00'),{day:'numeric',month:'long'});
  $('#article-verdict').focus({preventScroll:true});
}

function nextArticle(restart = false) {
  if (readRoute().page !== 'articles' || !articleRound) return;
  if (restart) {
    if (articleRound.queue.length) return;
    articleRound = null;
  } else {
    if (articleRound.answer === null) return;
    articleRound.queue.shift();
    articleRound.number++;
    articleRound.answer = null;
  }
  render();
  ($('#article-word') || $('[data-act="article-restart"]'))?.focus({preventScroll:true});
}
