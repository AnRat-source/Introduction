(() => {
  const greeting = document.getElementById('browserGreeting');
  const searchForm = document.querySelector('.browser-search');
  const searchInput = document.getElementById('googleSearch');
  const resultsStatus = document.getElementById('browserResultsStatus');
  const resultsList = document.getElementById('browserResults');
  const loadMoreButton = document.getElementById('browserLoadMore');
  const savedLinksList = document.getElementById('savedLinksList');
  const savedLinksEmpty = document.getElementById('savedLinksEmpty');
  const savedLinksEdit = document.getElementById('savedLinksEdit');
  const savedLinksSection = document.querySelector('.saved-links');
  const doubleEnterDelay = 550;
  const resultsPerBatch = 8;
  const savedLinksStorageKey = 'anrat-browser-saved-links';
  let lastSearch = { query: '', submittedAt: 0 };
  let activeSearch = 0;
  let currentQuery = '';
  let currentResults = [];
  let visibleResults = 0;
  let savedLinks = [];
  let savedLinksEditing = false;

  if (greeting) {
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening';
    greeting.textContent = `Good ${timeOfDay}, Aqua`;
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
      return new URL('/favicon.ico', url).href;
    } catch {
      return '';
    }
  }

  function createSavedLinkIcon(link) {
    const icon = document.createElement('img');
    icon.className = 'saved-link-icon';
    icon.src = link.icon || getFaviconUrl(link.url);
    icon.alt = '';
    icon.addEventListener('error', () => { icon.style.visibility = 'hidden'; }, { once: true });
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
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        anchor.title = link.url;
        anchor.append(createSavedLinkIcon(link));
        const name = document.createElement('span');
        name.className = 'saved-link-name';
        name.textContent = link.title || new URL(link.url).hostname;
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

  loadMoreButton?.addEventListener('click', renderNextResults);
  savedLinksEdit?.addEventListener('click', () => {
    savedLinksEditing = !savedLinksEditing;
    savedLinksSection?.classList.toggle('is-editing', savedLinksEditing);
    savedLinksEdit.setAttribute('aria-pressed', String(savedLinksEditing));
    savedLinksEdit.setAttribute('aria-label', savedLinksEditing ? 'Finish editing saved links' : 'Edit saved links');
    savedLinksEdit.title = savedLinksEditing ? 'Finish editing' : 'Edit saved links';
    renderSavedLinks();
  });
  loadSavedLinks();
  renderSavedLinks();

  const initialSearch = new URLSearchParams(window.location.search).get('search')?.trim();
  if (initialSearch) {
    searchInput.value = initialSearch;
    submitQuery(initialSearch, { updateUrl: false });
  }
})();
