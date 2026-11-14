/* IBONARIUM KYIV — gfx.js: ізометричний рендер, освітлення, мапи, компас */
IB.cam={x:31.5,y:31.5,shake:0};
IB.wx=(x,y)=>(x-y)*16;
IB.wy=(x,y)=>(x+y)*8;
IB.CAMW=320;IB.CAMH=224;

IB.GFX=(function(){
  const P=IB.PAL,M=IB.M;
  const lightC=IB.mk(IB.CAMW,IB.CAMH);

  /* ---- мурал (тризуб + КИЇВ) ---- */
  (function(){
    const c=IB.mk(64,52),g=c.g;
    IB.P(g,4,4,56,44,P.c3);IB.P(g,4,4,56,3,P.c4);IB.P(g,4,45,56,3,P.c2);
    IB.P(g,8,8,48,36,P.u2);IB.P(g,8,30,48,14,P.y4);
    const tx=24,ty=12;
    IB.P(g,tx-5,ty,3,14,P.y4);IB.P(g,tx+3,ty,3,14,P.y4);IB.P(g,tx-1,ty-3,3,18,P.y4);
    IB.P(g,tx-4,ty+12,9,3,P.y4);
    const L={'К':[[0,0],[0,1],[0,2],[0,3],[0,4],[1,2],[2,1],[2,3]],'И':[[0,0],[0,1],[0,2],[0,3],[0,4],[1,2],[2,0],[2,1],[2,2],[2,3],[2,4]],'Ї':[[0,0],[1,0],[2,0],[1,1],[1,2],[1,3],[1,4]],'В':[[0,0],[0,1],[0,2],[0,3],[0,4],[1,0],[2,1],[1,2],[2,3],[1,4]]};
    let ox=36;
    for(const ch of 'КИЇВ'){for(const p of (L[ch]||[]))IB.P(g,ox+p[0],24+p[1],1,1,P.wht);ox+=4;}
    IB.speck(g,4,4,56,44,P.gr1,14,4);
    if(!IB.SPR.props.mural)IB.SPR.props.mural={c,ax:32,ay:50};
  })();
  /* ---- іконка молотова ---- */
  (function(){
    if(!IB.SPR.itemsDB.molotov)IB.SPR.itemsDB.molotov={n:'КОКТЕЛЬ МОЛОТОВА',c:P.y3,d:'Кинути: пожежа'};
    const c=IB.mk(24,22),g=c.g;
    IB.P(g,9,4,6,13,P.g5);IB.P(g,10,2,4,3,P.g6);IB.P(g,10,7,2,8,P.g4);
    IB.P(g,9,2,7,3,P.b4);IB.O(g,13,1,2,2,P.rd3);IB.O(g,13,0,1.4,1.4,P.y4);
    IB.SPR.items.molotov={c,d:IB.SPR.itemsDB.molotov};
    if(!IB.SPR.icons.molotov)IB.SPR.icons.molotov=c;
  })();

  /* ---------- видимі межі тайлів ---------- */
  function tileBounds(csx,csy){
    const a=csx/16,b=csy/8;
    const cxs=[a,a+20],cys=[b,b+28];
    let minTx=1e9,maxTx=-1e9,minTy=1e9,maxTy=-1e9;
    for(const A of cxs)for(const B of cys){
      const tx=(A+B)/2,ty=(B-A)/2;
      minTx=IB.M.min(minTx,tx);maxTx=IB.M.max(maxTx,tx);
      minTy=IB.M.min(minTy,ty);maxTy=IB.M.max(maxTy,ty);
    }
    return [IB.M.max(0,IB.M.floor(minTx)-1),IB.M.min(223,IB.M.ceil(maxTx)+1),
            IB.M.max(0,IB.M.floor(minTy)-1),IB.M.min(223,IB.M.ceil(maxTy)+1)];
  }

  /* ---------- земля ---------- */
  function drawGround(g){
    const W=IB.WORLD,PL=IB.PL,T=IB.TER;
    if(!W)return;
    const px=PL?(PL.car?PL.car.x:PL.x):IB.cam.x, py=PL?(PL.car?PL.car.y:PL.y):IB.cam.y;
    const csx=IB.wx(px,py)-IB.CAMW/2, csy=IB.wy(px,py)-IB.CAMH/2-20;
    const shx=IB.cam.shake>0?IB.rnd(-2,2):0, shy=IB.cam.shake>0?IB.rnd(-1.5,1.5):0;
    const[b0,b1,c0,c1]=tileBounds(csx,csy);
    for(let ty=c0;ty<=c1;ty++){
      for(let tx=b0;tx<=b1;tx++){
        const i=W.ridx(tx,ty);
        const sx=IB.wx(tx,ty)-csx+shx, sy=IB.wy(tx,ty)-csy+shy-W.elev[i]*14;
        if(sx<-36||sx>IB.CAMW+36||sy<-36||sy>IB.CAMH+36)continue;
        const tt=W.ter[i],vr=W.vrn[i];
        if(tt===T.road){
          if(W.brg[i])g.drawImage(IB.SPR.ground.bridge_h[0],sx-16,sy-8);
          else{const ri2=W.rdm[i];const rimg=IB.SPR.road[ri2]||IB.SPR.road[0];g.drawImage(rimg,sx-16,sy-8);}
        } else {
          let arr;
          if(tt===T.water)arr=[IB.SPR.ground.water0[0],IB.SPR.ground.water1[0]];
          else arr=IB.SPR.ground[['grass','park','field','sidewalk','pave','cobble','concrete','plaza','rubble','dirt','sand','rail'][tt]];
          if(!arr)continue;
          let v=vr%arr.length;
          if(tt===T.water)v=(IB.M.floor(Date.now()/700)+((tx*7+ty*13)&1))%arr.length;
          g.drawImage(arr[v],sx-16,sy-8);
        }
        /* скелі-обриви: південні сусіди нижчі */
        const e=W.elev[i];
        if(e>0){
          const s1=W.inb(tx+1,ty)?W.elev[W.ridx(tx+1,ty)]:e;
          const s2=W.inb(tx,ty+1)?W.elev[W.ridx(tx,ty+1)]:e;
          const hh1=(e-s1)*14, hh2=(e-s2)*14;
          if(hh1>0){IB.PA(g,[[sx,sy+8],[sx+16,sy+16],[sx+16,sy+16+hh1],[sx,sy+8+hh1]],'#241d18');IB.P(g,sx+15,sy+16,1,hh1,'#3a2f26');}
          if(hh2>0){IB.PA(g,[[sx,sy+8],[sx-16,sy+16],[sx-16,sy+16+hh2],[sx,sy+8+hh2]],'#1a1410');}
        }
      }
    }
  }

  /* ---------- сутності ---------- */
  function drawScene(g){
    const W=IB.WORLD,PL=IB.PL,E=IB.ENTS;
    if(!W||!PL)return;
    const px=PL.car?PL.car.x:PL.x, py=PL.car?PL.car.y:PL.y;
    const csx=IB.wx(px,py)-IB.CAMW/2, csy=IB.wy(px,py)-IB.CAMH/2-20;
    const shx=IB.cam.shake>0?IB.rnd(-2,2):0, shy=IB.cam.shake>0?IB.rnd(-1.5,1.5):0;
    const lights=[];
    const items=[];
    const[b0,b1,c0,c1]=tileBounds(csx,csy);
    /* будівлі (варіанти Kenney: cat_0..cat_N) */
    for(const b of W.blds){
      if(b.x<b0-9||b.x>b1+2||b.y<c0-9||b.y>c1+2)continue;
      items.push({s:b.x+b.wT-1+b.y+b.dT-1,f:(gg)=>{
        const c=IB.SPR.cats[b.cat+'_'+(b.var!=null?b.var:0)]||IB.SPR.cats[b.cat];if(!c)return;
        const e=W.elevAt(b.x,b.y);
        gg.drawImage(c,IB.wx(b.x,b.y)-csx-(2+b.dT*16)+shx,IB.wy(b.x,b.y)-csy-e*14-8+shy);
        if(b.mural){
          const mr=IB.SPR.props.mural;
          const mx=b.x+b.wT/2,my=b.y+b.dT;
          gg.drawImage(mr.c,IB.wx(mx,my)-csx-mr.ax+shx,IB.wy(mx,my)-csy-mr.ay+shy-2);
        }
      }});
    }
    /* локації-домінанти */
    for(const l of W.lms){
      if(l.x<b0-11||l.x>b1+2||l.y<c0-11||l.y>c1+2)continue;
      items.push({s:l.x+l.wT-1+l.y+l.dT-1,f:(gg)=>{
        const c=IB.LM[l.key];if(!c)return;
        const e=W.elevAt(l.x,l.y);
        const ay=c.c.height-((l.wT+l.dT)*8+c.hpx);
        gg.drawImage(c.c,IB.wx(l.x,l.y)-csx-(2+l.dT*16)+shx,IB.wy(l.x,l.y)-csy-e*14-ay+shy);
      }});
    }
    /* пропси */
    for(const pr of W.props){
      const prx=pr.x|0,pry=pr.y|0;
      if(prx<b0||prx>b1||pry<c0||pry>c1)continue;
      let sp=IB.SPR.props[pr.t];
      if(pr.t==='crate'&&IB.SPR.cratePool){
        const ci=IB.SPR.cratePool[(pr.id||0)%IB.SPR.cratePool.length];
        if(ci&&ci.width)sp={c:ci,ax:ci.width/2,ay:ci.height};
      }
      if(!sp)continue;
      const e=W.elevAt(prx,pry);
      items.push({s:pr.x+pr.y-0.5,f:(gg)=>{
        gg.drawImage(sp.c,IB.wx(pr.x,pr.y)-csx-sp.ax+shx,IB.wy(pr.x,pr.y)-csy-e*14-sp.ay+shy);
      }});
      if(pr.t==='lamp'||pr.t==='lamp_b'){if(IB.nightFactor()>0.12)lights.push({x:pr.x,y:pr.y,r:4.4});}
      if(pr.t==='metro_m')lights.push({x:pr.x,y:pr.y,r:2.6});
      if(pr.t==='kiosk'&&IB.nightFactor()>0.3)lights.push({x:pr.x,y:pr.y,r:2.2});
    }
    /* авто */
    const flipMap={0:['se',true],1:['se',false],2:['ne',true],3:['ne',false]};
    for(const c of W.cars){
      const cx2=c.x|0,cy2=c.y|0;
      if(cx2<b0||cx2>b1||cy2<c0||cy2>c1)continue;
      items.push({s:c.x+c.y-0.4,f:(gg)=>{
        const spr=IB.SPR.cars[c.mdl];
        const set=c.broken?IB.SPR.cars.wreck:spr;
        const[key,fl]=flipMap[c.dir];
        let img=set[key]||set.ne;
        if(!c.broken&&c.hp<IB.SPR.CARS[c.mdl].hp*0.45&&set[key+'_d'])img=set[key+'_d'];
        const e=W.elevAt(cx2,cy2);
        const sx=IB.wx(c.x,c.y)-csx-32+shx, sy=IB.wy(c.x,c.y)-csy-e*14-26+shy;
        if(fl){gg.save();gg.translate(sx+32,sy);gg.scale(-1,1);gg.drawImage(img,-32,0);gg.restore();}
        else gg.drawImage(img,sx,sy);
        if(c.engine&&!c.broken){ /* дим з вихлопа */
          if(IB.rnd(0,1)<0.2)E.parts.push({x:c.x,y:c.y,vx:IB.rnd(-0.3,0.3),vy:IB.rnd(-0.3,0.3),ttl:0.5,c:'#606a78'});
        }
      }});
    }
    /* заражені */
    for(const z of E.zombies){
      const zx=z.x|0,zy=z.y|0;
      if(zx<b0||zx>b1||zy<c0||zy>c1)continue;
      items.push({s:z.x+z.y-0.3,f:(gg)=>{
        const sp=IB.SPR.zomb[z.type];if(!sp)return;
        const fr=IB.M.floor(z.anim)%2;
        const dx=PL.x-z.x,dy=PL.y-z.y;
        const side=IB.M.abs(dx)>IB.M.abs(dy)*1.15&&z.state==='chase';
        const img=side?sp.s[fr]:sp.f[fr];
        const e=W.elevAt(zx,zy);
        const sx=IB.wx(z.x,z.y)-csx-32+shx, sy=IB.wy(z.x,z.y)-csy-e*14-56+shy;
        if(side&&dx<0){gg.save();gg.translate(sx+32,sy);gg.scale(-1,1);gg.drawImage(img,-32,0);gg.restore();}
        else gg.drawImage(img,sx,sy);
      }});
    }
    /* NPC */
    for(const np of W.npcs){
      const nx=np.x|0,ny=np.y|0;
      if(nx<b0||nx>b1||ny<c0||ny>c1)continue;
      items.push({s:np.x+np.y-0.3,f:(gg)=>{
        const set=(IB.SPR.npcs&&IB.SPR.npcs[np.role])||IB.SPR.player.F;
        const img=set[IB.M.floor(Date.now()/500)%2];
        const e=W.elevAt(nx,ny);
        const sx=IB.wx(np.x,np.y)-csx-32+shx, sy=IB.wy(np.x,np.y)-csy-e*14-58+shy;
        gg.drawImage(img,sx,sy);
        gg.fillStyle='#0b0d14cc';gg.font='5px monospace';gg.textAlign='center';
        gg.fillText(np.n.split(' — ')[0],IB.wx(np.x,np.y)-csx+shx,sy-6);
      }});
    }
    /* гравець */
    if(!PL.car&&PL.alive){
      items.push({s:PL.x+PL.y,f:(gg)=>{
        const set=IB.SPR.player[PL.dirKey];
        let img;
        if(IB.MAIN&&IB.MAIN.attackAnim>0)img=set[2];
        else if(IB.MAIN&&IB.MAIN.shootAnim>0)img=set[3];
        else img=PL.moving?set[IB.M.floor(PL.anim)%2]:set[0];
        const e=W.elevAt(PL.x|0,PL.y|0);
        gg.drawImage(img,IB.wx(PL.x,PL.y)-csx-32+shx,IB.wy(PL.x,PL.y)-csy-e*14-58+shy);
      }});
    }
    /* підбори */
    for(const pk of E.pickups){
      items.push({s:pk.x+pk.y-0.9,f:(gg)=>{
        const it=IB.SPR.items[pk.item];if(!it)return;
        const bob=IB.M.sin(pk.bob)*1.5;
        gg.drawImage(it.c,IB.wx(pk.x,pk.y)-csx-12+shx,IB.wy(pk.x,pk.y)-csy-26+bob+shy);
      }});
    }
    /* пожежі */
    for(const f of E.fires){
      items.push({s:f.x+f.y-0.5,f:(gg)=>{
        const x=IB.wx(f.x,f.y)-csx+shx,y=IB.wy(f.x,f.y)-csy+shy;
        for(let i=0;i<5;i++){
          const h=6+IB.rnd(0,8),ox=IB.rnd(-6,6);
          IB.PA(gg,[[x+ox-2,y],[x+ox+2,y],[x+ox,y-h]],i%2?'#f0d050':'#b83424');
        }
      }});
      lights.push({x:f.x,y:f.y,r:3.6,flick:true});
    }
    items.sort((a,b)=>a.s-b.s);
    for(const it of items)it.f(g);
    /* трасери */
    g.strokeStyle='#f0d050aa';g.lineWidth=1;
    for(const b of E.bullets){
      g.beginPath();g.moveTo(IB.wx(b.x,b.y)-csx,IB.wy(b.x,b.y)-csy-6);
      g.lineTo(IB.wx(b.x,b.y)-csx-b.vx*0.03,IB.wy(b.x,b.y)-csy-b.vy*0.03-6);g.stroke();
    }
    /* частинки */
    for(const q of E.parts){g.fillStyle=q.c;g.fillRect(IB.wx(q.x,q.y)-csx-1,IB.wy(q.x,q.y)-csy-4,2,2);}
    /* кидки */
    for(const th of E.throws){
      const ix=IB.lerp(th.x,th.tx,th.t),iy=IB.lerp(th.y,th.ty,th.t);
      const h=IB.M.sin(th.t*Math.PI)*18;
      IB.O(g,IB.wx(ix,iy)-csx,IB.wy(ix,iy)-csy-h,2,2,th.kind==='grenade'?'#3c5a3c':'#d0ac28');
    }
    /* --- нічне освітлення --- */
    const nf=IB.nightFactor();
    if(nf>0.04){
      const lg=lightC.g;
      lg.clearRect(0,0,IB.CAMW,IB.CAMH);
      lg.fillStyle='rgba(8,10,30,'+(nf*0.84).toFixed(2)+')';
      lg.fillRect(0,0,IB.CAMW,IB.CAMH);
      lg.globalCompositeOperation='destination-out';
      function hole(wx2,wy2,rT,str){
        const x=IB.wx(wx2,wy2)-csx,y=IB.wy(wx2,wy2)-csy-8;
        const r=rT*16;
        if(x<-r||x>IB.CAMW+r||y<-r||y>IB.CAMH+r)return;
        const gr=lg.createRadialGradient(x,y,2,x,y,r);
        gr.addColorStop(0,'rgba(0,0,0,'+(str||0.9)+')');
        gr.addColorStop(1,'rgba(0,0,0,0)');
        lg.fillStyle=gr;lg.beginPath();lg.arc(x,y,r,0,7);lg.fill();
      }
      for(const L of lights)hole(L.x,L.y,L.r*(L.flick?0.85+IB.rnd(0,0.3):1),0.85);
      if(PL.flash&&!PL.car){
        for(let i=1;i<=4;i++)hole(PL.x+PL.fx*i*1.1,PL.y+PL.fy*i*1.1,2.4,0.5);
      }
      if(PL.car&&PL.car.engine){
        const dv=[[1,0],[-1,0],[0,1],[0,-1]][PL.car.dir];
        for(let i=1;i<=3;i++)hole(PL.car.x+dv[0]*i*1.3,PL.car.y+dv[1]*i*1.3,2.6,0.8);
        hole(PL.car.x,PL.car.y,2.2,0.5);
      }
      if(IB.MAIN&&IB.MAIN.muzzleT>0)hole(PL.x,PL.y,3.4,0.95);
      lg.globalCompositeOperation='source-over';
      g.drawImage(lightC,0,0);
    }
  }

  /* ---------- HUD: мінімапа ---------- */
  function drawMinimapHUD(g){
    const W=IB.WORLD,PL=IB.PL,G=IB.G;
    if(!W||!PL)return;
    g.imageSmoothingEnabled=false;
    g.fillStyle='#07080d';g.fillRect(0,0,96,96);
    const sx=IB.clamp(PL.x-22,0,W.W-44),sy=IB.clamp(PL.y-22,0,W.H-44);
    g.drawImage(W.mm,sx,sy,44,44,0,0,96,96);
    function mark(wx2,wy2,col,tri){
      const x=(wx2-sx)*96/44,y=(wy2-sy)*96/44;
      if(x<2||x>94||y<2||y>94)return;
      g.fillStyle=col;
      if(tri){g.beginPath();g.moveTo(x,y-4);g.lineTo(x+4,y+3);g.lineTo(x-4,y+3);g.closePath();g.fill();}
      else g.fillRect(x-2,y-2,4,4);
    }
    const m=IB.MISSIONS[G.mi];
    if(m&&!G.ending){
      const tx=(m.two&&G.flags['m6a']&&m.x2!==undefined)?m.x2:m.x,ty=(m.two&&G.flags['m6a']&&m.y2!==undefined)?m.y2:m.y;
      mark(tx+0.5,ty+0.5,'#f0d050',true);
    }
    for(const s of W.safes)mark(s.x,s.y,'#4ee06a');
    for(const tw of W.towers)if(IB.dist(PL.x,PL.y,tw.x,tw.y)<26)mark(tw.x,tw.y,IB.M.floor(Date.now()/400)%2?'#38b8d8':'#1a5a70');
    if(G.flags.drop)mark(G.flags.drop.x,G.flags.drop.y,'#e04a3a');
    const pxx=(PL.x-sx)*96/44,pyy=(PL.y-sy)*96/44;
    g.fillStyle=IB.M.floor(Date.now()/300)%2?'#ffffff':'#d6dae6';
    g.fillRect(pxx-2,pyy-2,4,4);
    g.strokeStyle='#ffffff';g.beginPath();g.moveTo(pxx,pyy);g.lineTo(pxx+PL.fx*6,pyy+PL.fy*6);g.stroke();
    g.strokeStyle='#3c4356';g.strokeRect(0.5,0.5,95,95);
  }

  /* ---------- HUD: компас ---------- */
  function drawCompass(g){
    const PL=IB.PL,G=IB.G,W=IB.WORLD;
    g.clearRect(0,0,176,18);
    g.fillStyle='#0b0d14cc';g.fillRect(0,0,176,18);
    if(!PL||!W)return;
    const center=IB.M.atan2(PL.fx,-PL.fy);
    function rel(b){let r=b-center;while(r>IB.M.PI)r-=2*IB.M.PI;while(r<-IB.M.PI)r+=2*IB.M.PI;return r;}
    g.font='7px monospace';g.textAlign='center';
    for(const[lt,b]of[['N',0],['E',IB.M.PI/2],['S',IB.M.PI],['W',-IB.M.PI/2]]){
      const x=88+rel(b)*52;
      if(x>6&&x<170){g.fillStyle=lt==='N'?'#e04a3a':'#8a92a8';g.fillText(lt,x,9);}
    }
    function mk(b,col,shape){
      const x=88+rel(b)*52;
      if(x<6||x>170)return;
      g.fillStyle=col;
      if(shape==='d'){g.beginPath();g.moveTo(x,11);g.lineTo(x+3,14);g.lineTo(x,17);g.lineTo(x-3,14);g.closePath();g.fill();}
      else g.fillRect(x-2,12,4,4);
    }
    const m=IB.MISSIONS[G.mi];
    if(m&&!G.ending){
      const tx=(m.two&&G.flags['m6a']&&m.x2!==undefined)?m.x2:m.x,ty=(m.two&&G.flags['m6a']&&m.y2!==undefined)?m.y2:m.y;
      mk(IB.M.atan2(tx+0.5-PL.x,-(ty+0.5-PL.y)),'#f0d050','d');
    }
    let ns=null,nsd=1e9;
    for(const s of W.safes){const d=IB.dist(PL.x,PL.y,s.x,s.y);if(d<nsd){nsd=d;ns=s;}}
    if(ns)mk(IB.M.atan2(ns.x-PL.x,-(ns.y-PL.y)),'#4ee06a');
    for(const tw of W.towers){
      if(IB.dist(PL.x,PL.y,tw.x,tw.y)<26)mk(IB.M.atan2(tw.x-PL.x,-(tw.y-PL.y)),IB.M.floor(Date.now()/400)%2?'#38b8d8':'#1a5a70');
    }
    if(G.flags.drop)mk(IB.M.atan2(G.flags.drop.x-PL.x,-(G.flags.drop.y-PL.y)),'#e04a3a');
    g.strokeStyle='#3c4356';g.strokeRect(0.5,0.5,175,17);
  }

  /* ---------- велика карта ---------- */
  const ANCH=[[36,36],[95,95],[90,140],[120,150],[142,152],[140,175],[147,176],[151,199],[196,70],[155,128],[196,185],[70,205],[152,90]];
  function drawBigMap(g){
    const W=IB.WORLD,PL=IB.PL,G=IB.G;
    g.imageSmoothingEnabled=false;
    g.fillStyle='#07080d';g.fillRect(0,0,600,480);
    if(!W)return;
    g.drawImage(W.mm,0,0,W.W,W.H,76,8,448,448);
    g.strokeStyle='#3c4356';g.strokeRect(75.5,7.5,449,449);
    g.font='8px monospace';g.textAlign='left';
    for(let z=0;z<IB.ZONES.length&&z<ANCH.length;z++){
      const a=ANCH[z],x=76+a[0]*2,y=8+a[1]*2;
      g.fillStyle=G.visited[z]?'#f0d050':'#5a6175';
      g.fillText(G.visited[z]?IB.ZONES[z].n:'???',IB.clamp(x-20,80,480),IB.clamp(y,20,452));
    }
    function mk(wx2,wy2,col,tri){
      const x=76+wx2*2,y=8+wy2*2;
      g.fillStyle=col;
      if(tri){g.beginPath();g.moveTo(x,y-6);g.lineTo(x+6,y+4);g.lineTo(x-6,y+4);g.closePath();g.fill();}
      else g.fillRect(x-3,y-3,6,6);
    }
    const m=IB.MISSIONS[G.mi];
    if(m&&!G.ending){
      const tx=(m.two&&G.flags['m6a']&&m.x2!==undefined)?m.x2:m.x,ty=(m.two&&G.flags['m6a']&&m.y2!==undefined)?m.y2:m.y;
      mk(tx+0.5,ty+0.5,'#f0d050',true);
    }
    for(const s of W.safes)mk(s.x,s.y,'#4ee06a');
    for(const tw of W.towers)mk(tw.x,tw.y,'#38b8d8');
    if(G.flags.drop)mk(G.flags.drop.x,G.flags.drop.y,'#e04a3a');
    g.fillStyle='#cfd4e2';g.font='7px monospace';
    g.fillText('▲ ЦІЛЬ    ⌂ СХОВАНКА    ((•)) РАДІОВЕЖА    ▮ РАЙОН',80,472);
    if(PL){
      const px=76+PL.x*2,py=8+PL.y*2;
      g.fillStyle=IB.M.floor(Date.now()/300)%2?'#fff':'#d6dae6';
      g.fillRect(px-3,py-3,6,6);
      g.strokeStyle='#fff';g.beginPath();g.moveTo(px,py);g.lineTo(px+PL.fx*10,py+PL.fy*10);g.stroke();
    }
  }

  /* ---------- логотип титулів ---------- */
  function drawLogo(g){
    g.clearRect(0,0,320,150);
    g.fillStyle='#050609';g.fillRect(0,0,320,150);
    g.fillStyle='#10131c';
    g.beginPath();g.moveTo(0,150);
    for(const[bx,by]of[[0,120],[18,120],[18,100],[26,100],[26,88],[34,88],[34,120],[52,120],[52,92],[60,84],[68,92],[68,120],[92,120],[92,104],[104,96],[116,104],[116,120],[140,120],[140,94],[150,86],[160,94],[160,120],[184,120],[184,98],[196,90],[208,98],[208,120],[232,120],[232,80],[238,72],[244,80],[244,120],[268,120],[268,100],[280,100],[280,108],[292,108],[292,120],[320,120]])g.lineTo(bx,by);
    g.lineTo(320,150);g.closePath();g.fill();
    IB.O(g,258,34,16,16,'#1a1f30');IB.O(g,252,30,14,14,'#d6dae6');
    IB.O(g,248,26,3,3,'#b8bcc8');IB.O(g,256,36,2,2,'#b8bcc8');
    function dome2(x,y,r){IB.O(g,x,y,r,r*0.8,P.y2);g.fillStyle=P.y3;g.beginPath();g.ellipse(x,y-r*0.25,r*0.8,r*0.6,0,0,7);g.fill();IB.P(g,x-1,y-r-5,2,5,P.y2);}
    dome2(150,84,5);dome2(160,88,4);dome2(238,70,6);
    g.font='bold 34px monospace';g.textAlign='center';
    g.fillStyle='#7a5a10';g.fillText('IBONARIUM',162,66);
    g.fillStyle='#f0d050';g.fillText('IBONARIUM',160,64);
    g.font='bold 15px monospace';
    g.fillStyle='#0e0f16';g.fillText('K Y I V',161,88);
    g.fillStyle='#e8e8f0';g.fillText('K Y I V',160,87);
    g.font='8px monospace';g.fillStyle='#e04a3a';
    g.fillText('— THE LAST SIGNAL —',160,106);
    g.font='7px monospace';g.fillStyle='#8a92a8';
    g.fillText('OPEN WORLD SURVIVAL • 16-BIT',160,118);
    const tx=160,ty=126;
    g.fillStyle='#f0d050';
    g.fillRect(tx-6,ty,3,12);g.fillRect(tx+4,ty,3,12);g.fillRect(tx-1,ty-3,3,15);g.fillRect(tx-4,ty+10,9,3);
  }

  return {drawGround,drawScene,drawMinimapHUD,drawCompass,drawBigMap,drawLogo};
})();
