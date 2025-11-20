const express = require('express');
const app = express();
const port = process.env.MOCK_SERVER_PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock data storage
let mockPosts = new Map();

// Dev.to API mocks
app.post('/devto/api/articles', (req, res) => {
  const article = req.body.article;
  const mockResponse = {
    id: Math.floor(Math.random() * 1000000),
    title: article.title,
    description: article.description,
    readable_publish_date: new Date().toLocaleDateString(),
    slug: article.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    path: `/article/${article.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    url: `https://dev.to/mock/${article.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    comments_count: 0,
    public_reactions_count: 0,
    published_timestamp: new Date().toISOString(),
    published_at: new Date().toISOString(),
    body_html: `<p>${article.body_markdown}</p>`,
    body_markdown: article.body_markdown,
    tag_list: article.tags
  };

  console.log('Mock Dev.to: Created article', mockResponse.title);
  res.json(mockResponse);
});

app.put('/devto/api/articles/:id', (req, res) => {
  const article = req.body.article;
  const mockResponse = {
    id: parseInt(req.params.id),
    title: article.title,
    description: article.description,
    url: `https://dev.to/mock/${article.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    published_at: new Date().toISOString(),
    body_html: `<p>${article.body_markdown}</p>`,
    body_markdown: article.body_markdown,
    tag_list: article.tags
  };

  console.log('Mock Dev.to: Updated article', req.params.id);
  res.json(mockResponse);
});

// Hashnode API mocks
app.post('/hashnode', (req, res) => {
  const { query, variables } = req.body;
  const mockResponse = {
    data: {
      createPublicationStory: {
        post: {
          _id: `hashnode_${Math.floor(Math.random() * 1000000)}`,
          slug: variables.input.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          url: `https://mock.hashnode.dev/${variables.input.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
        }
      }
    }
  };

  console.log('Mock Hashnode: Created post', variables.input.title);
  res.json(mockResponse);
});

// Medium API mocks
app.get('/medium/v1/me', (req, res) => {
  const mockResponse = {
    data: {
      id: 'mock_medium_user',
      username: 'mockuser',
      name: 'Mock User',
      url: 'https://medium.com/@mockuser',
      imageUrl: 'https://via.placeholder.com/150'
    }
  };

  console.log('Mock Medium: User info requested');
  res.json(mockResponse);
});

