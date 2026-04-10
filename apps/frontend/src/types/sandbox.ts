export enum SandboxStatus {
  REQUESTED = 'requested',
  ANALYZING = 'analyzing',
  AWAITING_CONFIRMATION = 'awaiting_confirmation',
  PROVISIONING = 'provisioning',
  BOOTSTRAPPING = 'bootstrapping',
  INSTALLING = 'installing',
  VALIDATING = 'validating',
  RUNNING = 'running',
  AWAITING_APPROVAL = 'awaiting_approval',
  FAILED = 'failed',
  TERMINATING = 'terminating',
  TERMINATED = 'terminated',
}

export enum SandboxEventType {
  INFRA_PROVISIONING = 'infra_provisioning',
  CONTAINER_BOOT = 'container_boot',
  MAGENTO_INSTALL = 'magento_install',
  MODULE_INJECTION = 'module_injection',
  VALIDATION_STEP = 'validation_step',
  RUNTIME_ERROR = 'runtime_error',
  TERMINATION_PROGRESS = 'termination_progress',
  DESTRUCTION_STARTED = 'destruction_started',
  STAGE_RETRY_SCHEDULED = 'stage_retry_scheduled',
  TTL_SCHEDULED = 'ttl_scheduled',
  TTL_WARNING = 'ttl_warning',
  APPROVAL_REQUESTED = 'approval_requested',
  APPROVAL_TIMEOUT = 'approval_timeout',
}

export interface StackProfile {
  id: string;
  magentoVersion: string;
  phpVersion: string;
  dbVersion?: string;
  searchEngine?: string;
  redisVersion?: string;
  rabbitmqAvailable: boolean;
  notes?: string;
  dockerImages?: Record<string, string>;
}

export interface SandboxSession {
  id: string;
  moduleId: string;
  userId: string;
  status: SandboxStatus;
  stackProfile: {
    magentoVersion: string;
    phpVersion: string;
    services?: string[];
    [key: string]: any;
  }; 
  endpoints?: {
    storefront?: string;
    admin?: string;
    mail?: string;
    [key: string]: string | undefined;
  };
  remediationSuggestion?: string;
  troubleshootingContext?: any;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SandboxEvent {
  id: string;
  sessionId: string;
  type: SandboxEventType;
  message: string;
  details?: any;
  createdAt: string;
}
