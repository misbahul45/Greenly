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

  async findRole(id: number) {
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

  async updateRole(id: number, name: string) {
    return this.db.role.update({
      where: { id },
      data: { name },
    })
  }

  async deleteRole(id: number) {
    return this.db.role.delete({
      where: { id },
    })
  }

  async countUserRoles(roleId: number) {
    return this.db.userRole.count({
      where: { roleId },
    })
  }

  async attachPermissions(roleId: number, permissions: string[]) {
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

  async replacePermissions(roleId: number, permissions: string[]) {
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