/**
 * Test Suite kiểm tra Chặn Tái Phạm Mock Data và Chuẩn Hóa Cấu Trúc Dự Án MPA (TASK-032)
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of list) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(walkDir(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      results.push(fullPath);
    }
  }
  return results;
}

test('Kiểm tra Zero-Mock & Quy hoạch cấu trúc dự án MPA sạch', async (t) => {
  await t.test('1. Không tồn tại thư mục src/ (đã xóa triệt để code Vue cũ)', () => {
    assert.equal(fs.existsSync(path.join(process.cwd(), 'src')), false, 'src/ không được tồn tại trong repo');
  });

  await t.test('2. Không tồn tại file mockData.js trong thư mục runtime js/', () => {
    assert.equal(fs.existsSync(path.join(process.cwd(), 'js', 'services', 'mockData.js')), false, 'mockData.js phải bị xóa khỏi runtime');
  });

  await t.test('3. Không có file nào trong js/ import mockData.js', () => {
    const jsFiles = walkDir(path.join(process.cwd(), 'js'));
    const violatingFiles = [];
    for (const file of jsFiles) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes("from './mockData.js'") || content.includes('from "../services/mockData.js"') || content.includes('mockData.js')) {
        violatingFiles.push(file);
      }
    }
    assert.deepEqual(violatingFiles, [], 'Không được có file js nào tham chiếu đến mockData.js');
  });

  await t.test('4. package.json không còn chứa dependency vue, pinia, vite', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
    const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
    assert.equal('vue' in allDeps, false);
    assert.equal('pinia' in allDeps, false);
    assert.equal('vue-router' in allDeps, false);
    assert.equal('vite' in allDeps, false);
  });
});
