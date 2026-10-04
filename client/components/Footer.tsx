import { Link, useLocation } from "react-router-dom";
import { Command, ArrowRight } from "lucide-react";

// Neumorphic shadow constants
const shadowRaised = "shadow-[4px_4px_10px_rgba(0,0,0,0.6),-4px_-4px_10px_rgba(255,255,255,0.03)]";
const shadowPressedInput = "shadow-[inset_2px_2px_5px_rgba(0,0,0,0.6),inset_-2px_-2px_5px_rgba(255,255,255,0.03)]";
const shadowRaisedHover = "hover:shadow-[2px_2px_5px_rgba(0,0,0,0.6),-2px_-2px_5px_rgba(255,255,255,0.03)] hover:translate-y-[1px]";

export default function Footer() {
  const location = useLocation();
  if (location.pathname !== "/") return null;

  return (
    <footer className="relative overflow-hidden bg-[#0a0a0a] pt-24 text-white lg:pt-32">
      {/* Background Glows */}
      <div className="absolute -right-1/4 bottom-0 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-[1fr_2fr]">
          {/* Brand & CTA */}
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-[#141414] text-[#00e5ff] ${shadowRaised}`}>
                <Command size={20} strokeWidth={2.5} />
              </div>
              <span className="font-display text-2xl font-bold tracking-tight text-white">
                ORG <span className="text-[#00e5ff]">MAN</span>
              </span>
            </Link>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-zinc-400">
              The access control platform built for modern, fast-moving organizations. Secure your infrastructure in minutes.
            </p>
            <div className="mt-8 flex gap-4">
              <a href="#" className={`flex h-10 w-10 items-center justify-center rounded-xl bg-[#141414] text-zinc-400 transition hover:text-[#00e5ff] ${shadowRaised} ${shadowRaisedHover}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
              <a href="#" className={`flex h-10 w-10 items-center justify-center rounded-xl bg-[#141414] text-zinc-400 transition hover:text-[#00e5ff] ${shadowRaised} ${shadowRaisedHover}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
              </a>
              <a href="#" className={`flex h-10 w-10 items-center justify-center rounded-xl bg-[#141414] text-zinc-400 transition hover:text-[#00e5ff] ${shadowRaised} ${shadowRaisedHover}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h4 className="font-display text-xs font-bold uppercase tracking-widest text-white">Product</h4>
              <ul className="mt-6 grid gap-4 text-sm text-zinc-400">
                <li><a href="/#platform" className="transition hover:text-[#00e5ff]">Features</a></li>
                <li><Link to="/pricing" className="transition hover:text-[#00e5ff]">Pricing</Link></li>
                <li><a href="/#why" className="transition hover:text-[#00e5ff]">Security</a></li>
                <li><a href="#" className="transition hover:text-[#00e5ff]">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display text-xs font-bold uppercase tracking-widest text-white">Company</h4>
              <ul className="mt-6 grid gap-4 text-sm text-zinc-400">
                <li><a href="#" className="transition hover:text-[#00e5ff]">About Us</a></li>
                <li><a href="#" className="transition hover:text-[#00e5ff]">Careers</a></li>
                <li><a href="#" className="transition hover:text-[#00e5ff]">Blog</a></li>
                <li><a href="mailto:contact@prathameshgiri.in" className="transition hover:text-[#00e5ff]">Contact</a></li>
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h4 className="font-display text-xs font-bold uppercase tracking-widest text-white">Stay up to date</h4>
              <p className="mt-6 text-sm text-zinc-400">Subscribe to our newsletter for product updates.</p>
              <form className="mt-4 flex gap-2">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className={`w-full rounded-xl bg-[#141414] border-none px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:ring-1 focus:ring-[#00e5ff]/50 ${shadowPressedInput}`}
                />
                <button type="submit" className={`flex items-center justify-center rounded-xl bg-[#141414] text-[#00e5ff] px-4 py-2 transition ${shadowRaised} ${shadowRaisedHover}`}>
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-24 flex flex-col items-center justify-between border-t border-white/5 py-8 sm:flex-row text-center sm:text-left gap-4 sm:gap-0">
          <p className="text-xs font-semibold text-white/40 leading-relaxed">
            © {new Date().getFullYear()} ORG MAN Inc. All rights reserved.
            <span className="hidden sm:inline"> | </span>
            <br className="sm:hidden" />
            <a href="https://build.prathameshgiri.in/" target="_blank" rel="noreferrer" className="text-[#00e5ff] hover:underline transition-colors sm:ml-1">
              Build With Prathamesh Giri
            </a>
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs font-semibold text-white/40">
            <Link to="/privacy" className="transition hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="transition hover:text-white">Terms of Service</Link>
            <Link to="/cookies" className="transition hover:text-white">Cookie Settings</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
