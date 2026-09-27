const STATUS_OPTS=[
  {value:'interested',label:'מעוניינים'},
  {value:'closed',label:'נסגר'},
  {value:'irrelevant',label:'לא רלוונטי'},
];
const ACTIVE=new Set(STATUS_OPTS.map(o=>o.value));
const SRC_LOGO={'חב״ד אונליין':{src:'img/col.png',cls:'chip-col'},'חב״ד אינפו':{src:'img/chabad.png',cls:'chip-chabad'}};
let leads=[],meta={updated:''};
let statuses={},filter='all';
try{statuses=JSON.parse(localStorage.getItem('leads-status.v2')||'{}')}catch(e){}
try{filter=localStorage.getItem('leads-filter.v2')||'all'}catch(e){}
const st=n=>{const v=statuses[String(n)];return v&&ACTIVE.has(v)?v:'';};
const FILTERS=new Set(['all',...ACTIVE]);

function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e;}

function render(){
  const activeFilter=FILTERS.has(filter)?filter:'all';
  document.getElementById('fact').textContent=`${leads.length} זוגות · עודכן ${meta.updated}`;
  const visible=leads.filter(l=>activeFilter==='all'?true:st(l.n)===activeFilter);
  document.getElementById('group-label').textContent=`הזוגות (${visible.length})`;
  const count=k=>leads.filter(l=>st(l.n)===k).length;
  const fdef=[
    {value:'all',label:`הכל (${leads.length})`},
    {value:'interested',label:`מעוניינים (${count('interested')})`},
    {value:'closed',label:`נסגר (${count('closed')})`},
    {value:'irrelevant',label:`לא רלוונטי (${count('irrelevant')})`},
  ];
  const fbox=document.getElementById('filters');fbox.innerHTML='';
  fdef.forEach(o=>{
    const b=el('button',activeFilter===o.value?'sel':'',o.label);
    b.onclick=()=>{filter=o.value;try{localStorage.setItem('leads-filter.v2',o.value)}catch(e){};render();};
    fbox.appendChild(b);
  });
  const box=document.getElementById('leads');box.innerHTML='';
  visible.forEach(l=>{
    const card=el('div','lead');
    const logos=el('div','lead-logos');
    l.sources.forEach(sr=>{
      const info=SRC_LOGO[sr.label];if(!info)return;
      const a=el('a',info.cls);a.href=sr.url;a.target='_blank';a.rel='noopener noreferrer';a.title=sr.label;a.setAttribute('aria-label',sr.label);
      const img=document.createElement('img');img.src=info.src;img.alt=sr.label;
      a.appendChild(img);logos.appendChild(a);
    });
    card.appendChild(logos);
    const main=el('div','lead-main');
    const row=el('div','lead-names-row');
    [['חתן',l.groom,l.groomCity],['כלה',l.bride,l.brideCity]].forEach(([role,sur,city])=>{
      const side=el('div','lead-side');
      side.appendChild(el('span','lead-role',role));
      side.appendChild(el('span','lead-surname',sur));
      if(city)side.appendChild(el('span','lead-city',city));
      row.appendChild(side);
    });
    main.appendChild(row);
    const metaRow=el('div','lead-meta');
    const bdi=document.createElement('bdi');bdi.dir='auto';bdi.textContent=l.date;
    metaRow.appendChild(bdi);main.appendChild(metaRow);
    card.appendChild(main);
    const srow=el('div','lead-status choices');
    STATUS_OPTS.forEach(o=>{
      const b=el('button',st(l.n)===o.value?'sel':'',o.label);
      b.onclick=()=>{statuses[String(l.n)]=o.value;try{localStorage.setItem('leads-status.v2',JSON.stringify(statuses))}catch(e){};render();};
      srow.appendChild(b);
    });
    card.appendChild(srow);
    box.appendChild(card);
  });
  if(!visible.length)box.appendChild(el('p','empty','אין זוגות בסטטוס הזה עדיין.'));
}

Promise.all([fetch('leads.json').then(r=>r.json()),fetch('meta.json').then(r=>r.json()).catch(()=>({updated:''}))])
  .then(([l,m])=>{leads=l;meta=m;render();});
