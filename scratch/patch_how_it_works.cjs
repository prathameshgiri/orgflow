const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'client', 'pages', 'HowItWorks.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Insert shadow constants if not already present
if (!content.includes('shadowRaised')) {
  const importsEndIndex = content.lastIndexOf('from "lucide-react";');
  const insertIndex = content.indexOf('\n', importsEndIndex) + 1;
  const shadowConstants = `
import { FadeIn } from "../components/FadeIn";

// Neumorphic shadow constants
const shadowRaised = "shadow-[4px_4px_10px_rgba(0,0,0,0.6),-4px_-4px_10px_rgba(255,255,255,0.03)]";
const shadowPressedInput = "shadow-[inset_2px_2px_5px_rgba(0,0,0,0.6),inset_-2px_-2px_5px_rgba(255,255,255,0.03)]";
const shadowRaisedHover = "hover:shadow-[2px_2px_5px_rgba(0,0,0,0.6),-2px_-2px_5px_rgba(255,255,255,0.03)] hover:translate-y-[1px]";
`;
  content = content.slice(0, insertIndex) + shadowConstants + content.slice(insertIndex);
}

// Global replaces for dark neumorphism classes
content = content.replace(/bg-\[#111\]/g, 'bg-[#141414] ${shadowRaised} border-none');
content = content.replace(/bg-\[#111111\]/g, 'bg-[#141414] ${shadowRaised} border-none');
content = content.replace(/bg-\[#050505\]/g, 'bg-[#141414] ${shadowRaised} border-none');
content = content.replace(/bg-white\/\[0\.02\]/g, 'bg-[#141414] ${shadowRaised} border-none');
content = content.replace(/bg-\[#080808\]/g, 'bg-[#0a0a0a]'); 
content = content.replace(/bg-\[#040404\]/g, 'bg-[#0a0a0a]'); 
content = content.replace(/border border-white\/5/g, 'border-none');
content = content.replace(/border border-white\/10/g, 'border-none');

// StepBox
content = content.replace(/border border-white\/5 bg-\[#111\] hover:bg-\[#151515\] hover:border-white\/10/g, 'bg-[#141414] border-none hover:bg-[#141414] ${shadowRaised} ${shadowRaisedHover}');

// DataTable
content = content.replace(/bg-\[#1a1a1a\]/g, 'bg-[#141414] ${shadowPressedInput} border-none');

// Wrap DocSection & DocSubSection content with FadeIn
content = content.replace(
  /const DocSection = \(\{ id, title, icon: Icon, children \}: \{ id: string, title: string, icon\?: any, children: React\.ReactNode \}\) => \(/g,
  "const DocSection = ({ id, title, icon: Icon, children }: { id: string, title: string, icon?: any, children: React.ReactNode }) => (<FadeIn direction='up'>"
);

content = content.replace(
  /const DocSubSection = \(\{ id, title, children \}: \{ id: string, title: string, children: React\.ReactNode \}\) => \(/g,
  "const DocSubSection = ({ id, title, children }: { id: string, title: string, children: React.ReactNode }) => (<FadeIn direction='up' delay={0.1}>"
);

// Close FadeIn by replacing the specific ending of these components
// The original ending is just </div>\n);
// I can just replace the definition to wrap the return value
content = content.replace(/<\/div>\r?\n\s*\);\r?\n\r?\nconst InfoAlert/g, '</div>\n  </FadeIn>\n);\n\nconst InfoAlert');
content = content.replace(/<\/div>\r?\n\s*\);\r?\n\r?\nconst CodeBlock/g, '</div>\n  </FadeIn>\n);\n\nconst CodeBlock');


// Make sure classes containing interpolations are converted to template literals
content = content.replace(/className="([^"]*\$\{[^}]+\}[^"]*)"/g, 'className={`$1`}');

fs.writeFileSync(filePath, content);
console.log('Successfully patched HowItWorks.tsx');
