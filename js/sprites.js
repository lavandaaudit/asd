/* IBONARIUM KYIV — all sprites baked procedurally (16-bit Mega Drive style) */
IB.SPR = (function(){
  const P=IB.PAL, M=IB.M;
  const SPR={ground:{},road:[],props:{},cats:{},zomb:{},player:{},cars:{},items:{},big:{},icons:{}};

  /* ---------------- GROUND TILES (32x16) ---------------- */
  function tile(fn,n=1){
    const out=[];
    for(let v=0;v<n;v++){
      const c=IB.mk(32,16),g=c.g;
      g.save();g.beginPath();g.moveTo(16,0);g.lineTo(32,8);g.lineTo(16,16);g.lineTo(0,8);g.closePath();g.clip();
      fn(g,v);g.restore();out.push(c);
    }
    return out;
  }
  function G(g,base,base2,seed,s2){IB.rhomb(g,0,0,32,16,base);IB.speck(g,0,0,32,16,base2,26,seed);if(s2)IB.speck(g,0,0,32,16,s2,8,seed+3);}
  SPR.ground.grass = tile((g,v)=>{G(g,P.g3,P.g4,v,P.g2);if(IB.hsh(v,1,9)<0.55){IB.P(g,8+v*4,6,2,1,P.g5);IB.P(g,14,10+v,2,1,P.g5);}},3);
  SPR.ground.park  = tile((g,v)=>{G(g,P.g3,P.g4,v+11,P.g1);const fl=[P.y4,P.wht,P.rd3][v%3];IB.P(g,6+v*6,5,1,1,fl);IB.P(g,20,9,1,1,fl);IB.P(g,12,11,1,1,fl);},3);
  SPR.ground.field = tile((g,v)=>{G(g,P.sa2,P.sa3,v+21,P.g3);IB.P(g,10+v*3,7,3,1,P.sa1);},2);
  SPR.ground.sidewalk = tile(g=>{IB.rhomb(g,0,0,32,16,P.c2);IB.P(g,0,8,32,1,P.c3);IB.P(g,16,0,1,16,P.c3);IB.P(g,0,0,32,16,P.c2);IB.PA(g,[[16,0],[32,8],[16,16],[0,8]],P.c2);IB.P(g,0,8,32,1,P.c3);IB.P(g,16,0,1,16,P.c3);IB.speck(g,0,0,32,16,P.c1,10,4);});
  SPR.ground.pave  = tile((g,v)=>{IB.rhomb(g,0,0,32,16,P.c3);IB.PA(g,[[0,8],[16,0],[16,16],[0,8]],P.c3);IB.P(g,2,7,12,1,P.c2);IB.P(g,18,7,12,1,P.c2);IB.P(g,8+v*4,2,1,5,P.c2);IB.P(g,22,9,1,5,P.c2);IB.speck(g,0,0,32,16,P.c4,8,v+6);},2);
  SPR.ground.cobble= tile((g,v)=>{IB.rhomb(g,0,0,32,16,P.gr2);for(let i=0;i<14;i++){const x=(IB.hsh(i,v,5)*28)|0,y=(IB.hsh(i,v,6)*12)|0;IB.P(g,x,y+2,3,2,P.gr3);IB.P(g,x,y+3,3,1,P.gr1);}IB.speck(g,0,0,32,16,P.gr1,8,v);},2);
  SPR.ground.concrete=tile((g,v)=>{IB.rhomb(g,0,0,32,16,P.c1);IB.speck(g,0,0,32,16,P.a3,16,v+8);IB.P(g,4,6+v,9,1,P.a1);IB.P(g,20,10,8,1,P.a1);},2);
  SPR.ground.plaza = tile((g,v)=>{IB.rhomb(g,0,0,32,16,P.mn2);IB.PA(g,[[16,2],[28,8],[16,14],[4,8]],P.mn1);IB.PA(g,[[16,4],[24,8],[16,12],[8,8]],P.mn2);IB.P(g,15,7,2,2,P.gr3);IB.speck(g,0,0,32,16,P.c4,5,v+2);},2);
  SPR.ground.rubble= tile((g,v)=>{IB.rhomb(g,0,0,32,16,P.a2);for(let i=0;i<10;i++){const x=4+(IB.hsh(i,v,15)*22)|0,y=3+(IB.hsh(i,v,16)*10)|0;IB.P(g,x,y,2,1,P.gr3);IB.P(g,x+1,y+1,2,1,P.b2);IB.P(g,x,y-1,1,1,P.gr4);}IB.speck(g,0,0,32,16,P.gr2,10,v);},2);
  SPR.ground.dirt  = tile((g,v)=>{G(g,P.b2,P.b3,v+31,P.b1);},2);
  SPR.ground.sand  = tile((g,v)=>{G(g,P.sa2,P.sa3,v+41,P.sa1);},2);
  SPR.ground.rail  = tile(g=>{IB.rhomb(g,0,0,32,16,P.a2);IB.P(g,0,4,32,2,P.gr3);IB.P(g,0,11,32,2,P.gr3);IB.P(g,0,5,32,1,P.m4);IB.P(g,0,12,32,1,P.m4);IB.speck(g,0,0,32,16,P.a3,10,7);});
  SPR.ground.water0= tile(g=>{IB.rhomb(g,0,0,32,16,P.w2);IB.P(g,6,4,9,1,P.w3);IB.P(g,18,9,10,1,P.w3);IB.P(g,3,11,7,1,P.w1);IB.P(g,22,3,6,1,P.w4);});
  SPR.ground.water1= tile(g=>{IB.rhomb(g,0,0,32,16,P.w2);IB.P(g,4,6,11,1,P.w3);IB.P(g,16,4,8,1,P.w3);IB.P(g,8,11,9,1,P.w1);IB.P(g,24,8,5,1,P.w4);});
  SPR.ground.bridge_h = tile(g=>{IB.rhomb(g,0,0,32,16,P.a2);IB.P(g,0,7,32,2,P.a3);IB.P(g,0,4,32,1,P.y3);IB.P(g,0,12,32,1,P.y3);IB.speck(g,0,0,32,16,P.a1,8,9);});
  SPR.ground.bridge_v = tile(g=>{IB.rhomb(g,0,0,32,16,P.a2);IB.PA(g,[[16,0],[24,4],[16,8],[8,4]],P.a3);IB.P(g,10,2,1,2,P.y3);IB.P(g,21,10,1,2,P.y3);IB.P(g,13,12,1,2,P.y3);IB.P(g,18,3,1,2,P.y3);IB.speck(g,0,0,32,16,P.a1,8,9);});
  /* road 16 mask variants: bit1=N(edge NW) bit2=E(NE) bit4=S(SE) bit8=W(SW) */
  for(let m=0;m<16;m++){
    const c=IB.mk(32,16),g=c.g;
    g.save();g.beginPath();g.moveTo(16,0);g.lineTo(32,8);g.lineTo(16,16);g.lineTo(0,8);g.closePath();g.clip();
    IB.rhomb(g,0,0,32,16,P.a2);IB.speck(g,0,0,32,16,P.a3,12,m);IB.speck(g,0,0,32,16,P.a1,10,m+5);
    const bits=[[1,24,4],[2,24,4],[4,24,12],[8,8,12]];
    const cnt=((m&1)?1:0)+((m&2)?1:0)+((m&4)?1:0)+((m&8)?1:0);
    if(cnt==2){
      if((m&3)===3||((m&12)===12)){ /* straight */
        if(m&1){IB.P(g,15,0,2,16,P.c4);IB.P(g,16,1,1,4,P.y4);IB.P(g,16,9,1,4,P.y4);}
        else{IB.P(g,0,8,32,1,P.c4);IB.P(g,3,8,4,1,P.y4);IB.P(g,13,8,4,1,P.y4);IB.P(g,23,8,4,1,P.y4);}
      } else { /* corner curve */
        if((m&2)&&(m&4)){IB.P(g,16,8,10,1,P.y4);IB.P(g,16,4,1,6,P.y4);}
        if((m&2)&&(m&8)){IB.P(g,10,8,12,1,P.y4);}
        if((m&1)&&(m&4)){IB.P(g,16,2,1,12,P.y4);}
        if((m&1)&&(m&8)){IB.P(g,8,6,6,1,P.y4);IB.P(g,14,6,1,8,P.y4);}
      }
    }
    g.restore();SPR.road.push(c);
  }

  /* ---------------- PROPS ---------------- */
  function prop(name,fn){const c=IB.mk(64,64);fn(c.g,32,56);SPR.props[name]={c,ax:32,ay:56};}
  function small(name,w,h,fn){const c=IB.mk(w,h);fn(c.g,w/2,h-2);SPR.props[name]={c,ax:w/2,ay:h-2};}

  prop('tree_o',(g,x,y)=>{IB.P(g,x-2,y-14,4,14,P.b2);IB.P(g,x-1,y-14,1,14,P.b1);
    IB.O(g,x,y-26,13,11,P.g2);IB.O(g,x-7,y-30,9,8,P.g3);IB.O(g,x+7,y-31,9,8,P.g4);IB.O(g,x-2,y-34,8,7,P.g5);IB.O(g,x+2,y-33,5,4,P.g6);IB.speck(g,x-12,y-38,22,16,P.g1,14,3);});
  prop('tree_o2',(g,x,y)=>{IB.P(g,x-2,y-12,3,12,P.b2);IB.O(g,x,y-24,11,10,P.g1);IB.O(g,x-5,y-28,8,7,P.g2);IB.O(g,x+6,y-27,7,6,P.g3);IB.O(g,x,y-31,6,5,P.g4);});
  prop('pine',(g,x,y)=>{IB.P(g,x-2,y-10,4,10,P.b2);
    for(let i=0;i<4;i++){const w=16-i*3,yy=y-10-i*7;IB.PA(g,[[x-w,yy],[x+w,yy],[x,yy-9]],i%2?P.g2:P.g3);}
    IB.PA(g,[[x-4,y-38],[x+4,y-38],[x,y-44]],P.g4);});
  prop('dead',(g,x,y)=>{IB.P(g,x-2,y-18,3,18,P.b1);IB.P(g,x-1,y-18,1,18,P.gr2);
    g.strokeStyle=P.gr2;g.lineWidth=1;g.beginPath();g.moveTo(x-1,y-18);g.lineTo(x-8,y-26);g.moveTo(x-1,y-14);g.lineTo(x+7,y-22);g.moveTo(x-1,y-24);g.lineTo(x+3,y-31);g.stroke();});
  prop('bush',(g,x,y)=>{IB.O(g,x,y-5,9,6,P.g2);IB.O(g,x-4,y-8,6,5,P.g3);IB.O(g,x+4,y-8,5,4,P.g4);IB.O(g,x-1,y-10,4,3,P.g5);});
  prop('bench',(g,x,y)=>{IB.P(g,x-9,y-6,18,3,P.b3);IB.P(g,x-9,y-3,18,2,P.b2);IB.P(g,x-9,y-10,18,2,P.b3);IB.P(g,x-8,y-8,2,2,P.b2);IB.P(g,x+6,y-8,2,2,P.b2);IB.P(g,x-8,y-1,2,2,P.b1);IB.P(g,x+6,y-1,2,2,P.b1);});
  prop('lamp',(g,x,y)=>{IB.P(g,x-1,y-26,2,26,P.m2);IB.P(g,x-2,y-28,4,3,P.m3);IB.P(g,x-3,y-25,6,2,P.m2);IB.O(g,x,y-30,4,3,P.y3);IB.O(g,x,y-30,2,2,P.y4);});
  prop('lamp_b',(g,x,y)=>{IB.P(g,x-1,y-24,2,24,P.m2);IB.P(g,x,y-26,6,2,P.m3);IB.P(g,x+6,y-24,2,4,P.m3);IB.P(g,x-2,y-26,3,2,P.gr2);});
  prop('barr',(g,x,y)=>{for(let i=0;i<3;i++){IB.P(g,x-10+i*2,y-4-i,18-i*2,2,i%2?P.r3:P.wht);}IB.P(g,x-11,y-2,22,3,P.a3);IB.P(g,x-8,y-9,2,8,P.a2);IB.P(g,x+7,y-9,2,8,P.a2);});
  prop('barrels',(g,x,y)=>{IB.O(g,x-4,y-4,4,3,P.ru1);IB.P(g,x-8,y-8,8,6,P.ru2);IB.O(g,x-4,y-8,4,2,P.ru1);IB.O(g,x+5,y-5,4,3,P.ol1);IB.P(g,x+1,y-9,8,6,P.ol2);IB.O(g,x+5,y-9,4,2,P.ol1);IB.P(g,x-4,y-8,1,6,P.gr2);IB.P(g,x+5,y-9,1,6,P.gr2);});
  prop('dumpster',(g,x,y)=>{IB.isoBox(g,x-11,y-10,22,10,9,P.g1,P.g2,P.ol1);IB.P(g,x-9,y-11,18,2,P.ol2);IB.P(g,x-10,y-6,1,5,P.a2);IB.P(g,x+9,y-6,1,5,P.a2);IB.P(g,x-12,y-2,24,1,P.d01);});
  prop('crate',(g,x,y)=>{IB.isoBox(g,x-8,y-7,16,8,7,P.b3,P.b2,P.b1);IB.P(g,x-7,y-6,14,1,P.b4);IB.P(g,x-6,y-3,12,1,P.b1);});
  prop('shelf',(g,x,y)=>{IB.P(g,x-9,y-16,18,16,P.b2);IB.P(g,x-8,y-15,16,1,P.b4);IB.P(g,x-8,y-10,16,1,P.b4);IB.P(g,x-8,y-5,16,1,P.b4);
    for(let i=0;i<4;i++){IB.P(g,x-7+i*4,y-14,2,3,[P.c4,P.g4,P.y3,P.rd3][i%4]);IB.P(g,x-6+i*4,y-9,2,3,[P.m4,P.wht,P.g5][i%3]);}});
  prop('fridge',(g,x,y)=>{IB.isoBox(g,x-6,y-6,12,6,12,P.gr4,P.gr3,P.gr2);IB.P(g,x-4,y-8,2,1,P.gr1);IB.P(g,x-1,y-8,2,1,P.gr1);IB.P(g,x+4,y-10,1,3,P.rd3);});
  prop('wreck1',(g,x,y)=>{IB.O(g,x,y-6,14,7,P.a1);IB.P(g,x-10,y-10,20,6,P.a2);IB.O(g,x,y-10,9,4,P.a1);IB.P(g,x-9,y-11,3,1,P.d01);IB.O(g,x-9,y-4,3,2,P.d02);IB.O(g,x+9,y-4,3,2,P.d02);IB.speck(g,x-9,y-11,18,7,P.ru1,10,2);IB.P(g,x-2,y-14,6,3,P.a1);});
  prop('wreck2',(g,x,y)=>{IB.O(g,x,y-6,12,6,P.d02);IB.P(g,x-9,y-9,18,5,P.a1);IB.O(g,x,y-9,7,3,P.d01);IB.O(g,x-8,y-4,3,2,P.d01);IB.O(g,x+8,y-4,3,2,P.d01);IB.P(g,x-1,y-13,5,2,P.a2);IB.speck(g,x-8,y-10,16,6,P.gr2,12,5);});
  prop('swing',(g,x,y)=>{IB.P(g,x-10,y-14,2,14,P.m2);IB.P(g,x+10,y-14,2,14,P.m2);IB.P(g,x-10,y-14,21,2,P.m3);IB.P(g,x-5,y-12,1,7,P.gr3);IB.P(g,x+4,y-12,1,7,P.gr3);IB.P(g,x-6,y-5,3,2,P.b3);IB.P(g,x+3,y-5,3,2,P.b3);IB.P(g,x-9,y-1,3,2,P.m2);IB.P(g,x+8,y-1,3,2,P.m2);});
  prop('slide',(g,x,y)=>{IB.P(g,x-8,y-14,2,14,P.m2);IB.P(g,x+2,y-14,2,10,P.m2);IB.P(g,x-8,y-16,12,2,P.u3);IB.PA(g,[[x+2,y-12],[x+12,y-2],[x+10,y-1],[x,y-11]],P.y3);IB.P(g,x+12,y-2,3,2,P.m2);});
  prop('kiosk',(g,x,y)=>{IB.isoBox(g,x-10,y-8,20,10,10,P.c3,P.c2,P.c1);IB.P(g,x-8,y-10,16,3,P.rd2);IB.P(g,x-6,y-3,6,5,P.wht);IB.P(g,x-5,y-2,4,3,P.d02);IB.P(g,x+6,y-1,1,2,P.a2);});
  prop('fountain',(g,x,y)=>{IB.O(g,x,y-6,13,7,P.c3);IB.O(g,x,y-6,10,5,P.w3);IB.O(g,x,y-6,5,3,P.w4);IB.P(g,x-1,y-12,3,6,P.c3);IB.O(g,x,y-14,3,2,P.w4);IB.O(g,x,y-15,2,1,P.wht);});
  prop('statue',(g,x,y)=>{IB.isoBox(g,x-6,y-5,12,6,4,P.gr3,P.gr2,P.gr1);IB.P(g,x-2,y-14,4,10,P.m3);IB.P(g,x-3,y-16,7,3,P.m4);IB.P(g,x-1,y-21,3,6,P.m3);IB.O(g,x,y-24,3,2,P.m2);});
  prop('sandbag',(g,x,y)=>{for(let i=0;i<3;i++)IB.O(g,x-8+i*7,y-3,5,3,P.sa1);for(let i=0;i<2;i++)IB.O(g,x-5+i*7,y-6,5,3,P.sa2);IB.O(g,x-1,y-9,5,3,P.sa1);IB.speck(g,x-10,y-10,20,7,P.sa3,10,4);});
  prop('pipe',(g,x,y)=>{IB.P(g,x-14,y-5,28,4,P.ru1);IB.P(g,x-14,y-5,28,1,P.ru2);IB.P(g,x-14,y-2,28,1,P.d01);IB.P(g,x-14,y-6,3,2,P.m2);IB.P(g,x+11,y-6,3,2,P.m2);});
  prop('tank',(g,x,y)=>{IB.isoBox(g,x-12,y-9,24,10,14,P.m2,P.m1,P.gr2);IB.O(g,x,y-9,12,5,P.m3);IB.O(g,x,y-9,8,3,P.m2);IB.P(g,x-12,y-3,24,1,P.ru1);});
  prop('chimney',(g,x,y)=>{IB.P(g,x-4,y-34,8,34,P.r2);IB.P(g,x-4,y-34,2,34,P.r3);IB.P(g,x-4,y-34,8,3,P.r1);IB.P(g,x-2,y-28,2,3,P.d01);IB.P(g,x+1,y-20,2,3,P.d01);IB.speck(g,x-4,y-34,8,32,P.d01,10,8);});
  prop('doorp',(g,x,y)=>{IB.P(g,x-5,y-14,10,14,P.b1);IB.P(g,x-4,y-13,8,13,P.d02);IB.P(g,x-2,y-8,4,7,P.y1);IB.P(g,x-5,y-15,10,1,P.gr2);});
  prop('stairs',(g,x,y)=>{IB.PA(g,[[x-8,y-2],[x+8,y-2],[x+4,y-12],[x-4,y-12]],P.d01);IB.P(g,x-4,y-11,8,1,P.gr2);IB.P(g,x-4,y-8,8,1,P.gr2);IB.P(g,x-4,y-5,8,1,P.gr2);IB.P(g,x-7,y-3,2,2,P.y3);IB.P(g,x+5,y-3,2,2,P.y3);});
  prop('cache',(g,x,y)=>{IB.isoBox(g,x-6,y-6,12,7,5,P.ol1,P.ol2,P.ol1);IB.P(g,x-3,y-8,6,3,P.y3);IB.P(g,x-2,y-9,1,1,P.y4);IB.P(g,x+2,y-9,1,1,P.y4);});
  prop('corpse',(g,x,y)=>{IB.O(g,x,y-3,9,4,P.zd2);IB.O(g,x+4,y-2,5,3,P.zd2);IB.P(g,x-6,y-5,8,3,P.ol1);IB.O(g,x+6,y-5,3,3,P.zd);IB.speck(g,x-8,y-6,16,6,P.rd1,8,3);});
  prop('fence',(g,x,y)=>{for(let i=-12;i<=12;i+=6){IB.P(g,i+x-1,y-9,2,9,P.m1);}IB.P(g,x-13,y-8,26,1,P.m2);IB.P(g,x-13,y-4,26,1,P.m2);IB.speck(g,x-12,y-9,24,9,P.ru1,6,2);});
  prop('wall_s',(g,x,y)=>{IB.P(g,x-14,y-10,28,10,P.gr2);IB.P(g,x-14,y-10,28,2,P.gr3);IB.speck(g,x-14,y-8,28,8,P.gr1,14,9);IB.P(g,x-14,y-1,28,1,P.d01);});
  prop('wall_m',(g,x,y)=>{IB.P(g,x-14,y-12,28,12,P.c4);IB.P(g,x-14,y-12,28,2,P.wht);IB.P(g,x-14,y-3,28,2,P.c3);IB.speck(g,x-14,y-10,28,9,P.c3,8,11);IB.P(g,x-14,y-1,28,1,P.d01);});
  prop('gate_m',(g,x,y)=>{IB.P(g,x-16,y-18,6,18,P.c4);IB.P(g,x+10,y-18,6,18,P.c4);IB.P(g,x-16,y-20,32,3,P.c3);IB.P(g,x-10,y-14,20,14,P.d02);IB.P(g,x-8,y-12,4,4,P.y3);IB.P(g,x+4,y-12,4,4,P.y3);IB.P(g,x-2,y-22,4,5,P.y3);IB.O(g,x,y-24,3,2,P.y4);IB.P(g,x-16,y-24,32,1,P.d01);});
  prop('metro_m',(g,x,y)=>{IB.P(g,x-8,y-14,16,14,P.r2);IB.P(g,x-8,y-14,16,2,P.r3);IB.P(g,x-6,y-11,12,11,P.d02);IB.P(g,x-3,y-9,7,7,P.y3);IB.P(g,x-1,y-8,3,5,P.r2);IB.P(g,x-3,y-7,7,1,P.r2);});
  prop('hydrant',(g,x,y)=>{IB.P(g,x-2,y-8,4,8,P.rd2);IB.O(g,x,y-9,3,2,P.rd3);IB.P(g,x-4,y-5,8,2,P.rd2);});
  prop('busstop',(g,x,y)=>{IB.P(g,x-10,y-10,20,10,P.c4);IB.P(g,x-10,y-10,20,2,P.u3);IB.P(g,x-9,y-3,18,2,P.gr3);IB.P(g,x-10,y,20,1,P.gr2);IB.P(g,x-11,y-11,2,11,P.m2);IB.P(g,x+9,y-11,2,11,P.m2);IB.speck(g,x-8,y-7,16,4,P.c3,6,5);});
  prop('traff',(g,x,y)=>{IB.P(g,x-1,y-22,2,22,P.m2);IB.P(g,x-2,y-24,5,9,P.d02);IB.O(g,x,y-22,1.5,1.5,P.rd3);IB.O(g,x,y-19,1.5,1.5,P.y3);IB.O(g,x,y-16,1.5,1.5,P.g5);});
  prop('antenna',(g,x,y)=>{IB.P(g,x-1,y-18,1,18,P.m3);IB.P(g,x-5,y-14,10,1,P.m2);IB.P(g,x-3,y-11,7,1,P.m2);IB.P(g,x-6,y-18,2,2,P.rd3);});
  prop('vent',(g,x,y)=>{IB.isoBox(g,x-6,y-5,12,6,5,P.gr3,P.gr2,P.gr1);IB.speck(g,x-5,y-8,10,4,P.gr1,6,3);});
  prop('solar',(g,x,y)=>{IB.PA(g,[[x-9,y-4],[x,y-10],[x+9,y-4],[x,y+1]],P.u2);IB.P(g,x-6,y-5,5,2,P.u3);IB.P(g,x+1,y-7,5,2,P.u3);IB.P(g,x-1,y-2,3,2,P.m2);});
  prop('hole',(g,x,y)=>{IB.O(g,x,y-2,10,5,P.d01);IB.O(g,x-3,y-3,5,3,P.blk);IB.speck(g,x-8,y-4,16,4,P.gr1,6,7);});
  prop('cone',(g,x,y)=>{IB.PA(g,[[x-3,y],[x+3,y],[x,y-9]],P.or1);IB.P(g,x-2,y-3,4,1,P.wht);IB.P(g,x-4,y,8,1,P.rd2);});

  /* ---------------- BUILDING CATEGORIES ---------------- */
  function winFace(g,A,B,hh,cols,rows,dark,lit,seed,skip=0.2){
    for(let r=0;r<rows;r++)for(let c2=0;c2<cols;c2++){
      if(IB.hsh(c2,r,seed)<skip)continue;
      const u=(c2+0.15)/cols, uw=0.7/cols, v=(r+0.12)/rows, vh=0.62/rows;
      const ax=IB.lerp(A[0],B[0],u),ay=IB.lerp(A[1],B[1],u)+v*hh;
      const bx=IB.lerp(A[0],B[0],u+uw)-ax, by=IB.lerp(A[1],B[1],u+uw)-ay;
      const on=IB.hsh(c2,r,seed+9)<0.14;
      IB.PA(g,[[ax,ay],[ax+bx,ay+by],[ax+bx,ay+by+vh*hh],[ax,ay+vh*hh]],on?lit:dark);
      if(on)IB.PA(g,[[ax,ay],[ax+bx,ay+by],[ax+bx,ay+by+vh*hh*0.3],[ax,ay+vh*hh*0.3]],IB.shade(lit,-0.2));
    }
  }
  function bakeCat(name,wT,dT,hpx,fn){const W=(wT+dT)*16+4,H=(wT+dT)*8+hpx+8;const c=IB.mk(W,H);fn(c.g,wT,dT,hpx);SPR.cats[name]=c;}
  function bldShell(g,wT,dT,hpx,ct,cl,cr){
    const N=[2+dT*16,8],E=[2+(wT+dT)*16,8+wT*8],S=[2+wT*16,8+(wT+dT)*8],Wc=[2,8+dT*8];
    IB.PA(g,[Wc,S,[S[0],S[1]+hpx],[Wc[0],Wc[1]+hpx]],cl);
    IB.PA(g,[S,E,[E[0],E[1]+hpx],[S[0],S[1]+hpx]],cr);
    IB.PA(g,[N,E,S,Wc],ct);
    return {N,E,S,Wc};
  }
  function mkCat(name,wT,dT,hpx,cols,rows,ct,cl,cr,dark,lit,opt={}){
    bakeCat(name,wT,dT,hpx,(g)=>{
      const f=bldShell(g,wT,dT,hpx,ct,cl,cr);
      winFace(g,f.Wc,f.S,hpx-6,cols,rows,dark,lit,name.length*7+1,opt.skip);
      winFace(g,f.S,f.E,hpx-6,cols,rows,dark,lit,name.length*7+2,opt.skip);
      if(opt.cor)IB.PA(g,[f.Wc,f.S,f.E,[f.E[0],f.E[1]+3],[f.S[0],f.S[1]+5],[f.Wc[0],f.Wc[1]+3]],opt.cor);
      if(opt.roofTile){IB.PA(g,[f.N,f.E,f.S,f.Wc],opt.roofTile);IB.PA(g,[[f.N[0],f.N[1]+2],[f.E[0],f.E[1]+2],[f.S[0],f.S[1]+2],[f.Wc[0],f.Wc[1]+2]],IB.shade(opt.roofTile,0.15));}
      if(opt.vent)IB.isoBox(g,(f.N[0]+f.S[0])/2-4,f.N[1]+4,8,5,4,P.gr2,P.gr1,P.a3);
      if(opt.crack){g.strokeStyle=P.d01;g.beginPath();const cx=f.S[0]-6;g.moveTo(cx,f.S[1]+2);g.lineTo(cx+2,f.S[1]+10);g.lineTo(cx-2,f.S[1]+16);g.stroke();}
      IB.speck(g,0,0,64,64,opt.speck||P.d01,opt.spn||0,3);
    });
  }
  /* Житлові панельки та історичні будинки */
  mkCat('khrus',4,2,52,5,4,P.c2,P.c3,P.c1,P.d02,P.y3,{cor:P.c4,vent:1});
  mkCat('khrus2',5,2,52,6,4,P.b4,P.c3,P.b3,P.d02,P.y3,{cor:P.c4,vent:1,skip:0.28});
  mkCat('panel9',4,2,88,5,7,P.c3,P.c2,P.c1,P.d02,P.y3,{cor:P.c4,vent:1});
  mkCat('panel9b',4,2,88,5,7,P.b4,P.c4,P.b3,P.d02,P.y3,{cor:P.c4,vent:1,skip:0.3});
  mkCat('hist2',3,2,26,3,2,P.r3,P.r4,P.r2,P.d02,P.y3,{roofTile:P.t2,skip:0.25});
  mkCat('hist3',3,2,40,3,3,P.b4,P.c4,P.b3,P.d02,P.y3,{roofTile:P.t1,cor:P.c4});
  mkCat('hist2b',3,2,26,3,2,P.sa2,P.sa3,P.sa1,P.d02,P.y3,{roofTile:P.t3,skip:0.25});
  mkCat('hist2c',3,2,26,3,2,P.g5,P.g6,P.g4,P.d02,P.y3,{roofTile:P.t2,skip:0.25});
  mkCat('admin3',4,3,56,5,3,P.c4,P.c3,P.c2,P.d02,P.y3,{cor:P.wht,skip:0.15});
  mkCat('admin4',5,3,72,6,4,P.c3,P.c4,P.c2,P.d02,P.y3,{cor:P.wht,skip:0.12});
  mkCat('shop1',3,2,20,2,1,P.r3,P.r4,P.r2,P.d02,P.y3,{roofTile:P.t3,skip:0.35});
  mkCat('shop2',3,2,22,2,1,P.u2,P.u3,P.u1,P.d02,P.y3,{roofTile:P.t2,skip:0.35});
  mkCat('factory',6,4,36,6,2,P.r2,P.r3,P.r1,P.d01,P.y2,{roofTile:P.a3,vent:1});
  mkCat('factory2',5,4,44,5,2,P.c2,P.c3,P.c1,P.d01,P.y2,{roofTile:P.a2,vent:1,crack:1});
  mkCat('garage',2,2,14,1,1,P.gr2,P.gr3,P.gr1,P.d01,P.y2,{roofTile:P.a3});
  mkCat('khrus_dmg',4,2,44,5,4,P.c2,P.c3,P.c1,P.d01,P.d02,{vent:1,crack:1,skip:0.55,spn:P.gr2,spn:12});
  mkCat('panel9_dmg',4,2,80,5,7,P.c3,P.c2,P.c1,P.d01,P.d02,{vent:1,crack:1,skip:0.6});
  mkCat('hist_ruin',3,2,18,3,1,P.a3,P.a4,P.a2,P.d01,P.d02,{roofTile:P.a1,crack:1,skip:0.8});

  /* ---------------- ZOMBIES (Kenney palette) ---------------- */
  const ZT={
    walker:{c1:'#515566',c2:'#3a3e4c',skin:'#61cb8b',ex:0},
    runner:{c1:'#cf534f',c2:'#a83a38',skin:'#faae8a',ex:0},
    screamer:{c1:'#3c6cb8',c2:'#2a4a80',skin:'#c9d2e0',ex:0},
    brute:{c1:'#5a6a3a',c2:'#46552e',skin:'#61cb8b',ex:0},
    blind:{c1:'#666b80',c2:'#4a5060',skin:'#a8b0c4',ex:0},
    crawler:{c1:'#4a9a6e',c2:'#3f7a58',skin:'#61cb8b',ex:0},
    guardian:{c1:'#38383d',c2:'#2a2a30',skin:'#61cb8b',ex:1},
    alpha:{c1:'#8a2a3a',c2:'#661e2c',skin:'#cf534f',ex:1},
  };
  function zFront(g,type,ph){
    const T=ZT[type],big=type==='brute'||type==='alpha',low=type==='crawler';
    const bw=big?16:10, bh=big?22:16;
    const cx=32,cy=56;
    if(low){ // crawler horizontal
      IB.O(g,cx,cy-4,10,4,T.c1);IB.O(g,cx-6,cy-6,4,3,T.c1);
      IB.O(g,cx+5,cy-6,4,3,IB.shade(T.c1,0.12));
      IB.O(g,cx+8,cy-7,3,3,T.skin);
      IB.P(g,cx+7,cy-8,1,1,P.rd3);IB.P(g,cx+10,cy-8,1,1,P.rd3);
      IB.P(g,cx-3,cy-2+(ph?1:0),2,3,T.c2);IB.P(g,cx+4,cy-2+(ph?0:1),2,3,T.c2);
      return;
    }
    const top=cy-bh-8-(big?4:0);
    // legs
    IB.P(g,cx-4,cy-8,3,8+((ph&&(type!=='guardian'))?1:0),T.c2);
    IB.P(g,cx+1,cy-8,3,8+(ph?0:1),IB.shade(T.c2,-0.15));
    // torso
    IB.P(g,cx-bw/2,top+6,bw,bh-8,T.c1);
    IB.P(g,cx-bw/2,top+6,2,bh-8,IB.shade(T.c1,-0.2));
    IB.P(g,cx-bw/2+2,top+8,3,4,IB.shade(T.c1,0.15));
    // arms reach forward
    IB.P(g,cx-bw/2-2,top+8,3,8,T.c1);IB.P(g,cx+bw/2-1,top+8,3,8,IB.shade(T.c1,-0.12));
    IB.O(g,cx-bw/2-1,top+16,2,2,T.skin);IB.O(g,cx+bw/2,top+16,2,2,T.skin);
    // head
    IB.O(g,cx,top+1,bw/2-1,4,T.skin);
    IB.P(g,cx-3,top+1,2,2,P.rd1);IB.P(g,cx+1,top+1,2,2,P.rd1);
    if(type==='screamer'){IB.O(g,cx,top+3,2,2,P.d01);}
    if(type==='blind'){IB.P(g,cx-4,top+1,8,2,'#3a3e4c');}
    if(type==='guardian'){IB.P(g,cx-bw/2-1,top+4,bw+2,3,P.y3);IB.P(g,cx-bw/2-1,top+2,bw+2,2,P.y2);IB.P(g,cx-1,top-3,2,4,P.y3);}
    if(type==='alpha'){IB.O(g,cx,top-3,bw/2,3,P.rd2);IB.P(g,cx-3,top+1,2,2,P.y4);IB.P(g,cx+1,top+1,2,2,P.y4);}
    IB.speck(g,cx-bw/2,top+6,bw,bh-10,P.rd1,big?6:3,4);
  }
  function zSide(g,type,ph,flip){
    const T=ZT[type],big=type==='brute'||type==='alpha';
    const cx=32,cy=56,bh=big?20:15;
    if(type==='crawler'){
      IB.O(g,cx,cy-4,11,4,T.c1);IB.O(g,cx-7,cy-6,4,3,T.skin);
      IB.P(g,cx-8,cy-7,1,1,P.rd3);
      IB.P(g,cx+4,cy-2+(ph?1:0),3,3,T.c2);IB.P(g,cx-2,cy-2+(ph?0:1),3,3,T.c2);
      return;
    }
    const top=cy-bh-8-(big?4:0);
    IB.P(g,cx-3,cy-8,3,8+(ph?1:0),T.c2);
    IB.P(g,cx,cy-8,3,8+(ph?0:1),IB.shade(T.c2,-0.15));
    IB.P(g,cx-4,top+7,8,bh-9,T.c1);
    IB.P(g,cx-4,top+7,2,bh-9,IB.shade(T.c1,-0.18));
    IB.P(g,cx+2,top+9,4,7,T.skin); // reaching arms
    IB.O(g,cx+4,top+15,2,2,T.skin);
    IB.O(g,cx+1,top+2,4,4,T.skin);
    IB.P(g,cx+2,top+2,1,1,P.rd1);
    if(type==='guardian'){IB.P(g,cx-5,top+4,10,3,P.y3);IB.P(g,cx+2,top-2,2,4,P.y3);}
    if(type==='alpha'){IB.O(g,cx,top-3,4,3,P.rd2);}
    if(flip){/* mirrored at draw time */}
  }
  for(const t in ZT){
    const f1=IB.mk(64,60),f2=IB.mk(64,60),s1=IB.mk(64,60),s2=IB.mk(64,60);
    zFront(f1.g,t,0);zFront(f2.g,t,1);zSide(s1.g,t,0);zSide(s2.g,t,1);
    SPR.zomb[t]={f:[f1,f2],s:[s1,s2]};
  }

  /* ---------------- PLAYER + NPC (Kenney colors) ---------------- */
  function mkPlayerFrame(dir,ph,mode,pal){
    const c=IB.mk(64,64),g=c.g;const cx=32,cy=58;
    pal=pal||{};
    const J=pal.J||P.u2,Jd=pal.Jd||P.u1,Jl=pal.Jl||IB.shade(P.u2,0.18),B=pal.B||P.a2,Bd=pal.Bd||P.a1;
    const SK=pal.SK||P.sk1,HR=pal.HR||P.b2;
    const top=cy-30;
    // legs (jeans)
    const lp=ph?2:0;
    if(dir==='side'){IB.P(g,cx-3,cy-10+lp,4,10,Bd);IB.P(g,cx,cy-10,4,10-lp,B);}
    else{IB.P(g,cx-4,cy-10+lp,4,10,B);IB.P(g,cx+1,cy-10,4,10-lp,Bd);}
    IB.P(g,cx-4,cy-1,4,2,P.d01);IB.P(g,cx+1,cy-1,4,2,P.d01); // boots
    // torso jacket
    IB.P(g,cx-6,top+7,12,14,J);
    IB.P(g,cx-6,top+7,3,14,Jd);
    IB.P(g,cx+3,top+9,3,12,Jl);
    // backpack
    if(dir==='back'){IB.P(g,cx-4,top+8,9,9,P.b2);IB.P(g,cx-3,top+8,7,2,P.b3);}
    if(dir==='side'){IB.P(g,cx-7,top+8,4,8,P.b2);}
    // head
    IB.O(g,cx,top+2,5,4,SK);
    IB.P(g,cx-5,top-1,10,4,HR); // hair
    IB.P(g,cx-5,top-1,10,1,IB.shade(HR,0.18));
    if(dir==='front'){IB.P(g,cx-3,top+2,1,2,P.d02);IB.P(g,cx+2,top+2,1,2,P.d02);}
    if(dir==='side'){IB.P(g,cx+2,top+2,1,2,P.d02);}
    // arms
    if(mode==='attack'){
      IB.P(g,cx+5,top+8,4,3,Jl); // arm raised
      g.strokeStyle=P.m4;g.lineWidth=2;g.beginPath();
      g.moveTo(cx+7,top+9);g.lineTo(cx+14,top+2);g.stroke();
      IB.P(g,cx+13,top,3,3,P.m4);
    } else if(mode==='gun'){
      IB.P(g,cx+5,top+10,4,3,Jl);
      IB.P(g,cx+8,top+10,6,3,P.d01);IB.P(g,cx+13,top+10,3,2,P.gr3);
    } else {
      IB.P(g,cx-8,top+9,3,8,Jd);IB.P(g,cx+6,top+9,3,8,J);
      if(dir==='side'&&ph)IB.P(g,cx+7,top+9+lp,3,8-lp,Jl);
    }
    return c;
  }
  ['F','B','R','L'].forEach(d=>{
    const dir=d==='F'?'front':d==='B'?'back':'side';
    const flip=d==='L';
    const f=[];
    for(let ph=0;ph<2;ph++){
      let c=mkPlayerFrame(dir,ph,'walk');f.push(c);
    }
    f.push(mkPlayerFrame(dir,0,'attack'));
    f.push(mkPlayerFrame(dir,0,'gun'));
    SPR.player[d]=f;
  });

  /* NPC-варіанти (роль -> палітра): торговка, медик, табір, вартовий, Ганя */
  const NPCPAL={
    trader:{J:'#a878e8',Jd:'#8a5ac4',Jl:'#c09af0',B:'#515566',Bd:'#3a3e4c',HR:'#38383d'},
    medic:{J:'#f4f4f8',Jd:'#c9d2e0',Jl:'#ffffff',B:'#3c6cb8',Bd:'#2a4a80',HR:'#b06041'},
    camp:{J:'#ff7e44',Jd:'#c95c30',Jl:'#ffa070',B:'#515566',Bd:'#3a3e4c',HR:'#4a3a24'},
    guard:{J:'#4a9a6e',Jd:'#3f7a58',Jl:'#6cc98e',B:'#38383d',Bd:'#2a2a30',HR:'#38383d'},
    trader2:{J:'#ffc044',Jd:'#c89428',Jl:'#ffd878',B:'#7a8a4a',Bd:'#5a6a3a',HR:'#38383d'},
  };
  SPR.npcs={};
  for(const role in NPCPAL){
    const f=[];
    for(let ph=0;ph<2;ph++)f.push(mkPlayerFrame('front',ph,'walk',NPCPAL[role]));
    SPR.npcs[role]=f;
  }

  /* ---------------- CARS (Kenney colors) ---------------- */
  const CARS={
    vaz:  {name:'ВАЗ-2101', body:'#e8e4dc', roof:'#f4f4f8', dark:P.gr2, max:7.5, fuelUse:1.0, hp:90},
    lanos:{name:'Daewoo Lanos', body:'#6794d9', roof:'#7ba4e0', dark:P.gr2, max:8, fuelUse:1.0, hp:85},
    skoda:{name:'Skoda', body:'#61cb8b', roof:'#7ad8a0', dark:P.gr2, max:8.5, fuelUse:0.9, hp:95},
    bus:  {name:'Мікроавтобус', body:'#c9b38a', roof:'#dbcaa0', dark:P.gr2, max:6.5, fuelUse:1.6, hp:120},
    truck:{name:'Вантажівка', body:'#666b80', roof:'#7e869c', dark:P.gr2, max:5.5, fuelUse:2.0, hp:150},
  };
  function carSprite(model,headingNE,damaged){
    const c=IB.mk(64,40),g=c.g;const T=CARS[model];
    const cx=32,cy=26,dir=headingNE?1:-1;
    const body=T.body,roof=T.roof,dark=T.dark;
    const smoke=damaged;
    function bodyPts(l,w){ // l along heading, w across (iso skew)
      return [[cx-dir*l*0.45,cy-w*0.5-4],[cx+dir*l*0.55,cy+w*0.28-12],[cx+dir*l*0.62,cy+w*0.28-6],[cx+dir*l*0.45,cy+w*0.5],[cx-dir*l*0.55,cy+w*0.5-2],[cx-dir*l*0.62,cy+w*0.5-8]];
    }
    // shadow
    IB.O(g,cx,cy,17,8,P.blk);
    g.globalAlpha=0.35;IB.O(g,cx,cy,17,8,'#000');g.globalAlpha=1;
    // wheels
    IB.O(g,cx-dir*9,cy+1,4,3,P.d01);IB.O(g,cx+dir*9,cy+1,4,3,P.d01);
    IB.O(g,cx-dir*7,cy-9,4,3,P.d01);IB.O(g,cx+dir*7,cy-9,4,3,P.d01);
    // body lower
    IB.PA(g,[[cx-dir*15,cy-2],[cx+dir*15,cy-10],[cx+dir*16,cy-4],[cx+dir*13,cy+2],[cx-dir*14,cy+4],[cx-dir*16,cy-2]],body);
    IB.PA(g,[[cx-dir*15,cy-2],[cx+dir*15,cy-10],[cx+dir*15,cy-8],[cx-dir*15,cy]],IB.shade(body,-0.15));
    // cabin
    IB.PA(g,[[cx-dir*6,cy-9],[cx+dir*7,cy-13],[cx+dir*6,cy-16],[cx-dir*5,cy-12]],roof);
    IB.PA(g,[[cx-dir*5,cy-12],[cx+dir*6,cy-16],[cx+dir*4,cy-12],[cx-dir*3,cy-9]],'#38383d'); // windshield
    IB.PA(g,[[cx+dir*6,cy-13],[cx+dir*8,cy-10],[cx+dir*6,cy-8],[cx+dir*5,cy-12]],'#2a2e3a'); // side window
    // lights
    if(headingNE){IB.P(g,cx+dir*15,cy-9,2,2,P.y4);}else{IB.P(g,cx-dir*16,cy-3,2,2,P.y4);}
    IB.P(g,cx-dir*(headingNE?15:16),cy-(headingNE?10:4),2,1,'#ff7e44');
    if(damaged){IB.speck(g,cx-14,cy-14,28,14,P.d01,14,3);IB.P(g,cx-4,cy-10,6,3,P.a1);IB.P(g,cx+2,cy-6,4,2,P.gr1);}
    return c;
  }
  for(const mdl in CARS){
    SPR.cars[mdl]={
      ne:carSprite(mdl,true,false), se:carSprite(mdl,false,false),
      ne_d:carSprite(mdl,true,true), se_d:carSprite(mdl,false,true),
    };
  }
  // burnt wrecks
  (function(){
    const c=IB.mk(64,40),g=c.g;const cx=32,cy=26;
    IB.O(g,cx,cy,16,8,'#00000044');IB.O(g,cx,cy-4,15,7,P.d02);IB.PA(g,[[cx-14,cy-3],[cx+14,cy-9],[cx+13,cy-2],[cx-12,cy+2]],P.a1);
    IB.PA(g,[[cx-5,cy-8],[cx+6,cy-11],[cx+5,cy-13],[cx-4,cy-10]],P.d01);IB.O(g,cx-9,cy,3,2,P.d01);IB.O(g,cx+9,cy,3,2,P.d01);
    IB.speck(g,cx-13,cy-12,26,14,P.ru1,14,7);IB.P(g,cx-2,cy-14,5,3,P.a2);
    SPR.cars.wreck={ne:c,se:null};
    const c2=IB.mk(64,40),g2=c2.g;const x=32,y=26;
    IB.O(g2,x,y,14,7,'#00000044');IB.PA(g2,[[x-13,y-2],[x+12,y-8],[x+11,y-1],[x-11,y+3]],P.a1);IB.PA(g2,[[x-4,y-7],[x+5,y-9],[x+4,y-11],[x-3,y-9]],P.d01);
    IB.speck(g2,x-12,y-11,24,13,P.gr2,16,9);IB.O(g2,x-8,y+1,3,2,P.d01);IB.O(g2,x+8,y+1,3,2,P.d01);
    SPR.cars.wreck2={ne:c2,se:null};
  })();

  /* ---------------- ITEMS ---------------- */
  const IT={
    food:{n:'Консерви',c:P.ol2,d:'+40 їжі'},water:{n:'Вода 0.5л',c:P.u3,d:'+45 води'},
    stew:{n:'Тушонка',c:P.b3,d:'+60 їжі'},energy:{n:'Енергетик',c:P.u2,d:'+40 витривалості'},
    mask:{n:'Протигаз',c:P.or1,d:'Одягнути: промзона без шкоди'},
    medkit:{n:'Аптечка',c:P.wht,d:'+55 HP'},bandage:{n:'Бинт',c:'#d8d0c0',d:'+25 HP'},
    pills:{n:'Знеболювальне',c:P.y4,d:'+15 HP, +10 ST'},
    ammo:{n:'Патрони 9мм',c:P.y3,d:'Пістолет'},fuel:{n:'Каністра пального',c:P.rd2,d:'Пальне 40%'},
    parts:{n:'Запчастини',c:P.m3,d:'Ремонт'},battery:{n:'Батарейки',c:P.gr3,d:'Ліхтар'},
    alcohol:{n:'Спирт',c:P.c4,d:'Крафт'},cloth:{n:'Ганчірки',c:P.b4,d:'Крафт'},
    bottle:{n:'Пляшка',c:P.g5,d:'Крафт'},grenade:{n:'Граната РГД',c:P.g2,d:'Вибух'},
    radio_p:{n:'Підсилювач сигналу',c:P.y4,d:'Для вежі'},keycard:{n:'Ключ-картка',c:P.u3,d:'Доступ'},
    docs:{n:'Документи',c:P.b4,d:'Архіви'},pump_p:{n:'Частина насоса',c:P.m4,d:'Вода для табору'},
  };
  function itemIcon(fn){const c=IB.mk(24,22);fn(c.g,12,11);return c;}
  const ICD={
    food:g=>{IB.isoBox(g,4,4,12,6,5,P.ol2,P.ol1,P.ol2);IB.P(g,6,5,8,2,P.y3);IB.P(g,7,9,3,1,P.gr3);},
    stew:g=>{IB.isoBox(g,4,4,13,7,6,P.b3,P.b2,P.b1);IB.P(g,6,5,9,2,P.y4);IB.P(g,8,9,6,3,P.b4);IB.P(g,9,10,4,1,P.rd3);},
    energy:g=>{IB.P(g,8,3,7,13,P.u2);IB.P(g,9,2,5,2,P.m4);IB.P(g,9,5,2,8,P.u3);IB.P(g,8,12,7,3,P.u1);IB.P(g,10,6,4,2,P.y4);},
    mask:g=>{IB.O(g,12,12,6,5,P.or1);IB.O(g,12,12,3,2,P.d02);IB.P(g,5,6,3,2,P.gr3);IB.P(g,16,6,3,2,P.gr3);IB.P(g,7,7,2,4,P.gr4);IB.P(g,15,7,2,4,P.gr4);},
    water:g=>{IB.P(g,8,3,7,12,P.u2);IB.P(g,9,2,5,2,P.c4);IB.P(g,9,5,2,8,P.u3);IB.P(g,8,10,7,3,P.u1);},
    medkit:g=>{IB.isoBox(g,4,4,14,7,7,P.wht,P.c4,P.gr4);IB.P(g,9,5,4,7,P.rd3);IB.P(g,7,7,9,3,P.rd3);},
    bandage:g=>{IB.O(g,12,11,7,5,'#d8d0c0');IB.O(g,12,11,4,2,P.b4);IB.P(g,5,9,14,1,P.gr3);},
    pills:g=>{IB.P(g,7,5,10,10,P.y4);IB.P(g,8,6,8,3,P.d02);IB.P(g,9,10,2,3,P.wht);IB.P(g,13,10,2,3,P.wht);},
    ammo:g=>{IB.isoBox(g,5,4,12,6,5,P.g2,P.g3,P.g1);IB.P(g,7,6,3,3,P.y3);IB.P(g,12,6,3,3,P.y3);},
    fuel:g=>{IB.P(g,6,4,11,12,P.rd2);IB.P(g,8,3,4,2,P.rd3);IB.P(g,7,6,9,1,P.y4);IB.P(g,9,8,5,5,P.wht);},
    parts:g=>{IB.O(g,9,10,4,4,P.m3);IB.O(g,9,10,2,2,P.d02);IB.P(g,13,4,4,8,P.m2);IB.P(g,11,4,8,2,P.m4);},
    battery:g=>{IB.P(g,7,5,4,11,P.gr3);IB.P(g,13,5,4,11,P.gr2);IB.P(g,7,4,4,2,P.m4);IB.P(g,13,4,4,2,P.m4);},
    alcohol:g=>{IB.P(g,8,4,8,13,P.c4);IB.P(g,9,2,6,3,P.gr4);IB.P(g,9,7,6,6,P.wht);},
    cloth:g=>{IB.PA(g,[[5,6],[17,5],[19,12],[7,14]],P.b4);IB.P(g,8,8,6,1,P.b3);IB.P(g,10,11,6,1,P.b3);},
    bottle:g=>{IB.P(g,9,5,6,12,P.g5);IB.P(g,10,3,4,3,P.g6);IB.P(g,10,8,2,7,P.g4);},
    grenade:g=>{IB.O(g,12,12,5,5,P.g2);IB.P(g,10,4,4,4,P.m3);IB.P(g,13,6,5,2,P.gr3);IB.O(g,9,7,2,2,P.m2);},
    radio_p:g=>{IB.P(g,5,8,14,7,P.gr3);IB.P(g,7,4,2,5,P.m4);IB.P(g,11,3,2,6,P.m2);IB.O(g,15,10,2,2,P.rd3);IB.P(g,6,9,3,2,P.y3);},
    keycard:g=>{IB.P(g,6,6,12,9,P.u3);IB.P(g,7,7,10,3,P.u2);IB.P(g,8,11,5,2,P.y4);},
    docs:g=>{IB.P(g,6,4,12,13,P.b4);IB.P(g,7,5,10,2,P.b3);IB.P(g,7,9,10,1,P.gr1);IB.P(g,7,12,8,1,P.gr1);},
    pump_p:g=>{IB.O(g,12,11,6,6,P.m4);IB.O(g,12,11,3,3,P.m2);IB.P(g,6,6,4,4,P.gr3);IB.P(g,14,3,3,5,P.m3);},
  };
  for(const id in IT){SPR.items[id]={c:itemIcon(ICD[id]),d:IT[id]};}
  SPR.itemsDB=IT;

  /* ---------------- HUD ICONS ---------------- */
  SPR.icons.machete=(()=>{const c=IB.mk(26,22),g=c.g;g.strokeStyle=P.gr4;g.lineWidth=2;g.beginPath();g.moveTo(5,17);g.lineTo(13,10);g.stroke();g.strokeStyle=P.m4;g.beginPath();g.moveTo(13,10);g.lineTo(21,4);g.stroke();IB.P(g,4,16,4,3,P.b3);return c;})();
  SPR.icons.pistol=(()=>{const c=IB.mk(26,22),g=c.g;IB.P(g,6,8,12,4,P.d02);IB.P(g,16,9,6,3,P.gr3);IB.P(g,7,12,4,6,P.b2);IB.P(g,6,8,12,1,P.gr3);return c;})();
  SPR.icons.medkit=SPR.items.medkit.c;
  SPR.icons.grenade=SPR.items.grenade.c;
  SPR.face=(()=>{const c=IB.mk(46,46),g=c.g;
    IB.P(g,0,0,46,46,P.d02);
    IB.P(g,8,8,30,36,P.sk1);
    IB.P(g,8,8,30,10,P.b2);IB.P(g,8,6,30,4,P.b3);IB.P(g,6,10,3,14,P.b2);IB.P(g,37,10,3,14,P.b2);
    IB.P(g,14,22,5,4,P.wht);IB.P(g,27,22,5,4,P.wht);IB.P(g,16,23,2,3,P.u1);IB.P(g,29,23,2,3,P.u1);
    IB.P(g,18,32,10,2,P.sk3);IB.P(g,21,36,4,2,P.sk2);
    IB.speck(g,10,34,26,8,P.sk3,10,2);
    IB.P(g,0,40,46,6,P.ol2);IB.P(g,0,40,46,1,P.ol1);
    return c;})();

  SPR.CARS=CARS;
  return SPR;
})();
