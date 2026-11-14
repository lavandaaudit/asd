/* IBONARIUM KYIV — world.js: велика карта Києва 224x224 (географія реальних районів) */
IB.TER={grass:0,park:1,field:2,sidewalk:3,pave:4,cobble:5,concrete:6,plaza:7,rubble:8,dirt:9,sand:10,rail:11,water:12,road:13};
IB.ZONES=[
  {k:'OBO', n:'ОБОЛОНЬ', d:2},
  {k:'POD', n:'ПОДІЛ', d:2},
  {k:'OLD', n:'СТАРЕ МІСТО', d:3},
  {k:'HR',  n:'ХРЕЩАТИК', d:4},
  {k:'MAI', n:'МАЙДАН НЕЗАЛЕЖНОСТІ', d:5},
  {k:'PECH',n:'ПЕЧЕРСЬК', d:3},
  {k:'LVR', n:'КИЄВО-ПЕЧЕРСЬКА ЛАВРА', d:4},
  {k:'MOT', n:'БАТЬКІВЩИНА-МАТИ', d:4},
  {k:'LEFT',n:'ЛІВИЙ БЕРЕГ', d:2},
  {k:'ISL', n:'ГІДРОПАРК', d:1},
  {k:'IND', n:'ПРОМЗОНА • ДАРНИЦЯ', d:4},
  {k:'VOK', n:'ЗАЛІЗНИЧНИЙ ВОКАЗАЛ', d:2},
  {k:'RIV', n:'ДНІПРО', d:0},
];
IB.SEctORS=null;
IB.buildWorld=function(){
  const W=224,H=224;
  const ter=new Uint8Array(W*H),vrn=new Uint8Array(W*H),rdm=new Uint8Array(W*H),
        elev=new Uint8Array(W*H), zone=new Uint8Array(W*H), blk=new Uint8Array(W*H),
        brg=new Uint8Array(W*H);
  const idx=(x,y)=>y*W+x, inb=(x,y)=>x>=0&&y>=0&&x<W&&y<H;
  const T=IB.TER;
  const rnd=IB.rnd, ri=IB.ri, hsh=IB.hsh;
  /* ---- база: трава ---- */
  ter.fill(T.grass);
  for(let i=0;i<W*H;i++){vrn[i]=ri(0,2);}
  /* ---- річка Дніпро з вигинами ---- */
  const cx=y=>152+IB.M.round(8*IB.M.sin(y*0.043)+4*IB.M.sin(y*0.011+2));
  for(let y=0;y<H;y++){
    const c=cx(y);
    for(let x=c;x<=c+16;x++){ter[idx(x,y)]=T.water;vrn[idx(x,y)]=0;}
  }
  /* ---- острови: Труханів, Гідропарк ---- */
  function island(cxx,cyy,rx,ry,kind){
    for(let y=cyy-ry;y<=cyy+ry;y++)for(let x=cxx-rx;x<=cxx+rx;x++){
      if(!inb(x,y))continue;
      const q=((x-cxx)/rx)**2+((y-cyy)/ry)**2;
      if(q<=1){ter[idx(x,y)]=q>0.72?T.sand:kind;vrn[idx(x,y)]=ri(0,2);}
    }
  }
  island(160,72,5,20,T.grass);   // Труханів
  island(155,128,7,15,T.grass);  // Гідропарк
  /* ---- пагорби (рельєф Києва) ---- */
  function hill(x0,y0,x1,y1,e){
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){if(inb(x,y)&&ter[idx(x,y)]!==T.water)elev[idx(x,y)]=e;}
  }
  hill(58,120,132,172,2);  // Старе місто
  hill(128,158,174,212,2); // Печерськ
  hill(146,186,174,212,3); // пагорб Батьківщини-Матері
  /* ---- дороги ---- */
  function R(x,y,t){if(inb(x,y)&&ter[idx(x,y)]!==T.water){ter[idx(x,y)]=t;vrn[idx(x,y)]=0;}}
  function VR(x0,x1,y0,y1,t){for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)R(x,y,t);}
  function HR(y0,y1,x0,x1,t){for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)R(x,y,t);}
  const cob=T.cobble, rd=T.road, sw=T.sidewalk, pv=T.pave, con=T.concrete;
  /* Оболонь */
  VR(34,35,8,62,rd); HR(40,41,8,64,rd); HR(24,25,10,60,rd); VR(50,51,14,58,rd);
  /* Гавань/Поділ */
  VR(66,67,42,72,rd); HR(84,85,60,126,rd); HR(100,101,60,124,rd);
  VR(76,77,74,116,rd); VR(108,109,74,116,rd); HR(92,93,78,124,rd);
  /* Набережна (вздовж Дніпра) */
  const BR=[56,104,160,206];
  for(let y=36;y<=196;y++){if(BR.indexOf(y)>=0)continue;const ex=cx(y)-6;if(inb(ex,y)&&ter[idx(ex,y)]!==T.water)R(ex,y,rd);if(inb(ex+1,y)&&ter[idx(ex+1,y)]!==T.water)R(ex+1,y,rd);}
  /* Андріївський узвіз: брукований спуск з пагорба */
  VR(102,103,108,126,cob);
  for(let y=112;y<=115;y++){elev[idx(102,y)]=1;elev[idx(103,y)]=1;}
  for(let y=116;y<=121;y++){elev[idx(102,y)]=2;elev[idx(103,y)]=2;}
  /* Старе місто */
  HR(132,133,60,128,pv); HR(148,149,60,128,pv); VR(88,89,120,166,pv); VR(120,121,120,166,pv);
  /* Хрещатик (широка вулиця) + Європейська площа */
  HR(150,152,110,131,rd);
  for(let y=144;y<=156;y++)for(let x=110;x<=118;x++)if(ter[idx(x,y)]!==T.road)R(x,y,pv);
  /* Майдан: велика площа з малюнком */
  for(let y=142;y<=162;y++)for(let x=132;x<=152;x++)R(x,y,T.plaza);
  /* Печерськ + Лавра */
  VR(138,139,158,190,rd); HR(168,169,128,154,rd); HR(176,177,140,154,rd);
  VR(148,149,158,163,rd);
  /* Батьківщина-Мати: кільце + проїзд */
  HR(196,197,138,152,rd); VR(150,151,184,206,rd); VR(146,147,190,206,rd);
  /* Лівий берег */
  VR(196,197,8,124,rd); HR(104,105,178,216,rd); HR(84,85,178,216,rd); HR(40,41,178,216,rd);
  VR(206,207,8,120,rd); HR(64,65,178,216,rd);
  /* Промзона Дарниця */
  HR(160,161,178,216,rd); VR(204,205,128,216,rd); HR(184,185,178,216,rd);
  /* Вокзал (південний захід) */
  VR(64,65,190,216,rd); HR(196,197,56,100,rd); HR(172,173,8,64,rd); VR(28,29,66,172,rd);
  /* залізниця */
  for(let x=178;x<=218;x++)if(ter[idx(x,188)]!==T.water)ter[idx(x,188)]=T.rail;
  for(let x=66;x<=132;x++)if(ter[idx(x,208)]!==T.water)ter[idx(x,208)]=T.rail;
  for(let y=196;y<=216;y++)if(ter[idx(70,y)]!==T.water)ter[idx(70,y)]=T.rail;
  /* ---- мости через Дніпро ---- */
  const BRIDGES=[[56,'ПІВНІЧНИЙ МІСТ'],[104,'МЕТРО МІСТ'],[160,'МІСТ ПАТОНА'],[206,'ПІВДЕННИЙ МІСТ']];
  for(const [by] of BRIDGES){
    const c=cx(by);
    for(let x=c-9;x<=c+25;x++){const i=idx(x,by);ter[i]=T.road;brg[i]=1;vrn[i]=0;blk[i]=0;}
  }
  /* тротуари вздовж доріг */
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){
    if(ter[idx(x,y)]!==T.grass&&ter[idx(x,y)]!==T.field)continue;
    if(rd===1)continue;
    let near=false;
    for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){if(inb(x+dx,y+dy)&&ter[idx(x+dx,y+dy)]===T.road)near=true;}
    if(near&&hsh(x,y,77)<0.92)ter[idx(x,y)]=T.sidewalk;
  }
  /* пляжі біля води */
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){
    if(ter[idx(x,y)]!==T.grass)continue;
    for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){if(inb(x+dx,y+dy)&&ter[idx(x+dx,y+dy)]===T.water){if(hsh(x,y,55)<0.5)ter[idx(x,y)]=T.sand;break;}}
  }
  /* руїни/сміття у промзоні та Майдані */
  for(let y=140;y<=160;y++)for(let x=114;x<=131;x++){if(ter[idx(x,y)]===T.road&&hsh(x,y,31)<0.14)ter[idx(x,y)]=T.rubble;}
  for(let y=130;y<=216;y++)for(let x=180;x<=216;x++){if(ter[idx(x,y)]===T.grass&&hsh(x,y,32)<0.18)ter[idx(x,y)]=T.rubble;}
  /* ---- зони ---- */
  function zoneAt(x,y){
    if(ter[idx(x,y)]===T.water)return 12;
    if(y>=113&&y<=143&&x>=148&&x<=162)return 9;             // Гідропарк
    if(x<66&&y<66)return 0;
    if(x>=56&&x<132&&y>=64&&y<120)return 1;
    if(x>=132&&x<154&&y>=140&&y<164)return 4;               // Майдан
    if(x>=108&&x<132&&y>=144&&y<156)return 3;               // Хрещатик
    if(x>=140&&x<158&&y>=163&&y<189)return 6;               // Лавра
    if(x>=144&&x<170&&y>=189&&y<212)return 7;               // Батьківщина-Мати
    if(x>=56&&x<132&&y>=120&&y<172)return 2;                // Старе місто
    if(x>=128&&x<176&&y>=156&&y<212)return 5;               // Печерськ
    if(x>=176&&y<128)return 8;                              // Лівий берег
    if(x>=176&&y>=128)return 10;                            // Промзона
    if(x>=56&&x<104&&y>=188)return 11;                      // Вокзал
    return (y<120?1:(y<172?2:5));
  }
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)zone[idx(x,y)]=zoneAt(x,y);
  /* ---- масиви колізій ---- */
  for(let i=0;i<W*H;i++){if(ter[i]===T.water)blk[i]=2;}
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(x<2||y<2||x>=W-2||y>=H-2)blk[idx(x,y)]=4;}
  /* ---- road mask ---- */
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    if(ter[idx(x,y)]!==T.road)continue;
    let m=0;
    const isr=(x,y)=>inb(x,y)&&(ter[idx(x,y)]===T.road);
    if(isr(x,y-1))m|=1; if(isr(x+1,y))m|=2; if(isr(x,y+1))m|=4; if(isr(x-1,y))m|=8;
    rdm[idx(x,y)]=m;
  }
  /* друга прохідка: перехрестя всередині широкої (3+) дороги -> суцільний асфальт */
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const i=idx(x,y);
    if(rdm[i]!==15)continue;
    const n15=(dx,dy)=>inb(x+dx,y+dy)&&rdm[idx(x+dx,y+dy)]===15;
    if(n15(0,-1)||n15(0,1)||n15(-1,0)||n15(1,0))rdm[i]=16;
  }
  /* ---- локації-домінанти (IB.LM) ---- */
  const LMS=[
    ['sophia_cath',81,127],['sophia_bell',89,129],['golden_gate',63,137],
    ['maidan_col',141,151],['lachida',140,157],
    ['lavra_cath',144,169],['lavra_bell',149,166],['lavra_refect',144,177],['caves_chapel',150,182],
    ['st_andrew',98,116],['motherland',152,191],['museum',150,196],
    ['gostyny',86,88],['samson',94,92],
    ['radio_tower',18,14],['radio_tower',154,126],['radio_tower',60,133],['radio_tower',140,194],['radio_tower',212,142],
  ];
  const lms=[];
  for(const[key,x,y]of LMS){
    const d=IB.LM[key];const wT=d.wT,dT=d.dT;
    for(let yy=y;yy<y+dT;yy++)for(let xx=x;xx<x+wT;xx++){if(inb(xx,yy)){ter[idx(xx,yy)]=T.concrete;blk[idx(xx,yy)]=3;}}
    lms.push({key,x,y,wT,dT,zone:zoneAt(x,y)});
  }
  /* ---- стіни Лаври ---- */
  const props=[];
  let propId=0;
  function prop(t,x,y,o={}){
    const p={id:propId++,t,x:x+0.5,y:y+0.5,s:!!o.s,loot:o.loot||null,looted:false,meta:o.meta||null};
    props.push(p);return p;
  }
  for(let x=141;x<=154;x++){ if(x>=146&&x<=149)continue; prop('wall_m',x,163,{s:1}); prop('wall_m',x,187,{s:1}); }
  for(let y=164;y<=186;y++){ prop('wall_m',141,y,{s:1}); if(y!==175&&y!==176)prop('wall_m',154,y,{s:1}); }
  prop('gate_m',148,163,{s:0});
  /* ---- будівлі по районах (Kenney City Kit footprints) ---- */
  const CATS={
    khrus:[1,1],khrus2:[1,1],panel9:[2,2],panel9b:[2,2],hist2:[1,1],hist2b:[1,1],hist2c:[1,1],hist3:[2,1],
    admin3:[3,2],admin4:[3,2],shop1:[1,1],shop2:[1,1],factory:[3,2],factory2:[3,2],garage:[1,1],
    khrus_dmg:[1,1],panel9_dmg:[2,2],hist_ruin:[1,1],
  };
  const POOL={khrus:6,khrus2:4,panel9:4,panel9b:3,hist2:6,hist2b:4,hist2c:4,hist3:4,admin3:3,admin4:3,shop1:3,shop2:4,factory:4,factory2:4,garage:4,khrus_dmg:4,panel9_dmg:3,hist_ruin:3};
  const blds=[];
  const ZB={
    0:['panel9','panel9b','khrus','khrus2','shop1','panel9_dmg'],
    1:['hist2','hist2b','hist2c','hist3','shop1','khrus'],
    2:['hist2','hist3','hist2b','hist2c','admin3','hist_ruin'],
    3:['admin4','admin3','shop2','hist3'],
    4:['admin4','admin3'],
    5:['admin3','khrus','panel9b','shop1'],
    8:['panel9','panel9b','khrus','khrus2','shop2','panel9_dmg'],
    10:['factory','factory2','garage','factory2','garage'],
    11:['admin3','factory','garage','hist_ruin'],
  };
  function nearRoadOrWater(x,y,w,d){
    for(let yy=y-1;yy<=y+d;yy++)for(let xx=x-1;xx<=x+w;xx++){
      if(!inb(xx,yy))return true;
      const t=ter[idx(xx,yy)];
      /* заборонено тільки дорога/вода/рейки/площа. Тротуар/бруківка — це фасад, будуємо впритул */
      if(t===T.road||t===T.water||t===T.rail||t===T.plaza||blk[idx(xx,yy)])return true;
    }
    return false;
  }
  /* фасад: хочемо будівлю впритул до тротуару/бруківки (як у справжньому місті) */
  function hasFrontage(x,y,w,d){
    for(let yy=y-1;yy<=y+d;yy++)for(let xx=x-1;xx<=x+w;xx++){
      if(!inb(xx,yy))continue;
      const t=ter[idx(xx,yy)];
      if(t===T.sidewalk||t===T.pave||t===T.cobble)return true;
    }
    return false;
  }
  for(let gy=6;gy<H-8;gy+=8)for(let gx=6;gx<W-8;gx+=8){
    const z=zone[idx(gx+2,gy+2)];
    const list=ZB[z];if(!list)continue;
    /* малі будівлі Kenney (1x1/2x1) — до 4 будівель на блок, щоб місто було щільним */
    let placed=0;
    for(let tr=0;tr<6&&placed<4;tr++){
      const rr=hsh(gx,gy,901+tr*7);
      const cat=(rr<0.06&&z!==10)?'khrus_dmg':(rr<0.11&&z!==10?'hist_ruin':list[ri(0,list.length-1)]);
      const [w,d]=CATS[cat];
      const jx=gx+ri(0,7-w),jy=gy+ri(0,7-d);
      if(nearRoadOrWater(jx,jy,w,d))continue;
      /* перші 4 спроби вимагають фасаду; останні 2 — будь-де в блоці */
      if(tr<4&&!hasFrontage(jx,jy,w,d))continue;
      let free=true;
      for(let yy=jy;yy<jy+d&&free;yy++)for(let xx=jx;xx<jx+w;xx++){if(blk[idx(xx,yy)]){free=false;break;}}
      if(!free)continue;
      for(let yy=jy;yy<jy+d;yy++)for(let xx=jx;xx<jx+w;xx++){ter[idx(xx,yy)]=T.concrete;blk[idx(xx,yy)]=1;}
      const b={cat,x:jx,y:jy,wT:w,dT:d,zone:z,mural:false,var:ri(0,(POOL[cat]||1)-1)};
      blds.push(b);
      placed++;
      if((cat==='panel9'||cat==='panel9b')&&hsh(jx,jy,44)<0.28){b.mural=true;}
      /* лут-пропси біля будівель */
      const lx=jx+ri(0,w-1),ly=jy+d;
      if(inb(lx,ly)&&!blk[idx(lx,ly)]&&ter[idx(lx,ly)]!==T.water){
        const r=hsh(lx,ly,60);
        if(r<0.2)prop('dumpster',lx,ly,{s:1,loot:'dumpster'});
        else if(r<0.34)prop('crate',lx,ly,{s:1,loot:'crate'});
        else if(r<0.42)prop('barrels',lx,ly,{s:1,loot:'barrels'});
      }
    }
  }
  /* ---- ключові лут-точки та декор ---- */
  const put=[
    ['shelf',47,44,{s:1,loot:'pharmacy'}],['shelf',49,46,{s:1,loot:'pharmacy'}],['kiosk',48,45,{s:1}],
    ['shelf',118,153,{s:1,loot:'market'}],['shelf',120,153,{s:1,loot:'market'}],['shelf',122,151,{s:1,loot:'market'}],
    ['hole',64,141,{s:0,loot:'gate'}],['hole',151,186,{s:0,loot:'caves'}],['hole',152,199,{s:0,loot:'museum'}],
    ['hole',66,105,{s:0,loot:'podil'}],['hole',98,120,{s:0,loot:'andrew'}],
    ['barrels',66,52,{s:1,loot:'barrels'}],['barrels',68,52,{s:1,loot:'barrels'}],['tank',62,50,{s:1}],
    ['cache',69,146,{s:1,loot:'cache'}],['cache',30,30,{s:0,loot:'flat'}],
    ['cache',205,159,{s:1,loot:'cache'}],['cache',197,61,{s:1,loot:'cache'}],
    ['cache',69,200,{s:1,loot:'cache'}],['cache',101,104,{s:1,loot:'cache'}],
    ['cache',135,186,{s:1,loot:'cache'}],['cache',150,199,{s:0,loot:'cache'}],
    ['cache',211,141,{s:1,loot:'cache'}],['cache',99,92,{s:1,loot:'cache'}],
    ['cache',143,150,{s:1,loot:'cache'}],['cache',109,148,{s:1,loot:'cache'}],
    ['bench',86,130,{s:1}],['bench',92,136,{s:1}],['fountain',84,133,{s:1}],['statue',87,136,{s:1}],
    ['bench',136,146,{s:1}],['fountain',136,147,{s:1}],['fountain',147,147,{s:1}],
    ['tree_o',112,128,{s:0}],['tree_o',116,142,{s:0}],['tree_o2',124,156,{s:0}],['bush',114,136,{s:0}],
    ['tree_o',134,170,{s:0}],['tree_o',142,166,{s:0}],['pine',130,200,{s:0}],['tree_o2',148,180,{s:0}],
    ['swing',36,30,{s:1}],['slide',38,31,{s:1}],['bench',37,33,{s:1}],['wreck1',35,32,{s:1}],
    ['swing',192,52,{s:1}],['slide',194,53,{s:1}],['wreck2',193,55,{s:1}],
    ['dumpster',33,34,{s:1,loot:'dumpster'}],['dumpster',196,58,{s:1,loot:'dumpster'}],
    ['traff',119,150,{s:1}],['traff',131,151,{s:1}],['busstop',115,153,{s:1}],['busstop',125,150,{s:1}],
    ['barr',116,151,{s:1}],['barr',121,151,{s:1}],['barr',126,151,{s:1}],['sandbag',118,149,{s:1}],['sandbag',124,153,{s:1}],
    ['wreck1',114,152,{s:1}],['wreck2',123,152,{s:1}],['wreck1',129,151,{s:1}],
    ['barr',139,154,{s:1}],['sandbag',143,156,{s:1}],['wreck2',137,156,{s:1}],
    ['lamp_b',80,90,{s:1}],['kiosk',90,96,{s:1,loot:'crate'}],
    ['pipe',186,166,{s:1}],['pipe',192,172,{s:1}],['chimney',182,158,{s:1}],['chimney',198,150,{s:1}],
    ['tank',190,164,{s:1}],['tank',200,170,{s:1}],['vent',188,178,{s:1}],['cone',196,182,{s:1}],
    ['wreck1',184,172,{s:1}],['wreck2',206,168,{s:1}],['dumpster',200,160,{s:1,loot:'dumpster'}],
    ['vent',70,204,{s:1}],['fence',74,196,{s:1}],['wreck2',60,198,{s:1}],
    ['doorp',36,29,{s:0}],['doorp',100,106,{s:0}],['doorp',71,148,{s:0}],['doorp',158,135,{s:0}],['doorp',198,62,{s:0}],['doorp',206,162,{s:0}],['doorp',69,202,{s:0}],
    ['cone',180,106,{s:0}],['barr',178,103,{s:1}],['sandbag',179,106,{s:1}],
  ];
  for(const[t,x,y,o]of put)prop(t,x,y,o||{});
  /* дерева на траві */
  for(let y=4;y<H-4;y+=2)for(let x=4;x<W-4;x+=2){
    if(ter[idx(x,y)]!==T.grass||blk[idx(x,y)])continue;
    const r=hsh(x,y,808);
    const z=zone[idx(x,y)];
    const p=z===10||z===5?0.05:0.028;
    if(r<p)prop(r<0.02?'tree_o':'tree_o2',x,y,{s:0});
    else if(r<p+0.012)prop('bush',x,y,{s:0});
    else if(r<p+0.02&&(z===10||z===11))prop('dead',x,y,{s:0});
  }
  /* ліхтарі вздовж доріг */
  for(let y=6;y<H-6;y+=5)for(let x=6;x<W-6;x+=5){
    if(ter[idx(x,y)]!==T.sidewalk||blk[idx(x,y)])continue;
    if(hsh(x,y,909)<0.5)prop(hsh(x,y,910)<0.5?'lamp':'lamp_b',x,y,{s:1});
  }
  /* ---- метро: входи-станції ---- */
  const stations=[
    {x:35,y:37,n:'ОБОЛОНЬ'},{x:92,y:97,n:'КОНТРАКТОВА ПЛОЩА'},{x:119,y:153,n:'ХРЕЩАТИК'},
    {x:136,y:154,n:'МАЙДАН НЕЗАЛЕЖНОСТІ'},{x:139,y:171,n:'ПЕЧЕРСЬКА'},
    {x:196,y:102,n:'ЛІВОБЕРЕЖНА'},{x:196,y:183,n:'ДАРНИЦЯ'},{x:66,y:199,n:'ВОКАЗАЛЬНА'},
  ];
  for(const st of stations){prop('metro_m',st.x,st.y,{s:1,meta:st.n});blk[idx(st.x,st.y)]=0;}
  /* ---- підземні переходи ---- */
  const passages=[
    {a:[134,146],b:[148,156],n:'ПІДЗЕМНИЙ ПЕРЕХІД — МАЙДАН'},
    {a:[117,154],b:[127,149],n:'ПІДЗЕМНИЙ ПЕРЕХІД — ХРЕЩАТИК'},
    {a:[104,100],b:[110,92],n:'ПІДЗЕМНИЙ ПЕРЕХІД — ПОДІЛ'},
  ];
  for(const p of passages){prop('stairs',p.a[0],p.a[1],{s:0,meta:'pass'});prop('stairs',p.b[0],p.b[1],{s:0,meta:'pass'});}
  /* ---- схованки (safehouse) ---- */
  const safes=[
    {x:31,y:30,n:'КВАРТИРА МАРКА',z:'ОБОЛОНЬ'},
    {x:101,y:105,n:'ПОДІЛЬСЬКИЙ ПІДВАЛ',z:'ПОДІЛ'},
    {x:70,y:147,n:'СТАРИЙ СКЛАД БІЛЯ ЗОЛОТИХ ВОРІТ',z:'СТАРЕ МІСТО'},
    {x:158,y:134,n:'ТАБІР НА ГІДРОПАРКУ',z:'ГІДРОПАРК'},
    {x:197,y:61,n:'КВАРТИРА НА ЛІВОБЕРЕЖЖІ',z:'ЛІВИЙ БЕРЕГ'},
    {x:205,y:160,n:'СКЛАД У ПРОМЗОНІ',z:'ПРОМЗОНА'},
    {x:68,y:201,n:'ГАРАЖ БІЛЯ ВОКАЗАЛУ',z:'ВОКАЗАЛ'},
  ];
  for(const s of safes)prop('cache',s.x,s.y,{s:0,meta:'safe'});
  /* ---- NPC ---- */
  const npcs=[
    {x:95.5,y:94.5,n:'ВАЛЕНТИНА — ТОРГОВКА',role:'trader'},
    {x:157.5,y:132.5,n:'СЕРГІЙ — ТАБІР',role:'camp'},
    {x:160.5,y:136.5,n:'ОЛЯ — МЕДСЕСТРА',role:'medic'},
    {x:181.5,y:103.5,n:'ПАТОН — ВАРТОВИЙ МОСТУ',role:'guard'},
    {x:196.5,y:62.5,n:'ГАНЯ — ЛІВОБЕРЕЖЖЯ',role:'trader2'},
  ];
  /* ---- радіовежі (сигнали) ---- */
  const towers=[{x:18,y:14,n:'ВИШКА ОБОЛОНЬ'},{x:154,y:126,n:'ВИШКА ГІДРОПАРК'},{x:60,y:133,n:'ВИШКА СТАРОГО МІСТА'},{x:140,y:194,n:'ВИШКА ПЕЧЕРСЬКА'},{x:212,y:142,n:'ВИШКА ДАРНИЦЯ'}];
  /* ---- авто ---- */
  const CARS=IB.SPR.CARS;
  const cars=[];
  function addCar(mdl,x,y,dir,drivable,fuel,hp){cars.push({mdl,x:x+0.5,y:y+0.5,dir,drivable,fuel,hp,broken:!drivable,looted:false});}
  addCar('vaz',33,28,0,true,45,95);  // перше авто біля дому
  addCar('truck',64,48,1,true,60,120);
  for(let y=8;y<H-8;y+=6)for(let x=8;x<W-8;x+=6){
    if(ter[idx(x,y)]!==T.road||brg[idx(x,y)]||hsh(x,y,707)>0.30)continue;
    if(cars.length>=46)break;
    const mdl=['vaz','lanos','skoda','bus','truck'][ri(0,4)];
    const horiz=hsh(x,y,708)<0.5;
    const dir=horiz?(hsh(x,y,709)<0.5?0:2):(hsh(x,y,710)<0.5?1:3);
    addCar(mdl,x,y,dir,hsh(x,y,711)<0.62,15+IB.M.round(55*hsh(x,y,712)),70+IB.M.round(30*hsh(x,y,713)));
  }
  addCar('lanos',116,150,0,false,0,0);addCar('skoda',124,153,2,true,35,88);
  addCar('bus',140,196,1,true,50,110);addCar('vaz',150,199,0,false,0,0);
  addCar('truck',186,161,0,true,70,140);addCar('skoda',182,104,0,true,40,90);
  /* ---- випалени рештки (декор) ---- */
  prop('wreck1',70,44,{s:1});prop('wreck2',44,42,{s:1});prop('wreck1',110,90,{s:1});
  prop('wreck2',86,102,{s:1});prop('wreck1',142,168,{s:1});prop('wreck2',164,176,{s:1});
  prop('corpse',120,148,{s:0});prop('corpse',84,104,{s:0});prop('corpse',138,158,{s:0});prop('corpse',192,168,{s:0});
  /* ---- блокування від пропсів ---- */
  for(const p of props){if(p.s&&inb(p.x|0,p.y|0)){if(blk[idx(p.x|0,p.y|0)]===0)blk[idx(p.x|0,p.y|0)]=1;}}
  /* ---- мінімапа ---- */
  const mm=IB.mk(W,H);const g=mm.g;
  const MC={[T.grass]:'#1c3a1e',[T.park]:'#225028',[T.field]:'#3e4422',[T.sidewalk]:'#3a3f4a',[T.pave]:'#40444e',[T.cobble]:'#3a3830',
    [T.concrete]:'#2e3138',[T.plaza]:'#4e2a20',[T.rubble]:'#2e3138',[T.dirt]:'#3a3228',[T.sand]:'#565638',[T.rail]:'#40404a',[T.water]:'#1c3860',[T.road]:'#4c4c55'};
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){g.fillStyle=MC[ter[idx(x,y)]]||'#1c3a1e';g.fillRect(x,y,1,1);}
  for(const b of blds){g.fillStyle='#5a606c';g.fillRect(b.x,b.y,b.wT,b.dT);}
  for(const l of lms){g.fillStyle='#f0d050';g.fillRect(l.x,l.y,l.wT,l.dT);}
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(elev[idx(x,y)]>=2){g.fillStyle='#ffffff10';g.fillRect(x,y,1,1);}}
  const world={W,H,ter,vrn,rdm,elev,zone,blk,brg,blds,lms,props,cars,stations,passages,safes,npcs,towers,mm,
    bridges:BRIDGES,ridx:idx,inb,
    zoneAt:(x,y)=>inb(x|0,y|0)?zone[idx(x|0,y|0)]:0,
    zoneName:z=>IB.ZONES[z]?IB.ZONES[z].n:'—',
    danger:z=>IB.ZONES[z]?IB.ZONES[z].d:0,
    elevAt:(x,y)=>inb(x|0,y|0)?elev[idx(x|0,y|0)]:0,
    solid:(x,y)=>{x|=0;y|=0;if(!inb(x,y))return true;return blk[idx(x,y)]!==0;},
  };
  IB.WORLD=world;
  return world;
};
