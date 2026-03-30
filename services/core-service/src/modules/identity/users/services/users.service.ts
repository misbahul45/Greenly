import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { UsersRepositository } from '../users.repository'
import { UserIdParamDTO, VerifyDeleteDTO, type UserQueryDTO } from '../users.dto'
import * as bcrypt from 'bcrypt'
import { generateOtp, hashValue } from '../../../../common/utils/crypto'
import { AuthTokenType, UserStatus } from '../../../../../generated/prisma/enums'
import { ConfigService } from '@nestjs/config'
import { sendEmail } from '../../../../common/utils/email'
import { AppError } from '../../../../libs/errors/app.error'
import { ScheduleService } from './schedule.service'
import { DeletedUserPublisher } from '../publisher/deleted.user.publisher'

@Injectable()

export class UsersService {
  constructor(
    private readonly repo: UsersRepositository,
    private readonly config:ConfigService,
    private readonly schedule:ScheduleService,
    private readonly deletedUserPublisher:DeletedUserPublisher
) {}

  async findAll(query: UserQueryDTO) {
    const { page, limit, status, include } = query

    const [users, total] = await Promise.all([
      this.repo.getUsers({
        skip: (page - 1) * limit,
        take: limit,
        status,
        include,
      }),
      this.repo.countUsers(status),
    ])

    return {
      data: {
        items: users,
        meta: {
          total,
          page,
          lastPage: Math.ceil(total / limit),
        },
      },
      message: 'Users fetched successfully',
    }
  }

  async findOne(id: number, include?: any) {
    const user = await this.repo.findUser(id, include)

    if (!user) throw new NotFoundException('User not found')

    return {
      data: user,
      message: 'User fetched successfully',
    }
  }

  async create(email: string, password: string) {
    const existing = await this.repo.findUserByEmail(email)

    if (existing) {
      throw new BadRequestException('Email already registered')
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await this.repo.createUser({
      email,
      passwordHash,
    })

    return {
      data: user,
      message: 'User created successfully',
    }
  }

  async update(id: number, data: any) {
    const user = await this.repo.findUser(id)

    if (!user) throw new NotFoundException('User not found')

    const updated = await this.repo.updateUser(id, data)

    return {
      data: updated,
      message: 'User updated successfully',
    }
  }

  async remove(user:UserLogin) {
    const findUser = await this.repo.findUser(user.sub, ['profile']) as any
    if (!findUser) throw new NotFoundException('User not found')
    
    const rawOtp = generateOtp();
    const hashedOtp = hashValue(rawOtp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.repo.saveAuthDeleteToken(findUser.id,{
        tokenHash:hashedOtp,
        expiresAt,
        type:AuthTokenType.DELETE_USER
    })

    const emailConfig = this.config.get('emailJs', { infer: true });

    if (!emailConfig) {
      throw new Error('Email config not found');
    }

    await this.deletedUserPublisher.publishEmail({
      email: findUser.email,
      name: findUser.profile.name,
      otp: rawOtp,
      action:'delete account'
    })

    return {
      message: 'Check your validation otp for delete your Accoount',
    }
  }



  async verifyRemove(payload:VerifyDeleteDTO){
      const hashedOtp = hashValue(payload.token);
      const findToken=await this.repo.findAuthToken(hashedOtp, AuthTokenType.DELETE_USER)

      if(!findToken || !findToken.userId){
        throw new AppError('Invalid otp token', 400)
      }

      const findUser=await this.repo.findUser(findToken.userId)

      // soft delete

      await this.repo.softDeleteUser(findToken.userId)

      await this.repo.markTokenUsed(findToken.id)

      await this.schedule.cleanUpUser()
      return{
        message:'User sucessfully deleted'
      }
  }

  async bannedUser(params:UserIdParamDTO){
    const findUser=await this.repo.findUser(params.id)

    if(!findUser){
      throw new AppError('User not found', 404)
    }

    await this.repo.updateUser(params.id, {
      status:UserStatus.BANNED
    })
  }

}