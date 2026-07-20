#!/usr/bin/env python3
"""Frame Kit custom-icon authoring tool — the single source for all 29
custom icons, built to the extracted Radix style DNA (15x15, 1px filled-outline
strokes, round caps sweep-0, half-pixel grid). Emits SVGs to icons-drafts/;
review in a 15/30/60px side-by-side sheet, then move keepers to icons/ and run
generate-icons.mjs. Hard-won primitive rules: line/cubic round caps use sweep 0
(sweep 1 bites concave); round_poly + poly_outline winding-normalize via signed
area (mirrored shapes need it); multi-segment strokes use polyline(), never
chained line(); never offset a densified arc-sampled polygon at sharp corners."""
import math, os, re

OUT = os.path.join(os.path.dirname(__file__), "..", "icons-drafts")
os.makedirs(OUT, exist_ok=True)

def f(n):
    s = f"{n:.4f}".rstrip("0").rstrip(".")
    return s if s != "-0" else "0"

def norm(dx, dy):
    l = math.hypot(dx, dy)
    if l < 1e-9:
        return 0.0, 0.0
    return dx / l, dy / l

# ── corrected primitives ─────────────────────────────────────

def line(x1, y1, x2, y2, w=1.0):
    """1px stroke, round caps that bulge OUTWARD (sweep 0)."""
    ux, uy = norm(x2 - x1, y2 - y1)
    nx, ny = -uy, ux
    h = w / 2
    a = (x1 + nx * h, y1 + ny * h)
    b = (x2 + nx * h, y2 + ny * h)
    c = (x2 - nx * h, y2 - ny * h)
    d_ = (x1 - nx * h, y1 - ny * h)
    return (f"M{f(a[0])} {f(a[1])}L{f(b[0])} {f(b[1])}"
            f"A{f(h)} {f(h)} 0 0 0 {f(c[0])} {f(c[1])}"
            f"L{f(d_[0])} {f(d_[1])}"
            f"A{f(h)} {f(h)} 0 0 0 {f(a[0])} {f(a[1])}Z")

def polyline(pts, w=1.0):
    """Continuous 1px stroke through points: miter joins, round end caps."""
    h = w / 2
    n = len(pts)
    def seg_n(i):
        u = norm(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1])
        return (-u[1], u[0])
    left, right = [], []
    for i in range(n):
        if i == 0:
            nx, ny = seg_n(0)
            scale = h
        elif i == n - 1:
            nx, ny = seg_n(n - 2)
            scale = h
        else:
            n1, n2 = seg_n(i - 1), seg_n(i)
            bx, by = n1[0] + n2[0], n1[1] + n2[1]
            bl = math.hypot(bx, by)
            if bl < 1e-9:
                nx, ny = n1
                scale = h
            else:
                nx, ny = bx / bl, by / bl
                cosh = (1 + (n1[0] * n2[0] + n1[1] * n2[1])) / 2
                scale = h / max(0.25, cosh) ** 0.5
        left.append((pts[i][0] + nx * scale, pts[i][1] + ny * scale))
        right.append((pts[i][0] - nx * scale, pts[i][1] - ny * scale))
    d = "M" + "L".join(f"{f(x)} {f(y)}" for x, y in left)
    d += f"A{f(h)} {f(h)} 0 0 0 {f(right[-1][0])} {f(right[-1][1])}"
    d += "L" + "L".join(f"{f(x)} {f(y)}" for x, y in reversed(right[:-1]))
    d += f"A{f(h)} {f(h)} 0 0 0 {f(left[0][0])} {f(left[0][1])}Z"
    return d

def circle_d(cx, cy, r, cw=True):
    sweep = 1 if cw else 0
    return (f"M{f(cx)} {f(cy - r)}"
            f"A{f(r)} {f(r)} 0 1 {sweep} {f(cx)} {f(cy + r)}"
            f"A{f(r)} {f(r)} 0 1 {sweep} {f(cx)} {f(cy - r)}Z")

