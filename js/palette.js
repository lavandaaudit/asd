/* IBONARIUM KYIV — palette + pixel-bake helpers (Mega Drive 9-bit feel) */
window.IB = {};
IB.M = Math;
IB.rnd = (a,b)=>a+IB.M.random()*(b-a);
IB.ri  = (a,b)=>IB.M.floor(a+IB.M.random()*(b-a+1));
IB.clamp=(v,a,b)=>v<a?a:(v>b?b:v);
IB.lerp=(a,b,t)=>a+(b-a)*t;
IB.dist=(ax,ay,bx,by)=>IB.M.hypot(bx-ax,by-ay);
IB.hsh=(x,y,s=0)=>{let h=(x*374761393+y*668265263+s*1274126177)|0;h=(h^(h>>13))*1274126177;h=(h^(h>>16))>>>0;return h/4294967296;};

IB.mk = (w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.imageSmoothingEnabled=false;c.g=g;return c;};

/* Kenney City Kit palette — 9-bit Mega Drive feel, CC0 kit hues */
IB.PAL = {
  blk:'#000000', d01:'#101014', d02:'#1c1c24', d03:'#2a2a34',
  gr1:'#666b80', gr2:'#8e95b3', gr3:'#a8b0c4', gr4:'#c9d2e0', gr5:'#dde2ee', wht:'#f4f4f8',
  sk1:'#faae8a', sk2:'#e0906e', sk3:'#c97a5a',
  g1:'#2e5a40', g2:'#3f7a58', g3:'#4a9868', g4:'#58ab77', g5:'#6cc98e', g6:'#8ad8a4',
  ol1:'#5a6a3a', ol2:'#7a8a4a',
  a1:'#3a3e4c', a2:'#515566', a3:'#5d6275', a4:'#8e95b3',
  c1:'#5a6070', c2:'#9aa2b6', c3:'#7e869c', c4:'#b8c0d2',
  r1:'#8a4a30', r2:'#b06041', r3:'#c9735a', r4:'#da8a6e',
  b1:'#4a3a24', b2:'#7c5c38', b3:'#96744a', b4:'#b08c5c',
  y1:'#8a6a1c', y2:'#c89428', y3:'#e8b23a', y4:'#ffc044',
  u1:'#2a4a80', u2:'#6794d9', u3:'#7ba4e0',
  s1:'#2a4a80', s2:'#3c6cb8', s3:'#6794d9',
  w1:'#1f4066', w2:'#2e5f8f', w3:'#3f7ab0', w4:'#6794d9',
  rd1:'#8a2a24', rd2:'#cf534f', rd3:'#e06a5c',
  zd:'#61cb8b', zd2:'#4a9a6e', zd3:'#8ad8a4',
  t1:'#515566', t2:'#666b80', t3:'#8e95b3',
  m1:'#4a5060', m2:'#666b80', m3:'#8e95b3', m4:'#c9d2e0',
  ru1:'#b06041', ru2:'#c9735a',
  n1:'#141428', n2:'#1e2040', n3:'#2a2c58',
  sa1:'#b09c72', sa2:'#c9b38a', sa3:'#dbcaa0',
  mn1:'#8e95b3', mn2:'#a8b0c4',   /* Maidan plaza light paving */
  or1:'#ff7e44',
};

/* --- drawing helpers --- */
IB.P = (g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x|0,y|0,w|0,h|0);};
IB.PA = (g,pts,c)=>{g.fillStyle=c;g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);g.closePath();g.fill();};
IB.O = (g,x,y,rx,ry,c)=>{g.fillStyle=c;g.beginPath();g.ellipse(x,y,rx,ry,0,0,7);g.fill();};
/* deterministic noise dot scatter inside box */
IB.speck=(g,x,y,w,h,c,n,seed=0)=>{for(let i=0;i<n;i++){const px=x+IB.hsh(i,seed,1)*w,py=y+IB.hsh(i,seed,2)*h;g.fillStyle=c;g.fillRect(px|0,py|0,1,1);}};
IB.shade=(hex,f)=>{ // f>0 lighten, f<0 darken
  const n=parseInt(hex.slice(1),16),r=(n>>16)&255,g=(n>>8)&255,b=n&255;
  const t=f>0?255:0,p=IB.M.abs(f);
  const m=v=>IB.M.round(IB.lerp(v,t,p));
  return '#'+((IB.clamp(m(r),0,255)<<16)|(IB.clamp(m(g),0,255)<<8)|IB.clamp(m(b),0,255)).toString(16).padStart(6,'0');
};
/* iso rhombus ground tile 32x16 */
IB.rhomb=(g,x,y,w,h,c)=>{IB.PA(g,[[x,y+h/2],[x+w/2,y],[x+w,y+h/2],[x+w/2,y+h]],c);};
/* iso box: top rhombus + left & right faces; returns nothing. w,d in px footprint, hh height px */
IB.isoBox=(g,x,y,w,d,hh,ct,cl,cr)=>{
  IB.PA(g,[[x,y+d/2],[x+w/2,y],[x+w,y+d/2],[x+w/2,y+d]],ct);            // top
  IB.PA(g,[[x,y+d/2],[x+w/2,y+d],[x+w/2,y+d+hh],[x,y+d/2+hh]],cl);      // left
  IB.PA(g,[[x+w/2,y+d],[x+w,y+d/2],[x+w,y+d/2+hh],[x+w/2,y+d+hh]],cr);  // right
};
IB.windowGrid=(g,x,y,w,h,cols,rows,dark,lit,colsSkip)=>{
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
    if(colsSkip&&IB.hsh(c,r,colsSkip)<0.22)continue;
    const wx=x+2+((w-4)/cols)*c, wy=y+2+((h-4)/rows)*r;
    const on=IB.hsh(c,r,7)<0.16;
    IB.P(g,wx,wy,(w-4)/cols-1,(h-4)/rows-1,on?lit:dark);
    if(on)IB.P(g,wx,wy,(w-4)/cols-1,(h-4)/rows-1,IB.shade(lit,-0.25));
  }
};
