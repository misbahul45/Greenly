import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../../../libs/database/database.service'
import { UserInclude } from './users.dto'
import { AuthTokenType, Prisma, UserStatus } from '../../../../generated/prisma/client'

@Injectable()
export class UsersRepositository {
  constructor(private readonly db: DatabaseService) {}

  buildInclude(includes?: UserInclude[]): Prisma.UserInclude | undefined {
    if (!includes?.length) return undefined

    const include: Prisma.UserInclude = {}

    for (const key of includes) {
      if (key === 'roles') {
        include.roles = {
          include: {
            role: {
              include: {
                permissions: true,
              },
            },
          },
        }
      } else {
        include[key] = true
      }
    }

    return include
  }

  async getUsers(params: {
    skip: number
    take: number
    status?: UserStatus
    include?: UserInclude[]
  }) {
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
    }

    if (params.status) {
      where.status = params.status
    }

    return this.db.user.findMany({
      skip: params.skip,
      take: params.take,
      where,
      include: this.buildInclude(params.include),
    })
  }

  async countUsers(status?: UserStatus) {
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
    }

    if (status) {
      where.status = status
    }

    return this.db.user.count({ where })
  }

  async findUser(id: number, include?: UserInclude[]) {
    return this.db.user.findUnique({
      where: { id },
      include: this.buildInclude(include),
    })
  }

  async findUserByEmail(email: string) {
    return this.db.user.findUnique({
      where: { email },
    })
  }

  async createUser(data: {
    email: string
    passwordHash: string
  }) {
    return this.db.user.create({ data })
  }

  async updateUser(id: number, data: Prisma.UserUpdateInput) {
    return this.db.user.update({
      where: { id },
      data,
    })
  }

  async softDeleteUser(id: number) {
    return this.db.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    })
  }

  async saveAuthDeleteToken(
    userId:number,
    payload:{
        tokenHash:string,
        expiresAt:Date,
        type:AuthTokenType
    }
  ){
    return this.db.authToken.create({
        data:{
            userId,
            ...payload
        }
    })
  }

  async findAuthToken(
    tokenId:number
  ){
    return await this.db.authToken.findUnique({
        where:{
            id:tokenId
        }
    })
  }
}