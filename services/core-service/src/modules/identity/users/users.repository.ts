import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../../../libs/database/database.service'
import { AuthTokenType, Prisma, UserStatus } from '../../../../generated/prisma/client'

@Injectable()
export class UsersRepositository {
  constructor(private readonly db: DatabaseService) {}


  async getUsers(params: {
    skip: number
    take: number
    search?: string
    status?: UserStatus
    sortBy: string
    sortOrder: 'asc' | 'desc'
  }) {
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
    }

    if (params.status) {
      where.status = params.status
    }

    if (params.search) {
      where.OR = [
        {
          email: {
            contains: params.search,
          },
        },
        {
          profile: {
            is: {
              fullName: {
                contains: params.search,
              },
            },
          },
        },
      ]
    }

    return this.db.user.findMany({
      skip: params.skip,
      take: params.take,
      where,
      orderBy: {
        [params.sortBy]: params.sortOrder,
      },
      include: {
        profile: true,
      },
    })
  }

 async countUsers(params: {
    search?: string
    status?: UserStatus
  }) {
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
    }

    if (params.status) {
      where.status = params.status
    }

    if (params.search) {
      where.OR = [
        {
          email: {
            contains: params.search,
          },
        },
        {
          profile: {
            is: {
              fullName: {
                contains: params.search,
              },
            },
          },
        },
      ]
    }

    return this.db.user.count({ where })
  }

  async findUser(id: string) {
    return this.db.user.findUnique({
      where: { id },
      include:{
        profile:true,
      }
    })
  }

  async findUserByEmail(email: string) {
    return this.db.user.findUnique({
      where: { email },
      include:{
        profile:true
      }
    })
  }

  async createUser(data: {
    email: string
    passwordHash: string
  }) {
    return this.db.user.create({ 
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        emailVerified: new Date(),
        profile: {
          create: {
            fullName: 'created user',
          },
        },
        cart: {
          create:{}
        }
      }, 
      include:{
        profile:true
    } })
  }

  async updateUser(id: string, data: Prisma.UserUpdateInput) {
    return this.db.user.update({
      where: { id },
      data,
    })
  }

  async softDeleteUser(id: string) {
    return this.db.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
        status:UserStatus.SUSPENDED,
      },
    })
  }

  async saveAuthDeleteToken(
    userId:string,
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

  async anonymizeUsersOlderThan(date: Date) {
    return this.db.userProfile.updateMany({
      where: {
        user: {
          deletedAt: {
            not: null,
            lte: date,
          },
        },
      },
      data: {
        phone: null,
        address: null,
        avatarUrl: null,
        fullName: 'Deleted User',
      },
    });
  }

    async findAuthToken(tokenHash:string, tokenType:AuthTokenType){
      return await this.db.authToken.findUnique({
          where:{
              tokenHash,
              type:tokenType
          },
      })
    }

    async markTokenUsed(tokenId:string){
        return await this.db.authToken.update({
            where:{
                id:tokenId
            },
            data:{
                usedAt:new Date()
            }
        })
    }

}