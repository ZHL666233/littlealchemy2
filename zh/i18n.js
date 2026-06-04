/**
 * Little Alchemy 2 中文汉化补丁
 * 在游戏加载完成后注入中文数据（元素名称 + 介绍文本）
 */

(async function() {
  'use strict';

  // 加载中文数据
  let zhElements, zhDescriptions, zhTags;
  try {
    const base = document.querySelector('script[src*="i18n"]').src.replace('/zh/i18n.js', '');
    const [r1, r2, r3] = await Promise.all([
      fetch(base + '/zh/elements.json').then(r => r.json()),
      fetch(base + '/zh/descriptions.json').then(r => r.json()),
      fetch(base + '/zh/tags.json').then(r => r.json())
    ]);
    zhElements = r1;
    zhDescriptions = r2;
    zhTags = r3;
  } catch(e) {
    console.warn('[汉化] 加载中文数据失败:', e);
    return;
  }

  console.log('[汉化] 已加载', Object.keys(zhElements).length, '个中文元素名,', Object.keys(zhDescriptions).length, '个中文介绍');

  // 预构建描述文本映射：英文 → 中文
  // 需要加载英文描述来构建映射表
  let enDescMap = null; // { englishText: chineseText }

  (async function loadEnDescriptions() {
    try {
      // 尝试从页面中已加载的描述 chunk 获取英文描述
      // 或者从 zh/en-descriptions.json 加载（如果存在）
      const base = document.querySelector('script[src*="i18n"]').src.replace('/zh/i18n.js', '');
      const resp = await fetch(base + '/descriptions.json');
      if (resp.ok) {
        const enDescs = await resp.json();
        enDescMap = {};
        for (const id in enDescs) {
          if (zhDescriptions[id]) {
            enDescMap[enDescs[id]] = zhDescriptions[id];
          }
        }
        console.log('[汉化] 已构建', Object.keys(enDescMap).length, '条描述映射');
      }
    } catch(e) {
      // 如果加载失败则跳过 DOM 替换
      console.warn('[汉化] 未加载英文描述，DOM 替换将不可用');
    }
  })();

  // ============ 方案一：劫持 Vuex getter ============
  function hijackDescriptionGetter(store) {
    try {
      const originalGetter = store.getters.descriptionById;
      if (typeof originalGetter !== 'function') {
        console.warn('[汉化] descriptionById 不是函数');
        return false;
      }

      Object.defineProperty(store.getters, 'descriptionById', {
        get: () => (id) => {
          const zhDesc = zhDescriptions[id];
          return zhDesc || originalGetter(id);
        },
        configurable: true,
        enumerable: true
      });

      console.log('[汉化] ✅ 已替换 descriptionById getter');
      return true;
    } catch(e) {
      console.warn('[汉化] 替换 descriptionById 失败:', e);
      return false;
    }
  }

  // ============ 方案二：DOM MutationObserver ============
  function startDOMDescriptionReplacer() {
    if (!enDescMap) {
      // 如果没有英文描述映射，定期重试
      const retry = setInterval(() => {
        if (enDescMap) {
          clearInterval(retry);
          startDOMDescriptionReplacer();
        }
      }, 1000);
      return;
    }

    // 存储已经处理过的文本节点（避免重复替换）
    const processed = new WeakSet();

    function replaceDescriptionText(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent.trim();
        if (text && enDescMap[text] && !processed.has(node)) {
          processed.add(node);
          node.textContent = enDescMap[text];
        }
        return;
      }

      // 对元素节点，检查 className 是否包含 description
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.className && typeof node.className === 'string' && node.className.includes('description')) {
          // 处理这个 description 元素下的文本
          const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
          let textNode;
          while (textNode = walker.nextNode()) {
            const text = textNode.textContent.trim();
            if (text && enDescMap[text] && !processed.has(textNode)) {
              processed.add(textNode);
              textNode.textContent = enDescMap[text];
            }
          }
          return;
        }

        // 递归子元素（只检查一层避免性能问题）
        for (const child of node.children) {
          if (child.className && typeof child.className === 'string' && child.className.includes('description')) {
            const walker = document.createTreeWalker(child, NodeFilter.SHOW_TEXT, null, false);
            let textNode;
            while (textNode = walker.nextNode()) {
              const text = textNode.textContent.trim();
              if (text && enDescMap[text] && !processed.has(textNode)) {
                processed.add(textNode);
                textNode.textContent = enDescMap[text];
              }
            }
          }
        }
      }
    }

    // 初始检查：处理已经存在的 .description 元素
    document.querySelectorAll('[class*="description"]').forEach(el => replaceDescriptionText(el));

    // MutationObserver 监听新增的描述元素
    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            replaceDescriptionText(node);
          }
        }
        // 也检查被修改的文本
        if (mutation.type === 'characterData') {
          replaceDescriptionText(mutation.target);
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      characterDataOldValue: true
    });

    console.log('[汉化] ✅ DOM 替换观察器已启动');
  }

  // ============ 方案三：在 Store State 中直接替换描述表 ============
  function findAndReplaceDescriptions(store) {
    if (!store || !store.state) return false;
    
    try {
      function search(obj, depth = 0, visited = new Set()) {
        if (!obj || typeof obj !== 'object' || depth > 8 || visited.has(obj)) return null;
        visited.add(obj);
        
        if (!Array.isArray(obj)) {
          const keys = Object.keys(obj);
          if (keys.length > 100) {
            const isDescTable = keys.slice(0, 20).every(k => /^\d+$/.test(k) && typeof obj[k] === 'string');
            if (isDescTable) return obj;
          }
        }
        
        for (const knownKey of ['descriptions', 'descs', 'elementDescriptions', 'descriptionData']) {
          const child = obj[knownKey];
          if (child && typeof child === 'object') {
            const result = search(child, depth + 1, visited);
            if (result) return result;
          }
        }
        
        for (const key of Object.keys(obj)) {
          if (key === '__zhApplied' || key === '__ob__') continue;
          const child = obj[key];
          if (child && typeof child === 'object') {
            const result = search(child, depth + 1, visited);
            if (result) return result;
          }
        }
        return null;
      }

      const descObj = search(store.state);
      if (descObj && descObj !== zhDescriptions) {
        let patched = 0;
        for (const id in zhDescriptions) {
          if (descObj[id] !== zhDescriptions[id]) {
            descObj[id] = zhDescriptions[id];
            patched++;
          }
        }
        if (patched > 0) {
          console.log('[汉化] State 方案：已注入', patched, '条中文介绍');
          return true;
        }
      }
    } catch(e) {}
    return false;
  }

  // ============ 替换元素名称 ============
  function applyZhNames(elementsObj) {
    if (!elementsObj) return 0;
    let patched = 0;
    for (const id in elementsObj) {
      const elem = elementsObj[id];
      if (elem && zhElements[id] && elem.name && elem.name !== zhElements[id]) {
        elem.name = zhElements[id];
        patched++;
      }
    }
    return patched;
  }

  // ============ 主注入逻辑 ============
  function patchStore(store) {
    if (!store || !store._vm) {
      setTimeout(() => {
        const s = findStore(null);
        if (s) patchStore(s);
      }, 500);
      return;
    }

    console.log('[汉化] 已连接到 Vuex store');

    // 启动所有方案
    const hijacked = hijackDescriptionGetter(store);
    findAndReplaceDescriptions(store);
    startDOMDescriptionReplacer();

    // 拦截 store.commit
    const originalCommit = store.commit;
    store.commit = function(type, payload) {
      originalCommit.call(this, type, payload);
      if (type === 'ELEMENTS_SET' || type === 'ELEMENTS_ADD' || type === 'SET_ELEMENTS') {
        const state = this.state;
        if (state.elements && state.elements.elements) {
          const n = applyZhNames(state.elements.elements);
          if (n > 0) console.log('[汉化] 已翻译', n, '个元素名称');
        }
        findAndReplaceDescriptions(this);
      }
    };

    // 定期轮询
    function poll() {
      try {
        const state = store.state;
        if (!state) return;
        
        for (const key in state) {
          const val = state[key];
          if (val && typeof val === 'object' && val.elements && typeof val.elements === 'object') {
            const n = applyZhNames(val.elements);
            if (n > 0) console.log('[汉化] 已翻译', n, '个元素名称');
            break;
          }
        }
      } catch(e) {}
      setTimeout(poll, 3000);
    }
    setTimeout(poll, 1000);
  }

  // ============ 初始化 ============
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    let attempts = 0;
    function tryConnect() {
      attempts++;
      const vm = document.querySelector('#app');
      if (!vm) {
        if (attempts < 30) setTimeout(tryConnect, 500);
        return;
      }
      
      if (vm.__vue__) {
        const store = findStore(vm.__vue__);
        if (store) { patchStore(store); return; }
      }
      
      if (vm.__vue_app__) {
        const store = findStore({ _context: { app: vm.__vue_app__ }});
        if (store) { patchStore(store); return; }
      }
      
      if (attempts < 60) setTimeout(tryConnect, 500);
    }
    
    setTimeout(tryConnect, 1000);
  }
})();
