export enum SandboxEventType {
  // Pipeline stage events
  STAGE_QUEUED = 'stage_queued',
  STAGE_STARTED = 'stage_started',
  STAGE_PROGRESS = 'stage_progress',
  STAGE_SUCCEEDED = 'stage_succeeded',
  STAGE_FAILED = 'stage_failed',
  STAGE_RETRY_SCHEDULED = 'stage_retry_scheduled',

  // Infrastructure events
  INFRA_PROVISIONING = 'infra_provisioning',
  CONTAINER_BOOT = 'container_boot',
  MAGENTO_INSTALL = 'magento_install',
  MODULE_INJECTION = 'module_injection',
  VALIDATION_STEP = 'validation_step',
  RUNTIME_LOG = 'runtime_log',
  RUNTIME_ERROR = 'runtime_error',

  // Lifecycle events
  TTL_SCHEDULED = 'ttl_scheduled',
  TTL_WARNING = 'ttl_warning',
  APPROVAL_REQUESTED = 'approval_requested',
  APPROVAL_TIMEOUT = 'approval_timeout',
  DESTRUCTION_STARTED = 'destruction_started',
  DESTRUCTION_COMPLETED = 'destruction_completed',
  TERMINATION_PROGRESS = 'termination_progress',
}
