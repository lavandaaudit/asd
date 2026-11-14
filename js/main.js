/* IBONARIUM KYIV — main.js: цикл, керування, HUD, меню, звук, збереження */
IB.Input=(function(){
  const keys={},pressed={};
  const MAP={KeyW:'w',ArrowUp:'up',KeyS:'s',ArrowDown:'down',KeyA:'a',ArrowLeft:'left',KeyD:'d',ArrowRight:'right',
    ShiftLeft:'shift',ShiftRight:'shift',KeyE:'e',Space:'space',KeyQ:'q',KeyM:'m',Tab:'tab',Escape:'esc',
    Enter:'enter',KeyF:'f',KeyG:'g',Digit1:'1',Digit2:'2',Digit3:'3',Digit4:'4',KeyI:'i',KeyV:'fs'};
  window.addEventListener('keydown',ev=>{
    const k=MAP[ev.code];
    if(k){if(!keys[k])pressed[k]=true;keys[k]=true;
      if(['space','tab','esc','enter','q','e','m','i','f','g','fs','1','2','3','4','up','down','left','right'].indexOf(k)>=0)ev.preventDefault();}
    IB.AUDIO.init();
  },{passive:false});
  window.addEventListener('keyup',ev=>{const k=MAP[ev.code];if(k)keys[k]=false;});
  window.addEventListener('blur',()=>{for(const k in keys)keys[k]=false;});
  /* сенсорне керування (віртуальний джойстик + кнопки) */
  const touch={x:0,y:0,active:false};
  function bindTouch(){
    const pad=document.getElementById('dpad');if(!pad)return;
    const knob=document.getElementById('dpad-knob');
    const btns={a:'e',b:'space',c:'tab',d:'m',e:'f',h:'shift'};
    document.querySelectorAll('[data-tk]').forEach(el=>{
      const k=btns[el.dataset.tk];
      const toggleMode=k==='shift';   /* RUN — перемикач (мобільно зручніше) */
      const on=ev=>{ev.preventDefault();
        if(toggleMode){keys[k]=!keys[k];el.classList.toggle('on',keys[k]);if(keys[k])pressed[k]=true;return;}
        if(!keys[k])pressed[k]=true;keys[k]=true;el.classList.add('on');};
      const off=ev=>{ev.preventDefault();
        if(toggleMode)return;
        keys[k]=false;el.classList.remove('on');};
      el.addEventListener('touchstart',on,{passive:false});
      el.addEventListener('touchend',off,{passive:false});
      el.addEventListener('touchcancel',off,{passive:false});
      el.addEventListener('mousedown',on);
      el.addEventListener('mouseup',off);
      el.addEventListener('mouseleave',off);
    });
    let cx=0,cy=0,pid=null;
    const setKnob=(dx,dy)=>{if(knob)knob.style.transform='translate('+(dx*26)+'px,'+(dy*26)+'px)';};
    const start=ev=>{ev.preventDefault();const t=ev.changedTouches?ev.changedTouches[0]:ev;const r=pad.getBoundingClientRect();cx=r.left+r.width/2;cy=r.top+r.height/2;touch.active=true;if(t.identifier!==undefined)pid=t.identifier;pad.classList.add('on');};
    const move=ev=>{
      if(!touch.active)return;ev.preventDefault();
      let t=null;
      if(ev.changedTouches){for(const tt of ev.changedTouches)if(tt.identifier===pid)t=tt;if(!t)return;}
      else t=ev;
      let dx=(t.clientX-cx)/40,dy=(t.clientY-cy)/40;
      const l=Math.hypot(dx,dy);if(l>1){dx/=l;dy/=l;}
      touch.x=dx;touch.y=dy;
      keys.w=dy<-0.3;keys.up=keys.w;keys.s=dy>0.3;keys.down=keys.s;
      keys.a=dx<-0.3;keys.left=keys.a;keys.d=dx>0.3;keys.right=keys.d;
      setKnob(dx,dy);
    };
    const end=ev=>{ev.preventDefault();touch.active=false;touch.x=touch.y=0;pid=null;keys.w=keys.s=keys.a=keys.d=keys.up=keys.down=keys.left=keys.right=false;setKnob(0,0);pad.classList.remove('on');};
    pad.addEventListener('touchstart',start,{passive:false});
    pad.addEventListener('touchmove',move,{passive:false});
    pad.addEventListener('touchend',end,{passive:false});
    pad.addEventListener('touchcancel',end,{passive:false});
    /* десктоп-тест джойстика мишкою */
    pad.addEventListener('mousedown',start);
    window.addEventListener('mousemove',ev=>{if(touch.active&&pid===null)move(ev);});
    window.addEventListener('mouseup',ev=>{if(touch.active&&pid===null)end(ev);});
  }
  return {keys,pressed,bindTouch,moveVec(){
    let x=0,y=0;
    if(keys.a||keys.left)x-=1;if(keys.d||keys.right)x+=1;
    if(keys.w||keys.up)y-=1;if(keys.s||keys.down)y+=1;
    if(touch.active){x+=touch.x;y+=touch.y;}
    return {x,y};
  },consume(k){if(pressed[k]){pressed[k]=false;return true;}return false;},clear(){for(const k in pressed)pressed[k]=false;}};
})();

