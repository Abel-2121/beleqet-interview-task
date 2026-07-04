// common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** Payload shape attached to `request.user` after JWT authentication. */
export interface CurrentUserPayload {
  userId: string;
  email: string;
  role: string;
}

/** Parameter decorator that injects the authenticated user's payload from `request.user`. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUserPayload => {
    const request = ctx.switchToHttp().getRequest<{ user: CurrentUserPayload }>();
    return request.user;
  },
);

// common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/** Decorator that marks a route with the roles allowed to access it. */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
