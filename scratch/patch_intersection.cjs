const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'client', 'pages', 'HowItWorks.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace the observer logic
const oldObserver = `  // Intersection Observer to highlight active section in sidebar
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.1) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-10% 0px -80% 0px", threshold: [0.1, 0.5, 1.0] }
    );`;

const newObserver = `  // Intersection Observer to highlight active section in sidebar
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -50% 0px", threshold: 0 }
    );`;

// Wait, doing string replacement might fail because of whitespace differences. 
// I will use regex.

content = content.replace(
  /const observer = new IntersectionObserver\([\s\S]+?\{ rootMargin: "-10% 0px -80% 0px", threshold: \[0\.1, 0\.5, 1\.0\] \}\r?\n\s*\);/,
  `const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -50% 0px", threshold: 0 }
    );`
);

// Replace the link
content = content.replace(
  /onClick=\{\(\) => setIsSidebarOpen\(false\)\}/g,
  `onClick={(e) => {
                            setIsSidebarOpen(false);
                            setActiveSection(link.id);
                          }}`
);

content = content.replace(
  /activeSection === link\.id \r?\n\s*\? "bg-gradient-to-r from-\[#00e5ff\]\/15 to-transparent text-\[#00e5ff\] border-l-2 border-\[#00e5ff\]" \r?\n\s*: "text-zinc-400 hover:text-white hover:bg-white\/\[0\.03\] border-l-2 border-transparent"/g,
  "activeSection === link.id ? `bg-[#141414] ${shadowRaised} ${shadowRaisedHover} text-[#00e5ff] font-bold` : 'text-zinc-400 hover:text-white hover:bg-[#141414] hover:shadow-[2px_2px_5px_rgba(0,0,0,0.6),-2px_-2px_5px_rgba(255,255,255,0.03)] border-l-2 border-transparent'"
);

fs.writeFileSync(filePath, content);
console.log("Successfully patched observer logic.");
