import React, { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "../../shared/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Eye, ShieldCheck, CheckCircle2, ArrowLeft, Zap, Building2, ArrowRight } from "lucide-react";

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
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.2 } }
};
const fadeInUp: any = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};
const scaleIn: any = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite");

  const getFriendlyError = (message: string): string => {
    const msg = message.toLowerCase();
    if (msg.includes("already registered") || msg.includes("already been registered") || msg.includes("user already exists"))
      return "This email is already registered. Please sign in instead.";
    if (msg.includes("database error saving new user") || msg.includes("database error"))
      return `Database Error: ${message}`;
    if (msg.includes("password") && msg.includes("characters"))
      return "Password must be at least 6 characters long.";
    if (msg.includes("invalid email") || msg.includes("unable to validate email"))
      return "Please enter a valid email address.";
    if (msg.includes("email rate limit") || msg.includes("rate limit"))
      return "Too many attempts. Please wait a moment and try again.";
    if (msg.includes("network") || msg.includes("fetch"))
      return "Network error. Please check your connection and try again.";
    return message;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mobileNumber && !/^[0-9]{10}$/.test(mobileNumber)) {
      toast({
        title: "Invalid Mobile Number",
        description: "Please enter a valid 10-digit mobile number.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          org_name: orgName || undefined,
          mobile_number: mobileNumber || undefined,
          invite_token: inviteToken || undefined
        },
      },
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Signup Failed",
        description: getFriendlyError(error.message),
        variant: "destructive",
      });
    } else {
      if (inviteToken) {
        localStorage.setItem("pending_invite_token", inviteToken);
      }
      toast({
        title: "Account Created! 🎉",
        description: "Check your email to confirm, then log in.",
        variant: "success" as any,
      });
      navigate("/login");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 light-theme">
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
            <Zap size={16} className="text-violet-600" /> Start Your Journey
          </motion.div>

          <motion.h1 variants={fadeInUp} className="font-display text-4xl sm:text-5xl lg:text-[48px] font-extrabold leading-[1.1] tracking-tight text-slate-900">
            Create your <br />
            <span className="text-violet-600">organization.</span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="mt-6 text-base text-slate-600 leading-relaxed max-w-lg">
            Join thousands of organizations using ORG MAN to streamline ITSM, project management, and daily operations securely.
          </motion.p>

          <motion.div variants={staggerContainer} className="mt-8 space-y-4">
            {[
              { title: "Quick Setup:", desc: "Get your workspace running in less than 2 minutes." },
              { title: "Team Collaboration:", desc: "Invite members and define granular roles effortlessly." },
              { title: "Scalable Platform:", desc: "Grow from 10 to 10,000 employees on the same platform." },
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

          <motion.div variants={fadeInUp} className="mt-10 pt-8 border-t border-slate-200 max-w-lg">
            <div className="flex items-center gap-2 text-slate-500 font-bold text-xs mb-3">
              <ShieldCheck size={16} className="text-violet-500" /> SOC2 COMPLIANT & SECURE
            </div>
            <p className="text-[11px] text-slate-500 mt-4 leading-relaxed">
              By signing up, you agree to ORG MAN's <Link to="/terms" className="text-violet-600 hover:text-violet-700">Terms</Link> and <Link to="/privacy" className="text-violet-600 hover:text-violet-700">Privacy Policy</Link>.
            </p>
          </motion.div>
        </motion.div>

        {/* RIGHT SIDE: Light Neumorphic Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          className="w-full lg:w-[45%] max-w-[440px] relative mx-auto lg:mx-0 my-auto py-8"
        >
          <motion.div 
            variants={staggerForm}
            initial="hidden"
            animate="show"
            className={`relative overflow-hidden rounded-3xl bg-slate-50 p-7 sm:p-9 ${shadowRaised}`}
          >
            <motion.div variants={fadeInUp} className="mb-6 text-center lg:text-left">
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Create Account
              </h2>
              <p className="mt-2 text-sm text-slate-500 font-medium">
                Set up your new workspace
              </p>
            </motion.div>

            <form onSubmit={handleSignup} className="space-y-4">
              <motion.div variants={scaleIn} className="space-y-1.5">
                <Label htmlFor="fullName" className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Full Name</Label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Your Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className={`h-11 pl-10 rounded-xl bg-slate-50 border-none text-slate-800 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-violet-400 transition-all ${shadowPressedInput}`}
                  />
                </div>
              </motion.div>

              {!inviteToken && (
                <motion.div variants={scaleIn} className="space-y-1.5">
                  <Label htmlFor="orgName" className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Organization Name</Label>
                  <div className="relative group">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M9 8h1"/><path d="M9 12h1"/><path d="M9 16h1"/><path d="M14 8h1"/><path d="M14 12h1"/><path d="M14 16h1"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/></svg>
                    </div>
                    <Input
                      id="orgName"
                      type="text"
                      placeholder="Your ORG Name"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      required
                      className={`h-11 pl-10 rounded-xl bg-slate-50 border-none text-slate-800 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-violet-400 transition-all ${shadowPressedInput}`}
                    />
                  </div>
                </motion.div>
              )}

              <motion.div variants={scaleIn} className="space-y-1.5">
                <Label htmlFor="mobileNumber" className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Mobile Number</Label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
                  </div>
                  <Input
                    id="mobileNumber"
                    type="tel"
                    placeholder="8010901226"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    required
                    className={`h-11 pl-10 rounded-xl bg-slate-50 border-none text-slate-800 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-violet-400 transition-all ${shadowPressedInput}`}
                  />
                </div>
              </motion.div>

              <motion.div variants={scaleIn} className="space-y-1.5">
                <Label htmlFor="email" className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Email Address</Label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={`h-11 pl-10 rounded-xl bg-slate-50 border-none text-slate-800 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-violet-400 transition-all ${shadowPressedInput}`}
                  />
                </div>
              </motion.div>

              <motion.div variants={scaleIn} className="space-y-1.5">
                <Label htmlFor="password" className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Password</Label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={`h-11 pl-10 pr-10 rounded-xl bg-slate-50 border-none text-slate-800 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-violet-400 transition-all ${shadowPressedInput}`}
                  />
                  <button 
                    type="button" 
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-500 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <Eye size={15} />
                  </button>
                </div>
              </motion.div>

              <motion.div variants={fadeInUp} className="pt-3 flex justify-center">
                <Button 
                  type="submit" 
                  className={`group h-11 w-full rounded-xl bg-slate-50 font-bold text-violet-600 transition-all ${shadowRaised} ${shadowRaisedHover}`} 
                  disabled={loading}
                >
                  {loading ? "Creating account..." : (
                    <div className="flex items-center justify-center gap-2">
                      Sign Up
                      <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  )}
                </Button>
              </motion.div>
            </form>

            <motion.div variants={fadeInUp} className="mt-6 text-center">
              <p className="text-xs text-slate-500 font-medium">
                Already have an account?{" "}
                <Link to="/login" className="font-bold text-violet-600 hover:text-violet-700 transition-colors">
                  Sign in
                </Link>
              </p>
            </motion.div>
          </motion.div>

          <motion.div variants={fadeInUp} className="mt-5 text-center">
            <Link to="/" className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-violet-500 transition-colors">
              <ArrowLeft size={14} className="mr-2" /> Back to Home
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
