import { ChangeEvent, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { User, signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import {
  Settings,
  ShieldCheck,
  Watch,
  LogOut,
  User as UserIcon,
  CreditCard,
  History,
  LifeBuoy,
  Camera,
  Save,
  PencilLine,
  AlertCircle,
  UsersRound,
  SlidersHorizontal,
} from 'lucide-react';
import { CertificationProfile } from '../../types';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useUserRole } from '../../hooks/useUserRole';
import { AiSettingsSection } from '../profile/AiSettingsSection';
import { UserManagementSection } from '../settings/UserManagementSection';
import { AppSettingsSection } from '../settings/AppSettingsSection';
import { ReviewQueuePreview } from '../settings/ReviewQueuePreview';

interface ProfileProps {
  user: User | null;
  onOpenWatch: () => void;
}

const emptyCertification: CertificationProfile = {
  agency: '',
  level: '',
  certificationNumber: '',
  issueDate: '',
  instructorName: '',
};

export function Profile({ user, onOpenWatch }: ProfileProps) {
  const [isEditingCert, setIsEditingCert] = useState(false);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'profile' | 'users' | 'app'>('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { profile, isLoading, isSaving, error, saveProfile, saveCertificationProfile, uploadProfilePhoto } = useUserProfile(user);
  const { canManageUsers, canManageAppSettings } = useUserRole(user);
  const isAdminSettings = canManageUsers || canManageAppSettings;

  const [profileForm, setProfileForm] = useState({
    name: '',
    homeCountry: '',
    units: 'metric' as 'metric' | 'imperial',
  });

  const [certificationForm, setCertificationForm] = useState<CertificationProfile>(emptyCertification);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    setProfileForm({
      name: profile.name || '',
      homeCountry: profile.homeCountry || '',
      units: profile.units || 'metric',
    });
    setCertificationForm({
      agency: profile.certificationProfile?.agency || '',
      level: profile.certificationProfile?.level || '',
      certificationNumber: profile.certificationProfile?.certificationNumber || '',
      issueDate: profile.certificationProfile?.issueDate || '',
      instructorName: profile.certificationProfile?.instructorName || '',
    });
  }, [profile]);

  useEffect(() => {
    if (!isAdminSettings && activeSettingsTab !== 'profile') {
      setActiveSettingsTab('profile');
    }
  }, [activeSettingsTab, isAdminSettings]);

  const avatarUrl = useMemo(() => {
    if (profilePhotoPreview) return profilePhotoPreview;
    if (profile?.photoURL) return profile.photoURL;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || user?.displayName || 'Diver')}`;
  }, [profilePhotoPreview, profile?.photoURL, profile?.name, user?.displayName]);

  const handleLogout = () => {
    if (auth) signOut(auth);
  };

  const handleProfileSave = async () => {
    if (!profileForm.name.trim()) {
      setStatusMessage('Name is required.');
      return;
    }
    await saveProfile({
      name: profileForm.name.trim(),
      homeCountry: profileForm.homeCountry.trim(),
      units: profileForm.units,
    });
    setStatusMessage('Profile details saved.');
  };

  const handleCertificationSave = async () => {
    if (!certificationForm.agency.trim() || !certificationForm.level.trim()) {
      setStatusMessage('Certification agency and level are required.');
      return;
    }
    await saveCertificationProfile({
      agency: certificationForm.agency.trim(),
      level: certificationForm.level.trim(),
      certificationNumber: certificationForm.certificationNumber?.trim() || '',
      issueDate: certificationForm.issueDate || '',
      instructorName: certificationForm.instructorName?.trim() || '',
    });
    setIsEditingCert(false);
    setStatusMessage('Certification profile saved.');
  };

  const handlePhotoPick = () => fileInputRef.current?.click();

  const handlePhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const selectedFile = files[0];
    const localUrl = URL.createObjectURL(selectedFile);
    setProfilePhotoPreview(localUrl);

    try {
      await uploadProfilePhoto(selectedFile);
      setStatusMessage('Profile photo updated.');
    } catch {
      setProfilePhotoPreview(null);
      setStatusMessage('Failed to upload profile photo.');
    } finally {
      URL.revokeObjectURL(localUrl);
      e.target.value = '';
    }
  };

  if (!user) {
    return (
      <div className="px-6 pt-24 text-center">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <UserIcon className="w-12 h-12 text-slate-300" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Connect AtollFeeNa</h2>
        <p className="text-slate-500 mb-8 max-w-xs mx-auto">Sign in to sync your dives, track certifications, and unlock team features.</p>
      </div>
    );
  }

  return (
    <div className="pt-16 pb-10">
      <div className="px-6 mb-8">
        <div className="flex items-center gap-5 mb-6">
          <div className="relative">
            <img src={avatarUrl} alt={profile?.name || user.displayName || 'User'} className="w-20 h-20 rounded-3xl shadow-xl shadow-slate-200 object-cover" referrerPolicy="no-referrer" />
            <button
              onClick={handlePhotoPick}
              disabled={isSaving}
              className="absolute -bottom-1 -right-1 w-10 h-10 rounded-2xl bg-maldives-deep text-white flex items-center justify-center shadow-lg disabled:opacity-50"
              aria-label="Change profile picture"
            >
              <Camera className="w-5 h-5" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {isAdminSettings ? 'Settings' : 'Profile'}
            </p>
            <h2 className="text-2xl font-display font-bold tracking-tight text-maldives-deep">{profile?.name || user.displayName || 'Diver'}</h2>
            <p className="text-slate-500 text-sm">{profile?.email || user.email}</p>
          </div>
        </div>

        {isLoading && <p className="text-xs text-slate-500">Loading profile...</p>}
        {(statusMessage || error) && (
          <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-600 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 text-maldives-lagoon" />
            <span>{error || statusMessage}</span>
          </div>
        )}

        {isAdminSettings && (
          <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1">
            <SettingsTabButton
              label="My Profile"
              active={activeSettingsTab === 'profile'}
              onClick={() => setActiveSettingsTab('profile')}
              icon={<UserIcon className="w-4 h-4" />}
            />
            <SettingsTabButton
              label="Users"
              active={activeSettingsTab === 'users'}
              onClick={() => setActiveSettingsTab('users')}
              icon={<UsersRound className="w-4 h-4" />}
            />
            <SettingsTabButton
              label="App"
              active={activeSettingsTab === 'app'}
              onClick={() => setActiveSettingsTab('app')}
              icon={<SlidersHorizontal className="w-4 h-4" />}
            />
          </div>
        )}
      </div>

      <div className="px-6 space-y-6">
        {activeSettingsTab === 'profile' && (
          <>
        <section>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 px-2">Profile Details</h3>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-4">
            <label className="block">
              <span className="text-xs font-semibold text-slate-500">Display Name</span>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                className="mt-1 w-full min-h-[44px] rounded-xl border border-slate-200 px-3 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-500">Home Country</span>
              <input
                type="text"
                value={profileForm.homeCountry}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, homeCountry: e.target.value }))}
                className="mt-1 w-full min-h-[44px] rounded-xl border border-slate-200 px-3 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-500">Measurement Units</span>
              <select
                value={profileForm.units}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, units: e.target.value as 'metric' | 'imperial' }))}
                className="mt-1 w-full min-h-[44px] rounded-xl border border-slate-200 px-3 text-sm bg-white"
              >
                <option value="metric">Metric (m, °C)</option>
                <option value="imperial">Imperial (ft, °F)</option>
              </select>
            </label>
            <button
              onClick={handleProfileSave}
              disabled={isSaving}
              className="w-full min-h-[48px] bg-maldives-lagoon text-white rounded-2xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              Save Profile Details
            </button>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-3 px-2">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Certification Profile</h3>
            <button
              onClick={() => setIsEditingCert((prev) => !prev)}
              className="min-h-[44px] px-3 text-maldives-lagoon text-[10px] font-bold uppercase tracking-widest flex items-center gap-1"
            >
              <PencilLine className="w-3 h-3" />
              {isEditingCert ? 'Close' : 'Edit'}
            </button>
          </div>

          <div className="bg-slate-900 rounded-3xl p-5 text-white relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <ShieldCheck className="w-24 h-24" />
            </div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                  <ShieldCheck className="w-5 h-5 text-maldives-turquoise" />
                </div>
                {profile?.certificationProfile?.agency ? (
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full backdrop-blur-md border border-emerald-400/30">
                    VERIFIED
                  </span>
                ) : (
                  <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full backdrop-blur-md border border-amber-400/30">
                    NEEDS INFO
                  </span>
                )}
              </div>
              <p className="font-mono text-maldives-turquoise text-[10px] tracking-[0.18em] mb-1">
                {profile?.certificationProfile?.certificationNumber || 'CERTIFICATION #'}
              </p>
              <h4 className="text-xl font-display font-bold mb-4">
                {profile?.certificationProfile?.level || 'Add certification level'}
              </h4>
              <div className="flex justify-between items-end border-t border-white/10 pt-4">
                <div>
                  <p className="text-[8px] uppercase tracking-widest opacity-50 mb-1">Issue Date</p>
                  <p className="text-xs font-bold">{profile?.certificationProfile?.issueDate || 'Not set'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] uppercase tracking-widest opacity-50 mb-1">Instructor</p>
                  <p className="text-xs font-bold">{profile?.certificationProfile?.instructorName || 'Not set'}</p>
                </div>
              </div>
            </div>
          </div>

          {isEditingCert && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 mt-3 space-y-4">
              <label className="block">
                <span className="text-xs font-semibold text-slate-500">Agency</span>
                <input
                  type="text"
                  value={certificationForm.agency}
                  onChange={(e) => setCertificationForm((prev) => ({ ...prev, agency: e.target.value }))}
                  className="mt-1 w-full min-h-[44px] rounded-xl border border-slate-200 px-3 text-sm"
                  placeholder="PADI, SSI, NAUI..."
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-slate-500">Certification Level</span>
                <input
                  type="text"
                  value={certificationForm.level}
                  onChange={(e) => setCertificationForm((prev) => ({ ...prev, level: e.target.value }))}
                  className="mt-1 w-full min-h-[44px] rounded-xl border border-slate-200 px-3 text-sm"
                  placeholder="Advanced Open Water"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-slate-500">Certification Number</span>
                <input
                  type="text"
                  value={certificationForm.certificationNumber}
                  onChange={(e) => setCertificationForm((prev) => ({ ...prev, certificationNumber: e.target.value }))}
                  className="mt-1 w-full min-h-[44px] rounded-xl border border-slate-200 px-3 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-slate-500">Issue Date</span>
                <input
                  type="date"
                  value={certificationForm.issueDate}
                  onChange={(e) => setCertificationForm((prev) => ({ ...prev, issueDate: e.target.value }))}
                  className="mt-1 w-full min-h-[44px] rounded-xl border border-slate-200 px-3 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-slate-500">Instructor</span>
                <input
                  type="text"
                  value={certificationForm.instructorName}
                  onChange={(e) => setCertificationForm((prev) => ({ ...prev, instructorName: e.target.value }))}
                  className="mt-1 w-full min-h-[44px] rounded-xl border border-slate-200 px-3 text-sm"
                />
              </label>

              <button
                onClick={handleCertificationSave}
                disabled={isSaving}
                className="w-full min-h-[48px] bg-maldives-deep text-white rounded-2xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                Save Certification
              </button>
            </div>
          )}
        </section>

        <AiSettingsSection />

        <section>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 px-2">Integrations</h3>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <button onClick={onOpenWatch} className="w-full min-h-[56px] p-5 flex items-center justify-between active:bg-slate-50 transition-colors border-b border-slate-50">
              <div className="flex items-center gap-4">
                <Watch className="w-5 h-5 text-slate-400" />
                <span className="font-semibold">Apple Watch Companion</span>
              </div>
              <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">Setup</span>
            </button>
            <button className="w-full min-h-[56px] p-5 flex items-center justify-between active:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <History className="w-5 h-5 text-slate-400" />
                <span className="font-semibold">Import Dive Computer Data</span>
              </div>
              <span className="text-slate-300">Soon</span>
            </button>
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 px-2">Support</h3>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <button className="w-full min-h-[56px] p-5 flex items-center gap-4 active:bg-slate-50 transition-colors">
              <LifeBuoy className="w-5 h-5 text-slate-400" />
              <span className="font-semibold">Local Emergency Info</span>
            </button>
            <button onClick={handleLogout} className="w-full min-h-[56px] p-5 flex items-center gap-4 text-rose-600 active:bg-rose-50 transition-colors border-t border-slate-50">
              <LogOut className="w-5 h-5" />
              <span className="font-semibold">Sign Out</span>
            </button>
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 px-2">Diver Specs</h3>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Units are managed in the Personal Details form above — this row just
                surfaces the current value with no duplicate edit affordance. */}
            <div className="w-full min-h-[56px] p-5 flex items-center justify-between border-b border-slate-50">
              <div className="flex items-center gap-4">
                <Settings className="w-5 h-5 text-slate-400" />
                <span className="font-semibold">Measurement Units</span>
              </div>
              <span className="font-bold text-sm text-maldives-lagoon">
                {profileForm.units === 'metric' ? 'Metric (m, °C)' : 'Imperial (ft, °F)'}
              </span>
            </div>
            <button className="w-full min-h-[56px] p-5 flex items-center justify-between active:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <CreditCard className="w-5 h-5 text-slate-400" />
                <span className="font-semibold">Insurance (DAN)</span>
              </div>
              <span className="font-bold text-sm text-amber-600">Add info</span>
            </button>
          </div>
        </section>
          </>
        )}

        {isAdminSettings && activeSettingsTab === 'users' && (
          <UserManagementSection enabled={canManageUsers} currentUserId={user.uid} />
        )}

        {isAdminSettings && activeSettingsTab === 'app' && (
          <>
          <ReviewQueuePreview enabled={canManageAppSettings} />
          <AppSettingsSection enabled={canManageAppSettings} user={user} />
          </>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 mt-10">
        <img src="/logo.png" alt="" className="w-3 h-3 rounded-full opacity-50 grayscale" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        <p className="text-center text-[10px] text-slate-300 font-medium">
          AtollFeeNa v1.0.0 —{' '}
          <a
            href="https://izuct.com"
            target="_blank"
            rel="noreferrer"
            className="text-slate-400 underline decoration-slate-300 underline-offset-2"
          >
            izuct.com
          </a>
        </p>
      </div>
    </div>
  );
}

function SettingsTabButton({
  label,
  active,
  onClick,
  icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[44px] rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors ${
        active ? 'bg-white text-maldives-deep shadow-sm' : 'text-slate-500'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
