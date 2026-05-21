import { Building2, CheckCircle2, CreditCard, ShieldCheck, UserRound } from 'lucide-react';
import { PaymentTransaction } from '../../types';

interface ProUpgradePanelProps {
  isCreatingPayment: boolean;
  onUpgrade: (tier: PaymentTransaction['tier']) => void;
}

export function ProUpgradePanel({ isCreatingPayment, onUpgrade }: ProUpgradePanelProps) {
  return (
    <div className="space-y-4">
      <section className="rounded-3xl bg-maldives-deep p-5 text-white shadow-lg shadow-slate-900/10">
        <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-100">AtollFeeNa Pro</p>
        <h2 className="mt-2 text-2xl font-display font-bold">Plan safer, better organised dives</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/80">
          Pro adds structured dive planning for individual divers and dive centres, using recent
          site intelligence, checklists, group details, and operational notes.
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <UpgradeCard
          icon={UserRound}
          title="Individual Diver Pro"
          price="MVR 150"
          points={['Personal dive plans', 'Recent site conditions', 'Buddy and equipment checks', 'Duplicate previous plans']}
          disabled={isCreatingPayment}
          onClick={() => onUpgrade('individual-diver-pro')}
        />
        <UpgradeCard
          icon={Building2}
          title="Dive Centre Pro"
          price="MVR 750"
          points={['Group dive planning', 'Staff, guide, and boat notes', 'Daily operation history', 'Briefing summaries']}
          disabled={isCreatingPayment}
          onClick={() => onUpgrade('dive-centre-pro')}
        />
      </div>

      <div className="rounded-3xl border border-amber-100 bg-amber-50 p-4 text-xs leading-relaxed text-amber-800">
        <div className="mb-2 flex items-center gap-2 font-bold">
          <ShieldCheck className="h-4 w-4" />
          Payment verification
        </div>
        Bank of Maldives payment credentials are not stored in the browser. A pending payment record
        is created first; Pro access is granted only after verified payment is recorded by an
        authorised admin or server-side process.
      </div>
    </div>
  );
}

function UpgradeCard({
  icon: Icon,
  title,
  price,
  points,
  disabled,
  onClick,
}: {
  icon: typeof UserRound;
  title: string;
  price: string;
  points: string[];
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <article className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-maldives-shallow/30 p-3 text-maldives-lagoon">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-maldives-deep">{title}</h3>
          <p className="text-sm font-bold text-maldives-lagoon">{price}</p>
        </div>
      </div>
      <ul className="mt-4 space-y-2">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-2 text-sm text-slate-600">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            {point}
          </li>
        ))}
      </ul>
      <button
        onClick={onClick}
        disabled={disabled}
        className="mt-5 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-maldives-deep px-4 text-sm font-bold text-white disabled:opacity-60"
      >
        <CreditCard className="h-4 w-4" />
        {disabled ? 'Creating request...' : 'Upgrade with BML'}
      </button>
    </article>
  );
}
