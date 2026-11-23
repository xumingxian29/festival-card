/* R12 回归测试：一键配文 / 首屏折叠 / 长句自适字号 / 收卡页主行动 */
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
new Function('window', lib + ';window.CAP=CAPTIONS;window.LUCK=LUCK;')(box);
const CAP = box.CAP, LUCK = box.LUCK;

console.log('== 1. 配文池 ==');
ok(Array.isArray(CAP) && CAP.length >= 5, '配文模板 ' + CAP.length + ' 条（≥5）');
ok(CAP.every(t => t.length <= 30), '每条 ≤30 字（最长 ' + Math.max.apply(null, CAP.map(t => t.length)) + '）');
ok(CAP.every(t => /圣诞|🎄|🎁|🎴|👀/.test(t)), '每条带圣诞或卡片相关标记');
ok(CAP.every(t => !/生日快乐|对不起|新年|跨年/.test(t)), '无跨主题越界');
ok(new Set(CAP).size === CAP.length, '无重复');

console.log('== 2. 配文拼装 ==');
const src = html.match(/function buildCaption\(\)\{[\s\S]*?\n\}/);
ok(!!src, '页面内存在 buildCaption()');
const mk = (link, r) => new Function('lastLink', 'lastPullR', 'randPick', 'CAPTIONS', 'LUCK',
  'return (' + src[0] + ');')(link, r, n => 0, CAP, LUCK)();
const noLuck = mk('https://x.test/?g=abc', 0);
ok(noLuck.indexOf('https://x.test/?g=abc') >= 0, '配文包含收卡链接');
ok(noLuck.indexOf('\n') > 0, '配文是一句话 + 换行 + 链接');
const withLuck = mk('https://x.test/?g=abc', 5);
ok(withLuck.indexOf('欧皇') >= 0, '5★ 时配文带「欧皇」称号');
ok(withLuck.indexOf('https://x.test/?g=abc') >= 0, '带称号时链接仍在');

console.log('== 3. 分享按钮接线 ==');
ok(/onclick="copyCaption\(\)"/.test(html), '结果弹层有「复制配文」按钮');
ok(/function copyCaption\(/.test(html), 'copyCaption() 已实现');
ok(/STATS\.caption/.test(html), '配文复制有埋点');
ok(/document\.execCommand\("copy"\)/.test(html), '不支持 Clipboard API 时降级复制');
ok(/不知道怎么发？看这里/.test(html), '原先的「怎么发」收成小链接（腾出按钮位）');
ok(/明天首抽必出 4★\+/.test(html), '结果页带明日回访钩子');

console.log('== 4. 首屏精简 ==');
ok(/id="customBox" style="display:none"/.test(html), '自定义输入默认收起');
ok(/function toggleCustom\(/.test(html), 'toggleCustom() 已实现');
ok(/id="customToggle"/.test(html), '有展开入口');
ok(/customBox"\)/.test(html) && /\.focus\(\)/.test(html), '展开后自动聚焦输入框');

console.log('== 5. 收卡页主行动 ==');
ok(/我也抽一张，看手气/.test(html), '主按钮改成「我也抽一张，看手气」（提升裂变率）');
ok(/先保存这张/.test(html), '副按钮保留「先保存这张」');
ok(/onclick="mineOwn\(\)"[\s\S]{0,80}我也抽一张/.test(html), '主按钮直接触发抽卡');

console.log('== 6. 长句自适字号 ==');
ok(/var fsz = 34/.test(html) && /if \(lines\.length > 3\)/.test(html), '超过 3 行自动缩到 28px');
ok(/g\.font = "600 " \+ fsz \+ "px/.test(html), '绘制时使用自适应字号');
ok(/var VERSION = "v1\.1\.4"/.test(html), '版本号 v1.1.4');

console.log('\n结果: ' + (fails === 0 ? '全部通过 ✅' : fails + ' 项失败 ❌'));
process.exit(fails === 0 ? 0 : 1);
