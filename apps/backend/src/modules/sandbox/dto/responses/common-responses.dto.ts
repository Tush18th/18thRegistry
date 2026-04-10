export class AsyncActionResponseDto {
  message: string;
  sessionId?: string;
  status?: string;
}

export class ErrorResponseDto {
  statusCode: number;
  code: string;
  message: string;
  details?: Record<string, any>;
  correlationId: string;
  timestamp: string;
}

export class PaginatedResponseDto<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
