#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { MarkdownProcessor, PostData } from './utils/markdown';
import { logger } from './utils/logger';

interface SiteConfig {
  title: string;
  description: string;
  url: string;
  postsPerPage: number;
}

class SiteBuilder {
  private config: SiteConfig;
  private posts: PostData[];

  constructor(config: SiteConfig = {
    title: 'Omni-Publisher Content Ecosystem',
    description: 'A comprehensive content publishing platform',
    url: 'https://your-site.com',
    postsPerPage: 10
  }) {
    this.config = config;
    this.posts = [];
  }

  private ensurePublicDir(): void {
    if (!fs.existsSync('public')) {
      fs.mkdirSync('public', { recursive: true });
    }
    if (!fs.existsSync('public/posts')) {
      fs.mkdirSync('public/posts', { recursive: true });
    }
    if (!fs.existsSync('public/assets')) {
      fs.mkdirSync('public/assets', { recursive: true });
    }
  }

  private loadPosts(): void {
    logger.info('Loading posts from content/posts/');
    this.posts = MarkdownProcessor.parseAllPosts('content/posts');
    this.posts.sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime());
    logger.info(`Loaded ${this.posts.length} posts`);
  }

  private generatePostPage(post: PostData): string {
    const tagsHtml = post.frontmatter.tags.map(tag =>
      `<span class="tag">${tag}</span>`
    ).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${post.frontmatter.title} - ${this.config.title}</title>
    <meta name="description" content="${post.frontmatter.description}">
    <meta name="author" content="${post.frontmatter.author}">
    <meta name="keywords" content="${post.frontmatter.tags.join(', ')}">
    <meta property="og:title" content="${post.frontmatter.title}">
    <meta property="og:description" content="${post.frontmatter.description}">
    <meta property="og:type" content="article">
    <meta property="article:published_time" content="${post.frontmatter.date}">
    <meta property="article:author" content="${post.frontmatter.author}">
    <meta property="article:tag" content="${post.frontmatter.tags.join(',')}">
    <link rel="stylesheet" href="../assets/styles.css">
</head>
<body>
    <header>
        <nav>
            <a href="../index.html" class="nav-link">Home</a>
            <a href="https://github.com/your-username/omni-publisher-content-ecosystem/issues/new?template=submit-post.md&title=Submit%20a%20Post" class="nav-link" target="_blank">Submit a Post</a>
        </nav>
        <h1><a href="../index.html">${this.config.title}</a></h1>
    </header>

    <main class="post-content">
        <article>
            <header class="post-header">
                <h1>${post.frontmatter.title}</h1>
                <div class="post-meta">
                    <time datetime="${post.frontmatter.date}">${new Date(post.frontmatter.date).toLocaleDateString()}</time>
                    <span>by ${post.frontmatter.author}</span>
                </div>
                <div class="tags">
                    ${tagsHtml}
                </div>
            </header>

            <div class="post-body">
                ${post.htmlContent}
            </div>
        </article>
    </main>

    <footer>
        <p>&copy; 2024 ${this.config.title}. Powered by Omni-Publisher.</p>
    </footer>
</body>
</html>`;
  }

  private generateIndexPage(page: number = 1): string {
    const startIndex = (page - 1) * this.config.postsPerPage;
    const endIndex = startIndex + this.config.postsPerPage;
    const postsOnPage = this.posts.slice(startIndex, endIndex);
    const totalPages = Math.ceil(this.posts.length / this.config.postsPerPage);

    const postsHtml = postsOnPage.map(post => {
      const excerpt = post.frontmatter.description.length > 150
        ? post.frontmatter.description.substring(0, 150) + '...'
        : post.frontmatter.description;

      const tagsHtml = post.frontmatter.tags.slice(0, 3).map(tag =>
        `<span class="tag">${tag}</span>`
      ).join('');

      return `
        <article class="post-card">
            <header>
                <h2><a href="posts/${post.frontmatter.slug}.html">${post.frontmatter.title}</a></h2>
                <div class="post-meta">
                    <time datetime="${post.frontmatter.date}">${new Date(post.frontmatter.date).toLocaleDateString()}</time>
                    <span>by ${post.frontmatter.author}</span>
                </div>
                <div class="tags">
                    ${tagsHtml}
                </div>
            </header>
            <p class="excerpt">${excerpt}</p>
            <a href="posts/${post.frontmatter.slug}.html" class="read-more">Read more</a>
        </article>
      `;
    }).join('');

    const paginationHtml = this.generatePagination(page, totalPages);

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.config.title}</title>
    <meta name="description" content="${this.config.description}">
    <meta property="og:title" content="${this.config.title}">
    <meta property="og:description" content="${this.config.description}">
    <meta property="og:type" content="website">
    <link rel="stylesheet" href="assets/styles.css">
</head>
<body>
    <header>
        <nav>
            <a href="index.html" class="nav-link">Home</a>
            <a href="https://github.com/your-username/omni-publisher-content-ecosystem/issues/new?template=submit-post.md&title=Submit%20a%20Post" class="nav-link" target="_blank">Submit a Post</a>
        </nav>
        <h1>${this.config.title}</h1>
        <p class="site-description">${this.config.description}</p>
    </header>

    <main class="posts-list">
        ${postsHtml}
        ${paginationHtml}
    </main>

    <footer>
        <p>&copy; 2024 ${this.config.title}. Powered by Omni-Publisher.</p>
    </footer>
</body>
</html>`;
  }

  private generatePagination(currentPage: number, totalPages: number): string {
    if (totalPages <= 1) return '';

    let paginationHtml = '<nav class="pagination">';

    // Previous button
    if (currentPage > 1) {
      paginationHtml += `<a href="${currentPage === 2 ? 'index.html' : `page${currentPage - 1}.html`}" class="pagination-link">&larr; Previous</a>`;
    }

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (i === currentPage) {
        paginationHtml += `<span class="pagination-current">${i}</span>`;
      } else {
        const pageUrl = i === 1 ? 'index.html' : `page${i}.html`;
        paginationHtml += `<a href="${pageUrl}" class="pagination-link">${i}</a>`;
      }
    }

    // Next button
    if (currentPage < totalPages) {
      paginationHtml += `<a href="page${currentPage + 1}.html" class="pagination-link">Next &rarr;</a>`;
    }

    paginationHtml += '</nav>';
    return paginationHtml;
  }

  public build(): void {
    logger.info('Starting site build process');

    this.ensurePublicDir();
    this.loadPosts();

    // Generate individual post pages
    for (const post of this.posts) {
      const postHtml = this.generatePostPage(post);
      const postPath = path.join('public', 'posts', `${post.frontmatter.slug}.html`);
      fs.writeFileSync(postPath, postHtml);
      logger.info(`Generated post page: ${postPath}`);
    }

    // Generate index and pagination pages
    const totalPages = Math.ceil(this.posts.length / this.config.postsPerPage);
    for (let page = 1; page <= totalPages; page++) {
      const pageHtml = this.generateIndexPage(page);
      const pagePath = page === 1 ? 'public/index.html' : `public/page${page}.html`;
      fs.writeFileSync(pagePath, pageHtml);
      logger.info(`Generated page: ${pagePath}`);
    }

    logger.info(`Site build completed. Generated ${this.posts.length} post pages and ${totalPages} index pages`);
  }
}

// CLI execution
if (require.main === module) {
  const builder = new SiteBuilder();
  try {
    builder.build();
    logger.info('Site build completed successfully');
  } catch (error) {
    logger.error(`Site build failed: ${error}`);
    process.exit(1);
  }
}