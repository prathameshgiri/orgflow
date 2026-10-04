const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'client', 'pages', 'HowItWorks.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace the broken block
const brokenBlockRegex = /import \{\s*\r?\n\r?\n\/\/ Neumorphic shadow constants\r?\nconst shadowRaised = "[^"]+";\r?\nconst shadowPressedInput = "[^"]+";\r?\nconst shadowRaisedHover = "[^"]+";\r?\n\s*Book, ChevronRight/;

const replacement = `import { 
  Book, ChevronRight, Hash, Menu, X, ArrowRight, ShieldCheck, 
  UsersRound, Globe2, Briefcase, LayoutDashboard, LifeBuoy, 
  AlertTriangle, FilePlus, Activity, History, Settings, Lock, 
  CheckCircle2, Clock, Terminal, Database, Code, Info, Sparkles,
  Search, Sliders, Smartphone, Webhook
} from "lucide-react";

import { FadeIn } from "../components/FadeIn";

// Neumorphic shadow constants
const shadowRaised = "shadow-[4px_4px_10px_rgba(0,0,0,0.6),-4px_-4px_10px_rgba(255,255,255,0.03)]";
const shadowPressedInput = "shadow-[inset_2px_2px_5px_rgba(0,0,0,0.6),inset_-2px_-2px_5px_rgba(255,255,255,0.03)]";
const shadowRaisedHover = "hover:shadow-[2px_2px_5px_rgba(0,0,0,0.6),-2px_-2px_5px_rgba(255,255,255,0.03)] hover:translate-y-[1px]";

`;

// We just replace the bad part up to "from 'lucide-react';"
const badPartStart = content.indexOf('import { \r\n\r\n// Neumorphic shadow constants');
if (badPartStart === -1) {
    const badPartStartLF = content.indexOf('import { \n\n// Neumorphic shadow constants');
    if (badPartStartLF !== -1) {
        const endPart = content.indexOf('} from "lucide-react";', badPartStartLF);
        content = content.slice(0, badPartStartLF) + replacement + content.slice(endPart + 22);
    } else {
        console.log("Could not find the broken block");
    }
} else {
    const endPart = content.indexOf('} from "lucide-react";', badPartStart);
    content = content.slice(0, badPartStart) + replacement + content.slice(endPart + 22);
}

// Now replace DocSection and DocSubSection properly
const oldDocSection = /const DocSection = \(\{ id, title, icon: Icon, children \}: \{ id: string, title: string, icon\?: any, children: React\.ReactNode \}\) => \(\r?\n\s*<div id=\{id\} className="scroll-mt-32 mb-20 border-t border-none pt-12 mt-12">\r?\n\s*<div className="flex items-center gap-3 mb-6 pb-2 border-b border-none">/g;

content = content.replace(oldDocSection, 
\`const DocSection = ({ id, title, icon: Icon, children }: { id: string, title: string, icon?: any, children: React.ReactNode }) => (
  <div id={id} className="scroll-mt-32 mb-20 pt-12 mt-12">
    <FadeIn direction="up">
      <div className="flex items-center gap-3 mb-6 pb-2 border-b border-none">\`);

const docSectionEnd = /<\/div>\r?\n\s*<\/div>\r?\n\);/g;
// Actually we only want to close FadeIn inside DocSection...
// Let's use a simpler regex for DocSection closing
content = content.replace(/      \{children\}\r?\n\s*<\/div>\r?\n\s*<\/div>\r?\n\);/g, 
\`      {children}
    </div>
    </FadeIn>
  </div>
);\`);


const oldDocSubSection = /const DocSubSection = \(\{ id, title, children \}: \{ id: string, title: string, children: React\.ReactNode \}\) => \(\r?\n\s*<div id=\{id\} className="scroll-mt-32 mt-16 mb-8 pl-4 border-l-2 border-none hover:border-\[#00e5ff\]\/50 transition-colors">\r?\n\s*<h3 className="text-2xl/g;

content = content.replace(oldDocSubSection,
\`const DocSubSection = ({ id, title, children }: { id: string, title: string, children: React.ReactNode }) => (
  <div id={id} className="scroll-mt-32 mt-16 mb-8 pl-4 border-l-2 border-transparent hover:border-[#00e5ff]/50 transition-colors">
    <FadeIn direction="up" delay={0.1}>
      <h3 className="text-2xl\`);

// Both components end with identical closures, so the previous replace handles DocSubSection too.

fs.writeFileSync(filePath, content);
console.log('Successfully fixed imports and added FadeIn.');
