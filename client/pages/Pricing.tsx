import { Link } from "react-router-dom";
import { Check, ShieldCheck, Zap, ArrowRight } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion, Variants } from "framer-motion";

export default function Pricing() {
  const reveal: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      <Navbar />

      <main className="relative mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
        {/* Background Glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-[#00e5ff]/5 blur-[120px]" />

        <motion.div initial="hidden" animate="visible" variants={reveal} className="text-center relative z-10 mb-20">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#00e5ff]">Simple pricing</p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6">
            Start free. <br className="sm:hidden" /><span className="text-zinc-500">Grow with confidence.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-400 leading-relaxed">
            Everything you need to run your first organization, with room to scale when you’re ready. No hidden fees.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-5xl gap-8 relative z-10">
          {/* Free Tier */}
          <motion.div initial="hidden" animate="visible" variants={reveal} transition={{ delay: 0.1 }}>
            <div className="relative rounded-[2rem] border border-[#00e5ff]/30 bg-[#111111] p-8 sm:p-10 shadow-2xl shadow-[#00e5ff]/5 overflow-hidden group hover:border-[#00e5ff]/50 transition-colors duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00e5ff]/10 to-transparent opacity-50" />
              <div className="relative grid gap-10 md:grid-cols-[1fr_1.5fr] md:items-center">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-[#00e5ff]/20 bg-[#00e5ff]/10 px-3 py-1 text-[10px] font-bold tracking-widest text-[#00e5ff] uppercase">
                    <Zap size={12} className="fill-[#00e5ff]" /> Most Popular
                  </div>
                  <h3 className="mt-5 font-display text-3xl font-bold text-white">Free forever</h3>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="font-display text-5xl font-bold text-white">$0</span>
                    <span className="text-zinc-500 font-medium">/ month</span>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-zinc-400">Perfect for small teams building something great.</p>
                  <Link to="/signup" className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#00e5ff] py-4 text-sm font-bold text-black shadow-xl shadow-[#00e5ff]/20 transition hover:-translate-y-1 hover:bg-[#00cce6]">
                    Create your free workspace <ArrowRight size={16} />
                  </Link>
                </div>
                <div className="md:border-l md:border-white/5 md:pl-10">
                  <p className="mb-5 text-xs font-bold uppercase tracking-wider text-zinc-500">What's included</p>
                  <ul className="grid gap-4 sm:grid-cols-2 text-sm font-medium text-zinc-300">
                    {["1 organization", "Up to 10 team members", "5 clients", "Only one admin", "Roles and permissions", "Activity logs"].map(x => (
                      <li key={x} className="flex items-start gap-3"><Check className="mt-0.5 shrink-0 text-[#00e5ff]" size={16} /><span>{x}</span></li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Enterprise Tier */}
          <motion.div initial="hidden" animate="visible" variants={reveal} transition={{ delay: 0.2 }}>
            <div className="relative rounded-[2rem] border border-white/5 bg-[#0a0a0a] p-8 sm:p-10 transition hover:bg-[#111111] hover:border-white/10 group">
              <div className="relative grid gap-10 md:grid-cols-[1fr_1.5fr] md:items-center">
                <div>
                  <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                    For Scale
                  </div>
                  <h3 className="mt-5 font-display text-3xl font-bold text-white">Enterprise</h3>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="font-display text-5xl font-bold text-white">Custom</span>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-zinc-400">Advanced security, custom integrations, and dedicated support.</p>
                  <a href="mailto:admin@orgman.com" className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#111111] py-4 text-sm font-bold text-white transition hover:border-white/20 hover:bg-[#161616]">
                    Contact Admin
                  </a>
                </div>
                <div className="md:border-l md:border-white/5 md:pl-10">
                  <p className="mb-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Everything in Free, plus</p>
                  <ul className="grid gap-4 sm:grid-cols-2 text-sm font-medium text-zinc-300">
                    {["Unlimited organizations", "Unlimited team members", "Custom roles & permissions", "Custom API Integrations", "24/7 Dedicated Support", "99.99% Uptime SLA", "Activity mail for admin and teams", "SAML SSO & Advanced Security"].map(x => (
                      <li key={x} className="flex items-start gap-3"><ShieldCheck className="mt-0.5 shrink-0 text-emerald-400" size={16} /><span>{x}</span></li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
