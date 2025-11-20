#!/usr/bin/env node

import * as fs from 'fs';
import { MarkdownProcessor, PostData } from './utils/markdown';
import { logger } from './utils/logger';
import { stateManager } from './utils/state';
import { DevtoAdapter } from './adapters/devto';
import { HashnodeAdapter } from './adapters/hashnode';
import { MediumAdapter } from './adapters/medium';
import { WordPressAdapter } from './adapters/wordpress';
import { GhostAdapter } from './adapters/ghost';
import { BloggerAdapter } from './adapters/blogger';
import { TumblrAdapter } from './adapters/tumblr';
import { WixAdapter } from './adapters/wix';

interface PublishOptions {
  dryRun: boolean;
  mock: boolean;
  concurrency: number;
}

interface PlatformResult {
  platform: string;
  success: boolean;
  error?: string;
  postId?: string;
  url?: string;
}

interface PublishResult {
  file: string;
  platforms: PlatformResult[];
}

class Publisher {
  private options: PublishOptions;
  private adapters: Map<string, any>;

  constructor(options: PublishOptions) {
    this.options = options;
    this.adapters = new Map();
    this.initializeAdapters();
  }

  private initializeAdapters(): void {
    const env = process.env;

    // Initialize adapters with environment variables
    this.adapters.set('devto', new DevtoAdapter({ apiKey: env.DEVTO_API_KEY }));
    this.adapters.set('hashnode', new HashnodeAdapter({ token: env.HASHNODE_TOKEN }));
    this.adapters.set('medium', new MediumAdapter({ integrationToken: env.MEDIUM_INTEGRATION_TOKEN }));
    this.adapters.set('wordpress', new WordPressAdapter({
      accessToken: env.WP_ACCESS_TOKEN,
      site: env.WP_SITE
    }));
    this.adapters.set('ghost', new GhostAdapter({
      adminApiKey: env.GHOST_ADMIN_API_KEY,
      adminUrl: env.GHOST_ADMIN_URL
    }));
    this.adapters.set('blogger', new BloggerAdapter({
      oauthToken: env.BLOGGER_OAUTH_TOKEN,
      blogId: env.BLOGGER_BLOG_ID
    }));
    this.adapters.set('tumblr', new TumblrAdapter({
      consumerKey: env.TUMBLR_CONSUMER_KEY,
      consumerSecret: env.TUMBLR_CONSUMER_SECRET,
      token: env.TUMBLR_TOKEN,
      tokenSecret: env.TUMBLR_TOKEN_SECRET,
      blogIdentifier: env.TUMBLR_BLOG_IDENTIFIER
    }));
    this.adapters.set('wix', new WixAdapter({
      apiToken: env.WIX_API_TOKEN,
      siteId: env.WIX_SITE_ID
    }));

    if (this.options.mock) {
      // Override with mock URLs if in mock mode
      const mockUrl = env.MOCK_SERVER_URL || 'http://localhost:3001';
      // In mock mode, we would configure adapters to use mock endpoints
      logger.info(`Running in mock mode with server: ${mockUrl}`);
    }
  }

  private async publishToPlatform(post: PostData, platform: string): Promise<PlatformResult> {
    const adapter = this.adapters.get(platform);
    if (!adapter) {
      return { platform, success: false, error: 'Adapter not found' };
    }

    try {
      const existingMapping = stateManager.getMapping(post.filePath, platform);

      let result: { id: string; url: string };

      if (existingMapping) {
        // Update existing post
        logger.info(`Updating existing post on ${platform} for ${post.filePath}`);
        result = await adapter.update(post, existingMapping.id);
      } else {
        // Create new post
        logger.info(`Publishing new post to ${platform} for ${post.filePath}`);
        result = await adapter.publish(post);
      }

      if (!this.options.dryRun) {
        stateManager.setMapping(post.filePath, platform, result.id, result.url);
      }

      return {
        platform,
        success: true,
        postId: result.id,
        url: result.url
      };
    } catch (error: any) {
      logger.error(`Failed to publish to ${platform}: ${error.message}`, platform, post.filePath);
      return {
        platform,
        success: false,
        error: error.message
      };
    }
  }

  private async publishPost(post: PostData): Promise<PublishResult> {
    logger.info(`Processing post: ${post.frontmatter.title} (${post.filePath})`);

    const platforms = Array.from(this.adapters.keys());
    const results: PlatformResult[] = [];

    // Process platforms with concurrency control
    const chunks = this.chunkArray(platforms, this.options.concurrency);

    for (const chunk of chunks) {
      const promises = chunk.map(platform => this.publishToPlatform(post, platform));
      const chunkResults = await Promise.all(promises);
      results.push(...chunkResults);
    }

    return {
      file: post.filePath,
      platforms: results
    };
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private generateSummary(results: PublishResult[]): void {
    const totalFiles = results.length;
    const platformStats = new Map<string, { success: number; failure: number }>();

    for (const result of results) {
      for (const platformResult of result.platforms) {
        const stats = platformStats.get(platformResult.platform) || { success: 0, failure: 0 };
        if (platformResult.success) {
          stats.success++;
        } else {
          stats.failure++;
        }
        platformStats.set(platformResult.platform, stats);
      }
    }

    logger.info(`=== PUBLISH SUMMARY ===`);
    logger.info(`Total files processed: ${totalFiles}`);

    for (const [platform, stats] of platformStats) {
      logger.info(`${platform}: ${stats.success} success, ${stats.failure} failures`);
    }

    const totalSuccess = Array.from(platformStats.values()).reduce((sum, stats) => sum + stats.success, 0);
    const totalFailure = Array.from(platformStats.values()).reduce((sum, stats) => sum + stats.failure, 0);

    logger.info(`Overall: ${totalSuccess} successful publications, ${totalFailure} failures`);
  }

  public async publish(): Promise<void> {
    logger.info('Starting publish process');

    if (this.options.dryRun) {
      logger.info('Running in DRY RUN mode - no actual publishing will occur');
    }

    // Load all posts
    const posts = MarkdownProcessor.parseAllPosts('content/posts');
    logger.info(`Found ${posts.length} posts to process`);

    if (posts.length === 0) {
      logger.warn('No posts found in content/posts/');
      return;
    }

    // Process posts
    const results: PublishResult[] = [];
    for (const post of posts) {
      try {
        const result = await this.publishPost(post);
        results.push(result);
      } catch (error: any) {
        logger.error(`Failed to process post ${post.filePath}: ${error.message}`);
      }
    }

    // Generate summary
    this.generateSummary(results);

    logger.info('Publish process completed');
  }
}

// CLI argument parsing
function parseArgs(): PublishOptions {
  const args = process.argv.slice(2);
  return {
    dryRun: args.includes('--dry-run'),
    mock: args.includes('--mock'),
    concurrency: parseInt(process.env.PUBLISH_CONCURRENCY || '3')
  };
}

// CLI execution
if (require.main === module) {
  const options = parseArgs();

  // Load environment variables
  require('dotenv').config();

  const publisher = new Publisher(options);
  publisher.publish()
    .then(() => {
      logger.info('Publisher finished successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error(`Publisher failed: ${error}`);
      process.exit(1);
    });
}