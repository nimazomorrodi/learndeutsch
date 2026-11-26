'use strict';
const iconPaths = {
 search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
 home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
 book:'<path d="M3 4.5c3.5-1 6.5.1 9 2 2.5-1.9 5.5-3 9-2v14c-3.5-1-6.5.1-9 2-2.5-1.9-5.5-3-9-2zM12 6.5v14"/>',
 path:'<circle cx="5" cy="5" r="2"/><circle cx="19" cy="19" r="2"/><path d="M7 5h7a4 4 0 0 1 0 8H9a3 3 0 0 0 0 6h8"/>',
 vocab:'<path d="M4 4h10a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2zM4 16h12M9 8h3M19 7h1v13"/>',
 cards:'<rect x="6" y="6" width="14" height="15" rx="2"/><path d="M4 17V5a2 2 0 0 1 2-2h11M10 11h6m-6 4h4"/>',
 exam:'<path d="M8 4H6a2 2 0 0 0-2 2v14h16V6a2 2 0 0 0-2-2h-2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="m8 13 3 3 5-6"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.6 1.6m10.8 10.8L19 19M19 5l-1.6 1.6M6.6 17.4 5 19"/>',
 moon:'<path d="M20.4 14.7A9 9 0 0 1 9.3 3.6a9 9 0 1 0 11.1 11.1z"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 10h18m-13 4h2m4 0h2"/>',
 chevron:'<path d="m9 5 7 7-7 7"/>',left:'<path d="m15 5-7 7 7 7"/>',down:'<path d="m6 9 6 6 6-6"/>',
 play:'<path d="M7 4.8c0-.6.7-1 1.2-.7l11.3 7.2a.8.8 0 0 1 0 1.4L8.2 19.9c-.5.3-1.2-.1-1.2-.7z" fill="currentColor" stroke="none"/>',
 volume:'<path d="M11 5 6 9H3v6h3l5 4zM15 9a4 4 0 0 1 0 6m3-9a8 8 0 0 1 0 12"/>',
 stop:'<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" stroke="none"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 fire:'<path d="M12 2c1 4-2 6-2 9 2 0 4-2 5-4 2.5 2.5 5 5 5 8a8 8 0 0 1-16 0c0-4.5 4-6 4.5-9 1 1 1 2 1.2 3C11 7 12 5 12 2z"/><path d="M13 14c0 2-2 2.5-2 4"/>',
 check:'<path d="m5 12 4 4L19 6"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>',
 menu:'<path d="M3 6h18M3 12h18M3 18h18"/>',plus:'<path d="M12 5v14M5 12h14"/>',
 layers:'<path d="m3 8 9-5 9 5-9 5zm0 5 9 5 9-5m-18 5 9 5 9-5"/>',
 coffee:'<path d="M3 9h13v6a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5zm13 1h2a3 3 0 0 1 0 6h-2M2 22h17M7 2v3m4-2v3"/>',
 chat:'<path d="M20 11a8 8 0 0 1-8 8H8l-5 3 1.5-6A8 8 0 1 1 20 11Z"/><path d="M8 10h8m-8 4h5"/>',
 train:'<rect x="5" y="2" width="14" height="16" rx="4"/><path d="M5 10h14m-10 4h1m4 0h1M8 18l-3 4m11-4 3 4"/>',
 case:'<rect x="2" y="7" width="20" height="14" rx="3"/><path d="M8 7V4h8v3M2 12a25 25 0 0 0 20 0"/>',
 target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
 grid:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
 person:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a7 7 0 0 1 7-7h2a7 7 0 0 1 7 7v2"/>',
 flag:'<path d="M5 22V3c5-4 9 4 15 0v11c-6 4-10-4-15 0"/>', swap:'<path d="M4 8h15m-3-3 3 3-3 3M20 16H5m3-3-3 3 3 3"/>'
};
const ic=(name,size=20)=>'<svg class="ic" width="'+size+'" height="'+size+'" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">'+(iconPaths[name]||'')+'</svg>';
const $=sel=>document.querySelector(sel);
const num=n=>new Intl.NumberFormat('fa-IR').format(n);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=()=>new Date();
const moveDay=(date,step)=>new Date(date.getFullYear(),date.getMonth(),date.getDate()+step,12);
const key=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
const fmt=(d,options)=>new Intl.DateTimeFormat('fa-IR-u-ca-gregory',options).format(d);
const store={get(k){try{return localStorage.getItem(k)}catch{return null}},set(k,v){try{localStorage.setItem(k,v)}catch{}}};
const lessonById=id=>lessons.find(x=>x.id===id);
const wordList=lessons.flatMap(l=>l.words.map(([de,fa],i)=>({id:l.id+':'+i,lesson:l,de,fa})));
const dictionaryIndex=buildDictionaryIndex(wordList);
const state = account.state;
let monthAnchor=today(),selectedDay=null,reviewId=null,revealed=false;
let boxReviewIndex=0, reviewResult=null;
const current=()=>lessonById(state.last)||lessons[0];
const done=l=>state.done[l.id]||[];
const canResumeLesson=l=>done(l).length<lessonParts.length && (done(l).length>0 || (state.part!==tutorialPart && revision>0));
const completeCount=()=>lessons.filter(l=>done(l).length===lessonParts.length).length;
const dueWords=()=>wordList.filter(w=>state.cards[w.id]&&state.cards[w.id].due<=key(today()));
function streak(){let d=today();if(!state.days[key(d)])d=moveDay(d,-1);let n=0;while(state.days[key(d)]){n++;d=moveDay(d,-1)}return n}
function flash(t){const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(flash.tm);flash.tm=setTimeout(()=>el.classList.remove('show'),2200)}
function progressBar(p){return '<span class="track" role="progressbar" aria-label="پیشرفت" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+p+'"><i style="width:'+p+'%"></i></span>'}
function goLesson(id,part){
 navigate(lessonPath(id,part));
}
function navigate(path){
 closeNav();
 if(location.hash==='#'+path)render();
 else location.hash=path;
}
function goHome(){navigate('home')}
function sidebar(){
 const page=readRoute().page;
 const section=page==='lesson'?'courses':page==='quiz'?'exams':page==='word'?'vocab':page==='articleReport'?'articles':page==='reviewReport'?'review':page==='wordsReport'?'words':page;
 const nav=(target,icon,label,badge='')=>'<a class="nav-item '+(section===target?'active':'')+'" href="#'+target+'" '+(section===target?'aria-current="page"':'')+'>'+ic(icon)+'<span>'+label+'</span>'+badge+'</a>';
 $('#sidebar').innerHTML='<div class="brand-row"><a class="brand" href="#home" data-act="home" aria-label="لرن‌هاوس، خانه"><img src="assets/mark.svg" alt=""><b lang="de">Lernhaus<span>.</span></b></a><button class="mobile-only icon-btn" data-act="nav-close" aria-label="بستن منو">'+ic('close')+'</button></div><div class="side-label">فضای یادگیری</div><nav>'+nav('home','grid','میز مطالعه')+nav('courses','path','مسیر یادگیری')+nav('grammar','book','مرجع گرامر')+nav('vocab','vocab','واژه‌نامه')+nav('words','target','تمرین لغات')+nav('articles','layers','تمرین آرتیکل')+nav('review','cards','جعبهٔ لایتنر',dueWords().length?'<em>'+num(dueWords().length)+'</em>':'')+'</nav><div class="side-label second">آمادگی آزمون</div><nav>'+nav('exams','exam','آزمون‌ها و منابع')+'</nav><div class="side-bottom"><div class="review-invite"><div class="invite-icon">'+ic('cards',25)+'</div><b>مرور امروز</b><p>'+num(dueWords().length)+' واژه در صف مرور</p><button data-act="review">ورود به لایتنر</button></div><button class="profile" data-act="profile"><span class="avatar">'+ic('person',21)+'</span><span><b data-account-name dir="auto">'+esc(accountName())+'</b><small>حساب من</small></span>'+ic('swap',16)+'</button></div>';
}
function topbar(){
 const dark=document.documentElement.dataset.theme==='dark';
 $('#topbar').innerHTML='<div class="crumb"><button class="icon-btn mobile-only" data-act="nav-open" aria-label="باز کردن منو" aria-controls="sidebar" aria-expanded="false">'+ic('menu')+'</button><span class="desk-home">'+ic('home',17)+'</span><a href="#home">فضای یادگیری</a><span class="crumb-divider">/</span><b>'+pageTitles[readRoute().page]+'</b></div><div class="tools"><span class="date">'+ic('calendar',16)+fmt(today(),{weekday:'long',day:'numeric',month:'long'})+'</span><span class="tool-divider"></span><button class="theme-btn" data-act="theme" aria-label="'+(dark?'تغییر به حالت روشن':'تغییر به حالت تاریک')+'" title="تغییر حالت نمایش">'+ic(dark?'sun':'moon',18)+'</button></div>';
}
function hero(l){
 const p=done(l).length,idx=lessons.filter(x=>x.level===l.level).indexOf(l)+1;
 return '<section class="hero" data-level="'+esc(l.level)+'"><div class="hero-art" aria-hidden="true"></div><div class="hero-copy"><div class="hero-kicker"><span class="hero-tag">'+ic('book',15)+' درس جاری</span><span class="hero-meta"><bdi>'+l.level+'</bdi> <i>·</i> درس '+num(idx)+'</span></div><h2 lang="de" dir="ltr">'+l.name+'</h2><p>'+l.fa+'</p><div class="hero-controls"><button class="gold-btn" data-act="continue">'+ic('play',17)+(p===lessonParts.length?'مرور درس':canResumeLesson(l)?'ادامهٔ درس':'شروع درس')+'</button><span>'+ic('clock',16)+num(l.minutes)+' دقیقه</span></div></div><div class="hero-progress">'+progressBar(Math.round(p/lessonParts.length*100))+'<span>'+num(p)+' از '+num(lessonParts.length)+' بخش</span></div></section>';
}
function metric(icon,value,title,kind){return '<div class="metric"><span class="metric-icon '+kind+'">'+ic(icon,24)+'</span><span><strong>'+num(value)+'</strong><small>'+title+'</small></span></div>'}
function pathCard(){
 return '<section class="panel path-panel"><div class="panel-title"><span class="title-icon">'+ic('path',20)+'</span><h2>مسیر یادگیری</h2><span class="micro">۳ سطح</span></div><div class="level-list">'+levels.map((l,i)=>{
  const group=lessons.filter(x=>x.level===l.code),p=Math.round(group.reduce((n,x)=>n+done(x).length,0)/(group.length*lessonParts.length)*100);
  return '<button class="level-row tone'+i+'" data-act="course" data-value="'+l.code+'"><span class="level-stamp" dir="ltr">'+l.code+'</span><span class="level-copy"><b>دورهٔ '+l.fa+'</b><span lang="de" dir="ltr">'+l.de+'</span></span><span class="level-progress"><span>'+num(p)+'٪</span>'+progressBar(p)+'</span>'+ic('left',15)+'</button>';
 }).join('')+'</div></section>';
}
function monthStart(date,offset=0){return new Date(date.getFullYear(),date.getMonth()+offset,1,12)}
function calendar(){
 const first=monthStart(monthAnchor),todayId=key(today());let days='',active=0;
 for(let i=0;i<(first.getDay()+1)%7;i++)days+='<span></span>';
 for(let d=first;d.getMonth()===first.getMonth();d=moveDay(d,1)){
  const id=key(d),studied=!!state.days[id],isToday=id===todayId,future=id>todayId;
  const label=fmt(d,{day:'numeric',month:'long'})+'، '+(studied?'مطالعه شده':future?'روز آینده':'بدون مطالعه');
  if(studied)active++;
  days+='<button aria-label="'+label+'" aria-pressed="'+(id===selectedDay)+'" class="day '+(studied?'studied ':'')+(isToday?'today ':'')+(future?'future ':'')+(id===selectedDay?'selected':'')+'" data-act="day" data-value="'+id+'">'+num(d.getDate())+'</button>';
 }
 const sel=selectedDay?new Date(selectedDay+'T12:00:00'):null;
 return '<section class="panel calendar" id="calendar"><div class="panel-title"><span class="title-icon">'+ic('calendar',19)+'</span><h2>تقویم مطالعه</h2></div><div class="month-bar"><button class="cal-arrow" data-act="month-prev" aria-label="ماه قبل">'+ic('chevron',15)+'</button><b>'+fmt(first,{month:'long',year:'numeric'})+'</b><button class="cal-arrow" data-act="month-next" aria-label="ماه بعد">'+ic('left',15)+'</button></div><div class="cal-grid grid grid-cols-7 items-center justify-items-center">'+['ش','ی','د','س','چ','پ','ج'].map(w=>'<span class="weekday">'+w+'</span>').join('')+days+'</div><div class="cal-foot"><span><i class="dot-filled"></i>مطالعه شده</span><span><i class="dot-today"></i>امروز</span></div><p class="day-detail" aria-live="polite">'+(sel?fmt(sel,{day:'numeric',month:'long'})+' · '+(state.days[selectedDay]?'مطالعه ثبت شده':selectedDay>key(today())?'روز آینده':'بدون مطالعه'):num(active)+' روز مطالعه در این ماه')+'</p></section>';
}
function dashboard(){
 return '<div class="heading"><div><h1>میز مطالعه<span class="head-dot">.</span></h1><p>سلام <bdi class="welcome-name" data-account-name>'+esc(accountName())+'</bdi>، خوش برگشتی!</p></div><span class="greeting" lang="de" dir="ltr">Guten Tag! <span>☀</span></span></div>'+hero(current())+'<div class="metrics grid grid-cols-3">'+metric('fire',streak(),'روز پیاپی مطالعه','warm')+metric('book',completeCount(),'درس تکمیل‌شده','green')+metric('cards',Object.keys(state.cards).length,'واژه در لایتنر','sand')+'</div><div class="lower-grid">'+pathCard()+calendar()+'</div>';
}
function wordButton(w, compact=false){
 const added=!!state.cards[w.id];
 const label=added?'در لایتنر':'افزودن به لایتنر';
 return '<button type="button" class="word-add'+(compact?' compact':'')+'" data-act="add-word" data-value="'+esc(w.id)+'" '+
   (compact?'aria-label="'+esc(label+' · '+w.de)+'" title="'+esc(label+' · '+w.de)+'" ':'')+(added?'disabled':'')+'>'+
   ic(added?'check':'plus',16)+(compact?'':label)+'</button>';
}
function vocabRow(w){
 return '<div class="word-row"><div><a class="word-link" dir="ltr" lang="de" href="'+esc(wordUrl(w.de,{level:w.lesson.level,lessonId:w.lesson.id}))+'">'+esc(w.de)+'</a><span>'+esc(w.fa)+'</span></div>'+wordButton(w)+'</div>'+
   '<details class="word-examples"><summary>مثال‌های '+esc(w.de)+'</summary>'+pairedSentences(w.lesson.examples[w.de] || [])+'</details>';
}
function lessonPage(l,p){
 const completed=done(l),group=lessons.filter(x=>x.level===l.level);
 const position=lessonParts.findIndex(part=>part.id===p);
 const tabs=lessonParts.map(({id,label},i)=>'<a href="#'+lessonPath(l.id,id)+'" class="part-tab '+(id===p?'chosen':'')+'" '+(id===p?'aria-current="step"':'')+'><i>'+ (completed.includes(id)?ic('check',13):num(i+1))+'</i>'+label+'</a>').join('');
 let content=p===tutorialPart?lessonTutorial(l):'';
 if(p===0){
   const lines=l.lines.map(([person,de,fa])=>'<div class="speech"><span class="speaker" dir="ltr">'+esc(person)+'</span><div><b dir="ltr" lang="de">'+esc(de)+'</b><p>'+esc(fa)+'</p></div></div>').join('');
   content='<h2>گفت‌وگو</h2><p class="hint">'+esc(l.goal)+'</p>'+lessonAudio(l,'dialogue')+'<div class="dialogue">'+lines+'</div>';
 }
 if(p===1)content=grammarSections(l);
 if(p===2)content='<h2>واژه‌های درس</h2><p class="hint">واژه‌هایی که می‌خوای دوباره ببینی به لایتنر اضافه کن.</p>'+
   (l.drills?'<details class="speaking-task"><summary>تمرین تک‌تک واژه‌های فصل</summary><div class="chapter-word-card" aria-live="polite">'+wordCard(l,0)+'</div></details>':'')+
   wordList.filter(w=>w.lesson.id===l.id).map(vocabRow).join('');
 if(p===1)content+=quizLink(l,'grammar')+referenceLinksForLesson(l);
 if(p===2)content+=quizLink(l,'words');
 if(p===3 && l.drills)content=chapterPractice(l);
 else if(p===3)content='<h2>آزمون‌های این درس</h2><p class="hint">گرامر یا واژه‌های همین درس را تمرین کن. آزمون پایان درس هر دو مبحث را می‌سنجد.</p><div class="test-links">'+['grammar','words','mixed'].map(kind=>quizLink(l,kind)).join('')+'</div>';
 const next=position<lessonParts.length-1?'<button class="primary" data-act="finish-part">'+ic('check',17)+(completed.includes(p)?'ادامه به ':'ثبت و ادامه به ')+lessonParts[position+1].label+'</button>':'<a class="text-btn" href="#courses/'+l.level+'/lessons">درس‌های این سطح</a>';
 return '<div class="lesson-heading"><button class="text-btn" data-act="home">'+ic('home',16)+' میز مطالعه</button><span class="micro"><bdi>'+l.level+'</bdi> · درس '+num(group.indexOf(l)+1)+'</span></div><section class="lesson-banner" data-level="'+esc(l.level)+'"><div><h1 lang="de" dir="ltr">'+l.name+'</h1><p>'+l.fa+'</p></div><div class="lesson-symbol">'+ic(l.icon,41)+'</div></section><div class="lesson-grid"><section class="panel lesson-content"><nav aria-label="بخش‌های درس" class="part-tabs grid">'+tabs+'</nav><div class="part-content">'+content+'</div><div class="lesson-actions">'+next+'<span>'+num(completed.length)+' از '+num(lessonParts.length)+' بخش تکمیل شده</span></div></section><aside class="panel lesson-outline"><div class="panel-title"><span class="title-icon">'+ic('path')+'</span><h2>درس‌های این سطح</h2></div>'+group.map(x=>'<button class="outline-row '+(x.id===l.id?'current':'')+'" data-act="open-lesson" data-value="'+x.id+'"><b>'+x.fa+'</b><small lang="de">'+x.name+'</small></button>').join('')+'</aside></div>';
}
function closeNav(){document.body.classList.remove('nav-open');$('#scrim').hidden=true;$('#workspace').inert=false;const btn=$('[data-act="nav-open"]');if(btn)btn.setAttribute('aria-expanded','false')}
function openNav(){document.body.classList.add('nav-open');$('#scrim').hidden=false;$('[data-act="nav-open"]').setAttribute('aria-expanded','true');requestAnimationFrame(()=>$('[data-act="nav-close"]').focus());$('#workspace').inert=true}
function render(){
 stopReviewAudio();
 const route=readRoute();
 let content;
 switch(route.page){
   case 'lesson':
     if(state.last!==route.lesson.id || state.part!==route.part){
       state.last=route.lesson.id;state.part=route.part;save();
     }
     content=lessonPage(route.lesson,route.part);break;
   case 'courses': content=coursePage(route);break;
   case 'grammar': content=grammarPage(route);break;
   case 'vocab': content=dictionaryPage(route);break;
   case 'word': content=wordPage(route);break;
   case 'review': content=reviewPage(route);break;
   case 'reviewReport': content=reviewReportPage(route.level || 'all');break;
   case 'words': content=vocabPracticePage(route.level);break;
   case 'wordsReport': content=vocabPracticeReport(route.level || 'all');break;
   case 'articles': content=articlePracticePage(route.level);break;
   case 'articleReport': content=articleReportPage(route.level || 'all');break;
   case 'exams': content=examsPage(route);break;
   case 'quiz': content=quizPage(route);break;
   case 'profile': content=profilePage();break;
   default: content=dashboard();
 }
 topbar();sidebar();$('#main').innerHTML=content;
 if (route.page === 'home' || navigator.standalone || matchMedia('(display-mode: standalone)').matches) {
   document.title = 'Lernhaus';
 } else {
   document.title = (route.page==='lesson'?route.lesson.fa:route.page==='word'?route.entry.de:pageTitles[route.page])+' | Lernhaus';
 }
}
function routeChanged(){boxReviewIndex=0;reviewId=null;reviewResult=null;revealed=false;closeNav();render();window.scrollTo(0,0);$('#main').focus({preventScroll:true})}
function study(){state.days[key(today())]=(state.days[key(today())]||0)+1;save()}
function changeMonth(step){monthAnchor=monthStart(monthAnchor,step);selectedDay=null;$('#calendar').outerHTML=calendar();$('[data-act="month-'+(step<0?'prev':'next')+'"]').focus()}
function act(action,value,el){
 switch(action){
 case 'home':goHome();break;
 case 'nav-open':openNav();break;
 case 'nav-close':closeNav();$('[data-act="nav-open"]')?.focus();break;
 case 'theme':LernhausTheme.toggle();$('[data-act="theme"]').focus();break;
 case 'course':navigate('courses/'+value+'/'+defaultCourseSection(value));break;
 case 'review':case 'profile':navigate(action);break;
 case 'logout':signOut(el);break;
 case 'import-browser':importProgress(store.get('lernhaus-v1-personal'),el);break;
 case 'open-lesson':goLesson(value);break;
 case 'continue':goLesson(state.last,canResumeLesson(current()) ? state.part : tutorialPart);break;
 case 'month-prev':changeMonth(-1);break;
 case 'month-next':changeMonth(1);break;
 case 'day':selectedDay=value;$('#calendar').outerHTML=calendar();$('#calendar [aria-pressed="true"]').focus();break;
 case 'add-word':{
   const word=wordList.find(w=>w.id===value);
   if(!word||state.cards[value])break;
   state.cards[value]={box:1,due:key(today())};
   save();
   for(const button of document.querySelectorAll('[data-act="add-word"]')){
     if(button.dataset.value===value)button.outerHTML=wordButton(word,button.classList.contains('compact'));
   }
   sidebar();flash('واژه به لایتنر اضافه شد');break;
 }
 case 'quiz-answer':case 'quiz-next':case 'retry-quiz':updateQuiz(action,value);break;
 case 'finish-part':{
   const {lesson:l,part:p}=readRoute();
   const next=lessonParts[lessonParts.findIndex(part=>part.id===p)+1];
   if(!l||!next)break;
   if(!done(l).includes(p))state.done[l.id]=[...done(l),p];
   study();goLesson(l.id,next.id);break;
 }
 case 'flip-card':flipReviewCard(el);break;
 case 'vocab-answer':answerVocab(value);break;
 case 'article-answer':answerArticle(value);break;
 case 'article-autoplay':case 'review-autoplay':case 'vocab-autoplay':{
   const setting={'article-autoplay':'articleAutoplay','review-autoplay':'reviewAutoplay','vocab-autoplay':'vocabAutoplay'}[action];
   state[setting] = state[setting] !== true;
   el.setAttribute('aria-checked', String(state[setting]));
   if (!state[setting]) stopReviewAudio();
   save();
   break;
 }
 case 'article-next':case 'vocab-next':nextPractice();break;
 case 'article-restart':case 'vocab-restart':nextPractice(true);break;
 case 'pronounce':playReviewAudio(el);break;
 case 'review-rate':rateReview(value);break;
 case 'review-next':case 'restart-box':nextReview(action==='restart-box');break;
 }
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(b){e.preventDefault();act(b.dataset.act,b.dataset.value,b)}});
$('.skip').addEventListener('click',event=>{
 event.preventDefault();
 $('#main').focus();
});
document.addEventListener('click',event=>{
 if(event.target.closest('#sidebar a') && document.body.classList.contains('nav-open'))closeNav();
});
$('#scrim').addEventListener('click',()=>act('nav-close'));
document.addEventListener('keydown',e=>{if(!document.body.classList.contains('nav-open'))return;if(e.key==='Escape')act('nav-close');if(e.key==='Tab'){const buttons=[...$('#sidebar').querySelectorAll('a,button')].filter(b=>b.offsetWidth>0),first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
matchMedia('(min-width: 900px)').addEventListener('change',e=>{if(e.matches)closeNav()});
window.addEventListener('lernhaus-theme-changed',topbar);
window.addEventListener('hashchange',routeChanged);
render();
