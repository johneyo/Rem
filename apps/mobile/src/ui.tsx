import { Pressable, Text, View, type PressableProps, type TextProps } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { initials } from "./format";
import { fonts, useTheme, type Theme } from "./theme";

export function T({ style, weight = "regular", ...rest }: TextProps & { weight?: keyof typeof fonts }) {
  const t = useTheme();
  return <Text {...rest} style={[{ color: t.ink, fontFamily: fonts[weight], fontSize: 15 }, style]} />;
}

const TINTS: ((t: Theme) => [string, string])[] = [
  (t) => [t.apricotTint, t.apricotInk],
  (t) => [t.skyTint, t.skyInk],
  (t) => [t.pineTint, t.pineInk],
  (t) => [t.coralTint, t.coralInk],
  (t) => [t.sunTint, t.sunInk],
];

export function Avatar({ name }: { name: string }) {
  const t = useTheme();
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const [bg, fg] = TINTS[h % TINTS.length]!(t);
  return (
    <View accessibilityElementsHidden importantForAccessibility="no" style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: bg, alignItems: "center", justifyContent: "center" }}>
      <T weight="bold" style={{ color: fg, fontSize: 14 }}>{initials(name)}</T>
    </View>
  );
}

export function Pill({ label, tone }: { label: string; tone: "coral" | "apricot" | "sky" | "pine" }) {
  const t = useTheme();
  const map = { coral: [t.coralTint, t.coralInk], apricot: [t.apricotTint, t.apricotInk], sky: [t.skyTint, t.skyInk], pine: [t.pineTint, t.pineInk] } as const;
  const [bg, fg] = map[tone];
  return (
    <View style={{ backgroundColor: bg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
      <T weight="semibold" style={{ color: fg, fontSize: 12 }}>{label}</T>
    </View>
  );
}

export function Button({ label, icon, variant = "primary", ...rest }: PressableProps & { label: string; icon?: React.ReactNode; variant?: "primary" | "subtle" }) {
  const t = useTheme();
  const primary = variant === "primary";
  return (
    <Pressable
      accessibilityRole="button"
      {...rest}
      style={({ pressed }) => ({
        height: 52,
        borderRadius: 14,
        paddingHorizontal: 20,
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: primary ? t.pine : t.subtle,
        opacity: pressed || rest.disabled ? 0.7 : 1,
      })}
    >
      {icon}
      <T weight="bold" style={{ color: primary ? t.onPine : t.ink, fontSize: 16 }}>{label}</T>
    </Pressable>
  );
}

/** Profile completeness as a ring. */
export function Ring({ score }: { score: number }) {
  const t = useTheme();
  const r = 17;
  const c = 2 * Math.PI * r;
  return (
    <View accessible accessibilityLabel={`Profile ${score}% complete`} style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}>
      <Svg width={40} height={40} style={{ position: "absolute" }}>
        <Circle cx={20} cy={20} r={r} stroke={t.pineTint} strokeWidth={4} fill="none" />
        <Circle cx={20} cy={20} r={r} stroke={t.pine} strokeWidth={4} fill="none" strokeDasharray={`${(c * score) / 100} ${c}`} strokeLinecap="round" transform="rotate(-90 20 20)" />
      </Svg>
      <T weight="bold" style={{ fontSize: 10 }}>{score}%</T>
    </View>
  );
}
