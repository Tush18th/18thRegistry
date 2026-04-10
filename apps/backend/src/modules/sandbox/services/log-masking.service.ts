import { Injectable } from '@nestjs/common';

@Injectable()
export class LogMaskingService {
  private readonly secretsPatterns: RegExp[] = [
    /--db-password=\S+/g,
    /--admin-password=\S+/g,
    /key\s*[:=]\s*['"]?\S+/gi,
    /Bearer\s+\S+/g,
    /--amqp-password=\S+/g,
    /--search-engine-password=\S+/g,
  ];

  mask(logLine: string): string {
    if (!logLine) return logLine;

    let maskedLine = logLine;
    for (const pattern of this.secretsPatterns) {
      maskedLine = maskedLine.replace(pattern, (match) => {
        if (match.startsWith('--db-password=')) {
          return '--db-password=***';
        }
        if (match.startsWith('--admin-password=')) {
          return '--admin-password=***';
        }
        if (match.toLowerCase().startsWith('key')) {
          const prefix = match.substring(0, match.indexOf(match.match(/[:=]/)[0]) + 1);
          return `${prefix}***`;
        }
        if (match.startsWith('Bearer ')) {
          return 'Bearer ***';
        }
        if (match.startsWith('--amqp-password=')) {
          return '--amqp-password=***';
        }
        if (match.startsWith('--search-engine-password=')) {
          return '--search-engine-password=***';
        }
        return match;
      });
    }

    return maskedLine;
  }
}
