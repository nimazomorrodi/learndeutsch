const pageTitles = {
  home:'میز مطالعه', courses:'مسیر یادگیری', grammar:'مرجع گرامر', vocab:'واژه‌نامه', word:'مدخل واژه‌نامه', review:'جعبهٔ لایتنر', reviewReport:'کارنامهٔ لایتنر',
  words:'تمرین لغات', wordsReport:'کارنامهٔ تمرین لغات', articles:'تمرین آرتیکل', articleReport:'کارنامهٔ آرتیکل‌ها', exams:'آزمون‌ها', quiz:'آزمون درس', lesson:'صفحهٔ درس', profile:'حساب من'
};
const quizTitles = {grammar:'آزمون گرامر', words:'آزمون واژگان', mixed:'آزمون پایان درس', chapter:'آزمون پایان فصل'};
const topics = {lessons:'درس‌ها', grammar:'گرامر', words:'واژگان'};
const boxDays = [1, 2, 4, 8, 16];

function defaultCourseSection(code) {
  return lessons.find(lesson => lesson.level === code)?.drills ? 'lessons' : 'grammar';
}

function readRoute() {
  const [path, search = ''] = location.hash.slice(1).split('?');
  const [page, item, section] = path.split('/');
  const params = new URLSearchParams(search);
  if (page === 'review') {
    const level = levels.some(l=>l.code===params.get('level')) ? params.get('level') : 'all';
    const box = item === 'box' ? Number(section) : 0;
    return {page:item === 'report' ? 'reviewReport' : page, level, box:Number.isInteger(box) && box >= 1 && box <= boxDays.length ? box : 0};
  }
  if (page === 'lesson' || page === 'quiz') {
    const lesson = lessonById(item);
    if (!lesson) return {page:'courses', level:current().level, section:'lessons'};
    if (page === 'lesson') return {page, lesson, part:/^[0-3]$/.test(section) ? Number(section) : tutorialPart};
    return {page, lesson, kind:Object.hasOwn(quizTitles, section) && (section!=='chapter' || lesson.listening) ? section : endQuiz(lesson)};
  }
  const validLevel = levels.some(l => l.code === item);
  if (page === 'words') return {page:item === 'report' || section === 'report' ? 'wordsReport' : page, level:validLevel ? item : 'all'};
  if (page === 'articles') return {page:item === 'report' || section === 'report' ? 'articleReport' : page, level:validLevel ? item : 'all'};
  if (page === 'word') {
    const level = params.get('level');
    let de;
    try { de = decodeURIComponent(item || ''); } catch { de = ''; }
    const entry = dictionaryIndex.get(de);
    const context = {level:levels.some(l=>l.code === level) ? level : 'all', query:params.get('q') || ''};
    if (!entry) return {page:'vocab', ...context};
    const tense = params.get('tense');
    return {page, entry, ...context, lessonId:params.get('lesson'), tense:Object.hasOwn(verbTenses,tense) ? tense : 'present'};
  }
  if (page === 'grammar') {
    const level = params.get('level');
    return {page, topic:grammarById.get(item), query:params.get('q') || '',
      level:levels.some(l=>l.code===level) ? level : 'all'};
  }
  if (page === 'courses') {
    const level = validLevel ? item : current().level;
    return {page, level, section:Object.hasOwn(topics, section) ? section : defaultCourseSection(level)};
  }
  if (page === 'vocab' || page === 'exams') return {page, level:validLevel ? item : 'all', query:params.get('q') || ''};
  return {page:Object.hasOwn(pageTitles, page) ? page : 'home'};
}

