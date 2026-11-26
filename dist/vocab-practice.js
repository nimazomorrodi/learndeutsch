'use strict';

let vocabRound = null;

function vocabPracticeUrl(level, report = false) {
  return '#words'+(level && level!=='all'?'/'+level:'')+(report?'/report':'');
}

function vocabPracticeDeck(level) {
  const deck=[];
  for (const entry of dictionaryIndex.values()) {
    const source=entry.lessons.find(w=>level==='all' || w.lesson.level===level);
    if (!source) continue;
    const meaning=source.fa.split('؛')[0].trim();
    // Exclude distractors that share any recorded sense with the right answer or one another.
    const senses=new Set(entry.meanings.flatMap(s=>s.split(/[؛،;/]/u)).map(normalized).filter(Boolean));
    deck.push({id:entry.lessons[0].id,entry,source,level:source.lesson.level,meaning,senses});
  }
  return deck;
}

function vocabOptions(card, deck) {
  const options=[card.meaning];
  const used=new Set(card.senses);
  for (const other of shufflePractice([...deck])) {
    if ([...other.senses].some(s=>used.has(s))) continue;
    options.push(other.meaning);
    for (const sense of other.senses) used.add(sense);
    if (options.length===3) break;
  }
  return shufflePractice(options);
}

function vocabPracticeToolbar(level, report = false) {
  return practiceToolbar(level,l=>vocabPracticeUrl(l,report),vocabPracticeUrl(level,true),report);
}

function vocabPracticeReport(level) {
  const deck=vocabPracticeDeck(level);
  const counts={correct:0,wrong:0,unknown:0};
  for (const card of deck) {
    const result=state.vocabPracticeCards?.[card.id]?.lastResult;
    if (result) counts[result]++;
  }
  return heading('کارنامهٔ تمرین لغات','هر واژه یک‌بار شمرده می‌شود. وضعیتش را آخرین پاسخی که به معنی آن داده‌ای تعیین می‌کند.')+
    vocabPracticeToolbar(level,true)+practiceReportPanels(level,counts,deck.length,'واژه',vocabPracticeUrl(level),'');
}

function vocabAnswerFace(card, answer, options) {
  const {entry,source}=card;
  const correct=options[answer]===card.meaning;
  const verdict=correct?'درست انتخاب کردی':answer==='unknown'?'معنی این واژه':'نادرست، پاسخ تو «'+options[answer]+'» بود';
  const example=source.lesson.examples[entry.de]?.find(([de,fa])=>de && fa);
  function sentence(text, lang) {
    return '<div class="review-utterance" dir="'+(lang==='de'?'ltr':'rtl')+'"><span lang="'+lang+'">'+esc(text)+'</span>'+
      pronunciationButton(source.id,lang,'example','تلفظ جمله به '+(lang==='de'?'آلمانی':'فارسی'))+'</div>';
  }
  return '<div class="article-verdict '+(correct?'right':'wrong')+'" tabindex="-1" aria-describedby="vocab-answer">'+
    ic(correct?'check':answer==='unknown'?'book':'close',18)+esc(verdict)+'</div>'+
    '<div class="vocab-answer"><div class="article-headword" dir="ltr"><strong lang="de">'+esc(entry.de)+'</strong>'+
    pronunciationButton(source.id,'de','word','تلفظ '+entry.de)+practiceWordButton(card)+'</div>'+
    '<p id="vocab-answer"><b>'+esc(card.meaning)+'</b></p>'+
    (entry.meanings.length>1?'<p class="vocab-other-senses">معنی‌های دیگر · '+esc(entry.meanings.filter(s=>s!==card.meaning).join('، '))+'</p>':'')+
    (example?'<div class="vocab-example">'+sentence(example[0],'de')+sentence(example[1],'fa')+'</div>':'')+'</div>'+
    '<button class="primary" type="button" data-act="vocab-next">واژهٔ بعدی'+ic('left',17)+'</button>';
}

function vocabPracticePage(level) {
  if (!vocabRound || vocabRound.level!==level || vocabRound.day!==key(today())) {
    const deck=vocabPracticeDeck(level);
    vocabRound=startPracticeRound(level,deck,state.vocabPracticeCards);
    vocabRound.pool=deck;
  }
  const round=vocabRound, card=round.queue[0];
  const header=heading('تمرین لغات','معنی فارسی واژه را انتخاب کن.',autoplaySwitch('vocab-autoplay',state.vocabAutoplay))+
    vocabPracticeToolbar(level);
  if (!card) return header+'<section class="panel review-surface empty"><h2>'+
    (round.number>1?'این دور تمام شد':'برای این سطح واژه‌ای پیدا نشد')+'</h2>'+
    (round.number>1?'<button type="button" class="secondary" data-act="vocab-restart">شروع دور بعدی</button>':'')+'</section>';
  const options=round.options ??= vocabOptions(card,round.pool);
  const selected=round.answer!==null;
  const saved=state.vocabPracticeCards?.[card.id];
  const mode=round.free?'مرور آزاد':saved?'خانهٔ '+num(saved.box):'واژهٔ تازه';
  const choices=options.map((label,i)=>'<button type="button" data-act="vocab-answer" data-value="'+i+'">'+esc(label)+'</button>').join('');
  return header+'<section class="panel review-surface article-practice vocab-practice"><div class="review-meta"><span>'+ic('vocab')+
    'واژهٔ '+num(round.number)+' · <bdi>'+esc(card.level)+'</bdi></span><span class="practice-schedule">'+mode+'</span></div>'+
    '<div class="review-card-stage"><div class="review-sheet'+(selected?' article-answered':'')+'">'+
    '<div class="review-face front"'+(selected?' inert aria-hidden="true"':'')+'><span class="review-language">معنی این واژه چیست؟</span>'+
    '<div class="article-headword"><strong id="vocab-prompt" lang="de" dir="ltr" tabindex="-1">'+esc(card.entry.de)+'</strong>'+practiceWordButton(card)+'</div>'+
    '<div class="article-choices vocab-choices" role="group" aria-labelledby="vocab-prompt">'+choices+
    '<button type="button" data-act="vocab-answer" data-value="unknown">نمی‌دانم</button></div></div>'+
    '<div class="review-face back"'+(selected?'':' inert aria-hidden="true"')+'>'+
    (selected?vocabAnswerFace(card,round.answer,options):'')+'</div></div></div></section>';
}

function answerVocab(answer) {
  const round=vocabRound;
  if (readRoute().page!=='words' || !round?.queue.length || round.answer!==null ||
      (answer!=='unknown' && !['0','1','2'].includes(answer))) return;
  const card=round.queue[0];
  const result=answer==='unknown'?'unknown':round.options[answer]===card.meaning?'correct':'wrong';
  const schedule=recordPracticeAnswer(round,state.vocabPracticeCards ??= {},answer,result);
  revealPracticeAnswer(vocabAnswerFace(card,answer,round.options),schedule,state.vocabAutoplay);
}
