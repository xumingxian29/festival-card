/* R15 回归测试：祝福语去重壳（H5 与小程序同源逻辑） */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const lib = fs.readFileSync(path.join(root, 'library.js'), 'utf8');

let pass = 0, fails = 0;
function ok(cond, msg) {
  if (cond) { pass++; console.log('  ✅ ' + msg); }
  else { fails++; console.log('  ❌ ' + msg); }
}
const box = {};
new Function('window', lib + ';window.GW=genWish;window.GW1=genWishOnce;window.J=JOKE_WISH;')(box);

console.log('== 1. 去重壳 ==');
ok(/var _lastWish/.test(lib) && /function genWishOnce\(/.test(lib), 'genWishOnce + 去重壳结构存在');
ok(/function genWish\(cat\)\{[\s\S]*?guard/.test(lib), 'genWish 走去重循环');
let dup = 0, prev = '';
for (let i = 0; i < 400; i++){ const t = box.GW('friend'); if (t === prev) dup++; prev = t; }
ok(dup <= 3, '连抽 400 次相邻重复 ≤3 次（实测 ' + dup + '）');
let elderOk = true;
for (let i = 0; i < 100; i++) if (box.GW('elder').indexOf('您') < 0) elderOk = false;
ok(elderOk, '长辈档不受去重壳影响，仍全部用「您」');
const jokes = [].concat(box.J.friend, box.J.mate, box.J.love);
let hit = 0;
for (let i = 0; i < 400; i++){ if (jokes.indexOf(box.GW('friend')) >= 0) hit++; }
ok(hit > 0 && hit < 400 * 0.55, '搞怪句仍按约 30% 概率出现（实测 ' + Math.round(hit / 4) + '%）');

console.log('\n结果: ' + (fails === 0 ? '全部通过 ✅' : fails + ' 项失败 ❌'));
process.exit(fails === 0 ? 0 : 1);
