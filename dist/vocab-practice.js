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

function vocabTranslation(card, direction) {
  return direction==='fa-de' ? card.entry.de : card.meaning;
}

function vocabOptions(card, deck, direction) {
  const options=[vocabTranslation(card,direction)];
  const labels=new Set([normalized(options[0])]);
  const used=new Set(card.senses);
  for (const other of shufflePractice([...deck])) {
    const label=vocabTranslation(other,direction);
    const key=normalized(label);
    if (labels.has(key) || [...other.senses].some(s=>used.has(s))) continue;
    options.push(label);
    labels.add(key);
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
  return heading('کارنامهٔ تمرین لغات','هر واژه یک‌بار شمرده می‌شود. وضعیتش را آخرین پاسخ تو در هر یک از دو جهت تمرین تعیین می‌کند.')+
    vocabPracticeToolbar(level,true)+practiceReportPanels(level,counts,deck.length,'واژه',vocabPracticeUrl(level),'');
}

function vocabAnswerFace(card, round) {
  const {entry,source}=card;
  const {answer,options,direction}=round;
  const reverse=direction==='fa-de';
  const correct=options[answer]===vocabTranslation(card,direction);
  const verdict=correct?'درست انتخاب کردی':answer==='unknown'?(reverse?'واژهٔ آلمانی':'معنی این واژه'):
    'نادرست، پاسخ تو «<bdi lang="'+(reverse?'de':'fa')+'">'+esc(options[answer])+'</bdi>» بود';
  const example=source.lesson.examples[entry.de]?.find(([de,fa])=>de && fa);
  function sentence(text, lang) {
    return '<div class="review-utterance" dir="'+(lang==='de'?'ltr':'rtl')+'"><span lang="'+lang+'">'+esc(text)+'</span>'+
      pronunciationButton(source.id,lang,'example','تلفظ جمله به '+(lang==='de'?'آلمانی':'فارسی'))+'</div>';
  }
  return '<div class="article-verdict '+(correct?'right':'wrong')+'" tabindex="-1" aria-describedby="vocab-answer">'+
    ic(correct?'check':answer==='unknown'?'book':'close',18)+verdict+'</div>'+
    '<div class="vocab-answer"><div class="article-headword" dir="ltr"><strong lang="de"'+(reverse?' id="vocab-answer"':'')+'>'+esc(entry.de)+'</strong>'+
    pronunciationButton(source.id,'de','word','تلفظ '+entry.de)+practiceWordButton(card)+'</div>'+
    '<div class="review-utterance" dir="rtl"><b lang="fa"'+(reverse?'':' id="vocab-answer"')+'>'+esc(card.meaning)+'</b>'+
    pronunciationButton(source.id,'fa','word','تلفظ معنی فارسی')+'</div>'+englishGloss(entry,card.meaning)+
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
  const direction=state.vocabDirection ?? 'de-fa';
  const header=heading('تمرین لغات','واژه را بخوان و ترجمهٔ آن را انتخاب کن.',autoplaySwitch('vocab-autoplay',state.vocabAutoplay))+
    vocabPracticeToolbar(level);
  const picker=directionPicker('vocab-direction','جهت تمرین',direction);
  if (!card) return header+'<section class="panel review-surface empty">'+picker+'<h2>'+
    (round.number>1?'این دور تمام شد':'برای این سطح واژه‌ای پیدا نشد')+'</h2>'+
    (round.number>1?'<button type="button" class="secondary" data-act="vocab-restart">شروع دور بعدی</button>':'')+'</section>';
  const selected=round.answer!==null;
  // Keep a graded answer in the language it was submitted in until the next card.
  if (!selected && round.direction!==direction) {
    round.direction=direction;
    round.options=null;
  }
  const reverse=round.direction==='fa-de';
  const options=round.options ??= vocabOptions(card,round.pool,round.direction);
  const saved=state.vocabPracticeCards?.[card.id];
  const mode=round.free?'مرور آزاد':saved?'خانهٔ '+num(saved.box):'واژهٔ تازه';
  const choices=options.map((label,i)=>'<button type="button" data-act="vocab-answer" data-value="'+i+'">'+esc(label)+'</button>').join('');
  return header+'<section class="panel review-surface article-practice vocab-practice">'+picker+'<div class="review-meta"><span>'+ic('vocab')+
    'واژهٔ '+num(round.number)+' · <bdi>'+esc(card.level)+'</bdi></span><span class="practice-schedule">'+mode+'</span></div>'+
    '<div class="review-card-stage"><div class="review-sheet'+(selected?' article-answered':'')+'">'+
    '<div class="review-face front"'+(selected?' inert aria-hidden="true"':'')+'><span class="review-language">'+(reverse?'آلمانیِ این واژه چیست؟':'معنی این واژه چیست؟')+'</span>'+
    '<div class="article-headword"><strong id="vocab-prompt" lang="'+(reverse?'fa':'de')+'" dir="'+(reverse?'rtl':'ltr')+'" tabindex="-1">'+esc(reverse?card.meaning:card.entry.de)+'</strong>'+practiceWordButton(card)+'</div>'+
    '<div class="article-choices vocab-choices" lang="'+(reverse?'de':'fa')+'" dir="'+(reverse?'ltr':'rtl')+'" role="group" aria-labelledby="vocab-prompt">'+choices+
    '<button type="button" data-act="vocab-answer" data-value="unknown" lang="fa" dir="rtl">نمی‌دانم</button></div></div>'+
    '<div class="review-face back"'+(selected?'':' inert aria-hidden="true"')+'>'+
    (selected?vocabAnswerFace(card,round):'')+'</div></div></div></section>';
}

function answerVocab(answer) {
  const round=vocabRound;
  if (readRoute().page!=='words' || !round?.queue.length || round.answer!==null ||
      (answer!=='unknown' && !['0','1','2'].includes(answer))) return;
  const card=round.queue[0];
  const result=answer==='unknown'?'unknown':round.options[answer]===vocabTranslation(card,round.direction)?'correct':'wrong';
  const schedule=recordPracticeAnswer(round,state.vocabPracticeCards ??= {},answer,result);
  revealPracticeAnswer(vocabAnswerFace(card,round),schedule,state.vocabAutoplay);
}

document.addEventListener('change', event => {
  const input=event.target;
  if (input.name!=='vocab-direction' || !input.checked || readRoute().page!=='words') return;
  state.vocabDirection=input.value;
  save();
  if (vocabRound.answer!==null || !vocabRound.queue.length) return;
  render();
  $('#main input[name="vocab-direction"]:checked').focus({preventScroll:true});
});