function heading(title, description, control = '') {
  return '<div class="heading section-heading"><div><h1>'+title+'</h1><p>'+description+'</p></div>'+control+'</div>';
}
function autoplaySwitch(action, enabled) {
  return '<button type="button" class="article-autoplay" role="switch" data-act="'+action+'" aria-checked="'+
    (enabled === true)+'"><span class="article-autoplay-track" aria-hidden="true"></span>تلفظ خودکار</button>';
}
function practiceToolbar(level, levelUrl, reportUrl, report) {
  return '<div class="article-toolbar">'+levelLinks(level, levelUrl, true)+
    '<a class="article-report-link" href="'+reportUrl+'"'+(report?' aria-current="page"':'')+'>'+
    ic('exam',17)+'کارنامه</a></div>';
}
function practiceReportPanels(level, counts, total, unit, practiceUrl, note) {
  const practiced = counts.correct + counts.wrong + counts.unknown + (counts.unsplit || 0);
  const percent = (n, total) => total ? num(Math.round(1000*n/total)/10)+'٪' : '—';
  const rows = [['تمرین‌شده',practiced],['بلدم',counts.correct],['نمی‌دانم',counts.unknown],['اشتباه زدم',counts.wrong]];
  if (counts.unsplit) rows.push(['اشتباه یا نمی‌دانم (قدیمی)', counts.unsplit]);
  const scope = level === 'all' ? 'همهٔ سطح‌ها' : 'سطح <bdi>'+esc(level)+'</bdi>';
  const coverage = (label, value) => '<div class="article-coverage-line"><span>'+label+'</span><bdi>'+
    percent(value,total)+'</bdi></div><progress aria-label="'+label+'" max="'+(total || 1)+'" value="'+value+'"></progress>';
  return '<section class="panel article-report"><h2>از واژه‌های تمرین‌شده چقدر بلدم؟</h2>'+
    '<strong class="article-score"><bdi>'+percent(counts.correct,practiced)+'</bdi></strong>'+
    '<p>'+(practiced ? 'پاسخ درست برای '+num(counts.correct)+' واژه از '+num(practiced)+' واژهٔ تمرین‌شده' :
      'با پاسخ به اولین کارت، درصدت اینجا نمایش داده می‌شود.')+'</p>'+
    '<dl class="article-counts">'+rows.map(([label,value])=>'<div><dt>'+label+'</dt><dd>'+num(value)+'</dd></div>').join('')+'</dl>'+
    (note?'<p class="article-legacy">'+note+'</p>':'')+
    '</section><section class="panel article-report article-coverage"><h2>پیشرفت در '+scope+'</h2><p>از مجموع '+num(total)+' '+unit+'، '+
    num(total-practiced)+' '+unit+' هنوز پاسخ ثبت‌شده ندارد.</p>'+coverage('درصد واژه‌های تمرین‌شده از کل',practiced)+
    coverage('درصد واژه‌هایی که از کل بلدم',counts.correct)+
    '<a class="primary" href="'+practiceUrl+'">'+(practiced?'ادامهٔ تمرین':'شروع تمرین')+ic('left',17)+'</a></section>';
}
function choiceLinks(items, selected, href, label) {
  return '<nav class="choice-links" aria-label="'+label+'">'+items.map(([value,title]) =>
    '<a href="'+esc(href(value))+'" '+(selected===value?'aria-current="page"':'')+'>'+title+'</a>'
  ).join('')+'</nav>';
}
function levelLinks(selected, href, all = false) {
  const items = levels.map(l=>[l.code,l.code]);
  if (all) items.unshift(['all','همهٔ سطح‌ها']);
  return choiceLinks(items, selected, href, 'انتخاب سطح');
}
function quizLink(l, kind) {
  return '<a class="secondary practice-link" href="#quiz/'+l.id+'/'+kind+'">'+ic('exam',16)+quizTitles[kind]+'</a>';
}
function coursePage(route) {
  const level=levels.find(l=>l.code===route.level), group=lessons.filter(l=>l.level===route.level);
  const count=group.reduce((n,l)=>n+l.words.length,0);
  const body=group.map((l,index)=>{
    let detail;
    if (route.section==='grammar') detail='<h3>'+l.rule+'</h3><p>'+l.explain+'</p>'+
      (l.notes?'<ul>'+l.notes.map(([title])=>'<li>'+esc(title)+'</li>').join('')+'</ul>':'')+'<div class="course-actions"><a href="#lesson/'+l.id+'/1">خواندن گرامر</a>'+quizLink(l,'grammar')+'</div>';
    else if (route.section==='words') detail='<h3>واژه‌های «'+l.fa+'»</h3><div class="word-chips">'+l.words.map(([de],i)=>
      '<span class="course-word"><a lang="de" dir="ltr" href="'+esc(wordUrl(de,{level:l.level,lessonId:l.id}))+'">'+esc(de)+'</a>'+
      wordButton({id:l.id+':'+i,de},true)+'</span>').join('')+'</div><div class="course-actions">'+quizLink(l,'words')+'</div>';
    else detail='<h3>'+l.fa+'</h3><p>'+l.goal+'</p><div class="course-actions"><a href="#'+lessonPath(l.id)+'">ورود به درس</a>'+(l.drills?'<a href="#lesson/'+l.id+'/3">تمرین فصل</a>':'')+quizLink(l,endQuiz(l))+'</div>';
    return '<article class="panel curriculum-card"><div class="card-meta"><span class="title-icon">'+ic(l.icon,19)+'</span><span>درس '+num(index+1)+'</span><span dir="ltr" lang="de">'+l.name+'</span></div>'+detail+'</article>';
  }).join('');
  return heading('مسیر یادگیری','سطح را انتخاب کن تا درس‌ها، گرامر و واژه‌های همان دوره را ببینی.')+
    levelLinks(level.code,code=>'#courses/'+code+'/'+route.section)+
    '<section class="course-banner flex items-center gap-5" data-level="'+esc(level.code)+'"><span class="large-level" dir="ltr">'+level.code+'</span><div><h2>دورهٔ '+level.fa+'</h2><p>'+level.about+'</p><small>'+num(group.length)+' درس · '+num(count)+' واژه</small></div></section>'+
    (group[0]?.drills?'<p class="course-start"><a class="primary" href="#'+lessonPath(group[0].id)+'">شروع از درس اول</a></p>':'')+
    choiceLinks(Object.entries(topics),route.section,section=>'#courses/'+level.code+'/'+section,'محتوای دوره')+
    '<div class="catalog-grid grid">'+body+'</div>'+courseSources(level);
}

