import { SandboxStatus } from '../enums/sandbox-status.enum';

export interface ProvisionOptions {
  sessionId: string;
  magentoVersion: string;
  phpVersion: string;
  dbVersion?: string;
  searchEngine?: string;
  services?: string[];
}

export interface InfraProvider {
  /**
   * Initialize resources (networks, volumes, directories) and start containers.
   */
  provision(options: ProvisionOptions): Promise<{ endpoints: Record<string, string> }>;

  /**
   * Execute a command inside a running service (e.g., 'php' container).
   */
  execute(sessionId: string, service: string, command: string[]): Promise<{ stdout: string; stderr: string; exitCode: number }>;

  /**
   * Destroy all resources associated with a session.
   */
  teardown(sessionId: string): Promise<void>;

  /**
   * Get health status of the infrastructure.
   */
  getHealth(sessionId: string): Promise<boolean>;
}
