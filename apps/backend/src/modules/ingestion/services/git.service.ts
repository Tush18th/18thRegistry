import { Injectable, Logger } from '@nestjs/common';
import simpleGit, { SimpleGit } from 'simple-git';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GitService {
  private readonly logger = new Logger(GitService.name);

  /**
   * Clones a repository efficiently for ingestion scanning.
   * Returns the path to the temporary directory.
   */
  async cloneShallow(repoUrl: string, gitRef: string): Promise<string> {
    const tmpDirId = uuidv4();
    const destPath = path.join(os.tmpdir(), `18th_ingest_${tmpDirId}`);

    try {
      await fs.mkdir(destPath, { recursive: true });
      this.logger.log(`Created ephemeral volume at ${destPath}`);

      const git: SimpleGit = simpleGit(destPath);
      
      this.logger.log(`Cloning ${repoUrl} (ref: ${gitRef}) depth=1...`);
      // We use depth=1 to fetch the history quickly
      await git.clone(repoUrl, '.', [
        '--depth', '1',
        '--branch', gitRef,
        '--single-branch'
      ]);

      return destPath;
    } catch (error) {
      this.logger.error(`Failed to clone ${repoUrl}:`, error);
      // clean up on fail
      await this.cleanup(destPath);
      throw error;
    }
  }

  async cleanup(targetPath: string): Promise<void> {
    try {
      this.logger.log(`Cleaning up ephemeral volume: ${targetPath}`);
      await fs.rm(targetPath, { recursive: true, force: true });
    } catch (e) {
      this.logger.warn(`Failed to cleanup ${targetPath}:`, e);
    }
  }
}