def ring(cx, cy, r_out, thick=0.95):
    return circle_d(cx, cy, r_out, True) + circle_d(cx, cy, r_out - thick, False)

def signed_area(pts):
    s = 0
    for i in range(len(pts)):
        x1, y1 = pts[i]
        x2, y2 = pts[(i + 1) % len(pts)]
        s += x1 * y2 - x2 * y1
    return s / 2

def offset_poly(pts, d):
    n = len(pts)
    out = []
    for i in range(n):
        p0, p1, p2 = pts[(i - 1) % n], pts[i], pts[(i + 1) % n]
        u1 = norm(p1[0] - p0[0], p1[1] - p0[1])
        u2 = norm(p2[0] - p1[0], p2[1] - p1[1])
        n1 = (-u1[1], u1[0])
        n2 = (-u2[1], u2[0])
        bx, by = n1[0] + n2[0], n1[1] + n2[1]
        bl = math.hypot(bx, by)
        if bl < 1e-9:
            out.append((p1[0] + n1[0] * d, p1[1] + n1[1] * d)); continue
        bx, by = bx / bl, by / bl
        cosh = (1 + (n1[0] * n2[0] + n1[1] * n2[1])) / 2
        scale = d / max(0.25, cosh) ** 0.5
        out.append((p1[0] + bx * scale, p1[1] + by * scale))
    return out

def poly_d(pts, reverse=False):
    p = list(reversed(pts)) if reverse else pts
    return "M" + "L".join(f"{f(x)} {f(y)}" for x, y in p) + "Z"

def poly_outline(pts, wall=1.0):
    """Winding-normalized 1px mitered outline of a closed polygon."""
    if signed_area(pts) < 0:
        pts = list(reversed(pts))
    outer = offset_poly(pts, wall / 2)
    inner = offset_poly(pts, -wall / 2)
    return poly_d(outer) + poly_d(inner, reverse=True)

def rrect_outline(x, y, w, h, r=1.5, wall=1.0):
    ro, ri = r, max(r - wall, 0.5)
    x2, y2 = x + w, y + h
    xi, yi, xi2, yi2 = x + wall, y + wall, x2 - wall, y2 - wall
    outer = (f"M{f(x + ro)} {f(y)}H{f(x2 - ro)}A{f(ro)} {f(ro)} 0 0 1 {f(x2)} {f(y + ro)}"
             f"V{f(y2 - ro)}A{f(ro)} {f(ro)} 0 0 1 {f(x2 - ro)} {f(y2)}H{f(x + ro)}"
             f"A{f(ro)} {f(ro)} 0 0 1 {f(x)} {f(y2 - ro)}V{f(y + ro)}"
             f"A{f(ro)} {f(ro)} 0 0 1 {f(x + ro)} {f(y)}Z")
    inner = (f"M{f(xi + ri)} {f(yi)}A{f(ri)} {f(ri)} 0 0 0 {f(xi)} {f(yi + ri)}"
             f"V{f(yi2 - ri)}A{f(ri)} {f(ri)} 0 0 0 {f(xi + ri)} {f(yi2)}H{f(xi2 - ri)}"
             f"A{f(ri)} {f(ri)} 0 0 0 {f(xi2)} {f(yi2 - ri)}V{f(yi + ri)}"
             f"A{f(ri)} {f(ri)} 0 0 0 {f(xi2 - ri)} {f(yi)}Z")
    return outer + inner

def rrect_fill(x, y, w, h, r):
    x2, y2 = x + w, y + h
    return (f"M{f(x + r)} {f(y)}H{f(x2 - r)}A{f(r)} {f(r)} 0 0 1 {f(x2)} {f(y + r)}"
            f"V{f(y2 - r)}A{f(r)} {f(r)} 0 0 1 {f(x2 - r)} {f(y2)}H{f(x + r)}"
            f"A{f(r)} {f(r)} 0 0 1 {f(x)} {f(y2 - r)}V{f(y + r)}"
            f"A{f(r)} {f(r)} 0 0 1 {f(x + r)} {f(y)}Z")

