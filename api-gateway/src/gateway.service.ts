import {
  BadGatewayException, HttpException, Injectable,
  InternalServerErrorException, ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type ServiceName = 'user' | 'course';

@Injectable()
export class GatewayService {
  constructor(private readonly config: ConfigService) {}

  async forward(service: ServiceName, method: string, path = '', body?: unknown) {
    // Only predefined destinations can be reached through this gateway.
    const keys = {
      user: 'USER_SERVICE_URL',
      course: 'COURSE_SERVICE_URL',
    };
    const baseUrl = this.config.get<string>(keys[service]);
    if (!baseUrl) throw new InternalServerErrorException('Missing service URL configuration');

    let response: Response;
    try {
      response = await fetch(`${baseUrl}/${service}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      throw new ServiceUnavailableException(`${service} service is unavailable`);
    }

    // Each service owns its error messages; return them through the gateway.
    let result: unknown;
    try {
      result = await response.json();
    } catch {
      throw new BadGatewayException('Service returned an invalid response');
    }
    if (!response.ok) throw new HttpException(result as object, response.status);
    return result;
  }
}
