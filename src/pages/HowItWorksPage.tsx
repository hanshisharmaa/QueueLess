import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { QrVisual } from '../components/QrVisual';

const steps = [
  {
    title: 'Pick a centre',
    text: 'Search by name, area or category. Each card shows how many people are waiting, how long a visit takes and whether the place is open right now.',
  },
  {
    title: 'Check the line',
    text: 'Open a centre to see the token being served and the queue level: low, moderate or busy. The wait estimate is simply people ahead × minutes per visit.',
  },
  {
    title: 'Take a token',
    text: 'One tap holds your place and gives you a token number and code. You can hold one active token per centre, and you can cancel it at any time.',
  },
  {
    title: 'Track and arrive',
    text: 'Your tracking page moves as the counter serves people: position, people ahead, estimated wait. When it is your turn, the page tells you.',
  },
];

function StepVisual({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white">
        <img src="/images/centres/m-009.jpg" alt="Salon interior" className="aspect-[16/10] w-full object-cover" loading="lazy" />
        <div className="flex items-center justify-between p-5">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-navy-400">Beauty &amp; Salon</p>
            <p className="mt-1 font-medium text-navy-950">Lakmé Salon – Abu Lane</p>
          </div>
          <span className="badge bg-emerald-50 text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Low queue
          </span>
        </div>
      </div>
    );
  }
  if (index === 1) {
    return (
      <div className="rounded-2xl border border-navy-100 bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-navy-500">Now serving</p>
            <p className="mt-1 font-mono text-5xl font-medium text-navy-950">S-47</p>
          </div>
          <span className="badge bg-amber-50 text-amber-700">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Moderate
          </span>
        </div>
        <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-navy-100 pt-5 text-sm">
          {[
            ['Waiting', '7'],
            ['Per visit', '10m'],
            ['Est. wait', '70m'],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-navy-500">{k}</dt>
              <dd className="mt-0.5 font-mono text-lg text-navy-950">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    );
  }
  if (index === 2) {
    return (
      <div className="rounded-2xl bg-navy-950 p-7 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-navy-400">Your token</p>
            <p className="mt-2 text-sm text-navy-300">State Bank of India – Main Branch</p>
            <p className="mt-4 font-mono text-6xl font-medium">S-53</p>
          </div>
          <div className="rounded-lg bg-white p-2">
            <div className="h-16 w-16">
              <QrVisual />
            </div>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-5 text-sm">
          <div>
            <p className="text-navy-400">People ahead</p>
            <p className="mt-0.5 font-mono text-lg">6</p>
          </div>
          <div>
            <p className="text-navy-400">Estimated wait</p>
            <p className="mt-0.5 font-mono text-lg">~60 min</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-6">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-navy-700">Queue progress</span>
        <span className="font-mono text-navy-950">62%</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-navy-100">
        <div className="h-full w-[62%] rounded-full bg-electric-600" />
      </div>
      <div className="mt-2 flex justify-between font-mono text-xs text-navy-400">
        <span>Serving S-50</span>
        <span>You S-53</span>
      </div>
      <p className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
        About 30 minutes to go. Time to start heading over.
      </p>
    </div>
  );
}

export function HowItWorksPage() {
  return (
    <div>
      <section className="border-b border-navy-100 py-16 lg:py-20">
        <div className="container-app max-w-3xl lg:max-w-7xl">
          <p className="eyebrow">How it works</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-medium text-navy-950 sm:text-6xl">
            Four steps from your sofa to the counter.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-navy-500">
            The queue still moves at the counter&rsquo;s pace. QueueLess just lets you wait somewhere else.
          </p>
        </div>
      </section>

      <section className="container-app divide-y divide-navy-100">
        {steps.map((step, i) => (
          <div key={step.title} className="grid items-center gap-10 py-16 lg:grid-cols-2 lg:gap-20 lg:py-20">
            <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
              <span className="font-mono text-sm text-electric-700">0{i + 1}</span>
              <h2 className="mt-3 text-3xl font-medium text-navy-950 sm:text-4xl">{step.title}</h2>
              <p className="mt-4 max-w-md text-lg leading-relaxed text-navy-500">{step.text}</p>
            </div>
            <div className="mx-auto w-full max-w-md">
              <StepVisual index={i} />
            </div>
          </div>
        ))}
      </section>

      <section className="bg-navy-950 text-white">
        <div className="container-app flex flex-col items-start justify-between gap-8 py-20 lg:flex-row lg:items-end">
          <div className="max-w-xl">
            <h2 className="text-4xl font-medium leading-[1.08] sm:text-5xl">No app to install.</h2>
            <p className="mt-4 text-lg text-navy-300">
              Tokens live in your browser dashboard. Print one or keep it on your phone, whichever suits you.
            </p>
          </div>
          <Link to="/login?mode=signup" className="btn-primary !bg-white !px-6 !py-3 !text-navy-950 hover:!bg-navy-100">
            Create a free account
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
