(() => {

  // The inline head script applies the saved Mizuki preference before the page
  // can render, avoiding a visible flash when it should be hidden.

  const greeting = document.getElementById('browserGreeting');

  const searchForm = document.querySelector('.browser-search');

  const searchInput = document.getElementById('googleSearch');

  // Add the AI action beside Search without requiring an HTML change.
  const searchRow = searchInput?.closest('.browser-search-row');

  const searchButton = searchRow?.querySelector('button[type="submit"]');

  let aiButton = document.getElementById('browserAiButton');

  if (!aiButton && searchButton) {

    aiButton = document.createElement('button');

    aiButton.id = 'browserAiButton';

    aiButton.type = 'button';

    aiButton.className = 'browser-ai-button';

    aiButton.textContent = 'AI';

    aiButton.title = 'Ask ChatGPT in a temporary chat';

    searchButton.after(aiButton);

  }

  const resultsStatus = document.getElementById('browserResultsStatus');

  const resultsList = document.getElementById('browserResults');

  const loadMoreButton = document.getElementById('browserLoadMore');

  const savedLinksList = document.getElementById('savedLinksList');

  const savedLinksEmpty = document.getElementById('savedLinksEmpty');

  const savedLinksEdit = document.getElementById('savedLinksEdit');

  const savedLinksSection = document.querySelector('.saved-links');

  const bookmarksList = document.getElementById('bookmarksList');

  const bookmarksEmpty = document.getElementById('bookmarksEmpty');

  const bookmarkEdit = document.getElementById('bookmarkEdit');

  const bookmarksMenu = document.querySelector('.bookmarks-menu');

  const googleMenu = document.querySelector('.google-menu');

  const browserSettingsButton = document.getElementById('browserSettingsButton');

  const browserSettingsDialog = document.getElementById('browserSettingsDialog');

  const browserSettingsForm = document.getElementById('browserSettingsForm');

  const browserSettingsClose = document.getElementById('browserSettingsClose');

  const browserSettingsReset = document.getElementById('browserSettingsReset');

  const browserName = document.getElementById('browserName');

  const browserOpeningGreetings = document.getElementById('browserOpeningGreetings');

  const browserPromptGreetings = document.getElementById('browserPromptGreetings');

  const browserGreetingInterval = document.getElementById('browserGreetingInterval');

  const browserResultsPerBatch = document.getElementById('browserResultsPerBatch');

  const browserAnimateGreetings = document.getElementById('browserAnimateGreetings');

  const browserShowSplash = document.getElementById('browserShowSplash');

  const browserShowConsole = document.getElementById('browserShowConsole');

  const browserMizukiMode = document.getElementById('browserMizukiMode');

  const browserSearchProvider = document.getElementById('browserSearchProvider');

  const doubleEnterDelay = 550;

  let resultsPerBatch = 8;

  const savedLinksStorageKey = 'anrat-browser-saved-links';

  const bookmarksStorageKey = 'anrat-browser-bookmarks';

  const browserSettingsStorageKey = 'anrat-browser-settings';

  let lastSearch = { query: '', submittedAt: 0 };

  let activeSearch = 0;

  let currentQuery = '';

  let currentResults = [];

  let visibleResults = 0;

  let savedLinks = [];

  let savedLinksEditing = false;

  let bookmarks = [];

  let bookmarksEditing = false;

  let browserSettings = { name: 'Aqua', openingGreetings: [], promptGreetings: [], greetingInterval: 60, resultsPerBatch: 8, animateGreetings: true, showSplash: true, showConsole: true, mizukiMode: 'day', searchProvider: 'custom' };

  let refreshGreeting = () => {};



  function greetingLines(value) {

    return typeof value === 'string'
      ? value.split(/\r?\n/).map(line => line.trim()).filter(Boolean).slice(0, 30)
      : [];

  }

  function boundedNumber(value, fallback, minimum, maximum) {

    const number = Number(value);

    return Number.isFinite(number) ? Math.min(maximum, Math.max(minimum, Math.round(number))) : fallback;

  }



  function loadBrowserSettings() {

    try {

      const saved = JSON.parse(localStorage.getItem(browserSettingsStorageKey) || '{}');

      browserSettings = {
        name: typeof saved.name === 'string' && saved.name.trim() ? saved.name.trim().slice(0, 50) : 'Aqua',
        openingGreetings: Array.isArray(saved.openingGreetings) ? saved.openingGreetings.filter(value => typeof value === 'string' && value.trim()).slice(0, 30) : [],
        promptGreetings: Array.isArray(saved.promptGreetings) ? saved.promptGreetings.filter(value => typeof value === 'string' && value.trim()).slice(0, 30) : [],
        greetingInterval: boundedNumber(saved.greetingInterval, 60, 10, 3600),
        resultsPerBatch: boundedNumber(saved.resultsPerBatch, 8, 1, 50),
        animateGreetings: saved.animateGreetings !== false,
        showSplash: saved.showSplash !== false,
        showConsole: saved.showConsole !== false,
        mizukiMode: ['day', 'always', 'never'].includes(saved.mizukiMode) ? saved.mizukiMode : 'day',
        searchProvider: saved.searchProvider === 'google' ? 'google' : 'custom'
      };

    } catch {

      browserSettings = { name: 'Aqua', openingGreetings: [], promptGreetings: [], greetingInterval: 60, resultsPerBatch: 8, animateGreetings: true, showSplash: true, showConsole: true, mizukiMode: 'day', searchProvider: 'custom' };

    }

  }



  function saveBrowserSettings() {

    localStorage.setItem(browserSettingsStorageKey, JSON.stringify(browserSettings));

  }



  function personalizeGreeting(text) {

    return text.replaceAll('{name}', browserSettings.name).replaceAll('Aqua', browserSettings.name);

  }

  function applyBrowserSettings() {

    resultsPerBatch = browserSettings.resultsPerBatch;

    document.body.classList.toggle('hide-splash', !browserSettings.showSplash);

    document.body.classList.toggle('hide-console', !browserSettings.showConsole);

  }



  loadBrowserSettings();

  applyBrowserSettings();



  if (greeting) {

    let previousGreeting = '';

    let greetingTimer = null;

    const getTimeOfDay = () => new Date().getHours();

    const getOpeningGreetings = () => {

      if (browserSettings.openingGreetings.length) return browserSettings.openingGreetings;

      const hour = getTimeOfDay();

      return hour < 6
        ? [
            'Time to rest, Aqua',
            'It is time to rest, Aqua',
            'Rest well, Aqua',
            'Time to wind down, Aqua'
          ]
        : hour < 12
          ? [
              'Good morning, Aqua',
              'Morning, Aqua',
              'A very good morning to you, Aqua',
              'Rise and shine, Aqua'
            ]
          : hour < 18
            ? [
                'Good afternoon, Aqua',
                'Afternoon, Aqua',
                'Hope you are having a good afternoon, Aqua',
                'A very good afternoon to you, Aqua'
              ]
            : [
                'Good evening, Aqua',
                'Evening, Aqua',
                'Hope you are having a good evening, Aqua',
                'A very good evening to you, Aqua'
              ];

    };

    const getFollowUpOptions = () => {

      if (browserSettings.promptGreetings.length) return browserSettings.promptGreetings;

      const hour = getTimeOfDay();

      return hour < 6
        ? [
            'Why are you still awake, Aqua?',
            'Ready to call it a night?',
            'Need anything before you rest?',
            'Would a little sleep help?',
            'How has your night been, Aqua?',
            'What is keeping you up?',
            'Is there anything you want to do before bed?',
            'How are you feeling tonight?'
          ]
        : hour < 12
          ? [
              'Did you sleep well, Aqua?',
              'What is on your mind this morning?',
              'Ready for the day?',
              'Have you had breakfast yet?',
              'What would make today a good day?',
              'What are you looking forward to today?',
              'How can today be a little better?',
              'What is first on your list today?'
            ]
          : hour < 18
            ? [
                'How is your day going, Aqua?',
                'What have you been up to?',
                'Need a quick reset?',
                'What is one thing you want to finish today?',
                'Has anything made you smile today?',
                'What is taking up most of your time today?',
                'How are you feeling right now?',
                'What would help your afternoon go better?'
              ]
            : [
                'How was your day, Aqua?',
                'What was the best part of today?',
                'Did anything interesting happen today?',
                'How are you feeling this evening?',
                'What are you looking forward to tomorrow?',
                'What is on your mind tonight?',
                'Was there a moment you want to remember from today?',
                'What would make this evening feel nice?'
              ];

    };

    const fitGreeting = () => {

      const availableWidth = greeting.parentElement?.clientWidth || 0;

      if (!availableWidth) return;

      const maximumSize = Math.min(44, availableWidth / 4);

      let size = maximumSize;

      greeting.style.fontSize = `${size}px`;

      while (greeting.scrollWidth > availableWidth && size > 1) {

        size -= 1;

        greeting.style.fontSize = `${size}px`;

      }

    };

    const animateGreeting = () => {

      if (!browserSettings.animateGreetings) return;

      greeting.classList.remove('is-animating');

      void greeting.offsetWidth;

      greeting.classList.add('is-animating');

    };

    const rotateGreeting = (isOpening = false) => {

      const options = isOpening ? getOpeningGreetings() : getFollowUpOptions();

      const availableOptions = options.filter(option => option !== previousGreeting);

      greeting.textContent = personalizeGreeting((availableOptions.length ? availableOptions : options)[Math.floor(Math.random() * (availableOptions.length || options.length))]);

      previousGreeting = greeting.textContent;

      requestAnimationFrame(fitGreeting);

      animateGreeting();

    };

    const startGreetingTimer = () => {

      window.clearInterval(greetingTimer);

      greetingTimer = window.setInterval(rotateGreeting, browserSettings.greetingInterval * 1_000);

    };

    rotateGreeting(true);

    refreshGreeting = () => {

      rotateGreeting(true);

      startGreetingTimer();

    };

    startGreetingTimer();

    new ResizeObserver(fitGreeting).observe(greeting.parentElement);

  }



  function getNavigationUrl(value) {

    const hasProtocol = /^https?:\/\//i.test(value);

    const looksLikeUrl = hasProtocol || /^(?:localhost(?::\d+)?|(?:[\w-]+\.)+[a-z]{2,})(?:[\/?#:]|$)/i.test(value);

    if (!looksLikeUrl) return null;



    try {

      const url = new URL(hasProtocol ? value : `https://${value}`);

      return /^https?:$/.test(url.protocol) ? url.href : null;

    } catch {

      return null;

    }

  }



  function makeLocalId() {

    return crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;

  }



  function loadBookmarks() {

    try {

      const stored = JSON.parse(localStorage.getItem(bookmarksStorageKey) || '[]');

      if (!Array.isArray(stored)) return;

      bookmarks = stored.flatMap(bookmark => {

        const url = getNavigationUrl(bookmark?.url || '');

        if (!url) return [];

        const title = typeof bookmark.title === 'string' && bookmark.title.trim()
          ? bookmark.title.trim()
          : new URL(url).hostname;

        return [{ id: typeof bookmark.id === 'string' ? bookmark.id : makeLocalId(), title, url }];

      });

    } catch {

      bookmarks = [];

    }

  }



  function saveBookmarks() {

    localStorage.setItem(bookmarksStorageKey, JSON.stringify(bookmarks));

  }



  function renderBookmarks() {

    bookmarksList?.replaceChildren();

    if (!bookmarksList || !bookmarksEmpty) return;

    bookmarksEmpty.hidden = bookmarks.length > 0 || bookmarksEditing;

    bookmarks.forEach(bookmark => {

      const item = document.createElement('li');

      item.className = 'bookmark';

      const anchor = document.createElement('a');

      anchor.href = bookmark.url;

      anchor.title = bookmark.url;

      anchor.textContent = bookmark.title;

      const actions = document.createElement('div');

      actions.className = 'bookmark-actions';

      const edit = document.createElement('button');

      edit.type = 'button';

      edit.title = 'Edit bookmark';

      edit.setAttribute('aria-label', `Edit ${bookmark.title}`);

      edit.innerHTML = '<i class="fa-solid fa-pen" aria-hidden="true"></i>';

      edit.addEventListener('click', () => editBookmark(bookmark.id));

      const remove = document.createElement('button');

      remove.type = 'button';

      remove.className = 'bookmark-remove';

      remove.title = 'Delete bookmark';

      remove.setAttribute('aria-label', `Delete ${bookmark.title}`);

      remove.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';

      remove.addEventListener('click', () => {

        bookmarks = bookmarks.filter(item => item.id !== bookmark.id);

        saveBookmarks();

        renderBookmarks();

      });

      actions.append(edit, remove);

      item.append(anchor, actions);

      bookmarksList.append(item);

    });

    if (bookmarksEditing) {

      const item = document.createElement('li');

      const add = document.createElement('button');

      add.type = 'button';

      add.className = 'bookmark-add';

      add.innerHTML = '<i class="fa-solid fa-plus" aria-hidden="true"></i> Add bookmark';

      add.addEventListener('click', addBookmark);

      item.append(add);

      bookmarksList.append(item);

    }

  }



  function addBookmark() {

    const title = window.prompt('Bookmark title (optional):');

    if (title === null) return;

    const enteredUrl = window.prompt('Bookmark URL:');

    if (enteredUrl === null) return;

    const url = getNavigationUrl(enteredUrl);

    if (!url) {

      window.alert('Enter a valid http(s) URL.');

      return;

    }

    bookmarks.push({ id: makeLocalId(), title: title.trim() || new URL(url).hostname, url });

    saveBookmarks();

    renderBookmarks();

  }



  function editBookmark(id) {

    const bookmark = bookmarks.find(item => item.id === id);

    if (!bookmark) return;

    const title = window.prompt('Bookmark title:', bookmark.title);

    if (title === null) return;

    const enteredUrl = window.prompt('Bookmark URL:', bookmark.url);

    if (enteredUrl === null) return;

    const url = getNavigationUrl(enteredUrl);

    if (!url) {

      window.alert('Enter a valid http(s) URL.');

      return;

    }

    bookmark.title = title.trim() || new URL(url).hostname;

    bookmark.url = url;

    saveBookmarks();

    renderBookmarks();

  }



  function loadSavedLinks() {

    try {

      const storedLinks = JSON.parse(localStorage.getItem(savedLinksStorageKey) || '[]');

      if (!Array.isArray(storedLinks)) return;

      savedLinks = storedLinks.flatMap(link => {

        const url = getNavigationUrl(link?.url || '');

        if (!url) return [];

        const title = typeof link.title === 'string' ? link.title.trim() : '';

        const icon = getNavigationUrl(link?.icon || '') || '';

        return [{ id: typeof link.id === 'string' ? link.id : crypto.randomUUID(), title, url, icon }];

      });

    } catch {

      savedLinks = [];

    }

  }



  function saveSavedLinks() {

    localStorage.setItem(savedLinksStorageKey, JSON.stringify(savedLinks));

  }



  function getFaviconUrl(url) {

    try {

      const pageUrl = new URL(url);

      if (pageUrl.hostname === 'portfolio.anrat.link') {
        return new URL('/assets/favicon.ico', pageUrl).href;
      }

      return new URL('/favicon.ico', pageUrl).href;

    } catch {

      return '';

    }

  }



  function createSavedLinkIcon(link) {

    const icon = document.createElement('img');

    icon.className = 'saved-link-icon';

    icon.alt = '';

    // /favicon.ico is not universal. Try the saved custom icon first,
    // then the site's root icon and public favicon services.
    const hostname = new URL(link.url).hostname;

    const candidates = [...new Set([

      link.icon,

      getFaviconUrl(link.url),

      `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=64`,

      `https://icon.horse/icon/${encodeURIComponent(hostname)}`,

      `https://icons.duckduckgo.com/ip3/${encodeURIComponent(hostname)}.ico`

    ].filter(Boolean))];

    let nextCandidate = 0;

    function tryNextIcon() {

      if (nextCandidate < candidates.length) {

        icon.src = candidates[nextCandidate++];

        return;

      }

      // A local, always-visible fallback when even the icon services fail.
      const initial = hostname.replace(/^www\./i, '').charAt(0).toUpperCase() || '?';

      const fallback = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="15" fill="#291638"/><text x="32" y="43" text-anchor="middle" font-family="Arial,sans-serif" font-size="35" font-weight="bold" fill="#ead6ff">${initial}</text></svg>`;

      icon.removeEventListener('error', tryNextIcon);

      icon.src = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(fallback)}`;

    }

    icon.addEventListener('error', tryNextIcon);

    tryNextIcon();

    return icon;

  }



  function removeSavedLink(id) {

    savedLinks = savedLinks.filter(link => link.id !== id);

    saveSavedLinks();

    renderSavedLinks();

  }



  function customizeSavedLinkIcon(link) {

    const enteredIcon = window.prompt('Custom icon URL (leave blank to use the site favicon):', link.icon || '');

    if (enteredIcon === null) return;

    if (enteredIcon.trim() && !getNavigationUrl(enteredIcon)) {

      window.alert('Enter a valid http(s) icon URL.');

      return;

    }

    link.icon = getNavigationUrl(enteredIcon) || '';

    saveSavedLinks();

    renderSavedLinks();

  }



  function renderSavedLinks() {

    savedLinksList.replaceChildren();

    savedLinksEmpty.hidden = savedLinks.length > 0 || savedLinksEditing;

    savedLinks.forEach(link => {

      const item = document.createElement('li');

      item.className = 'saved-link';



      if (!savedLinksEditing) {

        const anchor = document.createElement('a');

        anchor.className = 'saved-link-shortcut';

        anchor.href = link.url;

        anchor.title = link.url;

        anchor.append(createSavedLinkIcon(link));

        const name = document.createElement('span');

        name.className = 'saved-link-name';

        name.textContent = link.title || new URL(link.url).hostname;

        name.textContent = name.textContent+".exe";

        anchor.append(name);

        item.append(anchor);

      } else {

        const editor = document.createElement('div');

        editor.className = 'saved-link-editor';

        const iconButton = document.createElement('button');

        iconButton.type = 'button';

        iconButton.className = 'saved-link-icon-button';

        iconButton.title = 'Change icon';

        iconButton.setAttribute('aria-label', `Change icon for ${link.title || link.url}`);

        iconButton.append(createSavedLinkIcon(link));

        iconButton.addEventListener('click', () => customizeSavedLinkIcon(link));

        const titleInput = document.createElement('input');

        titleInput.type = 'text';

        titleInput.value = link.title;

        titleInput.placeholder = 'Link name';

        titleInput.setAttribute('aria-label', 'Link name');

        titleInput.addEventListener('input', () => {

          link.title = titleInput.value.trim();

          saveSavedLinks();

        });

        const urlInput = document.createElement('input');

        urlInput.type = 'url';

        urlInput.value = link.url;

        urlInput.placeholder = 'https://example.com';

        urlInput.setAttribute('aria-label', 'Link URL');

        urlInput.addEventListener('change', () => {

          const url = getNavigationUrl(urlInput.value);

          if (!url) {

            window.alert('Enter a valid http(s) URL.');

            urlInput.value = link.url;

            return;

          }

          link.url = url;

          saveSavedLinks();

        });

        const remove = document.createElement('button');

        remove.type = 'button';

        remove.className = 'saved-link-remove';

        remove.setAttribute('aria-label', `Remove ${link.title || link.url}`);

        remove.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';

        remove.addEventListener('click', () => removeSavedLink(link.id));

        editor.append(iconButton, titleInput, urlInput);

        item.append(editor, remove);

      }

      savedLinksList.append(item);

    });



    if (savedLinksEditing) {

      const item = document.createElement('li');

      item.className = 'saved-link';

      const add = document.createElement('button');

      add.type = 'button';

      add.className = 'saved-link-add';

      add.innerHTML = '<i class="fa-solid fa-plus" aria-hidden="true"></i><span>Add link</span>';

      add.addEventListener('click', addSavedLink);

      item.append(add);

      savedLinksList.append(item);

    }

  }



  function addSavedLink() {

    const title = window.prompt('Link name (optional):');

    if (title === null) return;

    const enteredUrl = window.prompt('Link URL:');

    if (enteredUrl === null) return;

    const url = getNavigationUrl(enteredUrl);

    if (!url) {

      window.alert('Enter a valid http(s) URL.');

      return;

    }

    savedLinks.push({ id: crypto.randomUUID(), title: title.trim() || new URL(url).hostname, url, icon: '' });

    saveSavedLinks();

    renderSavedLinks();

  }



  function addResultText(card, className, value) {

    if (!value) return;

    const element = document.createElement('p');

    element.className = className;

    element.textContent = value;

    card.append(element);

  }



  function truncateSnippet(value, maximumLength = 260) {

    if (typeof value !== 'string') return '';

    const normalized = value.replace(/\s+/g, ' ').trim();

    return normalized.length > maximumLength ? `${normalized.slice(0, maximumLength - 1).trimEnd()}…` : normalized;

  }



  function updateResultsStatus() {

    if (!currentResults.length) {

      resultsStatus.textContent = `No results for “${currentQuery}”.`;

      return;

    }

    resultsStatus.textContent = `Showing ${visibleResults} of ${currentResults.length} results for “${currentQuery}”.`;

  }



  function renderNextResults() {

    const nextResults = currentResults.slice(visibleResults, visibleResults + resultsPerBatch);

    const cards = nextResults.map(result => {

      const card = document.createElement('li');

      card.className = 'browser-result';

      const link = document.createElement('a');

      link.href = result.url;

      link.textContent = result.title || result.url;

      card.append(link);

      addResultText(card, 'browser-result-url', result.url);

      addResultText(card, 'browser-result-snippet', truncateSnippet(result.snippet));

      addResultText(card, 'browser-result-date', result.datePublished);

      return card;

    });

    resultsList.append(...cards);

    visibleResults += cards.length;

    updateResultsStatus();

    loadMoreButton.hidden = visibleResults >= currentResults.length;

  }



  function renderError(message) {

    resultsStatus.textContent = 'Search unavailable.';

    loadMoreButton.hidden = true;

    const card = document.createElement('li');

    card.className = 'browser-result browser-result-error';

    card.textContent = message;

    resultsList.replaceChildren(card);

  }



  function updateSearchUrl(query) {

    const url = new URL(window.location.href);

    url.searchParams.set('search', query);

    history.pushState(null, '', url);

  }



  async function search(query) {

    const searchId = ++activeSearch;

    const header = document.querySelector('header');

    const navigation = header?.querySelector('nav');

    if (header && navigation && searchForm.parentElement !== header) {

      header.insertBefore(searchForm, navigation);

    }

    document.body.classList.add('has-search-results');

    resultsStatus.textContent = 'Searching…';

    resultsList.replaceChildren();

    loadMoreButton.hidden = true;



    try {

      const response = await fetch('https://api.anrat.link/search', {

        method: 'POST',

        headers: { 'content-type': 'application/json' },

        body: JSON.stringify({ query })

      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error(payload.error || 'The search request failed.');

      if (searchId !== activeSearch) return;



      currentQuery = query;

      currentResults = Array.isArray(payload.results) ? payload.results : [];

      visibleResults = 0;

      renderNextResults();

    } catch (error) {

      if (searchId === activeSearch) renderError(error instanceof Error ? error.message : 'The search request failed.');

    }

  }



  async function submitQuery(query, { updateUrl = true } = {}) {

    if (!query) {

      searchInput?.focus();

      return;

    }



    const destination = getNavigationUrl(query);

    if (destination) {

      window.location.assign(destination);

      return;

    }

    if (browserSettings.searchProvider === 'google') {

      const googleUrl = new URL('https://www.google.com/search');

      googleUrl.searchParams.set('q', query);

      window.location.assign(googleUrl.href);

      return;

    }



    const submittedAt = Date.now();

    if (lastSearch.query === query && submittedAt - lastSearch.submittedAt <= doubleEnterDelay) {

      const googleUrl = new URL('https://www.google.com/search');

      googleUrl.searchParams.set('q', query);

      window.location.assign(googleUrl.href);

      return;

    }

    lastSearch = { query, submittedAt };

    if (updateUrl) updateSearchUrl(query);

    await search(query);

  }



  searchForm?.addEventListener('submit', async event => {

    event.preventDefault();

    const query = searchInput?.value.trim();

    await submitQuery(query);

  });

  aiButton?.addEventListener('click', () => {

    const prompt = searchInput?.value.trim();

    if (!prompt) {

      searchInput?.focus();

      return;

    }

    const url = new URL('https://chatgpt.com/');

    url.searchParams.set('prompt', prompt);

    url.searchParams.set('temporary-chat', 'true');

    window.open(url.href, '_blank', 'noopener,noreferrer');

  });



  loadMoreButton?.addEventListener('click', renderNextResults);

  bookmarkEdit?.addEventListener('click', () => {

    bookmarksEditing = !bookmarksEditing;

    bookmarksMenu?.classList.toggle('is-editing', bookmarksEditing);

    bookmarkEdit.setAttribute('aria-pressed', String(bookmarksEditing));

    bookmarkEdit.setAttribute('aria-label', bookmarksEditing ? 'Finish editing bookmarks' : 'Edit bookmarks');

    bookmarkEdit.title = bookmarksEditing ? 'Finish editing' : 'Edit bookmarks';

    renderBookmarks();

  });

  document.addEventListener('pointerdown', event => {

    if (bookmarksMenu?.open && !bookmarksMenu.contains(event.target)) {

      bookmarksMenu.open = false;

    }

  });

  function populateSettingsForm() {

    if (!browserName || !browserOpeningGreetings || !browserPromptGreetings) return;

    browserName.value = browserSettings.name;

    browserOpeningGreetings.value = browserSettings.openingGreetings.join('\n');

    browserPromptGreetings.value = browserSettings.promptGreetings.join('\n');

    if (browserGreetingInterval) browserGreetingInterval.value = String(browserSettings.greetingInterval);

    if (browserResultsPerBatch) browserResultsPerBatch.value = String(browserSettings.resultsPerBatch);

    if (browserAnimateGreetings) browserAnimateGreetings.checked = browserSettings.animateGreetings;

    if (browserShowSplash) browserShowSplash.checked = browserSettings.showSplash;

    if (browserShowConsole) browserShowConsole.checked = browserSettings.showConsole;

    if (browserMizukiMode) browserMizukiMode.value = browserSettings.mizukiMode;

    if (browserSearchProvider) browserSearchProvider.value = browserSettings.searchProvider;

  }

  browserSettingsButton?.addEventListener('click', () => {

    populateSettingsForm();

    googleMenu?.removeAttribute('open');

    browserSettingsDialog?.showModal();

  });

  browserSettingsClose?.addEventListener('click', () => browserSettingsDialog?.close());

  browserSettingsReset?.addEventListener('click', () => {

    if (browserName) browserName.value = 'Aqua';

    if (browserOpeningGreetings) browserOpeningGreetings.value = '';

    if (browserPromptGreetings) browserPromptGreetings.value = '';

    if (browserGreetingInterval) browserGreetingInterval.value = '60';

    if (browserResultsPerBatch) browserResultsPerBatch.value = '8';

    if (browserAnimateGreetings) browserAnimateGreetings.checked = true;

    if (browserShowSplash) browserShowSplash.checked = true;

    if (browserShowConsole) browserShowConsole.checked = true;

    if (browserMizukiMode) browserMizukiMode.value = 'day';

    if (browserSearchProvider) browserSearchProvider.value = 'custom';

  });

  browserSettingsForm?.addEventListener('submit', event => {

    event.preventDefault();

    const previousMizukiMode = browserSettings.mizukiMode;

    browserSettings = {
      name: browserName?.value.trim().slice(0, 50) || 'Aqua',
      openingGreetings: greetingLines(browserOpeningGreetings?.value || ''),
      promptGreetings: greetingLines(browserPromptGreetings?.value || ''),
      greetingInterval: boundedNumber(browserGreetingInterval?.value, 60, 10, 3600),
      resultsPerBatch: boundedNumber(browserResultsPerBatch?.value, 8, 1, 50),
      animateGreetings: browserAnimateGreetings?.checked !== false,
      showSplash: browserShowSplash?.checked !== false,
      showConsole: browserShowConsole?.checked !== false,
      mizukiMode: ['day', 'always', 'never'].includes(browserMizukiMode?.value) ? browserMizukiMode.value : 'day',
      searchProvider: browserSearchProvider?.value === 'google' ? 'google' : 'custom'
    };

    saveBrowserSettings();

    applyBrowserSettings();

    browserSettingsDialog?.close();

    if (previousMizukiMode !== browserSettings.mizukiMode) {

      window.location.reload();

      return;

    }

    refreshGreeting();

  });

  savedLinksEdit?.addEventListener('click', () => {

    savedLinksEditing = !savedLinksEditing;

    savedLinksSection?.classList.toggle('is-editing', savedLinksEditing);

    savedLinksEdit.setAttribute('aria-pressed', String(savedLinksEditing));

    savedLinksEdit.setAttribute('aria-label', savedLinksEditing ? 'Finish editing saved links' : 'Edit saved links');

    savedLinksEdit.title = savedLinksEditing ? 'Finish editing' : 'Edit saved links';

    renderSavedLinks();

  });

  loadBookmarks();

  renderBookmarks();

  loadSavedLinks();

  renderSavedLinks();



  const initialSearch = new URLSearchParams(window.location.search).get('search')?.trim();

  if (initialSearch) {

    searchInput.value = initialSearch;

    submitQuery(initialSearch, { updateUrl: false });

  }

})();
