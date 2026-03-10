import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../../libs/database/database.service";
import { UserFollowingShopDTO, type UpdateProfileDTO } from "./me.dto";

@Injectable()
export class MeRepositository{
    constructor(
        private readonly db:DatabaseService
    ){}   

    async getUserById(id: number) {
        return this.db.user.findUnique({
            where: { id },
                include: {
                    profile: true,

                    roles: {
                        include: {
                            role: {
                                select: { name: true },
                            },
                        },
                    },

                    ownedShop:{
                        select:{
                            id:true,
                            name:true,
                            status:true
                        }
                    }
                },
        })
    }

    async getRepoByIdUser(userId:number){
        return await this.db.userProfile.findUnique({
            where:{
                userId
            },
        })
    }

    async updateUserProfile(userProfileId:number, data:UpdateProfileDTO){
        return await this.db.userProfile.update({
            where:{
                id:userProfileId
          },
          
          data:{
            fullName: data.name,
            phone: data.phone,
            avatarUrl: data.avatarUrl,
            address: data.address,
            photoUrl: data.photoUrl,
          },
        })
    }
  
    async findAllFollowedShop(userId: number, query: UserFollowingShopDTO) {
      const { page, limit, shopId, search, createdFrom, createdTo, sortOrder } = query
    
      const skip = (page - 1) * limit
    
      return await this.db.shopFollower.findMany({
        where: {
          userId,
          shopId: shopId ?? undefined,
    
          createdAt: {
            gte: createdFrom,
            lte: createdTo,
          },
    
          shop: search
            ? {
                name: {
                  contains: search,
                },
              }
            : undefined,
        },
    
        include: {
          shop: {
            select: {
              id: true,
              name: true,
              status: true,
              description: true,
            },
          },
        },
    
        orderBy: {
          createdAt: sortOrder,
        },
    
        skip,
        take: limit,
      })
    }
  
    async countFollowedShop(userId: number, query?: UserFollowingShopDTO) {
      return await this.db.shopFollower.count({
        where: {
          userId,
          shopId: query?.shopId,
    
          createdAt: {
            gte: query?.createdFrom,
            lte: query?.createdTo,
          },
    
          shop: query?.search
            ? {
                name: {
                  contains: query.search,
                },
              }
            : undefined,
        },
      })
    }
    
}