import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ShieldAlert, Activity, Megaphone } from "lucide-react";

export default function Cookies() {
  const [essential, setEssential] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  const handleSave = () => {
    toast.success("Cookie preferences saved successfully");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />
      
      <main className="pt-32 pb-24 px-5">
        <div className="max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <div className="text-[#00e5ff] font-bold uppercase tracking-widest text-[11px] mb-4">Privacy</div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-white mb-6">
              Cookie Settings
            </h1>
            <p className="text-zinc-400 text-lg leading-relaxed">
              We use cookies to improve your experience, analyze site traffic, and serve targeted advertisements. 
              Manage your preferences below to control what information we collect.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Essential Cookies */}
            <div className="p-6 rounded-2xl border border-white/10 bg-[#111111]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Essential Cookies</h3>
                    <p className="text-sm text-zinc-400 mt-1 leading-relaxed max-w-lg">
                      These cookies are necessary for the website to function securely and properly. They cannot be disabled in our systems.
                    </p>
                  </div>
                </div>
                <Switch checked={essential} disabled className="data-[state=checked]:bg-emerald-500" />
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="p-6 rounded-2xl border border-white/5 bg-[#111111] hover:border-white/10 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                    <Activity size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Analytics Cookies</h3>
                    <p className="text-sm text-zinc-400 mt-1 leading-relaxed max-w-lg">
                      Help us understand how visitors interact with our website by collecting and reporting information anonymously.
                    </p>
                  </div>
                </div>
                <Switch checked={analytics} onCheckedChange={setAnalytics} className="data-[state=checked]:bg-blue-500" />
              </div>
            </div>

            {/* Marketing Cookies */}
            <div className="p-6 rounded-2xl border border-white/5 bg-[#111111] hover:border-white/10 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                    <Megaphone size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Marketing Cookies</h3>
                    <p className="text-sm text-zinc-400 mt-1 leading-relaxed max-w-lg">
                      Used to track visitors across websites. The intention is to display ads that are relevant and engaging for the individual user.
                    </p>
                  </div>
                </div>
                <Switch checked={marketing} onCheckedChange={setMarketing} className="data-[state=checked]:bg-purple-500" />
              </div>
            </div>

            <div className="pt-8 border-t border-white/5 flex justify-end">
              <Button onClick={handleSave} className="bg-[#00e5ff] text-black hover:bg-[#00cce6] font-bold px-8 rounded-xl h-12">
                Save Preferences
              </Button>
            </div>

          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
