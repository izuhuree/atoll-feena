import { useEffect, useState } from 'react';
import { collection, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { ClipboardCheck } from 'lucide-react';
import { db } from '../../lib/firebase';
import { DiveSiteEditSuggestion } from '../../types';

export function ReviewQueuePreview({ enabled }: { enabled: boolean }) {
  const [items, setItems] = useState<DiveSiteEditSuggestion[]>([]);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled || !db) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    return onSnapshot(
      query(
        collection(db, 'diveSiteEditSuggestions'),
        where('status', '==', 'pending'),
        orderBy('submittedAt', 'desc'),
        limit(5)
      ),
      (snapshot) => {
        setItems(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as DiveSiteEditSuggestion)));
        setLoading(false);
      },
      () => setLoading(false)
    );
  }, [enabled]);

  if (!enabled) return null;

  return (
    <section className="rounded-3xl border border-cyan-100 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <div className="rounded-2xl bg-cyan-50 p-2 text-maldives-lagoon">
          <ClipboardCheck className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-maldives-deep">Review Queue</h3>
          <p className="text-xs text-slate-500">Pending site descriptions and AI-assisted suggestions.</p>
        </div>
      </div>
      {loading ? (
        <p className="rounded-2xl bg-slate-50 p-3 text-xs font-semibold text-slate-500">Loading pending reviews...</p>
      ) : items.length === 0 ? (
        <p className="rounded-2xl bg-slate-50 p-3 text-xs font-semibold text-slate-500">No pending review items.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-bold text-maldives-deep">{item.siteName}</p>
                <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">
                  {item.reviewStatus || 'pending'}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                {item.proposedDescription || 'Structured site update awaiting review.'}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
