import { Controller, Get } from '@nestjs/common';

interface HealthCheckResponse {
  readonly status: string;
  readonly timestamp: string;
}

/**
 * Health check controller for container orchestration and load balancers
 */
@Controller('health')
export class HealthController {
  @Get()
  checkHealth(): HealthCheckResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}

