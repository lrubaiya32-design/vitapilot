import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "../../constants/colors";
import { vitals, streakDays, getReadiness, getBadge } from "../../lib/gymData";
import { library, allowed, categories } from "../../lib/exerciseLibrary";
import type { Category, LibExercise } from "../../lib/exerciseLibrary";
import { combineLimits, getHydration } from "../../lib/health";
import type { Source } from "../../lib/health";

const levelName = { rest: "Gentle", easy: "Light", hard: "Strong" } as const;

export default function Gym() {
  const router = useRouter();
  const r = getReadiness();
  const badge = getBadge(streakDays);
  const hyd = getHydration();

  const [tab, setTab] = useState<"normal" | "connect">("normal");
  const [menuOpen, setMenuOpen] = useState(false);
  const [sources, setSources] = useState<Source[]>(["medical"]);
  const [category, setCategory] = useState<Category>("Strength");
  const [picked, setPicked] = useState<string[]>([]);

  const limit = combineLimits(sources);
  const list: LibExercise[] =
    tab === "normal"
      ? library.filter((e) => e.category === category)
      : library.filter((e) => allowed(e, limit.cap, limit.avoid));
  const hidden = tab === "connect" ? library.length - list.length : 0;
  const pct = Math.min(hyd.drankMl / hyd.goalMl, 1);

  const toggleSource = (src: Source) => {
    setSources((prev) => {
      const next = prev.includes(src) ? prev.filter((x) => x !== src) : [...prev, src];
      return next.length ? next : prev;
    });
    setPicked([]);
  };

  const togglePick = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const start = () =>
    router.push({
      pathname: "/gym/workout",
      params: {
        ids: picked.join(","),
        title: tab === "normal" ? `${category} workout` : "Connected workout",
        mode: tab === "connect" ? limit.cap : "hard",
      },
    } as any);

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={s.c}>
      <View style={s.mini}>
        <Text style={s.miniText}>
          Readiness {r.score} ({r.label})  |  Sleep {vitals.sleepHours} h
        </Text>
      </View>

      <Text style={s.sessionNote}>Most sessions take just 10-15 minutes.</Text>

      {/* Normal | Connect v */}
      <View style={s.seg}>
        <TouchableOpacity
          style={[s.segBtn, tab === "normal" && s.segOn]}
          onPress={() => {
            setTab("normal");
            setMenuOpen(false);
            setPicked([]);
          }}
        >
          <Text style={[s.segText, tab === "normal" && s.segTextOn]}>Normal</Text>
        </TouchableOpacity>

        <View style={[s.segBtn, s.connectWrap, tab === "connect" && s.segOn]}>
          <TouchableOpacity
            style={{ flex: 1, alignItems: "center" }}
            onPress={() => {
              setTab("connect");
              setPicked([]);
            }}
          >
            <Text style={[s.segText, tab === "connect" && s.segTextOn]}>Connect</Text>
          </TouchableOpacity>
          <TouchableOpacity
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => {
              setTab("connect");
              setMenuOpen(!menuOpen);
              setPicked([]);
            }}
          >
            <Text style={[s.segText, tab === "connect" && s.segTextOn]}>
              {menuOpen ? "▲" : "▼"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {tab === "connect" && menuOpen && (
        <View style={s.menu}>
          {(["medical", "hydration"] as Source[]).map((src) => (
            <TouchableOpacity key={src} style={s.menuRow} onPress={() => toggleSource(src)}>
              <Text style={s.menuText}>{src === "medical" ? "Medical (Rx Autopilot)" : "Hydration"}</Text>
              <Text style={s.menuCheck}>{sources.includes(src) ? "✓" : ""}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* NORMAL: choose what kind of exercise */}
      {tab === "normal" && (
        <View style={s.chips}>
          {categories.map((c) => (
            <TouchableOpacity
              key={c}
              style={[s.chip, category === c && s.chipOn]}
              onPress={() => {
                setCategory(c);
                setPicked([]);
              }}
            >
              <Text style={[s.chipText, category === c && s.chipTextOn]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* CONNECT: show what the connected sectors say */}
      {tab === "connect" && (
        <>
          {sources.includes("medical") && (
            <View style={s.card}>
              <Text style={s.label}>MEDICAL (TODAY'S MEDICINES)</Text>
              {limit.notes
                .filter((n) => !n.startsWith("You drank"))
                .map((n, i) => (
                  <Text key={i} style={s.body}>
                    {n}
                  </Text>
                ))}
            </View>
          )}
          {sources.includes("hydration") && (
            <View style={s.card}>
              <Text style={s.label}>HYDRATION</Text>
              <View style={s.bar}>
                <View style={[s.barFill, { width: `${Math.round(pct * 100)}%` }]} />
              </View>
              {limit.notes
                .filter((n) => n.startsWith("You drank"))
                .map((n, i) => (
                  <Text key={i} style={s.body}>
                    {n}
                  </Text>
                ))}
            </View>
          )}
          <Text style={s.cap}>
            Your limit today: {levelName[limit.cap]} intensity
          </Text>
        </>
      )}

      <Text style={s.head}>
        {tab === "normal" ? `${category} exercises` : "Exercises you can do today"}
      </Text>
      <Text style={s.sub}>Tap to select what you want to do.</Text>

      {list.map((e) => {
        const on = picked.includes(e.id);
        return (
          <TouchableOpacity
            key={e.id}
            style={[s.row, on && s.rowOn]}
            onPress={() => togglePick(e.id)}
          >
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{e.name}</Text>
              <Text style={s.sub}>
                {e.sets} x {e.reps}  |  {levelName[e.level]}
              </Text>
            </View>
            <Text style={s.check}>{on ? "✓" : "○"}</Text>
          </TouchableOpacity>
        );
      })}

      {hidden > 0 && (
        <Text style={s.hidden}>
          {hidden} exercises are hidden today to keep you safe.
        </Text>
      )}

      <TouchableOpacity
        style={[s.btn, picked.length === 0 && { opacity: 0.4 }]}
        onPress={start}
        disabled={picked.length === 0}
      >
        <Text style={s.btnText}>Start workout ({picked.length})</Text>
      </TouchableOpacity>

      <Text style={s.streak}>
        {badge.name}  |  {streakDays} day streak
      </Text>

      <View style={s.linkRow}>
        <TouchableOpacity onPress={() => router.push("/progress" as any)}>
          <Text style={s.link}>This Week's Progress →</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/checkin" as any)}>
          <Text style={s.link}>Daily Check-In →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c: { padding: 20, paddingBottom: 40 },
  mini: { backgroundColor: colors.card, borderRadius: 12, padding: 12, marginBottom: 14 },
  miniText: { color: colors.sub, fontSize: 13 },
  sessionNote: { color: colors.sub, fontSize: 13, marginBottom: 10, fontStyle: "italic" },
  seg: { flexDirection: "row", backgroundColor: colors.card, borderRadius: 14, padding: 4 },
  segBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  connectWrap: { flexDirection: "row", paddingHorizontal: 14 },
  segOn: { backgroundColor: colors.accent },
  segText: { color: colors.sub, fontWeight: "700", fontSize: 16 },
  segTextOn: { color: "#fff" },
  menu: { backgroundColor: colors.card, borderRadius: 12, marginTop: 8, borderWidth: 1, borderColor: "#334155" },
  menuRow: { flexDirection: "row", justifyContent: "space-between", padding: 14 },
  menuText: { color: colors.text, fontSize: 16 },
  menuCheck: { color: colors.teal, fontSize: 18, fontWeight: "800" },
  chips: { flexDirection: "row", flexWrap: "wrap", marginTop: 14 },
  chip: { backgroundColor: colors.card, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  chipOn: { backgroundColor: colors.teal },
  chipText: { color: colors.sub, fontWeight: "600" },
  chipTextOn: { color: "#fff" },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginTop: 14, borderWidth: 1, borderColor: "#334155" },
  label: { color: colors.sub, fontSize: 12, fontWeight: "700", letterSpacing: 1 },
  body: { color: colors.text, fontSize: 15, lineHeight: 22, marginTop: 6 },
  bar: { height: 10, backgroundColor: "#334155", borderRadius: 5, marginTop: 10, overflow: "hidden" },
  barFill: { height: 10, backgroundColor: colors.blue },
  cap: { color: colors.purple, fontWeight: "700", marginTop: 14 },
  head: { color: colors.text, fontSize: 20, fontWeight: "700", marginTop: 20 },
  sub: { color: colors.sub, marginTop: 4 },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: colors.card, borderRadius: 14, padding: 14, marginTop: 10, borderWidth: 1, borderColor: "#334155" },
  rowOn: { borderColor: colors.teal },
  name: { color: colors.text, fontSize: 16, fontWeight: "700" },
  check: { color: colors.teal, fontSize: 22, fontWeight: "800", marginLeft: 10 },
  hidden: { color: colors.sub, marginTop: 12, fontStyle: "italic" },
  btn: { backgroundColor: colors.accent, padding: 18, borderRadius: 16, alignItems: "center", marginTop: 20 },
  btnText: { color:"#fff", fontWeight: "800", fontSize: 18 },
  streak: { color: colors.sub, textAlign: "center", marginTop: 16 },
  linkRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  link: { color: colors.teal, fontSize: 13, fontWeight: "600" },
});