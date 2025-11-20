import axios from 'axios';
import { logger } from '../utils/logger';
import { PostData } from '../utils/markdown';

export interface BloggerConfig {
  oauthToken?: string;
  blogId?: string;
}

export interface BloggerPost {
  kind: string;
  id: string;
  blog: { id: string };
  published: string;
  updated: string;
  url: string;
  selfLink: string;
  title: string;
  content: string;
  author: { id: string; displayName: string };
  replies: { totalItems: string; selfLink: string };
}

export class BloggerAdapter {
  private config: BloggerConfig;
  private baseUrl = 'https://www.googleapis.com/blogger/v3';

  constructor(config: BloggerConfig) {
    this.config = config;
  }

  async publish(post: PostData): Promise<{ id: string; url: string }> {
    if (!this.config.oauthToken || !this.config.blogId) {
      logger.warn('Blogger credentials not configured, skipping publication', 'blogger', post.filePath);
      throw new Error('Blogger OAuth token or blog ID not configured');
    }

    try {
      const postData = {
        kind: 'blogger#post',
        title: post.frontmatter.title,
        content: post.htmlContent,
        labels: post.frontmatter.tags
      };

      logger.info(`Publishing to Blogger: ${post.frontmatter.title}`, 'blogger', post.filePath);

      const response = await axios.post<BloggerPost>(
        `${this.baseUrl}/blogs/${this.config.blogId}/posts`,
        postData,
        {
          headers: {
            'Authorization': `Bearer ${this.config.oauthToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info(`Successfully published to Blogger: ${response.data.url}`, 'blogger', post.filePath);

      return {
        id: response.data.id,
        url: response.data.url
      };
    } catch (error: any) {
      logger.error(`Failed to publish to Blogger: ${error.message}`, 'blogger', post.filePath, {
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }

  async update(post: PostData, postId: string): Promise<{ id: string; url: string }> {
    if (!this.config.oauthToken || !this.config.blogId) {
      logger.warn('Blogger credentials not configured, skipping update', 'blogger', post.filePath);
      throw new Error('Blogger OAuth token or blog ID not configured');
    }

    try {
      const postData = {
        title: post.frontmatter.title,
        content: post.htmlContent,
        labels: post.frontmatter.tags
      };

      logger.info(`Updating Blogger post ${postId}: ${post.frontmatter.title}`, 'blogger', post.filePath);

      const response = await axios.put<BloggerPost>(
        `${this.baseUrl}/blogs/${this.config.blogId}/posts/${postId}`,
        postData,
        {
          headers: {
            'Authorization': `Bearer ${this.config.oauthToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info(`Successfully updated Blogger post: ${response.data.url}`, 'blogger', post.filePath);

      return {
        id: response.data.id,
        url: response.data.url
      };
    } catch (error: any) {
      logger.error(`Failed to update Blogger post: ${error.message}`, 'blogger', post.filePath, {
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }
}