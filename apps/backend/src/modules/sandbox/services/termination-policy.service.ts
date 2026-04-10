import { Injectable, Logger } from '@nestjs/common';
import { SandboxSessionEntity } from '../entities/sandbox-session.entity';
import { UserRole } from '../../auth/entities/user.entity';

export interface TerminationPolicy {
  defaultInitialTTL: number; // minutes
  maxInitialTTL: number;
  maxExtensions: number;
  maxCumulativeLifetime: number;
  extensionIncrement: number;
  warningStages: number[]; // minutes before expiry
  approvalWindow: number; // minutes before expiry
}

const DEFAULT_POLICY: TerminationPolicy = {
  defaultInitialTTL: 60,
  maxInitialTTL: 120,
  maxExtensions: 3,
  maxCumulativeLifetime: 240, // 4 hours
  extensionIncrement: 30,
  warningStages: [15, 5],
  approvalWindow: 2,
};

const ADMIN_POLICY: TerminationPolicy = {
  defaultInitialTTL: 240,
  maxInitialTTL: 480,
  maxExtensions: 99,
  maxCumulativeLifetime: 1440, // 24 hours
  extensionIncrement: 60,
  warningStages: [30, 10],
  approvalWindow: 5,
};

@Injectable()
export class TerminationPolicyService {
  private readonly logger = new Logger(TerminationPolicyService.name);

  getPolicy(role: UserRole): TerminationPolicy {
    if ([UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(role)) {
      return ADMIN_POLICY;
    }
    return DEFAULT_POLICY;
  }

  canExtend(session: SandboxSessionEntity, policy: TerminationPolicy): { allowed: boolean; reason?: string } {
    if (session.extensionCount >= policy.maxExtensions) {
      return { allowed: false, reason: `Maximum number of extensions (${policy.maxExtensions}) reached.` };
    }

    if (session.cumulativeDurationMinutes >= policy.maxCumulativeLifetime) {
      return { allowed: false, reason: `Maximum cumulative lifetime (${policy.maxCumulativeLifetime}m) reached.` };
    }

    return { allowed: true };
  }

  calculateNewExpiry(currentExpiry: Date, minutes: number): Date {
    return new Date(currentExpiry.getTime() + minutes * 60 * 1000);
  }
}
