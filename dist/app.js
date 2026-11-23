'use strict';
const iconPaths = {
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
const fmt=(d,options)=>new Intl.DateTimeFormat('fa-IR-u-ca-persian',options).format(d);
const store={get(k){try{return localStorage.getItem(k)}catch{return null}},set(k,v){try{localStorage.setItem(k,v)}catch{}}};
const parts=['گفت‌وگو','گرامر','واژگان','تمرین'];
const lessonById=id=>lessons.find(x=>x.id===id);
const wordList=lessons.flatMap(l=>l.words.map(([de,fa],i)=>({id:l.id+':'+i,lesson:l,de,fa})));
let profile=store.get('lernhaus-profile')==='personal'?'personal':'sample';
function initialState(p){
 const s={last:'hallo',part:0,done:{},days:{},cards:{}};
 if(p==='sample'){
   s.last='cafe';s.part=1;s.done={hallo:[0,1,2,3],cafe:[0]};
   [1,2,3,5,8,9,11,15,17,18].forEach(d=>s.days[key(moveDay(today(),-d))]=1);
   ['hallo:0','hallo:1','hallo:2'].forEach(id=>s.cards[id]={box:1,due:key(today())});
 }
 return s;
}
function readState(){try{const s=JSON.parse(store.get('lernhaus-v1-'+profile));if(s&&lessonById(s.last)&&s.done&&s.days&&s.cards)return s}catch{}return initialState(profile)}
let state=readState();
const save=()=>store.set('lernhaus-v1-'+profile,JSON.stringify(state));
save();
let monthAnchor=today(),selectedDay=null,sheetType='',levelFilter='A1',vocabFilter='all',reviewId=null,revealed=false,choice=null;
const current=()=>lessonById(state.last)||lessons[0];
const done=l=>state.done[l.id]||[];
const completeCount=()=>lessons.filter(l=>done(l).length===4).length;
const dueWords=()=>wordList.filter(w=>state.cards[w.id]&&state.cards[w.id].due<=key(today()));
function streak(){let d=today();if(!state.days[key(d)])d=moveDay(d,-1);let n=0;while(state.days[key(d)]){n++;d=moveDay(d,-1)}return n}
function flash(t){const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(flash.tm);flash.tm=setTimeout(()=>el.classList.remove('show'),2200)}
function progressBar(p){return '<span class="track" role="progressbar" aria-label="پیشرفت" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+p+'"><i style="width:'+p+'%"></i></span>'}
function appRoute(){const [,id,part]=location.hash.slice(1).split('/');if(location.hash.startsWith('#lesson/')&&lessonById(id))return {lesson:lessonById(id),part:/^[0-3]$/.test(part)?Number(part):0};return {lesson:null}}
function goLesson(id,part){const l=lessonById(id);const openPart=part??(state.last===id?state.part:Math.max(0,[0,1,2,3].findIndex(i=>!done(l).includes(i))));closeSheet();closeNav();location.hash='lesson/'+id+'/'+openPart}
function goHome(){closeSheet();closeNav();if(location.hash!=='#home')location.hash='home';else render()}
function sidebar(){
 const nav=(act,icon,label,badge='')=>'<button class="nav-item '+((act==='home'&&!appRoute().lesson&&!sheetType)||(act===sheetType)||(act==='courses'&&appRoute().lesson&&!sheetType)?'active':'')+'" data-act="'+act+'">'+ic(icon)+'<span>'+label+'</span>'+badge+'</button>';
 $('#sidebar').innerHTML='<div class="brand-row"><a class="brand" href="#home" data-act="home" aria-label="لرن‌هاوس، خانه"><img src="assets/mark.svg" alt=""><b lang="de">Lernhaus<span>.</span></b></a><button class="mobile-only icon-btn" data-act="nav-close" aria-label="بستن منو">'+ic('close')+'</button></div><div class="side-label">فضای یادگیری</div><nav>'+nav('home','grid','میز مطالعه')+nav('courses','path','مسیر یادگیری')+nav('vocab','vocab','واژه‌نامه')+nav('review','cards','جعبهٔ لایتنر',dueWords().length?'<em>'+num(dueWords().length)+'</em>':'')+'</nav><div class="side-label second">آمادگی آزمون</div><nav>'+nav('exams','exam','منابع آزمون')+'</nav><div class="side-bottom"><div class="review-invite"><div class="invite-icon">'+ic('cards',25)+'</div><b>مرور امروز</b><p>'+num(dueWords().length)+' واژه در صف مرور</p><button data-act="review">ورود به لایتنر</button></div><button class="profile" data-act="profile"><span class="avatar">'+ic('person',21)+'</span><span><b>'+(profile==='sample'?'زبان‌آموز نمونه':'فضای شخصی من')+'</b><small>'+(profile==='sample'?'پروفایل نمایشی':'ذخیره روی این دستگاه')+'</small></span>'+ic('swap',16)+'</button></div>';
}
function topbar(l){
 const dark=document.documentElement.dataset.theme==='dark';
 $('#topbar').innerHTML='<div class="crumb"><button class="icon-btn mobile-only" data-act="nav-open" aria-label="باز کردن منو" aria-controls="sidebar" aria-expanded="false">'+ic('menu')+'</button><span class="desk-home">'+ic('home',17)+'</span><a href="#home">فضای یادگیری</a><span class="crumb-divider">/</span><b>'+(l?'صفحهٔ درس':'میز مطالعه')+'</b></div><div class="tools"><span class="date">'+ic('calendar',16)+fmt(today(),{weekday:'long',day:'numeric',month:'long'})+'</span><span class="tool-divider"></span><button class="theme-btn" data-act="theme" aria-label="'+(dark?'تغییر به حالت روشن':'تغییر به حالت تاریک')+'" title="تغییر حالت نمایش">'+ic(dark?'sun':'moon',18)+'</button></div>';
}
function hero(l){
 const p=done(l).length,idx=lessons.filter(x=>x.level===l.level).indexOf(l)+1;
 return '<section class="hero"><div class="hero-art" role="img" aria-label="تصویرسازی یک کافه در برلین"></div><div class="hero-copy"><div class="hero-kicker"><span class="hero-tag">'+ic('book',15)+' درس جاری</span><span class="hero-meta"><bdi>'+l.level+'</bdi> <i>·</i> درس '+num(idx)+'</span></div><h2 lang="de" dir="ltr">'+l.name+'</h2><p>'+l.fa+'</p><div class="hero-controls"><button class="gold-btn" data-act="continue">'+ic('play',17)+(p===4?'مرور درس':p?'ادامهٔ درس':'شروع درس')+'</button><span>'+ic('clock',16)+num(l.minutes)+' دقیقه</span></div></div><div class="hero-progress">'+progressBar(p*25)+'<span>'+num(p)+' از ۴ بخش</span></div></section>';
}
function metric(icon,value,title,kind){return '<div class="metric"><span class="metric-icon '+kind+'">'+ic(icon,24)+'</span><span><strong>'+num(value)+'</strong><small>'+title+'</small></span></div>'}
function pathCard(){
 return '<section class="panel path-panel"><div class="panel-title"><span class="title-icon">'+ic('path',20)+'</span><h2>مسیر یادگیری</h2><span class="micro">۳ سطح</span></div><div class="level-list">'+levels.map((l,i)=>{
  const group=lessons.filter(x=>x.level===l.code),p=Math.round(group.reduce((n,x)=>n+done(x).length,0)/(group.length*4)*100);
  return '<button class="level-row tone'+i+'" data-act="course" data-value="'+l.code+'"><span class="level-stamp" dir="ltr">'+l.code+'</span><span class="level-copy"><b>دورهٔ '+l.fa+'</b><span lang="de" dir="ltr">'+l.de+'</span></span><span class="level-progress"><span>'+num(p)+'٪</span>'+progressBar(p)+'</span>'+ic('left',15)+'</button>';
 }).join('')+'</div></section>';
}
function monthStart(date){const m=fmt(date,{month:'numeric'});let d=moveDay(date,0);while(fmt(moveDay(d,-1),{month:'numeric'})===m)d=moveDay(d,-1);return d}
function calendar(){
 const first=monthStart(monthAnchor),m=fmt(first,{month:'numeric'});let d=first,days='';let active=0;
 for(let i=0;i<(first.getDay()+1)%7;i++)days+='<span></span>';
 while(fmt(d,{month:'numeric'})===m){const id=key(d),studied=!!state.days[id],isToday=id===key(today()),label=fmt(d,{day:'numeric',month:'long'})+'، '+(studied?'مطالعه شده':id>key(today())?'روز آینده':'بدون مطالعه');if(studied)active++;
 days+='<button aria-label="'+label+'" aria-pressed="'+(id===selectedDay)+'" class="day '+(studied?'studied ':'')+(isToday?'today ':'')+(id>key(today())?'future ':'')+(id===selectedDay?'selected':'')+'" data-act="day" data-value="'+id+'">'+fmt(d,{day:'numeric'})+'</button>';d=moveDay(d,1)}
 const sel=selectedDay?new Date(selectedDay+'T12:00:00'):null;
 return '<section class="panel calendar" id="calendar"><div class="panel-title"><span class="title-icon">'+ic('calendar',19)+'</span><h2>تقویم مطالعه</h2></div><div class="month-bar"><button class="cal-arrow" data-act="month-prev" aria-label="ماه قبل">'+ic('chevron',15)+'</button><b>'+fmt(first,{month:'long',year:'numeric'})+'</b><button class="cal-arrow" data-act="month-next" aria-label="ماه بعد">'+ic('left',15)+'</button></div><div class="cal-grid">'+['ش','ی','د','س','چ','پ','ج'].map(w=>'<span class="weekday">'+w+'</span>').join('')+days+'</div><div class="cal-foot"><span><i class="dot-filled"></i>مطالعه شده</span><span><i class="dot-today"></i>امروز</span></div><p class="day-detail" aria-live="polite">'+(sel?fmt(sel,{day:'numeric',month:'long'})+' · '+(state.days[selectedDay]?'مطالعه ثبت شده':selectedDay>key(today())?'روز آینده':'بدون مطالعه'):num(active)+' روز مطالعه در این ماه')+'</p></section>';
}
function dashboard(){
 return '<div class="heading"><div><h1>میز مطالعه<span class="head-dot">.</span></h1><p>خوش برگشتی! یادگیری آلمانی رو از اینجا ادامه بده.</p></div><span class="greeting" lang="de" dir="ltr">Guten Tag! <span>☀</span></span></div>'+hero(current())+'<div class="metrics">'+metric('fire',streak(),'روز پیاپی مطالعه','warm')+metric('book',completeCount(),'درس تکمیل‌شده','green')+metric('cards',Object.keys(state.cards).length,'واژه در لایتنر','sand')+'</div><div class="lower-grid">'+pathCard()+calendar()+'</div>';
}
function vocabRow(w){const added=!!state.cards[w.id];return '<div class="word-row"><div><b dir="ltr" lang="de">'+esc(w.de)+'</b><span>'+esc(w.fa)+'</span></div><button class="word-add" data-act="add-word" data-value="'+w.id+'" '+(added?'disabled':'')+'>'+ic(added?'check':'plus',16)+(added?'در لایتنر':'لایتنر')+'</button></div>'}
function lessonPage(l,p){
 const completed=done(l),group=lessons.filter(x=>x.level===l.level),already=completed.includes(p);
 const tabs=parts.map((t,i)=>'<a href="#lesson/'+l.id+'/'+i+'" class="part-tab '+(i===p?'chosen':'')+'" '+(i===p?'aria-current="step"':'')+'><i>'+ (completed.includes(i)?ic('check',13):num(i+1))+'</i>'+t+'</a>').join('');
 let content='';
 if(p===0)content='<h2>گفت‌وگو</h2><p class="hint">'+l.goal+'</p><div class="dialogue">'+l.lines.map(([person,de,fa])=>'<div class="speech"><span class="speaker" dir="ltr">'+person+'</span><div><b dir="ltr" lang="de">'+de+'</b><p>'+fa+'</p></div></div>').join('')+'</div>';
 if(p===1)content='<h2>'+l.rule+'</h2><p class="body-text">'+l.explain+'</p><div class="german-example" lang="de" dir="ltr">'+l.example+'</div>';
 if(p===2)content='<h2>واژه‌های درس</h2><p class="hint">واژه‌هایی که می‌خوای دوباره ببینی به لایتنر اضافه کن.</p>'+wordList.filter(w=>w.lesson.id===l.id).map(vocabRow).join('');
 if(p===3)content='<h2>تمرین درس</h2><p class="hint">جای خالی را با گزینهٔ درست پر کن.</p><div class="german-example" dir="ltr" lang="de">'+l.question+'</div><div class="answers">'+l.choices.map((w,i)=>'<button data-act="answer" data-value="'+i+'" class="'+(choice===i?(i===l.answer?'correct':'incorrect'):'')+'" aria-pressed="'+(choice===i)+'" lang="de" dir="ltr">'+w+'</button>').join('')+'</div><p class="feedback" role="status">'+(choice===null?'':choice===l.answer?'درسته! '+l.why:'یک بار دیگه امتحان کن.')+'</p>';
 return '<div class="lesson-heading"><button class="text-btn" data-act="home">'+ic('home',16)+' میز مطالعه</button><span class="micro"><bdi>'+l.level+'</bdi> · درس '+num(group.indexOf(l)+1)+'</span></div><section class="lesson-banner"><div><h1 lang="de" dir="ltr">'+l.name+'</h1><p>'+l.fa+'</p></div><div class="lesson-symbol">'+ic(l.icon,41)+'</div></section><div class="lesson-grid"><section class="panel lesson-content"><nav aria-label="بخش‌های درس" class="part-tabs">'+tabs+'</nav><div class="part-content">'+content+'</div><div class="lesson-actions"><button class="primary" data-act="finish-part" '+(p===3&&choice!==l.answer&&!already?'disabled':'')+'>'+ic('check',17)+(p===3?'پایان تمرین':already?'بخش بعدی':'ثبت و ادامه')+'</button><span>'+num(completed.length)+' از ۴ بخش تکمیل شده</span></div></section><aside class="panel lesson-outline"><div class="panel-title"><span class="title-icon">'+ic('path')+'</span><h2>درس‌های این سطح</h2></div>'+group.map(x=>'<button class="outline-row '+(x.id===l.id?'current':'')+'" data-act="open-lesson" data-value="'+x.id+'"><b>'+x.fa+'</b><small lang="de">'+x.name+'</small></button>').join('')+'</aside></div>';
}
const exams=[
 ['A1','Start Deutsch 1','https://www.telc.net/sprachpruefungen/zertifikatspruefung/deutsch/start-deutsch-1-/-telc-deutsch-a1/'],
 ['A2','Start Deutsch 2','https://www.telc.net/sprachpruefungen/deutsch/start-deutsch-2-telc-deutsch-a2/'],
 ['B1','Zertifikat Deutsch','https://www.telc.net/sprachpruefungen/deutsch/zertifikat-deutsch-telc-deutsch-b1/']
];
function levelTabs(val,action,all=false){return '<div class="filters" aria-label="انتخاب سطح">'+(all?[{code:'all'}]:[]).concat(levels).map(l=>'<button data-act="'+action+'" data-value="'+l.code+'" aria-pressed="'+(val===l.code)+'">'+(l.code==='all'?'همه':l.code)+'</button>').join('')+'</div>'}
function sheetContent(){
 const labels={courses:'انتخاب درس',vocab:'واژه‌نامه',review:'جعبهٔ لایتنر',exams:'منابع آزمون',profile:'فضای مطالعه'};
 $('#sheet-title').textContent=labels[sheetType]||'';let out='';
 if(sheetType==='courses')out=levelTabs(levelFilter,'filter-course')+'<p class="hint">'+levels.find(l=>l.code===levelFilter).about+'</p>'+lessons.filter(l=>l.level===levelFilter).map(l=>'<button class="course-choice" data-act="open-lesson" data-value="'+l.id+'"><span class="title-icon">'+ic(l.icon)+'</span><span><b>'+l.fa+'</b><small lang="de" dir="ltr">'+l.name+'</small></span><em>'+num(done(l).length)+' / ۴</em>'+ic('left',16)+'</button>').join('');
 if(sheetType==='vocab')out=levelTabs(vocabFilter,'filter-vocab',true)+wordList.filter(w=>vocabFilter==='all'||w.lesson.level===vocabFilter).map(vocabRow).join('');
 if(sheetType==='exams')out='<p class="hint">نمونه‌آزمون، پاسخ‌نامه و فایل شنیداری را از سایت مؤسسه باز کن.</p>'+exams.map(([code,title,url])=>'<a class="course-choice" href="'+url+'" target="_blank" rel="noopener noreferrer"><span class="level-mini">'+code+'</span><span><b dir="ltr">telc Deutsch '+code+'</b><small dir="ltr">'+title+'</small></span>'+ic('exam')+'</a>').join('')+'<a class="secondary ext" href="https://www.goethe.de/de/spr/prf/ueb.html" target="_blank" rel="noopener noreferrer">تمرین‌های رسمی گوته</a>';
 if(sheetType==='profile')out='<p class="hint">پروفایل نمونه چند روز سابقهٔ مطالعه دارد. برای ثبت فعالیت‌های خودت، فضای شخصی را انتخاب کن. هر فضا جداگانه روی همین مرورگر ذخیره می‌شود.</p>'+[['sample','پروفایل نمونه'],['personal','فضای شخصی من']].map(([id,title])=>'<button class="course-choice" data-act="use-profile" data-value="'+id+'">'+ic('person')+'<b>'+title+'</b>'+(profile===id?ic('check'):'')+'</button>').join('');
 if(sheetType==='review'){
   const due=dueWords();let w=due.find(x=>x.id===reviewId)||due[0];
   if(w){reviewId=w.id;out='<p class="hint">مرور امروز · '+num(due.length)+' واژه باقی مانده</p><div class="flash-card"><span class="micro"><bdi>'+w.lesson.level+'</bdi> · خانهٔ '+num(state.cards[w.id].box)+'</span><b lang="de" dir="ltr">'+w.de+'</b><p>'+(revealed?w.fa:'معنی این واژه را به یاد بیاور.')+'</p></div>'+(revealed?'<div class="review-actions"><button class="primary" data-act="know">بلدم</button><button class="secondary" data-act="again">دوباره بپرس</button></div>':'<button class="primary wide" data-act="reveal">نمایش معنی</button>')}
   else out='<div class="empty">'+ic('cards',38)+'<h3>مرور امروزت کامل شد</h3><p>از واژه‌نامه می‌تونی کارت تازه اضافه کنی.</p><button class="primary" data-act="vocab">باز کردن واژه‌نامه</button></div>';
 }
 $('#sheet-body').innerHTML=out;
}
function openSheet(type){closeNav();sheetType=type;revealed=false;reviewId=null;sheetContent();sidebar();if(!$('#sheet').open)$('#sheet').showModal();$('#sheet-close').focus()}
function closeSheet(){if($('#sheet').open)$('#sheet').close();sheetType=''}
function closeNav(){document.body.classList.remove('nav-open');$('#scrim').hidden=true;$('#workspace').inert=false;const btn=$('[data-act="nav-open"]');if(btn)btn.setAttribute('aria-expanded','false')}
function openNav(){document.body.classList.add('nav-open');$('#scrim').hidden=false;$('[data-act="nav-open"]').setAttribute('aria-expanded','true');requestAnimationFrame(()=>$('[data-act="nav-close"]').focus());$('#workspace').inert=true}
function render(){
 const {lesson:l,part:p}=appRoute();
 if(l){state.last=l.id;state.part=p;save()}
 topbar(l);sidebar();$('#main').innerHTML=l?lessonPage(l,p):dashboard();document.title=(l?l.fa:'میز مطالعه')+' | Lernhaus';
}
function routeChanged(){choice=null;closeNav();closeSheet();render();window.scrollTo(0,0);$('#main').focus({preventScroll:true})}
function study(){state.days[key(today())]=(state.days[key(today())]||0)+1;save()}
function changeMonth(step){const first=monthStart(monthAnchor);monthAnchor=step<0?moveDay(first,-1):monthStart(moveDay(first,32));selectedDay=null;$('#calendar').outerHTML=calendar();$('[data-act="month-'+(step<0?'prev':'next')+'"]').focus()}
function act(action,value,el){
 switch(action){
 case 'home':goHome();break;
 case 'nav-open':openNav();break;
 case 'nav-close':closeNav();$('[data-act="nav-open"]')?.focus();break;
 case 'theme':{const t=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=t;store.set('lernhaus-theme',t);topbar(appRoute().lesson);$('[data-act="theme"]').focus();break}
 case 'courses':levelFilter=current().level;openSheet('courses');break;
 case 'course':levelFilter=value;openSheet('courses');break;
 case 'vocab':case 'review':case 'exams':case 'profile':openSheet(action);break;
 case 'filter-course':levelFilter=value;sheetContent();$('#sheet [aria-pressed="true"]').focus();break;
 case 'filter-vocab':vocabFilter=value;sheetContent();$('#sheet [aria-pressed="true"]').focus();break;
 case 'use-profile':profile=value;store.set('lernhaus-profile',profile);state=readState();save();selectedDay=null;monthAnchor=today();goHome();render();break;
 case 'open-lesson':goLesson(value);break;
 case 'continue':goLesson(state.last,done(current()).length===4?0:state.part);break;
 case 'close':closeSheet();break;
 case 'month-prev':changeMonth(-1);break;
 case 'month-next':changeMonth(1);break;
 case 'day':selectedDay=value;$('#calendar').outerHTML=calendar();$('#calendar [aria-pressed="true"]').focus();break;
 case 'add-word':if(!state.cards[value]){state.cards[value]={box:1,due:key(today())};save();el.disabled=true;el.innerHTML=ic('check',16)+'در لایتنر';sidebar();flash('واژه به لایتنر اضافه شد')}break;
 case 'answer':choice=Number(value);$('#main').innerHTML=lessonPage(current(),3);$('[data-act="answer"][data-value="'+value+'"]').focus();break;
 case 'finish-part':{
   const {lesson:l,part:p}=appRoute();if(!l||(p===3&&choice!==l.answer&&!done(l).includes(p)))break;
   const previouslyComplete=done(l).length===4;
   if(!done(l).includes(p))state.done[l.id]=[...done(l),p];study();
   if(previouslyComplete && p<3){goLesson(l.id,p+1);break}
   const missing=[0,1,2,3].find(i=>!done(l).includes(i));
   if(missing===undefined){goHome();flash('آفرین! این درس کامل شد.')}
   else if(p<3)goLesson(l.id,p+1);
   else{goLesson(l.id,missing);flash('تمرین ثبت شد. این بخش هنوز باقی مانده.')}
   break}
 case 'reveal':revealed=true;sheetContent();$('#sheet [data-act="know"]').focus();break;
 case 'know':case 'again':{
   const card=state.cards[reviewId];if(!card||!revealed)break;card.box=action==='know'?Math.min(5,card.box+1):1;
   card.due=key(moveDay(today(),[0,1,2,4,8,16][card.box]));study();reviewId=null;revealed=false;sheetContent();render();break}
 }
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(b){e.preventDefault();act(b.dataset.act,b.dataset.value,b)}});
$('#sheet-close').innerHTML=ic('close');$('#sheet').addEventListener('close',()=>{sheetType='';render()});
$('#sheet').addEventListener('click',e=>{if(e.target===$('#sheet')){const r=$('#sheet').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeSheet()}});
$('#scrim').addEventListener('click',()=>act('nav-close'));
document.addEventListener('keydown',e=>{if(!document.body.classList.contains('nav-open'))return;if(e.key==='Escape')act('nav-close');if(e.key==='Tab'){const buttons=[...$('#sidebar').querySelectorAll('a,button')].filter(b=>b.offsetWidth>0),first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
matchMedia('(min-width: 900px)').addEventListener('change',e=>{if(e.matches)closeNav()});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',e=>{if(!store.get('lernhaus-theme')){document.documentElement.dataset.theme=e.matches?'dark':'light';topbar(appRoute().lesson)}});
window.addEventListener('hashchange',routeChanged);
render();
