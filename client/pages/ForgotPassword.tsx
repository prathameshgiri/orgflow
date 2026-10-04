import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../shared/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowLeft, ArrowRight, LockKeyhole, CheckCircle2 } from "lucide-react";

// Light Neumorphic shadow constants for white/slate-50 theme
const shadowRaised = "shadow-[6px_6px_14px_#d1d5db,-6px_-6px_14px_#ffffff]";
const shadowPressedInput = "shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff]";
const shadowRaisedHover = "hover:shadow-[2px_2px_5px_#d1d5db,-2px_-2px_5px_#ffffff] hover:translate-y-[1px]";

const staggerContainer: any = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};
const staggerForm: any = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
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
      {/* Light Ambient background glows */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-full bg-[radial-gradient(ellipse_50%_50%_at_20%_30%,rgba(0,229,255,0.06),transparent)]" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-full w-full bg-[radial-gradient(ellipse_40%_40%_at_80%_80%,rgba(139,92,246,0.06),transparent)]" />

      <div className="relative z-10 w-full max-w-[1200px] px-5 py-6 lg:py-8 lg:px-12 flex flex-col lg:flex-row items-center gap-8 xl:gap-16">
        
        {/* LEFT SIDE: Marketing Content (Hidden on mobile) */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="hidden lg:block w-full lg:w-[55%]"
        >
          <motion.div variants={fadeInUp} className={`inline-flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-1.5 text-sm font-semibold text-violet-600 ${shadowRaised} mb-6`}>
            <LockKeyhole size={16} className="text-violet-600" /> Account Recovery
          </motion.div>

          <motion.h1 variants={fadeInUp} className="font-display text-4xl sm:text-5xl lg:text-[48px] font-extrabold leading-[1.1] tracking-tight text-slate-900">
            Secure your <br />
            <span className="text-violet-600">workspace.</span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="mt-6 text-base text-slate-600 leading-relaxed max-w-lg">
            Don't worry, it happens to the best of us. We'll help you get back into your account securely and quickly.
          </motion.p>

          <motion.div variants={staggerContainer} className="mt-8 space-y-4">
            {[
              { title: "Fast Recovery:", desc: "Get a secure reset link delivered instantly to your inbox." },
              { title: "Enterprise Grade:", desc: "Your new password will be encrypted using industry standards." },
              { title: "24/7 Support:", desc: "Our team is here to help if you encounter any issues." },
            ].map((item, index) => (
              <motion.div variants={fadeInUp} key={index} className="flex gap-4 items-start">
                <div className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-slate-50 text-violet-600 ${shadowRaised}`}>
                  <CheckCircle2 size={14} />
                </div>
                <div>
                  <span className="font-bold text-slate-900">{item.title}</span> <span className="text-slate-600">{item.desc}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* RIGHT SIDE: Light Neumorphic Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          className="w-full lg:w-[45%] max-w-[440px] relative mx-auto lg:mx-0"
        >
          <motion.div 
            variants={staggerForm}
            initial="hidden"
            animate="show"
            className={`relative overflow-hidden rounded-3xl bg-slate-50 p-7 sm:p-9 ${shadowRaised}`}
          >
            <motion.div variants={fadeInUp} className="mb-8 text-center lg:text-left">
              <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-violet-600 ${shadowRaised}`}>
                <LockKeyhole size={20} />
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Reset Password
              </h2>
              <p className="mt-2 text-sm text-slate-500 font-medium">
                Enter your email and we'll send a link
              </p>
            </motion.div>

            <form onSubmit={handleReset} className="space-y-6">
              <motion.div variants={scaleIn} className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Email Address</Label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={`h-12 pl-10 rounded-xl bg-slate-50 border-none text-slate-800 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-violet-400 transition-all ${shadowPressedInput}`}
                  />
                </div>
              </motion.div>

              <motion.div variants={fadeInUp} className="pt-2 flex justify-center">
                <Button 
                  type="submit" 
                  className={`group h-12 w-full rounded-xl bg-slate-50 font-bold text-violet-600 transition-all ${shadowRaised} ${shadowRaisedHover}`} 
                  disabled={loading}
                >
                  {loading ? "Sending link..." : (
                    <div className="flex items-center justify-center gap-2">
                      Send Reset Link
                      <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  )}
                </Button>
              </motion.div>
            </form>

            <motion.div variants={fadeInUp} className="mt-8 text-center">
              <Link to="/login" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-violet-600 transition-colors">
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