function normalized(text) {
  return text.toLocaleLowerCase('de').replace(/ß/g,'ss').replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue')
    .normalize('NFKD').replace(/\p{M}/gu,'').replace(/ي|ى/g,'ی').replace(/ك/g,'ک').replace(/[\u200c\u200d\s\-]+/g,' ').trim();
}
function vocabUrl(level, query) {
  const params=new URLSearchParams();
  if(query) params.set('q',query);
  return '#vocab/'+level+(params.size?'?'+params:'');
}
function pairedSentences(pairs) {
  return '<ul class="examples">'+pairs.map(([de,fa])=>'<li><p lang="de" dir="ltr">'+esc(de)+'</p><p>'+esc(fa)+'</p></li>').join('')+'</ul>';
}

function reviewDirectionPicker() {
  const choices = [['de-fa','آلمانی به فارسی'],['fa-de','فارسی به آلمانی']];
  return '<fieldset class="review-direction"><legend>جهت مرور</legend><div>'+choices.map(([value,label])=>
    '<label><input type="radio" name="review-direction" value="'+value+'"'+(account.reviewDirection===value?' checked':'')+'>'+label+'</label>'
  ).join('')+'</div></fieldset>';
}

function pronunciationButton(id, lang, part, label) {
  const query = new URLSearchParams({card:id, lang, part});
  return '<button type="button" lang="fa" class="review-speaker" data-act="pronounce" data-src="pronunciation.php?'+esc(query.toString())+
    '" aria-label="'+esc(label)+'" title="'+esc(label)+'" aria-pressed="false">'+ic('volume',19)+'</button>';
}

function reviewCard(card) {
  const [front,back] = account.reviewDirection.split('-');
  const languages = {de:'آلمانی',fa:'فارسی'};
  const pair = card.lesson.examples?.[card.de]?.find(([de,fa]) => de && fa);
  function face(side,language,hint,hidden) {
    const dir = language === 'de' ? 'ltr' : 'rtl';
    const example = pair?.[language === 'de' ? 0 : 1];
    function speaker(part) {
      const label='تلفظ '+(part==='word'?'واژه':'جمله')+' به '+languages[language];
      return pronunciationButton(card.id,language,part,label);
    }
    return '<div class="review-face '+side+'" aria-hidden="'+hidden+'"'+(hidden?' inert':'')+'><span class="review-language">'+languages[language]+'</span>'+
      '<div class="review-entry" lang="'+language+'" dir="'+dir+'"><div class="review-utterance"><strong id="review-'+side+'-word" lang="'+language+'" dir="'+dir+'">'+esc(card[language])+'</strong>'+speaker('word')+'</div>'+
      (example?'<div class="review-utterance"><span id="review-'+side+'-example" class="review-example">'+esc(example)+'</span>'+speaker('example')+'</div>':'')+'</div>'+
      '<span id="review-'+side+'-hint" class="turn-hint">'+(side==='back' && reviewResult ? esc(reviewRatings[reviewResult]) : ic('swap',16)+hint)+'</span></div>';
  }
  return '<div class="review-card-stage"><button type="button" class="review-card" data-act="flip-card" aria-controls="review-feedback" '+
    'aria-labelledby="'+reviewFaceLabel(revealed)+'" aria-expanded="'+revealed+'"'+(reviewResult?' disabled':'')+'></button><div class="review-sheet"'+
    (reviewResult?' data-review-result="'+reviewResult+'"':'')+'>'+
    face('front',front,'دیدن پاسخ '+languages[back],revealed)+face('back',back,'برگشت به روی کارت',!revealed)+'</div></div>';
}

