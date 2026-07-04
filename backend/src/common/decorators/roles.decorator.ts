import { SetMetadata } from '@nestjs/common';

// Use string literals instead of @prisma/client enum to avoid
// dependency on the generated Prisma client at compile time.
export type UserRoleType = 'ADMIN' | 'EMPLOYER' | 'JOB_SEEKER' | 'FREELANCER';

export const ROLES_KEY = 'roles';
/** Decorator that marks a route handler with the roles permitted to access it. */
export const Roles = (...roles: UserRoleType[]) => SetMetadata(ROLES_KEY, roles);
