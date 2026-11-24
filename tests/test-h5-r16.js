/* R16 回归测试：署名系统（链接编码 / 清洗 / 落款 / 收卡页标题） */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

let pass = 0, fails = 0;
function ok(cond, msg) {
  if (cond) { pass++; console.log('  ✅ ' + msg); }
  else { fails++; console.log('  ❌ ' + msg); }
}

console.log('== 1. 页面结构 ==');
ok(/id="mysign"[\s\S]{0,120}署名（选填）/.test(html), '首页存在署名输入框（选填文案明确）');
ok(/maxlength="10"/.test(html), '署名限 10 字以内');
ok(/\.sign-c \{ margin-top:8px; \}/.test(html), '署名行样式存在');
ok(/if \(si && SIGN\) si\.value = SIGN;/.test(html), '启动时回填已存署名');

console.log('== 2. 状态与清洗 ==');
ok(/var SIGN = ""/.test(html) && /xmasSign/.test(html), 'SIGN 状态 + xmasSign 持久化');
const fnSrc = html.match(/function sanitizeSign\(\)\{[\s\S]*?\n\}|function sanitizeSign\(s\)\{[\s\S]*?\n\}/);
ok(!!fnSrc, '存在 sanitizeSign 函数');
const sanitize = new Function('return (' + fnSrc[0].replace('function sanitizeSign(s){', 'function(s){') + ')')();
ok(sanitize('小明') === '小明', '普通中文名保留');
ok(sanitize(' <"坏人"> ') === '坏人', '尖括号引号反斜杠全部剔除');
ok(sanitize('<img src=x onerror=alert(1)>').indexOf('<') < 0 && sanitize('<img src=x onerror=alert(1)>').indexOf('>') < 0, '注入片段剔除尖括号后无标签可构造');
ok(sanitize('a\nb') === 'ab', '换行剔除');
ok(sanitize('12345678901') === '1234567890', '超长截断到 10 字');
ok(sanitize('   ') === '', '纯空白清为空串');

console.log('== 3. 链接编码往返 ==');
ok(/function makeReceiveLink\(tplId, text, r, hands, sig\)/.test(html), 'makeReceiveLink 支持第 5 参署名');
ok(/if \(sig\) p\.s = sig;/.test(html), '署名只在非空时写入 payload');
const b64e = s => Buffer.from(unescape(encodeURIComponent(s)), 'binary').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64d = s => { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return decodeURIComponent(escape(Buffer.from(s, 'base64').toString('binary'))); };
const payload = JSON.parse(b64d(b64e(JSON.stringify({ t: 'snow', w: '圣诞快乐', r: 5, h: 2, s: '小明' }))));
ok(payload.s === '小明', 'payload 往返保留署名');
ok(!('s' in JSON.parse(b64d(b64e(JSON.stringify({ t: 'snow', w: 'x', r: 0, h: 0 }))))), '无署名 payload 不含 s 字段（老链接兼容）');
ok(/if \(typeof o\.s === "string"\)\{[\s\S]{0,80}sanitizeSign/.test(html), '解析收卡时对署名做同款清洗');

console.log('== 4. 落款与收卡页 ==');
ok(/SIGN \? \("来自 " \+ SIGN \+ " 的手作贺卡 · " \+ YEAR\) : \("来自一位朋友的手作贺卡 · " \+ YEAR\)/.test(html), '落款有署名显示「来自 xx」，无署名保持匿名');
ok(/✉️ ' \+ card\.s \+ ' 送了你一张贺卡/.test(html), '收卡页标题显示「✉️ xx 送了你一张贺卡」');
ok(/fromLine = '<div class="rv-sub">来自一位朋友的冬日心意<\/div>'/.test(html), '无署名时保留原匿名文案');
ok(/if \(si\) SIGN = sanitizeSign\(si\.value\);/.test(html), '生成前实时读取并清洗署名输入');
ok(/localStorage\.setItem\("xmasSign", SIGN\)/.test(html), '生成时持久化署名');
ok(/var VERSION = "v1\.1\.[8-9]|var VERSION = "v1\.2/.test(html), '版本号已推进（≥v1.1.8）');

console.log('\n结果: ' + (fails === 0 ? '全部通过 ✅' : fails + ' 项失败 ❌'));
process.exit(fails === 0 ? 0 : 1);
