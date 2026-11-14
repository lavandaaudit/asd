/* IBONARIUM KYIV — ents.js: гравець, заражені, авто, снаряди, лут */
IB.ENTS={zombies:[],bullets:[],pickups:[],fires:[],throws:[],parts:[],decals:[]};
IB.NOISE=[];
IB.PL=null;

IB.ZSTATS={
  walker:  {hp:80, dmg:10, spd:1.35, sight:7,  n:'WALKER'},
  runner:  {hp:55, dmg:12, spd:3.4,  sight:9,  n:'RUNNER'},
  screamer:{hp:45, dmg:8,  spd:1.6,  sight:8,  n:'SCREAMER'},
  brute:   {hp:240,dmg:26, spd:1.1,  sight:6,  n:'BRUTE'},
  blind:   {hp:70, dmg:9,  spd:1.8,  sight:0,  hear:13, n:'BLIND'},
  crawler: {hp:40, dmg:7,  spd:1.0,  sight:5,  n:'CRAWLER'},
  guardian:{hp:130,dmg:16, spd:1.4,  sight:7,  n:'GUARDIAN'},
  alpha:   {hp:200,dmg:18, spd:1.7,  sight:10, n:'ALPHA'},
};

IB.initEnts=function(){
  const E=IB.ENTS;E.zombies=[];E.bullets=[];E.pickups=[];E.fires=[];E.throws=[];E.parts=[];E.decals=[];IB.NOISE=[];
  const W=IB.WORLD;
  IB.PL={x:31.5,y:31.5,fx:0,fy:1,dirKey:'F',hp:100,st:100,hu:80,wa:80,inv:{ammo:15,food:1,water:1,medkit:1,grenade:1},
    slot:0,car:null,atkCd:0,flash:false,batt:100,alive:true,anim:0,moving:false,hurtT:0,kills:0,shNoise:0};
};

/* ---- спільний рух з колізіями (r=радіус у тайлах) ---- */
IB.moveEnt=function(e,dx,dy,r,climbElev){
  const W=IB.WORLD;
  const ok=(nx,ny)=>{
    for(const[ox,oy]of[[r,0],[-r,0],[0,r],[0,-r],[r*0.7,r*0.7],[-r*0.7,r*0.7],[r*0.7,-r*0.7],[-r*0.7,-r*0.7]]){
      const tx=(nx+ox)|0,ty=(ny+oy)|0;
      if(W.solid(tx,ty))return false;
      const el=W.elevAt(tx,ty),el0=W.elevAt(nx|0,ny|0);
      if(IB.M.abs(el-el0)>1)return false;
    }
    return true;
  };
  if(ok(e.x+dx,e.y))e.x+=dx;
  if(ok(e.x,e.y+dy))e.y+=dy;
  e.x=IB.clamp(e.x,2,W.W-3);e.y=IB.clamp(e.y,2,W.H-3);
};
/* авто не проїдуть через стійки */
IB.carBlocked=function(nx,ny){
  const W=IB.WORLD;const tx=nx|0,ty=ny|0;
  if(W.solid(tx,ty))return true;
  return false;
};

/* ---- інвентар ---- */
IB.addItem=function(id,n=1){
  const p=IB.PL;if(!p)return;
  p.inv[id]=(p.inv[id]||0)+n;
  if(p.inv[id]<=0)delete p.inv[id];
  return true;
};
IB.hasItem=function(id,n=1){return (IB.PL&&IB.PL.inv[id]||0)>=n;};
IB.takeItem=function(id,n=1){
  const p=IB.PL;if(!IB.hasItem(id,n))return false;
  p.inv[id]-=n;if(p.inv[id]<=0)delete p.inv[id];return true;
};