function reviewFaceLabel(back) {
  const prefix=back?'review-back-':'review-front-';
  return prefix+'word '+prefix+'example '+prefix+'hint';
}

function flipReviewCard(button) {
  if (reviewResult) return;
  stopReviewAudio();
  revealed = !revealed;
  button.setAttribute('aria-expanded',String(revealed));
  button.setAttribute('aria-labelledby',reviewFaceLabel(revealed));
  for (const face of button.parentElement.querySelectorAll('.review-face')) {
    face.inert = face.classList.contains('front') === revealed;
    face.setAttribute('aria-hidden',String(face.inert));
  }
  document.getElementById('review-feedback').hidden = !revealed;
  document.getElementById('review-unknown').hidden = revealed;
  if (revealed && state.reviewAutoplay) playReviewAudio(button.parentElement.querySelector('.back .review-speaker'));
}

let reviewPlayback = null;

function stopReviewAudio() {
  if (!reviewPlayback) return;
  const {audio,button}=reviewPlayback;
  reviewPlayback=null;
  audio.pause();
  audio.removeAttribute('src');
  audio.load();
  button.removeAttribute('aria-busy');
  button.setAttribute('aria-pressed','false');
  button.innerHTML=ic('volume',19);
}

async function playReviewAudio(button) {
  const wasPlaying=reviewPlayback?.button===button;
  stopReviewAudio();
  if (wasPlaying) return;
  const audio=new Audio(button.dataset.src);
  reviewPlayback={audio,button};
  button.setAttribute('aria-busy','true');
  button.setAttribute('aria-pressed','true');
  button.innerHTML=ic('clock',19);
  const failed=()=>{
    if (reviewPlayback?.audio!==audio) return;
    stopReviewAudio();
    flash('تلفظ پخش نشد. برای تلاش دوباره روی بلندگو بزن.');
  };
  audio.addEventListener('error',failed);
  audio.addEventListener('ended',()=>{if(reviewPlayback?.audio===audio)stopReviewAudio();});
  try {
    await audio.play();
    if (reviewPlayback?.audio!==audio) return;
    button.removeAttribute('aria-busy');
    button.innerHTML=ic('stop',17);
  } catch { failed(); }
}
window.addEventListener('pagehide',stopReviewAudio);

const reviewRatings = {correct:'بلدم', wrong:'اشتباه گفتم', unknown:'نمی‌دانم'};

function reviewUrl(level, path = '') {
  return '#review'+path+(level && level!=='all'?'?level='+encodeURIComponent(level):'');
}

function reviewDeck(level) {
  return wordList.filter(w=>state.cards[w.id] && (level==='all' || w.lesson.level===level));
}

function reviewReportPage(level) {
  const deck=reviewDeck(level);
  const counts={correct:0,wrong:0,unknown:0};
  let legacyKnown=0;
  for (const word of deck) {
    const card=state.cards[word.id];
    if (card.lastResult) counts[card.lastResult]++;
    else if (card.box>1) { counts.correct++; legacyKnown++; }
  }
  const note=legacyKnown ? 'برای '+num(legacyKnown)+' کارت قدیمی، آخرین پاسخ درست از روی خانهٔ کارت مشخص شده است.' : '';
  return heading('کارنامهٔ لایتنر','هر کارتِ جعبه‌ات یک‌بار شمرده می‌شود. «بلدم» یعنی آخرین بار معنی واژه را درست به یاد آوردی.')+
    practiceToolbar(level,l=>reviewUrl(l,'/report'),reviewUrl(level,'/report'),true)+
    practiceReportPanels(level,counts,deck.length,'کارت',reviewUrl(level),note);
}

