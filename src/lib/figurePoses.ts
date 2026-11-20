export const SIZE = 120;
export const GROUND = 108;
export const HEAD_R = 9;

export type Kind =
  | "squat" | "pushup" | "wallpushup" | "row"
  | "plank" | "walk" | "stretch" | "breathe";

type Pt = [number, number];

type Pose = {
  torso: number;
  thigh: number;
  shin: number;
  thigh2?: number;
  shin2?: number;
  uArm: number;
  fArm: number;
  uArm2?: number;
  fArm2?: number;
  hx?: number;
  footX?: number;
  hand?: Pt;
  bend?: "left" | "down";
};

export type Skeleton = {
  hip: Pt; neck: Pt; head: Pt;
  knee: Pt; ankle: Pt; toe: Pt;
  knee2: Pt; ankle2: Pt; toe2: Pt;
  elbow: Pt; hand: Pt;
  elbow2: Pt; hand2: Pt;
};

const LEN = { torso: 34, head: 12, upper: 18, fore: 17, thigh: 24, shin: 24 };
const ANKLE_Y = GROUND - 2;

// Angles in degrees: 0 = pointing down, 90 = pointing right, 180 = pointing up.
const vec = (deg: number, len: number): Pt => {
  const r = (deg * Math.PI) / 180;
  return [Math.sin(r) * len, Math.cos(r) * len];
};
const add = (a: Pt, b: Pt): Pt => [a[0] + b[0], a[1] + b[1]];
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export const POSES: Record<Kind, [Pose, Pose]> = {
  squat: [
    { torso: 180, thigh: 0, shin: 0, uArm: 90, fArm: 90, footX: 58 },
    { torso: 150, thigh: 80, shin: -20, uArm: 90, fArm: 90, footX: 58 },
  ],
  pushup: [
    { torso: 115, thigh: -65, shin: -65, uArm: 0, fArm: 0, footX: 14, hand: [90, 106], bend: "left" },
    { torso: 98, thigh: -82, shin: -82, uArm: 0, fArm: 0, footX: 14, hand: [90, 106], bend: "left" },
  ],
  wallpushup: [
    { torso: 156, thigh: -24, shin: -24, uArm: 0, fArm: 0, footX: 46, hand: [112, 36], bend: "down" },
    { torso: 144, thigh: -36, shin: -36, uArm: 0, fArm: 0, footX: 46, hand: [112, 36], bend: "down" },
  ],
  row: [
    { torso: 115, thigh: 20, shin: -10, uArm: 0, fArm: 0, hx: 50 },
    { torso: 115, thigh: 20, shin: -10, uArm: -100, fArm: 15, hx: 50 },
  ],
  plank: [
    { torso: 103, thigh: -77, shin: -77, uArm: 0, fArm: 90, footX: 14 },
    { torso: 101, thigh: -79, shin: -79, uArm: 0, fArm: 90, footX: 14 },
  ],
  walk: [
    { torso: 178, thigh: 25, shin: 15, thigh2: -20, shin2: -50, uArm: -30, fArm: -10, uArm2: 30, fArm2: 70, hx: 60 },
    { torso: 178, thigh: -20, shin: -50, thigh2: 25, shin2: 15, uArm: 30, fArm: 70, uArm2: -30, fArm2: -10, hx: 60 },
  ],
  stretch: [
    { torso: 180, thigh: 0, shin: 0, uArm: 5, fArm: 5, hx: 60 },
    { torso: 172, thigh: 0, shin: 0, uArm: 175, fArm: 175, hx: 60 },
  ],
  breathe: [
    { torso: 180, thigh: 0, shin: 0, uArm: 12, fArm: 5, hx: 60 },
    { torso: 180, thigh: 0, shin: 0, uArm: 150, fArm: 165, hx: 60 },
  ],
};

