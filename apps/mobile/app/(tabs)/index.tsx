import { Link } from "expo-router";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api, apiBase, type UpcomingItem } from "@/api";
import { dateParts, longDate, momentTitle, OCCASION_LABELS, whenLabel } from "@/format";
import { CheckIcon, OccasionIcon, PlusIcon } from "@/icons";
import { fonts, party, useTheme } from "@/theme";
import { Button, Pill, T } from "@/ui";
import { useLoad } from "@/use-load";

function groupOf(daysAway: number) {
  if (daysAway <= 7) return "This week";
  if (daysAway <= 31) return "Next 30 days";
  return "Later";
}

/** The next moment in Confetti colours: the one place the app celebrates. */
function Hero({ m, onDone }: { m: UpcomingItem; onDone: () => void }) {
  return (
    <View style={{ backgroundColor: party.coral, borderRadius: 24, padding: 20, overflow: "hidden", gap: 16 }}>
      <View style={{ position: "absolute", top: -32, right: -32, width: 128, height: 128, borderRadius: 64, backgroundColor: party.sunflower }} />
      <View style={{ position: "absolute", bottom: 30, right: 96, width: 10, height: 28, borderRadius: 6, backgroundColor: party.paper, transform: [{ rotate: "28deg" }] }} />
      <View style={{ position: "absolute", top: 108, right: 30, width: 12, height: 12, borderRadius: 6, backgroundColor: party.ink }} />
      <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
        <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: party.paper, alignItems: "center", justifyContent: "center" }}>
          <OccasionIcon type={m.occasionType} color={party.ink} size={26} />
        </View>
        <View style={{ flex: 1 }}>
          <T weight="semibold" style={{ color: party.ink, fontSize: 14 }}>
            {dateParts(m.occursOn).weekday} · {whenLabel(m.daysAway).toLowerCase()}
          </T>
          <T style={{ color: party.ink, fontFamily: fonts.serif, fontSize: 28, lineHeight: 34 }}>{m.personName}</T>
          <T style={{ color: party.ink, fontFamily: fonts.serifItalic, fontSize: 22, lineHeight: 28 }}>{momentTitle(m).toLowerCase()}</T>
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={onDone}
        style={({ pressed }) => ({ alignSelf: "flex-start", height: 48, paddingHorizontal: 20, borderRadius: 999, backgroundColor: party.ink, flexDirection: "row", gap: 8, alignItems: "center", opacity: pressed ? 0.8 : 1 })}
      >
        <CheckIcon color={party.paper} size={18} />
        <T weight="semibold" style={{ color: party.paper }}>Mark done</T>
      </Pressable>
    </View>
  );
}

function Row({ m, onDone, last }: { m: UpcomingItem; onDone: () => void; last: boolean }) {
  const t = useTheme();
  const d = dateParts(m.occursOn);
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: last ? 0 : 1, borderBottomColor: t.line }}>
      <View style={{ width: 40, alignItems: "center" }}>
        <T weight="semibold" style={{ fontSize: 11, color: t.muted }}>{d.month}</T>
        <T weight="extrabold" style={{ fontSize: 20 }}>{d.day}</T>
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
        <T weight="semibold" numberOfLines={1}>{m.personName}</T>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <OccasionIcon type={m.occasionType} color={t.muted} size={14} />
          <T numberOfLines={1} style={{ fontSize: 13, color: t.muted, flexShrink: 1 }}>{momentTitle(m)}</T>
          {m.milestone ? <Pill label="Milestone" tone="coral" /> : <Pill label={whenLabel(m.daysAway)} tone={m.daysAway <= 7 ? "apricot" : "sky"} />}
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Mark ${m.personName}'s ${OCCASION_LABELS[m.occasionType].toLowerCase()} done`}
        onPress={onDone}
        hitSlop={4}
        style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: pressed ? t.subtle : "transparent" })}
      >
        <CheckIcon color={t.muted} />
      </Pressable>
    </View>
  );
}

function Tile({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  const t = useTheme();
  return (
    <View style={{ flex: 1, borderRadius: 16, padding: 14, backgroundColor: strong ? t.pine : t.card }}>
      <T style={{ fontSize: 13, color: strong ? t.onPine : t.muted, opacity: strong ? 0.85 : 1 }}>{label}</T>
      <T weight="extrabold" style={{ fontSize: 24, color: strong ? t.onPine : t.ink, marginTop: 2 }}>{value}</T>
    </View>
  );
}

export default function Upcoming() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { data, error, refreshing, reload } = useLoad(api.upcoming);

  const done = async (id: string) => {
    await api.markDone(id).catch(() => undefined);
    reload();
  };

  const items = data?.items ?? [];
  const [next, ...rest] = items;
  const groups = (["This week", "Next 30 days", "Later"] as const).map((g) => ({ g, list: rest.filter((i) => groupOf(i.daysAway) === g) }));

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.ground }}
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 16, gap: 18 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={reload} tintColor={t.pine} />}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
        <View>
          <T style={{ fontSize: 14, color: t.muted }}>{longDate(data?.timezone ?? "UTC")}</T>
          <T weight="extrabold" style={{ fontSize: 30, letterSpacing: -0.5 }}>Coming up</T>
        </View>
        <Link href="/add" asChild>
          <Pressable accessibilityRole="button" accessibilityLabel="Add someone" style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: t.pine, alignItems: "center", justifyContent: "center" }}>
            <PlusIcon color={t.onPine} size={24} />
          </Pressable>
        </Link>
      </View>

      {error && (
        <View style={{ backgroundColor: t.coralTint, borderRadius: 16, padding: 16, gap: 4 }}>
          <T weight="bold" style={{ color: t.coralInk }}>Can't reach Rem</T>
          <T style={{ color: t.coralInk, fontSize: 13 }}>{error}. Is the web app running at {apiBase()}?</T>
        </View>
      )}

      {data && items.length === 0 && (
        <View style={{ backgroundColor: t.card, borderRadius: 24, padding: 28, alignItems: "center", gap: 10 }}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: party.coral }} />
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: party.sunflower }} />
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: party.lilac }} />
          </View>
          <T weight="extrabold" style={{ fontSize: 20 }}>Nothing coming up yet</T>
          <T style={{ color: t.body, textAlign: "center" }}>Add the people you care about and Rem will remember their days for you.</T>
          <Link href="/add" asChild>
            <Button label="Add someone" icon={<PlusIcon color={t.onPine} size={18} />} />
          </Link>
        </View>
      )}

      {next && (
        <>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Tile label="This week" value={items.filter((i) => i.daysAway <= 7).length} strong />
            <Tile label="Milestones" value={items.filter((i) => i.milestone).length} />
            <Tile label="People" value={data?.peopleCount ?? 0} />
          </View>
          <Hero m={next} onDone={() => done(next.momentId)} />
        </>
      )}

      {groups.map(({ g, list }) =>
        list.length ? (
          <View key={g} style={{ gap: 8 }}>
            <T weight="bold" style={{ fontSize: 14 }}>{g}</T>
            <View style={{ backgroundColor: t.card, borderRadius: 18, overflow: "hidden" }}>
              {list.map((m, i) => (
                <Row key={m.momentId} m={m} last={i === list.length - 1} onDone={() => done(m.momentId)} />
              ))}
            </View>
          </View>
        ) : null,
      )}
    </ScrollView>
  );
}
