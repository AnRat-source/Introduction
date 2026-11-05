(() => {
  const greeting = document.getElementById('browserGreeting');
  const searchForm = document.querySelector('.browser-search');
  const searchInput = document.getElementById('googleSearch');
  const resultsStatus = document.getElementById('browserResultsStatus');
  const resultsList = document.getElementById('browserResults');
  const loadMoreButton = document.getElementById('browserLoadMore');
  const doubleEnterDelay = 550;
  const resultsPerBatch = 8;
  let lastSearch = { query: '', submittedAt: 0 };
  let activeSearch = 0;
  let currentQuery = '';
  let currentResults = [];
  let visibleResults = 0;

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

  const initialSearch = new URLSearchParams(window.location.search).get('search')?.trim();
  if (initialSearch) {
    searchInput.value = initialSearch;
    submitQuery(initialSearch, { updateUrl: false });
  }
})();
