(() => {
  const clearTransitionState = () => {
    document.body.classList.remove('page-enter', 'page-transitioning');
  };
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(clearTransitionState);
  });
  // A page restored from Back/Forward cache retains its old class list.
  window.addEventListener('pageshow', clearTransitionState);

  const header = document.querySelector('.blog-page header');
  const wrap = document.querySelector('.blog-page .wrap');
  if (header && wrap) {
    const spacer = document.createElement('div');
    spacer.className = 'header-spacer';
    header.before(spacer);
    let headerStart = header.getBoundingClientRect().top + window.scrollY;
    const mobile = window.matchMedia('(max-width: 620px)');

    function syncHeader() {
      if (mobile.matches) {
        header.classList.remove('is-floating');
        spacer.style.height = '0';
        headerStart = header.getBoundingClientRect().top + window.scrollY;
        return;
      }
      const shouldFloat = window.scrollY > headerStart - 12;
      if (shouldFloat && !header.classList.contains('is-floating')) {
        spacer.style.height = `${header.offsetHeight + 22}px`;
        header.classList.add('is-floating');
      } else if (!shouldFloat && header.classList.contains('is-floating')) {
        header.classList.remove('is-floating');
        spacer.style.height = '0';
        headerStart = header.getBoundingClientRect().top + window.scrollY;
      }
      const rect = wrap.getBoundingClientRect();
      header.style.setProperty('--floating-header-left', `${rect.left}px`);
      header.style.setProperty('--floating-header-width', `${rect.width}px`);
    }

    window.addEventListener('scroll', syncHeader, { passive: true });
    window.addEventListener('resize', syncHeader);
    mobile.addEventListener('change', syncHeader);
    syncHeader();
  }

  document.querySelectorAll('[data-current-year]').forEach(node => {
    node.textContent = new Date().getFullYear();
  });

  const blogPostList = document.getElementById('blogPostList');
  if (blogPostList) {
    const formatDate = value => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value));
    const makePost = post => {
      const article = document.createElement('article');
      article.className = 'blog-post';
      const title = document.createElement('a');
      title.className = 'blog-post-title';
      title.href = post.url;
      title.target = '_blank';
      title.rel = 'noreferrer';
      title.textContent = post.title;
      const meta = document.createElement('span');
      meta.className = 'blog-post-meta';
      meta.textContent = `${post.author || 'AnRat'} · ${formatDate(post.createdAt)}`;
      const excerpt = document.createElement('p');
      excerpt.className = 'blog-post-excerpt';
      excerpt.textContent = post.excerpt || 'Open this post on GitHub to read more.';
      article.append(title, meta, excerpt);
      return article;
    };

    fetch(`blog-posts.json?updated=${Date.now()}`, { cache: 'no-store' })
      .then(response => response.ok ? response.json() : Promise.reject(new Error('No blog feed yet.')))
      .then(feed => {
        const posts = Array.isArray(feed.posts) ? feed.posts : [];
        blogPostList.replaceChildren();
        if (!posts.length) {
          const message = document.createElement('p');
          message.className = 'blog-feed-message';
          message.textContent = 'No published blog posts yet.';
          blogPostList.append(message);
          return;
        }
        posts.forEach(post => blogPostList.append(makePost(post)));
      })
      .catch(() => {
        blogPostList.textContent = 'Posts will appear here after the GitHub sync runs.';
        blogPostList.classList.add('blog-feed-message');
      });
  }

  document.querySelectorAll('a[data-page-transition]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const destination = link.href;
      event.preventDefault();
      document.body.classList.add('page-transitioning');
      window.setTimeout(() => { window.location.href = destination; }, 300);
    });
  });
})();
