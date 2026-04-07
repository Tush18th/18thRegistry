// Shared TypeScript types for the platform

export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Module {
  id: string;
  name: string;
  vendor: string;
  namespace: string;
  description: string;
  category: string;
  status: 'draft' | 'review' | 'approved' | 'deprecated';
  magentoVersionMin: string;
  magentoVersionMax: string;
  phpVersionMin: string;
  ownerUserId: string;
  repoUrl?: string;
  repoPath?: string;
  defaultBranch?: string;
  latestVersionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ModuleVersion {
  id: string;
  moduleId: string;
  version: string;
  changelog: string;
  commitHash: string;
  isStable: boolean;
  readmeContent: string;
  structureJson: object;
  createdAt: Date;
}

export interface GenerationRequest {
  id: string;
  userId: string;
  baseModuleIds: string[];
  promptText: string;
  generatedCodePath?: string;
  validationStatus?: 'pending' | 'passed' | 'failed';
  exportStatus?: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  moduleId?: string;
  details: object;
  timestamp: Date;
}