const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/components/**/*.tsx');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Match transition={{ ... }} where ease is not present
  content = content.replace(/transition=\{\{([^}]+)\}\}/g, (match, p1) => {
    if (p1.includes('ease')) return match;
    return `transition={{${p1}, ease: [0.16, 1, 0.3, 1] }}`;
  });
  fs.writeFileSync(file, content);
});
console.log('Transitions updated.');
