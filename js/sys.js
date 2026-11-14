/* IBONARIUM KYIV — sys.js: виживання, місії, радіо, схованки, крафт, збереження */
IB.DAY_LEN=360;           /* сек на добу */
IB.G={mode:'boot',t:8,day:1,mi:0,mdone:[],flags:{},stash:{},visited:{},deaths:0,evT:90,
      spawn:{x:31.5,y:31.5},search:null,slot:0,ending:false};

IB.nightFactor=function(){
  const h=IB.G.t%24;
  if(h<5)return 1;
  if(h<8)return 1-(h-5)/3;
  if(h<18)return 0;
  if(h<21)return (h-18)/3;
  return 1;
};
IB.clockStr=function(){
  const h=IB.G.t%24;
  const hh=IB.M.floor(h),mm=IB.M.floor((h-hh)*60);
  return (hh<10?'0':'')+hh+':'+(mm<10?'0':'')+mm;
};

/* ---------- 13 СЮЖЕТНИХ МІСІЙ (інтегровані у відкритий світ) ---------- */
IB.MISSIONS=[
 {t:'ОСТАННІЙ ВИХІД',x:31,y:29,r:1.6,zone:'ОБОЛОНЬ',
  d:'Марко Коваленко. 12 днів тому Київ замовк. У квартирі ще тикає годинник, а рація ловить останній сигнал: «Кто-нибудь… ответьте…»',
  lore:'РАЦІЯ: «…тут Батьківщина-Мати, музей-заповідник, працює останній передавач. Хто почує — ідіть на південні пагорби. Виживання — це сигнал.»',
  reward:{}},
 {t:'АПТЕКА НА ОБЕЛОНІ',x:48,y:45,r:1.8,zone:'ОБОЛОНЬ',
  d:'Аптечка на Минській розграбована наполовину. Заражені чергують біля вітрин, але в задніх ящиках ще є знеболювальне.',
  lore:'Ти зібрав медикаменти. Руки тремтять, але рація шепоче дякуючу тишу.',
  reward:{medkit:2,bandage:2}},
 {t:'ПАЛЬНЕ ДЛЯ ВИЖИВАННЯ',x:66,y:52,r:2.0,zone:'ОБОЛОНЬ',
  d:'Річковий порт Оболоні. У старих бочках і каністрах — пальне. Без нього не буде ні генератора, ні втечі.',
  lore:'Каністри повні. Генератор у схованці тепер живий.',
  reward:{fuel:2,parts:1}},
 {t:'МІСТ ЧЕРЕЗ ДНІПРО',x:180,y:104,r:2.2,zone:'ЛІВИЙ БЕРЕГ',
  d:'Метроміст — єдиний шлях на лівий берег. Внизу Дніпро, на полотні — покинуті машини і щось, що сичить у темряві.',
  lore:'Ти перетнув Дніпро. Лівий берег тихий, але тиша тут — неправильна.',
  reward:{ammo:12}},
 {t:'ТАБІР НА ГІДРОПАРКУ',x:158,y:133,r:2.0,zone:'ГІДРОПАРК',
  d:'Серед акацій острова — вогнище вцілілих. Вони діляться водою і новинами: велика орда збиралася на Майдані.',
  lore:'Сергій: «Тримайся острова вночі. Місто — не твій друг.»',
  reward:{water:2,food:2}},
 {t:'ВОДА ДЛЯ ТАБОРУ',x:116,y:84,r:2.0,x2:158,y2:133,zone:'ПОДІЛ',
  d:'Насос Річкового вокзалу зламаний. Частину насоса обіцяли за лишити собі бракувальники з підвалу… Знайди частину і віднеси до табору на Гідропарку.',
  lore:'Оля з табору дивиться на частину насоса: «Тепер вода буде. Ти — не байдужий. Це рідкість.»',
  reward:{pills:1,ammo:8},
  two:true},
 {t:'ВРЯТУВАТИ РАДІСТА',x:204,y:84,r:2.0,zone:'ЛІВИЙ БЕРЕГ',
  d:'Русанівка. У панельній дев’ятиповерсі застряг радіст із передавача. Ключ-картка вхідних дверей — у сусідів. GUARDIAN не дає проходу.',
  lore:'Радіст передав тобі підсилювач сигналу. Тепер вежі чують краще.',
  reward:{radio_p:1,ammo:15}},
 {t:'СИГНАЛ З МАЙДАНУ',x:141,y:150,r:1.6,zone:'МАЙДАН НЕЗАЛЕЖНОСТІ',
  d:'Колона Незалежності. Під нею — барикади, під переходами — документи штабу цивільного захисту.',
  lore:'Документи: «Сектор Майдан — 0 живих. Сектор Лавра — ІНШІ. Ідіть до печер.»',
  reward:{docs:1,ammo:10}},
 {t:'ХРЕЩАТИК: ЗАКЛАД',x:120,y:152,r:1.8,zone:'ХРЕЩАТИК',
  d:'Супермаркет на Хрещатику. Полиці вигнуті від часу, але консерви ще стоять рядами — як солдати.',
  lore:'Рюкзак вага на 3 кілограми важчий. Це — життя на тиждень.',
  reward:{food:3,water:2}},
 {t:'ЗОЛОТІ ВОРОТА: ПІДМУРКИ',x:64,y:141,r:1.5,zone:'СТАРЕ МІСТО',
  d:'Під Золотими Воротами — княжі підмурки. Хтось із вчених сховав там дослідницький схов і ключ-картку.',
  lore:'У підмурках — пахне землею і воском. Ключ-картка твоя.',
  reward:{keycard:1,ammo:10}},
 {t:'СОФІЯ: ДЗВІНИЦЯ',x:90,y:131,r:1.6,zone:'СТАРЕ МІСТО',
  d:'Дзвіниця Софійського собору. З верхнього ярусу видно весь Київ: Дніпро, Лавру, Монумент. Звідси місто — мапа.',
  lore:'З дзвіниці ти бачиш, як орда повільно стікає до промзони. Мапа в голові — точніша за будь-які документи.',
  reward:{bandage:2,pills:1}},
 {t:'ЛАВРА: ПЕЧЕРИ',x:151,y:186,r:1.5,zone:'КИЄВО-ПЕЧЕРСЬКА ЛАВРА',
  d:'Дальні печери Лаври. За замкненими ґратами — дослідницька зона: столи, пробірки, прилади. І GUARDIAN у рясі.',
  lore:'Журнал дослідника: «Зразок 7 активований. ГЕТЬ ЗВІДТИ.» Ключ від музею Монумента — в ящику.',
  reward:{ammo:15,medkit:1}},
 {t:'БАТЬКІВЩИНА-МАТИ: ПЕРЕДАЧА',x:152,y:199,r:2.0,zone:'БАТЬКІВЩИНА-МАТИ',
  d:'Музей під Монументом. Останній передавач Києва. Щит і меч над містом. Піднімись — і подай сигнал.',
  lore:'Ти натискаєш ключ. Антени Монумента сяють. «Тут Київ. Ми ще тут. Хто почує — живий. Ідіть до нас.» Останній сигнал передано.',
  reward:{},
  final:true},
];