app.post('/medium/v1/users/:userId/posts', (req, res) => {
  const mockResponse = {
    data: {
      id: `medium_${Math.floor(Math.random() * 1000000)}`,
      title: req.body.title,
      authorId: req.params.userId,
      url: `https://medium.com/mock/${req.body.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      publishStatus: 'public',
      publishedAt: Date.now(),
      license: 'all-rights-reserved',
      licenseUrl: 'https://medium.com/policy/9db0094a1e0f'
    }
  };

  console.log('Mock Medium: Created post', req.body.title);
  res.json(mockResponse);
});

// WordPress API mocks
app.post('/wp-json/wp/v2/posts', (req, res) => {
  const mockResponse = {
    id: Math.floor(Math.random() * 1000000),
    date: new Date().toISOString(),
    date_gmt: new Date().toISOString(),
    guid: { rendered: `https://mock.wordpress.com/?p=${Math.floor(Math.random() * 1000000)}` },
    modified: new Date().toISOString(),
    modified_gmt: new Date().toISOString(),
    slug: req.body.slug,
    status: 'publish',
    type: 'post',
    link: `https://mock.wordpress.com/${req.body.slug}/`,
    title: { rendered: req.body.title },
    content: { rendered: req.body.content, protected: false },
    excerpt: { rendered: req.body.excerpt, protected: false },
    author: 1,
    featured_media: 0,
    comment_status: 'open',
    ping_status: 'open',
    sticky: false,
    template: '',
    format: 'standard',
    meta: [],
    categories: [1],
    tags: req.body.tags || []
  };

  console.log('Mock WordPress: Created post', req.body.title);
  res.json(mockResponse);
});

app.put('/wp-json/wp/v2/posts/:id', (req, res) => {
  const mockResponse = {
    id: parseInt(req.params.id),
    modified: new Date().toISOString(),
    modified_gmt: new Date().toISOString(),
    link: `https://mock.wordpress.com/mock-slug/`,
    title: { rendered: req.body.title },
    content: { rendered: req.body.content, protected: false },
    excerpt: { rendered: req.body.excerpt, protected: false },
    tags: req.body.tags || []
  };

  console.log('Mock WordPress: Updated post', req.params.id);
  res.json(mockResponse);
});

// Ghost API mocks
app.post('/ghost/api/admin/posts/', (req, res) => {
  const mockResponse = {
    posts: [{
      id: `ghost_${Math.floor(Math.random() * 1000000)}`,
      uuid: `uuid_${Math.floor(Math.random() * 1000000)}`,
      title: req.body.posts[0].title,
      slug: req.body.posts[0].title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      html: req.body.posts[0].html,
      comment_id: `comment_${Math.floor(Math.random() * 1000000)}`,
      feature_image: null,
      featured: false,
      status: 'published',
      visibility: 'public',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      published_at: new Date().toISOString(),
      url: `https://mock.ghost.org/${req.body.posts[0].title.toLowerCase().replace(/[^a-z0-9]/g, '-')}/`
    }]
  };

  console.log('Mock Ghost: Created post', req.body.posts[0].title);
  res.json(mockResponse);
});

// Blogger API mocks
app.post('/blogger/v3/blogs/:blogId/posts', (req, res) => {
  const mockResponse = {
    kind: 'blogger#post',
    id: `blogger_${Math.floor(Math.random() * 1000000)}`,
    blog: { id: req.params.blogId },
    published: new Date().toISOString(),
    updated: new Date().toISOString(),
    url: `https://mock.blogspot.com/${req.body.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.html`,
    selfLink: `https://www.googleapis.com/blogger/v3/blogs/${req.params.blogId}/posts/blogger_${Math.floor(Math.random() * 1000000)}`,
    title: req.body.title,
    content: req.body.content,
    author: {
      id: 'mock_author',
      displayName: 'Mock Author'
    },
    replies: { totalItems: '0', selfLink: '' },
    labels: req.body.labels || []
  };

  console.log('Mock Blogger: Created post', req.body.title);
  res.json(mockResponse);
});

// Tumblr API mocks
app.post('/tumblr/v2/blog/:blogIdentifier/post', (req, res) => {
  const mockResponse = {
    meta: { status: 201, msg: 'Created' },
    response: {
      id: Math.floor(Math.random() * 1000000000),
      url: `https://mock.tumblr.com/post/${Math.floor(Math.random() * 1000000000)}`
    }
  };

  console.log('Mock Tumblr: Created post');
  res.json(mockResponse);
});

// Wix API mocks
app.post('/wixapis/blog/v3/sites/:siteId/posts', (req, res) => {
  const mockResponse = {
    post: {
      id: `wix_${Math.floor(Math.random() * 1000000)}`,
      title: req.body.title,
      excerpt: req.body.excerpt,
      content: req.body.content,
      slug: req.body.slug,
      published: true,
      publishedDate: new Date().toISOString(),
      lastPublishedDate: new Date().toISOString(),
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      tags: req.body.tags,
      categoryIds: [],
      url: `https://mock.wixsite.com/mysite/${req.body.slug}`
    }
  };

  console.log('Mock Wix: Created post', req.body.title);
  res.json(mockResponse);
});

// Error simulation endpoints
app.post('/error/timeout', (req, res) => {
  // Simulate timeout
  setTimeout(() => {
    res.status(408).json({ error: 'Request timeout' });
  }, 5000);
});

app.post('/error/rate-limit', (req, res) => {
  res.status(429).json({
    error: 'Rate limit exceeded',
    retry_after: 60
  });
});

app.post('/error/auth', (req, res) => {
  res.status(401).json({
    error: 'Authentication failed'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    endpoints: [
      'devto', 'hashnode', 'medium', 'wordpress',
      'ghost', 'blogger', 'tumblr', 'wix'
    ]
  });
});

app.listen(port, () => {
  console.log(`Mock server running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
  console.log('Available endpoints:');
  console.log('- Dev.to: POST /devto/api/articles');
  console.log('- Hashnode: POST /hashnode');
  console.log('- Medium: GET /medium/v1/me, POST /medium/v1/users/:userId/posts');
  console.log('- WordPress: POST /wp-json/wp/v2/posts');
  console.log('- Ghost: POST /ghost/api/admin/posts/');
  console.log('- Blogger: POST /blogger/v3/blogs/:blogId/posts');
  console.log('- Tumblr: POST /tumblr/v2/blog/:blogIdentifier/post');
  console.log('- Wix: POST /wixapis/blog/v3/sites/:siteId/posts');
});