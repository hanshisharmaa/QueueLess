import { Link } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, Landmark, Scissors, Stethoscope, UtensilsCrossed, Wallet, Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { CentreCard } from '../components/CentreCard';
import { useCentres } from '../hooks/useCentres';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '../lib/types';
import type { Category } from '../lib/types';
import { DEMO_CENTRES } from '../lib/demoData';

const categoryIcons: Record<Category, LucideIcon> = {
  healthcare: Stethoscope,
  beauty: Scissors,
  government: Landmark,
  repair: Wrench,
  banking: Wallet,
  dining: UtensilsCrossed,
};

const steps = [
  {
    title: 'Pick a centre',
    body: 'Hospitals, banks, government offices, salons and service centres across Meerut, with the queue shown before you leave home.',
  },
  {
    title: 'Check the line',
    body: 'See how many people are waiting, the token being served now and how long each visit takes.',
  },
  {
    title: 'Take a token',
    body: 'One tap holds your place. Your token number and estimated wait appear straight away.',
  },
  {
    title: 'Arrive on time',
    body: 'Your position updates as the counter calls people. Head over when you are close to the front.',
  },
];

const countByCategory = DEMO_CENTRES.reduce<Record<string, number>>((acc, c) => {
  acc[c.category] = (acc[c.category] ?? 0) + 1;
  return acc;
}, {});

export function LandingPage() {
  const { all: centres, loading } = useCentres();
  const featured = [...centres]
    .filter((c) => c.is_open)
    .sort((a, b) => b.people_waiting - a.people_waiting)
    .slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-navy-100">
        <div className="container-app grid items-center gap-12 py-14 lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[1.05fr_1fr] lg:py-16">
          <div className="animate-fade-up">
            <p className="eyebrow">Digital queue tokens · Meerut</p>
            <h1 className="mt-5 text-[2.6rem] font-medium leading-[1.04] text-navy-950 sm:text-6xl lg:text-[4.25rem]">
              Skip the line at Meerut&rsquo;s hospitals, banks and offices.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-navy-500">
              Take a token from your phone, watch the queue move, and walk in when it is
              nearly your turn.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/explore" className="btn-primary !px-6 !py-3 text-[15px]">
                Find a centre
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/how-it-works" className="btn-secondary !px-6 !py-3 text-[15px]">
                See how tokens work
              </Link>
            </div>
            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-navy-100 pt-6">
              {[
                { value: DEMO_CENTRES.length, label: 'centres' },
                { value: Object.keys(countByCategory).length, label: 'categories' },
                { value: '₹0', label: 'per token' },
              ].map((s) => (
                <div key={s.label}>
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="font-display text-3xl font-medium text-navy-950">{s.value}</dd>
                  <dd className="mt-1 text-sm text-navy-500">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative animate-fade-up [animation-delay:120ms]">
            <div className="overflow-hidden rounded-2xl">
              <img
                src="/images/centres/m-004.jpg"
                alt="Bank branch building"
                className="aspect-[4/5] w-full object-cover sm:aspect-[5/4] lg:aspect-[4/5]"
              />
            </div>
            {/* Live token preview — the product itself */}
            <div className="absolute bottom-5 left-5 right-5 rounded-xl border border-navy-100 bg-white/95 p-5 shadow-glow backdrop-blur sm:left-auto sm:w-80">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-navy-500">Your token · SBI Main Branch</p>
                  <p className="mt-1 font-mono text-4xl font-medium tracking-tight text-navy-950">B-53</p>
                </div>
                <span className="badge bg-emerald-50 text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-soft" />
                  Live
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-navy-400">Now serving</p>
                  <p className="font-mono font-medium text-navy-900">B-47</p>
                </div>
                <div>
                  <p className="text-navy-400">Estimated wait</p>
                  <p className="font-mono font-medium text-navy-900">~18 min</p>
                </div>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-navy-100">
                <div className="h-full w-[62%] rounded-full bg-electric-600" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live centres */}
      <section className="container-app py-20 lg:py-28">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Busiest right now</p>
            <h2 className="mt-3 text-3xl font-medium text-navy-950 sm:text-[2.5rem]">Queues across Meerut today</h2>
          </div>
          <Link to="/explore" className="group inline-flex items-center gap-1.5 text-sm font-medium text-electric-700">
            See all {DEMO_CENTRES.length} centres
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-96 rounded-2xl bg-navy-100/60" />)
            : featured.map((c) => <CentreCard key={c.id} centre={c} peopleWaiting={c.people_waiting} />)}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-navy-100 bg-white">
        <div className="container-app grid gap-12 py-20 lg:grid-cols-[1fr_2fr] lg:py-28">
          <div>
            <p className="eyebrow">How it works</p>
            <h2 className="mt-3 text-3xl font-medium text-navy-950 sm:text-[2.5rem]">Four steps from home to the counter</h2>
            <p className="mt-4 max-w-sm text-navy-500">
              The line still moves at the counter&rsquo;s pace. You just wait somewhere better.
            </p>
          </div>
          <ol className="grid gap-x-10 sm:grid-cols-2">
            {steps.map((step, i) => (
              <li key={step.title} className="border-t border-navy-200 py-6">
                <span className="font-mono text-sm text-electric-700">0{i + 1}</span>
                <h3 className="mt-3 text-xl font-medium text-navy-950">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-navy-500">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Categories */}
      <section className="container-app py-20 lg:py-28">
        <p className="eyebrow">Browse by category</p>
        <h2 className="mt-3 text-3xl font-medium text-navy-950 sm:text-[2.5rem]">Where people queue most</h2>
        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-navy-100 bg-navy-100 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORY_ORDER.map((cat) => {
            const Icon = categoryIcons[cat];
            const n = countByCategory[cat] ?? 0;
            return (
              <Link
                key={cat}
                to={`/explore?category=${cat}`}
                className="group flex items-center justify-between bg-white p-6 transition-colors hover:bg-navy-50"
              >
                <span className="flex items-center gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-electric-50 text-electric-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block font-medium text-navy-950">{CATEGORY_LABELS[cat]}</span>
                    <span className="text-sm text-navy-500">{n} {n === 1 ? 'centre' : 'centres'}</span>
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 text-navy-300 transition-all group-hover:translate-x-0.5 group-hover:text-electric-700" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Close */}
      <section className="bg-navy-950 text-white">
        <div className="container-app flex flex-col items-start justify-between gap-8 py-20 lg:flex-row lg:items-end lg:py-24">
          <h2 className="max-w-2xl text-4xl font-medium leading-[1.08] sm:text-5xl">
            Your next queue can wait for you.
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/login?mode=signup" className="btn-primary !bg-white !px-6 !py-3 !text-navy-950 hover:!bg-navy-100">
              Create a free account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/explore"
              className="inline-flex items-center justify-center rounded-lg border border-white/20 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Browse centres
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
