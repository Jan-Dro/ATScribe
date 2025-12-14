const fs = require('fs');
const path = require('path');

// Move HTML files from nested directories to dist root
const filesToMove = [
  { from: 'dist/src/popup/popup.html', to: 'dist/popup.html' },
  { from: 'dist/src/options/options.html', to: 'dist/options.html' }
];

filesToMove.forEach(({ from, to }) => {
  if (fs.existsSync(from)) {
    fs.copyFileSync(from, to);
    console.log(`Moved ${from} to ${to}`);
  }
});

// Remove the src directory from dist
const srcDir = path.join('dist', 'src');
if (fs.existsSync(srcDir)) {
  fs.rmSync(srcDir, { recursive: true, force: true });
  console.log('Removed dist/src directory');
}

console.log('HTML files reorganized successfully!');