/* IBONARIUM KYIV — kenney.js: застосовує рендери Kenney City Kits (CC0) до спрайтів рушія.
   Викликається після завантаження ассетів; при помилках лишається процедурний фолбек. */
IB.KENNEY = (function(){
  function img2cv(im){
    if(!im || !im.width) return null;
    const c = IB.mk(im.width, im.height);
    c.g.drawImage(im, 0, 0);
    return c;
  }
  function apply(){
    const I = IB.ASSETS.IMG, S = IB.SPR;
    /* ---------- дороги (16 масок + широка внутрішність) ---------- */
    let roadOk = 0;
    for(let m = 0; m < 16; m++){
      const im = I['road_' + m];
      if(im && im.width === 32){ S.road[m] = img2cv(im); roadOk++; }
    }
    if(I['road_wide']) S.road[16] = img2cv(I['road_wide']);
    /* ---------- будівлі з варіантами: cats['khrus_0']… ---------- */
    let bldOk = 0;
    for(const cat in IB.ASSETS.POOLS){
      for(let i = 0; i < IB.ASSETS.POOLS[cat]; i++){
        const im = I['bld_' + cat + '_' + i];
        if(im && im.width){
          S.cats[cat + '_' + i] = im;
          if(i === 0) S.cats[cat] = im;   /* фолбек без варіанта */
          bldOk++;
        }
      }
    }
    /* ---------- пропси (якорі: низ-центр) ---------- */
    const propsMap = {
      tree_o: [32, 58], tree_o2: [32, 56], pine: [32, 58],
      dumpster: [32, 56], traff: [32, 56], lamp: [32, 56], lamp_b: [32, 56],
      barr: [32, 56], cone: [32, 56], chimney: [32, 56], tank: [32, 56],
      fence: [32, 56], bush: [32, 56], antenna: [32, 56],
    };
    let propOk = 0;
    for(const key in propsMap){
      const im = I['prop_' + key];
      if(im && im.width){
        S.props[key] = {c: im, ax: im.width / 2, ay: im.height};
        propOk++;
      }
    }
    /* ящики: 3 кольорові контейнери — випадковий на спрайт */
    const crates = ['crate', 'crate2', 'crate3'].map(k=>I['prop_' + k]).filter(Boolean);
    if(crates.length){
      S.props.crate = {c: crates[0], ax: crates[0].width / 2, ay: crates[0].height};
      S.cratePool = crates;
    }
    return {roadOk, bldOk, propOk};
  }
  return {apply};
})();
