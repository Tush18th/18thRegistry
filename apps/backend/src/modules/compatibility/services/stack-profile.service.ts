import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StackProfileEntity, StackProfileStatus } from '../entities/stack-profile.entity';

@Injectable()
export class StackProfileService {
  constructor(
    @InjectRepository(StackProfileEntity)
    private readonly stackProfileRepo: Repository<StackProfileEntity>,
  ) {}

  async findAll(filters?: { magentoVersion?: string; phpVersion?: string; status?: StackProfileStatus }): Promise<StackProfileEntity[]> {
    const query = this.stackProfileRepo.createQueryBuilder('profile');

    if (filters?.magentoVersion) {
      query.andWhere('profile.magentoVersion = :magentoVersion', { magentoVersion: filters.magentoVersion });
    }
    if (filters?.phpVersion) {
      query.andWhere('profile.phpVersion = :phpVersion', { phpVersion: filters.phpVersion });
    }
    if (filters?.status) {
      query.andWhere('profile.status = :status', { status: filters.status });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<StackProfileEntity> {
    const profile = await this.stackProfileRepo.findOne({ where: { id } });
    if (!profile) {
      throw new NotFoundException(`Stack profile with ID ${id} not found`);
    }
    return profile;
  }
}
