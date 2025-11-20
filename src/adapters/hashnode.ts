import axios from 'axios';
import { logger } from '../utils/logger';
import { PostData } from '../utils/markdown';

export interface HashnodeConfig {
  token?: string;
}

export interface HashnodeResponse {
  data: {
    createPublicationStory?: {
      post: {
        _id: string;
        slug: string;
        url: string;
      };
    };
    updatePost?: {
      post: {
        _id: string;
        slug: string;
        url: string;
      };
    };
  };
}

export class HashnodeAdapter {
  private config: HashnodeConfig;
  private baseUrl = 'https://api.hashnode.com';

  constructor(config: HashnodeConfig) {
    this.config = config;
  }

  async publish(post: PostData): Promise<{ id: string; url: string }> {
    if (!this.config.token) {
      logger.warn('Hashnode token not configured, skipping publication', 'hashnode', post.filePath);
      throw new Error('Hashnode token not configured');
    }

    try {
      const mutation = `
        mutation createPublicationStory($input: CreateStoryInput!) {
          createPublicationStory(input: $input) {
            post {
              _id
              slug
              url
            }
          }
        }
      `;

      const variables = {
        input: {
          title: post.frontmatter.title,
          contentMarkdown: post.content,
          tags: post.frontmatter.tags.slice(0, 5).map(tag => ({ _id: tag, name: tag, slug: tag })),
          coverImageURL: '',
          isRepublished: false
        }
      };

      logger.info(`Publishing to Hashnode: ${post.frontmatter.title}`, 'hashnode', post.filePath);

      const response = await axios.post<HashnodeResponse>(
        this.baseUrl,
        { query: mutation, variables },
        {
          headers: {
            'Authorization': this.config.token,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.data?.createPublicationStory?.post) {
        const postData = response.data.data.createPublicationStory.post;
        logger.info(`Successfully published to Hashnode: ${postData.url}`, 'hashnode', post.filePath);

        return {
          id: postData._id,
          url: postData.url
        };
      } else {
        throw new Error('Unexpected response from Hashnode API');
      }
    } catch (error: any) {
      logger.error(`Failed to publish to Hashnode: ${error.message}`, 'hashnode', post.filePath, {
        response: error.response?.data
      });
      throw error;
    }
  }

  async update(post: PostData, postId: string): Promise<{ id: string; url: string }> {
    if (!this.config.token) {
      logger.warn('Hashnode token not configured, skipping update', 'hashnode', post.filePath);
      throw new Error('Hashnode token not configured');
    }

    try {
      const mutation = `
        mutation updatePost($input: UpdatePostInput!) {
          updatePost(input: $input) {
            post {
              _id
              slug
              url
            }
          }
        }
      `;

      const variables = {
        input: {
          id: postId,
          title: post.frontmatter.title,
          contentMarkdown: post.content,
          tags: post.frontmatter.tags.slice(0, 5).map(tag => ({ _id: tag, name: tag, slug: tag }))
        }
      };

      logger.info(`Updating Hashnode post ${postId}: ${post.frontmatter.title}`, 'hashnode', post.filePath);

      const response = await axios.post<HashnodeResponse>(
        this.baseUrl,
        { query: mutation, variables },
        {
          headers: {
            'Authorization': this.config.token,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.data?.updatePost?.post) {
        const postData = response.data.data.updatePost.post;
        logger.info(`Successfully updated Hashnode post: ${postData.url}`, 'hashnode', post.filePath);

        return {
          id: postData._id,
          url: postData.url
        };
      } else {
        throw new Error('Unexpected response from Hashnode API');
      }
    } catch (error: any) {
      logger.error(`Failed to update Hashnode post: ${error.message}`, 'hashnode', post.filePath, {
        response: error.response?.data
      });
      throw error;
    }
  }
}