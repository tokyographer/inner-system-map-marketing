/**
 * Results PDF. Same static content as the results page, in the order fixed
 * by section 8: framing, who is leading, Self, protectors, top-3 cards,
 * exiles (never before protectors), care note, disclaimer. No exercise
 * for an exile is ever included.
 */
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { APP_NAME, type Locale } from "@/config/app";
import { EXILES, EXILE_SECTION_COPY } from "@/content/exiles.en";
import {
  BAND_LABELS, CARE_NOTE, DISCLAIMER, FRAMING, GROUP_LABELS, MODIFIERS, PAIRING_SENTENCE,
  PATTERNS, SELF_BAND_LABELS, SELF_NOTE,
} from "@/content/patterns.en";
import { MICRO_QUESTION, TYPOLOGIES } from "@/content/typologies.en";
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
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10.5, color: C.ink, backgroundColor: C.paper, lineHeight: 1.45 },
  h1: { fontFamily: "Times-Roman", fontSize: 22, marginBottom: 4, color: C.navy },
  h2: { fontFamily: "Times-Roman", fontSize: 15, marginTop: 18, marginBottom: 6, color: C.navy },
  h3: { fontFamily: "Helvetica-Bold", fontSize: 11, marginTop: 10, marginBottom: 3 },
  p: { marginBottom: 6 },
  muted: { color: C.muted, fontSize: 9.5 },
  box: { borderWidth: 1, borderColor: C.line, borderRadius: 4, padding: 10, marginBottom: 10 },
  careBox: { borderWidth: 1, borderColor: C.line, borderRadius: 4, padding: 10, marginBottom: 12, backgroundColor: C.parchment },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  label: { width: 150 },
  track: { flexGrow: 1, height: 7, backgroundColor: C.track, borderRadius: 4 },
  fill: { height: 7, borderRadius: 4 },
  value: { width: 70, textAlign: "right", color: C.muted, fontSize: 9 },
  card: { borderWidth: 1, borderColor: C.line, borderRadius: 4, padding: 10, marginBottom: 8 },
  field: { marginBottom: 3 },
  fieldLabel: { fontFamily: "Helvetica-Bold" },
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

