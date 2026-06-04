/**
 * 小炼金术2 - 百科(Encyclopedia) UI汉化脚本
 */
(function() {
  'use strict';

  const TRANS = {
    // 导航
    'home': '首页',
    'Home': '首页',
    'BACK': '返回',
    'BACK ': '返回 ',
    ' back': ' 返回',
    'close': '关闭',
    'Close': '关闭',
    
    // 标题
    'Item Details': '物品详情',
    'Item Types': '物品类型',
    'Help and FAQ': '帮助与常见问题',
    
    // 分类
    'categories': '分类',
    'Categories': '分类',
    'basic items': '基础物品',
    'basic': '基础',
    'essentials': '基础',
    'final items': '最终物品',
    'final': '最终',
    'depleted items': '已耗尽物品',
    'depleted': '已耗尽',
    'discovered items': '已发现物品',
    'discovered': '已发现',
    
    // 统计
    'items': '个物品',
    'items ': '个物品 ',
    'stats': '统计',
    'Stats': '统计',
    'more stats...': '更多统计…',
    'more stats': '更多统计',
    
    // 搜索
    'search...': '搜索…',
    'Search...': '搜索…',
    'search': '搜索',
    'No items found!': '未找到物品！',
    'No items found': '未找到物品',
    ' items found': ' 个物品找到',
    
    // 详情
    'makes': '合成出',
    'combinations': '合成配方',
    'Combinations': '合成配方',
    'description': '描述',
    'Description': '描述',
    'tags': '标签',
    'Tags': '标签',
    
    // 操作
    'add to workspace': '添加到工作区',
    'Add to workspace': '添加到工作区',
    
    // 新闻
    'news': '新闻',
    'News': '新闻',
    'more news...': '更多新闻…',
    
    // 提示/技巧
    'more tips...': '更多技巧…',
    'Did You Know?': '你知道吗？',
    'Did You Know': '你知道吗',
    
    // 排序
    'A to Z': 'A-Z',
    'A to Z ': 'A-Z ',
    'Z to A': 'Z-A',
    'Z to A ': 'Z-A ',
    'Newest to oldest': '最新到最早',
    'Newest to oldest ': '最新到最早 ',
    'Oldest to newest': '最早到最新',
    'Oldest to newest ': '最早到最新 ',
    'alphabet': '字母',
    'recent': '最近',
    'Recent': '最近',
    'asc': '升序',
    'desc': '降序',
    
    // 发现
    'Discovered': '已发现',
    'discovered': '已发现',
    'Recently Discovered': '最近发现',
    'Newly Discovered': '新发现',
    
    // 帮助文本
    'Using The Encyclopedia': '使用百科',
    'Using Hints': '使用提示',
    'Duplicating Items': '复制物品',
    'Resetting Progress': '重置进度',
    'Login And Cloud Saves': '登录与云存档',
    'Save Synchronization Errors': '存档同步错误',
    'You can bring up a details page for any item by long-pressing it.': '长按任意物品即可查看详情。',
    'You can duplicate any item on the workspace by double-tapping it.': '双击工作区中的任意物品即可复制。',
    'Some items can be mixed with another copy of itself!': '有些物品可以与自己复制品合成！',
    'If you ever get stuck try using a hint!': '如果卡住了，试试使用提示！',
    
    // 其他
    ' + ': ' + ',
  };

  function translateNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      let text = node.textContent;
      let changed = false;
      
      // 完整匹配
      if (TRANS[text] !== undefined) {
        node.textContent = TRANS[text];
        return true;
      }
      
      // 修剪匹配
      const trimmed = text.trim();
      if (TRANS[trimmed] !== undefined) {
        node.textContent = text.replace(trimmed, TRANS[trimmed]);
        return true;
      }
      
      // 子串匹配
      for (const [en, cn] of Object.entries(TRANS)) {
        if (en.length > 3 && text.includes(en)) {
          node.textContent = text.replace(new RegExp(en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), cn);
          changed = true;
        }
      }
      return changed;
      
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE') return false;
      
      ['title', 'placeholder', 'alt'].forEach(attr => {
        if (node.hasAttribute(attr)) {
          const t = node.getAttribute(attr);
          if (TRANS[t] !== undefined) {
            node.setAttribute(attr, TRANS[t]);
          }
        }
      });
      
      let changed = false;
      Array.from(node.childNodes).forEach(child => {
        if (translateNode(child)) changed = true;
      });
      return changed;
    }
    return false;
  }

  function init() {
    translateNode(document.body);
    
    const observer = new MutationObserver(mutations => {
      mutations.forEach(m => {
        m.addedNodes.forEach(n => translateNode(n));
        if (m.type === 'characterData') {
          const t = m.target.textContent;
          if (TRANS[t] !== undefined) m.target.textContent = TRANS[t];
          else {
            const trimmed = t.trim();
            if (TRANS[trimmed] !== undefined) {
              m.target.textContent = t.replace(trimmed, TRANS[trimmed]);
            }
          }
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['title', 'placeholder']
    });
    
    // 持续扫描（Vue 会多次重新渲染，用户切换页面时也会）
    let scanTimer = null;
    function scheduleScan() {
      if (scanTimer) clearTimeout(scanTimer);
      scanTimer = setTimeout(() => {
        translateNode(document.body);
        scheduleScan();  // 无限循环，始终监视
      }, 600);
    }
    setTimeout(() => { translateNode(document.body); scheduleScan(); }, 200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
