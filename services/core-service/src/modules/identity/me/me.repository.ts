import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../../libs/database/database.service";
import { type UpdateProfileDTO } from "./me.dto";

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
                ...data
            }
        })
    }
    
}