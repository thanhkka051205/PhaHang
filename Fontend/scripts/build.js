import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');

console.log('--- BẮT ĐẦU BUILD WEBSITE ĐIỆN MÁY PHA HẰNG (3 VAI TRÒ: CUSTOMER / STAFF / ADMIN) ---');

console.log('1. Đang biên dịch Tailwind CSS...');
execSync('npm run build:css', { stdio: 'inherit' });

console.log('2. Tạo thư mục dist sạch...');
fs.mkdirSync(distDir, { recursive: true });

function safeCopyFileSync(src, dest) {
  try {
    fs.copyFileSync(src, dest);
  } catch (err) {
    fs.writeFileSync(dest, fs.readFileSync(src));
  }
}

function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      safeCopyFileSync(srcPath, destPath);
    }
  }
}

if (fs.existsSync(path.join(rootDir, 'index.html'))) {
  safeCopyFileSync(path.join(rootDir, 'index.html'), path.join(distDir, 'index.html'));
}

for (const folder of ['shared', 'customer', 'staff', 'admin']) {
  console.log(`3. Sao chép phân hệ ${folder}/...`);
  copyDirSync(path.join(rootDir, folder), path.join(distDir, folder));
}

console.log('--- HOÀN TẤT BUILD THÀNH CÔNG ---');
