import * as crypto from 'crypto';
import * as OAuth from 'oauth-1.0a';
import axios from 'axios';
import { logger } from '../utils/logger';
import { PostData } from '../utils/markdown';

export interface TumblrConfig {
  consumerKey?: string;
  consumerSecret?: string;
  token?: string;
  tokenSecret?: string;
  blogIdentifier?: string;
}

export interface TumblrPost {
  id: number;
  url: string;
  slug: string;
  type: string;
  date: string;
  timestamp: number;
  state: string;
  format: string;
  reblog_key: string;
  tags: string[];
  short_url: string;
  summary: string;
  should_open_in_legacy: boolean;
  recommended_source: any;
  recommended_color: any;
  note_count: number;
  title: string;
  body: string;
}

export class TumblrAdapter {
  private config: TumblrConfig;
  private oauth: OAuth;

  constructor(config: TumblrConfig) {
    this.config = config;
    this.oauth = new OAuth({
      consumer: {
        key: this.config.consumerKey || '',
        secret: this.config.consumerSecret || ''
      },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string: string, key: string) {
        return crypto.createHmac('sha1', key).update(base_string).digest('base64');
      }
    });
  }

  private getAuthHeaders(url: string, method: string = 'POST', data?: any): { Authorization: string } {
    const request_data = {
      url,
      method,
      data
    };

    return this.oauth.toHeader(this.oauth.authorize(request_data, {
      key: this.config.token || '',
      secret: this.config.tokenSecret || ''
    }));
  }

  async publish(post: PostData): Promise<{ id: string; url: string }> {
    if (!this.config.consumerKey || !this.config.consumerSecret || !this.config.token || !this.config.tokenSecret || !this.config.blogIdentifier) {
      logger.warn('Tumblr credentials not configured, skipping publication', 'tumblr', post.filePath);
      throw new Error('Tumblr OAuth credentials not configured');
    }

    try {
      const postData = {
        type: 'text',
        title: post.frontmatter.title,
        body: post.htmlContent,
        tags: post.frontmatter.tags.join(','),
        state: 'published'
      };

      const url = `https://api.tumblr.com/v2/blog/${this.config.blogIdentifier}/post`;

      logger.info(`Publishing to Tumblr: ${post.frontmatter.title}`, 'tumblr', post.filePath);

      const response = await axios.post<{ response: { id: number; url: string } }>(
        url,
        postData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            ...this.getAuthHeaders(url, 'POST', postData)
          }
        }
      );

      logger.info(`Successfully published to Tumblr: ${response.data.response.url}`, 'tumblr', post.filePath);

      return {
        id: response.data.response.id.toString(),
        url: response.data.response.url
      };
    } catch (error: any) {
      logger.error(`Failed to publish to Tumblr: ${error.message}`, 'tumblr', post.filePath, {
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }

  async update(post: PostData, postId: string): Promise<{ id: string; url: string }> {
    // Tumblr doesn't have a direct update API - you'd need to edit via web interface
    logger.warn('Tumblr does not support updating posts via API', 'tumblr', post.filePath);
    throw new Error('Tumblr update not supported via API');
  }
}