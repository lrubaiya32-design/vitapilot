import { useEffect, useState } from "react";
import { View } from "react-native";
import { colors } from "../constants/colors";
import { kindFor, getSkeleton, SIZE, GROUND, HEAD_R } from "../lib/figurePoses";

type Pt = [number, number];

function Seg({ a, b, w, color }: { a: Pt; b: Pt; w: number; color: string }) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  return (
    <View
      style={{
        position: "absolute",
        left: (a[0] + b[0]) / 2 - len / 2,
        top: (a[1] + b[1]) / 2 - w / 2,
        width: len,
        height: w,
        borderRadius: w / 2,
        backgroundColor: color,
        transform: [{ rotate: ang + "rad" }],
      }}
    />
  );
}

function Chain({ pts, w, color }: { pts: Pt[]; w: number; color: string }) {
  return (
    <>
      {pts.slice(1).map((p, i) => (
        <Seg key={i} a={pts[i]} b={p} w={w} color={color} />
      ))}
    </>
  );
}

export default function ExerciseFigure({ name }: { name: string }) {
  const kind = kindFor(name);
  const [t, setT] = useState(0);

  useEffect(() => {
    let frame = 0;
    const id = setInterval(() => {
      frame += 1;
      setT((1 - Math.cos(frame * 0.12)) / 2);
    }, 50);
    return () => clearInterval(id);
  }, []);

  const k = getSkeleton(kind, t);
  const far = "#64748B";
  const near = colors.text;

  return (
    <View style={{ width: SIZE, height: SIZE }}>
      <View
        style={{
          position: "absolute",
          left: 4,
          top: GROUND,
          width: SIZE - 8,
          height: 2,
          backgroundColor: "#334155",
        }}
      />
      {kind === "wallpushup" && (
        <View
          style={{
            position: "absolute",
            left: 112,
            top: 10,
            width: 3,
            height: GROUND - 10,
            backgroundColor: colors.sub,
          }}
        />
      )}

      <Chain pts={[k.hip, k.knee2, k.ankle2, k.toe2]} w={4} color={far} />
      <Chain pts={[k.neck, k.elbow2, k.hand2]} w={4} color={far} />
      <Chain pts={[k.hip, k.knee, k.ankle, k.toe]} w={5} color={near} />
      <Seg a={k.hip} b={k.neck} w={7} color={near} />
      <Chain pts={[k.neck, k.elbow, k.hand]} w={5} color={near} />
      <View
        style={{
          position: "absolute",
          left: k.head[0] - HEAD_R,
          top: k.head[1] - HEAD_R,
          width: HEAD_R * 2,
          height: HEAD_R * 2,
          borderRadius: HEAD_R,
          backgroundColor: colors.accent,
        }}
      />
    </View>
  );
}