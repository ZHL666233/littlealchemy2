/**
 * Little Alchemy 2 中文汉化补丁
 * 纯 DOM 方式：监听页面上的介绍文本，匹配英文原文后替换为中文
 * 不依赖任何游戏内部数据结构
 */

(async function() {
  'use strict';

  // 获取基础路径
  const scriptTag = document.querySelector('script[src*="i18n"]');
  if (!scriptTag) {
    console.warn('[汉化] 未找到自身 script 标签');
    return;
  }
  const base = scriptTag.src.replace('/zh/i18n.js', '');

  // ========== 加载数据 ==========
  let zhDescriptions, zhElements;
  try {
    const [descResp, elemResp] = await Promise.all([
      fetch(base + '/zh/descriptions.json').then(r => r.json()),
      fetch(base + '/zh/elements.json').then(r => r.json()),
    ]);
    zhDescriptions = descResp;
    zhElements = elemResp;
  } catch(e) {
    console.warn('[汉化] 加载中文数据失败:', e);
    return;
  }

  // 加载英文描述，构建英→中映射表
  let enToZh = {}; // { "英文原文": "中文译文" }
  try {
    const enResp = await fetch(base + '/descriptions.json');
    if (enResp.ok) {
      const enDescs = await enResp.json();
      for (const id in enDescs) {
        if (zhDescriptions[id]) {
          const enText = enDescs[id].trim();
          if (enText) {
            enToZh[enText] = zhDescriptions[id];
          }
        }
      }
    }
  } catch(e) {
    console.warn('[汉化] 加载英文描述失败:', e);
  }

  const mapSize = Object.keys(enToZh).length;
  if (mapSize === 0) {
    console.warn('[汉化] 描述映射表为空，无法翻译');
    return;
  }
  console.log('[汉化] 已加载', mapSize, '条描述映射');

  // ========== DOM 替换逻辑 ==========
  // 标记已处理的文本节点
  const processed = new WeakSet();
  let replaceCount = 0;

  function tryReplaceText(node) {
    if (node.nodeType !== Node.TEXT_NODE) return false;
    if (processed.has(node)) return false;
    
    const text = node.textContent.trim();
    if (!text) return false;
    
    const zhText = enToZh[text];
    if (!zhText) return false;
    
    processed.add(node);
    node.textContent = zhText;
    replaceCount++;
    return true;
  }

  // 递归处理元素及其子树
  function processElement(el) {
    if (!el || el.nodeType !== Node.ELEMENT_NODE) return;
    
    // 检查元素的 class 或 id 是否包含 description 特征
    // 但为了保险，直接处理所有文本节点
    // （性能优化：如果元素很大且没有 description，可跳过）
    
    // 检查直接文本子节点（性能最优）
    for (let i = 0; i < el.childNodes.length; i++) {
      const child = el.childNodes[i];
      if (child.nodeType === Node.TEXT_NODE) {
        if (tryReplaceText(child)) break; // 一个元素只处理一次
      }
    }
    
    // 如果有 description class，再深入子层
    if (el.className && typeof el.className === 'string' && 
        el.className.includes('description')) {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
      let node;
      while (node = walker.nextNode()) {
        if (tryReplaceText(node)) break;
      }
    }
  }

  // 扫描整个文档
  function scanAll() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while (node = walker.nextNode()) {
      tryReplaceText(node);
    }
    if (replaceCount > 0) {
      console.log('[汉化] 已替换', replaceCount, '条介绍文本');
    }
  }

  // MutationObserver
  const observer = new MutationObserver(mutations => {
    let changed = false;
    for (const mut of mutations) {
      // 新增节点
      if (mut.type === 'childList') {
        for (const node of mut.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            processElement(node);
            changed = true;
          } else if (node.nodeType === Node.TEXT_NODE) {
            if (tryReplaceText(node)) changed = true;
          }
        }
      }
      // 文本变化
      if (mut.type === 'characterData') {
        if (tryReplaceText(mut.target)) changed = true;
      }
    }
    if (changed) {
      console.log('[汉化] DOM 替换完成，累计', replaceCount, '条');
    }
  });

  // 启动观察
  function startObserver() {
    // 先扫描一遍现有内容
    scanAll();

    // 然后观察变化
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      characterDataOldValue: false
    });

    console.log('[汉化] ✅ DOM 观察器已启动');
    
    // 定期补扫（兜底）
    setInterval(() => {
      const before = replaceCount;
      scanAll();
      if (replaceCount > before) {
        console.log('[汉化] 补扫替换了', replaceCount - before, '条');
      }
    }, 3000);
  }

  // ========== 初始化 ==========
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startObserver);
  } else {
    startObserver();
  }
})();
