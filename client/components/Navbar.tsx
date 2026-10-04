import { useState } from "react";
import { Link } from "react-router-dom";
import { Command, Menu, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";

const navLinks = [
  { name: "Platform",     href: "/#platform",     type: "anchor" },
  { name: "How It Works", href: "/how-it-works",  type: "link"   },
  { name: "Why ORG MAN",  href: "/#why",          type: "anchor" },
  { name: "Pricing",      href: "/pricing",       type: "link"   },
];

const itemVariants: Variants = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } },
  exit:    { opacity: 0, y: 4,  transition: { duration: 0.14 } },
};

// Neumorphic shadow constants for dark theme (#141414 base)
const shadowRaised = "shadow-[4px_4px_10px_rgba(0,0,0,0.6),-4px_-4px_10px_rgba(255,255,255,0.03)]";
const shadowPressed = "shadow-[inset_4px_4px_10px_rgba(0,0,0,0.6),inset_-4px_-4px_10px_rgba(255,255,255,0.03)]";
const shadowRaisedHover = "hover:shadow-[2px_2px_5px_rgba(0,0,0,0.6),-2px_-2px_5px_rgba(255,255,255,0.03)] hover:translate-y-[1px]";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavLinkEl = ({
    link,
    mobile = false,
    index = 0,
  }: {
    link: (typeof navLinks)[0];
    mobile?: boolean;
    index?: number;
  }) => {
    const mobileClass = `group flex items-center justify-between rounded-xl bg-[#141414] px-4 py-3 transition-all ${shadowRaised} ${shadowRaisedHover}`;
    const desktopClass =
      `group relative flex items-center justify-center rounded-lg px-4 py-2 text-[11px] font-bold tracking-wide text-zinc-400 transition-all hover:text-[#00e5ff] ${mobileOpen ? '' : ''}`;

    const content = mobile ? (
      <>
        <div className="flex items-center gap-4">
          <span className="w-5 flex h-5 items-center justify-center rounded-full bg-[#141414] text-[9px] font-bold tabular-nums text-[#00e5ff] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5),inset_-2px_-2px_5px_rgba(255,255,255,0.03)]">
            {index + 1}
          </span>
          <span className="text-[14px] font-semibold text-zinc-300 group-hover:text-white transition-colors">
            {link.name}
          </span>
        </div>
        <ArrowRight size={14} className="text-zinc-600 group-hover:text-[#00e5ff] transition-colors" />
      </>
    ) : (
      <>
        {link.name}
      </>
    );

    if (link.type === "anchor") {
      return (
        <a href={link.href} onClick={() => setMobileOpen(false)} className={mobile ? mobileClass : desktopClass}>
          {content}
        </a>
      );
    }
    return (
      <Link to={link.href} onClick={() => setMobileOpen(false)} className={mobile ? mobileClass : desktopClass}>
        {content}
      </Link>
    );
  };

  return (
    <>
      <header className="relative z-20 bg-[#141414]">
        {/* ── Desktop ── */}
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 lg:px-8">

          {/* Logo */}
          <Link to="/" className="group flex items-center gap-3" onClick={() => setMobileOpen(false)}>
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-[#141414] text-[#00e5ff] transition-all ${shadowRaised}`}>
              <Command size={16} strokeWidth={2.5} />
            </div>
            <span className="font-display text-[18px] font-bold tracking-[-0.04em] text-white">
              ORG <span className="text-[#00e5ff]">MAN</span>
            </span>
          </Link>

          {/* Center nav — Neumorphic container */}
          <nav className={`hidden md:flex items-center gap-2 rounded-xl bg-[#141414] px-2 py-1.5 ${shadowPressed}`}>
            {navLinks.map((link, i) => (
              <NavLinkEl key={link.name} link={link} index={i} />
            ))}
          </nav>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/login"
              className={`flex items-center justify-center rounded-lg bg-[#141414] px-3 py-1.5 text-[10px] font-bold text-zinc-300 transition-all ${shadowRaised} ${shadowRaisedHover}`}
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className={`flex items-center gap-1.5 rounded-lg bg-[#141414] px-3.5 py-1.5 text-[10px] font-bold text-[#00e5ff] transition-all ${shadowRaised} ${shadowRaisedHover}`}
            >
              Get started
              <ArrowRight size={10} />
            </Link>
          </div>

          {/* Hamburger */}
          <button
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((o) => !o)}
            className={`relative z-50 flex items-center justify-center h-8 w-8 rounded-lg bg-[#141414] text-zinc-300 md:hidden transition-all ${mobileOpen ? shadowPressed : shadowRaised}`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={mobileOpen ? "x" : "menu"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className={mobileOpen ? "text-[#00e5ff]" : ""}
              >
                {mobileOpen ? <X size={16} /> : <Menu size={16} />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>

        {/* ── Mobile menu ── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 top-full w-full md:hidden bg-[#141414]"
              style={{ minHeight: "calc(100vh - 64px)" }}
            >
              <div className="relative flex flex-col px-5 pt-5 pb-10 gap-6">

                {/* Nav rows */}
                <motion.nav
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={{
                    visible: { transition: { staggerChildren: 0.06 } },
                    exit:    { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
                  }}
                  className="flex flex-col gap-3"
                >
                  {navLinks.map((link, i) => (
                    <motion.div key={link.name} variants={itemVariants}>
                      <NavLinkEl link={link} mobile index={i} />
                    </motion.div>
                  ))}
                </motion.nav>

                {/* CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={`mt-4 flex flex-col gap-3 rounded-2xl bg-[#141414] p-3.5 ${shadowPressed}`}
                >
                  <Link
                    to="/signup"
                    onClick={() => setMobileOpen(false)}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl bg-[#141414] px-4 py-3 text-[12px] font-extrabold text-[#00e5ff] transition-all ${shadowRaised} ${shadowRaisedHover}`}
                  >
                    Get started free
                    <ArrowRight size={14} />
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className={`flex w-full items-center justify-center rounded-xl bg-[#141414] px-4 py-3 text-[12px] font-bold text-zinc-400 transition-all ${shadowRaised} ${shadowRaisedHover}`}
                  >
                    Sign in to dashboard
                  </Link>
                </motion.div>

                {/* Trust row */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-2 flex justify-center gap-6"
                >
                  {["Free forever", "No credit card", "SOC 2"].map((t) => (
                    <div key={t} className={`flex h-6 items-center gap-1.5 rounded-full bg-[#141414] px-3 text-[9px] font-bold text-zinc-500 ${shadowRaised}`}>
                      <span className="h-[4px] w-[4px] rounded-full bg-[#00e5ff]" />
                      {t}
                    </div>
                  ))}
                </motion.div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
