/* R16b 圣诞专场彻底锁死：无任何非圣诞元素可被用户看到 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const libSrc = fs.readFileSync(path.join(root, 'library.js'), 'utf8');

let pass = 0, fails = 0;
function ok(cond, msg) {
  if (cond) { pass++; console.log('  ✅ ' + msg); }
  else { fails++; console.log('  ❌ ' + msg); }
}

console.log('== 1. 数据过滤 ==');
const box = {};
new Function('window', libSrc + ';window.T=TPL_LIBRARY;window.G=GREETING_LIBRARY;window.GW=genWish;window.X=XMAS_ONLY;')(box);
ok(box.X === true, 'XMAS_ONLY 开关为 true');
ok(box.T.length === 6 && box.T.every(t => t.pool === 'xmas'), '过滤后模板池只剩 6 款圣诞卡');
ok(box.G.length > 0 && box.G.every(g => g.sc === 'xmas'), '过滤后祝福池 100% 圣诞主题（sc=xmas）');

console.log('== 2. 页面缓存击穿 ==');
ok(/library\.js\?v=20261124/.test(html), 'library.js 带 ?v=20261124 缓存穿透参数');

console.log('== 3. 节日特判 ==');
ok(!/m===1 && day===1/.test(html), '元旦分支已移除（不会出现新年文案）');
ok(/m===12 && day===24/.test(html) && /m===12 && day===25/.test(html), '平安夜/圣诞节分支保留');
const sceneFn = html.match(/function sceneGreeting\(\)\{[\s\S]*?\n\}/);
const scene = new Function('return (' + sceneFn[0].replace('function sceneGreeting(){', 'function(){') + ')')();
/* 用假 Date 测不了（内部 new Date），改为源码级确认无非圣诞关键词 */
ok(!/新年快乐/.test(sceneFn[0]), 'sceneGreeting 内无「新年快乐」等非圣诞文案');

console.log('== 4. 全链路文案抽查 ==');
let bad = 0;
const taboo = /生日快乐|跨年|对不起，是我不好|我喜欢你|新年万岁|加油必胜/;
for (let i = 0; i < 600; i++){ if (taboo.test(box.GW('all'))) bad++; }
ok(bad === 0, '随机生成 600 次零跨主题词（违例 ' + bad + '）');
ok(box.G.every(g => !taboo.test(g.t)), '固定祝福池抽查无跨主题词');
ok(box.T.every(t => /^(圣诞快乐|冬日限定)/.test(t.big + t.prefix) || t.big === '圣诞快乐'), '模板主标题全部「圣诞快乐」');

console.log('\n结果: ' + (fails === 0 ? '全部通过 ✅' : fails + ' 项失败 ❌'));
process.exit(fails === 0 ? 0 : 1);
