import { SetMetadata } from '@nestjs/common';
import { CollaboratorRole } from '@prisma/client';

export const ROLES_KEY = 'roles';

// Recebe um array de papéis permitidos (ex: ['Proprietário', 'Funcionário'])
export const RequireRoles = (...roles: CollaboratorRole[]) => SetMetadata(ROLES_KEY, roles);