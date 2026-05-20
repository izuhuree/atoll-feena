import { Atoll, DiveLog } from '../../types';
import { MapPin } from 'lucide-react';
import { useAtolls } from '../../hooks/useAtolls';
import { useFilteredDiveSites } from '../../hooks/useFilteredDiveSites';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

interface SiteSelectionPanelProps {
  formData: Partial<DiveLog>;
  setFormData: (data: Partial<DiveLog>) => void;
  onNext: () => void;
}

/**
 * Step 1 — Site selection.
 * - Uses the Firestore-backed atoll list.
 * - No more silent auto-advance: the user controls the Next button.
 */
export function SiteSelectionPanel({ formData, setFormData }: SiteSelectionPanelProps) {
  const { atolls } = useAtolls();
  const debouncedIsland = useDebouncedValue(formData.island || '');
  const { sites: matchingSites, hasMore, loadMore, loadingMore } = useFilteredDiveSites({
    atoll: formData.atoll || 'All',
    islandSearch: debouncedIsland,
    siteSearch: '',
  });
  const isCustom = formData.siteId === 'custom';
  const needsCustomName = isCustom && !formData.customSiteName?.trim();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-maldives-deep">Where did you dive?</h2>
        <p className="text-slate-500 mb-6 font-medium">
          Pick a known site, or enter your own.
        </p>

        <div className="space-y-4">
          <label
            htmlFor="dive-site-select"
            className="text-xs font-bold uppercase tracking-wider text-slate-500"
          >
            Dive Site
          </label>
          <div className="relative">
            <select
              id="dive-site-select"
              className="w-full p-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-maldives-lagoon/30 appearance-none font-semibold text-maldives-deep min-h-[56px]"
              value={formData.siteId || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'custom') {
                  setFormData({ ...formData, siteId: 'custom', customSiteName: '' });
                  return;
                }
                const selectedSite = matchingSites.find((s) => s.id === value);
                if (selectedSite) {
                  setFormData({
                    ...formData,
                    siteId: selectedSite.id,
                    atoll: selectedSite.atoll,
                    customSiteName: selectedSite.name,
                  });
                }
              }}
            >
              <option value="" disabled>
                Choose a site…
              </option>
              {matchingSites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name} ({site.atoll})
                </option>
              ))}
              <option value="custom">+ Other / New Site</option>
            </select>
            <MapPin className="absolute right-5 top-1/2 -translate-y-1/2 text-maldives-lagoon w-5 h-5 pointer-events-none" />
          </div>
          {hasMore && (
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="w-full min-h-[44px] rounded-2xl bg-slate-100 text-xs font-bold uppercase tracking-widest text-slate-600"
            >
              {loadingMore ? 'Loading...' : 'Load More Sites'}
            </button>
          )}

          {isCustom && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <label
                htmlFor="custom-site-name"
                className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2"
              >
                Custom Site Name
              </label>
              <input
                id="custom-site-name"
                type="text"
                placeholder="e.g. Banana Reef North"
                className="w-full p-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-maldives-lagoon/30 min-h-[56px]"
                value={formData.customSiteName || ''}
                onChange={(e) =>
                  setFormData({ ...formData, customSiteName: e.target.value, siteId: 'custom' })
                }
                aria-invalid={needsCustomName}
              />
              {needsCustomName && (
                <p className="text-xs text-rose-500 mt-2 font-medium">
                  Give your custom site a name to continue.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label
            htmlFor="atoll-select"
            className="text-xs font-bold uppercase tracking-wider text-slate-500"
          >
            Atoll
          </label>
          <select
            id="atoll-select"
            className="w-full p-4 bg-slate-50 rounded-2xl border-none appearance-none min-h-[52px] font-medium"
            value={formData.atoll}
            onChange={(e) => setFormData({ ...formData, atoll: e.target.value as Atoll })}
          >
            {atolls.length === 0 && <option value="">Atolls not configured</option>}
            {atolls.map((atoll) => (
              <option key={atoll.id} value={atoll.name}>
                {atoll.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="island-input"
            className="text-xs font-bold uppercase tracking-wider text-slate-500"
          >
            Island
          </label>
          <input
            id="island-input"
            type="text"
            placeholder="Resort / Local"
            className="w-full p-4 bg-slate-50 rounded-2xl border-none min-h-[52px]"
            value={formData.island}
            onChange={(e) => setFormData({ ...formData, island: e.target.value })}
            autoCapitalize="words"
          />
        </div>
      </div>
    </div>
  );
}
