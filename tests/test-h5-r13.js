/* R13 回归测试：接龙计数 / 只换祝福 / 动效与图片降级 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

let pass = 0, fails = 0;
function ok(cond, msg) {
  if (cond) { pass++; console.log('  ✅ ' + msg); }
  else { fails++; console.log('  ❌ ' + msg); }
}
function extract(name) {
  const i = html.indexOf('function ' + name + '(');
  if (i < 0) return '';
  let depth = 0;
  const j = html.indexOf('{', i);
  for (let k = j; k < html.length; k++) {
    if (html[k] === '{') depth++;
    else if (html[k] === '}') { depth--; if (!depth) return html.slice(i, k + 1); }
  }
  return '';
}

console.log('== 1. 接龙链接编解码 ==');
const sandbox = {};
new Function('window', `
  var location = { href: 'https://t.test/card/?a=1#old', hash: '' };
  function themeOf(id){ return { id: id }; }
  ${extract('b64e')}
  ${extract('b64d')}
  var RELAY_HANDS = 0;
  ${extract('makeReceiveLink')}
  ${extract('parseIncomingCard')}
  window.ML = makeReceiveLink; window.PI = parseIncomingCard;
  window.readH = function(link){
    location.hash = link.slice(link.indexOf('#'));
    var o = parseIncomingCard();
    return o ? o.h : null;
  };
  window.packH = function(h){
    return 'https://t.test/card/?a=1#g=' + b64e(JSON.stringify({ t:'snow', w:'圣诞快乐', r:4, h:h }));
  };
`)(sandbox);

const ML = sandbox.ML, readH = sandbox.readH, packH = sandbox.packH;
const l0 = ML('snow', '圣诞快乐', 4);
ok(l0.indexOf('#g=') > 0, '链接仍带 #g= 负载');
ok(l0.indexOf('?a=1') > 0, '保留原有 query 参数');
ok(readH(l0) === 0, '不带手数时默认第 0 手');
ok(readH(ML('snow', '圣诞快乐', 4, 3)) === 3, '显式传 3 时编码为第 3 手');
ok(readH(packH(99999)) === 0, '异常大值被夹到 0（防越界展示）');
ok(readH(packH(-5)) === 0, '负数被夹到 0');

console.log('== 2. 页面接线 ==');
ok(/var RELAY_HANDS = 0;/.test(html), '存在接龙手数全局变量');
ok(/makeReceiveLink\(tplId, text, \(tplId === TPL \? lastPullR : 0\), RELAY_HANDS\)/.test(html), '生成链接时带上手数');
ok(/RELAY_HANDS = \(card\.h \|\| 0\) \+ 1/.test(html), '拆卡后手数 +1，回赠可继续传');
ok(/接龙里的第/.test(html) && /你是第一个拆开这张卡的人/.test(html), '拆卡页展示第几手 / 首拆提示');
ok(/接龙第 ' \+ \(card\.h \+ 1\) \+ ' 张/.test(html), '揭开后仍标注接龙序号');

console.log('== 3. 只换祝福 ==');
ok(/function rerollGreet\(/.test(html), 'rerollGreet() 已实现');
ok(/🔁 换一句/.test(html), '首页有「换一句」入口');
ok(/customText = null;\s*\n\s*currentGreet = pickGreet/.test(html), '换句会清掉自定义并重新生成');
ok(!/rerollGreet[\s\S]{0,200}GK\.c\+\+/.test(html), '换句不消耗抽卡保底计数');

console.log('== 4. 降级与健壮性 ==');
ok(/prefers-reduced-motion: reduce/.test(html), '尊重系统「减少动效」设置');
ok(/onerror="this\.classList\.add\('imgfail'\)"/.test(html), '首屏图加载失败会隐藏破图');
ok(/fetchpriority="high"/.test(html), '首屏主图给了高优先级');
ok(/decoding="async"/.test(html), '主图异步解码，不阻塞渲染');
ok(/var VERSION = "v1\.1\.[6-9]"/.test(html), '版本号已推进（R14 起 ≥v1.1.6）');

console.log('== 5. 既有链路未破坏 ==');
ok(/function copyCaption\(/.test(html) && /function copyLink\(/.test(html), '分享相关函数仍在');
ok(/function drawQr\(/.test(html) && /function renderCard\(/.test(html), 'canvas 合成链路仍在');
ok(/function showSeal\(/.test(html) && /function openReceived\(/.test(html), '收卡链路仍在');

console.log('\n结果: ' + (fails === 0 ? '全部通过 ✅' : fails + ' 项失败 ❌'));
process.exit(fails === 0 ? 0 : 1);
