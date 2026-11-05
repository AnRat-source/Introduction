(() => {
  const greeting = document.getElementById('browserGreeting');
  const searchForm = document.querySelector('.browser-search');
  const searchInput = document.getElementById('googleSearch');
  const doubleEnterDelay = 550;
  let lastSearch = { query: '', submittedAt: 0 };

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

  if (greeting) {
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening';
    greeting.textContent = `Good ${timeOfDay}, Aqua`;
  }

  searchForm?.addEventListener('submit', event => {
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

    const searchUrl = new URL('browser/results.html', document.baseURI);
    searchUrl.searchParams.set('q', query);
    document.dispatchEvent(new CustomEvent('explorer:open-preview', {
      detail: {
        source: searchUrl.href,
        title: `Search: ${query}`,
        options: { urlEditable: false }
      }
    }));
  });
})();