export function kindFor(name: string): Kind {
  const n = name.toLowerCase();
  if (n.includes("wall")) return "wallpushup";
  if (n.includes("push")) return "pushup";
  if (n.includes("squat")) return "squat";
  if (n.includes("row")) return "row";
  if (n.includes("plank")) return "plank";
  if (n.includes("walk")) return "walk";
  if (n.includes("stretch")) return "stretch";
  if (n.includes("breath")) return "breathe";
  return "stretch";
}

function ik(s: Pt, target: Pt, l1: number, l2: number, bend: "left" | "down") {
  const dx = target[0] - s[0];
  const dy = target[1] - s[1];
  const d = Math.hypot(dx, dy) || 0.001;
  const dd = Math.min(Math.max(d, Math.abs(l1 - l2) + 0.01), l1 + l2 - 0.01);
  const a = (l1 * l1 - l2 * l2 + dd * dd) / (2 * dd);
  const h = Math.sqrt(Math.max(l1 * l1 - a * a, 0));
  const ux = dx / d;
  const uy = dy / d;
  const mx = s[0] + ux * a;
  const my = s[1] + uy * a;
  const e1: Pt = [mx - uy * h, my + ux * h];
  const e2: Pt = [mx + uy * h, my - ux * h];
  const elbow =
    bend === "left" ? (e1[0] < e2[0] ? e1 : e2) : e1[1] > e2[1] ? e1 : e2;
  const hand: Pt = [s[0] + ux * dd, s[1] + uy * dd];
  return { elbow, hand };
}

export function getSkeleton(kind: Kind, t: number): Skeleton {
  const [A, B] = POSES[kind];
  const f = (k: "torso" | "thigh" | "shin" | "uArm" | "fArm") => mix(A[k], B[k], t);
  const g = (
    k: "thigh2" | "shin2" | "uArm2" | "fArm2",
    base: "thigh" | "shin" | "uArm" | "fArm"
  ) => mix(A[k] ?? A[base], B[k] ?? B[base], t);

  const torso = f("torso");
  const thigh = f("thigh"), shin = f("shin");
  const thigh2 = g("thigh2", "thigh"), shin2 = g("shin2", "shin");
  const uArm = f("uArm"), fArm = f("fArm");
  const uArm2 = g("uArm2", "uArm"), fArm2 = g("fArm2", "fArm");

  const off1 = add(vec(thigh, LEN.thigh), vec(shin, LEN.shin));
  const off2 = add(vec(thigh2, LEN.thigh), vec(shin2, LEN.shin));

  const hipY = ANKLE_Y - Math.max(off1[1], off2[1]);
  const hipX = A.footX !== undefined ? A.footX - off1[0] : A.hx ?? 60;
  const hip: Pt = [hipX, hipY];

  const knee = add(hip, vec(thigh, LEN.thigh));
  const ankle = add(knee, vec(shin, LEN.shin));
  const toe = add(ankle, [7, 2]);
  const knee2 = add(hip, vec(thigh2, LEN.thigh));
  const ankle2 = add(knee2, vec(shin2, LEN.shin));
  const toe2 = add(ankle2, [7, 2]);

  const neck = add(hip, vec(torso, LEN.torso));
  const head = add(neck, vec(torso, LEN.head));

  let elbow: Pt, hand: Pt, elbow2: Pt, hand2: Pt;
  if (A.hand && B.hand) {
    const target: Pt = [mix(A.hand[0], B.hand[0], t), mix(A.hand[1], B.hand[1], t)];
    const r = ik(neck, target, LEN.upper, LEN.fore, A.bend ?? "left");
    elbow = r.elbow; hand = r.hand; elbow2 = r.elbow; hand2 = r.hand;
  } else {
    elbow = add(neck, vec(uArm, LEN.upper));
    hand = add(elbow, vec(fArm, LEN.fore));
    elbow2 = add(neck, vec(uArm2, LEN.upper));
    hand2 = add(elbow2, vec(fArm2, LEN.fore));
  }
  return { hip, neck, head, knee, ankle, toe, knee2, ankle2, toe2, elbow, hand, elbow2, hand2 };
}