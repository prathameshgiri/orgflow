import { Link } from "react-router-dom";
import { Check, ShieldCheck, Zap } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Pricing() {
  return (
    <div className="min-h-screen bg-cream text-ink">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
        <div className="text-center">
          <p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-coral">Simple pricing</p>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Start free. Grow with confidence.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-ink/55">
            Everything you need to run your first organization, with room to scale when you’re ready. No hidden fees.
          </p>
        </div>

        <div className="mx-auto mt-20 grid max-w-5xl gap-10">
          {/* Free Tier */}
          <div className="rounded-[2rem] border border-ink/10 bg-white p-8 sm:p-10 shadow-xl shadow-ink/5 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-ink/10">
            <div className="grid gap-10 md:grid-cols-[1fr_1.5fr] md:items-center">
              <div>
                <span className="rounded-full bg-coral/10 px-3 py-1 text-xs font-bold text-coral">MOST POPULAR</span>
                <h3 className="mt-5 font-display text-3xl font-bold">Free forever</h3>
                <div className="mt-3">
                  <span className="font-display text-5xl font-bold">$0</span>
                  <span className="text-ink/45"> / month</span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-ink/55">Perfect for small teams building something great.</p>
                <Link to="/signup" className="mt-8 block rounded-xl bg-ink py-4 text-center text-sm font-bold text-white transition hover:bg-coral">Create your free workspace</Link>
              </div>
              <div className="md:border-l md:border-ink/5 md:pl-10">
                <p className="mb-5 text-xs font-bold uppercase tracking-wider text-ink/70">What's included</p>
                <ul className="grid gap-4 sm:grid-cols-2 text-sm font-semibold text-ink/70">
                  {["1 organization", "Up to 10 team members", "5 clients", "Only one admin", "Roles and permissions", "Activity logs"].map(x => (
                    <li key={x} className="flex items-start gap-3"><Check className="mt-0.5 shrink-0 text-emerald-500" size={16} /><span>{x}</span></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Enterprise Tier */}
          <div className="relative overflow-hidden rounded-[2rem] border-2 border-ink bg-ink p-8 sm:p-10 text-white shadow-2xl shadow-ink/20 transition hover:-translate-y-1">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/5 blur-3xl" />
            <div className="relative grid gap-10 md:grid-cols-[1fr_1.5fr] md:items-center">
              <div>
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold text-white">FOR SCALE</span>
                <h3 className="mt-5 font-display text-3xl font-bold">Enterprise</h3>
                <div className="mt-3">
                  <span className="font-display text-5xl font-bold">Custom</span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-white/55">Advanced security, custom integrations, and dedicated support.</p>
                <a href="mailto:admin@orgtask.com" className="mt-8 block rounded-xl bg-white py-4 text-center text-sm font-bold text-ink transition hover:bg-coral-light">Contact Admin</a>
              </div>
              <div className="md:border-l md:border-white/10 md:pl-10">
                <p className="mb-5 text-xs font-bold uppercase tracking-wider text-white/70">Everything in Free, plus</p>
                <ul className="grid gap-4 sm:grid-cols-2 text-sm font-semibold text-white/70">
                  {["Unlimited organizations", "Unlimited team members", "Custom roles & permissions", "Custom API Integrations", "24/7 Dedicated Support", "99.99% Uptime SLA", "Activity mail for admin and teams", "SAML SSO & Advanced Security"].map(x => (
                    <li key={x} className="flex items-start gap-3"><Check className="mt-0.5 shrink-0 text-emerald-400" size={16} /><span>{x}</span></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
