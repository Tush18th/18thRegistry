import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompatibilityResultEntity, AnalysisStatus, ConfidenceLevel } from '../entities/compatibility-result.entity';
import { ModulesService } from '../../modules/modules.service';

@Injectable()
export class CompatibilityService {
  constructor(
    @InjectRepository(CompatibilityResultEntity)
    private readonly resultsRepo: Repository<CompatibilityResultEntity>,
    private readonly modulesService: ModulesService,
  ) {}

  async triggerAnalysis(moduleId: string, force: boolean = false): Promise<{ analysisId: string; status: AnalysisStatus }> {
    const module = await this.modulesService.findOne(moduleId);
    
    // Check if an analysis is already running
    const existingActive = await this.resultsRepo.findOne({
      where: { moduleId, status: AnalysisStatus.IN_PROGRESS },
    });

    if (existingActive) {
      throw new ConflictException('Analysis is already in progress for this module.');
    }

    if (!force) {
        // If not forcing, check if a recent valid analysis exists
        const recent = await this.resultsRepo.findOne({
            where: { moduleId, status: AnalysisStatus.COMPLETED, stale: false },
            order: { createdAt: 'DESC' }
        });
        if (recent) {
             return { analysisId: recent.id, status: AnalysisStatus.COMPLETED };
        }
    }

    // Create a new queued result
    const result = this.resultsRepo.create({
      moduleId,
      status: AnalysisStatus.QUEUED,
    });

    const saved = await this.resultsRepo.save(result);

    // TODO: Dispatch BullMQ job to 'sandbox-pipeline' queue (analyze-module)
    // For MVP stub, we'll fast-track it to COMPLETED with static mock data
    await this.mockAnalysisJob(saved.id, module.id);

    return { analysisId: saved.id, status: AnalysisStatus.QUEUED };
  }

  async getRecommendation(moduleId: string): Promise<CompatibilityResultEntity> {
    const result = await this.resultsRepo.findOne({
      where: { moduleId },
      order: { createdAt: 'DESC' },
    });

    if (!result) {
      throw new NotFoundException('No compatibility analysis exists for this module.');
    }

    return result;
  }

  /**
   * Temporary MVP method to populate static results instantly without a worker.
   */
  private async mockAnalysisJob(analysisId: string, moduleId: string) {
    const result = await this.resultsRepo.findOne({ where: { id: analysisId } });
    if (!result) return;

    result.status = AnalysisStatus.COMPLETED;
    result.confidenceScore = {
      score: 95,
      level: ConfidenceLevel.STRONG_INFERENCE,
    };
    result.magentoRecommendation = {
      recommended: '2.4.6-p3',
      supportedRange: '>=2.4.4 <2.4.7',
    };
    result.phpRecommendation = {
      minimum: '8.1',
      recommended: '8.2',
    };
    result.infrastructure = [
      { service: 'mysql', requirement: 'REQUIRED' },
      { service: 'opensearch', requirement: 'REQUIRED' },
      { service: 'redis', requirement: 'OPTIONAL' }
    ];
    result.warnings = [];
    result.stale = false;

    await this.resultsRepo.save(result);
  }
}
