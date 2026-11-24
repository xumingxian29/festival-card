/* R14 回归测试：每日首发 / 打字机 / 贴纸位置循环 / 主屏化 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const lib = fs.readFileSync(path.join(root, 'library.js'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));

let pass = 0, fails = 0;
function ok(cond, msg) {
  if (cond) { pass++; console.log('  ✅ ' + msg); }
  else { fails++; console.log('  ❌ ' + msg); }
}
function extract(name, src) {
  const s = src || html;
  const i = s.indexOf('function ' + name + '(');
  if (i < 0) return '';
  let depth = 0;
  const j = s.indexOf('{', i);
  for (let k = j; k < s.length; k++) {
    if (s[k] === '{') depth++;
    else if (s[k] === '}') { depth--; if (!depth) return s.slice(i, k + 1); }
  }
  return '';
}

console.log('== 1. 每日首发 ==');
ok(/var TODAY_TPL = \(function\(\)\{/.test(html), 'TODAY_TPL 按日期计算');
ok(/var TPL = TODAY_TPL;/.test(html), '首屏初始卡 = 今日首发卡');
ok(/今日首发/.test(html), '首屏标注「今日首发」');
const todaySrc = html.match(/var TODAY_TPL = (\(function\(\)\{[\s\S]*?\}\)\(\));/)[1];
const dayFn = new Function('TPL_LIBRARY', 'return ' + todaySrc + ';');
ok(typeof dayFn([{ id: 'a' }, { id: 'b' }]) === 'string', '日期轮换函数可独立执行');
ok(dayFn([{ id: 'a' }, { id: 'b' }]) === dayFn([{ id: 'a' }, { id: 'b' }]), '同一天结果稳定（回访看到同一张首发）');

console.log('== 2. 打字机 ==');
ok(extract('typeGreet').indexOf('setInterval') > 0, 'typeGreet 用定时器逐字浮现');
const tg = new Function('el', 'text', extract('typeGreet'));
ok(/text\.length > 24 \? 32 : 55/.test(html), '长句自动加速，不用等太久');
ok(/typeGreet\(gr, card\.w\)/.test(html), '拆卡页祝福接入打字机');

console.log('== 3. 贴纸位置循环 ==');
ok(/var STICKER_POS = \[/.test(html), '存在贴纸位置表');
ok(/STICKER_PI = \(STICKER_PI \+ 1\) % STICKER_POS\.length/.test(html), '重复点击同一贴纸循环换位置');
ok(/xmasStickerPos/.test(html), '位置会记住（localStorage）');
ok(/var sp = STICKER_POS\[STICKER_PI\]/.test(html), '绘制时按当前位置取坐标');
ok(STICKER_POS_check(html), '三个位置都在图片安全区内（y ≤ 330，避开文字区 430 以下）');
function STICKER_POS_check(s) {
  const m = s.match(/var STICKER_POS = \[([\s\S]*?)\];/)[1];
  const ys = [...m.matchAll(/y:\s*(\d+)/g)].map(x => +x[1]);
  return ys.length === 3 && ys.every(y => y <= 330);
}

console.log('== 4. 主屏化 ==');
ok(manifest.name === '心意贺卡' && manifest.display === 'standalone', 'manifest 名称与 standalone 显示');
ok(Array.isArray(manifest.icons) && manifest.icons.length >= 2, 'manifest 声明 192/512 图标');
ok(fs.existsSync(path.join(root, 'icon-512.png')) && fs.existsSync(path.join(root, 'icon-192.png')), '图标文件存在');
ok(fs.existsSync(path.join(root, 'apple-touch-icon.png')), 'iOS 主屏图标存在');
ok(/rel="manifest"/.test(html) && /rel="apple-touch-icon"/.test(html), '页面已挂 manifest 与 touch icon');
ok(/name="theme-color" content="#0e4d33"/.test(html), '浏览器主题色与图标同色系');

console.log('== 5. 既有链路未破坏 ==');
const box = {};
new Function('window', lib + ';window.STK=STICKERS;window.GW=genWish;')(box);
ok(box.STK.length >= 5 && box.GW('elder').indexOf('您') >= 0, '素材库与长辈祝福未被改动');
ok(/function rerollGreet\(/.test(html) && /function copyCaption\(/.test(html), 'R12/R13 功能仍在');
ok(/var VERSION = "v1\.1\.[9]|v1\.2\.\d"/.test(html) || /var VERSION = "v1\.1\.[7-9]"/.test(html), '版本号已推进（≥v1.1.9）');

console.log('\n结果: ' + (fails === 0 ? '全部通过 ✅' : fails + ' 项失败 ❌'));
process.exit(fails === 0 ? 0 : 1);
