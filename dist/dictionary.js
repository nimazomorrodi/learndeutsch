'use strict';

const dictionaryOrder = new Intl.Collator('de');

function buildDictionaryIndex(words) {
  const entries = new Map();
  for (const word of words) {
    let entry = entries.get(word.de);
    if (!entry) {
      const bare = word.de.replace(/^(der|die|das) /,'');
      entry = {de:word.de, bare, lessons:[], meanings:[], extra:account.reference.senses[word.de] || []};
      entries.set(word.de,entry);
    }
    entry.lessons.push(word);
    for (const sense of word.fa.split('؛').map(s=>s.trim()).filter(Boolean)) {
      if (!entry.meanings.includes(sense)) entry.meanings.push(sense);
    }
  }
  for (const entry of entries.values()) {
    entry.meanings = [...new Set([...entry.meanings,...entry.extra.map(row=>row[0])])];
    entry.keys = [entry.de,entry.bare,...entry.meanings].map(normalized);
    entry.noun = account.reference.nouns?.[entry.de];
    if (entry.noun) {
      for (const form of [entry.noun.singular,entry.noun.plural]) {
        if (form) entry.keys.push(normalized(form),normalized(form.replace(/^(der|die|das) /,'')));
      }
    }
  }
  return entries;
}

function wordUrl(de, {level='all',query='',tense='present',lessonId=''} = {}) {
  const params = new URLSearchParams();
  if (level !== 'all') params.set('level',level);
  if (query) params.set('q',query);
  if (tense !== 'present') params.set('tense',tense);
  if (lessonId) params.set('lesson',lessonId);
  return '#word/'+encodeURIComponent(de)+(params.size?'?'+params:'');
}

function englishGloss(entry, meaning) {
  const senses = account.reference.english?.[entry.de];
  if (!senses) return '';
  const translations = meaning.split('؛').map(sense=>senses[sense.trim()]).filter(Boolean);
  const english = [...new Set(translations)].join(' / ');
  return english ? '<span class="english-gloss" lang="en" dir="ltr">'+esc(english)+'</span>' : '';
}

function dictionaryMatches(route) {
  const term = normalized(route.query);
  if (!term) return [];
  const joined = term.replaceAll(' ','');
  const exactForms = findVerbForms(term);
  const partialForms = new Map();
  if (term.length >= 2 && /^[a-z]/.test(term)) {
    for (const [key,matches] of indexedForms) {
      if (key.startsWith(term) && (!key.includes(' ') || term.includes(' '))) {
        for (const [word,tense] of matches) if (!partialForms.has(word)) partialForms.set(word,tense);
      }
    }
  }
  const rows = [];
  for (const entry of dictionaryIndex.values()) {
    const source = entry.lessons.find(w=>route.level==='all' || w.lesson.level===route.level);
    if (!source) continue;
    let rank;
    if (entry.de === route.query.trim() || entry.bare === route.query.trim()) rank=0;
    else if (entry.keys.includes(term)) rank=1;
    else if (exactForms.has(entry.de)) rank=2;
    else if (entry.keys.some(key=>key.startsWith(term))) rank=3;
    else if (partialForms.has(entry.de)) rank=4;
    else if (entry.keys.some(key=>key.includes(term) || key.replaceAll(' ','').includes(joined))) rank=5;
    else continue;
    const tense = exactForms.get(entry.de) || (rank === 4 && partialForms.get(entry.de)) || 'present';
    const meaning = entry.meanings.find((_,i)=>entry.keys[i+2].includes(term));
    rows.push({entry,source,meaning:meaning || source.fa,rank,url:wordUrl(entry.de,{...route,lessonId:source.lesson.id,tense})});
  }
  return rows.sort((a,b)=>a.rank-b.rank || dictionaryOrder.compare(a.entry.bare,b.entry.bare)).slice(0,6);
}

function wordSuggestion({entry,source,meaning,url}, index) {
  return '<a class="lex-row" href="'+esc(url)+'" role="option" id="word-option-'+index+'" aria-selected="false" tabindex="-1"><span class="lex-row-copy">'+
    '<b lang="de" dir="ltr">'+esc(entry.de)+'</b><span>'+esc(meaning)+'</span>'+englishGloss(entry,meaning)+'</span>'+
    '<small class="lex-level" dir="ltr">'+esc(source.lesson.level)+'</small>'+ic('left',16)+'</a>';
}

function wordSearchStatus(query, matches) {
  return query.trim() && matches?.length===0 ? 'واژه‌ای پیدا نشد.' : '';
}

