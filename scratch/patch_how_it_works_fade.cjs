const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'client', 'pages', 'HowItWorks.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Add import
if (!content.includes('FadeIn')) {
  content = content.replace('import Navbar', 'import { FadeIn } from "../components/FadeIn";\nimport Navbar');
}

// Wrap DocSection
content = content.replace(
  /const DocSection = \([^)]+\) => \(\n  <div id=\{id\}/,
  'const DocSection = ({ id, title, icon: Icon, children }: { id: string, title: string, icon?: any, children: React.ReactNode }) => (\n  <div id={id} className="scroll-mt-32 mb-20 border-t border-white/5 pt-12 mt-12">\n    <FadeIn>'
);
// This regex approach is brittle, I'll just use string replacement carefully.

// Let's replace the DocSection definition entirely
const oldDocSection = `const DocSection = ({ id, title, icon: Icon, children }: { id: string, title: string, icon?: any, children: React.ReactNode }) => (
  <div id={id} className="scroll-mt-32 mb-20 border-t border-none pt-12 mt-12">
    <div className="flex items-center gap-3 mb-6 pb-2 border-b border-none">
      {Icon && <Icon className="text-[#00e5ff]" size={28} />}
      <h2 className="text-4xl font-display font-bold text-white group cursor-pointer hover:text-[#00e5ff] transition-colors">
        <a href={\`#\${id}\`} className="flex items-center gap-2">
          {title} <Hash size={20} className="opacity-0 group-hover:opacity-100 text-zinc-500" />
        </a>
      </h2>
    </div>
    <div className="space-y-6 text-zinc-300 leading-relaxed text-lg">
      {children}
    </div>
  </div>
);`;

const newDocSection = `const DocSection = ({ id, title, icon: Icon, children }: { id: string, title: string, icon?: any, children: React.ReactNode }) => (
  <div id={id} className="scroll-mt-32 mb-20 pt-12 mt-12">
    <FadeIn direction="up">
      <div className="flex items-center gap-3 mb-6 pb-2 border-b border-none">
        {Icon && <Icon className="text-[#00e5ff]" size={28} />}
        <h2 className="text-4xl font-display font-bold text-white group cursor-pointer hover:text-[#00e5ff] transition-colors">
          <a href={\`#\${id}\`} className="flex items-center gap-2">
            {title} <Hash size={20} className="opacity-0 group-hover:opacity-100 text-zinc-500" />
          </a>
        </h2>
      </div>
      <div className="space-y-6 text-zinc-300 leading-relaxed text-lg">
        {children}
      </div>
    </FadeIn>
  </div>
);`;

// Let's replace the DocSubSection definition entirely
const oldDocSubSection = `const DocSubSection = ({ id, title, children }: { id: string, title: string, children: React.ReactNode }) => (
  <div id={id} className="scroll-mt-32 mt-16 mb-8 pl-4 border-l-2 border-none hover:border-[#00e5ff]/50 transition-colors">
    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 group cursor-pointer hover:text-[#00e5ff] transition-colors">
      <a href={\`#\${id}\`} className="flex items-center gap-2">
        {title} <Hash size={16} className="opacity-0 group-hover:opacity-100 text-zinc-500" />
      </a>
    </h3>
    <div className="space-y-5 text-zinc-400 text-base leading-7">
      {children}
    </div>
  </div>
);`;

const newDocSubSection = `const DocSubSection = ({ id, title, children }: { id: string, title: string, children: React.ReactNode }) => (
  <div id={id} className="scroll-mt-32 mt-16 mb-8 pl-4 border-l-2 border-transparent hover:border-[#00e5ff]/50 transition-colors">
    <FadeIn direction="up" delay={0.1}>
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 group cursor-pointer hover:text-[#00e5ff] transition-colors">
        <a href={\`#\${id}\`} className="flex items-center gap-2">
          {title} <Hash size={16} className="opacity-0 group-hover:opacity-100 text-zinc-500" />
        </a>
      </h3>
      <div className="space-y-5 text-zinc-400 text-base leading-7">
        {children}
      </div>
    </FadeIn>
  </div>
);`;

// The script might fail if the old blocks don't match EXACTLY, let's just use simpler regex

content = content.replace(/const DocSection =[\s\S]+?\}\n  <\/div>\n\);/g, newDocSection);
content = content.replace(/const DocSubSection =[\s\S]+?\}\n  <\/div>\n\);/g, newDocSubSection);

fs.writeFileSync(filePath, content);
console.log('Successfully patched HowItWorks.tsx with FadeIn');
