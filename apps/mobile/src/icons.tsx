import Svg, { Circle, Path, Rect } from "react-native-svg";
import type { OccasionType } from "./api";

type P = { size?: number; color: string };

function Base({ size = 20, color, children }: P & { children: React.ReactNode }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </Svg>
  );
}

export const CalendarIcon = (p: P) => (
  <Base {...p}><Rect x={3} y={5} width={18} height={16} rx={3} /><Path d="M3 10h18M8 3v4M16 3v4" /></Base>
);
export const PeopleIcon = (p: P) => (
  <Base {...p}><Circle cx={9} cy={8} r={4} /><Path d="M2 21c0-4 3-6 7-6s7 2 7 6M16 4a4 4 0 0 1 0 8M19 15c2 .7 3 2.6 3 6" /></Base>
);
export const PlusIcon = (p: P) => <Base {...p}><Path d="M12 5v14M5 12h14" /></Base>;
export const CheckIcon = (p: P) => <Base {...p}><Path d="M20 6 9 17l-5-5" /></Base>;
export const CloseIcon = (p: P) => <Base {...p}><Path d="M18 6 6 18M6 6l12 12" /></Base>;

const Cake = (p: P) => (
  <Base {...p}><Path d="M4 21h16M5 21v-7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7M5 16c2 1.5 3.5 1.5 5 0s3.5-1.5 5 0 3 1.5 4 0M12 12V8" /></Base>
);
const Rings = (p: P) => (
  <Base {...p}><Circle cx={9} cy={14} r={5} /><Circle cx={15} cy={14} r={5} /><Path d="M9 6l1.5-2h-3z" /></Base>
);
const Heart = (p: P) => <Base {...p}><Path d="M12 20s-7-4.3-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.7-7 9-7 9z" /></Base>;
const Briefcase = (p: P) => (
  <Base {...p}><Rect x={3} y={7} width={18} height={13} rx={2} /><Path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /></Base>
);
const Cap = (p: P) => <Base {...p}><Path d="M2 9l10-5 10 5-10 5zM6 11v5c3 2 9 2 12 0v-5" /></Base>;
const House = (p: P) => <Base {...p}><Path d="M3 11l9-7 9 7M5 10v10h14V10" /></Base>;
const Sparkle = (p: P) => <Base {...p}><Path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4z" /></Base>;
const Candle = (p: P) => <Base {...p}><Rect x={9} y={10} width={6} height={11} rx={1} /><Path d="M12 7c1-1 1-2.5 0-4-1 1.5-1 3 0 4z" /></Base>;

const BY_TYPE: Record<OccasionType, (p: P) => React.ReactElement> = {
  birthday: Cake,
  wedding_anniversary: Rings,
  dating_anniversary: Heart,
  work_anniversary: Briefcase,
  graduation: Cap,
  new_baby: Heart,
  new_job: Briefcase,
  retirement: Sparkle,
  housewarming: House,
  memorial: Candle,
  custom: Sparkle,
};

export function OccasionIcon({ type, ...p }: P & { type: OccasionType }) {
  const Icon = BY_TYPE[type];
  return <Icon {...p} />;
}