function reviewActions(box) {
  if (reviewResult) return '<button type="button" class="primary" data-act="review-next" aria-describedby="review-back-hint">کارت بعدی'+ic('left',17)+'</button>';
  const ratings=Object.entries(reviewRatings).map(([value,label])=>
    '<button type="button" class="'+(value==='correct'?'primary':'secondary')+'" data-act="review-rate" data-value="'+value+'">'+label+'</button>').join('');
  return ratings+(box?'<button type="button" class="text-btn review-skip" data-act="review-next">عبور بدون ثبت پاسخ</button>':'');
}

function rateReview(result) {
  const {page,box,level}=readRoute();
  const card=state.cards[reviewId];
  if (page!=='review' || !card || reviewResult || !Object.hasOwn(reviewRatings,result) || (!revealed && result!=='unknown')) return;
  const flip=$('.review-card');
  if (!revealed) flipReviewCard(flip);
  reviewResult=result;
  card.lastResult=result;
  if (!box) {
    card.box=result==='correct' ? Math.min(boxDays.length,card.box+1) : 1;
    card.due=key(moveDay(today(),boxDays[card.box-1]));
  }
  study();
  if (!box) {
    const deck=reviewDeck(level);
    const cards=deck.map(w=>state.cards[w.id]);
    $('.box-grid').innerHTML=reviewBoxLinks(cards,box,level);
    $('.review-meta').innerHTML=reviewMeta(deck.find(w=>w.id===reviewId),box,cards.filter(c=>c.due<=key(today())).length);
  }
  flip.disabled=true;
  flip.nextElementSibling.dataset.reviewResult=result;
  $('#review-back-hint').textContent=reviewRatings[result];
  $('#review-feedback .review-actions').innerHTML=reviewActions(box);
  $('#review-feedback [data-act="review-next"]').focus({preventScroll:true});
  sidebar();
}

function nextReview(restart) {
  const {page,box}=readRoute();
  if (page!=='review' || (restart && !box) || (!restart && (!revealed || (!box && !reviewResult)))) return;
  if (restart) boxReviewIndex=0;
  else if (box) {
    boxReviewIndex++;
    if (!reviewResult) study();
  }
  reviewId=null; reviewResult=null; revealed=false;
  render();
  ($('#main .review-card') || $('#main .empty button, #main .empty a, #main .lex-back'))?.focus({preventScroll:true});
}

function reviewBoxLinks(cards,box,level) {
  return boxDays.map((days,i)=>{
    const number=i+1, count=cards.filter(c=>c.box===number).length;
    const label='مرور خانهٔ '+num(number)+' با '+num(count)+' کارت';
    return '<a href="'+reviewUrl(level,'/box/'+number)+'" class="box-cell" aria-label="'+label+'"'+
      (box===number?' aria-current="page" data-act="restart-box"':'')+'><span>خانهٔ '+num(number)+'</span>'+
      '<strong>'+num(count)+'</strong><small>هر '+num(days)+' روز</small></a>';
  }).join('');
}
function reviewMeta(card,box,count) {
  const position = box ? 'کارت '+num(boxReviewIndex+1)+' از '+num(count) : num(count)+' کارت باقی‌مانده';
  return '<span>'+ic('cards')+'<bdi>'+esc(card.lesson.level)+'</bdi> · خانهٔ '+num(state.cards[card.id].box)+'</span><span>'+position+'</span>';
}

