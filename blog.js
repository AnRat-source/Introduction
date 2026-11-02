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
  const postView = document.getElementById('blogPostView');
  const postClose = document.getElementById('blogPostClose');
  const postTitle = document.getElementById('blogPostTitle');
  const postMeta = document.getElementById('blogPostMeta');
  const postBody = document.getElementById('blogPostBody');
  const postSource = document.getElementById('blogPostSource');
  const postComments = document.getElementById('blogPostComments');
  const formatDate = value => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value));
  let syncedPosts = [];

  function setPostAddress(number, replace = false) {
    const address = new URL(window.location.href);
    if (number === null) address.searchParams.delete('post');
    else address.searchParams.set('post', String(number));
    history[replace ? 'replaceState' : 'pushState'](null, '', address);
  }

  function closePost({ updateAddress = true } = {}) {
    if (!postView) return;
    postView.hidden = true;
    document.body.classList.remove('post-view-open');
    postComments?.replaceChildren();
    if (updateAddress && new URL(window.location.href).searchParams.has('post')) setPostAddress(null, true);
  }

  function appendTextBody(text) {
    if (!text.trim()) return;
    text.trim().split(/\r?\n\s*\r?\n/).forEach(paragraphText => {
      const paragraph = document.createElement('p');
      paragraph.className = 'blog-reader-paragraph';
      paragraph.textContent = paragraphText.trim();
      postBody.append(paragraph);
    });
  }

  async function renderGitHubDiscussion(url, container) {
    const match = url.match(
      /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/discussions\/(\d+)\/?$/
    );

    if (!match) return;

    const [, owner, repo, number] = match;

    container.className = 'blog-github-discussion';
    container.textContent = 'Loading GitHub discussion...';

    try {
      const apiUrl =
        `https://api.github.com/repos/${owner}/${repo}/discussions/${number}`;

      const response = await fetch(apiUrl, {
        headers: {
          Accept: 'application/vnd.github+json'
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API returned ${response.status}`);
      }

      const discussion = await response.json();

      const title = document.createElement('h3');
      title.textContent = discussion.title;

      const meta = document.createElement('div');
      meta.className = 'blog-discussion-meta';
      meta.textContent =
        `${discussion.user?.login || 'Unknown'} · ` +
        new Date(discussion.created_at).toLocaleDateString();

      const body = document.createElement('div');
      body.className = 'blog-discussion-body';

      // Plain text prevents untrusted HTML injection.
      body.textContent = discussion.body || '';

      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'View discussion on GitHub ↗';

      container.replaceChildren(title, meta, body, link);
    } catch (error) {
      container.replaceChildren();

      const message = document.createElement('p');
      message.textContent = 'Could not load this GitHub discussion.';

      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Open on GitHub ↗';

      container.append(message, link);
      console.error('GitHub discussion embed:', error);
    }
  }


  function renderPostBody(markdown) {
    postBody.replaceChildren();
    const codeBlock = /```([^\r\n`]*)\r?\n([\s\S]*?)```/g;
    let cursor = 0;
    let match;
    while ((match = codeBlock.exec(markdown))) {
      appendTextBody(markdown.slice(cursor, match.index));
      const language = match[1].trim().toLowerCase();
      const content = match[2].replace(/\r?\n$/, '');

      const discussionMatch = content.trim().match(
        /^@?(https:\/\/github\.com\/[^/\s]+\/[^/\s]+\/discussions\/\d+\/?)$/
      );

      if (discussionMatch) {
        const container = document.createElement('div');
        postBody.append(container);

        renderGitHubDiscussion(discussionMatch[1], container);

        cursor = codeBlock.lastIndex;
        continue;
      }

      const isHtmlEmbed = language === 'html' || /<\/?[a-z][\s\S]*>/i.test(content);
      
      if (isHtmlEmbed) {
        const frame = document.createElement('iframe');
        frame.className = 'blog-reader-html';
        frame.title = 'Embedded HTML from this blog post';
        frame.sandbox = 'allow-scripts';
        frame.setAttribute('scrolling', 'no');

        frame.style.cssText = `
          display: block;
          width: 100%;
          height: 1px;
          min-height: 0;
          border: none;
          background: transparent;
          overflow: hidden;
          box-sizing: border-box;
        `;

        const frameId = crypto.randomUUID();
        frame.dataset.embedId = frameId;

        const resizeScript = `
          <script>
            (() => {
              const id = ${JSON.stringify(frameId)};

              document.documentElement.style.background = 'transparent';
              document.body.style.background = 'transparent';

              document.documentElement.style.overflow = 'hidden';
              document.body.style.overflow = 'hidden';

              function updateHeight() {
                const height = Math.ceil(Math.max(
                  document.body.scrollHeight,
                  document.body.offsetHeight,
                  document.documentElement.scrollHeight,
                  document.documentElement.offsetHeight
                ));

                parent.postMessage({
                  type: 'blog-embed-resize',
                  id,
                  height
                }, '*');
              }

              new ResizeObserver(updateHeight).observe(document.body);

              window.addEventListener('load', updateHeight);
              window.addEventListener('resize', updateHeight);

              document.fonts?.ready.then(updateHeight);

              requestAnimationFrame(updateHeight);
            })();
          <\/script>
        `;

        frame.srcdoc = `
          <style>
            html, body {
              background: transparent !important;
              margin: 0;
              padding: 0;
            }
            html {
              color-scheme: normal;
            }
          </style>
          ${content}
          ${resizeScript}
        `;

        postBody.append(frame);
        cursor = codeBlock.lastIndex;
        continue;
      }

      const pre = document.createElement('pre');
      pre.className = 'blog-reader-code';
      const code = document.createElement('code');
      code.textContent = content;
      if (language) code.dataset.language = language;
      pre.append(code);
      postBody.append(pre);
      cursor = codeBlock.lastIndex;
    }
    appendTextBody(markdown.slice(cursor));
    if (!postBody.childElementCount) appendTextBody('Open this post on GitHub to read more.');
  }

  window.addEventListener('message', event => {
    const data = event.data;

    if (!data || data.type !== 'blog-embed-resize') return;

    const frame = [...document.querySelectorAll('.blog-reader-html')]
      .find(f =>
        f.contentWindow === event.source &&
        f.dataset.embedId === data.id
      );

    if (!frame) return;

    const height = Number(data.height);

    if (!Number.isFinite(height) || height < 0) return;

    frame.style.height = `${Math.ceil(height)}px`;
  });

  function loadPostComments(post) {
    if (!postComments) return;
    postComments.replaceChildren();
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    const config = {
      repo: 'AnRat-source/Introduction',
      'repo-id': 'R_kgDOQU7EBg',
      category: 'Blog',
      'category-id': 'DIC_kwDOQU7EBs4DKMet',
      mapping: 'number',
      term: String(post.number),
      strict: '0',
      'reactions-enabled': '1',
      'emit-metadata': '0',
      'input-position': 'bottom',
      theme: 'preferred_color_scheme',
      lang: 'en'
    };
    Object.entries(config).forEach(([name, value]) => script.dataset[name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = value);
    postComments.append(script);
  }

  function openPost(post, { updateAddress = true } = {}) {
    if (!postView) return;
    postTitle.textContent = post.title;
    postMeta.textContent = `${post.author || 'AnRat'} · ${formatDate(post.createdAt)}`;
    renderPostBody(post.body || post.excerpt || 'Open this post on GitHub to read more.');
    postSource.href = post.url;
    postView.hidden = false;
    document.body.classList.add('post-view-open');
    loadPostComments(post);
    if (updateAddress && new URL(window.location.href).searchParams.get('post') !== String(post.number)) setPostAddress(post.number);
    postClose?.focus();
  }

  postClose?.addEventListener('click', closePost);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !postView?.hidden) closePost();
  });

  function syncPostFromAddress() {
    const requestedNumber = new URL(window.location.href).searchParams.get('post');
    const requestedPost = syncedPosts.find(post => String(post.number) === requestedNumber);
    if (requestedPost) openPost(requestedPost, { updateAddress: false });
    else closePost({ updateAddress: false });
  }

  window.addEventListener('popstate', syncPostFromAddress);

  if (blogPostList) {
    const makePost = post => {
      const article = document.createElement('article');
      article.className = 'blog-post';
      const title = document.createElement('button');
      title.className = 'blog-post-title';
      title.type = 'button';
      title.textContent = post.title;
      title.addEventListener('click', () => openPost(post));
      article.addEventListener('click', event => {
        if (event.target !== title) openPost(post);
      });
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
        syncedPosts = posts;
        blogPostList.replaceChildren();
        if (!posts.length) {
          const message = document.createElement('p');
          message.className = 'blog-feed-message';
          message.textContent = 'No published blog posts yet.';
          blogPostList.append(message);
          syncPostFromAddress();
          return;
        }
        posts.forEach(post => blogPostList.append(makePost(post)));
        syncPostFromAddress();
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
