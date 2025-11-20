import axios from 'axios';
import { logger } from '../utils/logger';
import { PostData } from '../utils/markdown';

export interface WixConfig {
  apiToken?: string;
  siteId?: string;
}

export interface WixPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  published: boolean;
  publishedDate: string;
  lastPublishedDate: string;
  createdDate: string;
  updatedDate: string;
  tags: string[];
  categoryIds: string[];
  url: string;
}

export class WixAdapter {
  private config: WixConfig;
  private baseUrl = 'https://www.wixapis.com/blog/v3';

  constructor(config: WixConfig) {
    this.config = config;
  }

  async publish(post: PostData): Promise<{ id: string; url: string }> {
    if (!this.config.apiToken || !this.config.siteId) {
      logger.warn('Wix credentials not configured, skipping publication', 'wix', post.filePath);
      throw new Error('Wix API token or site ID not configured');
    }

    try {
      const postData = {
        title: post.frontmatter.title,
        content: post.htmlContent,
        excerpt: post.frontmatter.description,
        slug: post.frontmatter.slug,
        tags: post.frontmatter.tags,
        published: true,
        publishedDate: new Date().toISOString()
      };

      logger.info(`Publishing to Wix: ${post.frontmatter.title}`, 'wix', post.filePath);

      const response = await axios.post<{ post: WixPost }>(
        `${this.baseUrl}/sites/${this.config.siteId}/posts`,
        postData,
        {
          headers: {
            'Authorization': this.config.apiToken,
            'Content-Type': 'application/json',
            'wix-site-id': this.config.siteId
          }
        }
      );

      logger.info(`Successfully published to Wix: ${response.data.post.url}`, 'wix', post.filePath);

      return {
        id: response.data.post.id,
        url: response.data.post.url
      };
    } catch (error: any) {
      logger.error(`Failed to publish to Wix: ${error.message}`, 'wix', post.filePath, {
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }

  async update(post: PostData, postId: string): Promise<{ id: string; url: string }> {
    if (!this.config.apiToken || !this.config.siteId) {
      logger.warn('Wix credentials not configured, skipping update', 'wix', post.filePath);
      throw new Error('Wix API token or site ID not configured');
    }

    try {
      const postData = {
        title: post.frontmatter.title,
        content: post.htmlContent,
        excerpt: post.frontmatter.description,
        tags: post.frontmatter.tags
      };

      logger.info(`Updating Wix post ${postId}: ${post.frontmatter.title}`, 'wix', post.filePath);

      const response = await axios.patch<{ post: WixPost }>(
        `${this.baseUrl}/sites/${this.config.siteId}/posts/${postId}`,
        postData,
        {
          headers: {
            'Authorization': this.config.apiToken,
            'Content-Type': 'application/json',
            'wix-site-id': this.config.siteId
          }
        }
      );

      logger.info(`Successfully updated Wix post: ${response.data.post.url}`, 'wix', post.filePath);

      return {
        id: response.data.post.id,
        url: response.data.post.url
      };
    } catch (error: any) {
      logger.error(`Failed to update Wix post: ${error.message}`, 'wix', post.filePath, {
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }
}