function reviewPage({box,level}){
  const deck=reviewDeck(level);
  const cards=deck.map(w=>state.cards[w.id]);
  const queue=deck.filter(w=>box ? state.cards[w.id].box===box : state.cards[w.id].due<=key(today()));
  const card=reviewResult ? deck.find(w=>w.id===reviewId) : box ? queue[boxReviewIndex] : queue.find(w=>w.id===reviewId)||queue[0];

  let exercise;
  if(card){
    reviewId=card.id;
    exercise='<div class="review-meta">'+reviewMeta(card,box,queue.length)+'</div>'+
      reviewCard(card)+'<div id="review-unknown" class="review-actions"'+(revealed?' hidden':'')+'>'+
      '<button type="button" class="secondary" data-act="review-rate" data-value="unknown">نمی‌دانم</button></div>'+
      '<div id="review-feedback"'+(revealed?'':' hidden')+'><div class="review-actions">'+reviewActions(box)+'</div></div>';
  }else if(box){
    const finished=queue.length>0;
    exercise='<div class="empty">'+ic(finished?'check':'cards',36)+'<h2>'+(finished?
      'مرور '+num(queue.length)+' کارت این خانه تمام شد':'این خانه هنوز کارتی ندارد')+'</h2>'+
      (finished?'<button type="button" class="secondary" data-act="restart-box">مرور دوبارهٔ همین خانه</button>':'')+'</div>';
  }else{
    const next=cards.map(c=>c.due).sort()[0];
    exercise='<div class="empty">'+ic('cards',36)+'<h2>'+(cards.length?'مرور امروزت کامل شد':'جعبهٔ لایتنرت خالیه')+'</h2><p>'+(next?'مرور بعدی در '+fmt(new Date(next+'T12:00:00'),{day:'numeric',month:'long'}):'از واژه‌نامه یک کلمه برای اولین مرور انتخاب کن.')+'</p><a class="primary" href="#vocab">باز کردن واژه‌نامه</a></div>';
  }
  const autoplay=autoplaySwitch('review-autoplay',state.reviewAutoplay);
  const intro=box ? '<a class="text-btn lex-back" href="'+reviewUrl(level)+'">'+ic('chevron',16)+'بازگشت به مرور امروز</a>'+
    heading('مرور آزاد خانهٔ '+num(box),'پاسخت در کارنامه ثبت می‌شود. موعد بعدی کارت طبق برنامه می‌ماند.',autoplay) :
    heading('جعبهٔ لایتنر','کارت‌های امروز را مرور کن یا برای مرور آزاد، یکی از پنج خانه را انتخاب کن.',autoplay);
  return intro+practiceToolbar(level,l=>reviewUrl(l,box?'/box/'+box:''),reviewUrl(level,'/report'),false)+
    '<section class="panel review-surface">'+reviewDirectionPicker()+exercise+'</section>'+
    '<section class="panel box-panel"><h2>کارت‌های من در پنج خانه</h2><div class="box-grid grid">'+reviewBoxLinks(cards,box,level)+'</div></section>';
}

