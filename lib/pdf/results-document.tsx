/**
 * Results PDF. Same static content as the results page, in the order fixed
 * by section 8: framing, who is leading, Self, protectors, top-3 cards,
 * exiles (never before protectors), care note, disclaimer. No exercise
 * for an exile is ever included.
 */
import { Document, Font, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import path from "node:path";

// Brand sans embedded so Turkish and Romanian glyphs render (built-in Helvetica cannot).
const FONT_DIR = path.join(process.cwd(), "lib", "pdf", "fonts");
Font.register({
  family: "Jost",
  fonts: [
    { src: path.join(FONT_DIR, "Jost-Light.ttf"), fontWeight: 300 },
    { src: path.join(FONT_DIR, "Jost-Regular.ttf"), fontWeight: 400 },
    { src: path.join(FONT_DIR, "Jost-Medium.ttf"), fontWeight: 500 },
  ],
});
Font.registerHyphenationCallback((word) => [word]);
import { APP_NAME, type Locale } from "@/config/app";
import { getContent, type Content } from "@/content";
import { SCORING } from "@/config/scoring";
import {
  EXILE_KEYS, FIREFIGHTER_KEYS, MANAGER_KEYS, MIXED_KEYS,
  type ExileKey, type ProtectorKey, type Result,
} from "@/lib/scoring/types";

// Earth-toned palette mirroring the CSS variables; no red for high.
// Transcendent Institute alchemical palette (design system tokens.json).
const C = {
  ink: "#1c1c1c",
  muted: "#5a5a52",
  navy: "#1c244b",
  line: "#e4e7ec",
  paper: "#f3f5f8",
  parchment: "#f0e9c5",
  self: "#d9b139",
  manager: "#1c244b",
  firefighter: "#b27c66",
  exile: "#6e738a",
  track: "#e4e7ec",
};

const s = StyleSheet.create({
  page: { padding: 40, fontFamily: "Jost", fontWeight: 300, fontSize: 10.5, color: C.ink, backgroundColor: C.paper, lineHeight: 1.45 },
  h1: { fontFamily: "Jost", fontWeight: 400, fontSize: 22, lineHeight: 1.3, marginBottom: 6, color: C.navy },
  h2: { fontFamily: "Jost", fontWeight: 400, fontSize: 15, marginTop: 18, marginBottom: 6, color: C.navy },
  h3: { fontFamily: "Jost", fontWeight: 500, fontSize: 11, marginTop: 10, marginBottom: 3 },
  p: { marginBottom: 6 },
  muted: { color: C.muted, fontSize: 9.5 },
  box: { borderWidth: 1, borderColor: C.line, borderRadius: 4, padding: 10, marginBottom: 10 },
  careBox: { borderWidth: 1, borderColor: C.line, borderRadius: 4, padding: 10, marginBottom: 12, backgroundColor: C.parchment },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  label: { width: 140 },
  track: { flexGrow: 1, height: 7, backgroundColor: C.track, borderRadius: 4 },
  fill: { height: 7, borderRadius: 4 },
  value: { width: 110, textAlign: "right", color: C.muted, fontSize: 9 },
  card: { borderWidth: 1, borderColor: C.line, borderRadius: 4, padding: 10, marginBottom: 8 },
  field: { marginBottom: 3 },
  fieldLabel: { fontFamily: "Jost", fontWeight: 500 },
});

interface Props {
  result: Result;
  locale: Locale;
  mode: "public" | "cohort";
  generatedOn: string;
}

function Bar({ label, mean, display, color, band }: { label: string; mean: number; display: number; color: string; band: string }) {
  return (
    <View style={s.row}>
      <Text style={s.label}>{label}</Text>
      <View style={s.track}><View style={[s.fill, { width: `${display}%`, backgroundColor: color }]} /></View>
      <Text style={s.value}>{mean.toFixed(1)} · {band}</Text>
    </View>
  );
}

function ProtectorGroup({ title, keys, color, result, c }: { title: string; keys: readonly ProtectorKey[]; color: string; result: Result; c: Content }) {
  const sorted = [...keys].sort((a, b) => result.protectors.ranked.indexOf(a) - result.protectors.ranked.indexOf(b));
  return (
    <View>
      <Text style={s.h3}>{title}</Text>
      {sorted.map((k) => (
        <Bar key={k} label={c.typologies[k].name} mean={result.scales[k].mean} display={result.scales[k].display} color={color} band={c.bandLabels[result.scales[k].band]} />
      ))}
    </View>
  );
}

function Field({ label, text }: { label: string; text: string }) {
  return (
    <Text style={s.field}><Text style={s.fieldLabel}>{label}: </Text>{text}</Text>
  );
}

export function ResultsDocument({ result, locale, mode, generatedOn }: Props) {
  const c = getContent(locale);
  const L = c.pdf;
  const flooded = result.pattern.key === "FLOODED";
  const hiddenExiles = result.pattern.modifiers.includes("HIDDEN_EXILES");
  const topThree = result.protectors.ranked.slice(0, 3);
  const pattern = c.patterns[result.pattern.key];
  const activeExiles = EXILE_KEYS.filter((k) => result.scales[k].mean >= SCORING.pairings.exileMin);

  return (
    <Document title={`${APP_NAME[locale]}`} author="Transcendent Institute" language={locale}>
      <Page size="A4" style={s.page}>
        <Text style={s.h1}>{APP_NAME[locale]}</Text>
        <Text style={[s.muted, { marginBottom: 12 }]}>{L.generated} {generatedOn} · {L.form[result.form]} · {L.itemBank} {result.itemBankVersion} · {L.mode[mode]}</Text>

        {flooded && (
          <View style={s.careBox}><Text>{c.careNote}</Text></View>
        )}

        <Text style={s.p}>{c.framing}</Text>

        {/* 2. Who is leading */}
        <Text style={s.h2}>{L.whoIsLeading}</Text>
        <View style={s.box}>
          <Text style={s.h3}>{pattern.title}</Text>
          <Text style={s.p}>{pattern.body}</Text>
          {result.pattern.modifiers.map((m) => (
            <Text key={m} style={[s.p, s.muted]}>{c.modifiers[m]}</Text>
          ))}
          <Bar label={c.groupLabels.self} mean={result.self.mean} display={result.self.display} color={C.self} band={c.selfBandLabels[result.self.band]} />
          <Bar label={c.groupLabels.managers} mean={result.leads.manager} display={Math.round(((result.leads.manager - 1) / 4) * 100)} color={C.manager} band={L.lead} />
          <Bar label={c.groupLabels.firefighters} mean={result.leads.firefighter} display={Math.round(((result.leads.firefighter - 1) / 4) * 100)} color={C.firefighter} band={L.lead} />
          <Bar label={L.exileFeelings} mean={result.leads.exile} display={Math.round(((result.leads.exile - 1) / 4) * 100)} color={C.exile} band={L.lead} />
        </View>

        {/* 3. Self */}
        <Text style={s.h2}>{L.self}</Text>
        <Text style={s.p}>{L.selfLeadership}: {c.selfBandLabels[result.self.band]} ({result.self.display} / 100). {c.selfNote}</Text>

        {/* 4. Protector profile */}
        <Text style={s.h2}>{L.protectorProfile}</Text>
        <ProtectorGroup title={c.groupLabels.managers} keys={MANAGER_KEYS} color={C.manager} result={result} c={c} />
        <ProtectorGroup title={c.groupLabels.firefighters} keys={FIREFIGHTER_KEYS} color={C.firefighter} result={result} c={c} />
        <ProtectorGroup title={c.groupLabels.mixed} keys={MIXED_KEYS} color={C.manager} result={result} c={c} />

        {/* 5. Detail cards */}
        <Text style={[s.h2, { marginTop: 24 }]}>
          {result.protectors.leading ? L.leadingProtector : L.team}
        </Text>
        {topThree.map((k) => {
          const t = c.typologies[k];
          const linked = result.pairings.filter((p) => p.protector === k).map((p) => c.exiles[p.exile].name);
          return (
            <View key={k} style={s.card} wrap={false}>
              <Text style={s.h3}>{t.name} · {t.role}{t.proposed ? ` · ${L.proposed}` : ""}</Text>
              <Field label={L.howItShows} text={t.visibleBehaviour} />
              <Field label={L.triggers} text={t.triggers} />
              <Field label={L.strategy} text={t.strategy} />
              <Field label={L.wound} text={linked.length ? `${t.wound} ${c.pairingSentence(linked.join(", "))}` : t.wound} />
              <Field label={L.cost} text={t.cost} />
              <Field label={L.protectiveNeed} text={t.protectiveNeed} />
              <Text style={[s.muted, { marginTop: 4 }]}>{L.microQuestion}: “{c.microQuestion}”</Text>
            </View>
          );
        })}

        {/* 7. What is being protected (always after protectors) */}
        <Text style={s.h2}>{c.groupLabels.exiles}</Text>
        <Text style={s.p}>{c.exileSection.intro}</Text>
        {hiddenExiles ? (
          <View style={s.box}><Text>{c.exileSection.hidden}</Text></View>
        ) : (
          <View>
            {result.exiles.ranked.map((k: ExileKey) => (
              <Bar key={k} label={c.exiles[k].name} mean={result.scales[k].mean} display={result.scales[k].display} color={C.exile} band={c.bandLabels[result.scales[k].band]} />
            ))}
            {activeExiles.map((k) => (
              <View key={k} style={[s.box, { marginTop: 6 }]} wrap={false}>
                <Text style={s.h3}>{c.exiles[k].name}</Text>
                <Field label={L.howItFeels} text={c.exiles[k].howItFeels} />
                <Field label={L.burden} text={c.exiles[k].burdenBelief} />
                <Field label={L.longsFor} text={c.exiles[k].whatItNeeds} />
              </View>
            ))}
          </View>
        )}

        {/* 9. Care note */}
        <View style={[s.careBox, { marginTop: 14 }]}><Text>{c.careNote}</Text></View>
        <Text style={s.muted}>{c.disclaimer}</Text>
        {mode === "public" && !flooded && (
          <Text style={[s.muted, { marginTop: 8 }]}>{L.invite}</Text>
        )}
      </Page>
    </Document>
  );
}
