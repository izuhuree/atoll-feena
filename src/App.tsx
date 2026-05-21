/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { auth, syncProfile, isFirebaseConfigured, signInWithGoogle } from './lib/firebase';
import { browserLocalPersistence, getRedirectResult, onAuthStateChanged, setPersistence, signOut, User } from 'firebase/auth';
import { Navigation, Tab } from './components/Navigation';
import { Home } from './components/screens/Home';
import { DiveSites } from './components/screens/DiveSites';
import { QuickLog } from './components/screens/QuickLog';
import { Logbook } from './components/screens/Logbook';
import { Profile } from './components/screens/Profile';
import { Insights } from './components/screens/Insights';
import { FieldGuide } from './components/screens/FieldGuide';
import { WatchPreview } from './components/screens/WatchPreview';
import { UserGuide } from './components/screens/UserGuide';
import { SignIn } from './components/screens/SignIn';
import { ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState<Tab | 'insights' | 'field-guide' | 'watch'>('home');
  const [showSafety, setShowSafety] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const hasAgreed = localStorage.getItem('feena_safety_agreed');
    if (!hasAgreed) {
      setShowSafety(true);
    }

    if (!auth) {
      setIsAuthLoading(false);
      setAuthError('Firebase auth is not initialized.');
      return;
    }

    // Mobile redirect flows can be browser-dependent; make redirect completion explicit.
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error('Auth persistence setup failed:', error);
    });
    getRedirectResult(auth).catch((error) => {
      console.error('Redirect sign-in resolution failed:', error);
      setAuthError('Unable to complete mobile sign-in. Please try again.');
    });

    return onAuthStateChanged(auth, async (nextUser) => {
      // Remove previous anonymous sessions to enforce Google sign-in only.
      if (nextUser?.isAnonymous) {
        try {
          await signOut(auth);
        } catch (error) {
          console.error('Failed to clear anonymous session:', error);
        }
        setUser(null);
        setIsAuthLoading(false);
        return;
      }

      if (nextUser) {
        setUser(nextUser);
        setAuthError(null);
        try {
          await syncProfile(nextUser);
        } catch (error) {
          console.error('Profile sync failed:', error);
        }
      } else {
        setUser(null);
      }

      setIsAuthLoading(false);
    });
  }, []);

  const handleSignIn = async () => {
    if (!isFirebaseConfigured) {
      setAuthError('Firebase config missing. Please verify project settings.');
      return;
    }
    setIsSigningIn(true);
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign-in failed:', error);
      if (error instanceof Error && 'code' in error) {
        const authCode = String((error as { code?: string }).code || '');
        if (authCode === 'auth/operation-not-allowed') {
          setAuthError('Enable Google sign-in in Firebase Console > Authentication > Sign-in method.');
        } else if (authCode === 'auth/unauthorized-domain') {
          setAuthError('This domain is not authorized in Firebase Authentication.');
        } else if (authCode === 'auth/popup-closed-by-user') {
          setAuthError('Sign-in popup closed before completion. Please try again.');
        } else {
          setAuthError(authCode);
        }
      } else {
        setAuthError('Google sign-in failed. Please try again.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleAgree = () => {
    localStorage.setItem('feena_safety_agreed', 'true');
    setShowSafety(false);
  };

  const renderTab = () => {
    switch (currentTab) {
      case 'home': return <Home onLogDive={() => setCurrentTab('quick-log')} user={user} onOpenInsights={() => setCurrentTab('insights')} onOpenGuide={() => setCurrentTab('field-guide')} onNavigate={(t) => setCurrentTab(t as any)} />;
      case 'sites': return <DiveSites user={user} onLogAtSite={() => setCurrentTab('quick-log')} />;
      case 'quick-log': return <QuickLog onComplete={() => setCurrentTab('logbook')} onCancel={() => setCurrentTab('home')} />;
      case 'logbook': return <Logbook onLogDive={() => setCurrentTab('quick-log')} />;
      case 'insights': return <Insights onBack={() => setCurrentTab('home')} onLogDive={() => setCurrentTab('quick-log')} />;
      case 'field-guide': return <FieldGuide onBack={() => setCurrentTab('home')} />;
      case 'user-guide': return <UserGuide onBack={() => setCurrentTab('home')} />;
      case 'profile': return <Profile user={user} onOpenWatch={() => setCurrentTab('watch')} />;
      case 'watch': return <WatchPreview onBack={() => setCurrentTab('profile')} />;
      default: return <Home onLogDive={() => setCurrentTab('quick-log')} user={user} onOpenInsights={() => setCurrentTab('insights')} onOpenGuide={() => setCurrentTab('field-guide')} onNavigate={(t) => setCurrentTab(t as any)} />;
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="text-center">
          <img
            src="/logo.png"
            alt="AtollFeeNa logo"
            className="w-16 h-16 rounded-2xl mx-auto mb-4 border border-slate-100 shadow-sm bg-white"
          />
          <p className="text-sm font-semibold text-maldives-deep">Connecting to AtollFeeNa...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <SignIn
        onSignIn={handleSignIn}
        isSigningIn={isSigningIn}
        error={authError}
        disabled={!isFirebaseConfigured || !auth}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-maldives-shallow selection:text-maldives-deep">
      <AnimatePresence>
        {showSafety && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-slate-100"
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 mx-auto">
                <ShieldAlert className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-center mb-4 tracking-tight">Safety First</h2>
              <p className="text-slate-600 text-center text-sm leading-relaxed mb-8">
                AtollFeeNa is a scuba logbook and planning companion. 
                <span className="font-semibold block mt-2 text-slate-900">
                  It is not a certified dive computer, decompression planner, or substitute for training!
                </span>
                Always follow your dive computer, tables, and dive professional.
              </p>
              <button 
                onClick={handleAgree}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-semibold active:scale-[0.98] transition-transform shadow-lg shadow-slate-200"
              >
                I Understand & Agree
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </main>

      {currentTab !== 'quick-log' && currentTab !== 'watch' && currentTab !== 'field-guide' && currentTab !== 'user-guide' && (
        <Navigation currentTab={currentTab as any} onTabChange={setCurrentTab as any} />
      )}
    </div>
  );
}
