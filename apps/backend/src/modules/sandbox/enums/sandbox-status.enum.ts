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

/** States considered "active" — sandbox is consuming resources or in-flight. */
export const ACTIVE_SANDBOX_STATUSES = [
  SandboxStatus.REQUESTED,
  SandboxStatus.ANALYZING,
  SandboxStatus.AWAITING_CONFIRMATION,
  SandboxStatus.PROVISIONING,
  SandboxStatus.BOOTSTRAPPING,
  SandboxStatus.INSTALLING,
  SandboxStatus.VALIDATING,
  SandboxStatus.RUNNING,
  SandboxStatus.AWAITING_APPROVAL,
] as const;

/** States from which manual termination is allowed. */
export const TERMINABLE_STATUSES = [
  SandboxStatus.REQUESTED,
  SandboxStatus.ANALYZING,
  SandboxStatus.AWAITING_CONFIRMATION,
  SandboxStatus.PROVISIONING,
  SandboxStatus.BOOTSTRAPPING,
  SandboxStatus.INSTALLING,
  SandboxStatus.VALIDATING,
  SandboxStatus.RUNNING,
  SandboxStatus.AWAITING_APPROVAL,
] as const;

/** States from which TTL extension is allowed. */
export const EXTENDABLE_STATUSES = [
  SandboxStatus.RUNNING,
  SandboxStatus.AWAITING_APPROVAL,
] as const;
