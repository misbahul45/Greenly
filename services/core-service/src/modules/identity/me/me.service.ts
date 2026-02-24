import { Injectable } from '@nestjs/common';
import { MeRepositository } from './me.repository';
import { AppError } from '../../../libs/errors/app.error';
import { type UpdateProfileDTO } from './me.dto';

@Injectable()
export class MeService {
    constructor(
        private readonly repo:MeRepositository,
    ){}

    async me(dto:UserLogin) {
        const user=await this.repo.getUserById(dto.sub)

        if(!user){
        throw new AppError('Unauthorized user', 404)
        }

        return {
            id: user.id,
            email: user.email,
            status: user.status,
            emailVerified: !!user.emailVerified,

            profile: {
                fullName: user.profile?.fullName ?? null,
                phone: user.profile?.phone ?? null,
                avatarUrl: user.profile?.avatarUrl ?? null,
                address: user.profile?.address ?? null,
            },

            roles: user.roles.map(r => r.role.name),

            shop: user.ownedShop
                ? {
                    id: user.ownedShop.id,
                    name: user.ownedShop.name,
                    status: user.ownedShop.status,
                }
                : null,

                createdAt: user.createdAt,
        }
    }

    async updateProfile(userId:number, payload:UpdateProfileDTO){
        const profile=await this.repo.getRepoByIdUser(userId)

        if(!profile){
            throw new AppError('User did not exist', 404)
        }

        const updatedProfile=await this.repo.updateUserProfile(profile.id, payload)

        return {
            message:'Successfully update user',
            data:{
                ...updatedProfile
            }
        }
    }
}
