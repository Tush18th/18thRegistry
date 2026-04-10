import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs-extra';
import * as path from 'path';
import { InfraProvider, ProvisionOptions } from './infra-provider.interface';

const execFileAsync = promisify(execFile);

@Injectable()
export class DockerComposeProvider implements InfraProvider {
  private readonly logger = new Logger(DockerComposeProvider.name);
  private readonly baseDir: string;

  constructor(private readonly config: ConfigService) {
    this.baseDir = path.resolve(process.cwd(), 'storage', 'sandboxes');
    fs.ensureDirSync(this.baseDir);
  }

  async provision(options: ProvisionOptions): Promise<{ endpoints: Record<string, string> }> {
    const sessionDir = path.join(this.baseDir, options.sessionId);
    await fs.ensureDir(sessionDir);

    // 1. Determine Ports (Simplified for MVP: random high port)
    const storefrontPort = Math.floor(Math.random() * 10000) + 30000;
    const adminPort = storefrontPort + 1;

    // 2. Generate Docker Compose Manifest
    const manifest = this.generateManifest(options, storefrontPort, adminPort);
    await fs.writeFile(path.join(sessionDir, 'docker-compose.yml'), manifest);

    // 3. Start Infrastructure
    try {
      this.logger.log(`Starting infrastructure for session ${options.sessionId} in ${sessionDir}`);
      await execFileAsync('docker-compose', ['up', '-d'], { cwd: sessionDir, shell: false });
      
      return {
        endpoints: {
          storefront: `http://localhost:${storefrontPort}`,
          admin: `http://localhost:${storefrontPort}/admin`,
          mail: `http://localhost:${storefrontPort + 2}`, // Mock mailhog
        },
      };
    } catch (error) {
      this.logger.error(`Failed to start docker-compose for ${options.sessionId}: ${error.message}`);
      throw error;
    }
  }

  async execute(sessionId: string, service: string, command: string[]): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    const sessionDir = path.join(this.baseDir, sessionId);
    
    try {
      this.logger.debug(`Executing in ${service}: ${command.join(' ')}`);
      const { stdout, stderr } = await execFileAsync('docker-compose', ['exec', '-T', service, ...command], { cwd: sessionDir, shell: false });
      return { stdout, stderr, exitCode: 0 };
    } catch (error: any) {
      this.logger.warn(`Command failed in ${service}: ${command[0]} - ${error.message}`);
      return { 
        stdout: error.stdout || '', 
        stderr: error.stderr || error.message, 
        exitCode: error.code || 1 
      };
    }
  }

  async teardown(sessionId: string): Promise<void> {
    const sessionDir = path.join(this.baseDir, sessionId);
    if (!(await fs.pathExists(sessionDir))) return;

    try {
      this.logger.log(`Tearing down session ${sessionId}`);
      await execFileAsync('docker-compose', ['down', '-v'], { cwd: sessionDir, shell: false });
      await fs.remove(sessionDir);
    } catch (error) {
      this.logger.error(`Failed to teardown ${sessionId}: ${error.message}`);
      // Even if it fails, we want to try to remove the directory if possible
      await fs.remove(sessionDir).catch(() => {});
    }
  }

  async getHealth(sessionId: string): Promise<boolean> {
    const sessionDir = path.join(this.baseDir, sessionId);
    try {
      const { stdout } = await execFileAsync('docker-compose', ['ps', '--format', 'json'], { cwd: sessionDir, shell: false });
      const stats = JSON.parse(stdout);
      return Array.isArray(stats) && stats.every(s => s.State === 'running');
    } catch {
      return false;
    }
  }

  private generateManifest(options: ProvisionOptions, port: number, adminPort: number): string {
    // Hardened Magento 2 stack for secure execution
    return `
version: '3.8'
services:
  db:
    image: mariadb:10.6
    container_name: sandbox-${options.sessionId}-db
    labels:
      - "18th-sandbox.session-id=${options.sessionId}"
      - "18th-sandbox.type=db"
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: magento
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 2G
    cap_drop:
      - ALL
    security_opt:
      - no-new-privileges:true
    networks:
      - sandbox_net

  redis:
    image: redis:7-alpine
    container_name: sandbox-\${options.sessionId}-redis
    labels:
      - "18th-sandbox.session-id=${options.sessionId}"
      - "18th-sandbox.type=redis"
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
    cap_drop:
      - ALL
    security_opt:
      - no-new-privileges:true
    networks:
      - sandbox_net

  php:
    image: magento2-php:${options.phpVersion}-fpm
    container_name: sandbox-${options.sessionId}-php
    labels:
      - "18th-sandbox.session-id=${options.sessionId}"
      - "18th-sandbox.type=php"
    volumes:
      - ./src:/var/www/html
      - ./php-security.ini:/usr/local/etc/php/conf.d/security.ini:ro
    depends_on:
      - db
      - redis
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
    pids_limit: 1024
    cap_drop:
      - ALL
    cap_add:
      - CHOWN
      - SETUID
      - SETGID
    security_opt:
      - no-new-privileges:true
    extra_hosts:
      - "metadata.google.internal:127.0.0.1"
      - "instance-data:127.0.0.1"
    networks:
      - sandbox_net

  web:
    image: nginx:alpine
    container_name: sandbox-${options.sessionId}-web
    labels:
      - "18th-sandbox.session-id=${options.sessionId}"
      - "18th-sandbox.type=web"
    ports:
      - "${port}:80"
    volumes:
      - ./src:/var/www/html
    depends_on:
      - php
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
    cap_drop:
      - ALL
    security_opt:
      - no-new-privileges:true
    networks:
      - sandbox_net

networks:
  sandbox_net:
    driver: bridge
    internal: false # Keep false if we need to fetch composer deps, but usually true for pure runner
`;
  }
}
