import { Injectable } from "@nestjs/common";
import { DatabaseService } from '../../libs/database/database.service';
import { RegisterDTO } from "./auth.dto";
import { randomAvatarUrl } from "../../common/utils/random-avatar";
import { generateOtp, hashValue } from "../../common/utils/crypto";
import { AuthTokenType, UserStatus } from "../../../generated/prisma/enums";
import * as bcrypt from 'bcrypt'
import { AuthToken } from "generated/prisma/client";
@Injectable()
export class AuthRepository{
    constructor(
        private readonly db:DatabaseService
    ){}

    async registerUser(data:RegisterDTO){
        const randomImage=randomAvatarUrl(data.name)
        const rawOtp = generateOtp();
        const hashedOtp = hashValue(rawOtp);
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        const user=await this.db.user.create({
            data:{
                email:data.email,
                passwordHash:data.password,
                profile:{
                    create:{
                        fullName:data.name,
                        avatarUrl:randomImage
                    }
                },
                tokens:{
                    create:{
                        tokenHash:hashedOtp,
                        expiresAt:expiresAt,
                        type:AuthTokenType.VERIFY_EMAIL
                    }
                },
                roles:{
                    create:{
                        role:{
                            connect:{
                                name:'CUSTOMER'
                            }
                        }
                    }
                },
                cart:{
                    create:{}
                }
            },         
        })

        return {
            user,
            payload:{
                otp:rawOtp
            }
        }
    }

    async checkUserByEmail(email:string){
        return await this.db.user.findUnique({
            where:{
                email:email
            },
            include:{
                roles:{
                    select:{
                        role:true
                    }
                },
                profile:{
                    select:{
                        fullName:true
                    }
                }
            }
        })
    }
    async checkUserById(id:string){
        return await this.db.user.findUnique({
            where:{
                id:id
            },
            include:{
                roles:{
                    select:{
                        role:true
                    }
                }
            }
        })    
    }

  async findAuthTokenByHash(tokenHash: string, tokenType: AuthTokenType) {
        return await this.db.authToken.findUnique({
            where:{
                tokenHash,
                type:tokenType
            },
        })
    }
  
    async findUserRefreshTokens(userId: string): Promise<AuthToken[]> {
        return await this.db.authToken.findMany({
            where: {
                userId: userId,
                type: AuthTokenType.REFRESH_TOKEN,
            },
        });
    }

    async findAuthTokenById(id:string, tokenType:AuthTokenType){
        return await this.db.authToken.findUnique({
            where:{
                id:id,
                type:tokenType
            },
        })
    }

    async verifyEmail(userId:string){
        return await this.db.user.update({
            where:{
                id:userId
            },
            data:{
                emailVerified:new Date(),
                status:UserStatus.ACTIVE
            },
            include:{
                profile:{
                    select:{
                        fullName:true
                    }
                },
                roles:{
                    include:{
                        role:{
                            select:{
                                name:true
                            }
                        }
                    }
                }
            }
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

    async markAllToken(userId:string, type:AuthTokenType){
        return await this.db.authToken.updateMany({
            where:{
              userId,
              type,
            },
            data:{
                usedAt:new Date()
            }
        })
    }


    async saveToken(payload: {
        userId: string;
        token: string;
        expiresAt: Date;
        tokenType:AuthTokenType;
    }) {
          await this.db.authToken.updateMany({
            where: {
                userId: payload.userId,
                type: payload.tokenType,
                usedAt: null,
            },
            data: {
                usedAt: new Date(),
            },
        });
        return this.db.authToken.create({
            data: {
                userId: payload.userId,
                tokenHash: payload.token,
                type:payload.tokenType,
                expiresAt: payload.expiresAt,
            },
        });
    }
  async getUserPermissions(userId: string): Promise<string[]> {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: true,
              },
            },
          },
        },
      },
    });

    if (!user) return [];

    const permissions = new Set<string>();
    user.roles.forEach((ur) => {
      ur.role.permissions.forEach((p) => permissions.add(p.name));
    });

    return [...permissions];
  }

  async getMeWithStats(userId: string) {
    const user = await this.db.user.findUnique({
      where: { id: userId, deletedAt: null },
      include: {
        profile: true,
        roles: {
          include: {
            role: {
              include: { permissions: true },
            },
          },
        },
      },
    });

    if (!user) return null;

    const [
      totalOrders,
      completedOrders,
      cancelledOrders,
      totalSpent,
      followingShops,
      ownedShops,
    ] = await Promise.all([
      this.db.order.count({ where: { userId } }),
      this.db.order.count({ where: { userId, status: 'COMPLETED' } }),
      this.db.order.count({ where: { userId, status: 'CANCELLED' } }),
      this.db.order.aggregate({
        where: { userId, status: { in: ['PAID', 'COMPLETED'] } },
        _sum: { totalAmount: true },
      }),
      this.db.shopFollower.count({ where: { userId } }),
      this.db.shop.count({ where: { ownerId: userId, deletedAt: null } }),
    ]);

    return {
      user,
      stats: {
        totalOrders,
        completedOrders,
        cancelledOrders,
        totalSpent: totalSpent._sum.totalAmount ?? 0,
        followingShops,
        ownedShops,
      },
    };
  }

    async changePassword(userId:string, passwordHash:string){
        return await this.db.user.update({
            where:{
                id:userId,
            },
            data:{
                passwordHash
            }
        })
    }

    async deactiveAllAuthToken(userId:string){
        return await this.db.authToken.updateMany({
            where:{
                userId,
                usedAt:null
            },
            data:{
                usedAt:new Date()
            }
        })
    }
}