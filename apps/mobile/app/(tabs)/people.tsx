import { Link } from "expo-router";
import { FlatList, Pressable, RefreshControl, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "@/api";
import { MONTHS, OCCASION_LABELS } from "@/format";
import { OccasionIcon, PlusIcon } from "@/icons";
import { useTheme } from "@/theme";
import { Avatar, Ring, T } from "@/ui";
import { useLoad } from "@/use-load";

export default function People() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { data, error, refreshing, reload } = useLoad(api.people);
  const people = data?.people ?? [];
  const missing = people.filter((p) => !p.occasions.some((o) => o.type === "birthday")).length;

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: t.ground }}
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 16, gap: 0 }}
      data={people}
      keyExtractor={(p) => p.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={reload} tintColor={t.pine} />}
      ListHeaderComponent={
        <View style={{ gap: 4, marginBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <T weight="extrabold" style={{ fontSize: 30, letterSpacing: -0.5 }}>People</T>
            <Link href="/add" asChild>
              <Pressable accessibilityRole="button" accessibilityLabel="Add someone" style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: t.pine, alignItems: "center", justifyContent: "center" }}>
                <PlusIcon color={t.onPine} size={24} />
              </Pressable>
            </Link>
          </View>
          <T style={{ color: t.muted, fontSize: 14 }}>
            {people.length} {people.length === 1 ? "person" : "people"}
            {missing > 0 ? ` · ${missing} missing a birthday` : ""}
          </T>
          {error && <T style={{ color: t.coralInk, marginTop: 8 }}>{error}</T>}
        </View>
      }
      renderItem={({ item: p, index }) => (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            padding: 14,
            backgroundColor: t.card,
            borderTopLeftRadius: index === 0 ? 18 : 0,
            borderTopRightRadius: index === 0 ? 18 : 0,
            borderBottomLeftRadius: index === people.length - 1 ? 18 : 0,
            borderBottomRightRadius: index === people.length - 1 ? 18 : 0,
            borderBottomWidth: index === people.length - 1 ? 0 : 1,
            borderBottomColor: t.line,
          }}
        >
          <Avatar name={p.displayName} />
          <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
            <T weight="semibold" numberOfLines={1}>{p.displayName}</T>
            {p.occasions.length ? (
              <View style={{ flexDirection: "row", flexWrap: "wrap", columnGap: 12 }}>
                {p.occasions.map((o) => (
                  <View key={o.id} accessible accessibilityLabel={`${OCCASION_LABELS[o.type]} ${o.day} ${MONTHS[o.month - 1]}`} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <OccasionIcon type={o.type} color={t.muted} size={14} />
                    <T style={{ fontSize: 13, color: t.muted }}>{o.day} {MONTHS[o.month - 1]}</T>
                  </View>
                ))}
              </View>
            ) : (
              <T style={{ fontSize: 13, color: t.apricotInk }}>No dates yet</T>
            )}
          </View>
          <Ring score={p.completeness} />
        </View>
      )}
    />
  );
}