def rrect_hole(x, y, w, h, r):
    """Reversed-winding rounded rect (punch a hole in a filled shape)."""
    x2, y2 = x + w, y + h
    return (f"M{f(x + r)} {f(y)}A{f(r)} {f(r)} 0 0 0 {f(x)} {f(y + r)}"
            f"V{f(y2 - r)}A{f(r)} {f(r)} 0 0 0 {f(x + r)} {f(y2)}H{f(x2 - r)}"
            f"A{f(r)} {f(r)} 0 0 0 {f(x2)} {f(y2 - r)}V{f(y + r)}"
            f"A{f(r)} {f(r)} 0 0 0 {f(x2 - r)} {f(y)}Z")

def arc_pt(c, r, a_deg):
    a = math.radians(a_deg)
    return (c[0] + r * math.cos(a), c[1] + r * math.sin(a))

def arc_stroke(c, r, a0, a1, w=1.0):
    h = w / 2
    large = 1 if abs(a1 - a0) > 180 else 0
    o0, o1 = arc_pt(c, r + h, a0), arc_pt(c, r + h, a1)
    i0, i1 = arc_pt(c, r - h, a0), arc_pt(c, r - h, a1)
    return (f"M{f(o0[0])} {f(o0[1])}"
            f"A{f(r + h)} {f(r + h)} 0 {large} 1 {f(o1[0])} {f(o1[1])}"
            f"A{f(h)} {f(h)} 0 0 1 {f(i1[0])} {f(i1[1])}"
            f"A{f(r - h)} {f(r - h)} 0 {large} 0 {f(i0[0])} {f(i0[1])}"
            f"A{f(h)} {f(h)} 0 0 1 {f(o0[0])} {f(o0[1])}Z")

def cubic_pts(p0, c1, c2, p1, samples=20):
    out = []
    for i in range(samples + 1):
        t = i / samples
        mt = 1 - t
        out.append((mt**3 * p0[0] + 3 * mt**2 * t * c1[0] + 3 * mt * t**2 * c2[0] + t**3 * p1[0],
                    mt**3 * p0[1] + 3 * mt**2 * t * c1[1] + 3 * mt * t**2 * c2[1] + t**3 * p1[1]))
    return out

def cubic_stroke(p0, c1, c2, p1, w=1.0, samples=28):
    return polyline(cubic_pts(p0, c1, c2, p1, samples), w)

def diamond_pts(cx, cy, half):
    return [(cx, cy - half), (cx + half, cy), (cx, cy + half), (cx - half, cy)]

ALL = {}
def svg(name, d, evenodd=False):
    ALL[name] = d
    fr = ' fill-rule="evenodd" clip-rule="evenodd"' if evenodd else ""
    content = (f'<svg width="15" height="15" viewBox="0 0 15 15" fill="none" '
               f'xmlns="http://www.w3.org/2000/svg"><path d="{d}"{fr} fill="currentColor"/></svg>')
    open(os.path.join(OUT, f"{name}.svg"), "w").write(content)

def _fillet(p0, p1, p2, rv):
    """Corner fillet: tangent points + sampled arc replacing vertex p1."""
    u1 = norm(p1[0] - p0[0], p1[1] - p0[1])
    u2 = norm(p2[0] - p1[0], p2[1] - p1[1])
    dot = -(u1[0] * u2[0] + u1[1] * u2[1])
    ang = math.acos(max(-1, min(1, dot)))
    if ang < 1e-3 or rv <= 0:
        return [p1]
    t = rv / math.tan(ang / 2)
    e1 = math.hypot(p1[0] - p0[0], p1[1] - p0[1]) / 2 - 0.02
    e2 = math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / 2 - 0.02
    t = min(t, e1, e2)
    if t <= 0.02:
        return [p1]
    rv = t * math.tan(ang / 2)
    a = (p1[0] - u1[0] * t, p1[1] - u1[1] * t)
    b = (p1[0] + u2[0] * t, p1[1] + u2[1] * t)
    cross = u1[0] * u2[1] - u1[1] * u2[0]
    n1 = (-u1[1], u1[0]) if cross > 0 else (u1[1], -u1[0])
    c = (a[0] + n1[0] * rv, a[1] + n1[1] * rv)
    a0 = math.atan2(a[1] - c[1], a[0] - c[0])
    b0 = math.atan2(b[1] - c[1], b[0] - c[0])
    da = b0 - a0
    while da > math.pi: da -= 2 * math.pi
    while da < -math.pi: da += 2 * math.pi
    K = 7
    return [(c[0] + rv * math.cos(a0 + da * k / K), c[1] + rv * math.sin(a0 + da * k / K))
            for k in range(K + 1)]

