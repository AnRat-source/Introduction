// small niceties
  const conciseWindowNames = {
    'About Me': 'about',
    'Game Developer': 'dev',
    'Full Stack Developer & Graphics Designer': 'fullstack',
    'Terminal Session': 'terminal',
    'Music Player': 'music',
    'Project Sekai': 'pjsk'
  };

  function addWindowChrome(windowElement, title) {
    const shortName = conciseWindowNames[title] || title.toLowerCase().replace(/\s+/g, '-');
    const chrome = document.createElement('div');
    chrome.className = 'window-chrome';
    chrome.innerHTML = `<span>${shortName}.window</span><span class="window-controls"><i aria-hidden="true">−</i><i aria-hidden="true">□</i><button class="window-close" type="button" aria-label="Close ${title}">×</button></span>`;
    windowElement.prepend(chrome);
  }

  document.querySelectorAll('.card').forEach((card, number) => {
    const title = card.querySelector('.title')?.textContent.trim() || `window-${number + 1}`;
    addWindowChrome(card, title);
  });
  document.querySelectorAll('.music-card').forEach(card => {
    addWindowChrome(card, 'Music Player');
  });

  function makeWindowDraggable(windowElement, handle, canDrag = () => true) {
    let drag = null;
    handle.addEventListener('pointerdown', event => {
      if (event.button !== 0 || mobileLayoutQuery?.matches || !canDrag()) return;
      if (event.target.closest('button, input, textarea, select, a, .window-controls')) return;

      const bounds = windowElement.getBoundingClientRect();
      drag = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        baseX: Number(windowElement.dataset.dragX || 0),
        baseY: Number(windowElement.dataset.dragY || 0),
        bounds
      };
      windowElement.classList.add('is-dragging');
      handle.setPointerCapture(event.pointerId);
      event.preventDefault();
    });

    handle.addEventListener('pointermove', event => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      const minX = 12 - drag.bounds.left;
      const maxX = window.innerWidth - 12 - drag.bounds.right;
      const minY = 12 - drag.bounds.top;
      const maxY = window.innerHeight - 12 - drag.bounds.bottom;
      const x = Math.min(maxX, Math.max(minX, drag.baseX + event.clientX - drag.startX));
      const y = Math.min(maxY, Math.max(minY, drag.baseY + event.clientY - drag.startY));
      windowElement.dataset.dragX = String(x);
      windowElement.dataset.dragY = String(y);
      windowElement.style.setProperty('--window-drag-x', `${x}px`);
      windowElement.style.setProperty('--window-drag-y', `${y}px`);
    });

    const finishDrag = event => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
      drag = null;
      windowElement.classList.remove('is-dragging');
    };
    handle.addEventListener('pointerup', finishDrag);
    handle.addEventListener('pointercancel', finishDrag);
  }

  document.querySelectorAll('.card, .music-card').forEach(windowElement => {
    makeWindowDraggable(windowElement, windowElement.querySelector('.window-chrome'));
  });

  // Keep a stable return point for the terminal. When the explorer is open the
  // terminal is placed at the document root, so its fixed coordinates are
  // always relative to the viewport rather than the page's content wrapper.
  const terminalWindow = document.getElementById('terminalWindow');
  const commandLine = document.querySelector('.command-line');
  const terminalHome = document.createComment('terminal-window-home');
  terminalWindow.before(terminalHome);

  function dockTerminalForExplorer(isOpen) {
    if (isOpen) {
      if (terminalWindow.parentElement !== document.body) document.body.append(terminalWindow);
      return;
    }

    if (terminalWindow.previousSibling !== terminalHome) terminalHome.after(terminalWindow);
  }

  function animateExplorerConsole() {
    [terminalWindow, commandLine].forEach(element => {
      element.classList.remove('console-dock-enter');
      void element.offsetWidth;
      element.classList.add('console-dock-enter');
    });
  }

  const siteHeader = document.querySelector('header');
  const headerSpacer = document.createElement('div');
  headerSpacer.className = 'header-spacer';
  headerSpacer.setAttribute('aria-hidden', 'true');
  siteHeader.before(headerSpacer);
  let headerStart = siteHeader.getBoundingClientRect().top + window.scrollY;
  const mobileLayoutQuery = window.matchMedia('(max-width: 620px)');

  function syncFloatingHeader() {
    const floating = siteHeader.classList.contains('is-floating');
    if (mobileLayoutQuery.matches) {
      if (floating) siteHeader.classList.remove('is-floating');
      headerSpacer.style.height = '0';
      headerStart = siteHeader.getBoundingClientRect().top + window.scrollY;
      return;
    } else {
      if (!floating) headerStart = siteHeader.getBoundingClientRect().top + window.scrollY;
      const shouldFloat = window.scrollY > headerStart - 12;

      if (shouldFloat && !floating) {
        headerSpacer.style.height = `${siteHeader.offsetHeight + 22}px`;
        siteHeader.classList.add('is-floating');
      } else if (!shouldFloat && floating) {
        siteHeader.classList.remove('is-floating');
        headerSpacer.style.height = '0';
        headerStart = siteHeader.getBoundingClientRect().top + window.scrollY;
      }
    }

    const wrapRect = siteHeader.parentElement.getBoundingClientRect();
    document.documentElement.style.setProperty('--site-window-left', `${wrapRect.left}px`);
    document.documentElement.style.setProperty('--site-window-width', `${wrapRect.width}px`);
    if (siteHeader.classList.contains('is-floating')) {
      siteHeader.style.setProperty('--floating-header-left', `${wrapRect.left}px`);
      siteHeader.style.setProperty('--floating-header-width', `${wrapRect.width}px`);
    }
  }

  const fileExplorer = document.getElementById('fileExplorer');
  const fileExplorerToggle = document.getElementById('fileExplorerToggle');
  const fileExplorerClose = document.getElementById('fileExplorerClose');
  const fileExplorerScrim = document.getElementById('fileExplorerScrim');
  const fileExplorerStatus = document.getElementById('fileExplorerStatus');
  const fileExplorerTree = document.getElementById('fileExplorerTree');
  const explorerPreview = document.getElementById('explorerPreview');
  const explorerPreviewTitle = document.getElementById('explorerPreviewTitle');
  const explorerPreviewFrame = document.getElementById('explorerPreviewFrame');
  const explorerPreviewClose = document.getElementById('explorerPreviewClose');
  const explorerPreviewUrlForm = document.getElementById('explorerPreviewUrlForm');
  const explorerPreviewUrl = document.getElementById('explorerPreviewUrl');
  const explorerPreviewMinimize = document.getElementById('explorerPreviewMinimize');
  const explorerPreviewRefresh = document.getElementById('explorerPreviewRefresh');
  const explorerPreviewFullscreen = document.getElementById('explorerPreviewFullscreen');
  const explorerPreviewFavicon = document.getElementById('explorerPreviewFavicon');
  const explorerPreviewFaviconButton = document.getElementById('explorerPreviewFaviconButton');
  const explorerTabDock = document.getElementById('explorerTabDock');
  const explorerTabStorageKey = 'anrat-explorer-tabs';
  let explorerTabs = [];
  let activeExplorerTabId = null;
  let explorerTreeId = 0;
  let explorerScrimHideTimer = null;

  makeWindowDraggable(fileExplorer, fileExplorer.querySelector('.explorer-titlebar'), () => fileExplorer.classList.contains('is-open'));
  makeWindowDraggable(explorerPreview, explorerPreview.querySelector('.explorer-preview-titlebar'), () => (
    !explorerPreview.hidden &&
    !explorerPreview.classList.contains('is-minimized') &&
    !isPreviewFullscreenLayout()
  ));

  try {
    const savedTabs = JSON.parse(localStorage.getItem(explorerTabStorageKey) || '[]');
    if (Array.isArray(savedTabs)) {
      explorerTabs = savedTabs
        .filter(tab => tab && typeof tab.id === 'string' && typeof tab.source === 'string' && typeof tab.title === 'string' && typeof tab.favicon === 'string')
        .map(tab => ({ ...tab, urlEditable: tab.urlEditable !== false }));
    }
  } catch {
    explorerTabs = [];
  }

  function positionFileExplorer() {
    const headerRect = siteHeader.getBoundingClientRect();
    const defaultTop = 14;
    const explorerLeft = 14;
    const explorerRight = explorerLeft + Math.min(320, window.innerWidth - 28);
    const overlapsExplorer =
      headerRect.left < explorerRight &&
      headerRect.right > explorerLeft &&
      headerRect.top < window.innerHeight - 14 &&
      headerRect.bottom > defaultTop;
    const explorerTop = overlapsExplorer
      ? Math.max(defaultTop, Math.min(headerRect.bottom + 8, window.innerHeight - 96))
      : defaultTop;
    fileExplorer.style.setProperty('--explorer-top', `${explorerTop}px`);
  }

  function positionExplorerPreview() {
    if (explorerPreview.hidden || explorerPreview.classList.contains('is-minimized') || explorerPreview.classList.contains('is-url-fullscreen') || document.fullscreenElement === explorerPreview) return;
    const headerRect = siteHeader.getBoundingClientRect();
    const previewTop = Math.max(14, headerRect.bottom + 14);
    const terminalTop = window.innerHeight - 96 - terminalWindow.offsetHeight;
    const previewBottom = Math.max(96, window.innerHeight - terminalTop + 14);
    explorerPreview.style.setProperty('--explorer-preview-top', `${previewTop}px`);
    explorerPreview.style.setProperty('--explorer-preview-bottom', `${previewBottom}px`);
  }

  function closeExplorerPreview() {
    if (document.fullscreenElement === explorerPreview) document.exitFullscreen();
    explorerPreviewFrame.src = 'about:blank';
    explorerPreview.classList.remove('is-minimized', 'is-url-fullscreen');
    updatePreviewFullscreenState();
    explorerPreview.hidden = true;
    explorerTabs = explorerTabs.filter(tab => tab.id !== activeExplorerTabId);
    activeExplorerTabId = null;
    saveExplorerTabs();
    renderExplorerTabDock();
    syncPreviewAddress();
  }

  function getPreviewFavicon(source) {
    try {
      const previewUrl = new URL(source, window.location.origin);
      return previewUrl.origin === window.location.origin
        ? new URL('favicon.ico', window.location.origin).href
        : `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(previewUrl.origin)}`;
    } catch {
      return 'favicon.ico';
    }
  }

  function saveExplorerTabs() {
    localStorage.setItem(explorerTabStorageKey, JSON.stringify(explorerTabs));
  }

  function renderExplorerTabDock() {
    explorerTabDock.replaceChildren();
    explorerTabs.filter(tab => tab.id !== activeExplorerTabId).forEach(tab => {
      const tabButton = document.createElement('button');
      tabButton.className = 'explorer-tab-icon';
      tabButton.type = 'button';
      tabButton.title = tab.title;
      tabButton.style.cssText = 'position:relative;display:grid;width:48px;height:48px;place-items:center;padding:0;overflow:visible;';
      tabButton.innerHTML = `<img width="23" height="23" alt=""><span class="explorer-tab-tooltip"></span><span class="explorer-tab-close" aria-hidden="true">×</span>`;
      const tabFavicon = tabButton.querySelector('img');
      tabFavicon.style.cssText = 'display:block;width:23px;height:23px;min-width:23px;min-height:23px;max-width:23px;max-height:23px;object-fit:contain;object-position:center;';
      tabFavicon.addEventListener('error', () => { tabFavicon.src = 'favicon.ico'; }, { once: true });
      tabFavicon.src = tab.favicon;
      tabButton.querySelector('.explorer-tab-tooltip').textContent = tab.title;
      tabButton.addEventListener('click', event => {
        if (event.target.closest('.explorer-tab-close')) {
          event.stopPropagation();
          explorerTabs = explorerTabs.filter(savedTab => savedTab.id !== tab.id);
          saveExplorerTabs();
          renderExplorerTabDock();
          return;
        }
        setFileExplorerOpen(true);
        openExplorerPreview(tab.source, tab.title, tab.id);
      });
      explorerTabDock.append(tabButton);
    });
  }

  function setPreviewTitle(title) {
    explorerPreviewTitle.textContent = title;
    explorerPreview.dataset.previewTitle = title;
    explorerPreview.title = title;
    const activeTab = explorerTabs.find(tab => tab.id === activeExplorerTabId);
    if (activeTab) {
      activeTab.title = title;
      saveExplorerTabs();
      renderExplorerTabDock();
    }
  }

  function setPreviewFavicon(source, customFavicon = '') {
    const favicon = customFavicon || getPreviewFavicon(source);
    explorerPreviewFavicon.src = favicon;
    const activeTab = explorerTabs.find(tab => tab.id === activeExplorerTabId);
    if (activeTab) {
      activeTab.favicon = favicon;
      saveExplorerTabs();
      renderExplorerTabDock();
    }
  }

  function setPreviewMinimized(isMinimized) {
    if (isMinimized && document.fullscreenElement === explorerPreview) document.exitFullscreen();
    if (isMinimized) explorerPreview.classList.remove('is-url-fullscreen');
    explorerPreview.classList.toggle('is-minimized', isMinimized);
    updatePreviewFullscreenState();
    explorerPreviewMinimize.setAttribute('aria-label', isMinimized ? 'Restore site preview' : 'Minimize site preview');
    explorerPreviewMinimize.textContent = isMinimized ? '□' : '−';
    if (!isMinimized) requestAnimationFrame(positionExplorerPreview);
    renderExplorerTabDock();
    syncPreviewAddress();
  }

  function setPreviewUrlEditing(isEnabled) {
    explorerPreview.classList.toggle('url-edit-disabled', !isEnabled);
    explorerPreviewUrlForm.hidden = !isEnabled;
  }

  function normalizeKnownLink(value) {
    try {
      const url = new URL(value, window.location.origin);
      if (url.hostname.toLowerCase() === 'store.anrat.link' && /^\/portfolio\/?$/i.test(url.pathname)) {
        url.hostname = 'portfolio.anrat.link';
        url.pathname = '/';
      }
      return url.href;
    } catch {
      return value;
    }
  }

  function normalizePreviewUrl(value) {
    const rawUrl = value.trim();
    if (!rawUrl) return null;
    try {
      const isLocalPath = /^(?:\.?\.?\/|\/|FileExplorer\/)/.test(rawUrl);
      const candidate = /^[a-z][a-z\d+.-]*:/i.test(rawUrl)
        ? rawUrl
        : isLocalPath ? new URL(rawUrl, window.location.origin).href : `https://${rawUrl}`;
      const url = new URL(candidate, window.location.origin);
      return /^(https?:)$/i.test(url.protocol) ? normalizeKnownLink(url.href) : null;
    } catch {
      return null;
    }
  }

  function isPreviewFullscreenLayout() {
    return document.fullscreenElement === explorerPreview || explorerPreview.classList.contains('is-url-fullscreen');
  }

  function updatePreviewFullscreenState() {
    // URL-driven fullscreen cannot use the browser's fullscreen layer, so hide
    // the rest of the site's floating UI while the preview owns the viewport.
    document.body.classList.toggle('preview-fullscreen', isPreviewFullscreenLayout());
  }

  function syncPreviewAddress() {
    const pageUrl = new URL(window.location.origin);
    const activeTab = explorerTabs.find(tab => tab.id === activeExplorerTabId);
    if (activeTab && !explorerPreview.hidden && !explorerPreview.classList.contains('is-minimized')) {
      pageUrl.searchParams.set('site', activeTab.source);
      pageUrl.searchParams.set('fullscreen', String(isPreviewFullscreenLayout()));
    } else {
      pageUrl.searchParams.delete('site');
      pageUrl.searchParams.delete('fullscreen');
    }
    history.replaceState(null, '', pageUrl);
  }

  function openExplorerPreview(source, title, tabId = null, options = {}) {
    let tab = tabId
      ? explorerTabs.find(savedTab => savedTab.id === tabId)
      : explorerTabs.find(savedTab => new URL(savedTab.source, window.location.origin).href === new URL(source, window.location.origin).href);
    const urlEditable = options.urlEditable ?? tab?.urlEditable ?? true;
    const customFavicon = options.favicon ?? tab?.customFavicon ?? '';
    if (!tab) {
      tab = {
        id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
        source,
        title,
        favicon: customFavicon || getPreviewFavicon(source),
        customFavicon,
        urlEditable
      };
      explorerTabs.push(tab);
    } else {
      tab.source = source;
      tab.title = title;
      tab.urlEditable = urlEditable;
      tab.customFavicon = customFavicon;
    }
    activeExplorerTabId = tab.id;
    saveExplorerTabs();
    setPreviewMinimized(false);
    setPreviewTitle(title);
    setPreviewUrlEditing(urlEditable);
    explorerPreviewUrl.value = normalizePreviewUrl(source);
    setPreviewFavicon(source, customFavicon);
    explorerPreviewFrame.src = source;
    explorerPreview.hidden = false;
    renderExplorerTabDock();
    syncPreviewAddress();
    requestAnimationFrame(positionExplorerPreview);
  }

  function setFileExplorerOpen(isOpen) {
    if (mobileLayoutQuery.matches) isOpen = false;
    if (isOpen) positionFileExplorer();
    dockTerminalForExplorer(isOpen);
    document.body.classList.toggle('explorer-open', isOpen);
    document.documentElement.classList.toggle('explorer-open', isOpen);
    fileExplorer.classList.toggle('is-open', isOpen);
    fileExplorer.setAttribute('aria-hidden', String(!isOpen));
    fileExplorerToggle.setAttribute('aria-expanded', String(isOpen));
    clearTimeout(explorerScrimHideTimer);
    if (isOpen) {
      fileExplorerScrim.hidden = false;
      requestAnimationFrame(() => fileExplorerScrim.classList.add('is-active'));
    } else {
      fileExplorerScrim.classList.remove('is-active');
      explorerScrimHideTimer = setTimeout(() => { fileExplorerScrim.hidden = true; }, 260);
    }
    if (isOpen) {
      requestAnimationFrame(() => {
        animateExplorerConsole();
        positionExplorerPreview();
      });
    } else {
      [terminalWindow, commandLine].forEach(element => element.classList.remove('console-dock-enter'));
      if (!explorerPreview.hidden) setPreviewMinimized(true);
    }
  }

  // Pages outside the main profile can use the established explorer preview
  // without duplicating its tab, URL, and window-management behavior.
  document.addEventListener('explorer:open-preview', event => {
    const { source, title, options } = event.detail || {};
    if (typeof source !== 'string' || !source) return;
    setFileExplorerOpen(true);
    openExplorerPreview(source, typeof title === 'string' && title ? title : 'File Preview', null, options || {});
  });

  fileExplorerToggle.addEventListener('click', () => setFileExplorerOpen(!fileExplorer.classList.contains('is-open')));
  fileExplorerClose.addEventListener('click', () => setFileExplorerOpen(false));
  fileExplorerScrim.addEventListener('click', () => setFileExplorerOpen(false));
  document.getElementById('blogButton')?.addEventListener('click', event => {
    const destination = event.currentTarget.href;
    event.preventDefault();
    document.body.classList.add('page-transitioning');
    window.setTimeout(() => { window.location.href = destination; }, 300);
  });
  window.addEventListener('pageshow', () => document.body.classList.remove('page-transitioning'));
  document.addEventListener('pointerdown', event => {
    if (!fileExplorer.classList.contains('is-open')) return;
    if (fileExplorer.contains(event.target) || explorerPreview.contains(event.target) || terminalWindow.contains(event.target) || commandLine.contains(event.target) || fileExplorerToggle.contains(event.target)) return;
    setFileExplorerOpen(false);
  });
  explorerPreviewClose.addEventListener('click', closeExplorerPreview);
  explorerPreviewMinimize.addEventListener('click', () => setPreviewMinimized(!explorerPreview.classList.contains('is-minimized')));
  explorerPreviewRefresh.addEventListener('click', () => {
    if (explorerPreviewFrame.src && explorerPreviewFrame.src !== 'about:blank') explorerPreviewFrame.src = explorerPreviewFrame.src;
  });
  explorerPreviewFaviconButton.addEventListener('click', () => {
    if (explorerPreview.classList.contains('is-minimized')) {
      setFileExplorerOpen(true);
      setPreviewMinimized(false);
    }
  });
  explorerPreviewFullscreen.addEventListener('click', async () => {
    if (document.fullscreenElement === explorerPreview) await document.exitFullscreen();
    else if (explorerPreview.classList.contains('is-url-fullscreen')) {
      explorerPreview.classList.remove('is-url-fullscreen');
      updatePreviewFullscreenState();
      syncPreviewAddress();
      positionExplorerPreview();
    } else await explorerPreview.requestFullscreen();
  });
  document.addEventListener('fullscreenchange', () => {
    const fullscreen = document.fullscreenElement === explorerPreview;
    explorerPreview.classList.toggle('is-url-fullscreen', fullscreen);
    updatePreviewFullscreenState();
    explorerPreviewFullscreen.textContent = fullscreen ? '⛶' : '□';
    explorerPreviewFullscreen.setAttribute('aria-label', fullscreen ? 'Exit fullscreen preview' : 'Show site preview fullscreen');
    if (!fullscreen) positionExplorerPreview();
    syncPreviewAddress();
  });
  explorerPreviewUrlForm.addEventListener('submit', event => {
    event.preventDefault();
    const source = normalizePreviewUrl(explorerPreviewUrl.value);
    if (!source) {
      fileExplorerStatus.textContent = 'Enter a valid http(s) URL or local FileExplorer path.';
      return;
    }
    let title = source;
    try { title = new URL(source).hostname || source; } catch { /* source is already validated */ }
    openExplorerPreview(source, title);
  });
  explorerPreviewFrame.addEventListener('load', () => {
    try {
      const previewDocument = explorerPreviewFrame.contentDocument;
      if (!previewDocument || explorerPreviewFrame.src === 'about:blank') return;
      const loadedTitle = previewDocument.title.trim();
      if (loadedTitle) setPreviewTitle(loadedTitle);
      const activeTab = explorerTabs.find(tab => tab.id === activeExplorerTabId);
      if (activeTab?.customFavicon) return;
      const icon = previewDocument.querySelector('link[rel~="icon"]')?.getAttribute('href');
      if (icon) {
        const favicon = new URL(icon, explorerPreviewFrame.contentWindow.location.href).href;
        explorerPreviewFavicon.src = favicon;
        if (activeTab) {
          activeTab.favicon = favicon;
          saveExplorerTabs();
          renderExplorerTabDock();
        }
      }
    } catch {
      // Cross-origin previews keep the URL-derived title and favicon.
    }
  });
  renderExplorerTabDock();
  const sharedPreviewUrl = new URL(window.location.origin);
  const sharedPreviewSource = normalizePreviewUrl(sharedPreviewUrl.searchParams.get('site') || '');
  if (sharedPreviewSource) {
    setFileExplorerOpen(true);
    const savedTab = explorerTabs.find(tab => {
      try { return new URL(tab.source, window.location.origin).href === sharedPreviewSource; }
      catch { return false; }
    });
    let sharedPreviewTitle = sharedPreviewSource;
    try { sharedPreviewTitle = savedTab?.title || new URL(sharedPreviewSource).hostname || sharedPreviewSource; } catch { /* source is normalized */ }
    openExplorerPreview(sharedPreviewSource, sharedPreviewTitle, savedTab?.id || null);
    if (sharedPreviewUrl.searchParams.get('fullscreen') === 'true') {
      explorerPreview.classList.add('is-url-fullscreen');
      updatePreviewFullscreenState();
      syncPreviewAddress();
    }
  }
  function positionDesktopWindows() {
    if (fileExplorer.classList.contains('is-open')) {
      positionFileExplorer();
      positionExplorerPreview();
    }
  }

  let desktopRuntimeActive = false;
  const onDesktopScroll = () => {
    syncFloatingHeader();
    positionDesktopWindows();
  };
  const onDesktopResize = () => {
    syncFloatingHeader();
    positionDesktopWindows();
  };
  function syncDesktopRuntime() {
    if (mobileLayoutQuery.matches) {
      if (desktopRuntimeActive) {
        window.removeEventListener('scroll', onDesktopScroll);
        window.removeEventListener('resize', onDesktopResize);
        desktopRuntimeActive = false;
      }
      setFileExplorerOpen(false);
      syncFloatingHeader();
      return;
    }
    if (!desktopRuntimeActive) {
      window.addEventListener('scroll', onDesktopScroll, { passive: true });
      window.addEventListener('resize', onDesktopResize);
      desktopRuntimeActive = true;
    }
    syncFloatingHeader();
    positionDesktopWindows();
  }
  mobileLayoutQuery.addEventListener('change', syncDesktopRuntime);
  syncDesktopRuntime();
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (!explorerPreview.hidden) setPreviewMinimized(true);
    else if (fileExplorer.classList.contains('is-open')) setFileExplorerOpen(false);
  });

  function getExplorerFileIcon(name) {
    const extension = name.includes('.') ? name.split('.').pop().toLowerCase() : '';
    const icons = {
      html: ['tree-html', 'fa-file-code'],
      href: ['tree-href', 'fa-link'],
      link: ['tree-link', 'fa-link'],
      iframe: ['tree-iframe', 'fa-window-maximize'],
      js: ['tree-js', 'fa-file-code'],
      css: ['tree-css', 'fa-file-code'],
      json: ['tree-json', 'fa-file-code'],
      png: ['tree-image', 'fa-file-image'],
      jpg: ['tree-image', 'fa-file-image'],
      jpeg: ['tree-image', 'fa-file-image'],
      webp: ['tree-image', 'fa-file-image'],
      mp3: ['tree-audio', 'fa-file-audio'],
      wav: ['tree-audio', 'fa-file-audio']
    };
    return icons[extension] || ['tree-generic', 'fa-file-lines'];
  }

  function makeExplorerTree(entries, depth = 0) {
    const fragment = document.createDocumentFragment();
    entries.forEach(entry => {
      if (entry.type === 'directory') {
        const folderId = `explorer-folder-${explorerTreeId++}`;
        const isOpen = depth === 0;
        const folder = document.createElement('button');
        folder.className = 'tree-folder';
        folder.type = 'button';
        folder.setAttribute('aria-expanded', String(isOpen));
        folder.setAttribute('aria-controls', folderId);
        folder.innerHTML = `<i class="fa-solid fa-chevron-${isOpen ? 'down' : 'right'} tree-chevron" aria-hidden="true"></i><i class="fa-solid fa-folder tree-folder-icon" aria-hidden="true"></i><span></span>`;
        folder.querySelector('span').textContent = entry.name;
        const isToolsDirectory = entry.name === 'Tools' && depth === 0;
        if (isToolsDirectory) {
          folder.dataset.toolsDirectory = 'true';
          folder.addEventListener('dblclick', event => {
            event.preventDefault();
            event.stopPropagation();
            window.location.assign(new URL('FileExplorer/Tools/', window.location.origin).href);
          });
        }

        const children = document.createElement('div');
        children.className = 'tree-children';
        children.id = folderId;
        children.hidden = !isOpen;
        children.append(makeExplorerTree(entry.children || [], depth + 1));
        if (isToolsDirectory) {
          const folderRow = document.createElement('div');
          folderRow.className = 'tree-folder-row';
          const popout = document.createElement('a');
          popout.className = 'tree-folder-popout';
          popout.href = 'FileExplorer/Tools/';
          popout.title = 'Open Tools directory';
          popout.setAttribute('aria-label', 'Open Tools directory');
          popout.innerHTML = '<i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>';
          folderRow.append(folder, popout);
          fragment.append(folderRow, children);
        } else {
          fragment.append(folder, children);
        }
        return;
      }

      const [typeClass, iconClass] = getExplorerFileIcon(entry.name);
      const isShortcut = /\.(?:href|link)$/i.test(entry.name);
      const file = document.createElement(isShortcut ? 'button' : 'a');
      file.className = `tree-file ${typeClass}`;
      if (isShortcut) {
        file.type = 'button';
        file.dataset.hrefFile = entry.path;
      } else {
        file.href = entry.path;
        file.target = '_blank';
        file.rel = 'noopener noreferrer';
      }
      file.innerHTML = `<i class="fa-solid ${iconClass}" aria-hidden="true"></i><span></span>`;
      file.querySelector('span').textContent = entry.name;
      fragment.append(file);
    });
    return fragment;
  }

  async function refreshFileExplorer() {
    try {
      const response = await fetch('FileExplorer/file-index.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('Index not found');
      const entries = await response.json();
      if (!Array.isArray(entries)) throw new Error('Invalid index');
      explorerTreeId = 0;
      fileExplorerTree.replaceChildren(makeExplorerTree(entries));
      fileExplorerStatus.textContent = 'Select a file to open it.';
    } catch {
      fileExplorerStatus.textContent = 'File index could not be loaded.';
    }
  }

  fileExplorerTree.addEventListener('click', async event => {
    const folder = event.target.closest('.tree-folder');
    if (folder) {
      const childTree = document.getElementById(folder.getAttribute('aria-controls'));
      const isOpen = folder.getAttribute('aria-expanded') === 'true';
      folder.setAttribute('aria-expanded', String(!isOpen));
      childTree.hidden = isOpen;
      folder.querySelector('.tree-chevron').className = `fa-solid fa-chevron-${isOpen ? 'right' : 'down'} tree-chevron`;
      return;
    }

    const previewFile = event.target.closest('.tree-html, .tree-iframe');
    if (previewFile) {
      event.preventDefault();
      const fileName = previewFile.querySelector('span').textContent;
      const filePath = previewFile.getAttribute('href');
      fileExplorerStatus.textContent = `Opening ${fileName} in preview…`;

      if (previewFile.classList.contains('tree-html')) {
        openExplorerPreview(filePath, fileName);
        return;
      }

      try {
        const response = await fetch(filePath);
        const storedText = await response.text();
        const lines = storedText.split(/\r?\n/);
        const linkMatch = lines[0]?.match(/(?:https?:\/\/)?(?:[\w-]+\.)+[a-z]{2,}(?:\/[^\s]*)?/i)?.[0];
        if (!response.ok || !linkMatch) throw new Error('No valid iframe URL');
        const iframeSource = normalizeKnownLink(/^https?:\/\//i.test(linkMatch) ? linkMatch : `https://${linkMatch}`);
        const urlEditable = lines[1]?.trim() === 'URLEditingEnabled=True';
        const faviconValue = lines[2]?.match(/^\s*favicon\s*=\s*(\S+)\s*$/i)?.[1] || '';
        let favicon = '';
        if (faviconValue) {
          try { favicon = new URL(faviconValue, new URL(filePath, window.location.href)).href; } catch { /* use the normal fallback */ }
        }
        openExplorerPreview(iframeSource, fileName, null, { urlEditable, favicon });
      } catch {
        fileExplorerStatus.textContent = `${fileName} does not contain a valid preview URL yet.`;
      }
      return;
    }

    const hrefFile = event.target.closest('[data-href-file]');
    if (!hrefFile) return;
    const opensInNewTab = hrefFile.classList.contains('tree-link');
    const newTab = opensInNewTab ? window.open('about:blank', '_blank') : null;
    if (newTab) newTab.opener = null;
    fileExplorerStatus.textContent = `Opening ${hrefFile.querySelector('span').textContent}…`;
    try {
      const response = await fetch(hrefFile.dataset.hrefFile);
      const storedText = await response.text();
      const linkMatch = storedText.match(/(?:https?:\/\/)?(?:[\w-]+\.)+[a-z]{2,}(?:\/[^\s]*)?/i)?.[0];
      if (!response.ok || !linkMatch) throw new Error('No valid URL');
      const storedLink = normalizeKnownLink(/^https?:\/\//i.test(linkMatch) ? linkMatch : `https://${linkMatch}`);
      if (opensInNewTab && newTab) newTab.location.replace(storedLink);
      else if (opensInNewTab) window.open(storedLink, '_blank', 'noopener,noreferrer');
      else openExplorerPreview(storedLink, hrefFile.querySelector('span').textContent);
    } catch {
      newTab?.close();
      fileExplorerStatus.textContent = `${hrefFile.querySelector('span').textContent} does not contain a valid URL yet.`;
    }
  });

  fileExplorerTree.addEventListener('dblclick', event => {
    const toolsFolder = event.target.closest('.tree-folder[data-tools-directory="true"]');
    if (!toolsFolder) return;
    window.location.assign(new URL('FileExplorer/Tools/', window.location.origin).href);
  });

  refreshFileExplorer();

    const yearElement = document.getElementById('year');
    if (yearElement) yearElement.textContent = new Date().getFullYear();

    const birthDate = new Date("2010-01-13");
    const today = new Date();

    let years = today.getFullYear() - birthDate.getFullYear();

    // Adjust if the birthday hasn't occurred yet this year
    const hasHadBirthdayThisYear =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

    if (!hasHadBirthdayThisYear) years--;

    const ageElement = document.getElementById("age");
    if (ageElement) ageElement.textContent = years;
    const gameDevYears = years - 8;
    const gameDevAgeElement = document.getElementById("GameDevAge");
    const gameDevYearsLabelElement = document.getElementById("GameDevYearsLabel");
    if (gameDevAgeElement) gameDevAgeElement.textContent = gameDevYears;
    if (gameDevYearsLabelElement) gameDevYearsLabelElement.textContent = gameDevYears === 1 ? 'year' : 'years';
    const graphicsDesignStartYear = 2024;
    const graphicsDesignYears = Math.max(0, today.getFullYear() - graphicsDesignStartYear);
    const graphicsDesignAgeElement = document.getElementById("GraphicsDesignAge");
    const graphicsDesignYearsLabelElement = document.getElementById("GraphicsDesignYearsLabel");
    if (graphicsDesignAgeElement) graphicsDesignAgeElement.textContent = graphicsDesignYears;
    if (graphicsDesignYearsLabelElement) graphicsDesignYearsLabelElement.textContent = graphicsDesignYears === 1 ? 'year' : 'years';

    // smooth anchor scrolling
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const href = a.getAttribute('href');
        if (href.length>1) {
          e.preventDefault();
          document.querySelector(href).scrollIntoView({behavior:'smooth', block:'start'});
        }
      })
    });

  function getBackgroundImages() {
    const elements = Array.from(document.querySelectorAll('*'));
    const urls = [];

    elements.forEach(el => {
      const bg = getComputedStyle(el).backgroundImage;
      if (bg && bg !== 'none' && bg.includes('url(')) {
        const matches = bg.match(/url\(["']?([^"')]+)["']?\)/g);
        if (matches) {
          matches.forEach(url => {
            const cleanUrl = url.replace(/url\(["']?/, '').replace(/["']?\)/, '');
            urls.push(cleanUrl);
          });
        }
      }
    });

    return urls;
  }

  // Wait for all images (including CSS backgrounds)
  async function waitForAllImages() {
    const imgElements = Array.from(document.images).map(img => img.src);
    const bgImages = getBackgroundImages();
    const allUrls = [...imgElements, ...bgImages];

    await Promise.all(allUrls.map(src => {
      return new Promise(resolve => {
        const img = new Image();
        img.onload = img.onerror = resolve;
        img.src = src;
      });
    }));
  }

  function enableMizukiScrollSpring(mizuki) {
    if (mobileLayoutQuery.matches) return;
    let frame = null;
    let restTimer = null;
    let lastScrollPosition = window.scrollY;
    let offsetY = 0;
    let positionX = window.innerWidth * 1.2;
    let positionY = 0;
    let velocityX = 0;
    let velocityY = 0;
    let lastFrameTime = performance.now();
    let returningToRest = false;
    let entering = true;
    const minimumVerticalOffset = -80;

    const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
    const getTarget = now => {
      const baseX = window.innerWidth * 0.15;
      const isIdle = !entering && Math.abs(offsetY) < 0.01;
      const idleBob = isIdle ? Math.sin(now / 1050) * 5 : 0;
      return {
        x: baseX,
        y: Math.max(offsetY, minimumVerticalOffset) + idleBob,
        isIdle
      };
    };

    const stepSpring = now => {
      if (mobileLayoutQuery.matches) {
        frame = null;
        return;
      }
      const seconds = Math.min((now - lastFrameTime) / 1000, 0.04);
      lastFrameTime = now;
      const target = getTarget(now);
      // The initial entrance and return are gentle; active scrolling responds fast.
      const stiffness = entering || returningToRest ? 3 : 95;
      const damping = entering || returningToRest ? 3.5 : 15;

      velocityX += (target.x - positionX) * stiffness * seconds;
      velocityY += (target.y - positionY) * stiffness * seconds;
      velocityX *= Math.exp(-damping * seconds);
      velocityY *= Math.exp(-damping * seconds);
      positionX += velocityX * seconds;
      positionY += velocityY * seconds;
      mizuki.style.translate = `${positionX.toFixed(2)}px ${positionY.toFixed(2)}px`;

      const atRest = Math.abs(target.x - positionX) < 0.15 && Math.abs(target.y - positionY) < 0.15 && Math.abs(velocityX) < 0.15 && Math.abs(velocityY) < 0.15;
      if (atRest && !target.isIdle) {
        const justFinishedEntering = entering;
        positionX = target.x;
        positionY = target.y;
        velocityX = 0;
        velocityY = 0;
        mizuki.style.translate = `${target.x}px ${target.y}px`;
        entering = false;
        if (justFinishedEntering) {
          frame = requestAnimationFrame(stepSpring);
          return;
        }
        frame = null;
        return;
      }

      frame = requestAnimationFrame(stepSpring);
    };

    const wakeSpring = () => {
      if (!frame) {
        lastFrameTime = performance.now();
        frame = requestAnimationFrame(stepSpring);
      }
    };

    const handleMizukiScroll = () => {
      const scrollPosition = window.scrollY;
      const distance = scrollPosition - lastScrollPosition;
      lastScrollPosition = scrollPosition;
      if (!distance) return;

      // Scrolling down is capped at an 80px upward offset; scrolling up can
      // carry her downward as far as needed.
      offsetY = Math.max(offsetY - distance * 0.17, minimumVerticalOffset);
      entering = false;
      returningToRest = false;
      wakeSpring();

      clearTimeout(restTimer);
      restTimer = setTimeout(() => {
        offsetY = 0;
        returningToRest = true;
        wakeSpring();
      }, 300);
    };
    const handleMizukiResize = () => wakeSpring();
    const stopMizukiForMobile = event => {
      if (!event.matches) return;
      clearTimeout(restTimer);
      if (frame) cancelAnimationFrame(frame);
      frame = null;
      window.removeEventListener('scroll', handleMizukiScroll);
      window.removeEventListener('resize', handleMizukiResize);
      mobileLayoutQuery.removeEventListener('change', stopMizukiForMobile);
    };
    window.addEventListener('scroll', handleMizukiScroll, { passive: true });
    window.addEventListener('resize', handleMizukiResize);
    mobileLayoutQuery.addEventListener('change', stopMizukiForMobile);
    wakeSpring();
  }

  // Main preloader
  document.addEventListener("DOMContentLoaded", async () => {
    const skipMizuki = document.documentElement.classList.contains('browser-rest-hours');
    if (skipMizuki) document.getElementById("mizuki")?.remove();
    if (mobileLayoutQuery.matches) {
      document.getElementById("loader").remove();
      return;
    }
    await waitForAllImages();
    const loader = document.getElementById("loader");
    loader.classList.add("fade-out");
    
    setTimeout(() => loader.remove(), 800);
    setTimeout(() => {
      if (skipMizuki) return;
      console.log("Adding loaded class...");
      const mizuki = document.getElementById("mizuki");
      if (!mizuki) return;
      mizuki.classList.add("loaded");
      enableMizukiScrollSpring(mizuki);
    }, 200);
  });

  document.querySelectorAll('.music-card').forEach(card => {
    const audio = card.querySelector('.music-player');
    const playBtn = card.querySelector('.play-btn');
    const progress = card.querySelector('.progress');
    const progressContainer = card.querySelector('.progress-container');

    // Start paused
    audio.pause();
    audio.volume = 0.1; // <-- set default volume to 40%
    playBtn.textContent = '▶';

    playBtn.addEventListener('click', () => {
      // Pause all other players
      document.querySelectorAll('.music-player').forEach(otherAudio => {
        if(otherAudio !== audio) otherAudio.pause();
      });
      document.querySelectorAll('.play-btn').forEach(btn => {
        if(btn !== playBtn) btn.textContent = '▶';
      });

      if(audio.paused){
        audio.play();
        playBtn.textContent = '⏸';
      } else {
        audio.pause();
        playBtn.textContent = '▶';
      }
    });

    audio.addEventListener('timeupdate', () => {
      const percent = (audio.currentTime / audio.duration) * 100;
      progress.style.width = percent + '%';
    });

    progressContainer.addEventListener('click', (e) => {
      const width = progressContainer.clientWidth;
      const clickX = e.offsetX;
      audio.currentTime = (clickX / width) * audio.duration;
    });
  });

  // Define your list of strings
  const messages = [
    "Meow!",
    "Roblox is love Roblox is life!",
    "AnRat was here.",
    "JACK ITS A REVENENANT",
    "I know what you goon to",
    "FUCK Broken Studios",
    "### # #### #### ####",
    "Potato corner 🤤",
    "Give me Potato Corner or give me Death",
    "Akiyama Mizuki Desu!",
    "秋山瑞稀です！",
    "アクワーです！",
    "Aqua Desu!",
    "Gomen...",
    "ごめん。。。",
    "世界でいちばんおひめさま",
    "Hi Addy :3",
    "Lesbians",
    "*notices buldge*",
    "Error 404: Mental breakdown in affect.",
    "My name is Alexander Hamilton",
    "HE WROTE THE OTHER 51", 
    "Do a barrel roll",
    "Beep Boop",
    "Splash Text!",
    "Open the sparkling apple juice karen!",
    "Press F to pay respects",
    "Powered by chaos",
    "I speak fluent spaghetti",
    "HANK DONT ABBRIEVIATE CYBERPUNK HANK",
    "1, 2, 3, 4, 5, 8, 9",
    "I goon to femboys but noone will know.",
    "The world turned upside down...",
    "On the morning of septemb-",
    "Im a Catgirl btw",
    "More insecurities than a cyclops",
    "Metal Health -inf",
    "Is it veiny?",
    "72 Hours a day on Roblox",
    "Vins feet 🤤",
    "@everyone",
    ""
  ];

  // Function to pick a random message
  function setRandomMessage() {
    const randomIndex = Math.floor(Math.random() * messages.length);
    document.getElementById("SplashText").textContent = messages[randomIndex];
  }

  // Call it once when the page loads
  setRandomMessage();

  // Browser-local command console. Custom responses remain on this device.
  const commandForm = document.getElementById('commandForm');
  const commandInput = document.getElementById('commandInput');
  const commandOutput = document.getElementById('commandOutput');
  const terminalHistory = document.getElementById('terminalHistory');
  const commandStorageKey = 'anrat-custom-commands';
  const musicPiPSize = { width: 150, height: 360 };
  let customCommands = {};
  let musicPiPWindow = null;

  try {
    const savedCommands = JSON.parse(localStorage.getItem(commandStorageKey) || '{}');
    if (savedCommands && typeof savedCommands === 'object' && !Array.isArray(savedCommands)) {
      customCommands = Object.fromEntries(
        Object.entries(savedCommands).filter(([name, response]) =>
          /^[a-z0-9_-]+$/i.test(name) && typeof response === 'string'
        )
      );
    }
  } catch {
    customCommands = {};
  }

  function showCommandOutput(message, state = '') {
    commandOutput.textContent = message;
    commandOutput.dataset.state = state;
  }

  function saveCustomCommands() {
    localStorage.setItem(commandStorageKey, JSON.stringify(customCommands));
  }

  function clearTerminalSession() {
    if (!terminalHistory.querySelector('.terminal-entry')) {
      terminalWindow.hidden = true;
      return;
    }
    terminalHistory.replaceChildren();
    const emptyState = document.createElement('p');
    emptyState.className = 'terminal-empty';
    emptyState.textContent = 'Run a command to begin this session.';
    terminalHistory.append(emptyState);
    terminalWindow.hidden = false;
  }

  document.addEventListener('click', event => {
    const closeButton = event.target.closest('.window-close');
    if (!closeButton) return;

    const windowCard = closeButton.closest('.card, .music-card');
    if (!windowCard) return;

    if (windowCard === terminalWindow) {
      clearTerminalSession();
      return;
    }

    windowCard.hidden = true;
  });

  function appendSafeRecordMarkup(target, markup, linkClass = 'terminal-record-link') {
    const template = document.createElement('template');
    template.innerHTML = markup;

    const copyNode = (node, parent) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent.replace(/\s+/g, ' ');
        if (text) parent.append(document.createTextNode(text));
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;

      const tag = node.tagName.toLowerCase();
      if (tag === 'br') {
        parent.append(document.createElement('br'));
        return;
      }
      if (tag === 'a') {
        const href = node.getAttribute('href') || '';
        const safeHref = /^(https?:|mailto:|\/)/i.test(href) ? href : '';
        const link = safeHref ? document.createElement('a') : document.createElement('span');
        if (safeHref) {
          link.href = safeHref;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.className = linkClass;
        }
        node.childNodes.forEach(child => copyNode(child, link));
        parent.append(link);
        return;
      }

      const allowedTags = new Set(['b', 'strong', 'em', 'i', 'span', 'p']);
      const element = allowedTags.has(tag) ? document.createElement(tag) : document.createElement('span');
      node.childNodes.forEach(child => copyNode(child, element));
      parent.append(element);
    };

    template.content.childNodes.forEach(node => copyNode(node, target));
  }

  function appendTerminalEntry(command, message, state = '', record = null) {
    const commandTop = commandForm.getBoundingClientRect().top;
    terminalWindow.hidden = false;
    terminalHistory.querySelector('.terminal-empty')?.remove();
    const entry = document.createElement('div');
    entry.className = 'terminal-entry';
    entry.dataset.state = state;

    const commandLine = document.createElement('div');
    commandLine.className = 'terminal-command';
    commandLine.textContent = `$ ${command}`;

    const resultLine = document.createElement('div');
    resultLine.className = 'terminal-result';
    resultLine.textContent = message;

    entry.append(commandLine, resultLine);
    if (record) {
      const meta = document.createElement('div');
      meta.className = 'terminal-record-meta';
      if (record.priority) meta.append(document.createTextNode(record.priority));
      if (record.priority && record.tag) meta.append(document.createTextNode(' — '));
      if (record.tag) appendSafeRecordMarkup(meta, record.tag, 'terminal-record-inline-link');

      const body = document.createElement('div');
      body.className = 'terminal-record-body';
      appendSafeRecordMarkup(body, record.paragraph);

      entry.append(meta, body);
    }
    terminalHistory.append(entry);
    terminalHistory.scrollTop = terminalHistory.scrollHeight;

    requestAnimationFrame(() => {
      const offset = commandForm.getBoundingClientRect().top - commandTop;
      if (offset) window.scrollBy({ top: offset, behavior: 'auto' });
    });
  }

  async function openMusicPlayer(musicLink = '') {
    if (!('documentPictureInPicture' in window)) {
      return { ok: false, message: 'Document Picture-in-Picture is not supported by this browser.' };
    }
    if (musicLink === "main") { 
      musicLink = "https://youtube.com/playlist?list=PLAEnfbyXD6Vk6_9HUA1h1fPhpOjBKkIcS&si=sFVHzRXsc_NoyMYL"; 
    }

    const playerSource = new URL('FileExplorer/Misc/Fun/MusicPlayer.html', window.location.origin);
    playerSource.searchParams.set('embedded', '1');
    playerSource.searchParams.set('autoplay', '1');
    if (musicLink) playerSource.searchParams.set('link', musicLink);
    const successMessage = musicLink
      ? 'Opened the supplied playlist in Document PiP.'
      : 'Opened Shuffle Station in Document PiP.';

    if (musicPiPWindow && !musicPiPWindow.closed) {
      const existingPlayer = musicPiPWindow.document.querySelector('iframe');
      if (existingPlayer) existingPlayer.src = playerSource.href;
      musicPiPWindow.focus();
      return { ok: true, message: musicLink ? 'Updated the Document PiP playlist.' : 'Reset Document PiP to the default playlist.' };
    }

    try {
      musicPiPWindow = await window.documentPictureInPicture.requestWindow(musicPiPSize);
      musicPiPWindow.document.title = 'Shuffle Station';
      musicPiPWindow.document.documentElement.style.cssText = 'width:100%;height:100%;overflow:hidden;';
      musicPiPWindow.document.body.style.cssText = 'margin:0;width:100vw;height:100dvh;background:#080b10;overflow:hidden;';

      const player = musicPiPWindow.document.createElement('iframe');
      player.src = playerSource.href;
      player.title = 'Shuffle Station music player';
      player.allow = 'autoplay; fullscreen';
      player.style.cssText = 'display:block;width:100vw;height:100dvh;border:0;background:#080b10;';
      musicPiPWindow.document.body.append(player);

      musicPiPWindow.addEventListener('pagehide', () => {
        musicPiPWindow = null;
      }, { once: true });

      return { ok: true, message: successMessage };
    } catch {
      musicPiPWindow = null;
      return { ok: false, message: 'Could not open the music player in Document PiP.' };
    }
  }

  commandForm.addEventListener('submit', async event => {
    event.preventDefault();
    const command = commandInput.value.trim();
    if (!command) return;

    const addCommand = command.match(/^add\s+([a-z0-9_-]+)\s*::\s*(.+)$/i);
    const removeCommand = command.match(/^(?:remove|delete)\s+([a-z0-9_-]+)$/i);
    const musicCommand = command.match(/^music(?:\s+(.+))?$/i);
    const normalizedCommand = command.toLowerCase();

    let message;
    let state = '';
    let record = null;

    if (musicCommand) {
      const result = await openMusicPlayer(musicCommand[1]?.trim() || '');
      message = result.message;
      state = result.ok ? 'success' : 'error';
    } else if (addCommand) {
      const [, name, response] = addCommand;
      customCommands[name.toLowerCase()] = response.trim();
      saveCustomCommands();
      message = `Saved command: ${name.toLowerCase()}`;
      state = 'success';
    } else if (removeCommand) {
      const name = removeCommand[1].toLowerCase();
      if (Object.hasOwn(customCommands, name)) {
        delete customCommands[name];
        saveCustomCommands();
        message = `Removed command: ${name}`;
        state = 'success';
      } else {
        message = `No custom command named "${name}".`;
        state = 'error';
      }
    } else if (normalizedCommand === 'help') {
      message = 'music [playlist URL]   |   add name :: response   |   name   |   list   |   remove name   |   vault phrase';
    } else if (normalizedCommand === 'list') {
      const names = Object.keys(customCommands);
      message = names.length ? `Custom commands: ${names.join(', ')}` : 'No custom commands yet.';
    } else if (Object.hasOwn(customCommands, normalizedCommand)) {
      message = customCommands[normalizedCommand];
      state = 'success';
    } else {
      const result = await openVault(command);
      message = result.message;
      state = result.ok ? 'success' : 'error';
      record = result.record || null;
    }

    showCommandOutput(message, state);
    appendTerminalEntry(command, message, state, record);
    commandInput.value = '';
  });

  document.querySelectorAll('.read-more-btn').forEach(btn => {
    console.log(btn.innerHTML)
    btn.addEventListener('click', () => {
      btn.style.display = 'none'; // hide button

      const container = btn.closest('.desc'); // get the parent paragraph
      const readMoreText = container.querySelector('.read-more-text');
      const readMoreBreak = container.querySelector('.read-more-break');

      readMoreText.style.display = 'inline'; // show typing area
      container.classList.add("expanded")
      const fullText = readMoreBreak.innerHTML;

      let i = 0;
      function type() {
        if (i < fullText.length) {
          if (fullText[i] === "<") { 
            const endTag = fullText.indexOf(">", i);
            readMoreText.innerHTML = fullText.slice(0, i) + "|";
            i = endTag + 1;
          } else {
            readMoreText.innerHTML = fullText.slice(0, i) + "|";
            i++;
          }
          setTimeout(type, 7);
        } else {
          readMoreText.innerHTML = fullText.slice(0, i);
        }
      }
      type();
    });
  });

    async function openVault(phrase) {
      // Only allow safe filenames (letters + numbers)
      if (!/^[a-zA-Z0-9_-]+$/.test(phrase)) {
          return { ok: false, message: 'Invalid command.' };
      }

      try {
          const response = await fetch(`secrets/${phrase}.txt`);

          if (!response.ok) {
              throw new Error("Not found");
          }

          const text = await response.text();
          const record = parseSecret(text);
          return { ok: true, message: `Opened terminal record: ${record.title}`, record };

      } catch (err) {
          return { ok: false, message: `Command not found: ${phrase}. Type help for options.` };
      }
  }

  function parseSecret(content) {
      const lines = content.split("\n");

      const title = lines[0]?.replace("Title:", "").trim() || "Unknown";
      const subclass = lines[1]?.replace("Class:", "").trim() || "Unknown";
      const priority = lines[2]?.replace("Priority:", "").trim() || "Unknown";
      const tag = lines[3]?.replace("Tag:", "").trim() || "Unknown";
      const icon = lines[4]?.replace("Icon:", "").trim() || "Unknown";
      const paragraph = lines.slice(6).join("\n").trim();

      return { title, subclass, priority, tag, icon, paragraph };
  }

const SelfNames = [
  "Seph",
  "Aqua",
  "Mizuki",
  "アクアー",
  "瑞稀",
];

const textelements = document.querySelectorAll('#NameText'); // Selects all elements with the class

let index = 0;

function showNextWord() {
    textelements.forEach(el => {
        console.log("a")
        el.classList.remove("nametext-show");
        el.classList.add("nametext-hide");
            setTimeout(() => {
                el.textContent = SelfNames[index];

                el.classList.remove("nametext-hide");
                el.classList.add("nametext-showtop");

                setTimeout(() => {
                    el.classList.remove("nametext-showtop");
                    el.classList.add("nametext-show");
                }, 200);
         }, 200);
    });
    index = (index + 1) % SelfNames.length;
}

if (!mobileLayoutQuery.matches) setInterval(showNextWord, 2000);
