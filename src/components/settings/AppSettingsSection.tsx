import { User } from 'firebase/auth';
import { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Database, Save, Settings2, Sparkles } from 'lucide-react';
import { DEFAULT_APP_SETTINGS, useAppSettings } from '../../hooks/useAppSettings';
import { AppSettings } from '../../types';

interface AppSettingsSectionProps {
  enabled: boolean;
  user: User | null;
}

export function AppSettingsSection({ enabled, user }: AppSettingsSectionProps) {
  const { effectiveSettings, isLoading, isSaving, error, saveSettings } = useAppSettings(enabled, user);
  const [form, setForm] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setForm(effectiveSettings);
  }, [effectiveSettings]);

  const updateField = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async () => {
    await saveSettings(form);
    setMessage('Settings saved.');
  };

  return (
    <section className="space-y-4">
      <div className="flex items-start gap-3 px-1">
        <div className="w-11 h-11 rounded-2xl bg-maldives-deep/10 flex items-center justify-center shrink-0">
          <Settings2 className="w-5 h-5 text-maldives-deep" />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold text-maldives-deep">App Settings</h3>
          <p className="text-xs text-slate-500 leading-relaxed mt-1">
            Configure contribution review, AI sketches, observation quality, and data readiness.
          </p>
        </div>
      </div>

      {isLoading && <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">Loading settings...</p>}
      {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      {message && <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-4">
        <label className="block">
          <span className="text-xs font-semibold text-slate-500">App name</span>
          <input
            value={form.appName || ''}
            onChange={(event) => updateField('appName', event.target.value)}
            className="mt-1 w-full min-h-[44px] rounded-xl border border-slate-200 px-3 text-sm"
          />
        </label>

        <SettingToggle
          label="Review dive site description edits"
          description="Community edits enter review before changing published dive site content."
          checked={form.contributionReviewRequired !== false}
          onChange={(checked) => updateField('contributionReviewRequired', checked)}
        />
        <SettingToggle
          label="Review species and reef observations"
          description="Keep conservation records in a reviewable state before higher-trust use."
          checked={form.speciesObservationReviewRequired !== false}
          onChange={(checked) => updateField('speciesObservationReviewRequired', checked)}
        />
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-4">
        <SectionHeader icon={<Sparkles className="w-4 h-4" />} title="Sketch Settings" />
        <SettingToggle
          label="Enable AI dive site sketches"
          description="Authorised users can regenerate sketches from reviewed sketch instructions."
          checked={form.sketchGenerationEnabled !== false}
          onChange={(checked) => updateField('sketchGenerationEnabled', checked)}
        />
        <SettingToggle
          label="Start sketch instructions from site description"
          description="New sketch instruction drafts can inherit the general dive site description."
          checked={form.defaultSketchInstructionsFromDescription !== false}
          onChange={(checked) => updateField('defaultSketchInstructionsFromDescription', checked)}
        />
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-4">
        <SectionHeader icon={<Database className="w-4 h-4" />} title="Data & Integrations" />
        <label className="block">
          <span className="text-xs font-semibold text-slate-500">Default dive data visibility</span>
          <select
            value={form.publicDiveDataDefault || 'private'}
            onChange={(event) => updateField('publicDiveDataDefault', event.target.value as AppSettings['publicDiveDataDefault'])}
            className="mt-1 w-full min-h-[44px] rounded-xl border border-slate-200 px-3 text-sm bg-white"
          >
            <option value="private">Private by default</option>
            <option value="public aggregate">Public aggregate by default</option>
          </select>
        </label>
        <SettingToggle
          label="Prepare data export workflows"
          description="Track export readiness for future Darwin Core, OBIS, or GBIF partner workflows."
          checked={form.dataExportEnabled === true}
          onChange={(checked) => updateField('dataExportEnabled', checked)}
        />
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full min-h-[48px] bg-maldives-lagoon text-white rounded-2xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
      >
        <Save className="w-4 h-4" />
        Save Settings
      </button>
    </section>
  );
}

function SectionHeader({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 text-maldives-deep">
      {icon}
      <h4 className="font-bold">{title}</h4>
    </div>
  );
}

function SettingToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-2xl border border-slate-100 p-4">
      <span>
        <span className="block text-sm font-bold text-maldives-deep">{label}</span>
        <span className="block text-xs leading-relaxed text-slate-500 mt-1">{description}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-5 w-5 accent-maldives-lagoon"
      />
    </label>
  );
}