def _dedupe(pts, closed=True, eps=0.03):
    out = []
    for p in pts:
        if not out or math.hypot(p[0] - out[-1][0], p[1] - out[-1][1]) > eps:
            out.append(p)
    if closed and len(out) > 1 and math.hypot(out[0][0] - out[-1][0], out[0][1] - out[-1][1]) <= eps:
        out.pop()
    return out

def round_poly(pts, r):
    """Densify a closed polygon with filleted corners. r: scalar or per-vertex list.
    Winding-normalized first so fillet arcs sample consistently for mirrored shapes."""
    if signed_area(pts) < 0:
        pts = list(reversed(pts))
        if isinstance(r, (list, tuple)):
            r = list(reversed(r))
    n = len(pts)
    out = []
    for i in range(n):
        rv = r[i] if isinstance(r, (list, tuple)) else r
        out += _fillet(pts[(i - 1) % n], pts[i], pts[(i + 1) % n], rv)
    return _dedupe(out, closed=True)

def round_open(pts, r):
    """Fillet interior corners of an open path (endpoints untouched)."""
    out = [pts[0]]
    for i in range(1, len(pts) - 1):
        rv = r[i] if isinstance(r, (list, tuple)) else r
        out += _fillet(pts[i - 1], pts[i], pts[i + 1], rv)
    out.append(pts[-1])
    return _dedupe(out, closed=False)

# ── batch 1 (regenerated / redesigned) ───────────────────────

lane = line(1, 7.5, 3.0, 7.5) + line(12.0, 7.5, 14, 7.5)
svg("keyframe", lane + poly_outline(diamond_pts(7.5, 7.5, 3.9)))
svg("keyframe-filled", lane + poly_d(diamond_pts(7.5, 7.5, 3.9)))

# flips: rounded triangle rings + 5 center dashes.
# round_ring offsets the RAW vertices first (exact miters), THEN fillets —
# never offset a densified/arc-sampled polygon (sharp corners collapse).
def round_ring(pts, wall=1.0, r=0.6):
    if signed_area(pts) < 0:
        pts = list(reversed(pts))
    outer = round_poly(offset_poly(pts, wall / 2), r + wall / 2)
    inner = round_poly(offset_poly(pts, -wall / 2), max(r - wall / 2, 0.12))
    return poly_d(outer) + poly_d(inner, reverse=True)

dashes_v = "".join(line(7.5, y, 7.5, y + 1.2) for y in (1.4, 3.9, 6.4, 8.9, 11.4))
tri_l = round_poly([(5.5, 5.0), (5.5, 10.5), (1.6, 10.5)], 0.6)
tri_r = round_poly([(9.5, 5.0), (13.4, 10.5), (9.5, 10.5)], 0.6)
svg("flip-horizontal", dashes_v + poly_outline(tri_l) + poly_outline(tri_r))
dashes_h = "".join(line(x, 7.5, x + 1.2, 7.5) for x in (1.4, 3.9, 6.4, 8.9, 11.4))
tri_t = round_poly([(5.0, 5.5), (10.5, 5.5), (10.5, 1.6)], 0.6)
tri_b = round_poly([(5.0, 9.5), (10.5, 13.4), (10.5, 9.5)], 0.6)
svg("flip-vertical", dashes_h + poly_outline(tri_t) + poly_outline(tri_b))

