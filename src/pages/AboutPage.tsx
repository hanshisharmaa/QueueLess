import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { DEMO_CENTRES } from '../lib/demoData';

const principles = [
  {
    title: 'Show the real line',
    text: 'Every centre shows people waiting, minutes per visit and the token being served, so the estimate is something you can check yourself.',
  },
  {
    title: 'Keep it fair',
    text: 'Tokens are served strictly in order and each person holds one active token per centre. Nobody jumps the line.',
  },
  {
    title: 'Free to use',
    text: 'Checking a queue and taking a token costs nothing. You only need an account so your token stays yours.',
  },
];

const stack = [
  ['Frontend', 'React 18, TypeScript, Vite'],
  ['Styling', 'Tailwind CSS'],
  ['Data', 'Supabase schema (auth, tables, token function); runs in local demo mode for this presentation'],
  ['Maps', 'OpenStreetMap for nearby places'],
];

export function AboutPage() {
  const categories = new Set(DEMO_CENTRES.map((c) => c.category)).size;

  return (
    <div>
      <section className="border-b border-navy-100 py-16 lg:py-20">
        <div className="container-app">
          <p className="eyebrow">About QueueLess</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-medium text-navy-950 sm:text-6xl">
            Nobody should have to stand in a line just to find out how long the line is.
          </h1>
          <div className="mt-10 grid max-w-2xl grid-cols-3 gap-6 border-t border-navy-100 pt-6">
            {[
              [DEMO_CENTRES.length, 'centres listed'],
              [categories, 'categories'],
              ['Meerut', 'first city'],
            ].map(([v, l]) => (
              <div key={String(l)}>
                <p className="font-display text-3xl font-medium text-navy-950">{v}</p>
                <p className="mt-1 text-sm text-navy-500">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-app py-20">
        <h2 className="text-3xl font-medium text-navy-950 sm:text-4xl">What we hold to</h2>
        <div className="mt-10 grid gap-x-10 md:grid-cols-3">
          {principles.map((p, i) => (
            <div key={p.title} className="border-t border-navy-200 py-6">
              <span className="font-mono text-sm text-electric-700">0{i + 1}</span>
              <h3 className="mt-3 text-xl font-medium text-navy-950">{p.title}</h3>
              <p className="mt-2 leading-relaxed text-navy-500">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-navy-100 bg-white">
        <div className="container-app grid gap-10 py-20 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <p className="eyebrow">The project</p>
            <h2 className="mt-3 text-3xl font-medium text-navy-950 sm:text-4xl">How it is built</h2>
            <p className="mt-4 max-w-sm text-navy-500">
              A college project. Queue figures are simulated: the counter moves one person forward every few seconds so the live tracking can be shown.
            </p>
          </div>
          <dl className="divide-y divide-navy-100 border-y border-navy-100">
            {stack.map(([k, v]) => (
              <div key={k} className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr]">
                <dt className="font-mono text-sm text-navy-400">{k}</dt>
                <dd className="text-navy-800">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="container-app flex flex-col items-start justify-between gap-6 py-20 sm:flex-row sm:items-center">
        <h2 className="text-3xl font-medium text-navy-950">See the queues for yourself.</h2>
        <Link to="/explore" className="btn-primary !px-6 !py-3">
          Find a centre
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
