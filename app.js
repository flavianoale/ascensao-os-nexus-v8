'use strict';
const LS='ascensao_os_v7';
const today=()=>new Date().toISOString().slice(0,10);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const fmt=n=>new Intl.NumberFormat('pt-BR').format(n);
const round=(n,d=1)=>{const p=10**d; return Math.round(n*p)/p;};
const $=s=>document.querySelector(s);
const $$=s=>Array.from(document.querySelectorAll(s));

const FOOD_DB={
  "Arroz cozido": {kcal:130,p:2.7,c:28.2,g:0.3,f:0.4},
  "Feijão cozido": {kcal:76,p:4.8,c:13.6,g:0.5,f:8.5},
  "Frango peito cozido": {kcal:165,p:31.0,c:0.0,g:3.6,f:0.0},
  "Carne moída magra": {kcal:173,p:26.0,c:0.0,g:7.0,f:0.0},
  "Ovo inteiro": {kcal:143,p:13.0,c:1.1,g:9.5,f:0.0},
  "Batata cozida": {kcal:87,p:1.9,c:20.1,g:0.1,f:1.8},
  "Aveia": {kcal:389,p:16.9,c:66.3,g:6.9,f:10.6},
  "Banana": {kcal:89,p:1.1,c:22.8,g:0.3,f:2.6},
  "Maçã": {kcal:52,p:0.3,c:13.8,g:0.2,f:2.4},
  "Leite integral": {kcal:61,p:3.2,c:4.8,g:3.3,f:0.0},
  "Pão francês": {kcal:270,p:9.0,c:56.0,g:2.0,f:2.3},
  "Iogurte natural": {kcal:61,p:3.5,c:4.7,g:3.3,f:0.0},
  "Queijo muçarela": {kcal:280,p:22.0,c:3.0,g:20.0,f:0.0},
  "Azeite": {kcal:884,p:0,c:0,g:100,f:0},
  "Amendoim": {kcal:567,p:25.8,c:16.1,g:49.2,f:8.5},
  "Whey (médio)": {kcal:400,p:80,c:7,g:6,f:0}
};

const RANKS=[{n:"Recruta",xp:0},{n:"Soldado",xp:500},{n:"Elite",xp:1400},{n:"Comandante",xp:3000},{n:"General",xp:5200},{n:"Lenda",xp:8500}];
const PILLARS=[{k:"proto",n:"Protocolo",i:"🧾"},{k:"study",n:"Estudo",i:"📚"},{k:"diet",n:"Dieta",i:"🍽️"},{k:"train",n:"Treino",i:"🏋️"},{k:"bible",n:"Bíblia",i:"✝️"}];

const gid=()=>Math.random().toString(36).slice(2,10);

function defaultState(){
  const d=today();
  return {
    meta:{v:7,start:d,last:d},
    player:{w:86,h:171,bf:25,xp:0,level:1,rank:"Recruta",int:60,streak:0},
    config:{
      crt:true,sfx:true,soundVol:0.55,ambient:true,bootSeen:false,strict:false,
      pillarsMin:4,intBreak:40,
      sleep:{bed:"21:30",minH:7},
      cutting:{strategy:"moderado",adaptive:true,kcal:2000},
      macros:{p:170,f:70,c:170},
      windows:[
        {label:"Manhã",from:"04:40",to:"07:20",tab:"proto"},
        {label:"Faculdade",from:"07:30",to:"12:00",tab:"study"},
        {label:"Operacional",from:"12:00",to:"16:00",tab:"ops"},
        {label:"Treino",from:"16:00",to:"19:00",tab:"train"},
        {label:"Noite",from:"19:00",to:"21:30",tab:"diet"},
        {label:"Dormir",from:"21:30",to:"04:39",tab:"hud"},
      ]
    },
    proto:{done:{}}, // day -> {id:true}
    diet:{log:{}, recipes:seedRecipes()},
    train:{mode:"casa",log:{}}, // day -> entries
    study:{log:{}}, // day -> minutes
    bible:{log:{}}, // day -> bool
    ops:{log:{}}, // day -> minutes
    weights:[] // {d,w}
  };
}

function seedRecipes(){
  const R=(meal,name,ings)=>({id:gid(),meal,name,ings});
  const I=(food,g)=>({id:gid(),food,g});
  return [
    R("cafe","Café 1 (aveia+leite+banana)",[I("Aveia",60),I("Leite integral",250),I("Banana",120)]),
    R("cafe","Café 2 (pão+ovos)",[I("Pão francês",60),I("Ovo inteiro",120)]),
    R("cafe","Café 3 (iogurte+aveia+maçã)",[I("Iogurte natural",200),I("Aveia",40),I("Maçã",150)]),
    R("almoco","Almoço 1 (arroz+feijão+frango)",[I("Arroz cozido",200),I("Feijão cozido",180),I("Frango peito cozido",170),I("Azeite",10)]),
    R("almoco","Almoço 2 (batata+carne)",[I("Batata cozida",300),I("Carne moída magra",180),I("Azeite",10)]),
    R("almoco","Almoço 3 (arroz+frango)",[I("Arroz cozido",250),I("Frango peito cozido",200),I("Azeite",10)]),
    R("lanche","Lanche 1 (whey+banana)",[I("Whey (médio)",35),I("Banana",120)]),
    R("lanche","Lanche 2 (iogurte+amendoim)",[I("Iogurte natural",250),I("Amendoim",25)]),
    R("lanche","Lanche 3 (pão+queijo)",[I("Pão francês",60),I("Queijo muçarela",40)]),
    R("jantar","Jantar 1 (arroz+feijão+carne)",[I("Arroz cozido",180),I("Feijão cozido",160),I("Carne moída magra",180),I("Azeite",10)]),
    R("jantar","Jantar 2 (frango+batata)",[I("Frango peito cozido",220),I("Batata cozida",250),I("Azeite",10)]),
    R("jantar","Jantar 3 (arroz+ovos)",[I("Arroz cozido",220),I("Ovo inteiro",180),I("Azeite",10)]),
  ];
}

