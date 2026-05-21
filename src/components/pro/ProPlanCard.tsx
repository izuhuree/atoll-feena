import { Copy, UsersRound } from 'lucide-react';
import { DivePlan } from '../../types';

export function ProPlanCard({
  plan,
  onDuplicate,
}: {
  plan: DivePlan;
  onDuplicate: (plan: DivePlan) => void;
}) {
  return (
    <article className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{plan.status}</p>
          <h3 className="mt-1 font-display text-lg font-bold text-maldives-deep">{plan.siteName}</h3>
          <p className="text-xs text-slate-500">{plan.plannedDate} at {plan.plannedTime}</p>
        </div>
        <button
          onClick={() => onDuplicate(plan)}
          aria-label="Duplicate plan"
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-slate-500"
        >
          <Copy className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Metric label="Depth" value={`${plan.plannedDepthMeters}m`} />
        <Metric label="Bottom" value={`${plan.plannedBottomTimeMinutes}m`} />
        <Metric label="Gas" value={plan.gasType} />
      </div>
      {plan.planType === 'dive-centre' && (
        <p className="mt-3 flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
          <UsersRound className="h-4 w-4 text-maldives-lagoon" />
          {plan.participants.length} participant{plan.participants.length === 1 ? '' : 's'}
        </p>
      )}
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-2 py-2">
      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-maldives-deep">{value}</p>
    </div>
  );
}