/* ---- заражені ---- */
IB.makeZombie=function(type,x,y,home){
  const s=IB.ZSTATS[type]||IB.ZSTATS.walker;
  const z={type,x,y,hp:s.hp,dmg:s.dmg,spd:s.spd*(0.9+IB.rnd(0,0.25)),sight:s.sight,
    state:'idle',tgt:null,cd:IB.rnd(0,1),anim:IB.rnd(0,1),wT:IB.rnd(1,3),screamed:false,home:home||{x,y},boost:1};
  IB.ENTS.zombies.push(z);return z;
};
IB.hurtZombie=function(z,dmg,kx,ky){
  z.hp-=dmg;z.state='chase';z.tgt={x:IB.PL.x,y:IB.PL.y};
  for(let i=0;i<4;i++)IB.ENTS.parts.push({x:z.x,y:z.y,vx:(kx||0)*2+IB.rnd(-1,1),vy:(ky||0)*2+IB.rnd(-1,1),ttl:0.4,c:'#8c1c18'});
  if(z.hp<=0){
    IB.PL.kills++;IB.AUDIO.sfx('zdie');
    IB.ENTS.decals.push({t:'corpse',x:z.x,y:z.y});
    if(IB.ENTS.decals.length>110)IB.ENTS.decals.shift();
    if(IB.rnd(0,1)<0.38){
      const drop=[['ammo',IB.ri(4,10)],['cloth',1],['bottle',1],['alcohol',1],['food',1],['bandage',1]][IB.ri(0,5)];
      IB.ENTS.pickups.push({item:drop[0],n:drop[1],x:z.x,y:z.y,bob:IB.rnd(0,6)});
    }
    IB.ENTS.zombies.splice(IB.ENTS.zombies.indexOf(z),1);
  }
};
IB.damagePlayer=function(n){
  const p=IB.PL;if(!p.alive)return;
  p.hp-=n;p.hurtT=1;IB.AUDIO.sfx('hurt');
  if(p.hp<=0){p.hp=0;p.alive=false;}
};
IB.fireBullet=function(x,y,dx,dy,dmg){
  IB.ENTS.bullets.push({x,y,vx:dx*16,vy:dy*16,ttl:0.65,dmg});
  IB.AUDIO.sfx('shot');IB.NOISE.push({x,y,r:12,t:'shot'});
  for(let i=0;i<3;i++)IB.ENTS.parts.push({x:x+dx*0.3,y:y+dy*0.3,vx:dx*3+IB.rnd(-0.6,0.6),vy:dy*3+IB.rnd(-0.6,0.6),ttl:0.12,c:'#f0d050'});
};
IB.explode=function(x,y,r,dmg,self){
  IB.AUDIO.sfx('boom');IB.NOISE.push({x,y,r:18,t:'boom'});
  for(let i=0;i<14;i++)IB.ENTS.parts.push({x,y,vx:IB.rnd(-3,3),vy:IB.rnd(-3,3),ttl:IB.rnd(0.2,0.5),c:i%2?'#f0d050':'#b83424'});
  const zs=IB.ENTS.zombies.slice();
  for(const z of zs){const d=IB.dist(x,y,z.x,z.y);if(d<r+0.3)IB.hurtZombie(z,dmg*(1-d/(r+0.3))+20,(z.x-x)/IB.M.max(0.1,d),(z.y-y)/IB.M.max(0.1,d));}
  if(self){const pd=IB.dist(x,y,IB.PL.x,IB.PL.y);if(pd<r)IB.damagePlayer(IB.M.round(45*(1-pd/r)));}
  IB.ENTS.decals.push({t:'scorch',x,y});
};
IB.throwObj=function(kind){
  const p=IB.PL;
  const tx=p.x+p.fx*3.2,ty=p.y+p.fy*3.2;
  IB.ENTS.throws.push({kind,x:p.x,y:p.y,tx,ty,t:0});
};

/* ---- авто ---- */
IB.enterCar=function(car){
  const p=IB.PL;
  if(car.broken||car.fuel<=0){IB.toast('ДВИГУН МЕРТВИЙ — ПОТРІБНЕ ПАЛЬНЕ АБО РЕМОНТ','red');return;}
  p.car=car;car.engine=true;IB.AUDIO.sfx('door');IB.AUDIO.engineStart();IB.toast(car.nameDe||IB.SPR.CARS[car.mdl].name+' — ГОТОВИЙ ДО ВИЇЗДУ');
};
IB.exitCar=function(){
  const p=IB.PL,car=p.car;if(!car)return;
  const dirs=[[0.9,0],[-0.9,0],[0,0.9],[0,-0.9]];
  for(const[ox,oy]of dirs){
    const nx=car.x+ox,ny=car.y+oy;
    if(!IB.WORLD.solid(nx|0,ny|0)&&IB.M.abs(IB.WORLD.elevAt(nx|0,ny|0)-IB.WORLD.elevAt(car.x|0,car.y|0))<=1){p.x=nx;p.y=ny;break;}
  }
  p.car=null;car.engine=false;IB.AUDIO.engineStop();IB.AUDIO.sfx('door');
};