function examsPage(route) {
  const selected=route.level;
  const group=lessons.filter(l=>selected==='all'||l.level===selected);
  const official=exams.filter(([level])=>selected==='all'||level===selected).map(([level,title,url])=>
    '<div class="resource-row"><bdi>'+level+'</bdi><a href="'+url+'" target="_blank" rel="noopener noreferrer">telc · '+title+'</a><a href="https://www.goethe.de/de/spr/prf/ueb/'+({A1:'pa1',A2:'pa2',B1:'pb1'}[level])+'.html" target="_blank" rel="noopener noreferrer">Goethe · '+level+'</a></div>').join('');
  const list=group.map(l=>'<article class="panel curriculum-card"><div class="card-meta"><bdi>'+l.level+'</bdi><span lang="de" dir="ltr">'+l.name+'</span></div><h3>'+l.fa+'</h3><p>'+l.rule+'</p><div class="course-actions">'+quizLink(l,'grammar')+quizLink(l,'words')+quizLink(l,endQuiz(l))+'</div></article>').join('');
  return heading('آزمون‌ها','از هر درس یک آزمون گرامر، واژگان یا پایان درس انتخاب کن.')+
    levelLinks(selected,l=>'#exams/'+l,true)+'<div class="catalog-grid grid">'+list+'</div>'+
    '<section class="panel resource-panel"><h2>نمونه‌آزمون‌های رسمی</h2><p class="hint">دریافت نمونه‌آزمون و فایل شنیداری از سایت مؤسسه به اینترنت نیاز دارد.</p>'+official+'</section>';
}
function quizKey(r){return r.lesson.id+'/'+r.kind}
function newAttempt(){return {index:0, answers:[]}}
function quizPage(route){
  const {lesson,kind}=route, questions=questionsFor(lesson,kind);
  const record=state.quizzes?.[quizKey(route)];
  const run=record?.run || newAttempt();
  const intro=heading(quizTitles[kind],lesson.fa+' · '+lesson.level);
  const returnPart = {grammar:1,words:2,mixed:3,chapter:3}[kind];
  const link='<a class="text-btn" href="#'+lessonPath(lesson.id,returnPart)+'">'+ic('book',16)+' بازگشت به '+lessonParts.find(part=>part.id===returnPart).label+' درس</a>';
  if(record?.last && !record.run){
    const a=record.last.answers;
    return intro+'<section class="panel quiz-panel"><div class="quiz-summary"><span>'+ic('exam',25)+'</span><h2>نتیجهٔ آزمون</h2><strong>'+num(record.last.score)+' از '+num(questions.length)+'</strong><p>بهترین نتیجه '+num(record.best)+' از '+num(questions.length)+'</p></div>'+questions.map((q,i)=>'<div class="graded">'+questionMaterial(lesson,q,true)+'<b>'+num(i+1)+'. <bdi>'+esc(q.question)+'</bdi></b><p>'+(a[i]===q.answer?'پاسخ درست':'پاسخ تو «'+esc(q.choices[a[i]])+'» · پاسخ درست «'+esc(q.choices[q.answer])+'»')+'</p><small>'+q.why+'</small></div>').join('')+'<div class="course-actions"><button class="primary" data-act="retry-quiz">دوباره امتحان کن</button>'+link+(kind==='chapter'?afterChapter(lesson):'')+'</div></section>';
  }
  const q=questions[run.index], selected=run.answers[run.index], locked=Number.isInteger(selected);
  const exam = kind === 'chapter';
 const options=q.choices.map((c,i)=>'<button class="quiz-option '+(locked?(exam?(i===selected?'picked':''):(i===q.answer?'right':i===selected?'wrong':'')):'')+'" data-act="quiz-answer" data-value="'+i+'" '+(locked?'disabled':'')+'><span>'+num(i+1)+'</span><bdi>'+esc(c)+'</bdi>'+(locked&&(exam?i===selected:i===q.answer)?ic('check',18):'')+'</button>').join('');
  return intro+'<section class="panel quiz-panel"><div class="quiz-meta"><b>سؤال '+num(run.index+1)+' از '+num(questions.length)+'</b>'+link+'</div>'+progressBar(Math.round(run.index/questions.length*100))+
    questionMaterial(lesson,q,locked && !exam)+'<h2 class="quiz-question" dir="auto">'+esc(q.question)+'</h2><div class="quiz-options">'+options+'</div>'+
    (locked?(exam?'<p class="hint" role="status">پاسخت ثبت شد. پاسخ‌نامه را در پایان می‌بینی.</p>':'<div class="quiz-feedback" role="status"><b>'+(selected===q.answer?'درسته!':'پاسخ درست: '+esc(q.choices[q.answer]))+'</b><p>'+q.why+'</p></div>')+'<button class="primary" data-act="quiz-next">'+(run.index===questions.length-1?'دیدن نتیجه':'سؤال بعدی')+'</button>':'')+'</section>';
}
function updateQuiz(action,value){
  const route=readRoute();
  if(route.page!=='quiz')return;
  state.quizzes??={};
  const record=state.quizzes[quizKey(route)]??={best:0};
  if(action==='retry-quiz')record.run=newAttempt();
  else{
    if(!record.run&&record.last)return;
    const run=record.run??=newAttempt(), questions=questionsFor(route.lesson,route.kind), q=questions[run.index];
    if(action==='quiz-answer'){
      const i=Number(value);
      if(run.answers[run.index]!==undefined||!Number.isInteger(i)||i<0||i>=q.choices.length)return;
      run.answers.push(i);
    }else{
      if(run.answers[run.index]===undefined)return;
      if(run.index+1<questions.length)run.index++;
      else{
        const score=questions.filter((q,i)=>q.answer===run.answers[i]).length;
        record.last={score,answers:run.answers,day:key(today())};record.best=Math.max(score,record.best);
        delete record.run;
        if((route.kind==='mixed'||route.kind==='chapter')&&!done(route.lesson).includes(3))state.done[route.lesson.id]=[...done(route.lesson),3];
        study();
      }
    }
  }
  save();render();
  ($('#main [data-act="quiz-next"]')||$('#main [data-act="quiz-answer"]')||$('#main [data-act="retry-quiz"]'))?.focus({preventScroll:true});
}
