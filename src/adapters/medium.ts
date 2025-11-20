import axios from 'axios';
import { logger } from '../utils/logger';
import { PostData } from '../utils/markdown';

export interface MediumConfig {
  integrationToken?: string;
}

export interface MediumUser {
  id: string;
  username: string;
  name: string;
  url: string;
  imageUrl: string;
}

export interface MediumPost {
  id: string;
  title: string;
  authorId: string;
  url: string;
  canonicalUrl?: string;
  publishStatus: string;
  publishedAt: number;
  license: string;
  licenseUrl: string;
}

export class MediumAdapter {
  private config: MediumConfig;
  private baseUrl = 'https://api.medium.com/v1';

  constructor(config: MediumConfig) {
    this.config = config;
  }

  async publish(post: PostData): Promise<{ id: string; url: string }> {
    if (!this.config.integrationToken) {
      logger.warn('Medium integration token not configured, skipping publication', 'medium', post.filePath);
      throw new Error('Medium integration token not configured');
    }

    try {
      // First get user info
      const userResponse = await axios.get<{ data: MediumUser }>(
        `${this.baseUrl}/me`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.integrationToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const userId = userResponse.data.data.id;

      const postData = {
        title: post.frontmatter.title,
        contentFormat: 'markdown',
        content: post.content,
        canonicalUrl: `https://your-site.com/posts/${post.frontmatter.slug}`,
        tags: post.frontmatter.tags.slice(0, 5),
        publishStatus: 'public'
      };

      logger.info(`Publishing to Medium: ${post.frontmatter.title}`, 'medium', post.filePath);

      const response = await axios.post<{ data: MediumPost }>(
        `${this.baseUrl}/users/${userId}/posts`,
        postData,
        {
          headers: {
            'Authorization': `Bearer ${this.config.integrationToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info(`Successfully published to Medium: ${response.data.data.url}`, 'medium', post.filePath);

      return {
        id: response.data.data.id,
        url: response.data.data.url
      };
    } catch (error: any) {
      logger.error(`Failed to publish to Medium: ${error.message}`, 'medium', post.filePath, {
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }

  async update(post: PostData, postId: string): Promise<{ id: string; url: string }> {
    // Medium doesn't have a direct update API for published posts
    // You need to unpublish and republish
    logger.warn('Medium does not support updating published posts directly', 'medium', post.filePath);
    throw new Error('Medium update not supported - unpublish and republish manually');
  }
}