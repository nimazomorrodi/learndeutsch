'use strict';

const verbTenses = {
  present: ['حال · Präsens', 'برای کاری در حال یا یک عادت.'],
  past: ['گذشتهٔ ساده · Präteritum', 'برای روایت گذشته، به‌ویژه در نوشتار.'],
  perfect: ['گذشتهٔ گفتاری · Perfekt', 'فعل کمکی در زمان حال و شکل گذشتهٔ فعل اصلی.'],
  pluperfect: ['گذشتهٔ دور · Plusquamperfekt', 'برای کاری که پیش از یک اتفاق دیگر در گذشته انجام شده است.'],
  future: ['آینده · Futur I', 'برای پیش‌بینی، وعده یا بیان کاری در آینده.'],
  subjunctive: ['حالت فرضی · Konjunktiv II', 'برای فرض، آرزو یا درخواست مؤدبانه.']
};
const verbPersons = ['ich', 'du', 'er / sie / es', 'wir', 'ihr', 'sie / Sie'];
const persianPersons = ['من', 'تو', 'او', 'ما', 'شما', 'آن‌ها'];
const presentStems = {
  'آمدن':'آی', 'آوردن':'آور', 'افتادن':'افت', 'انداختن':'انداز', 'بردن':'بر', 'توانستن':'توان',
  'خریدن':'خر', 'خوابیدن':'خواب', 'خواستن':'خواه', 'خواندن':'خوان', 'خوردن':'خور', 'دادن':'ده',
  'دانستن':'دان', 'دیدن':'بین', 'رسیدن':'رس', 'رفتن':'رو', 'رقصیدن':'رقص', 'زدن':'زن',
  'سنجیدن':'سنج', 'سپردن':'سپار', 'شدن':'شو', 'شمردن':'شمار', 'فرستادن':'فرست', 'فهمیدن':'فهم',
  'ماندن':'مان', 'نشستن':'نشین', 'نوشتن':'نویس', 'نوشیدن':'نوش', 'پرداختن':'پرداز', 'چسباندن':'چسبان',
  'چیدن':'چین', 'کردن':'کن', 'کشیدن':'کش', 'گذاشتن':'گذار', 'گذراندن':'گذران', 'گرفتن':'گیر',
  'گنجاندن':'گنجان', 'یافتن':'یاب'
};
const presentEndings = ['م','ی','د','یم','ید','ند'];
const pastEndings = ['م','ی','','یم','ید','ند'];

function persianForm(verb, tense, person) {
  const words = verb.faInfinitive.split(' ');
  const infinitive = words.pop(), past = infinitive.slice(0,-1);
  const subject = verb.thirdPerson && person === 2 ? 'آن' : persianPersons[person];
  const predicate = words.join(' ');
  const end = presentEndings[person];
  let form;
  switch (tense) {
    case 'present':
      if (infinitive === 'بودن') form = ['هستم','هستی','است','هستیم','هستید','هستند'][person];
      else if (infinitive === 'داشتن') form = 'دار'+end;
      else form = 'می‌'+presentStems[infinitive]+end;
      break;
    case 'past': form = past+pastEndings[person]; break;
    case 'perfect': form = past+'ه'+['‌ام','‌ای',' است','‌ایم','‌اید','‌اند'][person]; break;
    case 'pluperfect': form = past+'ه بود'+pastEndings[person]; break;
    case 'future': form = 'خواه'+end+' '+past; break;
    case 'subjunctive':
      if (verb.infinitive === 'mögen') return subject+' میل دار'+end;
      if (verb.infinitive === 'sollen') return 'بهتر است '+subject+' این کار را انجام بده'+end;
      form = (['داشتن','بودن'].includes(infinitive) ? '' : 'می‌')+past+pastEndings[person];
      return [subject,'در آن صورت',predicate,form].filter(Boolean).join(' ');
  }
  return [subject,predicate,form].filter(Boolean).join(' ');
}
const reflexives = ['mich','dich','sich','uns','euch','sich'];
const verbForms = account.reference.verbs;

function conjugatedForms(verb, tense) {
  if (Array.isArray(verb[tense])) return verb[tense];
  const past = tense === 'perfect' || tense === 'pluperfect';
  const auxiliary = past ? verbForms[verb.aux] : verbForms.werden;
  const forms = tense === 'pluperfect' ? auxiliary.past :
    tense === 'subjunctive' ? auxiliary.subjunctive : auxiliary.present;
  const tail = past ? verb.perfect : verb.infinitive;
  return forms.map((form,i)=>form+' '+tail.replace('{sich}',reflexives[i]));
}