function dictionaryPage(route) {
  const matches = dictionaryMatches(route);
  return heading('واژه‌نامه','واژه را با معنی فارسی، شکل جمع یا صرف فعل هم می‌توانی پیدا کنی.',
    '<a class="secondary vocab-practice-link" href="'+vocabPracticeUrl(route.level)+'">'+ic('target',18)+'تمرین لغات</a>')+
    '<div id="dictionary-levels">'+levelLinks(route.level,l=>vocabUrl(l,route.query),true)+'</div>'+
    '<div class="lex-search"><label class="search-field">'+ic('search',21)+
    '<input id="word-search" type="search" role="combobox" aria-label="جست‌وجوی واژه" aria-autocomplete="list" aria-controls="word-suggestions" aria-expanded="'+(matches.length>0)+'" dir="auto" autocomplete="off" spellcheck="false" placeholder="مثلاً gehen، ging یا رفتن" value="'+esc(route.query)+'"></label>'+
    '<div class="lex-popover" id="word-suggestions" role="listbox" aria-label="واژه‌های پیشنهادی"'+(matches.length?'':' hidden')+'>'+matches.map(wordSuggestion).join('')+'</div>'+
    '<p class="hint" role="status" id="word-search-status">'+wordSearchStatus(route.query,matches)+'</p></div>';
}

function formItem(label, markup, german = true) {
  return '<div><dt dir="rtl">'+label+'</dt><dd '+(german?'lang="de" dir="ltr"':'class="lex-form-note" dir="rtl"')+'>'+markup+'</dd></div>';
}

function nounFormMarkup(form, singular = '') {
  const word = form.replace(/^(der|die|das) /,'');
  const article = form.slice(0,form.length-word.length);
  const stem = singular.replace(/^(der|die|das) /,'');
  let markup = esc(word);
  if (stem && stem !== word) {
    // Highlight both the umlaut and the ending in pairs such as Buch / Bücher.
    const plain = letter => letter.normalize('NFD')[0];
    let i = 0;
    markup = '';
    while (i < stem.length && i < word.length && plain(stem[i]) === plain(word[i])) {
      markup += stem[i] === word[i] ? esc(word[i]) : '<em>'+esc(word[i])+'</em>';
      i++;
    }
    let end = word.length, baseEnd = stem.length;
    while (end > i && baseEnd > i && word[end-1] === stem[baseEnd-1]) { end--; baseEnd--; }
    if (i < end) markup += '<em>'+esc(word.slice(i,end))+'</em>';
    markup += esc(word.slice(end));
  }
  return (article?'<span class="lex-article">'+esc(article)+'</span>':'')+markup;
}

function nounSummary(noun) {
  const singular = noun.singular ? formItem('مفرد',nounFormMarkup(noun.singular)) : formItem('مفرد','معمولاً به صورت جمع می‌آید',false);
  const plural = noun.plural ? formItem('جمع',nounFormMarkup(noun.plural,noun.singular || '')) : formItem('جمع','در این معنی معمول نیست',false);
  return '<section class="lex-forms" aria-label="مفرد و جمع اسم"><dl class="lex-form-row" dir="ltr">'+singular+plural+'</dl>'+
    (noun.note?'<p>'+esc(noun.note)+'</p>':'')+'</section>';
}

function verbSummary(verb) {
  const principal = [['حال',verb.present[2]],['گذشتهٔ ساده',verb.past[2]],['گذشتهٔ نقلی',conjugatedForms(verb,'perfect')[2]]];
  const rows = principal.map(([label,value])=>formItem(label,esc(value))).join('');
  const persons = ['مفرد · <bdi lang="de">du</bdi>','جمع · <bdi lang="de">ihr</bdi>','رسمی · <bdi lang="de">Sie</bdi>'];
  const imperative = verb.imperative ? '<dl class="lex-form-row" dir="ltr">'+
    verb.imperative.map((form,i)=>formItem(persons[i],esc(form)+'!')).join('')+'</dl>' :
    '<p>در این کاربرد، شکل امری رایج نیست.</p>';
  return '<section class="lex-forms" aria-label="شکل‌های اصلی فعل"><h2>سوم‌شخص مفرد <bdi lang="de">er / sie / es</bdi></h2>'+
    '<dl class="lex-form-row" dir="ltr">'+rows+'</dl><h2>امر <bdi lang="de">Imperativ</bdi></h2>'+imperative+'</section>';
}

function verbHeadword(word,verb) {
  const particle = verb.present[2].split(' ').at(-1);
  if (!word.includes(' ') && verb.present[2].includes(' ') && word.startsWith(particle)) {
    return esc(particle)+'<span class="lex-verb-break" aria-hidden="true"></span>'+esc(word.slice(particle.length));
  }
  return esc(word);
}