svg("folder", poly_outline(round_poly(
    [(1, 12.5), (1, 2.5), (5.8, 2.5), (7.3, 4.25), (14, 4.25), (14, 12.5)],
    [1.2, 1.0, 0.7, 0.7, 1.0, 1.2])))

# folder-open: continuous back stroke + front flap
back = polyline(round_open([(1.5, 11), (1.5, 3), (5.6, 3), (6.9, 4.6), (11.5, 4.6)], [0, 0.8, 0.5, 0.5, 0]))
front = round_poly([(4.55, 6.75), (14, 6.75), (11.45, 12.75), (2, 12.75)], 0.7)
svg("folder-open", back + poly_outline(front))

# magnet: longer, thicker horseshoe with capped pole ends
mg_solid = "M1.8 1.5V7.3A5.7 5.7 0 0 0 13.2 7.3V1.5H10V7.3A2.5 2.5 0 0 1 5 7.3V1.5Z"
mg_hollow = "M2.8 4.2H4V7.3A3.5 3.5 0 0 0 11 7.3V4.2H12.2V7.3A4.7 4.7 0 0 1 2.8 7.3V4.2Z"
svg("magnet", mg_solid + mg_hollow)

# pen-tool: true nib — curved sides, rounded shoulders, hole + slit
right_side = cubic_pts((10.4, 2.0), (11.35, 4.6), (9.1, 9.6), (7.5, 13.15), 22)
left_side = [(15 - x, y) for (x, y) in right_side]
nib_pts = [(4.6, 2.0), (10.4, 2.0)] + right_side[1:] + list(reversed(left_side))[1:-1]
nib_radii = [0.8, 0.8] + [0] * (len(nib_pts) - 2)
svg("pen-tool", poly_outline(round_poly(nib_pts, nib_radii)) + ring(7.5, 5.7, 1.5) + line(7.5, 7.9, 7.5, 10.7))

# bezier-curve
svg("bezier-curve",
    rrect_outline(1.2, 9.7, 3.6, 3.6, r=0.9)
    + rrect_outline(10.2, 1.7, 3.6, 3.6, r=0.9)
    + cubic_stroke((4.8, 11.2), (9.6, 11.2), (5.4, 3.8), (10.2, 3.8)))

# timeline: larger playhead
svg("timeline",
    poly_d(round_poly([(3.1, 1.7), (5.9, 1.7), (4.5, 4.3)], 0.45))
    + line(4.5, 2.6, 4.5, 13.1)
    + rrect_outline(6.9, 4.4, 7.1, 2.7, r=0.9)
    + rrect_outline(6.9, 8.9, 4.6, 2.7, r=0.9))

# eyedropper: classic tube + bulb at 45°
tipp = (2.5, 12.5)
ang = math.radians(-45)
ca, sa = math.cos(ang), math.sin(ang)
def AX(t, s):
    return (tipp[0] + t * ca - s * sa, tipp[1] + t * sa + s * ca)
prof = [AX(0, 0.55), AX(2.6, 1.2), AX(7.2, 1.2), AX(7.6, 2.4), AX(9.2, 2.4)]
for i in range(1, 13):
    a = math.pi * (i / 12)
    prof.append(AX(9.2 + 2.4 * math.sin(a), 2.4 * math.cos(a)))
prof += [AX(7.6, -2.4), AX(7.2, -1.2), AX(2.6, -1.2), AX(0, -0.55)]
radii = [0.45] + [0.35] * 4 + [0] * 13 + [0.35] * 3 + [0.45]
svg("eyedropper", poly_outline(round_poly(prof, radii)))

