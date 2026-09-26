import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../shared/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowLeft, Zap, Building2, ArrowRight, LockKeyhole, CheckCircle2 } from "lucide-react";

const staggerContainer: any = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const staggerForm: any = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.4 }
  }
};

const fadeInUp: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const scaleIn: any = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Check your email",
        description: "We've sent you a password reset link.",
      });
      navigate("/login");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50">
      {/* Background gradients and particles */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute -left-32 top-0 h-[800px] w-[800px] rounded-full bg-violet-200/50 blur-[120px] pointer-events-none" 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
        className="absolute right-0 bottom-0 h-[600px] w-[600px] rounded-full bg-indigo-200/40 blur-[100px] pointer-events-none" 
      />
      
      {/* Floating dots */}
      {[ 
        { top: "15%", left: "20%", size: "h-2.5 w-2.5", color: "bg-violet-400/40", delay: 0 },
        { top: "30%", left: "40%", size: "h-1.5 w-1.5", color: "bg-indigo-400/50", delay: 0.2 },
        { top: "20%", right: "25%", size: "h-3 w-3", color: "bg-fuchsia-300/40", delay: 0.4 },
        { bottom: "25%", left: "15%", size: "h-2 w-2", color: "bg-violet-300/60", delay: 0.6 },
        { bottom: "15%", right: "30%", size: "h-2.5 w-2.5", color: "bg-indigo-300/50", delay: 0.8 },
      ].map((dot, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: [0, -10, 0] }}
          transition={{ duration: 3, delay: dot.delay, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          className={`absolute ${dot.size} rounded-full ${dot.color} blur-[1px]`}
          style={{ top: dot.top, left: dot.left, right: dot.right, bottom: dot.bottom }}
        />
      ))}

      <div className="relative z-10 w-full max-w-[1200px] px-6 py-6 lg:py-8 lg:px-12 flex flex-col lg:flex-row items-center gap-8 xl:gap-16">
        
        {/* LEFT SIDE: Marketing Content */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="w-full lg:w-[55%]"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-1.5 text-sm font-semibold text-violet-700 shadow-sm mb-4">
            <LockKeyhole size={16} className="text-violet-600" /> Account Recovery
          </motion.div>

          <motion.h1 variants={fadeInUp} className="font-display text-4xl sm:text-5xl lg:text-[48px] font-extrabold leading-[1.1] tracking-tight text-slate-900">
            Secure your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 relative">
              workspace.
              <span className="absolute -left-2 top-2 h-4 w-4 rounded-full bg-violet-900/10 blur-sm pointer-events-none"></span>
            </span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="mt-4 text-base text-slate-600 leading-relaxed max-w-lg">
            Don't worry, it happens to the best of us. We'll help you get back into your account securely and quickly.
          </motion.p>

          <motion.div variants={staggerContainer} className="mt-6 space-y-3">
            {[
              { title: "Fast Recovery:", desc: "Get a secure reset link delivered instantly to your inbox." },
              { title: "Enterprise Grade:", desc: "Your new password will be encrypted using industry standards." },
              { title: "24/7 Support:", desc: "Our team is here to help if you encounter any issues." },
            ].map((item, index) => (
              <motion.div variants={fadeInUp} key={index} className="flex gap-4">
                <div className="mt-1 flex-shrink-0 text-violet-600">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <span className="font-bold text-slate-900">{item.title}</span> <span className="text-slate-600">{item.desc}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={fadeInUp} className="mt-6 pt-6 border-t border-slate-200 max-w-lg">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm mb-2">
              <ShieldCheck size={18} /> SOC2 COMPLIANT & SECURE
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your organizational data is encrypted at rest and in transit.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
                <Building2 size={16} className="text-violet-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Powered by <span className="text-violet-600">ORG MAN</span></p>
                <p className="text-xs text-slate-400">&copy; {new Date().getFullYear()} ORG MAN Inc.</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* RIGHT SIDE: Floating Form Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 100 }}
          className="w-full lg:w-[45%] max-w-[480px] relative"
        >
          <motion.div 
            variants={staggerForm}
            initial="hidden"
            animate="show"
            className="relative overflow-hidden rounded-3xl bg-white p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(79,70,229,0.15),0_0_40px_rgba(124,58,237,0.05)] border border-slate-100/50"
          >
            {/* Top decorative gradient line */}
            <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500" />

            <motion.div variants={fadeInUp} className="mb-5">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100/50 text-violet-600 shadow-sm border border-violet-100">
                <LockKeyhole size={24} />
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Reset Password
              </h2>
              <p className="mt-2 text-sm text-slate-500 font-medium">
                Enter your email and we'll send you a reset link.
              </p>
            </motion.div>

            <form onSubmit={handleReset} className="space-y-4">
              <motion.div variants={scaleIn} className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-600">Email Address</Label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 pl-10 rounded-xl bg-slate-50/50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:bg-white hover:border-violet-300 focus-visible:border-violet-500 focus-visible:ring-4 focus-visible:ring-violet-500/10 transition-all shadow-sm"
                  />
                </div>
              </motion.div>

              <motion.div variants={fadeInUp} className="pt-2 flex justify-center">
                <Button 
                  type="submit" 
                  className="group relative h-11 w-full overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 font-bold text-white hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg shadow-violet-500/25" 
                  disabled={loading}
                >
                  <span className="relative z-10 flex items-center justify-center">
                    {loading ? "Sending link..." : (
                      <>
                        Send Reset Link
                        <ArrowRight size={16} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer" />
                </Button>
              </motion.div>
            </form>

            <motion.div variants={fadeInUp} className="mt-6 text-center border-t border-slate-100 pt-6">
              <Link to="/login" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors">
                <ArrowLeft size={14} className="mr-2" /> Back to Login
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
