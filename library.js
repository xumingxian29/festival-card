/* ============================================================
   贺卡素材库 v2 · 2026-11-22（v0.9）
   模板与祝福语的唯一数据源，页面全部由此动态渲染。
   —— 模板：tpl/ 目录 750×1125 JPG
      pool: "xmas" 圣诞池 / "daily" 日常池
      prefix: 首页大标题前缀（如「冬日限定」）
      verTag: 首页小标签（如「雪花版 · 冬日限定」后半段）
      big:    成品图主标题
      r: 星级 3/4/5（抽卡稀有度）
   —— 祝福语：cat 为适用关系数组，取值 love/ friend / elder / mate，
      含 cat 表示「送给谁」过滤池；空数组 = 全部适用
   扩充方式：往下追加条目即可，页面无需改动。
   ============================================================ */

var TPL_LIBRARY = [
  /* —— 圣诞池（xmas）—— */
  { id:"snow",     name:"雪花夜",   ver:"雪花版", pool:"xmas", sc:"xmas", prefix:"冬日限定", big:"圣诞快乐", r:3, src:"tpl/snow.jpg",
    tag:"· 雪花夜 ·",  scrim:["rgba(8,16,40,.42)","rgba(8,16,40,.62)"], title:"#ffffff", sub:"#ffe3a3" },
  { id:"pink",     name:"粉紫夜",   ver:"粉霞版", pool:"xmas", sc:"xmas", prefix:"冬日限定", big:"圣诞快乐", r:3, src:"tpl/pink.jpg",
    tag:"· 粉紫夜 ·",  scrim:["rgba(60,20,80,.34)","rgba(60,20,80,.58)"], title:"#ffffff", sub:"#ffe3a3" },
  { id:"deer",     name:"小驯鹿",   ver:"麋鹿版", pool:"xmas", sc:"xmas", prefix:"冬日限定", big:"圣诞快乐", r:4, src:"tpl/deer.jpg",
    tag:"· 小驯鹿 ·",  scrim:["rgba(40,10,10,.30)","rgba(40,10,10,.60)"], title:"#ffffff", sub:"#ffe9b8" },
  { id:"tree",     name:"圣诞树下", ver:"圣树版", pool:"xmas", sc:"xmas", prefix:"冬日限定", big:"圣诞快乐", r:5, src:"tpl/tree.jpg",
    tag:"· 圣诞树下 ·", scrim:["rgba(6,26,14,.30)","rgba(6,26,14,.62)"], title:"#ffffff", sub:"#ffe3a3" },
  { id:"apple",    name:"平安果",   ver:"平安版", pool:"xmas", sc:"xmas", prefix:"冬日限定", big:"圣诞快乐", r:4, src:"tpl/apple.jpg",
    tag:"· 平安果 ·",  scrim:["rgba(50,20,5,.30)","rgba(50,20,5,.62)"], title:"#fff8ec", sub:"#ffd98a" },
  { id:"town",     name:"小镇夜",   ver:"小镇版", pool:"xmas", sc:"xmas", prefix:"冬日限定", big:"圣诞快乐", r:5, src:"tpl/town.jpg",
    tag:"· 小镇夜 ·",  scrim:["rgba(8,14,34,.34)","rgba(8,14,34,.64)"], title:"#ffffff", sub:"#ffe3a3" },

  /* —— 日常池（daily）—— */
  { id:"cake",     name:"草莓蛋糕", ver:"蛋糕版", pool:"daily", sc:"birth", prefix:"生日限定", big:"生日快乐", r:4, src:"tpl/cake.jpg",
    tag:"· 生日快乐 ·", scrim:["rgba(90,30,60,.30)","rgba(90,30,60,.62)"], title:"#ffffff", sub:"#ffe3a3" },
  { id:"lamp",     name:"深夜台灯", ver:"台灯版", pool:"daily", sc:"cheer", prefix:"冲刺限定", big:"加油必胜", r:3, src:"tpl/lamp.jpg",
    tag:"· 加油打气 ·", scrim:["rgba(10,16,40,.36)","rgba(10,16,40,.66)"], title:"#ffffff", sub:"#ffd98a" },
  { id:"heart",    name:"爱心气球", ver:"心语版", pool:"daily", sc:"love", prefix:"心动限定", big:"我喜欢你", r:5, src:"tpl/heart.jpg",
    tag:"· 心动时刻 ·", scrim:["rgba(120,40,90,.30)","rgba(120,40,90,.60)"], title:"#ffffff", sub:"#ffe0ec" },
  { id:"bear",     name:"道歉小熊", ver:"小熊版", pool:"daily", sc:"sorry", prefix:"和好限定", big:"对不起呀", r:3, src:"tpl/bear.jpg",
    tag:"· 求和好 ·",  scrim:["rgba(80,50,30,.30)","rgba(80,50,30,.62)"], title:"#fff8ec", sub:"#ffd98a" },
  { id:"firework", name:"跨年烟花", ver:"烟花版", pool:"daily", sc:"cross", prefix:"跨年限定", big:"跨年快乐", r:4, src:"tpl/firework.jpg",
    tag:"· 跨年夜 ·",  scrim:["rgba(8,12,40,.34)","rgba(8,12,40,.64)"], title:"#ffffff", sub:"#ffd166" },
  { id:"sunrise",  name:"新年日出", ver:"晨光版", pool:"daily", sc:"newyear", prefix:"新程限定", big:"新年快乐", r:3, src:"tpl/sunrise.jpg",
    tag:"· 新的开始 ·", scrim:["rgba(120,60,10,.28)","rgba(120,60,10,.60)"], title:"#ffffff", sub:"#fff3d6" }
];

