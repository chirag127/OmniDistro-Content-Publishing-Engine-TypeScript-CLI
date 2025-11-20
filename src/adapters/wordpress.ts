import axios from 'axios';
import { logger } from '../utils/logger';
import { PostData } from '../utils/markdown';

export interface WordPressConfig {
  accessToken?: string;
  site?: string;
}

export interface WordPressPost {
  id: number;
  date: string;
  date_gmt: string;
  guid: { rendered: string };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string; protected: boolean };
  excerpt: { rendered: string; protected: boolean };
  author: number;
  featured_media: number;
  comment_status: string;
  ping_status: string;
  sticky: boolean;
  template: string;
  format: string;
  meta: any[];
  categories: number[];
  tags: number[];
}

export class WordPressAdapter {
  private config: WordPressConfig;

  constructor(config: WordPressConfig) {
    this.config = config;
  }

  async publish(post: PostData): Promise<{ id: string; url: string }> {
    if (!this.config.accessToken || !this.config.site) {
      logger.warn('WordPress credentials not configured, skipping publication', 'wordpress', post.filePath);
      throw new Error('WordPress access token or site not configured');
    }

    try {
      const postData = {
        title: post.frontmatter.title,
        content: post.htmlContent,
        excerpt: post.frontmatter.description,
        slug: post.frontmatter.slug,
        status: 'publish',
        categories: [], // Would need category mapping
        tags: post.frontmatter.tags
      };

      logger.info(`Publishing to WordPress: ${post.frontmatter.title}`, 'wordpress', post.filePath);

      const response = await axios.post<WordPressPost>(
        `https://${this.config.site}/wp-json/wp/v2/posts`,
        postData,
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info(`Successfully published to WordPress: ${response.data.link}`, 'wordpress', post.filePath);

      return {
        id: response.data.id.toString(),
        url: response.data.link
      };
    } catch (error: any) {
      logger.error(`Failed to publish to WordPress: ${error.message}`, 'wordpress', post.filePath, {
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }

  async update(post: PostData, postId: string): Promise<{ id: string; url: string }> {
    if (!this.config.accessToken || !this.config.site) {
      logger.warn('WordPress credentials not configured, skipping update', 'wordpress', post.filePath);
      throw new Error('WordPress access token or site not configured');
    }

    try {
      const postData = {
        title: post.frontmatter.title,
        content: post.htmlContent,
        excerpt: post.frontmatter.description,
        tags: post.frontmatter.tags
      };

      logger.info(`Updating WordPress post ${postId}: ${post.frontmatter.title}`, 'wordpress', post.filePath);

      const response = await axios.put<WordPressPost>(
        `https://${this.config.site}/wp-json/wp/v2/posts/${postId}`,
        postData,
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info(`Successfully updated WordPress post: ${response.data.link}`, 'wordpress', post.filePath);

      return {
        id: response.data.id.toString(),
        url: response.data.link
      };
    } catch (error: any) {
      logger.error(`Failed to update WordPress post: ${error.message}`, 'wordpress', post.filePath, {
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }
}