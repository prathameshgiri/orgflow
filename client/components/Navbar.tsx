import { useState } from "react";
import { Link } from "react-router-dom";
import { Command, Menu, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";

const navLinks = [
  { name: "Platform", href: "/#platform", type: "anchor" },
  { name: "Why ORG MAN", href: "/#why", type: "anchor" },
  { name: "Pricing", href: "/pricing", type: "link" },
];

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, x: -10, transition: { duration: 0.2 } }
};

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="relative z-20 border-b border-ink/5 bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-white shadow-lg shadow-ink/15">
            <Command size={18} strokeWidth={2.5} />
          </div>
          <span className="font-display text-[21px] font-bold tracking-[-0.04em]">
            org<span className="text-coral">task</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-semibold text-ink/60 md:flex">
          {navLinks.map((link) => 
            link.type === 'anchor' ? (
              <a key={link.name} href={link.href} className="transition hover:text-ink">{link.name}</a>
            ) : (
              <Link key={link.name} to={link.href} className="transition hover:text-ink">{link.name}</Link>
            )
          )}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <Link to="/login" className="px-4 py-2 text-sm font-bold text-ink/70 transition hover:text-ink">
            Sign in
          </Link>
          <Link to="/signup" className="rounded-full bg-coral px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-coral/20 transition hover:-translate-y-0.5 hover:bg-coral-dark">
            Get started <ArrowRight className="ml-1 inline" size={15} />
          </Link>
        </div>
        <button 
          aria-label="Toggle menu" 
          onClick={() => setMobileOpen(!mobileOpen)} 
          className="relative z-50 rounded-lg p-2 text-ink md:hidden"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100vh" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 top-[76px] w-full overflow-hidden bg-cream/95 backdrop-blur-2xl md:hidden"
          >
            <div className="flex flex-col justify-between h-[calc(100vh-76px)] px-6 pb-24 pt-8">
              <motion.nav 
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={{
                  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
                  exit: { transition: { staggerChildren: 0.04, staggerDirection: -1 } }
                }}
                className="flex flex-col gap-6"
              >
                {navLinks.map((link) => (
                  <motion.div key={link.name} variants={itemVariants}>
                    {link.type === 'anchor' ? (
                      <a 
                        href={link.href} 
                        onClick={() => setMobileOpen(false)}
                        className="font-display text-3xl font-bold tracking-tight text-ink hover:text-coral"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link 
                        to={link.href} 
                        onClick={() => setMobileOpen(false)}
                        className="font-display text-3xl font-bold tracking-tight text-ink hover:text-coral"
                      >
                        {link.name}
                      </Link>
                    )}
                  </motion.div>
                ))}
                
                <motion.div variants={itemVariants} className="mt-4 h-px w-full bg-ink/10" />

                <motion.div variants={itemVariants} className="mt-4 flex flex-col gap-4">
                  <Link 
                    to="/login" 
                    onClick={() => setMobileOpen(false)}
                    className="flex w-full items-center justify-between rounded-2xl border border-ink/10 bg-white/50 px-6 py-4 text-lg font-bold text-ink transition active:scale-95"
                  >
                    Sign in
                  </Link>
                  <Link 
                    to="/signup" 
                    onClick={() => setMobileOpen(false)}
                    className="flex w-full items-center justify-between rounded-2xl bg-coral px-6 py-4 text-lg font-bold text-white shadow-xl shadow-coral/20 transition active:scale-95"
                  >
                    Get started <ArrowRight size={20} />
                  </Link>
                </motion.div>
              </motion.nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
