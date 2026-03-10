import { Injectable } from '@nestjs/common';
import { MeRepositository } from './me.repository';
import { AppError } from '../../../libs/errors/app.error';
import { type UserFollowingShopDTO, type UpdateProfileDTO } from './me.dto';
import { MeResponse, ProfileResponse, ShopResponse } from './types';
import { toMeResponse, toProfileResponse } from 'src/common/utils/transform';

@Injectable()
export class MeService {
    constructor(
        private readonly repo:MeRepositository,
    ){}

    async me(dto: UserLogin): Promise<ApiResponse<MeResponse>> {
      const user = await this.repo.getUserById(dto.sub)
    
      if (!user) {
        throw new AppError('Unauthorized user', 404)
      }
    
      return {
        data: toMeResponse(user),
        message: 'Successfully get user'
      }
    }

  async updateProfile(userId: number, payload: UpdateProfileDTO): Promise<ApiResponse<ProfileResponse>>{
        const profile=await this.repo.getRepoByIdUser(userId)
        if(!profile){
            throw new AppError('User did not exist', 404)
        }

        const updatedProfile=await this.repo.updateUserProfile(profile.id, payload)

        return {
            message:'Successfully update user',
            data:toProfileResponse(updatedProfile)
        }
  }
  
  async followingShop(
    userId: number,
    query: UserFollowingShopDTO
  ): Promise<ApiResponse<ShopResponse[]>> {
  
    const [shops, total] = await Promise.all([
      this.repo.findAllFollowedShop(userId, query),
      this.repo.countFollowedShop(userId, query),
    ])
  
    const data = shops.map((item) => item.shop) ||[]
  
    return {
      data,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        lastPage: Math.ceil(total / query.limit) || 1,
      },
      message: "Successfully get followed shops",
    }
  }
}
