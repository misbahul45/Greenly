import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { RolesRepositository } from './roles.repository'
import { RolesResponse } from './types'
import { Role } from 'generated/prisma/client'

@Injectable()
export class RolesService {
  constructor(private readonly repo: RolesRepositository) {}

  async findAll(query?: {
    page?: number
    limit?: number
    includePermissions?: boolean
    search?: string
  }) : Promise<ApiResponse<RolesResponse[]>> {
    const page = query?.page ?? 1
    const limit = query?.limit ?? 10
  
    const [data, total] = await Promise.all([
      this.repo.getRoles({
        skip: (page - 1) * limit,
        take: limit,
        includePermissions: query?.includePermissions,
        search: query?.search,
      }),
      this.repo.countRoles(query?.search),
    ])
  
    return {
      data,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
      message: 'Roles fetched successfully',
    }
  }

  async findOne(id: number) : Promise<ApiResponse<Role>> {
    const role = await this.repo.findRole(id)

    if (!role) throw new NotFoundException('Role not found')

    return {
      data: role,
      message: 'Role fetched successfully',
    }
  }

  async create(name: string) : Promise<ApiResponse<Role>> {
    const existing = await this.repo.findRoleByName(name)

    if (existing) {
      throw new BadRequestException('Role already exists')
    }

    const role = await this.repo.createRole(name)

    return {
      data: role,
      message: 'Role created successfully',
    }
  }

  async update(id: number, name: string) : Promise<ApiResponse<Role>> {
    const role = await this.repo.findRole(id)

    if (!role) throw new NotFoundException('Role not found')

    const updated = await this.repo.updateRole(id, name)

    return {
      data: updated,
      message: 'Role updated successfully',
    }
  }

  async remove(id: number) : Promise<ApiResponse<null>> {
    const role = await this.repo.findRole(id)

    if (!role) throw new NotFoundException('Role not found')

    const assigned = await this.repo.countUserRoles(id)

    if (assigned > 0) {
      throw new BadRequestException('Role is still assigned to users')
    }

    await this.repo.deleteRole(id)

    return {
      data: null,
      message: 'Role deleted successfully',
    }
  }

  async attachPermissions(id: number, permissions: string[]) {
    const role = await this.repo.findRole(id)

    if (!role) throw new NotFoundException('Role not found')

    const updated = await this.repo.attachPermissions(id, permissions)

    return {
      data: updated,
      message: 'Permissions attached successfully',
    }
  }

  async replacePermissions(id: number, permissions: string[]) {
    const role = await this.repo.findRole(id)

    if (!role) throw new NotFoundException('Role not found')

    const updated = await this.repo.replacePermissions(id, permissions)

    return {
      data: updated,
      message: 'Permissions replaced successfully',
    }
  }
}