/* R10 搞怪元素回归测试：文案池合法性 + 长辈档不失礼 + 页面接线 */
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
new Function('window', lib + `
  window.JOKE = JOKE_WISH;
  window.SANTA = SANTA_SAY;
  window.JOKERL = JOKER_LINES;
  window.SEALS = SEAL_HINTS;
  window.SHARES = SHARE_TITLES;
  window.GW = genWish;
`)(box);

const JOKE = box.JOKE, SANTA = box.SANTA, GW = box.GW;
const all = [].concat(JOKE.friend, JOKE.mate, JOKE.love);

console.log('== 1. 搞怪文案池 ==');
ok(all.length >= 20, '搞怪句总量 ' + all.length + ' 条（≥20）');
ok(JOKE.all.length === JOKE.friend.length + JOKE.mate.length, 'all 档 = 朋友 + 同学（不含情话）');
ok(all.every(t => t.length <= 32), '每条 ≤32 字（最长 ' + Math.max.apply(null, all.map(t => t.length)) + ' 字）');
ok(all.every(t => /圣诞|🎄|🎁|❄|✨|⛄|🎅/.test(t)), '每条都带圣诞标记');
ok(all.every(t => !/生日快乐|对不起|新年|跨年|考试/.test(t)), '无跨主题越界（生日/道歉/新年/考试）');
ok(all.every(t => !/丑|蠢|傻|死|滚/.test(t)), '无脏话/人身攻击字眼');
ok(new Set(all).size === all.length, '无重复句');
ok(JOKE.love.length >= 5 && JOKE.mate.length >= 6 && JOKE.friend.length >= 8, '三档各不少于 5/6/8 条');

console.log('== 2. 长辈档不失礼 ==');
const elder = [];
for (let i = 0; i < 300; i++) elder.push(GW('elder'));
ok(elder.every(t => t.indexOf('您') >= 0), '长辈档 300 次全部用「您」');
ok(elder.every(t => all.indexOf(t) < 0), '长辈档 300 次从未抽到搞怪句');

console.log('== 3. 搞怪句真的会出现 ==');
const friend = [];
for (let i = 0; i < 400; i++) friend.push(GW('friend'));
const hit = friend.filter(t => all.indexOf(t) >= 0).length;
ok(hit > 0, '朋友档 400 次出现搞怪句 ' + hit + ' 次');
ok(hit < 400 * 0.55, '搞怪句未淹没正经祝福（占比 ' + Math.round(hit / 4) + '%）');

console.log('== 4. 揭晓页吐槽 ==');
[3, 4, 5].forEach(r => ok(Array.isArray(SANTA[r]) && SANTA[r].length >= 3, r + '★ 至少有 3 条圣诞老人点评'));
ok([].concat(SANTA[3], SANTA[4], SANTA[5]).every(t => t.indexOf('圣诞老人') >= 0), '点评统一以「圣诞老人：」开口');
ok(box.JOKERL.length >= 3 && box.SEALS.length >= 3 && box.SHARES.length >= 3, '整活卡/封套提示/分享文案池齐全');

console.log('== 5. 页面接线 ==');
ok(html.indexOf('g-joker') >= 0 && html.indexOf('g-santa') >= 0, '揭晓页有整活角标与吐槽位');
ok(/var joker = Math\.random\(\) < JOKER_RATE/.test(html), '整活卡按概率随机出现');
ok(/function tapCard\(/.test(html) && /function toast\(/.test(html), '卡面连点彩蛋已接线');
ok(/id="heroImg" onclick="tapCard\(\)"/.test(html), '首页卡面挂上点击彩蛋');
ok(/SEAL_HINTS\[randPick/.test(html), '封套提示已改为随机搞怪句');
ok(/SHARE_TITLES\[randPick/.test(html), '分享文案已改为随机搞怪句');
ok(html.indexOf('收下这份离谱') >= 0, '整活卡的关闭按钮换了说法');
ok(/var VERSION = "v1\.1\.2"/.test(html), '版本号 v1.1.2');

console.log('\n结果: ' + (fails === 0 ? '全部通过 ✅' : fails + ' 项失败 ❌'));
process.exit(fails === 0 ? 0 : 1);
