'use strict';

const grammarTopics = account.reference.grammar;
const grammarById = new Map(grammarTopics.map(topic=>[topic.id,topic]));

function referenceUrl(level = 'all', query = '', topic = '') {
  const params = new URLSearchParams();
  if (level !== 'all') params.set('level',level);
  if (query) params.set('q',query);
  return '#grammar'+(topic?'/'+topic:'')+(params.size?'?'+params:'');
}

function relatedGrammar(topic) {
  return lessons.filter(l=>Object.hasOwn(topic.related,l.id)).map(lesson=>{
    const sections=[[lesson.rule,lesson.explain,lesson.example,lesson.exampleFa],...lesson.notes];
    return {lesson,sections:topic.related[lesson.id].map(i=>sections[i])};
  });
}

const grammarIndex = grammarTopics.map(topic=>{
  const related=relatedGrammar(topic);
  const levels=new Set([topic.level,...related.map(r=>r.lesson.level)]);
  const names=normalized([topic.title,topic.german,topic.keywords].join(' '));
  const text=normalized([topic.category,topic.explanation,...related.flatMap(r=>r.sections.map(s=>s[0]))].join(' '));
  return {topic,levels,names,text};
});

function grammarResults(route) {
  const terms=normalized(route.query).split(' ').filter(Boolean);
  const groups=new Map();
  let count=0;
  for (const {topic,levels,names,text} of grammarIndex) {
    if (route.level!=='all' && !levels.has(route.level)) continue;
    if (!terms.every(t=>names.includes(t)||text.includes(t))) continue;
    const url=referenceUrl(route.level,route.query,topic.id);
    const card='<a class="panel grammar-card" href="'+esc(url)+'"><b>'+esc(topic.title)+'</b>'+
      '<span lang="de" dir="ltr">'+esc(topic.german)+'</span></a>';
    if (!groups.has(topic.category)) groups.set(topic.category,[]);
    groups.get(topic.category).push(card);
    count++;
  }
  const tally='<p class="result-count" role="status">'+num(count)+' موضوع</p>';
  if (!count) return tally+'<div class="panel empty"><h2>موضوعی پیدا نشد</h2><p>نام فارسی یا آلمانی را امتحان کن یا سطح را تغییر بده.</p></div>';
  return tally+[...groups].map(([name,cards])=>'<section class="grammar-group"><h2>'+esc(name)+'</h2>'+
    '<div class="catalog-grid grid">'+cards.join('')+'</div></section>').join('');
}

function referenceTable(rows) {
  if (!rows) return '';
  const [head,...body]=rows;
  return '<div class="reference-table-wrap" tabindex="0" role="region" aria-label="جدول دستوری"><table class="reference-table"><thead><tr>'+
    head.map(s=>'<th scope="col">'+esc(s)+'</th>').join('')+'</tr></thead><tbody>'+
    body.map(row=>'<tr>'+row.map((s,i)=>i===0?'<th scope="row"><bdi>'+esc(s)+'</bdi></th>':'<td><bdi>'+esc(s)+'</bdi></td>').join('')+'</tr>').join('')+
    '</tbody></table></div>';
}

function referenceLinksForLesson(lesson) {
  const topics=grammarTopics.filter(topic=>Object.hasOwn(topic.related,lesson.id));
  return '<nav class="grammar-related" aria-label="مباحث مرتبط در مرجع گرامر"><h3>مطالعه در مرجع گرامر</h3><div class="word-chips">'+
    topics.map(t=>'<a href="'+referenceUrl(lesson.level,'',t.id)+'">'+esc(t.title)+'</a>').join('')+'</div></nav>';
}

function grammarPage(route) {
  const topic=route.topic;
  if (!topic) return heading('مرجع گرامر','یک مبحث را به فارسی یا آلمانی پیدا کن. با انتخاب سطح، موضوع‌هایی را می‌بینی که در همان دوره به کار می‌روند.')+
    '<label class="search-field">'+ic('search',21)+'<input id="grammar-search" type="search" dir="auto" autocomplete="off" aria-label="جست‌وجوی گرامر" placeholder="مثلاً داتیو، گذشته یا Perfekt" value="'+esc(route.query)+'"></label>'+
    '<div id="grammar-levels">'+levelLinks(route.level,l=>referenceUrl(l,route.query),true)+'</div>'+
    '<div id="grammar-results">'+grammarResults(route)+'</div>';

  const examples=topic.examples.map(([de,fa,why])=>'<div class="reference-example"><div class="tutorial-example">'+
    '<p lang="de" dir="ltr">'+esc(de)+'</p><p>'+esc(fa)+'</p></div><p class="hint">'+esc(why)+'</p></div>').join('');
  const related=relatedGrammar(topic).map(({lesson,sections})=>'<details class="reference-lesson"><summary><bdi>'+lesson.level+
    '</bdi> · '+esc(lesson.fa)+'</summary>'+sections.map(([title,body,de,fa])=>'<section><h3>'+esc(title)+'</h3>'+
    '<p>'+esc(body)+'</p>'+pairedSentences([[de,fa]])+'</section>').join('')+
    '<a class="word-link" href="#'+lessonPath(lesson.id)+'">آموزش این درس</a></details>').join('');
  return '<a class="text-btn" href="'+esc(referenceUrl(route.level,route.query))+'">'+ic('book',16)+' فهرست گرامر</a>'+
    '<article class="panel reference-article"><header><p class="hint">'+esc(topic.category)+'</p><h1>'+esc(topic.title)+'</h1>'+
    '<p lang="de" dir="ltr" class="reference-german">'+esc(topic.german)+'</p></header><p class="reference-rule">'+esc(topic.explanation)+'</p>'+
    referenceTable(topic.table)+'<h2>مثال و معنی</h2>'+examples+'<h2>در درس‌های این دوره‌ها</h2>'+related+
    (topic.source?'<p class="grammar-source"><a class="word-link" href="'+esc(topic.source[1])+'" target="_blank" rel="noopener noreferrer">'+esc(topic.source[0])+'</a></p>':'')+'</article>';
}

document.addEventListener('input',event=>{
  if (event.target.id !== 'grammar-search') return;
  const route=readRoute();
  route.query=event.target.value;
  history.replaceState(null,'',referenceUrl(route.level,route.query));
  document.getElementById('grammar-levels').innerHTML=levelLinks(route.level,l=>referenceUrl(l,route.query),true);
  document.getElementById('grammar-results').innerHTML=grammarResults(route);
});
