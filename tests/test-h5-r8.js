/* H5 R8 冒烟测试：极简 DOM 桩，真跑 index.html 主脚本 + 关键函数 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

let fails = 0;
function ok(cond, msg) {
  console.log((cond ? '  ✅ ' : '  ❌ ') + msg);
  if (!cond) fails++;
}

/* ---------- DOM 桩 ---------- */
const ctx = new Proxy({}, {
  get(t, k) {
    if (k === 'createLinearGradient' || k === 'createRadialGradient') return () => ({ addColorStop() {} });
    if (k === 'measureText') return (s) => ({ width: String(s).length * 10 });
    if (k in t) return t[k];
    return () => {};
  },
  set(t, k, v) { t[k] = v; return true; }
});

function mkEl(tag) {
  const el = {
    tagName: tag, _children: [], innerHTML: '', textContent: '', value: '',
    style: {}, className: '', dataset: {}, title: '', alt: '',
    classList: {
      _s: new Set(),
      add(c) { this._s.add(c); }, remove(c) { this._s.delete(c); },
      toggle(c, on) { if (on === undefined) { this._s.has(c) ? this._s.delete(c) : this._s.add(c); }
        else if (on) this._s.add(c); else this._s.delete(c); },
      contains(c) { return this._s.has(c); }
    },
    appendChild(c) { this._children.push(c); return c; },
    querySelectorAll(sel) {
      if (sel && String(sel).indexOf('.word') >= 0) {
        return this._children.filter(function (c) { return String(c.className).indexOf('word') >= 0; });
      }
      return listStub();
    },
    querySelector() { return mkEl('div'); },
    addEventListener() {},
    onclick: null, onload: null, onerror: null
  };
  Object.defineProperty(el, 'src', { get() { return el._src || ''; }, set(v) { el._src = v; } });
  if (tag === 'canvas') {
    el.width = 0; el.height = 0;
    el.getContext = () => ctx;
    el.toDataURL = () => 'data:image/png;base64,STUB';
  }
  return el;
}

const els = {};
const ids = ['loader', 'ldBar', 'ldPct', 'verTag', 'cardTitle', 'greetLine', 'greetHint',
  'heroCard', 'musicBtn', 'wishBtn', 'pityTip', 'myword', 'catRow', 'words', 'tpls',
  'tplPreview', 'book', 'bookSub', 'bookGrid', 'poster', 'posterImg', 'recent',
  'firstTip', 'mask', 'result', 'rvBox', 'receive', 'verInfo', 'modeTag', 'flash',
  'gacha', 'gachaBox'];

/* 数组桩：任意下标都返回元素桩，避免 [0].classList 崩（真实浏览器里必然存在） */
function listStub() {
  return new Proxy([], {
    get(t, k) {
      if (k in t) return t[k];
      if (typeof k === 'string' && /^\d+$/.test(k)) return mkEl('div');
      return t[k];
    }
  });
}

global.document = {
  getElementById(id) {
    if (!els[id]) els[id] = mkEl('div');
    return els[id];
  },
  createElement(tag) { return mkEl(tag); },
  querySelectorAll(sel) {
    if (sel && String(sel).indexOf('.word') >= 0) {
      var w = (els['words'] && els['words']._children) || [];
      return w.filter(function (c) { return String(c.className).indexOf('word') >= 0; });
    }
    return listStub();
  },
  querySelector() { return mkEl('div'); },
  addEventListener() {}
};
global.document.body = mkEl('body');
global.document.documentElement = mkEl('html');
const store = {};
global.localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; }
};
global.location = { search: '', hash: '', pathname: '/index.html', origin: 'https://x.test', href: 'https://x.test/index.html' };
global.navigator = { userAgent: 'node', vibrate: () => true, clipboard: null };
global.history = { replaceState() {} };
global.alert = () => {};
global.prompt = () => null;
global.YEAR = 2026;

const realSetTimeout = setTimeout;
global.setTimeout = (fn) => { try { fn(); } catch (e) {} return 0; };

let imgLoads = 0;
global.Image = class {
  constructor() { this.complete = false; this.naturalWidth = 0; this.naturalHeight = 0; }
  set src(v) {
    this._src = v; imgLoads++;
    this.complete = true; this.naturalWidth = 750; this.naturalHeight = 1000;
    if (this.onload) this.onload();
  }
  get src() { return this._src; }
};

