import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    console.log(
      '🚀 ~ jwt-auth.guard.ts:12 ~ JwtAuthGuard ~ canActivate ~ context:',
      context,
    );
    // Check if the route is marked as public
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );
    console.log(
      '🚀 ~ jwt-auth.guard.ts:21 ~ JwtAuthGuard ~ canActivate ~ isPublic:',
      isPublic,
    );
    if (isPublic) {
      return true; // Allow access
    }

    return super.canActivate(context);
  }
}
