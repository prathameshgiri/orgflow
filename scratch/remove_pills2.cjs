const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'client', 'pages', 'Index.tsx');
let content = fs.readFileSync(indexPath, 'utf-8');
let lines = content.split(/\r?\n/);

let inPill = false;
let newLines = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('{/* Floating permission pill — desktop only */}')) {
    inPill = true;
  } else if (line.includes('{/* Floating alert pill — desktop only */}')) {
    inPill = true;
  }
  
  if (!inPill) {
    newLines.push(line);
  }
  
  if (inPill && line.trim() === '</motion.div>') {
    inPill = false;
  }
}

fs.writeFileSync(indexPath, newLines.join('\n'));
console.log('Successfully removed pills with lines processing.');