/* ---------- ЛУТ ---------- */
IB.LOOT={
 pharmacy:['medkit','bandage','pills','alcohol'],
 market:['food','food','stew','water','water','bandage','energy'],
 dumpster:['cloth','bottle','alcohol','cloth','energy'],
 crate:['ammo','parts','cloth','grenade','energy','stew'],
 barrels:['fuel','fuel','parts'],
 cache:['grenade','ammo','pills','parts','mask'],
 flat:['food','water','stew','bandage','energy'],
 gate:['ammo','parts','docs','keycard'],
 caves:['docs','ammo','medkit','keycard','mask'],
 museum:['docs','ammo','fuel','mask'],
 podil:['cloth','bottle','parts'],
 andrew:['bandage','alcohol','docs'],
 trunk:['parts','cloth','ammo','fuel'],
};
IB.RECIPES=[
 {id:'bandage',n:'БИНТ',req:{cloth:1,alcohol:1}},
 {id:'molotov',n:'КОКТЕЛЬ МОЛОТОВА',req:{bottle:1,fuel:1,cloth:1}},
 {id:'medkit',n:'АПТЕЧКА',req:{bandage:2,alcohol:1}},
];

IB.SYS={
  /* ---------- ініт нової гри ---------- */
  newGame(){
    IB.initEnts();
    const G=IB.G;
    G.t=8;G.day=1;G.mi=0;G.mdone=[];G.flags={};G.stash={};G.visited={};G.deaths=0;G.evT=100;G.ending=false;
    G.spawn={x:31.5,y:31.5};
    G.visited[0]=true;
    IB.toast('КВАРТИРА МАРКА — ОБОЛОНЬ');
    IB.banner('ОБОЛОНЬ • ДЕНЬ 1');
    IB.SYS.spawnStartProps();
  },
  spawnStartProps(){ /* перші заражені довкола, не перед носом */
    for(let i=0;i<4;i++)IB.SYS.trySpawn(13,19);
  },
  /* ---------- пошук взаємодій ---------- */
  interactables(){
    const p=IB.PL,W=IB.WORLD,G=IB.G,out=[];
    if(!p)return out;
    /* сюжетна точка */
    const m=IB.MISSIONS[G.mi];
    if(m&&!G.ending){
      const tx=(m.two&&G.flags['m6a']&&m.x2!==undefined)?m.x2:m.x, ty=(m.two&&G.flags['m6a']&&m.y2!==undefined)?m.y2:m.y;
      const d=IB.dist(p.x,p.y,tx+0.5,ty+0.5);
      const lbl=(m.two&&G.flags['m6a'])?'ВІДДАТИ НАСОС У ТАБІР':m.t;
      if(d<m.r+0.6)out.push({d,label:'E — '+lbl,act:()=>IB.SYS.missionPoint(),kind:'mission'});
    }
    for(const s of W.safes){const d=IB.dist(p.x,p.y,s.x+0.5,s.y+0.5);if(d<1.4)out.push({d,label:'E — СХОВАНКА: '+s.n,act:()=>IB.SYS.safehouse(s),kind:'safe'});}
    for(const st of W.stations){const d=IB.dist(p.x,p.y,st.x+0.5,st.y+0.5);if(d<1.5)out.push({d,label:'E — МЕТРО «'+st.n+'»',act:()=>IB.SYS.metro(st),kind:'metro'});}
    for(const pr of W.props){
      const d=IB.dist(p.x,p.y,pr.x,pr.y);
      if(pr.meta==='pass'&&d<1.25)out.push({d,label:'E — СПУСТИТИСЯ У ПІДЗЕМНИЙ ПЕРЕХІД',act:()=>IB.SYS.passage(pr),kind:'pass'});
      else if(pr.loot==='gate'&&d<1.3)out.push({d,label:'E — СПУСТИТИСЯ ДО ПІДМУРКІВ',act:()=>IB.SYS.deep(pr,'ПІДМУРКИ ЗОЛОТИХ ВОРІТ'),kind:'deep'});
      else if(pr.loot==='caves'&&d<1.3)out.push({d,label:'E — УВІЙТИ ДО ПЕЧЕР',act:()=>IB.SYS.deep(pr,'ДАЛЬНІ ПЕЧЕРИ ЛАВРИ'),kind:'deep'});
      else if(pr.loot==='museum'&&d<1.3)out.push({d,label:'E — СПУСТИТИСЯ ДО МУЗЕЮ',act:()=>IB.SYS.deep(pr,'ЗАКРИТІ ПОВЕРХИ МУЗЕЮ'),kind:'deep'});
      else if(pr.loot==='podil'&&d<1.3)out.push({d,label:'E — СПУСТИТИСЯ ДО ПІДВАЛУ',act:()=>IB.SYS.deep(pr,'ПОДІЛЬСЬКИЙ ПІДВАЛ'),kind:'deep'});
      else if(pr.loot==='andrew'&&d<1.3)out.push({d,label:'E — УВІЙТИ ДО КЛАДОВИ',act:()=>IB.SYS.deep(pr,'КЛАДОВА АНДРІЇВСЬКОЇ ЦЕРКВИ'),kind:'deep'});
      else if(pr.loot&&!pr.looted&&d<1.4)out.push({d,label:'E — ОГЛЯНУТИ '+(pr.t==='shelf'?'ПОЛИЦІ':pr.t==='dumpster'?'КОНТЕЙНЕР':pr.t==='barrels'?'БОЧКИ':pr.t==='cache'?'ТАЙНИК':pr.t==='crate'?'ЯЩИК':pr.t==='kiosk'?'КІОСК':''),act:()=>IB.SYS.search(pr),kind:'loot'});
    }
    for(const c of W.cars){
      const d=IB.dist(p.x,p.y,c.x,c.y);
      if(d<1.45&&!p.car)out.push({d,c,label:c.broken?'E — ОГЛЯНУТИ АВТО':'E — СІСТИ: '+(IB.SPR.CARS[c.mdl].name).toUpperCase(),act:c.broken?()=>IB.SYS.carLoot(c):()=>IB.enterCar(c),kind:'car'});
    }
    for(let i=0;i<W.towers.length;i++){
      const tw=W.towers[i];const d=IB.dist(p.x,p.y,tw.x+0.5,tw.y+0.5);
      if(d<2.0)out.push({d,label:G.flags['radio'+i]?'E — РАДІОСИГНАЛ (ПРОСЛУХАТИ ЗНОВУ)':'E — РАДІОСИГНАЛ: '+tw.n,act:()=>IB.SYS.radioTower(i),kind:'radio'});
    }
    for(const np of W.npcs){const d=IB.dist(p.x,p.y,np.x,np.y);if(d<1.3)out.push({d,label:'E — '+np.n,act:()=>IB.SYS.talk(np),kind:'npc'});}
    out.sort((a,b)=>a.d-b.d);
    return out;
  },
  /* ---------- місії ---------- */
  missionPoint(){
    const G=IB.G,m=IB.MISSIONS[G.mi];
    if(m.two&&!G.flags['m6a']){
      if(IB.dist(IB.PL.x,IB.PL.y,m.x+0.5,m.y+0.5)<m.r){
        IB.dialog('МІСІЯ: '+m.t,m.d+' Частина насоса — на Річковому вокзалі Подолу? Ні: насос вже тут, у підвалі. Візьми його.',[
          {t:'ВЗЯТИ ЧАСТИНУ НАСОСА',f:()=>{
            G.flags['m6a']=1;IB.addItem('pump_p',1);IB.toast('+ ЧАСТИНА НАСОСА');IB.AUDIO.sfx('pickup');
            IB.dialog('МІСІЯ: '+m.t,'Тепер віднеси частину насоса до табору на Гідропарку. Оля чекає.',[{t:'ДОБРЕ',f:()=>{}}]);
          }},{t:'ПІЗНІШЕ',f:()=>{}},
        ]);
        return;
      }
    }
    if(m.two&&G.flags['m6a']&&IB.hasItem('pump_p')){
      IB.dialog('ТАБІР ГІДРОПАРК','Оля: «Насос! Ти зробив це. Тепер у таборі буде вода.»',[{t:'ВІДДАТИ ЧАСТИНУ',f:()=>{IB.takeItem('pump_p',1);IB.SYS.completeMission();}},{t:'ПІЗНІШЕ',f:()=>{}}]);
      return;
    }
    IB.dialog('МІСІЯ: '+m.t,m.d+'\n\n'+(m.lore||''),[{t:'ПРОДОВЖИТИ',f:()=>{IB.SYS.completeMission();}},{t:'ПІЗНІШЕ',f:()=>{}}]);
  },
  completeMission(){
    const G=IB.G,m=IB.MISSIONS[G.mi];
    if(!m)return;
    G.mdone.push(G.mi);
    for(const k in m.reward||{})IB.addItem(k,m.reward[k]);
    IB.AUDIO.sfx('mission');
    IB.banner('МІСІЮ ВИКОНАНО • '+m.t);
    if(m.final){
      G.ending=true;
      setTimeout(()=>{IB.MAIN&&IB.MAIN.showEnd();},2600);
      IB.SYS.save();
      return;
    }
    G.mi++;
    IB.toast('НОВА ЦІЛЬ: '+IB.MISSIONS[G.mi].t,'gold');
    IB.SYS.save();
  },
  /* ---------- взаємодії ---------- */
  search(pr){
    if(IB.G.search)return;
    IB.G.search={t:0.9,prop:pr};
    IB.AUDIO.sfx('door');
  },
  finishSearch(pr){
    pr.looted=true;
    const table=IB.LOOT[pr.loot]||['cloth'];
    const n=IB.ri(1,2);
    for(let i=0;i<n;i++){
      const id=table[IB.ri(0,table.length-1)];
      IB.addItem(id,id==='ammo'?IB.ri(5,12):1);
      const nm=(IB.SPR.itemsDB[id]||{}).n||id;
      IB.toast('+ '+nm,'gold');
    }
    IB.AUDIO.sfx('pickup');
    /* засідка у підвалів */
    if(['gate','caves','museum','podil','andrew'].indexOf(pr.loot)>=0){
      const kinds=['guardian','crawler','guardian'];
      for(let i=0;i<2;i++)IB.SYS.trySpawnAt(IB.PL.x+IB.rnd(-3,3),IB.PL.y+IB.rnd(-3,3),kinds[i%2]);
      IB.toast('ЗАСІДКА! З ГЛИБИНИ ЙДУТЬ…','red');IB.AUDIO.sfx('growl');
    }
  },
  deep(pr,name){
    IB.dialog(name,'Темрява. Краплі води. На стінах — сліди чужих пальців.\n\n(тут сховані ресурси і небезпека)',[{t:'ОГЛЯНУТИ СХОВАНОК',f:()=>IB.SYS.finishSearch(pr)},{t:'ВІЙТИ',f:()=>{IB.toast('ТИХО… ТУТ ХТОСЬ Є','red');}}]);
  },
  carLoot(c){
    if(c.looted){IB.toast('ПУСТО');return;}
    c.looted=true;
    const id=['parts','cloth','ammo','fuel'][IB.ri(0,3)];
    IB.addItem(id,id==='ammo'?IB.ri(5,10):1);
    IB.toast('+ '+((IB.SPR.itemsDB[id]||{}).n||id),'gold');
    IB.AUDIO.sfx('door');
  },
  metro(st){
    const opts=IB.WORLD.stations.filter(s=>s!==st).map(s=>({t:'→ '+s.n,f:()=>{
      IB.MAIN&&IB.MAIN.fadeTo(()=>{IB.PL.x=s.x+1.2;IB.PL.y=s.y+1.2;IB.clearNear(12);});
      IB.banner('МЕТРО • '+s.n);IB.AUDIO.sfx('door');
      IB.NOISE.push({x:s.x,y:s.y,r:8,t:'door'});
    }}));
    opts.push({t:'ЗАЛИШИТИСЯ НАГОРІ',f:()=>{}});
    IB.dialog('МЕТРО «'+st.n+'»','У темряві тунелів чути кроки. Метро досі веде крізь місто — якщо не шуміти.',opts);
  },
  passage(pr){
    const W=IB.WORLD;
    const p=W.passages.find(pp=>IB.dist(pp.a[0]+0.5,pp.a[1]+0.5,pr.x,pr.y)<0.6||IB.dist(pp.b[0]+0.5,pp.b[1]+0.5,pr.x,pr.y)<0.6);
    if(!p)return;
    const from=IB.dist(p.a[0]+0.5,p.a[1]+0.5,pr.x,pr.y)<0.6?p.b:p.a;
    IB.MAIN&&IB.MAIN.fadeTo(()=>{IB.PL.x=from[0]+0.5;IB.PL.y=from[1]+1.4;IB.clearNear(10);});
    IB.banner(p.n);IB.AUDIO.sfx('door');
  },
  safehouse(s){
    IB.G.spawn={x:s.x+1.2,y:s.y+1.2};
    const opts=[
      {t:'ВІДПОЧИТИ (ДО 08:00, +40 HP)',f:()=>IB.SYS.rest()},
      {t:'СКЛАД — ПОКЛАСТИ / ЗАБРАТИ',f:()=>IB.SYS.stashUI()},
      {t:'ЗБЕРЕГТИ ГРУ',f:()=>{IB.SYS.save();IB.banner('ГРУ ЗБЕРЕЖЕНО');IB.AUDIO.sfx('sel');}},
    ];
    IB.dialog('СХОВАНКА: '+s.n,'Тут пахне домом. Генератор гудить. Можна відпочити, скласти зайве і зберегти прогрес.',opts);
  },
  rest(){
    const G=IB.G;
    G.t=8;G.day++;
    IB.PL.hp=IB.M.min(100,IB.PL.hp+40);IB.PL.st=100;
    IB.PL.hu=IB.M.max(15,IB.PL.hu-18);IB.PL.wa=IB.M.max(15,IB.PL.wa-15);
    IB.banner('ДЕНЬ '+G.day+' • 08:00');
    IB.ENTS.zombies=IB.ENTS.zombies.filter(z=>IB.dist(z.x,z.y,IB.PL.x,IB.PL.y)>14);
    IB.SYS.spawnStartProps();
    IB.SYS.save();
  },
  stashUI(){
    const items=Object.keys(IB.PL.inv).filter(k=>['ammo','machete'].indexOf(k)<0);
    const opts=items.map(id=>({t:'ПОКЛАСТИ: '+((IB.SPR.itemsDB[id]||{}).n||id)+' ×'+IB.PL.inv[id],f:()=>{
      IB.addItemTo(IB.G.stash,id,1);IB.takeItem(id,1);IB.AUDIO.sfx('sel');IB.SYS.stashUI();
    }}));
    const st=Object.keys(IB.G.stash).filter(k=>IB.G.stash[k]>0);
    for(const id of st)opts.push({t:'ЗАБРАТИ: '+((IB.SPR.itemsDB[id]||{}).n||id)+' ×'+IB.G.stash[id],f:()=>{
      IB.addItem(id,1);IB.G.stash[id]--;if(IB.G.stash[id]<=0)delete IB.G.stash[id];IB.AUDIO.sfx('sel');IB.SYS.stashUI();
    }});
    opts.push({t:'ЗАКРИТИ СКЛАД',f:()=>{}});
    IB.dialog('СКЛАД СХОВАНКИ','Речі з рюкзака й складу. Обери дію.',opts);
  },
  radioTower(i){
    const G=IB.G,tw=IB.WORLD.towers[i];
    const lore=[
      '«Оболонь, пункт 12. У нас закінчилась вода. Якщо хто чує — ми на верхніх поверхах.» Сигнал обривається.',
      '«Тут Гідропарк. Табір живий. Не йдіть на Лівий берег ночі — там ходить щось велике.»',
      '«Старе місто… ми замкнулись у дзвіниці Софії. Дзвін — це сигнал. Три удари — небезпека.»',
      '«Печерськ… Лавра не відповідає. У печерах бути НЕ можна без світла.»',
      '«Дарниця, промзона. Тут пальне. І тут — ОРДА. Тихо, чуєте? ТИХО…»',
    ];
    const first=!G.flags['radio'+i];
    G.flags['radio'+i]=1;
    if(first){IB.addItem('ammo',8);IB.toast('+ ПАТРОНИ ×8 (СХОВАНО БІЛЯ ВЕЖІ)','gold');}
    IB.dialog('РАДІОСИГНАЛ • '+tw.n,lore[i],[{t:'ЗАКРИТИ',f:()=>{}}]);
    IB.AUDIO.sfx('radio');
  },
  talk(np){
    if(np.role==='trader'){
      const opts=[
        {t:'ОБМІН: 2 ЗАПЧАСТИНИ → 10 ПАТРОНІВ',f:()=>{
          if(IB.takeItem('parts',2)){IB.addItem('ammo',10);IB.AUDIO.sfx('pickup');IB.toast('+ ПАТРОНИ ×10');}
          else IB.toast('НЕМА 2 ЗАПЧАСТИН','red');
          IB.SYS.talk(np);
        }},
        {t:'ОБМІН: 3 КОНСЕРВИ → АПТЕЧКА',f:()=>{
          if(IB.takeItem('food',3)){IB.addItem('medkit',1);IB.AUDIO.sfx('pickup');IB.toast('+ АПТЕЧКА');}
          else IB.toast('НЕМА 3 КОНСЕРВІВ','red');
          IB.SYS.talk(np);
        }},
        {t:'«ЩО ЧУЄШ?»',f:()=>{IB.dialog('ВАЛЕНТИНА','«Орда йде з Майдану ночами. А ще: у метро тихо, тільки не бігай по платформах.»',[{t:'ДЯКУЮ',f:()=>{}}]);}},
        {t:'ВИЙТИ',f:()=>{}},
      ];
      IB.dialog('ВАЛЕНТИНА • КОНТРАКТОВА ПЛОЩА','«Товар є. Патрони — золото. Міняй та живи.»',opts);
    } else if(np.role==='trader2'){
      const G=IB.G;
      const opts=[
        {t:'ОБМІН: 4 ПАТРОНИ → ТУШОНКА',f:()=>{
          if(IB.takeItem('ammo',4)){IB.addItem('stew',1);IB.AUDIO.sfx('pickup');IB.toast('+ ТУШОНКА');}
          else IB.toast('НЕМА 4 ПАТРОНІВ','red');
          IB.SYS.talk(np);
        }},
        {t:'ОБМІН: 2 КОНСЕРВИ → ВОДА ×2',f:()=>{
          if(IB.takeItem('food',2)){IB.addItem('water',2);IB.AUDIO.sfx('pickup');IB.toast('+ ВОДА ×2');}
          else IB.toast('НЕМА 2 КОНСЕРВІВ','red');
          IB.SYS.talk(np);
        }},
        {t:'«ЩО ТУТ, НА ЛІВОМУ?»',f:()=>{IB.dialog('ГАНЯ','«Тихо. Занадто тихо. І ще: у промзоні без протигаза краще не ходи — хімія з заводів досі висить над Дарницею.»',[{t:'ДЯКУЮ',f:()=>{}}]);}},
        {t:'ВИЙТИ',f:()=>{}},
      ];
      IB.dialog('ГАНЯ • ЛІВОБЕРЕЖЖЯ','«Все міняю: тушонку на патрони, патрони на їжу. Виживаємо як умеємо.»',opts);
    } else if(np.role==='guard'){
      const G=IB.G;
      if(!G.flags.guardMet){
        G.flags.guardMet=1;IB.addItem('energy',1);IB.addItem('ammo',6);
        IB.AUDIO.sfx('pickup');IB.toast('+ ЕНЕРГЕТИК, ПАТРОНИ ×6','gold');
      }
      IB.dialog('ПАТОН • МЕТРОМІСТ','«Я тримаю цей міст з першого дня. Переходь швидко і не шумій — внизу під мостом хтось дихає.»',[{t:'ДОБРЕ',f:()=>{}}]);
    } else if(np.role==='camp'){
      IB.dialog('СЕРГІЙ • ТАБІР','«Київ впав, але не здався. Тримайся острова, слухай вежі, і коли буде сила — піднімись до Матері-Батьківщини. Там передавач.»',[{t:'ДЯКУЮ',f:()=>{}}]);
    } else {
      const G=IB.G;
      if(G.flags['heal'+G.day]){IB.dialog('ОЛЯ','«Я вже допомогла тобі сьогодні. Береги себе.»',[{t:'ОК',f:()=>{}}]);}
      else{
        G.flags['heal'+G.day]=1;IB.PL.hp=IB.M.min(100,IB.PL.hp+30);
        IB.AUDIO.sfx('heal');IB.dialog('ОЛЯ • МЕДСЕСТРА','«Сідай, перев’яжу… Живи, чуєш? Живи.» (+30 HP)',[{t:'ДЯКУЮ',f:()=>{}}]);
      }
    }
  },
  /* ---------- виживання ---------- */
  update(dt){
    const G=IB.G,p=IB.PL,W=IB.WORLD;
    if(G.mode!=='game'||!p)return;
    /* час */
    G.t+=dt*24/IB.DAY_LEN;
    if(G.t>=24){G.t-=24;G.day++;IB.banner('ДЕНЬ '+G.day);IB.SYS.save();}
    /* пошук */
    if(G.search){
      G.search.t-=dt;
      if(G.search.t<=0){const pr=G.search.prop;G.search=null;IB.SYS.finishSearch(pr);}
    }
    if(!p.alive){G.deaths++;return;}
    /* голод/спрага */
    const inCar=!!p.car;
    p.hu=IB.clamp(p.hu-dt*(100/520)*(inCar?0.7:1),0,100);
    p.wa=IB.clamp(p.wa-dt*(100/380)*(inCar?0.7:1),0,100);
    if(p.hu<=0||p.wa<=0)p.hp-=dt*2.2;
    else if(p.hu>50&&p.wa>50&&p.hp<100)p.hp=IB.M.min(100,p.hp+dt*0.9);
    if(p.hp<=0&&p.alive){p.alive=false;G.deaths++;}
    /* зона відвідування */
    const z=W.zoneAt(IB.PL.x,IB.PL.y);
    if(!G.visited[z]){
      G.visited[z]=true;
      IB.banner(W.zoneName(z));
      IB.AUDIO.sfx('landmark');
    }
    /* токсична промзона: без протигаза медленно шкідливо */
    if(z===10&&!G.flags.mask&&p.alive&&!p.car){
      p.hp-=dt*1.4;
      G.toxT=(G.toxT||0)+dt;
      if(G.toxT>6){G.toxT=0;IB.toast('ПРОМЗОНА ОТРУЙНА — ЗНАЙДИ ПРОТИГАЗ','red');IB.AUDIO.sfx('hurt');}
      if(p.hp<=0&&p.alive){p.hp=0;p.alive=false;}
    }
    /* спавн */
    IB.SYS.spawnT=(IB.SYS.spawnT||0)-dt;
    if(IB.SYS.spawnT<=0){
      IB.SYS.spawnT=1.7;
      IB.SYS.tickSpawns();
    }
    /* події */
    G.evT-=dt;
    if(G.evT<=0){G.evT=IB.rnd(110,170);IB.SYS.randomEvent();}
  },
  tickSpawns(){
    const W=IB.WORLD,p=IB.PL,E=IB.ENTS,G=IB.G;
    const night=IB.nightFactor();
    const z=W.zoneAt(p.x,p.y);
    const danger=W.danger(z);
    const cap=IB.M.min(32,8+danger*4+IB.M.round(night*danger*2));
    /* despawn далеких */
    for(let i=E.zombies.length-1;i>=0;i--){
      const zz=E.zombies[i];
      if(IB.dist(zz.x,zz.y,p.x,p.y)>62)E.zombies.splice(i,1);
    }
    if(E.zombies.length>=cap)return;
    IB.SYS.trySpawn(17,26);
  },
  trySpawn(min,max){
    const W=IB.WORLD,p=IB.PL;
    const a=IB.rnd(0,6.28),d=IB.rnd(min,max);
    const x=p.x+IB.M.cos(a)*d,y=p.y+IB.M.sin(a)*d;
    IB.SYS.trySpawnAt(x,y,null);
  },
  trySpawnAt(x,y,forceType){
    const W=IB.WORLD,E=IB.ENTS,p=IB.PL;
    const tx=x|0,ty=y|0;
    if(!W.inb(tx,ty))return;
    const t=W.ter[W.ridx(tx,ty)];
    if(t===12||W.solid(tx,ty))return;
    if(IB.dist(x,y,p.x,p.y)<9)return;   /* не перед носом */
    const night=IB.nightFactor()>=0.5;
    const danger=W.danger(W.zoneAt(tx,ty));
    if(danger===0)return;
    let type=forceType;
    if(!type){
      const r=IB.rnd(0,1);
      if(danger<=2)type=r<0.72?'walker':(r<0.92?'runner':'crawler');
      else if(danger===3)type=r<0.45?'walker':(r<0.72?'runner':(r<0.82?'screamer':(r<0.92?'blind':'crawler')));
      else type=r<0.3?'walker':(r<0.58?'runner':(r<0.7?'screamer':(r<0.8?'blind':(r<0.9?(night&&IB.rnd(0,1)<0.2?'alpha':'brute'):'guardian'))));
    }
    IB.makeZombie(type,x,y);
  },
  randomEvent(){
    const r=IB.rnd(0,1),p=IB.PL;
    if(r<0.4){
      IB.toast('ОРДА ЗСУВАЄТЬСЯ ДО ТЕБЕ…','red');IB.AUDIO.sfx('alarm');
      const types=['walker','runner','screamer','walker','runner'];
      for(let i=0;i<7;i++){
        const a=IB.rnd(0,6.28),d=IB.rnd(20,26);
        IB.SYS.trySpawnAt(p.x+IB.M.cos(a)*d,p.y+IB.M.sin(a)*d,types[i%types.length]);
      }
    } else if(r<0.72){
      IB.toast('СИГНАЛ: ДЕСАНТ ПРИПАСІВ БІЛЯ [((·))]','gold');
      const a=IB.rnd(0,6.28),d=IB.rnd(18,26);
      const x=p.x+IB.M.cos(a)*d,y=p.y+IB.M.sin(a)*d;
      IB.ENTS.pickups.push({item:'ammo',n:IB.ri(8,14),x,y,bob:0});
      IB.ENTS.pickups.push({item:['food','medkit','fuel'][IB.ri(0,2)],n:1,x:x+0.6,y,bob:2});
      IB.G.flags.drop={x,y};
      setTimeout(()=>{IB.G.flags.drop=null;},60000);
    } else {
      IB.AUDIO.sfx('growl');IB.toast('ЩОСЬ СИЧИТЬ У ТЕМРЯВІ…');
    }
  },
  /* ---------- предмети ---------- */
  useItem(id){
    const p=IB.PL;
    switch(id){
      case 'food':if(IB.takeItem(id)){p.hu=IB.M.min(100,p.hu+40);IB.AUDIO.sfx('eat');IB.toast('+40 ЇЖІ');}break;
      case 'stew':if(IB.takeItem(id)){p.hu=IB.M.min(100,p.hu+60);IB.AUDIO.sfx('eat');IB.toast('+60 ЇЖІ • ТУШОНКА');}break;
      case 'energy':if(IB.takeItem(id)){p.st=IB.M.min(100,p.st+40);IB.AUDIO.sfx('eat');IB.toast('+40 ВИТРИВАЛОСТІ');}break;
      case 'mask':if(IB.takeItem(id)){IB.G.flags.mask=1;IB.AUDIO.sfx('craft');IB.banner('ПРОТИГАЗ ОДЯГО — ПРОМЗОНА БЕЗПЕЧНА');}break;
      case 'water':if(IB.takeItem(id)){p.wa=IB.M.min(100,p.wa+45);IB.AUDIO.sfx('eat');IB.toast('+45 ВОДИ');}break;
      case 'medkit':if(IB.takeItem(id)){p.hp=IB.M.min(100,p.hp+55);IB.AUDIO.sfx('heal');IB.toast('+55 HP');}break;
      case 'bandage':if(IB.takeItem(id)){p.hp=IB.M.min(100,p.hp+25);IB.AUDIO.sfx('heal');IB.toast('+25 HP');}break;
      case 'pills':if(IB.takeItem(id)){p.hp=IB.M.min(100,p.hp+15);p.st=IB.M.min(100,p.st+10);IB.AUDIO.sfx('heal');IB.toast('+15 HP +10 ST');}break;
      case 'battery':if(IB.takeItem(id)){p.batt=100;IB.toast('ЛІХТАР ЗАРЯДЖЕНО');}break;
      case 'fuel':if(p.car){if(IB.takeItem(id)){p.car.fuel=IB.M.min(100,p.car.fuel+40);IB.toast('БАК +40%');}}else IB.toast('СІДЬ В АВТО, ЩОБ ЗАПРАВИТИСЯ','red');break;
      case 'parts':if(p.car){if(IB.takeItem(id)){p.car.hp=IB.M.min(IB.SPR.CARS[p.car.mdl].hp,p.car.hp+30);p.car.broken=false;IB.toast('АВТО ВІДРЕМОНТОВАНО +30');IB.AUDIO.sfx('craft');}}else IB.toast('Ремонт — тільки в авто','red');break;
      case 'molotov':if(IB.takeItem(id)){IB.throwObj('molotov');IB.AUDIO.sfx('melee');}break;
      case 'grenade':IB.throwObj('grenade');IB.AUDIO.sfx('melee');break;
      default:IB.toast((IB.SPR.itemsDB[id]||{}).d||'','dim');
    }
  },
  craft(rid){
    const r=IB.RECIPES.find(x=>x.id===rid);
    if(!r)return;
    for(const k in r.req)if(!IB.hasItem(k,r.req[k])){IB.toast('НЕМА РЕСУРСІВ: '+((IB.SPR.itemsDB[k]||{}).n||k),'red');return;}
    for(const k in r.req)IB.takeItem(k,r.req[k]);
    IB.addItem(r.id==='molotov'?'molotov':r.id,1);
    IB.AUDIO.sfx('craft');IB.toast('СТВОРЕНО: '+r.n,'gold');
  },
  /* ---------- збереження ---------- */
  save(){
    const G=IB.G,p=IB.PL;
    if(!p)return;
    try{
      const looted=IB.WORLD.props.filter(pr=>pr.looted).map(pr=>pr.id);
      const cars=IB.WORLD.cars.map(c=>({mdl:c.mdl,x:c.x,y:c.y,dir:c.dir,fuel:c.fuel,hp:c.hp,broken:c.broken,drivable:c.drivable,looted:c.looted}));
      localStorage.setItem('ibonarium_kyiv_save',JSON.stringify({
        v:1,day:G.day,t:G.t,mi:G.mi,mdone:G.mdone,flags:G.flags,stash:G.stash,visited:G.visited,deaths:G.deaths,
        pl:{x:p.x,y:p.y,hp:p.hp,st:p.st,hu:p.hu,wa:p.wa,inv:p.inv,slot:IB.G.slot,batt:p.batt,kills:p.kills},
        looted,cars,
      }));
      G.flags.saved=1;
    }catch(e){}
  },
  hasSave(){try{return !!localStorage.getItem('ibonarium_kyiv_save');}catch(e){return false;}},
  load(){
    let d=null;
    try{d=JSON.parse(localStorage.getItem('ibonarium_kyiv_save'));}catch(e){}
    if(!d)return false;
    IB.initEnts();
    const G=IB.G,p=IB.PL;
    G.day=d.day;G.t=d.t;G.mi=d.mi;G.mdone=d.mdone||[];G.flags=d.flags||{};G.stash=d.stash||{};G.visited=d.visited||{};G.deaths=d.deaths||0;G.ending=false;
    Object.assign(p,d.pl);
    p.alive=true;p.car=null;p.fx=0;p.fy=1;p.dirKey='F';
    IB.G.slot=d.pl.slot||0;
    for(const id of d.looted||[]){const pr=IB.WORLD.props.find(q=>q.id===id);if(pr)pr.looted=true;}
    (d.cars||[]).forEach((cs,i)=>{const c=IB.WORLD.cars[i];if(c&&c.mdl===cs.mdl)Object.assign(c,cs);});
    IB.SYS.spawnStartProps();
    return true;
  },
  respawn(){
    const G=IB.G,p=IB.PL;
    p.x=G.spawn.x;p.y=G.spawn.y;p.hp=60;p.st=100;p.hu=IB.M.max(p.hu,55);p.wa=IB.M.max(p.wa,55);p.alive=true;p.car=null;
    IB.ENTS.zombies=[];
    IB.SYS.spawnStartProps();
    IB.banner('ТИ ЗНОВУ ЖИВИЙ • '+G.spawn.n||'СХОВАНКА');
  },
};
IB.addItemTo=function(o,id,n){o[id]=(o[id]||0)+n;};
IB.clearNear=function(r){IB.ENTS.zombies=IB.ENTS.zombies.filter(z=>IB.dist(z.x,z.y,IB.PL.x,IB.PL.y)>r);};
