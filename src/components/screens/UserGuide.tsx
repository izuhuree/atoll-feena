import {
  BookOpen,
  ChevronLeft,
  Database,
  KeyRound,
  Layers3,
  Map,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { ReactNode } from 'react';

interface UserGuideProps {
  onBack: () => void;
}

const userSteps = [
  {
    title: 'Log Dives',
    text: 'Record site, depth, time, visibility, current, temperature, hazards, species, reef health, debris, and notes.',
  },
  {
    title: 'Explore Sites',
    text: 'Filter by atoll or dive-site name. AtollFeeNa loads matching database records progressively instead of loading every site.',
  },
  {
    title: 'Contribute Observations',
    text: 'Each log can strengthen recent safety conditions, reef records, conservation signals, and future dive-site intelligence.',
  },
  {
    title: 'Use Pro Planning',
    text: 'Active Pro users can create dive plans, safety checklists, equipment checks, group plans, and briefing notes.',
  },
];

const architecture = [
  'React 19 + TypeScript single-page app built with Vite.',
  'Firebase Auth handles Google sign-in and profile sync.',
  'Firestore stores users, roles, dive sites, logs, observations, Pro access, app settings, and review queues.',
  'Firebase Storage stores uploaded media and generated dive-site sketches.',
  'Tailwind-based styling keeps the UI mobile-first and touch-friendly.',
  'Gemini AI is used for AI-assisted dive-site descriptions and sketch generation through an admin-managed key.',
];

const libraries = [
  '@google/genai',
  'firebase',
  'react',
  'react-dom',
  'vite',
  'typescript',
  'tailwindcss',
  '@tailwindcss/vite',
  '@vitejs/plugin-react',
  'lucide-react',
  'motion',
  'leaflet',
  'react-leaflet',
  'react-leaflet-cluster',
  'recharts',
  'd3',
  'date-fns',
  'clsx',
  'tailwind-merge',
  'dotenv',
  'express',
  'tsx',
  'autoprefixer',
  '@firebase/eslint-plugin-security-rules',
  '@types/node',
  '@types/react',
  '@types/react-dom',
  '@types/leaflet',
  '@types/express',
];

export function UserGuide({ onBack }: UserGuideProps) {
  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white px-6 pb-5 pt-12 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            aria-label="Back"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-50 active:scale-95"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="font-display text-xl font-bold text-maldives-deep">User Guide</h1>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-maldives-turquoise">
              AtollFeeNa overview
            </p>
          </div>
        </div>
      </header>

      <main className="space-y-5 p-6">
        <GuideCard icon={<BookOpen />} title="Purpose">
          <p>
            AtollFeeNa helps divers log recreational dives while turning useful observations into safety and
            conservation data for Maldives dive sites.
          </p>
        </GuideCard>

        <section className="space-y-3">
          <SectionTitle icon={<ShieldCheck />} title="How To Use It" />
          {userSteps.map((step, index) => (
            <article key={step.title} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-maldives-lagoon">
                Step {index + 1}
              </p>
              <h2 className="mt-1 font-display text-lg font-bold text-maldives-deep">{step.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.text}</p>
            </article>
          ))}
        </section>

        <GuideCard icon={<Layers3 />} title="Architecture">
          <ul className="space-y-2">
            {architecture.map((item) => (
              <li key={item} className="text-sm leading-relaxed text-slate-600">
                {item}
              </li>
            ))}
          </ul>
        </GuideCard>

        <GuideCard icon={<Database />} title="Main Database Collections">
          <p>
            Core Firestore collections include users, admins, diveSites, diveLogs, siteConditionReports,
            marineLife, atolls, appSettings, proSubscriptions, paymentTransactions, divePlans, and
            diveSiteEditSuggestions.
          </p>
        </GuideCard>

        <GuideCard icon={<Sparkles />} title="AI Features">
          <p>
            Trusted users can draft dive-site descriptions and generate dive-site sketches. Pro users use the
            administrator-managed Gemini key from App Settings.
          </p>
        </GuideCard>

        <GuideCard icon={<Map />} title="Maps And Site Loading">
          <p>
            Dive sites are filtered first, then displayed as cards and map markers from the same filtered dataset.
            Marker clustering keeps the map readable when several sites are near each other.
          </p>
        </GuideCard>

        <GuideCard icon={<KeyRound />} title="Libraries Used">
          <div className="flex flex-wrap gap-2">
            {libraries.map((library) => (
              <span key={library} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {library}
              </span>
            ))}
          </div>
        </GuideCard>
      </main>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 px-1 text-maldives-deep">
      <span className="[&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      <h2 className="text-sm font-bold uppercase tracking-widest">{title}</h2>
    </div>
  );
}

function GuideCard({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-maldives-lagoon/10 text-maldives-lagoon [&>svg]:h-5 [&>svg]:w-5">
          {icon}
        </div>
        <h2 className="font-display text-lg font-bold text-maldives-deep">{title}</h2>
      </div>
      <div className="text-sm leading-relaxed text-slate-600">{children}</div>
    </section>
  );
}
