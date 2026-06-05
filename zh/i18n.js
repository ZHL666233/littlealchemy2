/**
 * Little Alchemy 2 中文汉化补丁（纯 DOM 替换版）
 * 在游戏渲染后，通过 MutationObserver 监听所有文本节点，
 * 将英文介绍文本替换为中文。
 */

(function() {
  'use strict';

  // ========== 配置 ==========
  const DEBUG = true;
  const log = (...args) => DEBUG && console.log('[汉化]', ...args);
  const warn = (...args) => console.warn('[汉化]', ...args);

  // ========== 初始化（等 DOM ready） ==========
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  function boot() {
    log('启动中...');
    // 延迟一点确保页面脚本有时间设置
    setTimeout(init, 100);
  }

  async function init() {
    // 1. 获取基础 URL
    const scriptTag = document.querySelector('script[src*="i18n"]');
    if (!scriptTag) { warn('找不到自身 script 标签'); return; }
    
    // 去掉 "/zh/i18n.js" 或 "zh/i18n.js" 后缀
    const fullSrc = scriptTag.src;
    let base;
    if (fullSrc.includes('/zh/i18n.js')) {
      base = fullSrc.replace('/zh/i18n.js', '');
    } else if (fullSrc.includes('zh/i18n.js')) {
      base = fullSrc.replace('zh/i18n.js', '');
    } else {
      base = fullSrc.substring(0, fullSrc.lastIndexOf('/'));
    }
    log('基础路径:', base);

    // 2. 加载中文描述
    let zhDescs = {};
    try {
      const url = base + '/zh/descriptions.json';
      log('加载中文描述:', url);
      const resp = await fetch(url);
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      zhDescs = await resp.json();
      log('中文描述加载完毕，共', Object.keys(zhDescs).length, '条');
    } catch(e) {
      warn('加载中文描述失败:', e);
      // 尝试备选路径
      try {
        const url2 = base + '/zh/descriptions.json?t=' + Date.now();
        const resp2 = await fetch(url2);
        if (resp2.ok) zhDescs = await resp2.json();
      } catch(e2) {
        warn('备选路径也失败');
        return;
      }
    }

    // 3. 加载英文描述
    let enDescs = {};
    try {
      const url = base + '/descriptions.json';
      log('加载英文描述:', url);
      const resp = await fetch(url);
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      enDescs = await resp.json();
      log('英文描述加载完毕，共', Object.keys(enDescs).length, '条');
    } catch(e) {
      warn('加载英文描述失败:', e);
      // 备选
      try {
        const url2 = base + '/descriptions.json?t=' + Date.now();
        const resp2 = await fetch(url2);
        if (resp2.ok) enDescs = await resp2.json();
      } catch(e2) {
        warn('备选路径也失败');
        return;
      }
    }

    // 4. 构建映射表
    // 为了容错，做多种规范化
    const enToZh = {};
    let count = 0;
    for (const id of Object.keys(enDescs)) {
      if (!zhDescs[id]) continue;
      let en = enDescs[id];
      if (typeof en !== 'string' || !en.trim()) continue;
      
      // 原始文本
      const original = en.trim();
      if (original && !enToZh[original]) {
        enToZh[original] = zhDescs[id];
        count++;
      }
      
      // 去句尾标点
      const noPunct = original.replace(/[.!?。！？…]+$/, '').trim();
      if (noPunct !== original && !enToZh[noPunct]) {
        enToZh[noPunct] = zhDescs[id];
      }
      
      // 去首句尾空格再规范化
      const normalized = original.replace(/\s+/g, ' ').trim();
      if (normalized !== original && !enToZh[normalized]) {
        enToZh[normalized] = zhDescs[id];
      }
    }
    log('映射表构建完毕：', count, '条原文 →', Object.keys(enToZh).length, '条变体');

    // 5. 辅助函数：规范化文本
    function norm(text) {
      if (typeof text !== 'string') return '';
      return text.replace(/\s+/g, ' ').trim();
    }

    // 6. 执行替换
    const replaced = new WeakSet();
    let totalReplaced = 0;

    function tryReplace(node) {
      if (!node || node.nodeType !== Node.TEXT_NODE) return false;
      if (!node.textContent) return false;
      if (replaced.has(node)) return false;
      
      const rawText = node.textContent.trim();
      if (!rawText || rawText.length < 2) return false;
      
      // 直接匹配
      let zh = enToZh[rawText];
      
      // 规范化后匹配
      if (!zh) {
        const n = norm(rawText);
        zh = enToZh[n];
      }
      
      // 去掉前后引号再匹配
      if (!zh) {
        const unquoted = rawText.replace(/^["'「『]|["'」』]$/g, '').trim();
        zh = enToZh[unquoted] || enToZh[norm(unquoted)];
      }
      
      if (!zh) return false;
      
      replaced.add(node);
      node.textContent = zh;
      totalReplaced++;
      return true;
    }

    function scanAll() {
      // 使用 TreeWalker 扫描所有文本节点
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: function(node) {
            // 跳过 script/style 内的文本
            if (node.parentElement) {
              const tag = node.parentElement.tagName;
              if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') {
                return NodeFilter.FILTER_REJECT;
              }
            }
            // 跳过空文本
            if (!node.textContent || !node.textContent.trim()) {
              return NodeFilter.FILTER_SKIP;
            }
            return NodeFilter.FILTER_ACCEPT;
          }
        },
        false
      );
      
      let node;
      while (node = walker.nextNode()) {
        tryReplace(node);
      }
    }

    // 7. 初始扫描
    setTimeout(() => {
      log('开始首次扫描...');
      scanAll();
      log('首次扫描完成，替换', totalReplaced, '条');
    }, 500);

    // 8. MutationObserver
    const observer = new MutationObserver(function(mutations) {
      for (const mut of mutations) {
        if (mut.type === 'childList') {
          for (const node of mut.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // 递归处理新增元素内的所有文本节点
              const walker = document.createTreeWalker(
                node,
                NodeFilter.SHOW_TEXT,
                {
                  acceptNode: function(n) {
                    if (!n.textContent || !n.textContent.trim()) return NodeFilter.FILTER_SKIP;
                    if (n.parentElement) {
                      const tag = n.parentElement.tagName;
                      if (tag === 'SCRIPT' || tag === 'STYLE') return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                  }
                },
                false
              );
              let n;
              while (n = walker.nextNode()) {
                tryReplace(n);
              }
            } else if (node.nodeType === Node.TEXT_NODE) {
              tryReplace(node);
            }
          }
        }
        if (mut.type === 'characterData') {
          tryReplace(mut.target);
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    log('✅ DOM 观察器已启动');

    // 9. 定期补扫（每 2 秒）
    setInterval(function() {
      const before = totalReplaced;
      scanAll();
      const diff = totalReplaced - before;
      if (diff > 0) {
        log('补扫:', diff, '条新替换，累计', totalReplaced);
      }
    }, 2000);

    // 10. 首次延迟扫描（等游戏完全加载）
    setTimeout(function() {
      scanAll();
      if (totalReplaced > 0) {
        log('延迟扫描完成，累计替换', totalReplaced, '条');
      } else {
        warn('延迟扫描未替换任何文本！可能映射表为空或游戏未加载');
        log('映射表样例:', Object.entries(enToZh).slice(0, 5));
      }
    }, 3000);
  }
})();
