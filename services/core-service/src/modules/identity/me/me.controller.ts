import { Body, Controller, Get, Patch } from '@nestjs/common';
import ErrorHandler from '../../../libs/errors/handler.error';
import { MeService } from './me.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../../libs/pipes/zod-validation.pipe';
import { type UpdateProfileDTO, UpdateProfileSchema } from './me.dto';

@Controller('me')
export class MeController {
    constructor(
        private readonly meService:MeService
    ){}
    @Get('/')
    me(
        @CurrentUser() user:UserLogin
    ){
        return ErrorHandler(()=>(
            this.meService.me(user)
        ))
    }

    @Patch('/update')
    updateProfile(
        @CurrentUser() user:UserLogin,
        @Body(new ZodValidationPipe(UpdateProfileSchema)) updateData:UpdateProfileDTO
    ){
        return ErrorHandler(()=>(
            this.meService.updateProfile(
                user.sub,
                updateData
            )
        ))
    }
}
