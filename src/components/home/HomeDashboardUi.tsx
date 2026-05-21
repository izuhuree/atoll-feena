import { ReactNode } from 'react';
import {
  AlertTriangle,
  Anchor,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Fish,
  Gauge,
  Leaf,
  LifeBuoy,
  Map,
  Trash2,
  type LucideIcon,
} from 'lucide-react';

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-maldives-lagoon">{eyebrow}</p>
      <h3 className="mt-1 text-2xl font-display font-bold text-maldives-deep">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

export function DashboardCard({
  icon: Icon,
  title,
  description,
  children,
  compact = false,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <article className={`rounded-3xl border border-slate-100 bg-white shadow-sm ${compact ? 'p-4' : 'p-5'}`}>
      <div className={`flex items-start gap-3 ${compact ? 'mb-3' : 'mb-4'}`}>
        <div className="rounded-2xl bg-slate-50 p-2.5 shrink-0">
          <Icon className="h-5 w-5 text-maldives-lagoon" />
        </div>
        <div>
          <span className="mb-1 inline-flex rounded-full bg-cyan-50 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-cyan-700">
            Live data
          </span>
          <h4 className={`${compact ? 'text-base' : 'text-lg'} font-display font-bold text-maldives-deep`}>{title}</h4>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>
      {children}
    </article>
  );
}

export function InfoList({
  label,
  items,
  emptyText = 'No recent items.',
  maxItems,
  compact = false,
}: {
  label: string;
  items: string[];
  emptyText?: string;
  maxItems?: number;
  compact?: boolean;
}) {
  const visibleItems = maxItems ? items.slice(0, maxItems) : items;

  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      {visibleItems.length === 0 ? (
        <p className="mt-1 text-xs text-slate-500">{emptyText}</p>
      ) : (
        <ul className={`mt-2 ${compact ? 'space-y-1' : 'space-y-1.5'}`}>
          {visibleItems.map((item) => (
            <li key={`${label}-${item}`} className={`rounded-xl bg-slate-50 px-3 text-xs font-semibold text-slate-700 ${compact ? 'py-1.5' : 'py-2'}`}>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ActionTile({
  icon: Icon,
  title,
  subtitle,
  onClick,
  compact = false,
  featured = false,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  onClick?: () => void;
  compact?: boolean;
  featured?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border text-left shadow-sm active:scale-[0.98] ${compact ? 'p-3' : 'p-4'} ${
        featured ? 'border-cyan-100 bg-cyan-50/80' : 'border-slate-100 bg-white'
      }`}
    >
      <Icon className={`${featured ? 'text-cyan-700' : 'text-maldives-lagoon'} ${compact ? 'h-4 w-4' : 'h-5 w-5'}`} />
      <p className={`mt-2 font-display font-bold text-maldives-deep ${compact ? 'text-sm' : 'text-base'}`}>
        {title}
      </p>
      <p className={`text-slate-500 ${compact ? 'text-[11px]' : 'text-xs'}`}>{subtitle}</p>
    </button>
  );
}

export function LoadingPanel({ label, compact = false }: { label: string; compact?: boolean }) {
  return (
    <div className={`rounded-2xl bg-slate-50 text-slate-500 ${compact ? 'p-3 text-xs' : 'p-4 text-sm'}`}>
      {label}
    </div>
  );
}

export function EmptyPanel({ message, compact = false }: { message: string; compact?: boolean }) {
  return (
    <div className={`rounded-2xl border border-slate-100 bg-slate-50 text-slate-500 ${compact ? 'p-3 text-xs' : 'p-4 text-sm'}`}>
      {message}
    </div>
  );
}

export function ErrorPanel({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
      {message}
    </div>
  );
}

export function QuickMetric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number }) {
  return (
    <div className="rounded-xl bg-slate-50 px-2.5 py-2">
      <Icon className="mb-1.5 h-4 w-4 text-maldives-lagoon" />
      <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400 leading-tight">{label}</p>
      <p className="mt-1 text-lg font-display font-bold text-maldives-deep">{value}</p>
    </div>
  );
}

export function MetricIcon({ label }: { label: string }) {
  const Icon =
    label.includes('Dive Logs') ? ClipboardList :
    label.includes('Active Dive Sites') ? Anchor :
    label.includes('Atolls') ? Map :
    label.includes('Species') ? Fish :
    label.includes('Coral') ? Leaf :
    label.includes('Debris') ? Trash2 :
    label.includes('Safety') ? LifeBuoy :
    label.includes('Hazard') ? AlertTriangle :
    label.includes('Current') ? Gauge :
    AlertTriangle;

  return <Icon className="h-4 w-4" />;
}

export function SeeMoreButton({
  expanded,
  onClick,
  moreLabel = 'See more',
  lessLabel = 'Show less',
}: {
  expanded: boolean;
  onClick: () => void;
  moreLabel?: string;
  lessLabel?: string;
}) {
  const Icon = expanded ? ChevronUp : ChevronDown;
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-3 inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl bg-slate-50 px-4 text-xs font-bold text-maldives-deep active:scale-[0.98]"
    >
      {expanded ? lessLabel : moreLabel}
      <Icon className="h-4 w-4" />
    </button>
  );
}
