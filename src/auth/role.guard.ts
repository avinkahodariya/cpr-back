import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserRoles } from 'libs/schema/src';

export const RoleGuard = (roles: UserRoles[] = []): Type<CanActivate> => {
  class RoleGuardMixin extends JwtAuthGuard {
    async canActivate(context: ExecutionContext) {
      await super.canActivate(context);
      const request = context.switchToHttp().getRequest();
      const user = request.user;
      return roles.includes(user.role);
    }
  }

  return mixin(RoleGuardMixin);
};
