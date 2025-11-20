import * as fs from 'fs';
import * as path from 'path';

export interface PostMapping {
  [filePath: string]: {
    [platform: string]: {
      id: string;
      url?: string | undefined;
      publishedAt: string;
    };
  };
}

export class StateManager {
  private stateFile: string;
  private state: PostMapping;

  constructor(stateFile = '.postmap.json') {
    this.stateFile = stateFile;
    this.state = this.loadState();
  }

  private loadState(): PostMapping {
    try {
      if (fs.existsSync(this.stateFile)) {
        const data = fs.readFileSync(this.stateFile, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.warn(`Failed to load state file ${this.stateFile}:`, error);
    }
    return {};
  }

  private saveState(): void {
    try {
      fs.writeFileSync(this.stateFile, JSON.stringify(this.state, null, 2));
    } catch (error) {
      console.error(`Failed to save state file ${this.stateFile}:`, error);
      throw error;
    }
  }

  /**
   * Get mapping for a specific file and platform
   */
  getMapping(filePath: string, platform: string): PostMapping[string][string] | null {
    return this.state[filePath]?.[platform] || null;
  }

  /**
   * Set mapping for a specific file and platform
   */
  setMapping(filePath: string, platform: string, id: string, url?: string): void {
    if (!this.state[filePath]) {
      this.state[filePath] = {};
    }

    this.state[filePath][platform] = {
      id,
      url,
      publishedAt: new Date().toISOString()
    };

    this.saveState();
  }

  /**
   * Check if a file has been published to a platform
   */
  isPublished(filePath: string, platform: string): boolean {
    return !!this.getMapping(filePath, platform);
  }

  /**
   * Get all mappings for a file
   */
  getFileMappings(filePath: string): PostMapping[string] | null {
    return this.state[filePath] || null;
  }

  /**
   * Get all files that have been published to a platform
   */
  getPlatformFiles(platform: string): string[] {
    const files: string[] = [];
    for (const [filePath, platforms] of Object.entries(this.state)) {
      if (platforms[platform]) {
        files.push(filePath);
      }
    }
    return files;
  }

  /**
   * Remove mapping for a specific file and platform
   */
  removeMapping(filePath: string, platform: string): void {
    if (this.state[filePath]) {
      delete this.state[filePath][platform];
      if (Object.keys(this.state[filePath]).length === 0) {
        delete this.state[filePath];
      }
      this.saveState();
    }
  }

  /**
   * Get statistics
   */
  getStats(): { totalFiles: number; totalMappings: number; platformStats: Record<string, number> } {
    const platformStats: Record<string, number> = {};
    let totalMappings = 0;

    for (const platforms of Object.values(this.state)) {
      for (const platform of Object.keys(platforms)) {
        platformStats[platform] = (platformStats[platform] || 0) + 1;
        totalMappings++;
      }
    }

    return {
      totalFiles: Object.keys(this.state).length,
      totalMappings,
      platformStats
    };
  }
}

// Global state manager instance
export const stateManager = new StateManager();