function conjugationTable(verb, tense) {
  const forms = conjugatedForms(verb,tense);
  const rows = forms.flatMap((form,i)=>{
    if (verb.thirdPerson && i !== 2 && i !== 5) return [];
    const persons = i === 5 && !verb.thirdPerson ? [['sie',5],['Sie',4]] :
      [[i === 5 ? 'sie' : verbPersons[i],i]];
    return persons.map(([de,person])=>'<tr><th scope="row" lang="de" dir="ltr">'+de+'</th>'+
      '<td lang="de" dir="ltr">'+esc(form)+'</td><td dir="rtl">'+esc(persianForm(verb,tense,person))+'</td></tr>');
  }).join('');
  return '<p class="inflection-hint">'+verbTenses[tense][1]+'</p><table class="verb-table"><thead><tr>'+
    '<th scope="col">ضمیر</th><th scope="col">شکل فعل</th><th scope="col">معنی فارسی</th></tr></thead><tbody>'+rows+'</tbody></table>';
}

function conjugationPanel(word, tense) {
  const verb = verbForms[word];
  const tabs = Object.entries(verbTenses).map(([key,[label]])=>{
    const [fa,de] = label.split(' · ');
    const active = key===tense;
    return '<button type="button" role="tab" data-tense="'+key+'" id="tense-'+key+'" aria-controls="verb-paradigm" '+
      'aria-selected="'+active+'" tabindex="'+(active?'0':'-1')+'"><span>'+ic('check',15)+fa+'</span><small lang="de" dir="ltr">'+de+'</small></button>';
  }).join('');
  return '<section class="panel lex-section conjugation" data-verb="'+esc(word)+'"><h2>'+ic('book',20)+'صرف فعل</h2>'+
    '<p class="inflection-hint">ترجمهٔ این جدول برای معنی «'+esc(verb.faInfinitive)+'» است.</p>'+
    '<div class="tense-tabs" role="tablist" aria-label="زمان یا حالت فعل">'+tabs+'</div>'+
    '<div class="verb-paradigm" id="verb-paradigm" tabindex="0" role="tabpanel" aria-labelledby="tense-'+tense+'">'+conjugationTable(verb,tense)+'</div>'+
    (verb.thirdPerson?'<p class="inflection-hint">این کاربرد معمولاً با فاعل سوم‌شخص می‌آید.</p>':'')+
    (verb.note?'<p class="inflection-hint">'+esc(verb.note)+'</p>':'')+'</section>';
}

// Index complete forms, including the personal pronoun and separated prefix.
// An exact form such as "ging" should open the relevant tense, even on a deep link.
let indexedForms;
function findVerbForms(term) {
  if (!term) return new Map();
  if (!indexedForms) {
    indexedForms = new Map();
    function add(text, word, tense) {
      const key = normalized(text.replace(/\s*…/g,''));
      if (!indexedForms.has(key)) indexedForms.set(key,new Map());
      const matches = indexedForms.get(key);
      if (!matches.has(word)) matches.set(word,tense);
    }
    for (const [word,verb] of Object.entries(verbForms)) {
      for (const alias of verb.aliases || []) add(alias,word,'subjunctive');
      for (const tense of Object.keys(verbTenses)) {
        conjugatedForms(verb,tense).forEach((form,i)=>{
          if (verb.thirdPerson && i!==2 && i!==5) return;
          add(form,word,tense);
          for (const pronoun of verbPersons[i].split(' / ')) add(pronoun+' '+form,word,tense);
        });
      }
      if (!verb.perfect.includes('{')) add(verb.perfect,word,'perfect');
      const participle=verb.perfect.split(' ').at(-1);
      if (!Object.hasOwn(verbForms,participle)) add(participle,word,'perfect');
    }
  }
  return indexedForms.get(term) || new Map();
}

function activateTense(tab) {
  const host = tab.closest('[data-verb]');
  for (const other of host.querySelectorAll('[role=tab]')) {
    other.setAttribute('aria-selected',String(other===tab));
    other.tabIndex = other===tab ? 0 : -1;
  }
  const tense = tab.dataset.tense;
  const panel = host.querySelector('.verb-paradigm');
  panel.setAttribute('aria-labelledby',tab.id);
  panel.innerHTML = conjugationTable(verbForms[host.dataset.verb],tense);
  const route = readRoute();
  history.replaceState(null,'',wordUrl(route.entry.de,{...route,tense}));
}

document.addEventListener('click',event=>{
  const tab = event.target.closest('.tense-tabs [role=tab]');
  if (tab && tab.getAttribute('aria-selected')!=='true') activateTense(tab);
});

document.addEventListener('keydown',event=>{
  const tab = event.target.closest('.tense-tabs [role=tab]');
  if (!tab || !['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)) return;
  event.preventDefault();
  const tabs = [...tab.parentElement.children];
  const columns = getComputedStyle(tab.parentElement).gridTemplateColumns.split(' ').length;
  const delta = {ArrowLeft:1,ArrowRight:-1,ArrowDown:columns,ArrowUp:-columns};
  let next;
  if (event.key==='Home') next=tabs[0];
  else if (event.key==='End') next=tabs.at(-1);
  else next=tabs[(tabs.indexOf(tab)+delta[event.key]+tabs.length)%tabs.length];
  next.focus();
  activateTense(next);
});
