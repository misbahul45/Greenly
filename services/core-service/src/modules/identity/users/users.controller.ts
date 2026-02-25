import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
} from '@nestjs/common'
import { UsersService } from './users.service'
import ErrorHandler from '../../../libs/errors/handler.error'
import { ZodValidationPipe } from '../../../libs/pipes/zod-validation.pipe'
import {
  userQuerySchema,
  userIdParamSchema,
  createUserSchema,
  updateUserSchema,
  type UserQueryDTO,
  type UserIdParamDTO,
  type CreateUserDTO,
  type UpdateUserDTO,
  VerifyDeleteSchema,
  type VerifyDeleteDTO,
} from './users.dto'
import { Roles } from '../../auth/decorators/roles.decorator'
import { CurrentUser } from '../../auth/decorators/current-user.decorator'

@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Roles('ADMIN','SUPER_ADMIN')
  @Get()
  async findAll(
    @Query(new ZodValidationPipe(userQuerySchema))
    query: UserQueryDTO,
  ) {
    return ErrorHandler(() =>
      this.service.findAll(query),
    )
  }


  @Get(':id')
  async findOne(
    @Param(new ZodValidationPipe(userIdParamSchema))
    params: UserIdParamDTO,
    @Query(new ZodValidationPipe(userQuerySchema))
    query: UserQueryDTO,
  ) {
    return ErrorHandler(() =>
      this.service.findOne(params.id, query.include),
    )
  }

  @Roles('ADMIN','SUPER_ADMIN')
  @Post()
  async create(
    @Body(new ZodValidationPipe(createUserSchema))
    body: CreateUserDTO,
  ) {
    return ErrorHandler(() =>
      this.service.create(body.email, body.password),
    )
  }

  @Patch(':id')
  async update(
    @Param(new ZodValidationPipe(userIdParamSchema))
    params: UserIdParamDTO,
    @Body(new ZodValidationPipe(updateUserSchema))
    body: UpdateUserDTO,
  ) {
    return ErrorHandler(() =>
      this.service.update(params.id, body),
    )
  }

  @Delete('/delete')
  async remove(
    @CurrentUser() user:UserLogin,
  ) {
    return ErrorHandler(() =>
      this.service.remove(user),
    )
  }

  @Delete('/delete/verify')
  async verifyRemove(
    @Body(new ZodValidationPipe(VerifyDeleteSchema)) 
    body:VerifyDeleteDTO
  ){
    return ErrorHandler(()=>(
      this.service.verifyRemove(body)
    ))
  }
}