IB.MAIN=(function(){
  let cv,g,hud={},last=0,acc=0,mode='boot';
  let menuIdx=0,menuItems=[],menuCtx='';
  let dlg={name:'',text:'',opts:[],idx:0};
  let sel=0,invSel=0;
  let bootT=0,titleT=0,loadT=0,fadeT=0,fadeCb=null;
  let uiTick=0;
  const MAIN={attackAnim:0,shootAnim:0,muzzleT:0};

  /* ---------- FULLSCREEN: на все вікно, з мобільним фолбеком ---------- */
  function isFs(){return !!(document.fullscreenElement||document.webkitFullscreenElement||document.body.classList.contains('fakefs'));}
  function toggleFullscreen(){
    const crt=$('crt');
    if(isFs()&&!document.body.classList.contains('fakefs')){
      (document.exitFullscreen||document.webkitExitFullscreen||function(){}).call(document);
      return;
    }
    if(document.body.classList.contains('fakefs')){document.body.classList.remove('fakefs');return;}
    const el=crt||document.documentElement;
    const rq=el.requestFullscreen||el.webkitRequestFullscreen||el.webkitRequestFullScreen;
    if(rq){
      try{const p=rq.call(el);if(p&&p.catch)p.catch(()=>fakeFs());}catch(e){fakeFs();}
      setTimeout(()=>{if(!document.fullscreenElement&&!document.webkitFullscreenElement)fakeFs();},350);
    } else fakeFs();
  }
  function fakeFs(){
    document.body.classList.add('fakefs');
    IB.toast&&IB.toast('ПОВНИЙ ЕКРАН: РЕЖИМ БЕЗ API — ESC ДЛЯ ВИХОДУ','gold');
  }
  document.addEventListener('fullscreenchange',()=>{document.body.classList.toggle('fs',!!document.fullscreenElement);});
  document.addEventListener('webkitfullscreenchange',()=>{document.body.classList.toggle('fs',!!document.webkitFullscreenElement);});
  MAIN.toggleFullscreen=toggleFullscreen;
  MAIN.isFs=isFs;

  /* ---------- утиліти DOM ---------- */
  function $(id){return document.getElementById(id);}
  function show(id,on){const el=$(id);if(el)el.classList.toggle('hidden',!on);}
  IB.toast=function(msg,cls){
    const log=$('log');if(!log)return;
    const div=document.createElement('div');
    div.className='log-line'+(cls?' '+cls:'');
    div.textContent=msg;
    log.appendChild(div);
    while(log.children.length>4)log.removeChild(log.firstChild);
    setTimeout(()=>{if(div.parentNode)div.parentNode.removeChild(div);},4000);
  };
  IB.banner=function(txt){
    const b=$('banner');if(!b)return;
    b.textContent=txt;b.classList.remove('hidden');
    b.style.animation='none';void b.offsetWidth;b.style.animation='';
    clearTimeout(b._t);b._t=setTimeout(()=>b.classList.add('hidden'),2700);
  };
  IB.dialog=function(name,text,opts){
    mode='dialog';dlg={name,text:text.replace(/\\n/g,'\n'),opts:opts||[],idx:0};
    renderDialog();
    IB.AUDIO.sfx('ui');
  };
  function renderDialog(){
    $('dlg-name').textContent=dlg.name;
    $('dlg-text').textContent=dlg.text;
    const box=$('dlg-opts');box.innerHTML='';
    dlg.opts.forEach((o,i)=>{
      const d=document.createElement('div');
      d.className='dopt'+(i===dlg.idx?' sel':'');
      d.textContent=o.t;
      d.onclick=()=>{dlg.idx=i;closeDialog();o.f&&o.f();};
      box.appendChild(d);
    });
    show('dialog',true);
  }
  function closeDialog(){show('dialog',false);mode='game';}

  /* ---------- загрузка/HUD ---------- */
  const SECTORS=IB.ZONES.map(z=>z.n);
  function setLoading(secN,tip){
    $('load-sector').textContent=secN;
    $('load-tip').textContent=tip||'';
  }
  function syncHUD(){
    const p=IB.PL;if(!p)return;
    const G=IB.G,W=IB.WORLD;
    $('bar-hp').style.width=Math.round(IB.clamp(p.hp,0,100))+'%';
    $('bar-st').style.width=Math.round(IB.clamp(p.st,0,100))+'%';
    $('bar-hu').style.width=Math.round(IB.clamp(p.hu,0,100))+'%';
    $('bar-wa').style.width=Math.round(IB.clamp(p.wa,0,100))+'%';
    const z=W.zoneAt(p.x,p.y);
    const zn=W.zoneName(z);
    if(hud.loc!==zn){hud.loc=zn;$('hud-loc').textContent=zn;}
    const day='ДЕНЬ '+G.day;
    if(hud.day!==day){hud.day=day;$('hud-day').childNodes[0].nodeValue=day+' ';}
    const ck=IB.clockStr();
    if(hud.ck!==ck){hud.ck=ck;$('hud-clock').textContent=ck;}
    const m=IB.MISSIONS[G.mi];
    const mt=G.ending?'ВИЖИВАЙ — КИЇВ ЖИВЕ':(m?('«'+m.t+'»'):'—');
    if(hud.mt!==mt){hud.mt=mt;$('hud-mtitle').textContent=mt;}
    /* відстань до цілі */
    if(m&&!G.ending){
      const tx=(m.two&&G.flags['m6a']&&m.x2!==undefined)?m.x2:m.x;
      const ty=(m.two&&G.flags['m6a']&&m.y2!==undefined)?m.y2:m.y;
      const d=IB.dist(p.x,p.y,tx+0.5,ty+0.5)|0;
      const ob2='ЦІЛЬ: '+d+' м • '+W.zoneName(W.zoneAt(tx,ty));
      if(hud.ob!==ob2){hud.ob=ob2;$('hud-mob').textContent=ob2;}
    } else {if(hud.ob!==''){hud.ob='';$('hud-mob').textContent='';}}
    /* радіо поблизу */
    let radioNear=false;
    for(const tw of W.towers)if(IB.dist(p.x,p.y,tw.x,tw.y)<26){radioNear=true;break;}
    $('hud-warn').textContent=radioNear?'((·))':'';
    /* хотбар */
    if(uiTick%10===0){
      const slots=[{ic:'machete',n:''},{ic:'pistol',n:p.inv.ammo||0},{ic:'grenade',n:p.inv.grenade||0},{ic:'medkit',n:p.inv.medkit||0}];
      document.querySelectorAll('#hotbar .slot').forEach((el,i)=>{
        const c=el.querySelector('canvas'),cg=c.getContext('2d');
        cg.clearRect(0,0,26,22);
        const ic=IB.SPR.icons[slots[i].ic];
        if(ic)cg.drawImage(ic,0,0,26,22);
        el.querySelector('span').textContent=slots[i].n;
        el.classList.toggle('sel',IB.G.slot===i);
      });
    }
    /* промпт */
    let pr='';
    if(IB.G.search)pr='ОГЛЯД... '+Math.round((1-IB.G.search.t/0.9)*100)+'%';
    else{
      const list=IB.SYS.interactables();
      if(!p.car&&list.length&&mode==='game')pr=list[0].label;
      else if(p.car)pr='E — ВИЙТИ З АВТО • SPACE — СИГНАЛ';
    }
    if(hud.pr!==pr){hud.pr=pr;const el=$('prompt');el.textContent=pr.replace(/^E — /,'');el.classList.toggle('hidden',!pr);
      if(pr.indexOf('E — ')===0)el.innerHTML='<b>E</b> — '+pr.slice(4);}
    /* toolbelt */
    $('tb-light').classList.toggle('hidden',!p.flash);
    $('tb-car').classList.toggle('hidden',!p.car);
    /* hurt */
    $('hurt').style.opacity=p.hurtT>0?Math.min(0.9,p.hurtT):0;
    p.hurtT=Math.max(0,p.hurtT-0.02);
  }

  /* ---------- меню ---------- */
  function setMenu(items,ctx){
    menuItems=items;menuCtx=ctx||'';menuIdx=0;
    const box=$(ctx==='pause'?'pause-menu':'menu');
    box.innerHTML='';
    items.forEach((it,i)=>{
      const d=document.createElement('div');
      d.className='mi'+(i===menuIdx?' sel':'');
      d.textContent=it.t;
      d.onclick=()=>{menuIdx=i;IB.AUDIO.sfx('sel');it.f();};
      box.appendChild(d);
    });
  }
  function menuMove(d){
    menuIdx=(menuIdx+d+menuItems.length)%menuItems.length;
    const box=$(menuCtx==='pause'?'pause-menu':'menu');
    [...box.children].forEach((el,i)=>el.classList.toggle('sel',i===menuIdx));
    IB.AUDIO.sfx('ui');
  }
  function menuSel(){const it=menuItems[menuIdx];if(it){IB.AUDIO.sfx('sel');it.f();}}

  function titleMenu(){
    mode='title';
    show('title',true);show('loading',false);show('hud',false);show('pause',false);show('dead',false);show('end',false);show('bigmap',false);show('inv',false);show('controls',false);show('about',false);
    try{IB.GFX.drawLogo($('logo').getContext('2d'));}catch(e){}
    const items=[{t:'НОВА ГРА',f:()=>startNewGame()}];
    if(IB.SYS.hasSave())items.push({t:'ПРОДОВЖИТИ',f:()=>loadGame()});
    items.push({t:'КЕРУВАННЯ',f:()=>{mode='controls';show('title',false);show('controls',true);}});
    items.push({t:'ПРО ГРУ ТА АСЕТИ',f:()=>{mode='about';show('title',false);show('about',true);}});
    setMenu(items,'title');
    IB.AUDIO.jingle();
  }
  function startNewGame(){
    show('title',false);show('loading',true);mode='loading';
    loadT=0;
  }
  function loadGame(){
    show('title',false);show('loading',true);mode='loading';
    loadT=0;
    IB._loadPending=true;
  }
  function beginPlay(){
    show('loading',false);show('hud',true);show('title',false);
    mode='game';
    IB.Input.clear();
  }
  MAIN.showEnd=function(){
    mode='end';
    const G=IB.G,p=IB.PL;
    const disc=Math.round(Object.keys(G.visited).filter(k=>G.visited[k]).length/IB.ZONES.length*100);
    $('end-stats').innerHTML=
      '<b>ДНІВ ПРОЖИТО:</b> '+G.day+'<br>'+
      '<b>ЗАРАЖЕНИХ ЗНИЩЕНО:</b> '+p.kills+'<br>'+
      '<b>МІСТО ДОСЛІДЖЕНО:</b> '+disc+'%<br>'+
      '<b>СМЕРТЕЙ:</b> '+G.deaths+'<br>'+
      '<b>СИГНАЛ:</b> ПЕРЕДАНО З ПАГОРБА БАТЬКІВЩИНИ-МАТИ';
    show('hud',false);show('end',true);
    IB.AUDIO.sfx('mission');
  };
  function pauseMenu(){
    mode='pause';show('pause',true);
    setMenu([{t:'ПРОДОВЖИТИ',f:()=>{show('pause',false);mode='game';}},
      {t:'ЗБЕРЕГТИ ГРУ',f:()=>{IB.SYS.save();IB.banner('ГРУ ЗБЕРЕЖЕНО');}},
      {t:'КЕРУВАННЯ',f:()=>{mode='controls';show('controls',true);}},
      {t:'ГОЛОВНЕ МЕНЮ',f:()=>{IB.SYS.save();show('pause',false);titleMenu();}}],'pause');
  }
  function invMenu(){
    mode='inv';
    renderInv();
    show('inv',true);
  }
  function renderInv(){
    const p=IB.PL,G=IB.G;
    const list=$('inv-list');list.innerHTML='';
    const ids=Object.keys(p.inv);
    if(!ids.length)list.innerHTML='<div class="inv-row"><span class="nm">РЮКЗАК ПОРОЖНІЙ</span></div>';
    ids.forEach(id=>{
      const it=IB.SPR.itemsDB[id]||{n:id,d:''};
      const row=document.createElement('div');
      row.className='inv-row usable';
      row.innerHTML='<span class="q">×'+p.inv[id]+'</span><span class="nm">'+it.n+'</span><span class="ds">'+it.d+'</span>';
      row.onclick=()=>{IB.SYS.useItem(id);renderInv();};
      list.appendChild(row);
    });
    const cl=$('craft-list');cl.innerHTML='';
    IB.RECIPES.forEach(r=>{
      const can=Object.keys(r.req).every(k=>(p.inv[k]||0)>=r.req[k]);
      const req=Object.keys(r.req).map(k=>((IB.SPR.itemsDB[k]||{}).n||k)+'×'+r.req[k]).join(' + ');
      const row=document.createElement('div');
      row.className='inv-row'+(can?' usable':' cant');
      row.innerHTML='<span class="q">→</span><span class="nm">'+r.n+'</span><span class="ds">'+req+'</span><span class="'+(can?'ok':'no')+'">'+(can?'КРАФТ':'МАЛО')+'</span>';
      if(can)row.onclick=()=>{IB.SYS.craft(r.id);renderInv();};
      cl.appendChild(row);
    });
  }

  /* ---------- дії гравця ---------- */
  function doAttack(){
    const p=IB.PL;
    if(p.atkCd>0)return;
    if(IB.G.slot===0){
      p.atkCd=0.42;MAIN.attackAnim=0.22;IB.AUDIO.sfx('melee');
      IB.NOISE.push({x:p.x,y:p.y,r:2.5,t:'melee'});
      for(const z of IB.ENTS.zombies.slice()){
        const d=IB.dist(p.x,p.y,z.x,z.y);
        if(d<1.25){
          const dot=((z.x-p.x)*p.fx+(z.y-p.y)*p.fy)/Math.max(0.01,d);
          if(dot>0.3){IB.hurtZombie(z,34,p.fx,p.fy);IB.AUDIO.sfx('hit');}
        }
      }
    } else if(IB.G.slot===1){
      if((p.inv.ammo||0)<=0){IB.AUDIO.sfx('dry');IB.toast('НЕМА ПАТРОНІВ 9ММ','red');return;}
      IB.takeItem('ammo',1);
      p.atkCd=0.3;MAIN.shootAnim=0.15;MAIN.muzzleT=0.08;
      IB.fireBullet(p.x,p.y,p.fx,p.fy,26);
    } else if(IB.G.slot===2){
      if((p.inv.grenade||0)<=0){IB.AUDIO.sfx('dry');IB.toast('НЕМА ГРАНАТ','red');return;}
      IB.takeItem('grenade',1);p.atkCd=0.8;
      IB.throwObj('grenade');
    } else {
      IB.SYS.useItem('medkit');
    }
  }

  /* ---------- головний цикл ---------- */
  function updateGame(dt){
    const p=IB.PL,G=IB.G;
    IB.SYS.update(dt);
    IB.updateEnts(dt);
    IB.cam.shake=Math.max(0,IB.cam.shake-dt*2);
    MAIN.attackAnim=Math.max(0,MAIN.attackAnim-dt);
    MAIN.shootAnim=Math.max(0,MAIN.shootAnim-dt);
    MAIN.muzzleT=Math.max(0,MAIN.muzzleT-dt);
    /* вхід */
    if(IB.Input.consume('tab')){
      if(mode==='game'){mode='map';show('bigmap',true);IB.AUDIO.sfx('ui');}
      else if(mode==='map'){mode='game';show('bigmap',false);}
      return;
    }
    if(mode==='map'&&IB.Input.consume('esc')){mode='game';show('bigmap',false);return;}
    if(mode!=='game')return;
    if(IB.Input.consume('esc')){pauseMenu();return;}
    if(IB.Input.consume('m')||IB.Input.consume('i')){invMenu();return;}
    if(IB.Input.consume('f')){
      p.flash=!p.flash;
      if(p.flash&&p.batt<=0){p.flash=false;IB.toast('БАТАРЕЙКА СКАСУВАЛАСЬ — ЗНАЙДИ БАТАРЕЙКИ','red');}
      else IB.toast(p.flash?'ЛІХТАР УВІМКНЕНО':'ЛІХТАР ВИМКНЕНО');
    }
    if(IB.Input.consume('q')){IB.G.slot=(IB.G.slot+1)%4;IB.AUDIO.sfx('ui');}
    ['1','2','3','4'].forEach((k,i)=>{if(IB.Input.consume(k))IB.G.slot=i;});
    if(IB.Input.consume('space')&&!p.car){doAttack();}
    if(p.car&&IB.Input.consume('space')){IB.AUDIO.sfx('crash');IB.NOISE.push({x:p.car.x,y:p.car.y,r:14,t:'horn'});IB.toast('БІП-БІП! ШУМ ПРИТЯГУЄ ЗАРАЖЕНИХ','red');}
    if(IB.Input.consume('e')){
      if(p.car){IB.exitCar();}
      else{
        const list=IB.SYS.interactables();
        if(list.length)list[0].act();
      }
    }
    if(IB.Input.consume('g')&&(p.inv.grenade||0)>0){IB.takeItem('grenade',1);IB.throwObj('grenade');}
  }
  function updateDialog(dt){
    const n=dlg.opts.length;
    if(IB.Input.consume('down')){dlg.idx=(dlg.idx+1)%Math.max(1,n);renderDialog();IB.AUDIO.sfx('ui');}
    if(IB.Input.consume('up')){dlg.idx=(dlg.idx-1+n)%Math.max(1,n);renderDialog();IB.AUDIO.sfx('ui');}
    if(IB.Input.consume('enter')||IB.Input.consume('e')||IB.Input.consume('space')){
      const o=dlg.opts[dlg.idx];
      closeDialog();if(o&&o.f)o.f();
    }
    if(IB.Input.consume('esc'))closeDialog();
  }
  function updateMenus(){
    if(IB.Input.consume('down'))menuMove(1);
    if(IB.Input.consume('up'))menuMove(-1);
    if(IB.Input.consume('enter')||IB.Input.consume('e')||IB.Input.consume('space'))menuSel();
    if(IB.Input.consume('esc')||IB.Input.consume('tab')){
      if(mode==='controls'||mode==='about'){show('controls',false);show('about',false);titleMenu();}
      else if(mode==='pause'){show('pause',false);mode='game';}
    }
  }
  function updateInv(){
    if(IB.Input.consume('esc')||IB.Input.consume('m')||IB.Input.consume('i')){show('inv',false);mode='game';}
    if(IB.Input.consume('down')){invSel++;renderInv();}
  }

  function frame(ts){
    requestAnimationFrame(frame);
    document.body.classList.toggle('playing', mode==='game'||mode==='map'||mode==='dialog'||mode==='inv'||mode==='dead'||mode==='end');
    const dt=Math.min(0.05,(ts-last)/1000||0.016);last=ts;
    uiTick++;
    IB.G.mode=mode;
    /* --- режимний стан --- */
    if(mode==='boot'){
      bootT+=dt;
      if(bootT>3.4){show('boot',false);titleMenu();}
    } else if(mode==='title'){titleT+=dt;}
    else if(mode==='loading'){
      loadT+=dt;
      const total=SECTORS.length;
      const sec=Math.min(total-1,Math.floor(loadT/0.22));
      setLoading((IB._loadPending?'ВІДНОВЛЕННЯ • ':'СЕКТОР ')+sec+' — '+SECTORS[sec],TIPS[sec%TIPS.length]);
      $('load-bar').firstElementChild.style.width=Math.min(100,loadT/0.22/total*100)+'%';
      if(loadT>0.24*total){
        if(!IB.WORLD)IB.buildWorld();
        if(IB._loadPending){IB._loadPending=false;if(!IB.SYS.load()){IB.SYS.newGame();}}
        else if(!IB._gameInited){IB.SYS.newGame();}
        IB._gameInited=true;
        beginPlay();
      }
    }
    else if(mode==='game'||mode==='map'){updateGame(dt);}
    else if(mode==='dialog'){updateDialog(dt);}
    else if(mode==='pause'||mode==='title'||mode==='controls'||mode==='about'){updateMenus();}
    else if(mode==='inv'){updateInv();}
    else if(mode==='dead'){
      if(IB.Input.consume('enter')||IB.Input.consume('e')||IB.Input.consume('space')){
        show('dead',false);show('hud',true);mode='game';
        IB.SYS.respawn();
      }
    }
    else if(mode==='end'){
      if(IB.Input.consume('enter')||IB.Input.consume('e')||IB.Input.consume('space')){
        show('end',false);show('hud',true);mode='game';
        IB.G.mi=IB.MISSIONS.length;IB.G.ending=false;
        IB.banner('ВІЛЬНЕ ВИЖИВАННЯ • КИЇВ ТВІЙ');
      }
    }
    /* --- рендер --- */
    if(mode==='boot'){
      /* анімація загрузки */
    } else {
      if(IB.PL){
        if(mode==='game'||mode==='map'||mode==='dialog'||mode==='inv'||mode==='dead'||mode==='end'){
          const p=IB.PL;
          const tx=p.car?p.car.x:p.x, ty=p.car?p.car.y:p.y;
          IB.cam.x+=(tx-IB.cam.x)*Math.min(1,dt*6);
          IB.cam.y+=(ty-IB.cam.y)*Math.min(1,dt*6);
          g.fillStyle='#0a0c12';g.fillRect(0,0,IB.CAMW,IB.CAMH);
          IB.GFX.drawGround(g);
          IB.GFX.drawScene(g);
          IB.GFX.drawMinimapHUD(hud.mm.getContext('2d'));
          IB.GFX.drawCompass(hud.cp.getContext('2d'));
          if(mode==='map'){IB.GFX.drawBigMap($('mapc').getContext('2d'));
            const disc=Math.round(Object.keys(IB.G.visited).filter(k=>IB.G.visited[k]).length/IB.ZONES.length*100);
            $('map-disc').textContent=disc+'%';}
          syncHUD();
        }
      }
    }
    /* fade */
    if(fadeT>0){
      fadeT-=dt;
      g.fillStyle='rgba(0,0,0,'+IB.clamp(fadeT/0.3,0,1)+')';g.fillRect(0,0,IB.CAMW,IB.CAMH);
      if(fadeCb&&fadeT<=0.15){const cb=fadeCb;fadeCb=null;cb();}
    }
    /* dead screen */
    if(IB.PL&&!IB.PL.alive&&mode==='game'){
      mode='dead';show('dead',true);
      $('dead-txt').textContent='Ти загинув на вулицях Києва. Але місто ще чекає. Схованка зберігає твої речі — повернись.';
      IB.AUDIO.sfx('zdie');
    }
  }
  const TIPS=['НЕ БІГЛИ ВНОЧІ — ШУМ ПРИТЯГУЄ ОРДУ','СХОВАНКИ ЗБЕРІГАЮТЬ ГРУ','МЕТРО — ШВИДКИЙ ШЛЯХ КРІЗЬ МІСТО','АВТО — ШВИДКІСТЬ, АЛЕ І ШУМ','СЛУХАЙ РАДІОВЕЖІ ((·))','ДНІПРО НЕПРОХОДИЙ — ЙДИ МОСТАМИ','ПАГОРБИ ПЕЧЕРСЬКА — НАЙКРАЩИЙ ОГЛЯД'];

  MAIN.fadeTo=function(cb){fadeT=0.6;fadeCb=cb;};
  MAIN.backToTitle=function(){show('controls',false);show('about',false);titleMenu();};

  /* ---------- boot + init ---------- */
  function bootAnim(){
    const boot=$('boot');
    const lines=[
      ['IBONARIUM BIOS v2.6','dim'],
      ['16-BIT HOME SYSTEM — MODEL IK-1601','dim'],
      [''],
      ['ПЕРЕВІРКА ПАМ’ЯТІ........ 64K OK',''],
      ['ВІДЕОПРОЦЕСОР........... OK',''],
      ['ЗВУКОВИЙ ЧІП............ OK',''],
      ['ЗАВАНТАЖЕННЯ КАРТРИДЖА: KYIV — THE LAST SIGNAL','gold'],
      [''],
      ['КИЇВ ЧЕКАЄ. НАТИСНІТЬ ЩО-НЕБУДЬ…','blink'],
    ];
    let i=0;
    const tm=setInterval(()=>{
      if(i>=lines.length||mode!=='boot'){clearInterval(tm);return;}
      const d=document.createElement('div');
      d.className='bline'+(lines[i][1]?' '+lines[i][1]:'');
      d.textContent=lines[i][0]||'\u00A0';
      boot.appendChild(d);
      i++;
      IB.AUDIO.sfx('ui');
    },260);
  }
  function bindShell(){
    $('btn-power').onclick=()=>{location.reload();};
    $('btn-reset').onclick=()=>{location.reload();};
    $('btn-scan').onclick=()=>{const s=$('scanlines');s.classList.toggle('hidden');$('btn-scan').classList.toggle('active',!s.classList.contains('hidden'));};
    $('btn-fs').onclick=()=>toggleFullscreen();
    const fsBtn=$('btn-fs-crt');
    if(fsBtn)fsBtn.onclick=()=>toggleFullscreen();
    if($('crt')){$('crt').addEventListener('dblclick',()=>toggleFullscreen());}
    $('vol').oninput=e=>IB.AUDIO.setVol(e.target.value/100);
    const skip=()=>{if(mode==='boot'){bootT=99;}};
    window.addEventListener('keydown',skip);
    $('crt').addEventListener('mousedown',skip);
    /* глобальна гаряча клавіша V — повний екран */
    window.addEventListener('keydown',ev=>{if(ev.code==='KeyV'){toggleFullscreen();}});
    /* у фейковому фулскріні ESC виходить */
    window.addEventListener('keydown',ev=>{if(ev.code==='Escape'&&document.body.classList.contains('fakefs'))document.body.classList.remove('fakefs');});
    /* ROM slot — EmulatorJS (на мобільних вбудований віртуальний геймпад) */
    const romInput=$('romfile');
    if(romInput)$('rom-start').onclick=()=>{
      const f=romInput.files&&romInput.files[0];
      if(!f){IB.toast('ВИБЕРІТЬ ФАЙЛ ROM ПЕРШ','red');return;}
      const wrap=$('ejs-wrap');
      wrap.classList.remove('hidden');
      $('crt').style.display='none';
      window.EJS_player='#ejs-game';
      window.EJS_core='segaMD';
      window.EJS_pathtodata='https://cdn.emulatorjs.org/stable/data/';
      window.EJS_gameUrl=URL.createObjectURL(f);
      window.EJS_gameName='IBONARIUM ROM';
      window.EJS_startOnLoaded=true;
      const s=document.createElement('script');
      s.src='https://cdn.emulatorjs.org/stable/data/loader.js';
      document.body.appendChild(s);
      IB.toast('EMUJS: ЗАВАНТАЖЕННЯ ЯДРА GENESIS PLUS GX…','gold');
    };
  }

  MAIN.init=function(){
    cv=$('game');g=cv.getContext('2d');
    g.imageSmoothingEnabled=false;
    hud.mm=$('minimap');hud.cp=$('compass');
    /* портрет Марка */
    const fc=$('face');
    if(fc){const fg=fc.getContext('2d');fg.imageSmoothingEnabled=false;fg.drawImage(IB.SPR.face,0,0);}
    IB.Input.bindTouch();
    if(/[?&]touch=1/.test(location.search))document.body.classList.add('touchtest');
    bindShell();
    bootAnim();
    /* розмір екрана */
    function fit(){
      const crt=$('crt');
      cv.style.width='100%';
      cv.style.aspectRatio='10/7';
    }
    fit();
    last=performance.now();
    requestAnimationFrame(frame);
    /* Kenney City Kit assets (CC0) — м’який фолбек на процедурні спрайти */
    if(IB.ASSETS&&IB.ASSETS.load){
      IB.ASSETS.load().then(()=>{
        try{
          const r=IB.KENNEY.apply();
          if(r.bldOk>0)IB.toast('KENNEY CITY KITS ПІДКЛЮЧЕНО (CC0)','gold');
        }catch(e){/* процедурний стиль лишається */}
      }).catch(()=>{});
    }
  };
  return MAIN;
})();

window.addEventListener('DOMContentLoaded',()=>{IB.MAIN.init();});
