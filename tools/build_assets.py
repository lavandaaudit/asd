#!/usr/bin/env python3
"""Build ALL Kenney-based assets for IBONARIUM KYIV.
Outputs into download/ibonarium-kyiv/assets/:
  bld_<cat>_<i>[_dmg].png  - buildings (full canvas, engine-anchored)
  road_<mask>.png (16) + road_wide.png - road tiles with markings
  prop_<name>.png - Kenney props
"""
import os, sys, math
sys.path.insert(0, os.path.dirname(__file__))
import kenney_render as K
from PIL import Image, ImageDraw

OUT = K.OUT
COM, SUB, IND, RDS = 'commercial', 'city-kit-suburban', 'city-kit-industrial', 'city-kit-roads'
os.makedirs(OUT, exist_ok=True)

# ------------------------------------------------------------------ buildings
# cat: (wT, dT, hpx, [(kit, model), ...])
CATS = {
  'khrus':      (1, 1, 36, [(COM,'building-a'),(COM,'building-b'),(COM,'building-d'),(COM,'building-f'),(COM,'building-g'),(COM,'building-h')]),
  'khrus2':     (1, 1, 40, [(COM,'building-i'),(COM,'building-l'),(COM,'building-m'),(COM,'building-c')]),
  'panel9':     (2, 2, 88, [(COM,'building-skyscraper-b'),(COM,'building-skyscraper-c'),(COM,'building-skyscraper-d'),(COM,'building-skyscraper-e')]),
  'panel9b':    (2, 2, 88, [(COM,'building-skyscraper-a'),(COM,'building-skyscraper-b'),(COM,'building-skyscraper-d')]),
  'hist2':      (1, 1, 20, [(SUB,'building-type-a'),(SUB,'building-type-c'),(SUB,'building-type-e'),(SUB,'building-type-h'),(SUB,'building-type-i'),(SUB,'building-type-r')]),
  'hist2b':     (1, 1, 20, [(SUB,'building-type-g'),(SUB,'building-type-l'),(SUB,'building-type-p'),(SUB,'building-type-q')]),
  'hist2c':     (1, 1, 20, [(SUB,'building-type-k'),(SUB,'building-type-t'),(SUB,'building-type-f'),(SUB,'building-type-s')]),
  'hist3':      (2, 1, 24, [(SUB,'building-type-b'),(SUB,'building-type-d'),(SUB,'building-type-j'),(SUB,'building-type-o')]),
  'admin3':     (3, 2, 44, [(COM,'building-j'),(COM,'building-n'),(IND,'building-l')]),
  'admin4':     (3, 2, 64, [(COM,'building-skyscraper-a'),(COM,'building-m'),(COM,'building-n')]),
  'shop1':      (1, 1, 16, [(SUB,'building-type-p'),(SUB,'building-type-q'),(IND,'building-i')]),
  'shop2':      (1, 1, 16, [(IND,'building-h'),(IND,'building-j'),(SUB,'building-type-i'),(COM,'low-detail-building-d')]),
  'factory':    (3, 2, 30, [(IND,'building-a'),(IND,'building-b'),(IND,'building-c'),(IND,'building-g')]),
  'factory2':   (3, 2, 40, [(IND,'building-f'),(IND,'building-n'),(IND,'building-r'),(IND,'building-t')]),
  'garage':     (1, 1, 14, [(IND,'building-j'),(IND,'building-h'),(IND,'building-k'),(SUB,'building-type-p')]),
  'khrus_dmg':  (1, 1, 36, [(COM,'building-a'),(COM,'building-b'),(COM,'building-d'),(COM,'building-g')]),
  'panel9_dmg': (2, 2, 80, [(COM,'building-skyscraper-b'),(COM,'building-skyscraper-c'),(COM,'building-skyscraper-d')]),
  'hist_ruin':  (1, 1, 14, [(SUB,'building-type-c'),(SUB,'building-type-g'),(SUB,'building-type-h')]),
}

def render_cat_model(kit, name, wT, dT, hpx):
    mdl = K.load_obj(K.obj_path(kit, name))
    tex = K.load_tex(kit)
    x0, x1, y0, y1, z0, z1 = K.bbox(mdl)
    W = (wT + dT) * 16 + 4
    H = (wT + dT) * 8 + hpx + 8
    su = wT / max(1e-6, x1 - x0)
    sv = dT / max(1e-6, z1 - z0)
    sy = min(hpx / max(1e-6, (y1 - y0) * 16), (su + sv) / 2 * 1.6)
    dTl = dT
    def proj(x, y, z):
        u = (x - x0) * su
        v = (z - z0) * sv
        # engine cat convention: roof rhombus at canvas top, walls extend DOWN by hpx
        return ((2 + dTl * 16) + (u - v) * 16, 8 + hpx + (u + v) * 8 - (y - y0) * 16 * sy, u + v + (y - y0) * sy)
    r = K.render(mdl, tex, W, H, proj)
    return r

