import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true; // If no roles are required, allow access
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.role) {
      return false;
    }

    // Check if the user has the required role
    // Assuming hierarchical roles can be modeled in a future iteration, 
    // for MVP we do an exact inclusion check. Super Admin can potentially override.
    if (user.role === UserRole.SUPER_ADMIN) {
      return true; // Super admin can do everything
    }

    return requiredRoles.includes(user.role);
  }
}
