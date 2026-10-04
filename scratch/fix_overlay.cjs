const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'client', 'pages', 'HowItWorks.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

content = content.replace(
  /onClick=\{\(e\) => \{\s*setIsSidebarOpen\(false\);\s*setActiveSection\(link\.id\);\s*\}\}\s*\/>/,
  "onClick={() => setIsSidebarOpen(false)}\n            />"
);

fs.writeFileSync(filePath, content);
console.log('Fixed overlay.');
