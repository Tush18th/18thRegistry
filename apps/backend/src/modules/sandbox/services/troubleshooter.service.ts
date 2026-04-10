import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SandboxSessionEntity } from '../entities/sandbox-session.entity';
import { SandboxEventEntity } from '../entities/sandbox-event.entity';
import { ClaudeService } from '../../generation/services/claude.service';

@Injectable()
export class TroubleshooterService {
  private readonly logger = new Logger(TroubleshooterService.name);

  constructor(
    @InjectRepository(SandboxSessionEntity)
    private readonly sessionRepo: Repository<SandboxSessionEntity>,
    @InjectRepository(SandboxEventEntity)
    private readonly eventRepo: Repository<SandboxEventEntity>,
    private readonly claude: ClaudeService,
  ) {}

  /**
   * Analyzes a sandbox failure using AI to provide remediation.
   */
  async analyzeFailure(sessionId: string, errorMessage: string): Promise<void> {
    this.logger.log(`Initiating AI failure analysis for session ${sessionId}`);

    try {
      // 1. Gather Context
      const session = await this.sessionRepo.findOne({
        where: { id: sessionId },
        relations: ['module'],
      });
      if (!session) return;

      const events = await this.eventRepo.find({
        where: { sessionId },
        order: { createdAt: 'DESC' },
        take: 15,
      });

      const context = {
        stack: session.stackProfile,
        module: {
          name: session.module.name,
          vendor: session.module.vendor,
        },
        failureStage: session.failureStage,
        failureReason: session.failureReason,
        error: errorMessage,
        recentEvents: events.map(e => ({
          type: e.type,
          message: e.message,
          timestamp: e.createdAt,
        })),
      };

      // 2. AI Analysis
      const systemPrompt = `You are a Magento 2 Expert Reliability Engineer. Your task is to analyze failures in a Magento sandbox environment.
You will be provided with the stack profile, module details, recent event logs, and the specific error message.
Identify the root cause and provide a clear, one-paragraph remediation suggestion for a developer.
Respond ONLY with a JSON object in this format:
{
  "reason": "Technical reason for failure",
  "remediation": "Instruction on how to fix it"
}`;

      const userPrompt = `Sandbox Session Context:
${JSON.stringify(context, null, 2)}

Please analyze this failure and provide remediation.`;

      const aiResponse = await this.claude.generateModule(systemPrompt, userPrompt);

      // 3. Persist analysis
      await this.sessionRepo.update(sessionId, {
        remediationSuggestion: aiResponse.remediation || aiResponse.reason,
        troubleshootingContext: context as any,
      });

      this.logger.log(`AI Troubleshooting complete for ${sessionId}: ${aiResponse.reason}`);
    } catch (error) {
      this.logger.error(`AI Troubleshooting failed for ${sessionId}: ${error.message}`);
    }
  }
}
