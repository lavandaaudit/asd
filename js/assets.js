/* IBONARIUM KYIV — assets.js: Kenney CC0 asset loader (city kit renders) */
IB.ASSETS = (function(){
  const POOLS = {
    khrus: 6, khrus2: 4, panel9: 4, panel9b: 3,
    hist2: 6, hist2b: 4, hist2c: 4, hist3: 4,
    admin3: 3, admin4: 3, shop1: 3, shop2: 4,
    factory: 4, factory2: 4, garage: 4,
    khrus_dmg: 4, panel9_dmg: 3, hist_ruin: 3,
  };
  const PROPS = ['tree_o','tree_o2','pine','dumpster','traff','lamp','lamp_b','barr','cone',
                 'crate','crate2','crate3','chimney','tank','fence','bush','antenna'];
  const ROADS = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,'wide'];
  const IMG = {};
  function listAll(){
    const out = [];
    for(const cat in POOLS) for(let i = 0; i < POOLS[cat]; i++)
      out.push(['bld_' + cat + '_' + i, 'assets/bld_' + cat + '_' + i + '.png']);
    for(const p of PROPS) out.push(['prop_' + p, 'assets/' + p + '.png']);
    for(const r of ROADS) out.push(['road_' + r, 'assets/road_' + r + '.png']);
    return out;
  }
  function load(){
    const list = listAll();
    let done = 0;
    return new Promise(res=>{
      if(!list.length){ res(IMG); return; }
      const fin = ()=>{ done++; if(done >= list.length) res(IMG); };
      for(const [key, url] of list){
        const im = new Image();
        im.onload = fin;
        im.onerror = fin;   /* missing file -> procedural fallback */
        im.src = url;
        IMG[key] = im;
      }
    });
  }
  return {load, IMG, POOLS};
})();