/* ---- оновлення світу ---- */
IB.updateEnts=function(dt){
  const p=IB.PL,E=IB.ENTS,W=IB.WORLD;
  /* шум */
  const noises=IB.NOISE;IB.NOISE=[];
  /* --- гравець --- */
  if(p.alive&&!p.car){
    const inp=IB.Input.moveVec();
    let dx=inp.x,dy=inp.y;
    const run=IB.Input.keys.shift&&p.st>4&&(dx||dy);
    const spd=(run?5.4:2.9)*dt;
    p.moving=!!(dx||dy);
    if(p.moving){
      const l=IB.M.hypot(dx,dy);dx/=l;dy/=l;p.fx=dx;p.fy=dy;
      p.dirKey=IB.M.abs(dx)>IB.M.abs(dy)?(dx>0?'R':'L'):(dy>0?'F':'B');
      IB.moveEnt(p,dx*spd,dy*spd,0.3,true);
      p.anim+=dt*(run?11:6.5);
      p.shNoise+=dt;
      if(p.shNoise>0.5){p.shNoise=0;IB.NOISE.push({x:p.x,y:p.y,r:run?5:2.2,t:'step'});}
    }
    p.st=IB.clamp(p.st+(run?-14:8)*dt,0,100);
    p.atkCd=IB.M.max(0,p.atkCd-dt);
    if(p.flash){p.batt=IB.M.max(0,p.batt-dt*1.2);if(p.batt<=0)p.flash=false;}
  }
  /* --- авто --- */
  if(p.car){
    const car=p.car,spec=IB.SPR.CARS[car.mdl];
    const inp=IB.Input.keys;
    const acc=(inp.w||inp.up)?1:((inp.s||inp.down)?-0.55:0);
    car.v=IB.clamp((car.v||0)+acc*(acc>0?7:9)*dt,spec.max*-0.4,spec.max);
    if(!acc)car.v*=(1-2.2*dt);
    if((inp.a||inp.left)&&car.v!==0){car.stT=(car.stT||0)-dt;if(car.stT<=0){car.dir=(car.dir+3)%4;car.stT=0.16;car.v*=0.86;}}
    if((inp.d||inp.right)&&car.v!==0){car.stT=(car.stT||0)-dt;if(car.stT<=0){car.dir=(car.dir+1)%4;car.stT=0.16;car.v*=0.86;}}
    const dv=[[1,0],[-1,0],[0,1],[0,-1]][car.dir];
    const nx=car.x+dv[0]*car.v*dt,ny=car.y+dv[1]*car.v*dt;
    const eNow=W.elevAt(car.x|0,car.y|0),eNext=W.elevAt((nx+dv[0]*0.5)|0,(ny+dv[1]*0.5)|0);
    if(!IB.carBlocked(nx+dv[0]*0.5,ny+dv[1]*0.5)&&IB.M.abs(eNext-eNow)<=1){
      car.x=nx;car.y=ny;
      /* збиваємо заражених */
      for(const z of E.zombies.slice()){
        if(IB.dist(car.x,car.y,z.x,z.y)<0.85&&IB.M.abs(car.v)>1.5){
          IB.hurtZombie(z,60+IB.M.abs(car.v)*10,dv[0],dv[1]);car.v*=0.9;IB.AUDIO.sfx('hit');
        }
      }
    } else if(IB.M.abs(car.v)>0.8){
      IB.AUDIO.sfx('crash');IB.NOISE.push({x:car.x,y:car.y,r:16,t:'crash'});
      car.hp-=IB.M.abs(car.v)*7;car.v=0;
      for(let i=0;i<6;i++)E.parts.push({x:car.x,y:car.y,vx:IB.rnd(-2,2),vy:IB.rnd(-2,2),ttl:0.3,c:'#90909a'});
      if(car.hp<=0){car.broken=true;car.engine=false;IB.AUDIO.engineStop();IB.exitCar();IB.damagePlayer(15);IB.toast('АВТО ВНЕСЛИ ДО ТЛУНИ — ВОНО БІЛЬШЕ НЕ ПОЇДЕ','red');}
    }
    if(car.engine){
      car.fuel=IB.M.max(0,car.fuel-spec.fuelUse*0.5*dt-IB.M.abs(car.v)*0.02*dt);
      if(car.fuel<=0){car.engine=false;IB.AUDIO.engineStop();IB.toast('ПАЛЬНЕ ЗАКІНЧИЛОСЬ','red');}
      car.engT=(car.engT||0)-dt;
      if(car.engT<=0){car.engT=0.45;IB.NOISE.push({x:car.x,y:car.y,r:6+IB.M.abs(car.v)*1.6,t:'engine'});}
      IB.AUDIO.engineSet(IB.M.abs(car.v)/spec.max);
      if((inp.space)&&car.hornCd!==undefined){} /* horn: */
      p.x=car.x;p.y=car.y;
    }
  }
  /* --- заражені --- */
  const night=IB.nightFactor?IB.nightFactor():0;
  let alphaNear=null;
  for(const z of E.zombies){if(z.type==='alpha'&&IB.dist(z.x,z.y,p.x,p.y)<8){alphaNear=z;break;}}
  for(const zi of E.zombies){
    const z=zi;
    z.cd-=dt;z.anim+=dt*2.4;
    if(alphaNear)z.boost=1.35;else z.boost=1;
    /* реакція на шум */
    for(const nn of noises){
      const d=IB.dist(nn.x,nn.y,z.x,z.y);
      const hear=z.type==='blind'?13:8;
      if(d<IB.M.max(nn.r,hear)){if(z.state!=='chase'){z.state='chase';z.tgt={x:nn.x,y:nn.y};z.lostT=0;}}
    }
    /* зір */
    const pd=IB.dist(z.x,z.y,p.x,p.y);
    const canSee=z.sight>0&&pd<z.sight*(night>0.5?0.6:1)&&(p.alive);
    if(canSee&&z.state!=='chase'){z.state='chase';z.tgt={x:p.x,y:p.y};z.lostT=0;
      if(z.type==='screamer'&&!z.screamed){z.screamed=true;IB.AUDIO.sfx('scream');IB.NOISE.push({x:z.x,y:z.y,r:22,t:'scream'});IB.toast('SCREAMER ПОДІВ СИГНАЛ — ЙДЕ ОРДА','red');}
    }
    if(z.state==='chase'){
      const chaseP=canSee||z.type==='guardian'&&pd<9;
      const tx=chaseP?p.x:(z.tgt?z.tgt.x:z.x),ty=chaseP?p.y:(z.tgt?z.tgt.y:z.y);
      const d=IB.dist(z.x,z.y,tx,ty);
      if(d>0.15){
        let sp=z.spd*z.boost*(z.type==='brute'&&pd<5&&z.cd<=0?2.6:1)*dt;
        const l=IB.M.max(0.001,d);
        IB.moveEnt(z,(tx-z.x)/l*sp,(ty-z.y)/l*sp,0.28,false);
      }
      if(!canSee&&d<0.5){z.lostT=(z.lostT||0)+dt;if(z.lostT>4){z.state='idle';}}
      /* атака гравця/авто */
      const targetInCar=!!p.car;
      const dd=targetInCar?IB.dist(z.x,z.y,carX(),carY()):pd;
      if(dd<(targetInCar?1.0:0.72)&&z.cd<=0){
        z.cd=1.15;
        if(targetInCar){
          const car=p.car;car.hp-=z.dmg*0.8;IB.AUDIO.sfx('hit');
          if(car.hp<=0){car.broken=true;car.engine=false;IB.AUDIO.engineStop();IB.exitCar();IB.toast('ЗАРАЖЕНІ ВИНЕСЛИ ДВИГУН!','red');}
        } else {
          IB.damagePlayer(z.dmg*IB.M.max(0.55,1-night*0.15));
          const l=IB.M.max(0.01,pd);IB.moveEnt(p,(p.x-z.x)/l*0.35,(p.y-z.y)/l*0.35,0.3,true);
        }
      }
    } else {
      /* блукання */
      z.wT-=dt;
      if(z.wT<=0){
        z.wT=IB.rnd(1.5,4);
        if(z.type!=='guardian'){
          const a=IB.rnd(0,6.28),r=IB.rnd(1,3);
          z.wt={x:z.x+IB.M.cos(a)*r,y:z.y+IB.M.sin(a)*r};
        } else z.wt=null;
      }
      if(z.wt&&z.type!=='guardian'){
        const d=IB.dist(z.x,z.y,z.wt.x,z.wt.y);
        if(d>0.2)IB.moveEnt(z,(z.wt.x-z.x)/d*z.spd*0.4*dt,(z.wt.y-z.y)/d*z.spd*0.4*dt,0.28,false);
      }
      if(z.type==='guardian'&&pd<z.sight){z.state='chase';}
    }
  }
  function carX(){return p.car.x;} function carY(){return p.car.y;}
  /* розштовхування */
  const zs=E.zombies;
  for(let i=0;i<zs.length;i++)for(let j=i+1;j<zs.length;j++){
    const a=zs[i],b=zs[j];const d=IB.dist(a.x,a.y,b.x,b.y);
    if(d<0.5&&d>0.001){const px=(a.x-b.x)/d*0.5*dt,py=(a.y-b.y)/d*0.5*dt;a.x+=px;a.y+=py;b.x-=px;b.y-=py;}
  }
  /* --- кулі --- */
  for(let i=E.bullets.length-1;i>=0;i--){
    const b=E.bullets[i];b.ttl-=dt;
    let dead=b.ttl<=0;
    for(let s=0;s<3&&!dead;s++){
      b.x+=b.vx*dt/3;b.y+=b.vy*dt/3;
      if(IB.WORLD.solid(b.x|0,b.y|0)){dead=true;
        for(let k=0;k<3;k++)E.parts.push({x:b.x,y:b.y,vx:IB.rnd(-1.5,1.5),vy:IB.rnd(-1.5,1.5),ttl:0.15,c:'#f0d050'});break;}
      for(const z of E.zombies){
        if(IB.dist(b.x,b.y,z.x,z.y)<0.42){IB.hurtZombie(z,b.dmg,b.vx/16,b.vy/16);IB.AUDIO.sfx('hit');dead=true;break;}
      }
    }
    if(dead)E.bullets.splice(i,1);
  }
  /* --- кинути предмети (граната/молов) --- */
  for(let i=E.throws.length-1;i>=0;i--){
    const t=E.throws[i];t.t+=dt*1.5;
    if(t.t>=1){
      if(t.kind==='grenade')IB.explode(t.tx,t.ty,2.4,110,true);
      else{E.fires.push({x:t.tx,y:t.ty,ttl:7});IB.AUDIO.sfx('boom');IB.NOISE.push({x:t.tx,y:t.ty,r:12,t:'fire'});}
      E.throws.splice(i,1);
    }
  }
  /* --- пожежі --- */
  for(let i=E.fires.length-1;i>=0;i--){
    const f=E.fires[i];f.ttl-=dt;f.t2=(f.t2||0)+dt;
    if(f.t2>0.5){f.t2=0;
      for(const z of E.zombies.slice()){if(IB.dist(f.x,f.y,z.x,z.y)<1.9)IB.hurtZombie(z,16,0,0);}
      if(IB.dist(f.x,f.y,p.x,p.y)<1.6&&!p.car)IB.damagePlayer(6);
    }
    if(f.ttl<=0)E.fires.splice(i,1);
  }
  /* --- частинки --- */
  for(let i=E.parts.length-1;i>=0;i--){
    const q=E.parts[i];q.ttl-=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;
    if(q.ttl<=0)E.parts.splice(i,1);
  }
  /* --- підбори --- */
  for(let i=E.pickups.length-1;i>=0;i--){
    const pk=E.pickups[i];pk.bob+=dt*4;
    if(IB.dist(pk.x,pk.y,p.x,p.y)<0.6){
      IB.addItem(pk.item,pk.n);IB.AUDIO.sfx('pickup');
      const nm=(IB.SPR.itemsDB[pk.item]||{}).n||pk.item;
      IB.toast('+ '+nm+(pk.n>1?' ×'+pk.n:''));
      E.pickups.splice(i,1);
    }
  }
};
