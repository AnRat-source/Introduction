import { writeFile } from 'node:fs/promises';

const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;

if (!token || !repository) {
  throw new Error('GITHUB_TOKEN and GITHUB_REPOSITORY are required to sync blog posts.');
}

const [owner, name] = repository.split('/');
const query = `query BlogPosts($owner: String!, $name: String!, $categoryId: ID!) {
  repository(owner: $owner, name: $name) {
    discussions(first: 100, categoryId: $categoryId, orderBy: {field: CREATED_AT, direction: DESC}) {
      nodes {
        number
        title
        body
        bodyText
        url
        createdAt
        updatedAt
        author { login }
      }
    }
  }
}`;

const response = await fetch('https://api.github.com/graphql', {
  method: 'POST',
  headers: {
    authorization: `Bearer ${token}`,
    'content-type': 'application/json',
    'user-agent': 'anrat-blog-sync'
  },
  body: JSON.stringify({
    query,
    variables: { owner, name, categoryId: 'DIC_kwDOQU7EBs4DKMet' }
  })
});

const result = await response.json();
if (!response.ok || result.errors) {
  throw new Error(result.errors?.map(error => error.message).join('; ') || `GitHub API responded with ${response.status}.`);
}

const posts = result.data.repository.discussions.nodes
  .filter(post => post.author?.login !== 'giscus[bot]')
  .map(post => ({
    number: post.number,
    title: post.title,
    body: post.body.trim(),
    excerpt: post.bodyText.trim().slice(0, 320),
    url: post.url,
    author: post.author?.login || 'AnRat',
    createdAt: post.createdAt,
    updatedAt: post.updatedAt
  }));

await writeFile('blog-posts.json', `${JSON.stringify({ generatedAt: new Date().toISOString(), posts }, null, 2)}\n`);
