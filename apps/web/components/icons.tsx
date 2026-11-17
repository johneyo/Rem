import type { OccasionType } from "@rem/db";
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 20, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const CalendarIcon = (p: IconProps) => (
  <Svg {...p}><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" /></Svg>
);
export const PeopleIcon = (p: IconProps) => (
  <Svg {...p}><circle cx="9" cy="8" r="4" /><path d="M2 21c0-4 3-6 7-6s7 2 7 6" /><path d="M16 4a4 4 0 0 1 0 8M19 15c2 .7 3 2.6 3 6" /></Svg>
);
export const UploadIcon = (p: IconProps) => (
  <Svg {...p}><path d="M12 15V3M7 8l5-5 5 5M4 21h16" /></Svg>
);
export const PlusIcon = (p: IconProps) => <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>;
export const CheckIcon = (p: IconProps) => <Svg {...p}><path d="M20 6 9 17l-5-5" /></Svg>;
export const SparkleIcon = (p: IconProps) => (
  <Svg {...p}><path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4z" /></Svg>
);
const CakeIcon = (p: IconProps) => (
  <Svg {...p}><path d="M4 21h16M5 21v-7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7" /><path d="M5 16c2 1.5 3.5 1.5 5 0s3.5-1.5 5 0 3 1.5 4 0M12 12V8" /></Svg>
);
const RingsIcon = (p: IconProps) => (
  <Svg {...p}><circle cx="9" cy="14" r="5" /><circle cx="15" cy="14" r="5" /><path d="M9 6l1.5-2h-3z" /></Svg>
);
const HeartIcon = (p: IconProps) => (
  <Svg {...p}><path d="M12 20s-7-4.3-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.7-7 9-7 9z" /></Svg>
);
const BriefcaseIcon = (p: IconProps) => (
  <Svg {...p}><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /></Svg>
);
const CapIcon = (p: IconProps) => (
  <Svg {...p}><path d="M2 9l10-5 10 5-10 5z" /><path d="M6 11v5c3 2 9 2 12 0v-5" /></Svg>
);
const HomeIcon = (p: IconProps) => <Svg {...p}><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></Svg>;
const CandleIcon = (p: IconProps) => (
  <Svg {...p}><rect x="9" y="10" width="6" height="11" rx="1" /><path d="M12 7c1-1 1-2.5 0-4-1 1.5-1 3 0 4z" /></Svg>
);

const OCCASION_ICONS: Record<OccasionType, (p: IconProps) => React.ReactElement> = {
  birthday: CakeIcon,
  wedding_anniversary: RingsIcon,
  dating_anniversary: HeartIcon,
  work_anniversary: BriefcaseIcon,
  graduation: CapIcon,
  new_baby: HeartIcon,
  new_job: BriefcaseIcon,
  retirement: SparkleIcon,
  housewarming: HomeIcon,
  memorial: CandleIcon,
  custom: SparkleIcon,
};

export function OccasionIcon({ type, ...p }: IconProps & { type: OccasionType }) {
  const Icon = OCCASION_ICONS[type];
  return <Icon {...p} />;
}