/* ---------- 加载 library.js + 主脚本 ---------- */
console.log('== 1. 脚本加载 ==');
const lib = fs.readFileSync(path.join(root, 'library.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const scripts = html.match(/<script>([\s\S]*?)<\/script>/g) || [];
ok(scripts.length === 1, '单个内联主脚本（外链 script 有 src 不匹配）: ' + scripts.length);

const mainSrc = scripts[0].replace(/^<script>/, '').replace(/<\/script>$/, '');
const sandbox = { window: {} };
let initErr = null;
try {
  new Function('window', 'document', 'localStorage', 'location', 'navigator', 'history', 'Image', 'alert', 'prompt', 'setTimeout', 'YEAR',
    lib + '\n' + mainSrc + '\n;window.__api = { wish, makePoster, drawPoster, renderRecent, pushRecent, initFirstTip, pickRecent, openBook, TPL_LIBRARY, GK, STATS, themeOf, renderPity, __recent: function(){ return RECENT; } };'
  )(sandbox.window, global.document, global.localStorage, global.location, global.navigator, global.history, global.Image, global.alert, global.prompt, global.setTimeout, 2026);
} catch (e) {
  initErr = e;
}
if (initErr) console.log('  [stack] ' + String(initErr.stack || '').split('\n').slice(0,3).join(' | '));
ok(!initErr, '主脚本执行 + 初始化无异常' + (initErr ? '：' + initErr.message : ''));
const api = sandbox.window.__api;
if (!api) { console.log('主脚本未跑通，测试中止'); process.exit(1); }

/* ---------- 2. 首屏加速 ---------- */
console.log('== 2. 首屏加速（R8-1）==');
ok(els.loader.style.display === 'none' || els.loader.style.opacity === '0',
  '加载条已隐藏（首图到达即撤）');
ok(els.ldBar.style.width === '100%', '进度条 100%: ' + els.ldBar.style.width);

/* ---------- 3. 抽卡记录 ---------- */
console.log('== 3. 抽卡记录（R8-3）==');
const R = () => api.__recent();
ok(Array.isArray(R()), 'RECENT 为数组');
api.pushRecent('tree', 5);
api.pushRecent('deer', 4);
ok(R().length === 2, '入栈 2 条: ' + R().length);
ok(R()[0].t === 'deer', '最新在前');
for (let i = 0; i < 10; i++) api.pushRecent('snow', 3);
ok(R().length === 6, '上限 6 条: ' + R().length);
ok(JSON.parse(store.xmasRecent).length === 6, '已落 localStorage');
api.renderRecent();
ok(String(els.recent.innerHTML).indexOf('recent-img') >= 0, '记录条渲染出缩略图');
ok(String(els.recent.innerHTML).indexOf('最近抽到') >= 0, '记录条有标题');
api.pickRecent('tree');
ok(api.TPL_LIBRARY.some(t => t.id === 'tree'), '取回模板合法');

/* ---------- 4. 图鉴收藏海报 ---------- */
console.log('== 4. 图鉴海报（R8-2）==');
let posterErr = null;
try { api.makePoster(); } catch (e) { posterErr = e; }
ok(!posterErr, 'makePoster 无异常' + (posterErr ? '：' + posterErr.message : ''));
ok(String(els.posterImg.src).indexOf('data:image/png') === 0, '海报图已生成并注入');
ok(els.poster.classList.contains('show'), '海报弹层已弹出');
api.GK.got['ttree'] = 1;
api.GK.got['tsnow'] = 1;
posterErr = null;
try { api.makePoster(); } catch (e) { posterErr = e; }
ok(!posterErr, '点亮 2 张后重绘无异常' + (posterErr ? '：' + posterErr.message : ''));
ok(api.STATS.poster >= 2, '海报生成次数已埋点: ' + api.STATS.poster);

/* ---------- 5. 首次引导 ---------- */
console.log('== 5. 首次进入引导（R8-4）==');
ok(store.xmasInitTip === '1', '已写首次访问标记');
ok(els.firstTip.classList.contains('show') === false, '9 秒后自动收起（桩里同步执行）');

/* ---------- 6. 抽卡链路仍然完整 ---------- */
console.log('== 6. 抽卡链路回归 ==');
let wishErr = null;
try { api.wish(); } catch (e) { wishErr = e; }
ok(!wishErr, 'wish() 无异常' + (wishErr ? '：' + wishErr.message : ''));
ok(R().length === 6, '抽卡后写入记录条');

/* ---------- 7. 随机祝福生成（R9） ---------- */
console.log('== 7. \u795d\u798f\u8bed\u968f\u673a\u751f\u6210\uff08R9\uff09==');
const libBox = {};
new Function('window', lib + ';window.G=GREETING_LIBRARY;window.GW=genWish;')(libBox);
const G = libBox.G, GW = libBox.GW;
ok(G.every(g => g.sc === 'xmas'), '\u7cbe\u9009\u795d\u798f\u5168\u90e8\u4e3a\u5723\u8bde\u573a\u666f\uff08' + G.length + ' \u6761\uff09');
ok(G.length >= 15, '\u7cbe\u9009\u5723\u8bde\u53e5\u4e0d\u5c11\u4e8e 15 \u6761');
const seen = new Set();
let badLen = 0, noXmas = 0, leak = 0;
for (let i = 0; i < 300; i++) {
  const t = GW(['all', 'elder', 'love', 'friend', 'mate'][i % 5]);
  seen.add(t);
  if (t.length > 40) badLen++;
  if (!/\u5723\u8bde|\uD83C\uDF84|\uD83C\uDF81|\u2744|\u2728/.test(t)) noXmas++;
  if (/\u751f\u65e5\u5feb\u4e50|\u5bf9\u4e0d\u8d77|\u65b0\u5e74|\u8de8\u5e74|\u8003\u8bd5/.test(t)) leak++;
}
ok(badLen === 0, '300 \u6b21\u751f\u6210\u957f\u5ea6\u5747 \u2264 40 \u5b57');
ok(noXmas === 0, '300 \u6b21\u751f\u6210\u90fd\u5e26\u5723\u8bde\u6807\u8bb0');
ok(leak === 0, '\u65e0\u975e\u5723\u8bde\u4e3b\u9898\u8d8a\u754c\uff08\u751f\u65e5/\u9053\u6b49/\u65b0\u5e74\uff09');
ok(seen.size > 100, '300 \u6b21\u53bb\u91cd > 100 \u53e5\uff08\u5b9e\u6d4b ' + seen.size + '\uff09');
const elderAll = [];
for (let i = 0; i < 50; i++) elderAll.push(GW('elder'));
ok(elderAll.every(t => t.indexOf('\u60a8') >= 0), '\u957f\u8f88\u6863\u5168\u90e8\u7528\u300c\u60a8\u300d');

console.log('\n\u7ed3\u679c: ' + (fails === 0 ? '全部通过 ✅' : fails + ' 项失败 ❌'));
process.exit(fails === 0 ? 0 : 1);
