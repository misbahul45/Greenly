import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../../libs/database/database.service";

@Injectable()
export class RolesRepositository {
  constructor(
    private readonly db: DatabaseService
  ) {}

  async getRoles(params?: {
    skip?: number
    take?: number
    includePermissions?: boolean
    search?: string
  }) {
    return this.db.role.findMany({
      skip: params?.skip,
      take: params?.take,
  
      where: params?.search
        ? {
            name: {
              contains: params.search,
            },
          }
        : undefined,
  
      include: params?.includePermissions
        ? { permissions: true }
        : undefined,
    })
  }

  async countRoles(search?: string) {
    return this.db.role.count({
      where: search
        ? {
            name: {
              contains: search,
            },
          }
        : undefined,
    })
  }

  async findRole(id: string) {
    return this.db.role.findUnique({
      where: { id },
      include: { permissions: true },
    })
  }

  async findRoleByName(name: string) {
    return this.db.role.findUnique({
      where: { name },
    })
  }

  async createRole(name: string) {
    return this.db.role.create({
      data: { name },
    })
  }

  async updateRole(id: string, name: string) {
    return this.db.role.update({
      where: { id },
      data: { name },
    })
  }

  async deleteRole(id: string) {
    return this.db.role.delete({
      where: { id },
    })
  }

  async countUserRoles(roleId: string) {
    return this.db.userRole.count({
      where: { roleId },
    })
  }

  async attachPermissions(roleId: string, permissions: string[]) {
    return this.db.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          connect: permissions.map((name) => ({ name })),
        },
      },
      include: { permissions: true },
    })
  }

  async replacePermissions(roleId: string, permissions: string[]) {
    return this.db.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          set: [],
          connect: permissions.map((name) => ({ name })),
        },
      },
      include: { permissions: true },
    })
  }
}