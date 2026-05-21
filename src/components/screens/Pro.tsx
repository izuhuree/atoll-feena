import { User } from 'firebase/auth';
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { ArrowLeft, Crown, FileText } from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { useDivePlans } from '../../hooks/useDivePlans';
import { useProAccess } from '../../hooks/useProAccess';
import { DivePlan, DiveSite } from '../../types';
import { ProPlanCard } from '../pro/ProPlanCard';
import { ProPlannerForm } from '../pro/ProPlannerForm';
import { ProUpgradePanel } from '../pro/ProUpgradePanel';

interface ProProps {
  user: User | null;
  onBack: () => void;
}

export function Pro({ user, onBack }: ProProps) {
  const pro = useProAccess(user);
  const plans = useDivePlans(user, pro.subscription);
  const [sites, setSites] = useState<DiveSite[]>([]);
  const [sitesLoading, setSitesLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setSitesLoading(false);
      return;
    }
    setSitesLoading(true);
    const unsubscribe = onSnapshot(
      query(collection(db, 'diveSites'), orderBy('name'), limit(80)),
      (snapshot) => {
        setSites(snapshot.docs.map((siteDoc) => ({ id: siteDoc.id, ...siteDoc.data() } as DiveSite)));
        setSitesLoading(false);
      },
      () => setSitesLoading(false)
    );

    return () => unsubscribe();
  }, []);

  const duplicatePlan = async (plan: DivePlan) => {
    const now = new Date().toISOString();
    await plans.savePlan({
      ...plan,
      id: `plan-${Date.now()}`,
      status: 'draft',
      duplicatedFromPlanId: plan.id,
      createdAt: now,
      updatedAt: now,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-24 pt-8 sm:px-6">
      <header className="mb-5 flex items-center gap-3">
        <button onClick={onBack} aria-label="Back" className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-maldives-lagoon">Planning</p>
          <h1 className="font-display text-2xl font-bold text-maldives-deep">AtollFeeNa Pro</h1>
        </div>
      </header>

      {pro.loading ? (
        <Panel>Checking Pro access...</Panel>
      ) : !pro.hasAnyPro ? (
        <ProUpgradePanel
          error={pro.error}
          isCreatingPayment={pro.isCreatingPayment}
          paymentMessage={pro.paymentMessage}
          paymentUrlConfigured={pro.paymentUrlConfigured}
          onUpgrade={pro.createPaymentRequest}
        />
      ) : (
        <div className="space-y-5">
          <section className="rounded-3xl border border-cyan-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-50 p-3 text-maldives-lagoon">
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-lg font-bold text-maldives-deep">
                  {pro.tier === 'dive-centre-pro' ? 'Dive Centre Pro' : 'Individual Diver Pro'}
                </p>
                <p className="text-xs text-slate-500">Access verified through subscription status.</p>
              </div>
            </div>
          </section>

          {sitesLoading ? (
            <Panel>Loading dive sites for planning...</Panel>
          ) : sites.length === 0 ? (
            <Panel>No dive sites are available for planning yet.</Panel>
          ) : pro.subscription ? (
            <ProPlannerForm sites={sites} subscription={pro.subscription} isSaving={plans.isSaving} onSave={plans.savePlan} />
          ) : null}

          <section>
            <div className="mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-maldives-lagoon" />
              <h2 className="font-display text-xl font-bold text-maldives-deep">Plan history</h2>
            </div>
            {plans.loading ? (
              <Panel>Loading plans...</Panel>
            ) : plans.plans.length === 0 ? (
              <Panel>No Pro dive plans saved yet.</Panel>
            ) : (
              <div className="grid gap-3 lg:grid-cols-2">
                {plans.plans.map((plan) => (
                  <ProPlanCard key={plan.id} plan={plan} onDuplicate={duplicatePlan} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function Panel({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 text-sm font-semibold text-slate-500 shadow-sm">
      {children}
    </div>
  );
}
