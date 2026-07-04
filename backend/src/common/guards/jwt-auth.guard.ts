// =============================================================================
// common/guards/jwt-auth.guard.ts
// =============================================================================
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Guard that requires a valid JWT on the request — delegates to Passport's JWT strategy. */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
