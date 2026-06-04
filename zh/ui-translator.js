/**
 * 小炼金术2 - UI界面汉化脚本
 * 
 * 安全方式：不修改游戏代码，通过 MutationObserver 在 DOM 渲染后替换文本
 * 这样不会破坏任何 Vue 内部逻辑、事件绑定或方法名
 */

(function() {
  'use strict';

  // ====== UI 文本翻译表 ======
  const UI_TRANSLATIONS = {
    // 通用
    'play': '开始游戏',
    'Play': '开始游戏',
    'PLAY': '开始游戏',
    
    // 工作区
    'Workspace': '工作区',
    'workspace': '工作区',
    'Clear': '清空',
    'clear': '清空',
    
    // 库/图鉴
    'Library': '图鉴',
    'library': '图鉴',
    'Search...': '搜索...',
    'Search': '搜索',
    'search': '搜索',
    
    // 元素相关
    'Elements': '元素',
    'elements': '元素',
    'Items': '物品',
    'items': '物品',
    
    // 合成
    'Mix': '合成',
    'mix': '合成',
    'Drag here': '拖到这里',
    'drag here': '拖到这里',
    'Drop here': '放到这里',
    'drop here': '放到这里',
    
    // 操作
    'Undo': '撤销',
    'undo': '撤销',
    'Redo': '重做',
    'redo': '重做',
    'Reset': '重置',
    'reset': '重置',
    'Delete': '删除',
    'delete': '删除',
    'Close': '关闭',
    'close': '关闭',
    'Cancel': '取消',
    'cancel': '取消',
    'Confirm': '确认',
    'confirm': '确认',
    'Save': '保存',
    'save': '保存',
    'Load': '加载',
    'load': '加载',
    'Yes': '是',
    'No': '否',
    'OK': '确定',
    'ok': '确定',
    'Done': '完成',
    'done': '完成',
    'Back': '返回',
    'back': '返回',
    'Next': '下一步',
    'next': '下一步',
    'Skip': '跳过',
    'skip': '跳过',
    'Retry': '重试',
    'retry': '重试',
    
    // 提示
    'Loading...': '加载中...',
    'Loading': '加载中',
    'loading': '加载中',
    'Error': '错误',
    'error': '错误',
    'Warning': '警告',
    'warning': '警告',
    'Success': '成功',
    'success': '成功',
    'Failed': '失败',
    'failed': '失败',
    
    // 排序
    'A to Z': 'A-Z',
    'A to Z ': 'A-Z ',
    'Z to A ': 'Z-A ',
    'Newest to oldest': '最新到最早',
    'Oldest to newest': '最早到最新',
    'asc': '升序',
    'desc': '降序',
    'Newest': '最新',
    'newest': '最新',
    'Oldest': '最早',
    'oldest': '最早',
    
    // 设置
    'Settings': '设置',
    'settings': '设置',
    'Sound': '音效',
    'sound': '音效',
    'Music': '音乐',
    'music': '音乐',
    'Volume': '音量',
    'volume': '音量',
    'Language': '语言',
    'language': '语言',
    
    // 账号
    'Login': '登录',
    'login': '登录',
    'Logout': '退出',
    'logout': '退出',
    'Sign in': '登录',
    'Sign up': '注册',
    'Email': '邮箱',
    'email': '邮箱',
    'Password': '密码',
    'password': '密码',
    'Profile': '个人资料',
    'profile': '个人资料',
    'Account': '账号',
    'account': '账号',
    
    // 百科相关
    'Encyclopedia': '百科',
    'encyclopedia': '百科',
    'Hint': '提示',
    'hint': '提示',
    'Hints': '提示',
    'hints': '提示',
    'How to make': '如何合成',
    'Used in': '用于合成',
    'Description': '描述',
    'description': '描述',
    'Category': '分类',
    'category': '分类',
    'Tags': '标签',
    'tags': '标签',
    'Tag': '标签',
    'tag': '标签',
    'Info': '信息',
    'info': '信息',
    
    // 游戏状态
    'New Game': '新游戏',
    'Continue': '继续',
    'continue': '继续',
    'Pause': '暂停',
    'pause': '暂停',
    'Resume': '继续',
    'resume': '继续',
    'Restart': '重新开始',
    'restart': '重新开始',
    'Level': '等级',
    'level': '等级',
    'Progress': '进度',
    'progress': '进度',
    'Score': '分数',
    'score': '分数',
    
    // 列表
    'All': '全部',
    'all': '全部',
    'None': '无',
    'none': '无',
    'Empty': '空',
    'empty': '空',
    'New': '新的',
    'new': '新的',
    
    // 常见短语
    'Drag & drop': '拖放',
    'drag and drop': '拖放',
    'Click to': '点击',
    'click to': '点击',
    'Tap to': '点击',
    'tap to': '点击',
    'Swipe': '滑动',
    'swipe': '滑动',
    'Long press': '长按',
    'long press': '长按',
    'Double tap': '双击',
    'double tap': '双击',
    
    // 元素类型
    'Base': '基础',
    'base': '基础',
    'Final': '最终',
    'final': '最终',
    'Prime': '原始',
    'prime': '原始',
    'Exhausted': '已耗尽',
    'exhausted': '已耗尽',
    'Locked': '已锁定',
    'locked': '已锁定',
    
    // 合成数量
    'items': '个物品',
    'elements': '个元素',
    ' of ': ' / ',
    'new': '新',
    
    // 其他
    'Tutorial': '教程',
    'tutorial': '教程',
    'Help': '帮助',
    'help': '帮助',
    'About': '关于',
    'about': '关于',
    'Credits': '致谢',
    'credits': '致谢',
    'Version': '版本',
    'version': '版本',
    'Feedback': '反馈',
    'feedback': '反馈',
    'Report': '报告',
    'report': '报告',
    'Share': '分享',
    'share': '分享',
    'Rate': '评分',
    'rate': '评分',
    'More': '更多',
    'more': '更多',
    'Less': '更少',
    'less': '更少',
    
    // 提示信息
    'Little Alchemy 2 Official Cheats': '小炼金术2 官方攻略',
    'Combine elements to discover new ones!': '组合元素来发现新元素！',
    'Drag elements from the library to the workspace': '从图鉴拖动元素到工作区',
    'Try mixing different elements together': '尝试将不同元素混合在一起',
    'You discovered': '你发现了',
    'New element': '新元素',
    'elements left to discover': '个元素待发现',
    'All elements discovered!': '全部元素已发现！',
    'Congratulations!': '恭喜！',
    'You found all': '你发现了全部',
  };

  // ====== 翻译单个文本节点 ======
  function translateText(text) {
    if (!text || typeof text !== 'string') return text;
    
    // 先尝试完全匹配
    if (UI_TRANSLATIONS[text] !== undefined) {
      return UI_TRANSLATIONS[text];
    }
    
    // 尝试去除首尾空格再匹配
    const trimmed = text.trim();
    if (UI_TRANSLATIONS[trimmed] !== undefined) {
      return text.replace(trimmed, UI_TRANSLATIONS[trimmed]);
    }
    
    // 包含式匹配（用于处理 "3 / 5" 之类带数字的）
    for (const [en, cn] of Object.entries(UI_TRANSLATIONS)) {
      if (en.length > 3 && text.includes(en)) {
        return text.replace(new RegExp(en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), cn);
      }
    }
    
    return text;
  }

  // ====== DOM 文本替换 ======
  function translateNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const translated = translateText(node.textContent);
      if (translated !== node.textContent) {
        node.textContent = translated;
        return true;
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // 跳过脚本和样式
      if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE') return false;
      
      // 处理 title 和 placeholder 属性
      if (node.hasAttribute('title')) {
        const t = translateText(node.getAttribute('title'));
        if (t !== node.getAttribute('title')) {
          node.setAttribute('title', t);
        }
      }
      if (node.hasAttribute('placeholder')) {
        const t = translateText(node.getAttribute('placeholder'));
        if (t !== node.getAttribute('placeholder')) {
          node.setAttribute('placeholder', t);
        }
      }
      if (node.hasAttribute('alt')) {
        const t = translateText(node.getAttribute('alt'));
        if (t !== node.getAttribute('alt')) {
          node.setAttribute('alt', t);
        }
      }
      
      // 递归处理子节点
      let changed = false;
      const childNodes = Array.from(node.childNodes);
      for (const child of childNodes) {
        if (translateNode(child)) changed = true;
      }
      return changed;
    }
    return false;
  }

  // ====== MutationObserver ======
  let observer = null;
  let timeoutId = null;

  function startTranslation() {
    // 首次翻译
    translateNode(document.body);
    
    // 监听 DOM 变化
    observer = new MutationObserver(function(mutations) {
      // 批量处理，防止频繁触发
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            translateNode(node);
          }
          // 文本变化
          if (mutation.type === 'characterData') {
            const translated = translateText(mutation.target.textContent);
            if (translated !== mutation.target.textContent) {
              mutation.target.textContent = translated;
            }
          }
        }
        timeoutId = null;
      }, 100);
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['title', 'placeholder', 'alt']
    });
    
    console.log('[汉化] UI 文本翻译已启动');
  }

  // 等待页面加载
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startTranslation);
  } else {
    startTranslation();
  }
  
  // 游戏加载完成后再次翻译（因为 Vue 会重新渲染）
  let scanTimer = null;
  function scheduleScan() {
    if (scanTimer) clearTimeout(scanTimer);
    scanTimer = setTimeout(() => {
      translateNode(document.body);
      scheduleScan();
    }, 800);
  }
  setTimeout(() => { translateNode(document.body); scheduleScan(); }, 500);
})();
