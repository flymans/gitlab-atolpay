import { CanActivate, ExecutionContext, HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  private validateRequest(req) {
    const AUTH_TOKEN = this.configService.get<string>('AUTH_TOKEN');
    if (!req?.headers?.authorization || req.headers.authorization.split(' ')[1] !== AUTH_TOKEN) {
      throw new HttpException('Unauthorized', 401);
    }
    return true;
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }
}