var GREETING_LIBRARY = [
  /* —— 通用（全关系）—— */
  { t:"圣诞快乐，祝你来年好运 🎁", sc:"xmas", r:3, cat:[] },
  { t:"愿所有的好运，都在路上向你飞奔 🌟", sc:"gen", r:4, cat:[] },
  { t:"今年最后一个月，对你好一点 🗓️", sc:"gen", r:3, cat:[] },
  { t:"愿你被这世界温柔以待 🕯️", sc:"gen", r:4, cat:[] },
  { t:"Merry Christmas，心想事成 ✨", sc:"xmas", r:3, cat:[] },
  { t:"愿你的十二月，天天都有小确幸 🎄", sc:"xmas", r:3, cat:[] },
  { t:"灯亮着，梦就亮着，你一定能行 💪", sc:"cheer", r:3, cat:["friend","mate"] },

  /* —— 恋人 love —— */
  { t:"冬天很冷，你很暖 ☃️", sc:"gen", r:3, cat:["love"] },
  { t:"一起看初雪的人，要一起很久 🤍", sc:"xmas", r:4, cat:["love"] },
  { t:"雪落无声，思念有声，圣诞快乐 ⛄", sc:"xmas", r:5, cat:["love"] },
  { t:"铃儿响，祝福到，圣诞快乐，没完没了 🔔", sc:"xmas", r:5, cat:["love","friend"] },
  { t:"圣诞老人的礼物千千万，不如你在身边 🎁", sc:"xmas", r:4, cat:["love"] },
  { t:"你是我的圣诞限定，也是全年常驻 🎄", sc:"xmas", r:4, cat:["love"] },
  { t:"想把今晚的星星摘下来，别在你帽子上 ⭐", sc:"gen", r:4, cat:["love"] },
  { t:"有句话，借着贺卡说：我喜欢你 💗", sc:"love", r:5, cat:["love"] },
  { t:"心动预警，一直预警，从今起到永远 💘", sc:"love", r:4, cat:["love"] },
  { t:"跨年夜快乐，明年也要一起看烟花 🎆", sc:"cross", r:4, cat:["love","friend"] },

  /* —— 朋友 friend —— */
  { t:"平安夜记得吃苹果，平平安安 🍎", sc:"xmas", r:3, cat:["friend","elder"] },
  { t:"今天的雪好大，愿望要实现啦 ❄️", sc:"xmas", r:4, cat:["friend"] },
  { t:"新的一年，把烦恼都留给冬天 🎅", sc:"newyear", r:3, cat:["friend"] },
  { t:"灯火通明处，皆是归途，节日快乐 🏮", sc:"gen", r:3, cat:["friend"] },
  { t:"圣诞快乐！有我这个朋友就是中了奖 🍀", sc:"xmas", r:3, cat:["friend"] },
  { t:"雪人来敲门啦，带着一整年的好运气 ⛄", sc:"xmas", r:4, cat:["friend"] },
  { t:"又长大一岁，可爱也跟着加一分 🎂", sc:"birth", r:3, cat:["friend","love"] },
  { t:"新的一岁，暴富暴瘦暴开心 🎉", sc:"birth", r:4, cat:["friend"] },
  { t:"生日快乐，愿望全灵，蛋糕全甜 🎂", sc:"birth", r:4, cat:[] },
  { t:"对不起，是我不好，原谅我好不好 🧸", sc:"sorry", r:3, cat:[] },
  { t:"这朵小花送你，我们和好吧 🌷", sc:"sorry", r:3, cat:["friend"] },
  { t:"告别今年所有的不开心，新年万岁 🎇", sc:"newyear", r:3, cat:[] },

  /* —— 长辈 elder —— */
  { t:"祝您圣诞快乐，身体棒棒，笑口常开 🎄", sc:"xmas", r:4, cat:["elder"] },
  { t:"愿这个冬天，您平安喜乐，万事顺遂 🕯️", sc:"gen", r:4, cat:["elder"] },
  { t:"天冷记得添衣，圣诞快乐，惦记您的人 🧣", sc:"xmas", r:3, cat:["elder"] },
  { t:"岁岁常欢愉，年年皆胜意，圣诞安康 🎅", sc:"xmas", r:4, cat:["elder"] },

  /* —— 同学同事 mate —— */
  { t:"圣诞快乐，明年的 flag 一起实现 🚩", sc:"xmas", r:3, cat:["mate"] },
  { t:"愿考试全过，工作全顺，圣诞快乐 📚", sc:"xmas", r:4, cat:["mate"] },
  { t:"忙碌的十二月，也要记得吃颗糖 🍬", sc:"gen", r:3, cat:["mate"] },
  { t:"期末加油，逢考必过，稳住我们能赢 📖", sc:"cheer", r:4, cat:["mate"] },
  { t:"每一笔努力都算数，考场见真章 ✏️", sc:"cheer", r:3, cat:["mate"] },

  /* —— 新年 sunrise 场景 —— */
  { t:"新年第一天，阳光和好运都归你 🌅", sc:"newyear", r:4, cat:[] },
  { t:"新的一页翻开，写满喜欢的事 ✨", sc:"newyear", r:3, cat:[] }
];

/* ============================================================
   圣诞专场开关（2026-11-23）：true = 抽卡/图鉴/素材库只出圣诞池
   6 款 + 圣诞与通用祝福；日常池 6 款保留在数据中隐藏。
   圣诞季后改回 false 即全部恢复。
   ============================================================ */
var XMAS_ONLY = true;
if (XMAS_ONLY) {
  TPL_LIBRARY = TPL_LIBRARY.filter(function(t){ return t.pool === "xmas"; });
  GREETING_LIBRARY = GREETING_LIBRARY.filter(function(g){
    return g.sc === "xmas" || g.sc === "gen";
  });
}