let S=load();

function load(){
  try{
    const raw=localStorage.getItem(LS);
    if(!raw) return defaultState();
    const o=JSON.parse(raw);
    if(!o.meta || o.meta.v!==7) return defaultState();
    return o;
  }catch(e){return defaultState();}
}
function save(){ localStorage.setItem(LS,JSON.stringify(S)); }

const TABS=[
  {id:"hud",t:"HUD",i:"🎮"},
  {id:"proto",t:"Proto",i:"🧾"},
  {id:"diet",t:"Dieta",i:"🍽️"},
  {id:"train",t:"Treino",i:"🏋️"},
  {id:"study",t:"Estudo",i:"📚"},
  {id:"bible",t:"Fé",i:"✝️"},
  {id:"ops",t:"Ops",i:"🧰"},
  {id:"reports",t:"Relatório",i:"📄"},
  {id:"config",t:"Config",i:"⚙️"},
];
let active="hud";

function t2m(t){const [h,m]=t.split(":").map(Number); return h*60+m;}
function nowHHMM(){const d=new Date(); return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0");}
function windowNow(){
  const m=t2m(nowHHMM());
  for(const w of S.config.windows){
    const a=t2m(w.from), b=t2m(w.to);
    if(a<=b){ if(m>=a && m<b) return w; }
    else { if(m>=a || m<b) return w; }
  }
  return S.config.windows[0];
}

function recomputeRank(){
  const xp=S.player.xp;
  let r=RANKS[0].n;
  for(const rr of RANKS) if(xp>=rr.xp) r=rr.n;
  S.player.rank=r;
  S.player.level=1+Math.floor(Math.sqrt(xp/50));
}
function addXP(x){
  const mult=clamp(S.player.int/100,0.2,1);
  S.player.xp += Math.round(x*(0.6+0.4*mult));
  recomputeRank();
  audioPing(880,0.06,0.06,"square");
  vibe(10);
}
function punish(intLoss){
  S.player.int=clamp(S.player.int-intLoss,0,100);
  S.player.xp=Math.max(0,S.player.xp-25);
  recomputeRank();
  audioPing(180,0.09,0.07,"sawtooth");
  vibe(22);
}

function ensureRollover(){
  const d=today();
  if(S.meta.last!==d){
    evaluateDay(S.meta.last);
    S.meta.last=d;
    save();
  }
}

function macrosForIng(food,g){
  const f=FOOD_DB[food]; if(!f) return {kcal:0,p:0,c:0,g:0,f:0};
  const k=g/100;
  return {kcal:f.kcal*k,p:f.p*k,c:f.c*k,g:f.g*k,f:(f.f||0)*k};
}
function macrosForRecipe(r, mult=1){
  let t={kcal:0,p:0,c:0,g:0,f:0};
  for(const ing of r.ings){
    const m=macrosForIng(ing.food, ing.g*mult);
    t.kcal+=m.kcal; t.p+=m.p; t.c+=m.c; t.g+=m.g; t.f+=m.f;
  }
  return t;
}
function dayDietTotals(d=today()){
  const log=S.diet.log[d]||{};
  let t={kcal:0,p:0,c:0,g:0,f:0};
  for(const meal of ["cafe","almoco","lanche","jantar"]){
    const e=log[meal];
    if(!e) continue;
    const r=S.diet.recipes.find(x=>x.id===e.rid);
    if(!r) continue;
    const m=macrosForRecipe(r,e.mult||1);
    t.kcal+=m.kcal; t.p+=m.p; t.c+=m.c; t.g+=m.g; t.f+=m.f;
  }
  return t;
}

function totalSets(d=today()){
  const l=S.train.log[d]||[];
  return l.reduce((s,e)=>s+(e.sets||0),0);
}

function computePillars(d=today()){
  const diet=dayDietTotals(d);
  const kcalT=S.config.cutting.kcal;
  const adher=kcalT? (diet.kcal/kcalT)*100:0;
  const pOK = diet.p >= S.config.macros.p*0.95;
  const dietOK = adher>=85 && adher<=110 && pOK;
  const trainOK = totalSets(d)>=3;
  const studyOK = (S.study.log[d]||0)>=25;
  const protoOK = Object.values(S.proto.done[d]||{}).filter(Boolean).length>=3;
  const bibleOK = !!S.bible.log[d];
  const passed=[protoOK,studyOK,dietOK,trainOK,bibleOK].filter(Boolean).length;
  return {protoOK,studyOK,dietOK,trainOK,bibleOK,passed};
}

function evaluateDay(d){
  const p=computePillars(d);
  const broke = p.passed < S.config.pillarsMin || S.player.int < S.config.intBreak;
  if(broke){
    S.player.streak=0;
    S.player.int=clamp(S.player.int-10,0,100);
    S.player.xp=Math.max(0,S.player.xp-120);
  }else{
    S.player.streak+=1;
    S.player.int=clamp(S.player.int+2,0,100);
  }
  recomputeRank();
}

function applyAdaptiveCutting(){
  if(!S.config.cutting.adaptive) return;
  if(S.config.cutting.strategy==="manual") return;
  const logs=[...S.weights].sort((a,b)=>a.d.localeCompare(b.d));
  if(logs.length<6) return;
  const last=logs.slice(-7);
  const prev=logs.slice(-14,-7);
  const avg=a=>a.reduce((s,x)=>s+x.w,0)/a.length;
  const lastAvg=avg(last);
  const prevAvg=prev.length?avg(prev):avg(logs.slice(0,Math.min(7,logs.length)));
  const weeklyLoss = prevAvg-lastAvg;
  const pct = (weeklyLoss/prevAvg)*100;

  // estimate TDEE (male default)
  const w=lastAvg, h=S.player.h, age=23;
  const bmr=10*w+6.25*h-5*age+5;
  const af=1.45;
  const tdee=bmr*af;

  const strat=S.config.cutting.strategy;
  const deficit = strat==="conservador"?0.12: strat==="agressivo"?0.28:0.18;
  let target=Math.round(tdee*(1-deficit));

  // adapt within +-200 around target
  let kcal=S.config.cutting.kcal;
  if(pct<0.3) kcal-=150;
  else if(pct>1.0) kcal+=100;
  kcal=clamp(kcal,target-200,target+200);
  S.config.cutting.kcal=Math.round(clamp(kcal,1400,3200));

  // macros auto
  const lbm = w*(1-S.player.bf/100);
  let p=Math.round(clamp((strat==="agressivo"?2.4:2.2)*lbm,140,220));
  let f=Math.round(clamp(0.8*w,55,90));
  let c=Math.max(0,Math.round((S.config.cutting.kcal - (p*4+f*9))/4));
  S.config.macros={p,f,c};
}

function render(){
  document.body.classList.toggle("crt", !!S.config.crt);
  const w=windowNow();
  $("#subStatus").textContent = `Campanha Dia ${campDay()}/90 • Streak ${S.player.streak} • ${w.label}`;
  $("#hudMini").innerHTML = `
    <div class="pill">Nível ${S.player.level}</div>
    <div class="pill">XP ${fmt(S.player.xp)}</div>
    <div class="pill">Rank ${S.player.rank}</div>
    <div class="pill ${S.player.int<40?'bad':S.player.int<60?'warn':'ok'}">INT ${S.player.int}</div>`;
  renderTabs();
  show(active);
  renderHUD();
  renderProto();
  renderDiet();
  renderTrain();
  renderStudy();
  renderBible();
  renderOps();
  renderReports();
  renderConfig();
}

function campDay(){
  const a=new Date(S.meta.start+"T00:00:00");
  const b=new Date(today()+"T00:00:00");
  return clamp(Math.floor((b-a)/86400000)+1,1,90);
}

function renderTabs(){
  const bar=$("#tabbar");
  if(bar.childElementCount===0){
    bar.innerHTML=TABS.map(t=>`<div class="tab" data-tab="${t.id}"><div class="ico">${t.i}</div><div>${t.t}</div></div>`).join("");
    $$(".tab").forEach(el=>el.onclick=()=>goto(el.dataset.tab,true));
  }
  $$(".tab").forEach(el=>el.classList.toggle("active", el.dataset.tab===active));
}

function show(id){
  $$(".screen").forEach(s=>s.classList.remove("active"));
  const sc=$("#screen-"+id);
  if(sc) sc.classList.add("active");
}

function goto(id,user){
  const w=windowNow();
  if(S.config.strict && user && id!==w.tab && !["config","reports"].includes(id)){
    punish(3);
    id=w.tab;
  }
  active=id;
  render();
  save();
}

function modal(title, body, foot){
  $("#modalTitle").textContent=title;
  $("#modalBody").innerHTML=body;
  $("#modalFoot").innerHTML=foot||`<button class="btn primary" id="mOk">OK</button>`;
  $("#modal").classList.remove("hidden");
  setTimeout(()=>{
    const ok=$("#mOk"); if(ok) ok.onclick=closeModal;
    const c=$("#mClose"); if(c) c.onclick=closeModal;
  },0);
}
function closeModal(){ $("#modal").classList.add("hidden"); }
function wireModal(){
  $("#modalClose").onclick=closeModal;
  $("#modal").addEventListener("click",e=>{if(e.target.id==="modal") closeModal();});
}

function renderHUD(){
  const d=today();
  const p=computePillars(d);
  const diet=dayDietTotals(d);
  const kcalT=S.config.cutting.kcal;
  const adher=Math.round(kcalT?diet.kcal/kcalT*100:0);
  $("#screen-hud").innerHTML=`
    <div class="stack">
      <div class="card">
        <div class="sectionTitle">Missão do Momento</div>
        <div class="row">
          <div class="kpi"><div class="k">Pilares</div><div class="v">${p.passed}/5</div><div class="s">mínimo ${S.config.pillarsMin}/5</div></div>
          <div class="kpi"><div class="k">Dieta</div><div class="v">${fmt(Math.round(diet.kcal))} kcal</div><div class="s">${adher}% da meta</div></div>
        </div>
        <div class="row" style="margin-top:10px">
          <button class="btn primary" id="goNow">EXECUTAR</button>
          <button class="btn" id="boss">BOSS (avaliar)</button>
        </div>
        <div class="muted" style="margin-top:10px">Falhar zera streak e tira XP. Você pediu “brutal”.</div>
      </div>
      <div class="grid2">
        <div class="card">
          <div class="sectionTitle">Peso / Cutting</div>
          <div class="list">
            <div class="item"><div class="left"><div class="name">Peso</div><div class="meta">${lastWeightTxt()}</div></div><button class="btn small primary" id="wBtn">Registrar</button></div>
            <div class="item"><div class="left"><div class="name">Meta kcal</div><div class="meta">${fmt(S.config.cutting.kcal)} • ${S.config.cutting.strategy}</div></div><button class="btn small" id="recalc">Auto</button></div>
          </div>
        </div>
        <div class="card">
          <div class="sectionTitle">Ações rápidas</div>
          <div class="row">
            <button class="btn primary" id="s25">+25 Estudo</button>
            <button class="btn primary" id="t3">+3 Sets</button>
          </div>
          <div class="row" style="margin-top:10px">
            <button class="btn" id="bibleOk">Marcar Bíblia</button>
            <button class="btn danger" id="pun">Punição</button>
          </div>
        </div>
      </div>
    </div>`;
  $("#goNow").onclick=()=>goto(windowNow().tab,true);
  $("#boss").onclick=()=>bossFight();
  $("#wBtn").onclick=()=>weightModal();
  $("#recalc").onclick=()=>{applyAdaptiveCutting(); addXP(3); save(); render();};
  $("#s25").onclick=()=>{S.study.log[d]=(S.study.log[d]||0)+25; addXP(14); save(); render();};
  $("#t3").onclick=()=>{quickSets(3); addXP(12); save(); render();};
  $("#bibleOk").onclick=()=>{S.bible.log[d]=true; addXP(10); save(); render();};
  $("#pun").onclick=()=>{punish(4); save(); render();};
}

function lastWeightTxt(){
  const d=today();
  const x=S.weights.find(v=>v.d===d);
  if(x) return `${fmt(x.w)} kg (hoje)`;
  const last=S.weights[S.weights.length-1];
  return last? `${fmt(last.w)} kg (último ${last.d})` : "sem registro";
}
function weightModal(){
  const d=today();
  const x=S.weights.find(v=>v.d===d);
  modal("Registrar peso",`
    <div class="muted">Registre de manhã. É o dado que manda no cutting adaptativo.</div>
    <label>Peso (kg)</label>
    <input id="w" inputmode="decimal" placeholder="86.0" value="${x?String(x.w):""}">
  `,`<button class="btn" id="mClose">Cancelar</button><button class="btn primary" id="mSave">Salvar</button>`);
  setTimeout(()=>{
    $("#mClose").onclick=closeModal;
    $("#mSave").onclick=()=>{
      const v=parseFloat(String($("#w").value).replace(",","."));
      if(!isFinite(v)||v<30||v>250) return;
      const idx=S.weights.findIndex(z=>z.d===d);
      if(idx>=0) S.weights[idx].w=round(v,1); else S.weights.push({d,w:round(v,1)});
      applyAdaptiveCutting();
      addXP(10);
      closeModal(); save(); render();
    };
  },0);
}

function bossFight(){
  const d=today();
  const p=computePillars(d);
  const lines=[
    pillLine("Protocolo",p.protoOK),
    pillLine("Estudo",p.studyOK),
    pillLine("Dieta",p.dietOK),
    pillLine("Treino",p.trainOK),
    pillLine("Bíblia",p.bibleOK),
  ].join("");
  modal("BOSS FIGHT – Auditoria",`
    <div class="muted">Encerrar o dia agora força avaliação. Se falhar, streak zera.</div>
    <hr/>
    <div class="list">${lines}</div>
    <hr/>
    <div class="kpi"><div class="k">Resultado atual</div><div class="v">${p.passed}/5</div><div class="s">mínimo ${S.config.pillarsMin}/5 • INT quebra < ${S.config.intBreak}</div></div>
  `,`<button class="btn" id="mClose">Fechar</button><button class="btn danger" id="end">Encerrar dia</button>`);
  setTimeout(()=>{
    $("#mClose").onclick=closeModal;
    $("#end").onclick=()=>{
      evaluateDay(d);
      closeModal(); save(); render();
    };
  },0);
}
function pillLine(name,ok){
  return `<div class="item"><div class="left"><div class="name">${name}</div><div class="meta">${ok?"OK":"PENDENTE"}</div></div><span class="tag ${ok?"ok":"bad"}">${ok?"OK":"FALHA"}</span></div>`;
}

function renderProto(){
  const d=today();
  const done=S.proto.done[d]||{};
  const items=[
    {id:"bed",n:"Arrumar cama",xp:10,pen:2},
    {id:"skinAM",n:"Skincare (manhã)",xp:10,pen:2},
    {id:"pray",n:"Oração (3 min)",xp:14,pen:3},
    {id:"stretch",n:"Alongamento (5 min)",xp:10,pen:2},
  ];
  const rows=items.map(it=>`
    <div class="item">
      <div class="left"><div class="name">${it.n}</div><div class="meta">XP ${it.xp} • INT -${it.pen}</div></div>
      <button class="btn small primary" data-p="${it.id}">${done[it.id]?"DESMARCAR":"MARCAR"}</button>
    </div>`).join("");
  $("#screen-proto").innerHTML=`
    <div class="stack">
      <div class="card">
        <div class="sectionTitle">Protocolo</div>
        <div class="muted">Sem protocolo, você volta a ser refém do dia.</div>
      </div>
      <div class="card"><div class="sectionTitle">Checklist</div><div class="list">${rows}</div></div>
    </div>`;
  $$("[data-p]").forEach(b=>b.onclick=()=>{
    const id=b.dataset.p;
    S.proto.done[d]=S.proto.done[d]||{};
    const cur=!!S.proto.done[d][id];
    S.proto.done[d][id]=!cur;
    if(!cur) addXP(items.find(x=>x.id===id).xp); else punish(1);
    save(); render();
  });
}

function renderDiet(){
  const d=today();
  const totals=dayDietTotals(d);
  const kcalT=S.config.cutting.kcal;
  const adher=Math.round(kcalT?totals.kcal/kcalT*100:0);
  const mealCard=(meal,label)=> {
    const entry=(S.diet.log[d]||{})[meal];
    const r=entry? S.diet.recipes.find(x=>x.id===entry.rid):null;
    const mult=entry?.mult||1;
    const m=r?macrosForRecipe(r,mult):{kcal:0,p:0,c:0,g:0,f:0};
    return `<div class="card">
      <div class="sectionTitle">${label}</div>
      <div class="muted">${r?r.name:"Nenhuma opção selecionada"}</div>
      <div class="row" style="margin-top:8px">
        <div class="pill">kcal ${fmt(Math.round(m.kcal))}</div>
        <div class="pill">P ${fmt(Math.round(m.p))}</div>
        <div class="pill">C ${fmt(Math.round(m.c))}</div>
        <div class="pill">G ${fmt(Math.round(m.g))}</div>
      </div>
      <div class="row" style="margin-top:10px">
        <button class="btn primary" data-pick="${meal}">Escolher</button>
        <button class="btn" data-edit="${meal}">Ajustar gramas</button>
      </div>
    </div>`;
  };
  $("#screen-diet").innerHTML=`
    <div class="stack">
      <div class="card">
        <div class="sectionTitle">Metas do cutting</div>
        <div class="row">
          <div class="kpi"><div class="k">Calorias</div><div class="v">${fmt(kcalT)}</div><div class="s">Aderência ${adher}%</div></div>
          <div class="kpi"><div class="k">Macros</div><div class="v">P ${S.config.macros.p} • G ${S.config.macros.f} • C ${S.config.macros.c}</div><div class="s">adaptativo: ${S.config.cutting.adaptive?"ON":"OFF"}</div></div>
        </div>
      </div>
      ${mealCard("cafe","Café")}
      ${mealCard("almoco","Almoço")}
      ${mealCard("lanche","Lanche")}
      ${mealCard("jantar","Jantar")}
      <div class="card">
        <div class="sectionTitle">Totais do dia</div>
        <div class="row">
          <div class="kpi"><div class="k">kcal</div><div class="v">${fmt(Math.round(totals.kcal))}</div><div class="s">meta ${fmt(kcalT)}</div></div>
          <div class="kpi"><div class="k">Proteína</div><div class="v">${fmt(Math.round(totals.p))}g</div><div class="s">meta ${S.config.macros.p}g</div></div>
        </div>
      </div>
    </div>`;
  $$("[data-pick]").forEach(b=>b.onclick=()=>pickMeal(b.dataset.pick));
  $$("[data-edit]").forEach(b=>b.onclick=()=>editMeal(b.dataset.edit));
}

function pickMeal(meal){
  const d=today();
  const opts=S.diet.recipes.filter(r=>r.meal===meal);
  const cur=(S.diet.log[d]||{})[meal]?.rid;
  const rows=opts.map(r=>{
    const m=macrosForRecipe(r,1);
    return `<div class="item">
      <div class="left"><div class="name">${r.name}</div><div class="meta">${Math.round(m.kcal)} kcal • P ${Math.round(m.p)} • C ${Math.round(m.c)} • G ${Math.round(m.g)}</div></div>
      <button class="btn small ${r.id===cur?"":"primary"}" data-sel="${r.id}">${r.id===cur?"ATUAL":"ESCOLHER"}</button>
    </div>`;
  }).join("");
  modal("Escolher refeição",`<div class="list">${rows}</div>`,`<button class="btn" id="mClose">Fechar</button>`);
  setTimeout(()=>{
    $("#mClose").onclick=closeModal;
    $$("[data-sel]").forEach(b=>b.onclick=()=>{
      const rid=b.dataset.sel;
      S.diet.log[d]=S.diet.log[d]||{};
      S.diet.log[d][meal]={rid,mult:1};
      addXP(6);
      closeModal(); save(); render();
    });
  },0);
}

function editMeal(meal){
  const d=today();
  const entry=(S.diet.log[d]||{})[meal];
  if(!entry) return;
  const r=S.diet.recipes.find(x=>x.id===entry.rid);
  if(!r) return;
  const mult=entry.mult||1;
  const m=macrosForRecipe(r,mult);
  const rows=r.ings.map(i=>`<div class="item">
    <div class="left"><div class="name">${i.food}</div><div class="meta">${Math.round(i.g*mult)} g (base ${i.g}g)</div></div>
    <div class="row" style="flex:0;gap:6px">
      <button class="btn small" data-dec="${i.id}">-25</button>
      <button class="btn small primary" data-inc="${i.id}">+25</button>
    </div>
  </div>`).join("");
  modal("Ajustar gramas",`
    <div class="kpi"><div class="k">Refeição</div><div class="v">${r.name}</div><div class="s">${Math.round(m.kcal)} kcal • P ${Math.round(m.p)} • C ${Math.round(m.c)} • G ${Math.round(m.g)}</div></div>
    <label>Multiplicador</label>
    <input id="mult" type="range" min="0.5" max="2.0" step="0.1" value="${mult}">
    <div class="muted" id="mtxt">${mult.toFixed(1)}x</div>
    <hr/>
    <div class="list">${rows}</div>
  `,`<button class="btn" id="mClose">Fechar</button><button class="btn primary" id="mSave">Salvar</button>`);
  setTimeout(()=>{
    $("#mult").oninput=()=>$("#mtxt").textContent=parseFloat($("#mult").value).toFixed(1)+"x";
    $$("[data-inc]").forEach(b=>b.onclick=()=>{
      const id=b.dataset.inc;
      const ing=r.ings.find(x=>x.id===id);
      ing.g+=25;
      addXP(2);
      closeModal(); save(); render(); editMeal(meal);
    });
    $$("[data-dec]").forEach(b=>b.onclick=()=>{
      const id=b.dataset.dec;
      const ing=r.ings.find(x=>x.id===id);
      ing.g=Math.max(0,ing.g-25);
      punish(1);
      closeModal(); save(); render(); editMeal(meal);
    });
    $("#mClose").onclick=closeModal;
    $("#mSave").onclick=()=>{
      entry.mult=parseFloat($("#mult").value);
      addXP(4);
      closeModal(); save(); render();
    };
  },0);
}

function quickSets(n){
  const d=today();
  S.train.log[d]=S.train.log[d]||[];
  S.train.log[d].push({name:"Quick sets",sets:n,reps:10,load:0});
}

function renderTrain(){
  const d=today();
  const sets=totalSets(d);
  const log=S.train.log[d]||[];
  const rows=log.map((e,i)=>`<div class="item"><div class="left"><div class="name">${e.name}</div><div class="meta">${e.sets} sets • ${e.reps} reps • ${e.load} kg</div></div><button class="btn small" data-del="${i}">X</button></div>`).join("");
  $("#screen-train").innerHTML=`
    <div class="stack">
      <div class="card">
        <div class="sectionTitle">Treino</div>
        <div class="row">
          <div class="kpi"><div class="k">Sets hoje</div><div class="v">${fmt(sets)}</div><div class="s">mínimo 3</div></div>
          <div class="kpi"><div class="k">Modo</div><div class="v">${S.train.mode.toUpperCase()}</div><div class="s">sem limite de carga</div></div>
        </div>
        <div class="row" style="margin-top:10px">
          <button class="btn primary" id="addEx">Registrar exercício</button>
          <button class="btn" id="modeBtn">Mudar modo</button>
        </div>
      </div>
      <div class="card"><div class="sectionTitle">Log</div><div class="list">${rows||'<div class="muted">Sem registros.</div>'}</div></div>
    </div>`;
  $("#modeBtn").onclick=()=>{S.train.mode=(S.train.mode==="casa"?"academia":"casa"); addXP(4); save(); render();};
  $("#addEx").onclick=()=>exerciseModal();
  $$("[data-del]").forEach(b=>b.onclick=()=>{
    log.splice(parseInt(b.dataset.del,10),1);
    punish(1);
    save(); render();
  });
}

function exerciseModal(){
  modal("Registrar exercício",`
    <label>Exercício</label><input id="ex" placeholder="Ex: Supino reto">
    <div class="grid3" style="margin-top:10px">
      <div><label>Sets</label><input id="sets" type="number" value="3" min="1" max="20"></div>
      <div><label>Reps</label><input id="reps" type="number" value="8" min="1" max="50"></div>
      <div><label>Carga (kg)</label><input id="load" type="number" value="20" step="0.5" min="0"></div>
    </div>
    <div class="row" style="margin-top:10px">
      ${[1,2.5,5,10,20,50].map(v=>`<button class="btn small" data-add="${v}">+${v}</button>`).join("")}
    </div>
  `,`<button class="btn" id="mClose">Cancelar</button><button class="btn primary" id="mSave">Salvar</button>`);
  setTimeout(()=>{
    $$("[data-add]").forEach(b=>b.onclick=()=>{$("#load").value=round((parseFloat($("#load").value)||0)+parseFloat(b.dataset.add),1);});
    $("#mClose").onclick=closeModal;
    $("#mSave").onclick=()=>{
      const name=$("#ex").value.trim()||"Exercício";
      const sets=parseInt($("#sets").value,10);
      const reps=parseInt($("#reps").value,10);
      const load=parseFloat($("#load").value);
      if(!isFinite(sets)||!isFinite(reps)||!isFinite(load)) return;
      const d=today();
      S.train.log[d]=S.train.log[d]||[];
      S.train.log[d].push({name,sets,reps,load});
      addXP(sets>=3?18:12);
      closeModal(); save(); render();
    };
  },0);
}

function renderStudy(){
  const d=today();
  const m=S.study.log[d]||0;
  $("#screen-study").innerHTML=`
    <div class="stack">
      <div class="card">
        <div class="sectionTitle">Estudo (fora da aula)</div>
        <div class="row">
          <div class="kpi"><div class="k">Hoje</div><div class="v">${fmt(m)} min</div><div class="s">mínimo 25 min</div></div>
          <div class="kpi"><div class="k">Status</div><div class="v">${m>=25?'<span class="ok">OK</span>':'<span class="bad">PEND</span>'}</div><div class="s">sem heroísmo</div></div>
        </div>
        <div class="row" style="margin-top:10px">
          <button class="btn primary" id="s25">+25</button>
          <button class="btn" id="s50">+50</button>
          <button class="btn danger" id="sf">Falhei</button>
        </div>
      </div>
    </div>`;
  $("#s25").onclick=()=>{S.study.log[d]=(S.study.log[d]||0)+25; addXP(14); save(); render();};
  $("#s50").onclick=()=>{S.study.log[d]=(S.study.log[d]||0)+50; addXP(22); save(); render();};
  $("#sf").onclick=()=>{punish(5); save(); render();};
}

function renderBible(){
  const d=today();
  const ok=!!S.bible.log[d];
  $("#screen-bible").innerHTML=`
    <div class="stack">
      <div class="card">
        <div class="sectionTitle">Fé</div>
        <div class="row">
          <div class="kpi"><div class="k">Bíblia hoje</div><div class="v">${ok?'<span class="ok">OK</span>':'<span class="bad">PEND</span>'}</div><div class="s">1 marca/dia</div></div>
          <div class="kpi"><div class="k">Regra</div><div class="v">Sem fé = INT cai</div><div class="s">você pediu</div></div>
        </div>
        <div class="row" style="margin-top:10px">
          <button class="btn primary" id="bOk">Marcar</button>
          <button class="btn danger" id="bFail">Falha</button>
        </div>
      </div>
    </div>`;
  $("#bOk").onclick=()=>{S.bible.log[d]=true; addXP(10); save(); render();};
  $("#bFail").onclick=()=>{punish(4); save(); render();};
}

function renderOps(){
  const d=today();
  const m=S.ops.log[d]||0;
  $("#screen-ops").innerHTML=`
    <div class="stack">
      <div class="card">
        <div class="sectionTitle">Operacional</div>
        <div class="row">
          <div class="kpi"><div class="k">Minutos</div><div class="v">${fmt(m)}</div><div class="s">controle simples</div></div>
          <div class="kpi"><div class="k">Status</div><div class="v">${m>=30?'<span class="ok">OK</span>':'<span class="warn">BAIXO</span>'}</div><div class="s">meta mínima 30</div></div>
        </div>
        <div class="row" style="margin-top:10px">
          <button class="btn primary" id="o30">+30</button>
          <button class="btn" id="o60">+60</button>
          <button class="btn danger" id="of">Procrastinei</button>
        </div>
      </div>
    </div>`;
  $("#o30").onclick=()=>{S.ops.log[d]=(S.ops.log[d]||0)+30; addXP(8); save(); render();};
  $("#o60").onclick=()=>{S.ops.log[d]=(S.ops.log[d]||0)+60; addXP(12); save(); render();};
  $("#of").onclick=()=>{punish(2); save(); render();};
}

function renderReports(){
  const d=today();
  const p=computePillars(d);
  const diet=dayDietTotals(d);
  const kcalT=S.config.cutting.kcal;
  const adher=Math.round(kcalT?diet.kcal/kcalT*100:0);
  const rep=[
    `ASCENSÃO OS – Relatório ${d}`,
    `Campanha: Dia ${campDay()}/90`,
    `Estado: Nível ${S.player.level} • XP ${S.player.xp} • Rank ${S.player.rank} • Integridade ${S.player.int} • Streak ${S.player.streak}`,
    ``,
    `Pilares: ${p.passed}/5 (${Math.round(p.passed/5*100)}%)`,
    `- Protocolo: ${p.protoOK?'OK':'PENDENTE'}`,
    `- Estudo: ${S.study.log[d]||0} min`,
    `- Dieta: ${Math.round(diet.kcal)} kcal (Aderência ${adher}%) • P ${Math.round(diet.p)}g`,
    `- Treino: ${totalSets(d)} sets`,
    `- Bíblia: ${S.bible.log[d]?'OK':'PENDENTE'}`,
    ``,
    `Operacional: ${S.ops.log[d]||0} min`,
    ``,
    `Recomendações (sem drama):`,
    ...recs(d,p,diet,adher)
  ].join("\n");
  $("#screen-reports").innerHTML=`
    <div class="stack">
      <div class="card">
        <div class="sectionTitle">Relatório</div>
        <pre style="white-space:pre-wrap; font-family:var(--mono); font-size:12px; line-height:1.35; margin:0">${escape(rep)}</pre>
        <div class="row" style="margin-top:10px">
          <button class="btn primary" id="copy">Copiar</button>
          <button class="btn" id="dl">Baixar TXT</button>
        </div>
      </div>
    </div>`;
  $("#copy").onclick=async()=>{try{await navigator.clipboard.writeText(rep);}catch(e){}};
  $("#dl").onclick=()=>download(`ascensao-${d}.txt`,rep);
}
function recs(d,p,diet,adher){
  const out=[];
  if(!p.studyOK) out.push("- Estudo abaixo do mínimo: faz 25 min agora.");
  if(!p.trainOK) out.push("- Treino abaixo do mínimo: registra 3 sets (qualquer exercício).");
  if(adher>110) out.push("- Dieta alta: corta o próximo lanche e prioriza proteína.");
  if(diet.p < S.config.macros.p*0.9) out.push("- Proteína baixa: frango/ovos/whey.");
  if(!p.protoOK) out.push("- Protocolo falhou: amanhã começa arrumando o básico.");
  if(!p.bibleOK) out.push("- Bíblia pendente: 5 min agora e marca.");
  if(S.player.int<40) out.push("- Integridade baixa: corta distração, faz o mínimo viável.");
  if(!out.length) out.push("- Dentro. Não inventa moda.");
  return out;
}
function download(name,text){
  const blob=new Blob([text],{type:"text/plain;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url; a.download=name; document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
function escape(s){return (s||"").replace(/[&<>"']/g,c=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));}

function renderConfig(){
  $("#screen-config").innerHTML=`
    <div class="stack">
      <div class="card">
        <div class="sectionTitle">Config</div>
        <div class="grid2">
          <div><label>Modo estrito</label><select id="strict"><option value="0">OFF</option><option value="1">ON</option></select></div>
          <div><label>CRT</label><select id="crt"><option value="1">ON</option><option value="0">OFF</option></select></div>
        </div>
        <div class="grid2">
          <div><label>Mínimo de pilares</label><select id="minP">${[3,4,5].map(n=>`<option>${n}</option>`).join("")}</select></div>
          <div><label>Quebra streak se INT &lt;</label><select id="intB">${[20,30,40,50].map(n=>`<option>${n}</option>`).join("")}</select></div>
        </div>

        <h3>Audio</h3>
        <div class="grid2">
          <div><label>Som (SFX)</label><select id="sfx"><option value="1">On</option><option value="0">Off</option></select></div>
          <div><label>Ambiente</label><select id="ambient"><option value="1">On</option><option value="0">Off</option></select></div>
        </div>
        <div class="row">
          <div style="flex:1">
            <label>Volume</label>
            <input id="soundVol" type="range" min="0.05" max="1" step="0.05" value="0.55"/>
          </div>
        </div>
        <div class="row" style="margin-top:8px">
          <button class="btn" id="testSound">Testar som</button>
          <button class="btn" id="replayBoot">Replay boot</button>
        </div>

        <div class="sectionTitle">Cutting</div>
        <div class="grid2">
          <div><label>Estratégia</label><select id="cut"><option value="conservador">Conservador</option><option value="moderado">Moderado</option><option value="agressivo">Agressivo</option><option value="manual">Manual</option></select></div>
          <div><label>Meta kcal</label><input id="kcal" type="number" value="${S.config.cutting.kcal}"></div>
        </div>
        <div class="grid3">
          <div><label>Proteína</label><input id="p" type="number" value="${S.config.macros.p}"></div>
          <div><label>Gordura</label><input id="f" type="number" value="${S.config.macros.f}"></div>
          <div><label>Carbo</label><input id="c" type="number" value="${S.config.macros.c}"></div>
        </div>
        <div class="row" style="margin-top:10px">
          <button class="btn primary" id="save">Salvar</button>
          <button class="btn" id="auto">Auto recalcular</button>
          <button class="btn danger" id="reset">Reset total</button>
        </div>
      </div>
    </div>`;
  $("#strict").value=S.config.strict?"1":"0";
  $("#crt").value=S.config.crt?"1":"0";
  $("#sfx").value=S.config.sfx?"1":"0";
  $("#ambient").value=S.config.ambient?"1":"0";
  $("#soundVol").value=String(S.config.soundVol ?? 0.55);
  $("#minP").value=String(S.config.pillarsMin);
  $("#intB").value=String(S.config.intBreak);
  $("#cut").value=S.config.cutting.strategy;

  $("#testSound").onclick=()=>{audioPing(880,0.08,0.08,"square"); setTimeout(()=>audioPing(660,0.06,0.06,"triangle"),70);};
  $("#replayBoot").onclick=()=>{S.config.bootSeen=false; save(); closeModal(); setTimeout(()=>setupBoot(),60);};

  $("#save").onclick=()=>{
    S.config.strict=$("#strict").value==="1";
    S.config.crt=$("#crt").value==="1";
    S.config.sfx=$("#sfx").value==="1";
    S.config.ambient=$("#ambient").value==="1";
    S.config.soundVol=parseFloat($("#soundVol").value)||0.55;
    if(S.config.ambient){ ambientStart(); } else { ambientStop(); }
    S.config.pillarsMin=parseInt($("#minP").value,10);
    S.config.intBreak=parseInt($("#intB").value,10);
    S.config.cutting.strategy=$("#cut").value;
    S.config.cutting.kcal=parseInt($("#kcal").value,10);
    S.config.macros={p:parseInt($("#p").value,10),f:parseInt($("#f").value,10),c:parseInt($("#c").value,10)};
    addXP(4);
    save(); render();
  };
  $("#auto").onclick=()=>{applyAdaptiveCutting(); addXP(3); save(); render();};
  $("#reset").onclick=()=>{
    modal("Reset total",`<div class="bad">Apaga tudo.</div><div class="muted">Se você usa reset pra fugir, já perdeu.</div>`,
    `<button class="btn" id="mClose">Cancelar</button><button class="btn danger" id="mZap">Apagar</button>`);
    setTimeout(()=>{
      $("#mClose").onclick=closeModal;
      $("#mZap").onclick=()=>{localStorage.removeItem(LS); S=defaultState(); save(); closeModal(); render();};
    },0);
  };
}

function setupBoot(){
  const boot=document.getElementById("boot");
  const btn=document.getElementById("bootStart");
  const log=document.getElementById("bootLog");
  const bar=document.getElementById("bootBar");
  const fill=document.getElementById("bootBarFill");
  const pct=document.getElementById("bootPct");
  if(!boot||!btn) return;

  const hide=()=>boot.classList.add("hidden");
  const show=()=>boot.classList.remove("hidden");

  // If user already saw boot, do not block
  if(S && S.config && S.config.bootSeen){ hide(); return; }

  show();
  btn.onclick=async ()=>{
    const ac=audioEnsure();
    try{ if(ac && ac.state==="suspended") await ac.resume(); }catch(e){}
    vibe(12);
    audioPing(740,0.06,0.06,"square");

    btn.disabled=true;
    if(log) log.classList.remove("hidden");
    if(bar) bar.classList.remove("hidden");

    const lines=[
      "CHECKING_BIOMETRICS...",
      "SYNCING_WITH_DATABASE...",
      "ESTABLISHING_SECURE_CONNECTION...",
      "LOADING_PROTOCOLS...",
      "BINDING_MISSIONS_ENGINE...",
      "CALIBRATING_DISCIPLINE_SYSTEM...",
      "PLAYER_FOUND."
    ];
    const push=(t)=>{
      if(!log) return;
      const d=document.createElement("div");
      d.className="line";
      d.textContent="> "+t;
      log.appendChild(d);
      log.scrollTop=log.scrollHeight;
    };

    for(let i=0;i<lines.length;i++){
      push(lines[i]);
      audioPing(520+i*40,0.05,0.04,"square");
      const p=Math.min(100, Math.round(((i+1)/lines.length)*100));
      if(fill) fill.style.width=p+"%";
      if(pct) pct.textContent=p+"%";
      await new Promise(r=>setTimeout(r, 220+i*60));
    }

    ambientStart();
    if(S && S.config){ S.config.bootSeen=true; save(); }
    audioPing(940,0.09,0.05,"triangle");
    setTimeout(()=>hide(), 240);
  };
}

function autoRoute(){
  const w=windowNow();
  if(!["config","reports"].includes(active)) active=w.tab;
}

window.addEventListener("load",()=>{
  setupBoot();
  if(S && S.config && S.config.bootSeen){ ambientStart(); }

  if("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js");
  wireModal();
  ensureRollover();
  autoRoute();
  render();
});
document.addEventListener("visibilitychange",()=>{
  if(!document.hidden){ensureRollover(); autoRoute(); render();}
});
