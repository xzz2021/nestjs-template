const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

const distDir = path.join(__dirname, '..', 'dist');

// 递归获取所有 .js 文件
function getAllJsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllJsFiles(filePath, fileList);
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

async function minifyFiles() {
  const jsFiles = getAllJsFiles(distDir);
  console.log(`找到 ${jsFiles.length} 个文件需要压缩...`);

  let successCount = 0;
  let errorCount = 0;
  let totalOriginalSize = 0;
  let totalMinifiedSize = 0;

  for (const filePath of jsFiles) {
    try {
      const originalCode = fs.readFileSync(filePath, 'utf8');
      const originalSize = Buffer.byteLength(originalCode, 'utf8');
      totalOriginalSize += originalSize;

      const result = await minify(originalCode, {
        compress: {
          drop_console: false, // 保留 console，生产环境可设为 true
          drop_debugger: true,
          pure_funcs: ['console.debug'], // 移除 console.debug
          passes: 2, // 多次压缩以获得更好的效果
          unsafe: false,
          unsafe_comps: false,
          unsafe_math: false,
          unsafe_methods: false,
          unsafe_proto: false,
          unsafe_regexp: false,
          unsafe_undefined: false,
        },
        format: {
          comments: false, // 移除所有注释
          beautify: false,
          ascii_only: false,
        },
        mangle: {
          keep_classnames: true, // 保留类名（NestJS 需要）
          keep_fnames: true, // 保留函数名（NestJS 需要）
          reserved: ['bootstrap', 'AppModule'], // 保留关键函数名
        },
        sourceMap: false,
      });

      if (result.error) {
        console.error(`压缩 ${filePath} 时出错:`, result.error);
        errorCount++;
        continue;
      }

      const minifiedCode = result.code;
      const minifiedSize = Buffer.byteLength(minifiedCode, 'utf8');
      totalMinifiedSize += minifiedSize;

      fs.writeFileSync(filePath, minifiedCode, 'utf8');

      const reduction = (((originalSize - minifiedSize) / originalSize) * 100).toFixed(2);
      console.log(`✓ ${path.relative(distDir, filePath)}: ${(originalSize / 1024).toFixed(2)}KB → ${(minifiedSize / 1024).toFixed(2)}KB (减少 ${reduction}%)`);
      successCount++;
    } catch (error) {
      console.error(`处理 ${filePath} 时出错:`, error.message);
      errorCount++;
    }
  }

  console.log('\n压缩完成!');
  console.log(`成功: ${successCount} 个文件`);
  console.log(`失败: ${errorCount} 个文件`);
  console.log(`总大小: ${(totalOriginalSize / 1024).toFixed(2)}KB → ${(totalMinifiedSize / 1024).toFixed(2)}KB`);
  console.log(`总体减少: ${(((totalOriginalSize - totalMinifiedSize) / totalOriginalSize) * 100).toFixed(2)}%`);
}

minifyFiles().catch(error => {
  console.error('压缩过程出错:', error);
  process.exit(1);
});
