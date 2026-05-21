import { Building2, CheckCircle2, CreditCard, ShieldCheck, UserRound } from 'lucide-react';
import { PaymentTransaction } from '../../types';

interface ProUpgradePanelProps {
  isCreatingPayment: boolean;
  onUpgrade: (tier: PaymentTransaction['tier']) => Promise<void>;
  error?: string | null;
  paymentMessage?: string | null;
  paymentUrlConfigured: boolean;
}

export function ProUpgradePanel({
  isCreatingPayment,
  onUpgrade,
  error,
  paymentMessage,
  paymentUrlConfigured,
}: ProUpgradePanelProps) {
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

      <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-maldives-lagoon">Compare plans</p>
          <h3 className="mt-1 font-display text-xl font-bold text-maldives-deep">Free vs Pro</h3>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-100">
          <CompareRow feature="Personal dive logging" free="Included" pro="Included" />
          <CompareRow feature="Citizen-science observations" free="Basic" pro="Included" />
          <CompareRow feature="Recent site conditions" free="View reports" pro="Plan with reports" />
          <CompareRow feature="Saved dive plans" free="Not included" pro="Included" />
          <CompareRow feature="Buddy and equipment checklist" free="Not included" pro="Included" />
          <CompareRow feature="Dive centre group planning" free="Not included" pro="Dive Centre Pro" />
          <CompareRow feature="Briefing and operational notes" free="Not included" pro="Dive Centre Pro" />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <UpgradeCard
          icon={UserRound}
          title="Individual Diver Pro"
          price="MVR 150"
          points={['Personal dive plans', 'Recent site conditions', 'Buddy and equipment checks', 'Duplicate previous plans']}
          disabled={isCreatingPayment}
          paymentUrlConfigured={paymentUrlConfigured}
          onClick={() => onUpgrade('individual-diver-pro')}
        />
        <UpgradeCard
          icon={Building2}
          title="Dive Centre Pro"
          price="MVR 750"
          points={['Group dive planning', 'Staff, guide, and boat notes', 'Daily operation history', 'Briefing summaries']}
          disabled={isCreatingPayment}
          paymentUrlConfigured={paymentUrlConfigured}
          onClick={() => onUpgrade('dive-centre-pro')}
        />
      </div>

      {paymentMessage ? (
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-4 text-xs font-semibold leading-relaxed text-emerald-800">
          {paymentMessage}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-3xl border border-red-100 bg-red-50 p-4 text-xs font-semibold leading-relaxed text-red-700">
          {error}
        </div>
      ) : null}

      <div className="rounded-3xl border border-amber-100 bg-amber-50 p-4 text-xs leading-relaxed text-amber-800">
        <div className="mb-2 flex items-center gap-2 font-bold">
          <ShieldCheck className="h-4 w-4" />
          Payment verification
        </div>
        Bank of Maldives Swipe credentials are stored only in Firebase Functions environment
        variables. Pro access is granted after the server verifies a successful Swipe payment.
      </div>
    </div>
  );
}

function CompareRow({ feature, free, pro }: { feature: string; free: string; pro: string }) {
  return (
    <div className="grid grid-cols-[1.25fr_0.85fr_0.85fr] border-b border-slate-100 last:border-b-0">
      <div className="bg-white px-3 py-3 text-xs font-bold text-maldives-deep">{feature}</div>
      <div className="bg-slate-50 px-2 py-3 text-center text-[11px] font-semibold text-slate-500">{free}</div>
      <div className="bg-cyan-50/70 px-2 py-3 text-center text-[11px] font-bold text-cyan-800">{pro}</div>
    </div>
  );
}

function UpgradeCard({
  icon: Icon,
  title,
  price,
  points,
  disabled,
  paymentUrlConfigured,
  onClick,
}: {
  icon: typeof UserRound;
  title: string;
  price: string;
  points: string[];
  disabled: boolean;
  paymentUrlConfigured: boolean;
  onClick: () => Promise<void>;
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
        {disabled ? 'Creating request...' : paymentUrlConfigured ? 'Upgrade with BML Swipe' : 'Create BML Request'}
      </button>
    </article>
  );
}
