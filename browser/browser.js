(() => {
  const greeting = document.getElementById('browserGreeting');
  const searchForm = document.querySelector('.browser-search');
  const searchInput = document.getElementById('googleSearch');
  const resultsStatus = document.getElementById('browserResultsStatus');
  const resultsList = document.getElementById('browserResults');
  const doubleEnterDelay = 550;
  let lastSearch = { query: '', submittedAt: 0 };
  let activeSearch = 0;

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

  function renderError(message) {
    resultsStatus.textContent = 'Search unavailable.';
    const card = document.createElement('li');
    card.className = 'browser-result browser-result-error';
    card.textContent = message;
    resultsList.replaceChildren(card);
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

    try {
      const response = await fetch('https://api.anrat.link/search', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'The search request failed.');
      if (searchId !== activeSearch) return;

      const entries = Array.isArray(payload.results) ? payload.results : [];
      resultsStatus.textContent = entries.length
        ? `${entries.length} result${entries.length === 1 ? '' : 's'} for “${query}”.`
        : `No results for “${query}”.`;
      const cards = entries.map(result => {
        const card = document.createElement('li');
        card.className = 'browser-result';
        const link = document.createElement('a');
        link.href = result.url;
        link.textContent = result.title || result.url;
        card.append(link);
        addResultText(card, 'browser-result-url', result.url);
        addResultText(card, 'browser-result-snippet', result.snippet);
        addResultText(card, 'browser-result-date', result.datePublished);
        return card;
      });
      resultsList.replaceChildren(...cards);
    } catch (error) {
      if (searchId === activeSearch) renderError(error instanceof Error ? error.message : 'The search request failed.');
    }
  }

  searchForm?.addEventListener('submit', async event => {
    event.preventDefault();
    const query = searchInput?.value.trim();
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
    await search(query);
  });
})();
