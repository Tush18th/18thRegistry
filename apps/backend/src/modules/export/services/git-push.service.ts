import { Injectable, Logger } from '@nestjs/common';
import simpleGit, { SimpleGit } from 'simple-git';
import * as fs from 'fs-extra';
import * as path from 'path';

export interface ExportConfig {
  repoUrl: string;
  branch: string;
  commitMessage: string;
  token: string;
  authorName?: string;
  authorEmail?: string;
}

@Injectable()
export class GitPushService {
  private readonly logger = new Logger(GitPushService.name);

  async pushToRepository(sourceDir: string, config: ExportConfig) {
    const { repoUrl, branch, commitMessage, token, authorName, authorEmail } = config;
    
    // Sanitize repo URL and embed token
    const authRepoUrl = repoUrl.startsWith('https://') 
      ? repoUrl.replace('https://', `https://${token}@`) 
      : repoUrl;

    this.logger.log(`Exporting module from ${sourceDir} to ${repoUrl}...`);

    // Ensure source directory is a git repository
    if (!fs.existsSync(path.join(sourceDir, '.git'))) {
       await simpleGit(sourceDir).init();
    }

    const git: SimpleGit = simpleGit(sourceDir);

    try {
      // 1. Production Config
      await git.addConfig('user.name', authorName || '18th Module Registry');
      await git.addConfig('user.email', authorEmail || 'dev@18thdigitech.com');

      // 2. Clear existing remotes to prevent conflicts
      const remotes = await git.getRemotes();
      if (remotes.find(r => r.name === 'origin')) {
        await git.removeRemote('origin');
      }
      await git.addRemote('origin', authRepoUrl);

      // 3. Staging & Committing
      await git.add('.');
      await git.commit(commitMessage || `Deployment: ${new Date().toISOString()}`);

      // 4. Force Push (Isolation Policy)
      // For production-grade exports from the Registry, we treat the export target 
      // as an isolated 'release' branch.
      this.logger.log(`Executing forced push to origin/${branch}...`);
      await git.push('origin', `master:${branch}`, ['--force']);

      return { 
        status: 'success', 
        pushedTo: repoUrl, 
        branch 
      };
    } catch (error) {
      this.logger.error(`Git export failed: ${error.message}`);
      throw new Error(`Failed to synchronize with repository: ${error.message}`);
    }
  }
}
