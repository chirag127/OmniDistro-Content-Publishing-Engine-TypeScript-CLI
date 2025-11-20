# Omni-Publisher Content Ecosystem

A comprehensive content publishing platform that automatically distributes blog posts across multiple platforms including Dev.to, Hashnode, Medium, WordPress, Ghost, Blogger, Tumblr, and Wix. Built with TypeScript and designed for content creators who want to maximize their reach.

## 🚀 Features

- **Multi-Platform Publishing**: Publish to 8+ platforms simultaneously
- **Static Site Generation**: Beautiful, responsive website with your content
- **GitHub Integration**: Automated publishing via GitHub Actions
- **Content Management**: Markdown-based content with frontmatter support
- **Idempotent Publishing**: Smart tracking prevents duplicate posts
- **Mock Testing**: Complete test suite with mock APIs
- **Community Submissions**: GitHub Issues integration for content submissions

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Local Development](#local-development)
- [Configuration](#configuration)
- [Publishing Platforms](#publishing-platforms)
- [Content Creation](#content-creation)
- [GitHub Actions](#github-actions)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Security](#security)
- [Contributing](#contributing)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ ([install via nvm](https://github.com/nvm-sh/nvm))
- GitHub account with repository access

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/omni-publisher-content-ecosystem.git
   cd omni-publisher-content-ecosystem
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

4. **Build and test**
   ```bash
   npm run build
   npm test
   ```

5. **Generate your site**
   ```bash
   npm run build-site
   ```

## 💻 Local Development

### Development Workflow

1. **Start development mode**
   ```bash
   npm run dev
   ```

2. **Test with mock APIs**
   ```bash
   npm run mock-server
   # In another terminal:
   npm run publish -- --mock --dry-run
   ```

3. **Build for production**
   ```bash
   npm run build
   npm run publish -- --dry-run
   ```

### Project Structure

```
├── .github/workflows/     # GitHub Actions
├── config/               # Configuration files
├── content/posts/        # Markdown blog posts
├── public/               # Generated static site
├── scripts/              # Utility scripts
├── src/
│   ├── adapters/         # Platform-specific publishers
│   ├── utils/           # Shared utilities
│   ├── build-site.ts    # Static site generator
│   └── publish.ts       # Main publisher CLI
├── .env.example         # Environment template
├── .postmap.json        # Publication tracking
└── package.json         # Dependencies and scripts
```

## ⚙️ Configuration

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Dev.to API Key
DEVTO_API_KEY=your_devto_api_key_here

# Hashnode Personal Access Token
HASHNODE_TOKEN=your_hashnode_token_here

# Medium Integration Token
MEDIUM_INTEGRATION_TOKEN=your_medium_integration_token_here

# WordPress.com Access Token and Site
WP_ACCESS_TOKEN=your_wordpress_access_token_here
WP_SITE=your_wordpress_site_url_here

# Ghost Admin API
GHOST_ADMIN_API_KEY=your_ghost_admin_api_key_here
GHOST_ADMIN_URL=your_ghost_admin_url_here

# Google Blogger
BLOGGER_OAUTH_TOKEN=your_blogger_oauth_token_here
BLOGGER_BLOG_ID=your_blogger_blog_id_here

# Tumblr OAuth
TUMBLR_CONSUMER_KEY=your_tumblr_consumer_key_here
TUMBLR_CONSUMER_SECRET=your_tumblr_consumer_secret_here
TUMBLR_TOKEN=your_tumblr_token_here
TUMBLR_TOKEN_SECRET=your_tumblr_token_secret_here
TUMBLR_BLOG_IDENTIFIER=your_tumblr_blog_identifier_here

# Wix API
WIX_API_TOKEN=your_wix_api_token_here
WIX_SITE_ID=your_wix_site_id_here

# Mock Server (for testing)
MOCK_SERVER_URL=http://localhost:3001

# Publishing Configuration
PUBLISH_CONCURRENCY=3
```

### Getting API Credentials

#### Dev.to
1. Go to [Dev.to Settings](https://dev.to/settings/account)
2. Generate an API key
3. Add to `DEVTO_API_KEY`

#### Hashnode
1. Visit [Hashnode Developer Settings](https://hashnode.com/settings/developer)
2. Create a Personal Access Token
3. Add to `HASHNODE_TOKEN`

#### Medium
1. Access [Medium Settings](https://medium.com/me/settings)
2. Generate an Integration Token
3. Add to `MEDIUM_INTEGRATION_TOKEN`

#### WordPress.com
1. Visit [WordPress Apps](https://developer.wordpress.com/apps/)
2. Create an application
3. Generate access token
4. Set `WP_ACCESS_TOKEN` and `WP_SITE`

#### Ghost
1. Go to Ghost Admin > Settings > Integrations
2. Generate Admin API Key
3. Set `GHOST_ADMIN_API_KEY` and `GHOST_ADMIN_URL`

#### Blogger
1. Visit [Google Developer Console](https://console.developers.google.com/)
2. Create OAuth credentials
3. Set `BLOGGER_OAUTH_TOKEN` and `BLOGGER_BLOG_ID`

#### Tumblr
1. Go to [Tumblr OAuth Apps](https://www.tumblr.com/oauth/apps)
2. Register an application
3. Complete OAuth flow
4. Set all `TUMBLR_*` variables

#### Wix
1. Visit [Wix Developers](https://dev.wix.com/)
2. Create an API token
3. Set `WIX_API_TOKEN` and `WIX_SITE_ID`

## 📝 Content Creation

### Post Format

Create posts in `content/posts/` with format: `YYYY-MM-DD-slug.md`

```markdown
---
title: "Your Post Title"
date: "2024-01-15"
description: "SEO-optimized description under 160 characters"
tags: ["tag1", "tag2", "tag3"]
slug: "your-post-slug"
author: "Your Name"
---

# Your post content in Markdown

## Introduction

Your content here...

## Main Content

More content...

## Conclusion

Final thoughts...

[Internal link to another post](2024-01-20-another-post.html)
```

### Content Guidelines

- **Length**: Minimum 800 words for SEO optimization
- **Structure**: H1 title + 3+ H2 sections
- **Links**: Include at least one internal link to another post
- **SEO**: Start with a meta paragraph summarizing key points
- **Originality**: All content must be original (no plagiarism)

### Community Submissions

Users can submit content via GitHub Issues:

1. Create an issue with title "Submit a Post"
2. Add content in the issue body
3. Label the issue with "publish"
4. The system automatically converts approved submissions to posts

## 🔄 Publishing Platforms

### Supported Platforms

| Platform | Status | Features |
|----------|--------|----------|
| Dev.to | ✅ | Full API support, tags, canonical URLs |
| Hashnode | ✅ | GraphQL API, publications, custom domains |
| Medium | ✅ | Integration tokens, publications |
| WordPress | ✅ | REST API, categories, custom fields |
| Ghost | ✅ | Admin API, custom themes |
| Blogger | ✅ | Google API, blog management |
| Tumblr | ✅ | OAuth, multiple post types |
| Wix | ✅ | Headless Blog API, rich content |

### Publishing Modes

#### Dry Run Mode
```bash
npm run publish -- --dry-run
```
- Validates configuration
- Simulates publishing without API calls
- Shows what would be published

#### Mock Mode
```bash
npm run publish -- --mock
```
- Uses local mock server
- Tests publishing logic safely
- No external API calls

#### Production Mode
```bash
npm run publish
```
- Publishes to all configured platforms
- Updates `.postmap.json` tracking
- Generates detailed logs

### Concurrency Control

Control parallel publishing with:
```bash
PUBLISH_CONCURRENCY=2 npm run publish
```

## 🚀 GitHub Actions

### Automated Workflows

#### Site Deployment (`deploy-site.yml`)
- **Trigger**: Push to main branch
- **Actions**: Build site, deploy to GitHub Pages
- **URL**: `https://your-username.github.io/omni-publisher-content-ecosystem`

#### Scheduled Publishing (`publish-sync.yml`)
- **Trigger**: Daily at 2 AM UTC or manual dispatch
- **Actions**: Build, publish to platforms, update mappings
- **Artifacts**: Detailed logs and error reports

#### Issue-to-Post (`issue-to-post.yml`)
- **Trigger**: Issues labeled "publish"
- **Actions**: Convert issues to posts (allowlist only)
- **Moderation**: Unapproved submissions go to drafts

### Setting up GitHub Secrets

Add these secrets in your repository settings:

```bash
DEVTO_API_KEY=your_key
HASHNODE_TOKEN=your_token
MEDIUM_INTEGRATION_TOKEN=your_token
WP_ACCESS_TOKEN=your_token
WP_SITE=your_site
GHOST_ADMIN_API_KEY=your_key
GHOST_ADMIN_URL=your_url
BLOGGER_OAUTH_TOKEN=your_token
BLOGGER_BLOG_ID=your_id
TUMBLR_CONSUMER_KEY=your_key
TUMBLR_CONSUMER_SECRET=your_secret
TUMBLR_TOKEN=your_token
TUMBLR_TOKEN_SECRET=your_secret
TUMBLR_BLOG_IDENTIFIER=your_blog
WIX_API_TOKEN=your_token
WIX_SITE_ID=your_id
PUBLISH_CONCURRENCY=3
```

## 🧪 Testing

### Running Tests

```bash
# Run complete test suite
npm test

# Test individual components
npm run mock-server
npm run publish -- --mock --dry-run
```

### Test Coverage

The test suite validates:
- ✅ Mock server functionality
- ✅ TypeScript compilation
- ✅ Publisher execution
- ✅ Post mapping creation
- ✅ Logging system
- ✅ Error handling

### Manual Testing

Test API endpoints directly:

```bash
# Health check
curl http://localhost:3001/health

# Test Dev.to endpoint
curl -X POST http://localhost:3001/devto/api/articles \
  -H "Content-Type: application/json" \
  -d '{"article":{"title":"Test","body_markdown":"Test content"}}'
```

## 🔧 Troubleshooting

### Common Issues

#### 401/403 Authentication Errors

**Symptoms**: API calls failing with authentication errors

**Solutions**:
1. Verify API keys are correct and not expired
2. Check token scopes and permissions
3. Ensure environment variables are loaded
4. Test credentials manually via API documentation

#### Rate Limiting

**Symptoms**: 429 errors from platforms

**Solutions**:
1. Reduce `PUBLISH_CONCURRENCY`
2. Add delays between requests
3. Check platform-specific rate limits
4. Implement exponential backoff

#### Build Failures

**Symptoms**: TypeScript compilation errors

**Solutions**:
1. Run `npm install` to update dependencies
2. Check Node.js version (requires 18+)
3. Clear `node_modules` and reinstall
4. Verify `tsconfig.json` settings

#### Publishing Skips

**Symptoms**: Posts not publishing to some platforms

**Solutions**:
1. Check environment variables for missing keys
2. Review platform-specific error logs
3. Verify API endpoints are accessible
4. Test individual platform APIs manually

### Debug Mode

Enable detailed logging:

```bash
DEBUG=* npm run publish
```

### Log Analysis

Check generated logs in `logs/` directory:
- `publish-YYYY-MM-DD.log` - Daily publishing logs
- Contains platform-specific success/failure details
- Includes API response data for debugging

## 🔒 Security

### API Key Management

- Never commit API keys to version control
- Use GitHub Secrets for CI/CD
- Rotate keys regularly
- Monitor API usage for anomalies

### Content Moderation

- Review community submissions before publishing
- Use allowlist system for trusted contributors
- Implement content filters for spam prevention
- Regular security audits of generated content

### Platform Security

- Use HTTPS for all API communications
- Implement proper error handling
- Avoid logging sensitive data
- Regular dependency updates

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Adding New Platforms

1. Create adapter in `src/adapters/`
2. Implement required interface methods
3. Add environment variables to `.env.example`
4. Update mock server endpoints
5. Add platform to test suite

### Content Guidelines

- Follow existing post format
- Ensure SEO optimization
- Include internal linking
- Test publishing to all platforms

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- Platform APIs and documentation
- Open source community
- Content creators and contributors

---

**Ready to amplify your content reach?** Start publishing across multiple platforms with Omni-Publisher today!