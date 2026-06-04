/**
 * Little Alchemy 2 中文汉化补丁
 * 在游戏加载完成后注入中文数据
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

  console.log('[汉化] 已加载', Object.keys(zhElements).length, '个中文元素名');

  // 等待 Vue 应用初始化
  function waitForVue() {
    return new Promise(resolve => {
      function check() {
        const appEl = document.getElementById('app');
        if (appEl && appEl.__vue__) {
          resolve(appEl.__vue__);
          return;
        }
        // 监控 Vuex store
        if (window.__vue_app__) {
          resolve(window.__vue_app__);
          return;
        }
        setTimeout(check, 200);
      }
      check();
    });
  }

  // 查找 Vuex store
  function findStore(vm) {
    if (vm.$store) return vm.$store;
    if (vm._context && vm._context.app && vm._context.app.$store) return vm._context.app.$store;
    
    // 尝试从 Vue 实例树找起
    let el = document.querySelector('#app');
    if (!el) return null;
    
    // Vue 3
    const vueApp = el.__vue_app__;
    if (vueApp && vueApp.config && vueApp.config.globalProperties.$store) {
      return vueApp.config.globalProperties.$store;
    }
    
    return null;
  }

  // 在 Vuex store 上设置 watcher 拦截元素数据
  function patchStore(store) {
    if (!store || !store._vm) {
      setTimeout(() => patchStore(findStore(null)), 500);
      return;
    }

    console.log('[汉化] 已连接到 Vuex store');

    // 监听 state 变化 - 拦截元素数据
    const originalCommit = store.commit;
    store.commit = function(type, payload) {
      if (type === 'ELEMENTS_SET' || type === 'ELEMENTS_ADD' || type === 'SET_ELEMENTS') {
        // 元素数据刚被设置，应用中文翻译
        const state = store.state;
        if (state.elements && state.elements.elements) {
          applyZhToElements(state.elements.elements);
        }
        // 也可能在 getters 里
      }
      return originalCommit.call(this, type, payload);
    };

    // 更可靠的方法：拦截 getter
    // 在 Vue 组件渲染前替换名称
    const origGetters = store.getters;
    
    // 定期检查并应用
    function applyAll() {
      try {
        // 尝试从 store state 中找到元素数据
        const state = store.state;
        
        // 不同版本的 store 结构不同
        let elementsData = null;
        
        // 直接查找所有可能的路径
        for (const key in state) {
          if (state[key] && typeof state[key] === 'object') {
            if (state[key].elements && typeof state[key].elements === 'object') {
              elementsData = state[key].elements;
              break;
            }
            if (state[key].elementsList) {
              // 可能是模块封装
              for (const subKey in state[key]) {
                if (typeof state[key][subKey] === 'object' && state[key][subKey] !== null) {
                  // 检查是否有元素的 id/name 属性
                  const val = state[key][subKey];
                  if (val.id && val.name) {
                    elementsData = state[key];
                    break;
                  }
                }
              }
            }
          }
        }

        if (elementsData) {
          applyZhToElements(elementsData);
        }
      } catch(e) {
        // 静默失败
      }
      
      setTimeout(applyAll, 1000);
    }

    setTimeout(applyAll, 500);
  }

  // 应用中文名称到元素对象
  function applyZhToElements(elementsObj) {
    if (!elementsObj || elementsObj.__zhApplied) return;
    
    let patched = 0;
    for (const id in elementsObj) {
      const elem = elementsObj[id];
      if (elem && zhElements[id]) {
        if (elem.name !== zhElements[id]) {
          elem.name = zhElements[id];
          patched++;
        }
      }
    }
    
    if (patched > 0) {
      elementsObj.__zhApplied = true;
      console.log('[汉化] 已翻译', patched, '个元素名称');
    }
  }

  // 等待 DOM 加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    // 游戏加载需要时间，持续尝试连接 store
    let attempts = 0;
    function tryConnect() {
      attempts++;
      const vm = document.querySelector('#app');
      if (!vm) {
        if (attempts < 30) setTimeout(tryConnect, 500);
        return;
      }
      
      // Vue 2: 通过 __vue__
      if (vm.__vue__) {
        const store = findStore(vm.__vue__);
        if (store) { patchStore(store); return; }
      }
      
      // Vue 3
      if (vm.__vue_app__) {
        const store = findStore({ _context: { app: vm.__vue_app__ }});
        if (store) { patchStore(store); return; }
      }
      
      if (attempts < 60) setTimeout(tryConnect, 500);
    }
    
    setTimeout(tryConnect, 1000);
  }
})();