function ProtectorGroup({ title, keys, color, result }: { title: string; keys: readonly ProtectorKey[]; color: string; result: Result }) {
  const sorted = [...keys].sort((a, b) => result.protectors.ranked.indexOf(a) - result.protectors.ranked.indexOf(b));
  return (
    <View>
      <Text style={s.h3}>{title}</Text>
      {sorted.map((k) => (
        <Bar key={k} label={TYPOLOGIES[k].name} mean={result.scales[k].mean} display={result.scales[k].display} color={color} band={BAND_LABELS[result.scales[k].band]} />
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
  const flooded = result.pattern.key === "FLOODED";
  const hiddenExiles = result.pattern.modifiers.includes("HIDDEN_EXILES");
  const topThree = result.protectors.ranked.slice(0, 3);
  const pattern = PATTERNS[result.pattern.key];
  const activeExiles = EXILE_KEYS.filter((k) => result.scales[k].mean >= SCORING.pairings.exileMin);

  return (
    <Document title={`${APP_NAME[locale]} results`} author="Transcendent Institute" language={locale}>
      <Page size="A4" style={s.page}>
        <Text style={s.h1}>{APP_NAME[locale]}</Text>
        <Text style={[s.muted, { marginBottom: 12 }]}>Generated {generatedOn} · {result.form} form · item bank {result.itemBankVersion} · {mode} mode</Text>

        {flooded && (
          <View style={s.careBox}><Text>{CARE_NOTE}</Text></View>
        )}

        <Text style={s.p}>{FRAMING}</Text>

        {/* 2. Who is leading */}
        <Text style={s.h2}>Who is leading?</Text>
        <View style={s.box}>
          <Text style={s.h3}>{pattern.title}</Text>
          <Text style={s.p}>{pattern.body}</Text>
          {result.pattern.modifiers.map((m) => (
            <Text key={m} style={[s.p, s.muted]}>{MODIFIERS[m]}</Text>
          ))}
          <Bar label={GROUP_LABELS.self} mean={result.self.mean} display={result.self.display} color={C.self} band={SELF_BAND_LABELS[result.self.band]} />
          <Bar label={GROUP_LABELS.managers} mean={result.leads.manager} display={Math.round(((result.leads.manager - 1) / 4) * 100)} color={C.manager} band="lead" />
          <Bar label={GROUP_LABELS.firefighters} mean={result.leads.firefighter} display={Math.round(((result.leads.firefighter - 1) / 4) * 100)} color={C.firefighter} band="lead" />
          <Bar label="Exile feelings" mean={result.leads.exile} display={Math.round(((result.leads.exile - 1) / 4) * 100)} color={C.exile} band="lead" />
        </View>

        {/* 3. Self */}
        <Text style={s.h2}>Self</Text>
        <Text style={s.p}>Self-leadership: {SELF_BAND_LABELS[result.self.band]} ({result.self.display} / 100). {SELF_NOTE}</Text>

        {/* 4. Protector profile */}
        <Text style={s.h2}>Protector profile</Text>
        <ProtectorGroup title={GROUP_LABELS.managers} keys={MANAGER_KEYS} color={C.manager} result={result} />
        <ProtectorGroup title={GROUP_LABELS.firefighters} keys={FIREFIGHTER_KEYS} color={C.firefighter} result={result} />
        <ProtectorGroup title={GROUP_LABELS.mixed} keys={MIXED_KEYS} color={C.manager} result={result} />
        {/* 5. Detail cards */}
        <Text style={[s.h2, { marginTop: 24 }]}>
          {result.protectors.leading ? "Your leading protector, and the parts beside it" : "A team of protectors"}
        </Text>
        {topThree.map((k) => {
          const t = TYPOLOGIES[k];
          const linked = result.pairings.filter((p) => p.protector === k).map((p) => EXILES[p.exile].name);
          return (
            <View key={k} style={s.card} wrap={false}>
              <Text style={s.h3}>{t.name} · {t.role}{t.proposed ? " · proposed scale" : ""}</Text>
              <Field label="How it tends to show up" text={t.visibleBehaviour} />
              <Field label="What tends to trigger it" text={t.triggers} />
              <Field label="Strategy" text={t.strategy} />
              <Field label="Wound" text={linked.length ? `${t.wound} ${PAIRING_SENTENCE(linked.join(" and "))}` : t.wound} />
              <Field label="Cost" text={t.cost} />
              <Field label="Protective need" text={t.protectiveNeed} />
              <Text style={[s.muted, { marginTop: 4 }]}>A question to bring to this part: “{MICRO_QUESTION}”</Text>
            </View>
          );
        })}

        {/* 7. What is being protected (always after protectors) */}
        <Text style={s.h2}>{GROUP_LABELS.exiles}</Text>
        <Text style={s.p}>{EXILE_SECTION_COPY.intro}</Text>
        {hiddenExiles ? (
          <View style={s.box}><Text>{EXILE_SECTION_COPY.hidden}</Text></View>
        ) : (
          <View>
            {result.exiles.ranked.map((k: ExileKey) => (
              <Bar key={k} label={EXILES[k].name} mean={result.scales[k].mean} display={result.scales[k].display} color={C.exile} band={BAND_LABELS[result.scales[k].band]} />
            ))}
            {activeExiles.map((k) => (
              <View key={k} style={[s.box, { marginTop: 6 }]} wrap={false}>
                <Text style={s.h3}>{EXILES[k].name}</Text>
                <Field label="How it can feel when it breaks through" text={EXILES[k].howItFeels} />
                <Field label="The burden it may carry" text={EXILES[k].burdenBelief} />
                <Field label="What it longs for" text={EXILES[k].whatItNeeds} />
              </View>
            ))}
          </View>
        )}

        {/* 9. Care note */}
        <View style={[s.careBox, { marginTop: 14 }]}><Text>{CARE_NOTE}</Text></View>
        <Text style={s.muted}>{DISCLAIMER}</Text>
        {mode === "public" && !flooded && (
          <Text style={[s.muted, { marginTop: 8 }]}>If you would like to get to know these parts in a held space, the Self Leadership Program at Transcendent Institute works with exactly this map. transcendentinstitute.com</Text>
        )}
      </Page>
    </Document>
  );
}