def damage_post(img, heavy=False):
    """apocalypse pass: light darkening + grime specks (keep building readable)"""
    px = img.load()
    w, h = img.size
    f = 0.82 if heavy else 0.9
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0: continue
            px[x, y] = (int(r*f), int(g*f), int(b*f), a)
    dr = ImageDraw.Draw(img)
    n = 40 if heavy else 22
    for i in range(n):
        x = int(K.IB_hsh(i, 3, 7) * w); y = int(K.IB_hsh(i, 5, 9) * h)
        if px[x, y][3] == 0: continue
        c = (14, 14, 16, 255) if i % 3 else (120, 70, 40, 255)
        dr.point((x, y), fill=c)
        if i % 7 == 0: dr.rectangle([x, y, x+1, y], fill=c)
    return img

def build_buildings():
    count = 0
    for cat, (wT, dT, hpx, pool) in CATS.items():
        for i, (kit, name) in enumerate(pool):
            img = render_cat_model(kit, name, wT, dT, hpx)
            img.save(f'{OUT}/bld_{cat}_{i}.png')
            dmg = damage_post(img.copy(), heavy=(cat == 'hist_ruin'))
            dmg.save(f'{OUT}/bld_{cat}_{i}_dmg.png')
            count += 1
    print('buildings:', count)

# ------------------------------------------------------------------ roads
def rot_model(mdl, deg90):
    """rotate around vertical axis; y=up"""
    import copy
    m2 = copy.copy(mdl)
    vs = []
    for (x, y, z) in mdl.v:
        for _ in range(deg90):
            x, z = z, -x
        vs.append((x, y, z))
    m2.v = vs
    return m2

def edge_open(img):
    """classify 4 rhombus edges: open(road)=dark asphalt, closed=light curb.
    mask bits: 1=N(NE edge) 2=E(SE) 4=S(SW) 8=W(NW)"""
    # edge segments as (t along edge, point) — rhombus corners: N(16,0) E(32,8) S(16,16) W(0,8)
    NE = [(16 + t * 16, 0 + t * 8) for t in (0.35, 0.5, 0.65)]
    SE = [(32 - t * 16, 8 + t * 8) for t in (0.35, 0.5, 0.65)]
    SW = [(16 - t * 16, 16 - t * 8) for t in (0.35, 0.5, 0.65)]
    NW = [(0 + t * 16, 8 - t * 8) for t in (0.35, 0.5, 0.65)]
    res = 0
    px = img.load()
    for bit, seg in ((1, NE), (2, SE), (4, SW), (8, NW)):
        lum, n = 0, 0
        for (x0, y0) in seg:
            for dy in (0, 1):
                x, y = int(x0), int(y0) + dy
                if 0 <= x < 32 and 0 <= y < 16:
                    r, g, b, a = px[x, y]
                    if a > 0: lum += (r + g + b) / 3; n += 1
        if n == 0: continue
        if lum / n < 118: res |= bit   # dark asphalt = opening
    return res

def markings(dr, m, L, D, W2='#c9d2e0', Y='#ffc044'):
    """engine-style lane markings over Kenney base.
    mask: 1=N 2=E 4=S 8=W (map neighbors). straights 5/10, corners 3/6/12/9."""
    cnt = bin(m).count('1')
    if cnt == 2:
        if m == 5:   # vertical (screen) straight
            dr.rectangle([15, 0, 16, 15], fill=W2)
            dr.rectangle([15, 1, 15, 4], fill=Y); dr.rectangle([16, 9, 16, 12], fill=Y)
        elif m == 10:  # horizontal straight
            dr.rectangle([0, 8, 31, 8], fill=W2)
            for x in (3, 13, 23): dr.rectangle([x, 8, x + 3, 8], fill=Y)
        elif m == 3:   # corner N->E (right-top arc)
            dr.line([17, 1, 21, 4], fill=Y); dr.line([24, 6, 30, 8], fill=Y)
        elif m == 6:   # corner E->S (right-bottom arc)
            dr.line([30, 9, 25, 12], fill=Y); dr.line([21, 13, 17, 15], fill=Y)
        elif m == 12:  # corner S->W (left-bottom arc)
            dr.line([15, 15, 10, 13], fill=Y); dr.line([7, 11, 2, 9], fill=Y)
        elif m == 9:   # corner W->N (left-top arc)
            dr.line([2, 7, 7, 4], fill=Y); dr.line([11, 3, 15, 1], fill=Y)
    elif cnt == 4:
        dr.rectangle([12, 5, 19, 10], outline=W2)
        dr.rectangle([14, 7, 17, 8], fill=W2)

