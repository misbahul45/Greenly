import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { RolesService } from './roles.service'
import ErrorHandler from '../../../libs/errors/handler.error'
import { Roles } from '../../auth/decorators/roles.decorator'
import { ZodValidationPipe } from '../../../libs/pipes/zod-validation.pipe'
import {
  roleIdParamSchema,
  roleQuerySchema,
  createRoleSchema,
  updateRoleSchema,
  attachPermissionSchema,
  replacePermissionSchema,
  type RoleIdParamDTO,
  type RoleQueryDTO,
  type CreateRoleDTO,
  type UpdateRoleDTO,
  type AttachPermissionDTO,
  type ReplacePermissionDTO,
} from './roles.dto'

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get()
  async findAll(
    @Query(new ZodValidationPipe(roleQuerySchema))
    query: RoleQueryDTO,
  ) {
    return ErrorHandler(() =>
      this.rolesService.findAll(query),
    )
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get(':id')
  async findOne(
    @Param(new ZodValidationPipe(roleIdParamSchema))
    params: RoleIdParamDTO,
  ) {
    return ErrorHandler(() =>
      this.rolesService.findOne(params.id),
    )
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post()
  async create(
    @Body(new ZodValidationPipe(createRoleSchema))
    body: CreateRoleDTO,
  ) {
    return ErrorHandler(() =>
      this.rolesService.create(body.name),
    )
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch(':id')
  async update(
    @Param(new ZodValidationPipe(roleIdParamSchema))
    params: RoleIdParamDTO,
    @Body(new ZodValidationPipe(updateRoleSchema))
    body: UpdateRoleDTO,
  ) {
    return ErrorHandler(() =>
      this.rolesService.update(params.id, body.name),
    )
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Delete(':id')
  async remove(
    @Param(new ZodValidationPipe(roleIdParamSchema))
    params: RoleIdParamDTO,
  ) {
    return ErrorHandler(() =>
      this.rolesService.remove(params.id),
    )
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post(':id/permissions')
  async attachPermissions(
    @Param(new ZodValidationPipe(roleIdParamSchema))
    params: RoleIdParamDTO,
    @Body(new ZodValidationPipe(attachPermissionSchema))
    body: AttachPermissionDTO,
  ) {
    return ErrorHandler(() =>
      this.rolesService.attachPermissions(
        params.id,
        body.permissions,
      ),
    )
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch(':id/permissions')
  async replacePermissions(
    @Param(new ZodValidationPipe(roleIdParamSchema))
    params: RoleIdParamDTO,
    @Body(new ZodValidationPipe(replacePermissionSchema))
    body: ReplacePermissionDTO,
  ) {
    return ErrorHandler(() =>
      this.rolesService.replacePermissions(
        params.id,
        body.permissions,
      ),
    )
  }
}