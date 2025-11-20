import axios, { AxiosResponse } from 'axios';
import { logger } from '../utils/logger';
import { PostData } from '../utils/markdown';

export interface DevtoConfig {
  apiKey?: string;
}

export interface DevtoArticle {
  id: number;
  title: string;
  description: string;
  readable_publish_date: string;
  slug: string;
  path: string;
  url: string;
  comments_count: number;
  public_reactions_count: number;
  collection_id?: number;
  published_timestamp: string;
  last_comment_at: string;
  published_at: string;
  body_html: string;
  body_markdown: string;
  tag_list: string[];
}

export class DevtoAdapter {
  private config: DevtoConfig;
  private baseUrl = 'https://dev.to/api';

  constructor(config: DevtoConfig) {
    this.config = config;
  }

  async publish(post: PostData): Promise<{ id: string; url: string }> {
    if (!this.config.apiKey) {
      logger.warn('Dev.to API key not configured, skipping publication', 'devto', post.filePath);
      throw new Error('Dev.to API key not configured');
    }

    try {
      const articleData = {
        article: {
          title: post.frontmatter.title,
          body_markdown: post.content,
          published: true,
          description: post.frontmatter.description,
          tags: post.frontmatter.tags.slice(0, 4), // Dev.to allows max 4 tags
          canonical_url: `https://your-site.com/posts/${post.frontmatter.slug}`
        }
      };

      logger.info(`Publishing to Dev.to: ${post.frontmatter.title}`, 'devto', post.filePath);

      const response: AxiosResponse<DevtoArticle> = await axios.post(
        `${this.baseUrl}/articles`,
        articleData,
        {
          headers: {
            'Api-Key': this.config.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info(`Successfully published to Dev.to: ${response.data.url}`, 'devto', post.filePath);

      return {
        id: response.data.id.toString(),
        url: response.data.url
      };
    } catch (error: any) {
      logger.error(`Failed to publish to Dev.to: ${error.message}`, 'devto', post.filePath, {
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }

  async update(post: PostData, articleId: string): Promise<{ id: string; url: string }> {
    if (!this.config.apiKey) {
      logger.warn('Dev.to API key not configured, skipping update', 'devto', post.filePath);
      throw new Error('Dev.to API key not configured');
    }

    try {
      const articleData = {
        article: {
          title: post.frontmatter.title,
          body_markdown: post.content,
          description: post.frontmatter.description,
          tags: post.frontmatter.tags.slice(0, 4)
        }
      };

      logger.info(`Updating Dev.to article ${articleId}: ${post.frontmatter.title}`, 'devto', post.filePath);

      const response: AxiosResponse<DevtoArticle> = await axios.put(
        `${this.baseUrl}/articles/${articleId}`,
        articleData,
        {
          headers: {
            'Api-Key': this.config.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info(`Successfully updated Dev.to article: ${response.data.url}`, 'devto', post.filePath);

      return {
        id: response.data.id.toString(),
        url: response.data.url
      };
    } catch (error: any) {
      logger.error(`Failed to update Dev.to article: ${error.message}`, 'devto', post.filePath, {
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }
}