import axios from 'axios';
import { logger } from '../utils/logger';
import { PostData } from '../utils/markdown';

export interface GhostConfig {
  adminApiKey?: string;
  adminUrl?: string;
}

export interface GhostPost {
  posts: Array<{
    id: string;
    uuid: string;
    title: string;
    slug: string;
    html: string;
    comment_id: string;
    feature_image: string | null;
    featured: boolean;
    status: string;
    visibility: string;
    created_at: string;
    updated_at: string;
    published_at: string;
    url: string;
  }>;
}

export class GhostAdapter {
  private config: GhostConfig;

  constructor(config: GhostConfig) {
    this.config = config;
  }

  async publish(post: PostData): Promise<{ id: string; url: string }> {
    if (!this.config.adminApiKey || !this.config.adminUrl) {
      logger.warn('Ghost credentials not configured, skipping publication', 'ghost', post.filePath);
      throw new Error('Ghost admin API key or URL not configured');
    }

    try {
      const postData = {
        posts: [{
          title: post.frontmatter.title,
          html: post.htmlContent,
          status: 'published',
          tags: post.frontmatter.tags.map(tag => ({ name: tag }))
        }]
      };

      logger.info(`Publishing to Ghost: ${post.frontmatter.title}`, 'ghost', post.filePath);

      const response = await axios.post<GhostPost>(
        `${this.config.adminUrl}/ghost/api/admin/posts/`,
        postData,
        {
          headers: {
            'Authorization': `Ghost ${Buffer.from(this.config.adminApiKey).toString('base64')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const publishedPost = response.data.posts[0];
      logger.info(`Successfully published to Ghost: ${publishedPost.url}`, 'ghost', post.filePath);

      return {
        id: publishedPost.id,
        url: publishedPost.url
      };
    } catch (error: any) {
      logger.error(`Failed to publish to Ghost: ${error.message}`, 'ghost', post.filePath, {
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }

  async update(post: PostData, postId: string): Promise<{ id: string; url: string }> {
    if (!this.config.adminApiKey || !this.config.adminUrl) {
      logger.warn('Ghost credentials not configured, skipping update', 'ghost', post.filePath);
      throw new Error('Ghost admin API key or URL not configured');
    }

    try {
      const postData = {
        posts: [{
          title: post.frontmatter.title,
          html: post.htmlContent,
          updated_at: new Date().toISOString(),
          tags: post.frontmatter.tags.map(tag => ({ name: tag }))
        }]
      };

      logger.info(`Updating Ghost post ${postId}: ${post.frontmatter.title}`, 'ghost', post.filePath);

      const response = await axios.put<GhostPost>(
        `${this.config.adminUrl}/ghost/api/admin/posts/${postId}/`,
        postData,
        {
          headers: {
            'Authorization': `Ghost ${Buffer.from(this.config.adminApiKey).toString('base64')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const updatedPost = response.data.posts[0];
      logger.info(`Successfully updated Ghost post: ${updatedPost.url}`, 'ghost', post.filePath);

      return {
        id: updatedPost.id,
        url: updatedPost.url
      };
    } catch (error: any) {
      logger.error(`Failed to update Ghost post: ${error.message}`, 'ghost', post.filePath, {
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }
}