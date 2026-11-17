import { useColorScheme } from "react-native";

/** Mirrors apps/web/app/globals.css (see docs/DESIGN.md). */
const light = {
  ground: "#F5F6F2",
  card: "#FFFFFF",
  ink: "#17201C",
  body: "#39443F",
  muted: "#56625C",
  line: "#E6EAE6",
  subtle: "#F0F1EC",
  pine: "#1F4D3F",
  onPine: "#FFFFFF",
  pineTint: "#E3EAE5",
  pineInk: "#1F4D3F",
  apricotTint: "#FCE7D2",
  apricotInk: "#7A4413",
  skyTint: "#DCE8F5",
  skyInk: "#234A72",
  coralTint: "#FFE4E0",
  coralInk: "#A3291A",
  sunTint: "#FFF1C9",
  sunInk: "#6B4B00",
};

const dark: typeof light = {
  ground: "#111714",
  card: "#1A221E",
  ink: "#EEF2EF",
  body: "#C6D0CA",
  muted: "#A3B0A9",
  line: "#2A3530",
  subtle: "#222B26",
  pine: "#8FD3B8",
  onPine: "#0E1A15",
  pineTint: "#22332B",
  pineInk: "#A9E0CA",
  apricotTint: "#3A2A1A",
  apricotInk: "#F6C08C",
  skyTint: "#1D2A38",
  skyInk: "#A9C8EA",
  coralTint: "#3A1F1B",
  coralInk: "#FFB3A8",
  sunTint: "#382E12",
  sunInk: "#FFD877",
};

/** Celebration colours (Confetti): the same in both themes. */
export const party = {
  coral: "#F0533F",
  sunflower: "#FFC83D",
  lilac: "#CFC4FF",
  ink: "#1E1B2E",
  paper: "#FFF8F1",
};

export const fonts = {
  regular: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semibold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
  extrabold: "PlusJakartaSans_800ExtraBold",
  serif: "Fraunces_600SemiBold",
  serifItalic: "Fraunces_400Regular_Italic",
};

export type Theme = typeof light;

export function useTheme(): Theme {
  return useColorScheme() === "dark" ? dark : light;
}
