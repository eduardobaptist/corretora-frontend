import type { SVGProps } from "react";

// Ícones padrão do projeto: @gravity-ui/icons (o set usado pelo HeroUI v3).
// Aqui ficam só os que o Gravity não tem, no mesmo estilo (16x16, currentColor).
export {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowRightFromSquare,
  ArrowRightToSquare,
  ArrowUpArrowDown,
  ArrowUpFromLine,
  ArrowUpRightFromSquare,
  Bars,
  Car,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleDollar,
  CircleXmark,
  Clock,
  Envelope,
  Eye,
  EyeSlash,
  FilePlus,
  FileText,
  FloppyDisk,
  GeoPin,
  Heart,
  HeartFill,
  House,
  LayoutCellsLarge,
  Lock,
  Magnifier,
  MapPin,
  PaperPlane,
  Pencil,
  PencilToLine,
  Person,
  PersonGear,
  PersonPlus,
  Persons,
  Picture,
  Plus,
  ShieldCheck,
  Sliders,
  StarFill,
  Tags,
  TrashBin,
  Xmark,
} from "@gravity-ui/icons";

type IconProps = SVGProps<SVGSVGElement>;

export function Bed(props: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden {...props}>
      <path
        d="M1.75 3v10M1.75 10.25h12.5V13M14.25 10.25V8.5a2 2 0 0 0-2-2H7.5v3.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="4.5" cy="8" r="1.25" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function Bath(props: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden {...props}>
      <path
        d="M1.5 8h13v1.5a3.5 3.5 0 0 1-3.5 3.5H5a3.5 3.5 0 0 1-3.5-3.5V8ZM4 13l-.75 1.5M12 13l.75 1.5M3.5 8V3.25a1.5 1.5 0 0 1 2.9-.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