function wordPage(route) {
  const {entry,level,query,tense,lessonId} = route;
  const source = entry.lessons.find(w=>w.lesson.id===lessonId) ||
    entry.lessons.find(w=>w.lesson.level===level) || entry.lessons[0];
  const otherLessons = entry.lessons.filter(w=>w.id!==source.id);
  const verb = verbForms[entry.de];
  const article = /^(der|die|das) /.exec(entry.de);
  const type = verb ? 'فعل' : entry.noun || article ? 'اسم' : entry.de.includes(' ') ? 'عبارت' : '';
  const levelsText = [...new Set(entry.lessons.map(w=>w.lesson.level))].join(' · ');
  const back = '<a class="text-btn lex-back" href="'+esc(vocabUrl(level,query))+'">'+ic('chevron',16)+
    (query?'بازگشت به نتایج جست‌وجو':'بازگشت به واژه‌نامه')+'</a>';
  const summary = verb ? verbSummary(verb) : entry.noun ? nounSummary(entry.noun) : '';
  const headword = verb ? verbHeadword(entry.de,verb) : entry.noun ? nounFormMarkup(entry.de) : esc(entry.de);
  const hero = '<header class="panel lex-hero'+(summary?' has-forms':'')+'"><div class="lex-heading"><div class="lex-meta"><span dir="ltr">'+levelsText+'</span>'+
    (type?'<span>'+type+'</span>':'')+'</div><h1 lang="de" dir="ltr">'+headword+'</h1><p>'+esc(source.fa)+'</p>'+englishGloss(entry,source.fa)+'</div>'+
    summary+wordButton(source)+'</header>';
  const definitions = '<section class="panel lex-section lex-definitions"><h2>'+ic('vocab',20)+'معنی و کاربرد</h2><ul>'+
    entry.meanings.map(s=>'<li>'+esc(s)+englishGloss(entry,s)+'</li>').join('')+'</ul></section>';
  const examples = new Map();
  const distinguishUses = entry.lessons.some(w=>w.fa!==source.fa);
  for (const w of [source,...otherLessons]) {
    for (const [de,fa] of w.lesson.examples[w.de] || []) {
      if (!examples.has(de)) examples.set(de,{de,fa,meaning:distinguishUses ? w.fa : ''});
    }
  }
  for (const [meaning,de,fa] of entry.extra) examples.set(de,{de,fa,meaning});
  const sampleCard = '<section class="panel lex-section lex-examples"><h2>'+ic('book',20)+'جمله‌های مثال</h2><ul>'+
    [...examples.values()].map(({de,fa,meaning})=>'<li>'+(meaning?'<small>'+esc(meaning)+'</small>':'')+
      '<p lang="de" dir="ltr">'+esc(de)+'</p><p>'+esc(fa)+'</p></li>').join('')+'</ul></section>';
  const contexts = '<nav class="lex-context" aria-label="درس‌های این واژه"><b>در درس‌های</b>'+
    [source,...otherLessons].map(w=>'<a href="#'+lessonPath(w.lesson.id,2)+'"><bdi>'+w.lesson.level+'</bdi> · '+esc(w.lesson.fa)+'</a>').join('')+'</nav>';
  return back+hero+'<div class="lex-detail-grid'+(verb?' with-verb':'')+'">'+definitions+
    (verb?conjugationPanel(entry.de,tense):'')+sampleCard+'</div>'+contexts;
}

function showWordSuggestions(input,matches) {
  const list = document.getElementById('word-suggestions');
  list.innerHTML = (matches ?? []).map(wordSuggestion).join('');
  list.hidden = !matches?.length;
  input.setAttribute('aria-expanded',String(!list.hidden));
  input.removeAttribute('aria-activedescendant');
  document.getElementById('word-search-status').textContent=wordSearchStatus(input.value,matches);
}

document.addEventListener('input',event=>{
  const input = event.target;
  if (input.id!=='word-search') return;
  const route = {...readRoute(),query:input.value};
  history.replaceState(null,'',vocabUrl(route.level,route.query));
  const rows = dictionaryMatches(route);
  document.getElementById('dictionary-levels').innerHTML=levelLinks(route.level,l=>vocabUrl(l,route.query),true);
  showWordSuggestions(input,rows);
});

document.addEventListener('focusin',event=>{
  if (event.target.id==='word-search' && event.target.value.trim()) showWordSuggestions(event.target,dictionaryMatches(readRoute()));
});
document.addEventListener('focusout',event=>{
  if (event.target.id==='word-search' && !event.relatedTarget?.closest('.lex-search')) showWordSuggestions(event.target);
});
document.addEventListener('pointerdown',event=>{
  const input = document.getElementById('word-search');
  if (input && !event.target.closest('.lex-search')) showWordSuggestions(input);
});
document.addEventListener('mousedown',event=>{
  if (event.target.closest('#word-suggestions [role=option]')) event.preventDefault();
});

document.addEventListener('keydown',event=>{
  const input = event.target;
  if (input.id!=='word-search' || event.isComposing) return;
  if (event.key==='Escape') { event.preventDefault(); showWordSuggestions(input); return; }
  if (!['ArrowDown','ArrowUp','Enter'].includes(event.key) || !input.value.trim()) return;
  if (input.getAttribute('aria-expanded')==='false') showWordSuggestions(input,dictionaryMatches(readRoute()));
  const options = [...document.querySelectorAll('#word-suggestions [role=option]')];
  if (!options.length) return;
  event.preventDefault();
  let pos = options.findIndex(option=>option.getAttribute('aria-selected')==='true');
  if (event.key==='Enter') { options[Math.max(pos,0)].click(); return; }
  if (pos>=0) options[pos].setAttribute('aria-selected','false');
  pos = event.key==='ArrowDown' ? (pos+1)%options.length : (pos<=0?options.length-1:pos-1);
  options[pos].setAttribute('aria-selected','true');
  input.setAttribute('aria-activedescendant',options[pos].id);
  options[pos].scrollIntoView({block:'nearest'});
});