def render_road_base(kit, name, rot=0):
    mdl = rot_model(K.load_obj(K.obj_path(kit, name)), rot)
    tex = K.load_tex(kit)
    def proj(x, y, z):
        return ((x - z) * 16 + 16, (x + z) * 8 + 8 - y * 16, x + z + y)
    r = K.render(mdl, tex, 32, 16, proj, no_shade=True)
    mask = Image.new('L', (32, 16), 0)
    ImageDraw.Draw(mask).polygon([(16, 0), (32, 8), (16, 16), (0, 8)], fill=255)
    base = Image.new('RGBA', (32, 16), (0, 0, 0, 0))
    base.paste(r, (0, 0), mask)
    return base

def build_roads():
    # verified orientation table (no-shade probes):
    # straight rot0=10(E+W) rot1=5(N+S) | bend rot0=12 rot1=6 rot2=3 rot3=9
    # T rot0=14 rot1=7 rot2=11 rot3=13  | end rot0=2 rot1=1 rot2=8 rot3=4 | cross=15
    STR, BND, T, END, CRS = 'road-straight', 'road-bend', 'road-intersection', 'road-end', 'road-crossroad'
    plan = {}
    for m in range(16):
        cnt = bin(m).count('1')
        if cnt == 2:
            if m == 5: plan[m] = (STR, 1)      # N+S straight (vertical screen)
            elif m == 10: plan[m] = (STR, 0)   # E+W straight (horizontal screen)
            elif m == 3: plan[m] = (BND, 2)    # N+E corner
            elif m == 6: plan[m] = (BND, 1)    # E+S corner
            elif m == 12: plan[m] = (BND, 0)   # S+W corner
            elif m == 9: plan[m] = (BND, 3)    # W+N corner
        elif cnt == 3:
            plan[m] = {14: (T, 0), 7: (T, 1), 11: (T, 2), 13: (T, 3)}[m]
        elif cnt == 1:
            plan[m] = {2: (END, 0), 1: (END, 1), 8: (END, 2), 4: (END, 3)}[m]
        else:
            plan[m] = (CRS, 0)
    for m in range(16):
        nm, rot = plan[m]
        img = render_road_base(RDS, nm, rot)
        dr = ImageDraw.Draw(img)
        markings(dr, m, None, None)
        img.save(f'{OUT}/road_{m}.png')
    # wide interior: plain asphalt from crossroad base minus curbs -> just dark rhombus w/ specks
    img = Image.new('RGBA', (32, 16), (0, 0, 0, 0))
    dr = ImageDraw.Draw(img)
    dr.polygon([(16, 0), (32, 8), (16, 16), (0, 8)], fill=(81, 85, 102, 255))
    for i in range(26):
        x = int(K.IB_hsh(i, 11, 2) * 30) + 1; y = int(K.IB_hsh(i, 13, 3) * 14) + 1
        dr.point((x, y), fill=(96, 100, 118, 255) if i % 2 else (70, 74, 90, 255))
    img.save(f'{OUT}/road_wide.png')
    print('roads: 16 + wide')

# ------------------------------------------------------------------ props
PROPS = [
    # (out, kit, model, target_h_px, target_w_px or None)
    ('tree_o',   SUB, 'tree-large', 46, 34),
    ('tree_o2',  SUB, 'tree-small', 32, 26),
    ('pine',     SUB, 'tree-large', 50, 24),
    ('dumpster', RDS, 'dumpster', 15, 30),
    ('traff',    RDS, 'traffic-light', 34, None),
    ('lamp',     RDS, 'light-curved', 40, None),
    ('lamp_b',   RDS, 'light-square', 36, None),
    ('barr',     RDS, 'construction-barrier', 14, None),
    ('cone',     RDS, 'construction-cone', 10, None),
    ('crate',    IND, 'shipping-container-a', 14, 26),
    ('crate2',   IND, 'shipping-container-b', 14, 26),
    ('crate3',   IND, 'shipping-container-c', 14, 26),
    ('chimney',  IND, 'chimney-large', 30, None),
    ('tank',     IND, 'detail-tank-large', 16, 30),
    ('fence',    SUB, 'fence-1x3', 12, 30),
    ('bush',     SUB, 'planter', 12, 24),
    ('antenna',  RDS, 'electricity-pole', 30, None),
]

def build_props():
    for out, kit, name, th, tw in PROPS:
        img = K.render_prop(kit, name, out, target_h=th, target_w=tw)
        print(f'  prop {out}: {img.size}')
    # crate variants: world uses 'crate' -> kenney.js picks random of crate/crate2/crate3
    print('props done')

if __name__ == '__main__':
    build_buildings()
    build_roads()
    build_props()
    print('ALL ASSETS DONE')
