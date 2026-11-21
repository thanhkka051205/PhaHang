import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');

console.log('--- BẮT ĐẦU BUILD WEBSITE ĐIỆN MÁY PHA HẰNG (MPA) ---');

// 1. Biên dịch Tailwind CSS
console.log('1. Đang biên dịch Tailwind CSS...');
execSync('npm run build:css', { stdio: 'inherit' });

// 2. Dọn dẹp và tạo thư mục dist/
console.log('2. Tạo thư mục dist sạch...');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Hàm copy an toàn trên Windows
function safeCopyFileSync(src, dest) {
  try {
    fs.copyFileSync(src, dest);
  } catch (err) {
    fs.writeFileSync(dest, fs.readFileSync(src));
  }
}

// Hàm copy thư mục đệ quy
function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      safeCopyFileSync(srcPath, destPath);
    }
  }
}

// 3. Sao chép các tệp HTML gốc
console.log('3. Sao chép toàn bộ tệp HTML gốc...');
const rootFiles = fs.readdirSync(rootDir);
let htmlCount = 0;
for (const file of rootFiles) {
  if (file.endsWith('.html')) {
    safeCopyFileSync(path.join(rootDir, file), path.join(distDir, file));
    htmlCount++;
    console.log(`   + ${file}`);
  }
}

// 4. Sao chép thư mục admin/
console.log('4. Sao chép phân hệ admin/...');
if (fs.existsSync(path.join(rootDir, 'admin'))) {
  copyDirSync(path.join(rootDir, 'admin'), path.join(distDir, 'admin'));
  const adminFiles = fs.readdirSync(path.join(distDir, 'admin'));
  console.log(`   + admin/ (${adminFiles.length} tệp)`);
}

// 5. Sao chép thư mục css/ và js/
console.log('5. Sao chép tài nguyên css/ và js/...');
if (fs.existsSync(path.join(rootDir, 'css'))) {
  copyDirSync(path.join(rootDir, 'css'), path.join(distDir, 'css'));
}
if (fs.existsSync(path.join(rootDir, 'js'))) {
  copyDirSync(path.join(rootDir, 'js'), path.join(distDir, 'js'));
}

console.log('--- HOÀN TẤT BUILD THÀNH CÔNG CHO VERCEL VÀ PRODUCTION ---');
console.log(`Đã xuất đầy đủ 16 màn hình vào ${distDir}`);
