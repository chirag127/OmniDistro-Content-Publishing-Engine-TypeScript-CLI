import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

export interface PostFrontmatter {
  title: string;
  date: string;
  description: string;
  tags: string[];
  slug: string;
  author: string;
}

export interface PostData {
  frontmatter: PostFrontmatter;
  content: string;
  htmlContent: string;
  filePath: string;
}

export class MarkdownProcessor {
  /**
   * Parse frontmatter and content from a markdown file
   */
  static parseFile(filePath: string): PostData {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    const frontmatter = data as PostFrontmatter;
    const htmlContent = marked.parse(content);

    return {
      frontmatter,
      content,
      htmlContent,
      filePath
    };
  }

  /**
   * Get all markdown files from a directory
   */
  static getMarkdownFiles(dirPath: string): string[] {
    const files: string[] = [];

    function scanDir(currentPath: string) {
      const items = fs.readdirSync(currentPath);

      for (const item of items) {
        const fullPath = path.join(currentPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          scanDir(fullPath);
        } else if (item.endsWith('.md')) {
          files.push(fullPath);
        }
      }
    }

    scanDir(dirPath);
    return files;
  }

  /**
   * Parse all posts from content directory
   */
  static parseAllPosts(contentDir = 'content/posts'): PostData[] {
    const files = this.getMarkdownFiles(contentDir);
    return files.map(file => this.parseFile(file));
  }

  /**
   * Validate frontmatter structure
   */
  static validateFrontmatter(frontmatter: any): frontmatter is PostFrontmatter {
    return (
      typeof frontmatter.title === 'string' &&
      typeof frontmatter.date === 'string' &&
      typeof frontmatter.description === 'string' &&
      Array.isArray(frontmatter.tags) &&
      typeof frontmatter.slug === 'string' &&
      typeof frontmatter.author === 'string'
    );
  }
}