# rotate-clockwise: keep existing installed mirror (regenerated identically)
src_ccw = open("/Volumes/Work/Projects/Frame Kit/packages/framekit/icons/rotate-counter-clockwise.svg").read()
dm = re.search(r'd="([^"]+)"', src_ccw).group(1)
tokens = re.findall(r'[MCLZHVmclzhv]|-?\d*\.?\d+(?:e-?\d+)?', dm)
out_tokens, cmd, idx = [], None, 0
for t in tokens:
    if re.match(r'^[A-Za-z]$', t):
        cmd = t.upper(); out_tokens.append(t); idx = 0; continue
    v = float(t)
    if cmd in ('M', 'L', 'C'):
        v = 15 - v if idx % 2 == 0 else v
        idx += 1
    out_tokens.append(f(v))
mir = ""
prev_num = False
for t in out_tokens:
    is_num = not re.match(r'^[A-Za-z]$', t)
    mir += (" " + t) if (is_num and prev_num and not t.startswith('-')) else t
    prev_num = is_num
svg("rotate-clockwise", mir)

# ── batch 2 (regenerated / redesigned) ───────────────────────

c = (7.5, 7.5)
d = ring(7.5, 7.5, 6.62, 0.95)
for k in range(6):
    th = math.radians(k * 60)
    u = (math.cos(th), math.sin(th))
    nrm = (-math.sin(th), math.cos(th))
    off = 2.5
    t0, t1 = -1.44, math.sqrt(5.35**2 - off**2)
    p0 = (c[0] + t0 * u[0] + off * nrm[0], c[1] + t0 * u[1] + off * nrm[1])
    p1 = (c[0] + t1 * u[0] + off * nrm[0], c[1] + t1 * u[1] + off * nrm[1])
    d += line(p0[0], p0[1], p1[0], p1[1])
svg("aperture", d)

# focus: continuous corner brackets + dot
br = (polyline([(2, 5), (2, 2), (5, 2)]) + polyline([(10, 2), (13, 2), (13, 5)])
      + polyline([(13, 10), (13, 13), (10, 13)]) + polyline([(5, 13), (2, 13), (2, 10)]))
svg("focus", br + circle_d(7.5, 7.5, 1.25, True))

hist = rrect_outline(1, 2.5, 13, 10, r=1.5)
for x, hh in ((3.1, 3.2), (5.6, 5.8), (8.1, 4.4), (10.6, 2.4)):
    hist += rrect_fill(x, 10.6 - hh, 1.4, hh, 0.3)
svg("histogram", hist)

fs = rrect_outline(1, 3, 13, 9, r=1.2)
for x in (3.0, 5.4, 7.8, 10.2):
    fs += rrect_fill(x, 4.4, 1.1, 1.1, 0.3) + rrect_fill(x, 9.5, 1.1, 1.1, 0.3)
svg("film-strip", fs)

# exposure: square + plus and minus only
ex = rrect_outline(1.5, 1.5, 12, 12, r=1.5)
ex += line(3.5, 5.1, 6.7, 5.1) + line(5.1, 3.5, 5.1, 6.7)
ex += line(8.3, 9.9, 11.5, 9.9)
svg("exposure", ex)

# clapperboard: clean body + hinged slate + stripes
body = rrect_outline(1.5, 6.4, 12, 6.6, r=1)
sl_p = (1.7, 5.85)
sl_u = (math.cos(math.radians(-13)), math.sin(math.radians(-13)))
sl_n = (-sl_u[1], sl_u[0])
L, H = 11.7, 1.85
slate_pts = [sl_p,
             (sl_p[0] + L * sl_u[0], sl_p[1] + L * sl_u[1]),
             (sl_p[0] + L * sl_u[0] - H * sl_n[0], sl_p[1] + L * sl_u[1] - H * sl_n[1]),
             (sl_p[0] - H * sl_n[0], sl_p[1] - H * sl_n[1])]
stripes = ""
for t in (3.4, 6.8):
    s0 = (sl_p[0] + t * sl_u[0] - 0.28 * H * sl_n[0], sl_p[1] + t * sl_u[1] - 0.28 * H * sl_n[1])
    s1 = (sl_p[0] + (t + 1.5) * sl_u[0] - 0.72 * H * sl_n[0], sl_p[1] + (t + 1.5) * sl_u[1] - 0.72 * H * sl_n[1])
    stripes += line(s0[0], s0[1], s1[0], s1[1], 0.9)
