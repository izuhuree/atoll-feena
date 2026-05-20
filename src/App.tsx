import { useEffect, useMemo, useState } from 'react';
import type { User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, initializeFirebase, syncUser, watchAuth } from './lib/firebase';
import { seedSites, seedSpecies } from './lib/reference';
import { newestFirst, useCollection } from './hooks/useFirebaseCollection';
import { useRoles } from './hooks/useRoles';
import type { DiveLog, DiveSite, Species, Tab, TeamDive, UserProfile } from './types';
import { SignIn, SafetyModal } from './components/AuthScreens';
import { Shell } from './components/Shell';
import { Home } from './screens/Home';
import { QuickLog } from './screens/QuickLog';
import { Logbook } from './screens/Logbook';
import { DiveSites, SpeciesGuide } from './screens/SitesSpecies';
import { Insights, TeamDives } from './screens/TeamInsights';
import { Profile, Settings } from './screens/ProfileSettings';
import { KnowledgeBase, UserGuide, WatchPreview } from './screens/KnowledgeGuide';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tab, setTab] = useState<Tab>('home');
  const [booting, setBooting] = useState(true);
  useEffect(() => {
    let unsub = () => {};
    initializeFirebase().then(() => { unsub = watchAuth(async (u) => { setUser(u); if (u) setProfile(await syncUser(u)); setBooting(false); }); });
    return () => unsub();
  }, []);
  useEffect(() => {
    if (!db || !user) return;
    return onSnapshot(doc(db, 'users', user.uid), (snap) => setProfile(snap.data() as UserProfile));
  }, [user]);
  const { roles, isAdmin, canUseKb } = useRoles(user?.uid);
  useEffect(() => { if (tab === 'settings' && !isAdmin) setTab('profile'); if (tab === 'profile' && isAdmin) setTab('settings'); }, [tab, isAdmin]);
  const { items: rawLogs } = useCollection<DiveLog>('diveLogs', [], 'userId', user?.uid);
  const { items: sites } = useCollection<DiveSite>('diveSites', seedSites);
  const { items: species } = useCollection<Species>('marineLife', seedSpecies);
  const { items: team } = useCollection<TeamDive>('teamDives', [], undefined, user?.uid);
  const logs = useMemo(() => newestFirst(rawLogs), [rawLogs]);
  if (booting) return <div className="grid min-h-screen place-items-center bg-slate-50 font-black text-sky-900">AtollFeeNa</div>;
  if (!user) return <SignIn />;
  if (!profile?.safetyAgreedAt) return <SafetyModal uid={user.uid} onDone={() => setProfile({ ...(profile || { uid: user.uid, name: user.displayName || '', email: user.email || '' }), safetyAgreedAt: new Date().toISOString() })} />;
  const currentProfile = { ...profile, uid: user.uid, roles };
  return <Shell tab={tab} setTab={setTab} isAdmin={isAdmin} canUseKb={canUseKb}>
    {tab === 'home' && <Home logs={logs} setTab={setTab} />}
    {tab === 'quick' && <QuickLog uid={user.uid} logs={logs} sites={sites} species={species} onDone={() => setTab('logbook')} />}
    {tab === 'logbook' && <Logbook logs={logs} />}
    {tab === 'sites' && <DiveSites sites={sites} uid={user.uid} isAdmin={isAdmin} />}
    {tab === 'species' && <SpeciesGuide species={species} uid={user.uid} />}
    {tab === 'team' && <TeamDives uid={user.uid} name={profile.name} dives={team.filter((d) => d.memberIds?.includes(user.uid) || d.ownerId === user.uid)} logs={logs} onLog={() => setTab('logbook')} />}
    {tab === 'insights' && <Insights logs={logs} />}
    {tab === 'profile' && <Profile profile={currentProfile} setTab={setTab} />}
    {tab === 'settings' && isAdmin && <Settings setTab={setTab} />}
    {tab === 'kb' && canUseKb && <KnowledgeBase />}
    {tab === 'kb' && !canUseKb && <UserGuide />}
    {tab === 'watch' && <WatchPreview />}
    {tab === 'guide' && <UserGuide />}
  </Shell>;
}
