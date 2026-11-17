import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View, type TextInputProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "@/api";
import { MONTHS } from "@/format";
import { CloseIcon } from "@/icons";
import { fonts, useTheme } from "@/theme";
import { Button, T } from "@/ui";

function Field({ label, ...rest }: TextInputProps & { label: string }) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: 6, flex: rest.style ? undefined : 1 }}>
      <T weight="semibold" style={{ fontSize: 13, color: t.body }}>{label}</T>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={t.muted}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...rest}
        style={[
          { height: 50, borderRadius: 12, paddingHorizontal: 14, backgroundColor: t.subtle, color: t.ink, fontFamily: fonts.medium, fontSize: 16, borderWidth: 2, borderColor: focused ? t.pine : "transparent" },
          rest.style,
        ]}
      />
    </View>
  );
}

export default function AddPerson() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState({ displayName: "", email: "", phone: "", day: "", month: "0", year: "" });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await api.addPerson({ ...form, day: form.month === "0" ? "0" : form.day || "0" });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: t.ground }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: Platform.OS === "android" ? insets.top + 16 : 20, gap: 16 }} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <T weight="extrabold" style={{ fontSize: 26 }}>Add someone</T>
          <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={() => router.back()} style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: t.card, alignItems: "center", justifyContent: "center" }}>
            <CloseIcon color={t.ink} />
          </Pressable>
        </View>

        <View style={{ backgroundColor: t.card, borderRadius: 20, padding: 18, gap: 14 }}>
          <Field label="Name" value={form.displayName} onChangeText={set("displayName")} placeholder="Ada Obi" autoCapitalize="words" />
          <Field label="Email (optional)" value={form.email} onChangeText={set("email")} placeholder="ada@example.com" keyboardType="email-address" autoCapitalize="none" />
          <Field label="Phone (optional)" value={form.phone} onChangeText={set("phone")} placeholder="+44 7700 900123" keyboardType="phone-pad" />

          <T weight="semibold" style={{ fontSize: 13, color: t.body }}>Birthday month</T>
          <View accessibilityRole="radiogroup" style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {MONTHS.map((m, i) => {
              const on = form.month === String(i + 1);
              return (
                <Pressable
                  key={m}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: on }}
                  onPress={() => set("month")(on ? "0" : String(i + 1))}
                  style={{ minWidth: 56, height: 44, paddingHorizontal: 12, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: on ? t.pine : t.subtle }}
                >
                  <T weight="semibold" style={{ color: on ? t.onPine : t.ink }}>{m}</T>
                </Pressable>
              );
            })}
          </View>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Field label="Day" value={form.day} onChangeText={set("day")} placeholder="14" keyboardType="number-pad" maxLength={2} />
            <Field label="Year (optional)" value={form.year} onChangeText={set("year")} placeholder="1996" keyboardType="number-pad" maxLength={4} />
          </View>
        </View>

        {error && (
          <View accessibilityLiveRegion="polite" style={{ backgroundColor: t.coralTint, borderRadius: 12, padding: 12 }}>
            <T weight="semibold" style={{ color: t.coralInk }}>{error}</T>
          </View>
        )}
        <Button label={saving ? "Saving…" : "Add"} onPress={save} disabled={saving || !form.displayName.trim()} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
