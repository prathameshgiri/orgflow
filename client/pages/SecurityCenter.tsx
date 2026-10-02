import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Server, Key } from "lucide-react";

export default function SecurityCenter() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />
      
      <main className="pt-32 pb-24 px-5">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <ShieldCheck size={32} className="text-emerald-500" />
              </div>
            </div>
            <div className="text-emerald-500 font-bold uppercase tracking-widest text-[11px] mb-4">Trust & Security</div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6">
              Security Center
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              We take security seriously. Learn about our enterprise-grade security practices, compliance standards, and how we protect your organizational data.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 mb-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="p-8 rounded-[2rem] border border-white/5 bg-[#111] hover:border-white/10 transition-colors"
            >
              <Lock className="text-[#00e5ff] mb-4" size={24} />
              <h3 className="text-xl font-bold text-white mb-3">Encryption</h3>
              <p className="text-zinc-400 leading-relaxed">
                All data is encrypted in transit using TLS 1.3 and at rest using AES-256. We employ strict key management protocols to ensure your data remains completely inaccessible to unauthorized parties.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="p-8 rounded-[2rem] border border-white/5 bg-[#111] hover:border-white/10 transition-colors"
            >
              <ShieldCheck className="text-emerald-400 mb-4" size={24} />
              <h3 className="text-xl font-bold text-white mb-3">SOC 2 Compliance</h3>
              <p className="text-zinc-400 leading-relaxed">
                We maintain rigorous security controls and undergo annual independent SOC 2 Type II audits to ensure the continuous security, availability, and confidentiality of our platform.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
              className="p-8 rounded-[2rem] border border-white/5 bg-[#111] hover:border-white/10 transition-colors"
            >
              <Server className="text-violet-400 mb-4" size={24} />
              <h3 className="text-xl font-bold text-white mb-3">Infrastructure Security</h3>
              <p className="text-zinc-400 leading-relaxed">
                Our infrastructure is hosted on world-class data centers with robust physical security. We use automated vulnerability scanning and continuous threat monitoring.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
              className="p-8 rounded-[2rem] border border-white/5 bg-[#111] hover:border-white/10 transition-colors"
            >
              <Key className="text-amber-400 mb-4" size={24} />
              <h3 className="text-xl font-bold text-white mb-3">Access Control</h3>
              <p className="text-zinc-400 leading-relaxed">
                We enforce the principle of least privilege. Support staff cannot access your organization's sensitive data without explicit, time-bound consent logged via our audit trails.
              </p>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.6 }}
            className="text-center p-8 rounded-3xl bg-gradient-to-r from-emerald-500/10 to-[#00e5ff]/10 border border-emerald-500/20"
          >
            <h3 className="text-2xl font-bold text-white mb-4">Report a Vulnerability</h3>
            <p className="text-zinc-400 mb-6">
              If you believe you have found a security vulnerability in ORG MAN, please let us know immediately. We will investigate all legitimate reports and do our best to quickly fix the problem.
            </p>
            <a href="mailto:contact@prathameshgiri.in" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 transition-colors">
              Contact Security Team
            </a>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
