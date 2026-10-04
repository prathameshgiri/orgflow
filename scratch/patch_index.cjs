const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'client', 'pages', 'Index.tsx');
let content = fs.readFileSync(indexPath, 'utf-8');

// Insert shadow constants if not already present
if (!content.includes('shadowRaised')) {
  const importsEndIndex = content.lastIndexOf('import ');
  const insertIndex = content.indexOf('\n', importsEndIndex) + 1;
  const shadowConstants = `
// Neumorphic shadow constants
const shadowRaised = "shadow-[4px_4px_10px_rgba(0,0,0,0.6),-4px_-4px_10px_rgba(255,255,255,0.03)]";
const shadowPressedInput = "shadow-[inset_2px_2px_5px_rgba(0,0,0,0.6),inset_-2px_-2px_5px_rgba(255,255,255,0.03)]";
const shadowRaisedHover = "hover:shadow-[2px_2px_5px_rgba(0,0,0,0.6),-2px_-2px_5px_rgba(255,255,255,0.03)] hover:translate-y-[1px]";
`;
  content = content.slice(0, insertIndex) + shadowConstants + content.slice(insertIndex);
}

// 1. ITSM Grid & Platform modules & others
content = content.replace(/border border-white\/5 bg-\[#111111\]/g, 'bg-[#141414] ${shadowRaised} border-none');
content = content.replace(/bg-\[#111111\] border border-white\/5/g, 'bg-[#141414] ${shadowRaised} border-none');
content = content.replace(/bg-\[#111111\] border-b border-white\/5/g, 'bg-[#141414] border-b border-white/5');

// 2. FAQ Accordion
content = content.replace(/border-white\/5 bg-\[#111111\] hover:border-white\/10 hover:bg-\[#161616\]/g, 'border-none bg-[#141414] ${shadowRaised} ${shadowRaisedHover}');
content = content.replace(/border border-\[#00e5ff\]\/20 bg-\[#00e5ff\]\/5/g, 'border-none bg-[#141414] ${shadowPressedInput}'); // open accordion state

// 3. Dashboard Preview Card
content = content.replace(/border border-white\/10 bg-\[#0d0d0f\] shadow-\[0_40px_80px_rgba\(0,0,0,0\.7\)\]/g, 'bg-[#141414] ${shadowRaised} border-none');
// Replace bg-[#0d0d0f]/90 with bg-[#141414]
content = content.replace(/bg-\[#0d0d0f\]\/90/g, 'bg-[#141414] ${shadowRaised}');
// Members items
content = content.replace(/border border-white\/5 bg-white\/\[0\.03\]/g, 'bg-[#141414] ${shadowRaised} border-none');
// Dashboard Roles & Permissions
content = content.replace(/border border-white\/10 bg-\[#111111\]/g, 'bg-[#141414] ${shadowRaised} border-none');
content = content.replace(/border border-white\/10 bg-\[#0a0a0a\]/g, 'bg-[#141414] ${shadowRaised} border-none');

// 4. Hero section CTA buttons
// Make primary button Neumorphic
content = content.replace(/bg-\[#00e5ff\] px-6 py-2\.5 text-sm font-bold text-black shadow-\[0_0_30px_rgba\(0,229,255,0\.3\)\] transition-all hover:shadow-\[0_0_45px_rgba\(0,229,255,0\.45\)\] hover:-translate-y-0\.5/g, 
  'bg-[#141414] px-6 py-2.5 text-sm font-bold text-[#00e5ff] transition-all ${shadowRaised} ${shadowRaisedHover}');
// Make secondary button Neumorphic
content = content.replace(/border border-white\/10 bg-white\/\[0\.04\] px-6 py-2\.5 text-sm font-bold text-white backdrop-blur-sm transition-all hover:border-white\/20 hover:bg-white\/8/g, 
  'bg-[#141414] px-6 py-2.5 text-sm font-bold text-zinc-400 transition-all hover:text-[#00e5ff] ${shadowRaised} ${shadowRaisedHover}');

// Bottom CTA block buttons
content = content.replace(/bg-\[#00e5ff\] px-7 py-3 text-sm font-bold text-black shadow-lg shadow-\[#00e5ff\]\/20 transition-all hover:-translate-y-0\.5 hover:bg-\[#00cce6\] hover:shadow-\[#00e5ff\]\/35/g, 
  'bg-[#141414] px-7 py-3 text-sm font-bold text-[#00e5ff] transition-all ${shadowRaised} ${shadowRaisedHover}');
content = content.replace(/border border-white\/10 bg-white\/5 px-7 py-3 text-sm font-bold text-white transition-all hover:border-white\/20 hover:bg-white\/10/g, 
  'bg-[#141414] px-7 py-3 text-sm font-bold text-zinc-400 transition-all hover:text-[#00e5ff] ${shadowRaised} ${shadowRaisedHover}');

// Update Dashboard preview "Invite member" button
content = content.replace(/bg-\[#00e5ff\]\/10 border border-\[#00e5ff\]\/20 px-3 py-1\.5 text-\[10px\] font-bold text-\[#00e5ff\] cursor-pointer hover:bg-\[#00e5ff\]\/15/g, 
  'bg-[#141414] px-3 py-1.5 text-[10px] font-bold text-[#00e5ff] cursor-pointer hover:text-[#00e5ff] ${shadowRaised} ${shadowRaisedHover}');

// Convert className="... ${shadowRaised} ..." to className={`... ${shadowRaised} ...`}
// Wait, a regex for this might be tricky since className could already be a template literal.
// Let's replace any className="..." that contains ${ with className={`...`}
content = content.replace(/className="([^"]*\$\{[^}]+\}[^"]*)"/g, 'className={`$1`}');

fs.writeFileSync(indexPath, content);
console.log('Successfully patched Index.tsx');