svg("clapperboard", body + poly_outline(slate_pts) + stripes)

# onion-skin: continuous ghost stroke
svg("onion-skin", polyline([(2, 9.5), (2, 3.2), (8.3, 3.2)]) + rrect_outline(4.2, 5.4, 9.3, 7.6, r=1.2))

wf = ""
for x, hh in ((2.0, 3.0), (3.9, 6.4), (5.8, 10.6), (7.7, 4.6), (9.6, 8.2), (11.5, 5.4), (13.2, 2.6)):
    wf += line(x, 7.5 - hh / 2, x, 7.5 + hh / 2)
svg("waveform", wf)

mb = ring(9.9, 7.5, 3.05, 0.95)
mb += line(1.3, 4.9, 4.9, 4.9) + line(2.4, 7.5, 5.6, 7.5) + line(1.3, 10.1, 4.9, 10.1)
svg("motion-blur", mb)

# gauge: arc + shortened needle (no overlap with dial)
g = arc_stroke((7.5, 9.6), 5.6, 150, 390)
nd = norm(2.9, -4.2)
g += line(7.5, 9.6, 7.5 + nd[0] * 4.3, 9.6 + nd[1] * 4.3)
g += circle_d(7.5, 9.6, 1.15, True)
svg("gauge", g)

# booleans: rounded junction corners (r .75 convex / .5 concave)
union_d = ("M3 2H8A1 1 0 0 1 9 3V5.5A0.5 0.5 0 0 0 9.5 6H12A1 1 0 0 1 13 7V12"
           "A1 1 0 0 1 12 13H7A1 1 0 0 1 6 12V9.5A0.5 0.5 0 0 0 5.5 9H3"
           "A1 1 0 0 1 2 8V3A1 1 0 0 1 3 2Z")
svg("union", union_d)

subtract_fill = ("M3 2H8A1 1 0 0 1 9 3V5.25A0.75 0.75 0 0 1 8.25 6H6.5"
                 "A0.5 0.5 0 0 0 6 6.5V8.25A0.75 0.75 0 0 1 5.25 9H3"
                 "A1 1 0 0 1 2 8V3A1 1 0 0 1 3 2Z")
svg("subtract", subtract_fill + rrect_outline(6, 6, 7, 7, r=1))

svg("intersect",
    rrect_outline(2, 2, 7, 7, r=1) + rrect_outline(6, 6, 7, 7, r=1)
    + rrect_fill(6, 6, 3, 3, 0.75))

svg("exclude", union_d + rrect_hole(6, 6, 3, 3, 0.75))

cr = line(2, 13.5, 2, 8.5) + arc_stroke((8.5, 8.5), 6.5, 180, 270) + line(8.5, 2, 13.5, 2)
svg("corner-radius", cr)

svg("stroke-width", line(2, 3, 13, 3, 1.0) + line(2, 7, 13, 7, 2.0) + line(2, 11.4, 13, 11.4, 3.2))

gr = rrect_outline(1.5, 3.5, 12, 4.5, r=1)
gr += "M2.5 4.5H6.2V7H2.5V4.5Z"
gr += rrect_fill(2.0, 10.6, 2.2, 2.2, 0.6) + rrect_fill(10.8, 10.6, 2.2, 2.2, 0.6)
svg("gradient", gr)

# ── lint: bounds check ───────────────────────────────────────
problems = []
for name, dd in ALL.items():
    nums = [float(x) for x in re.findall(r'-?\d+\.?\d*', dd)]
    lo, hi = min(nums), max(nums)
    if lo < -0.2 or hi > 15.2:
        problems.append(f"{name}: range {lo:.2f}..{hi:.2f}")
print(f"{len(ALL)} icons generated")
print("bounds problems:", problems if problems else "none")
