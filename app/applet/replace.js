import fs from 'fs';
import path from 'path';

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = fs.statSync(dirFile).isDirectory()
        ? walkSync(dirFile, filelist)
        : filelist.concat(dirFile);
    } catch (err) {
      if (err.code === 'ENOENT') {
        return filelist;
      }
    }
  });
  return filelist;
}

const files = walkSync('src')
  .filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('amber-500') || content.includes('amber-600') || content.includes('amber-400') || content.includes('orange-500') || content.includes('orange-600')) {
    content = content.replace(/amber-500/g, 'accent');
    content = content.replace(/amber-400/g, 'accent/80');
    content = content.replace(/amber-600/g, 'accent/80');
    content = content.replace(/orange-500/g, 'accent');
    content = content.replace(/orange-600/g, 'accent/80');
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
