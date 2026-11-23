/* R11 回归测试：手气称号 + 卡面贴纸 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const lib = fs.readFileSync(path.join(root, 'library.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

let pass = 0, fails = 0;
function ok(cond, msg) {
  if (cond) { pass++; console.log('  ✅ ' + msg); }
  else { fails++; console.log('  ❌ ' + msg); }
}

const box = {};
new Function('window', lib + ';window.LUCK=LUCK;window.STK=STICKERS;window.JOKE=JOKE_WISH;window.GW=genWish;')(box);
const LUCK = box.LUCK, STK = box.STK;

console.log('== 1. 手气称号 ==');
ok([3, 4, 5].every(r => LUCK[r] && LUCK[r].name && LUCK[r].emo && LUCK[r].tip), '3/4/5 档称号齐全');
ok(LUCK[3].name === '非酋' && LUCK[4].name === '小欧' && LUCK[5].name === '欧皇', '称号为 非酋 / 小欧 / 欧皇');
ok(new Set([LUCK[3].name, LUCK[4].name, LUCK[5].name]).size === 3, '三个称号互不重复');

console.log('== 2. 贴纸清单 ==');
ok(Array.isArray(STK) && STK.length >= 5, '贴纸 ' + STK.length + ' 款（≥5）');
ok(STK[0].id === '', '第一项是「不贴」（可撤回）');
ok(STK.every(s => typeof s.name === 'string' && s.name.length > 0), '每款都有中文名（用于 title 提示）');
ok(new Set(STK.map(s => s.id)).size === STK.length, '贴纸 id 无重复');
ok(STK.slice(1).every(s => /\p{Emoji}/u.test(s.id)), '非空贴纸都是 emoji');

console.log('== 3. 页面接线 ==');
ok(html.indexOf('id="stickRow"') >= 0, '首页有贴纸选择行');
ok(/function renderStickers\(/.test(html) && /function setSticker\(/.test(html), '渲染与切换函数存在');
ok(/xmasSticker/.test(html), '贴纸选择会记住（localStorage）');
ok(/if \(STICKER\)\{/.test(html), '生成图片时会绘制贴纸');
ok(/function luckHTML\(/.test(html), '揭晓页有手气称号函数');
ok(/luckHTML\(p\.r\)/.test(html), '揭晓页插入了称号行');
ok(/三连非酋/.test(html), '连续 3★ 有安慰提示');
ok(/lk\.emo \+ lk\.name \+ ' 手气的卡/.test(html), '收卡页展示对方手气称号');
ok(/我抽到 ".{0,4}\+ LUCK\[lastPullR\]\.name/.test(html) || /LUCK\[lastPullR\]\.emo/.test(html), '分享文案带上手气称号');
ok(/renderStickers\(\);/.test(html), '初始化时渲染贴纸行');
ok(/var VERSION = "v1\.1\.[4-9]"/.test(html), '版本号已推进（R12 起 ≥v1.1.4）');

console.log('== 4. 不破坏既有功能 ==');
ok(box.GW('elder').indexOf('您') >= 0, '长辈祝福仍用「您」');
ok(/JOKE_WISH/.test(lib) && /SANTA_SAY/.test(lib), 'R10 搞怪池仍在');
ok(/function genWish/.test(lib) && /function drawQr/.test(html), '抽卡与二维码链路未被改动');

console.log('\n结果: ' + (fails === 0 ? '全部通过 ✅' : fails + ' 项失败 ❌'));
process.exit(fails === 0 ? 0 : 1);
