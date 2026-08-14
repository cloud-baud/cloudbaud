import fs from 'fs';
import path from 'path';

const src = path.resolve('dist-finance');
const dest = path.resolve('dist');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    // Avoid overwriting if they are identical, though they should be distinct due to hash naming
    fs.copyFileSync(src, dest);
  }
}

if (!fs.existsSync(src)) {
  console.error(`Source directory "${src}" does not exist. Run "npm run build:finance" first.`);
  process.exit(1);
}

if (!fs.existsSync(dest)) {
  console.error(`Destination directory "${dest}" does not exist. Run "npm run build" first.`);
  process.exit(1);
}

console.log('Merging dist-finance assets and pages into dist...');
copyRecursiveSync(src, dest);
console.log('Successfully merged both SPAs into dist directory!');
