const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'client', 'pages', 'Index.tsx');
let content = fs.readFileSync(indexPath, 'utf-8');

// Replace everything between "{/* Floating permission pill — desktop only */}" and "</div>\n  );\n}"
const startIdx = content.indexOf('{/* Floating permission pill — desktop only */}');
if (startIdx !== -1) {
  const endMarker = '    </div>\n  );\n}';
  let endIdx = content.indexOf(endMarker, startIdx);
  if (endIdx === -1) {
      endIdx = content.indexOf('    </div>\r\n  );\r\n}');
  }
  
  if (endIdx !== -1) {
    content = content.slice(0, startIdx) + endMarker + content.slice(endIdx + endMarker.length);
    fs.writeFileSync(indexPath, content);
    console.log('Successfully removed pills.');
  } else {
    console.log('Could not find end marker.');
  }
} else {
  console.log('Could not find start marker.');
}
