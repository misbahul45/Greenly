import { Injectable } from "@nestjs/common";
import { DatabaseService } from '../../libs/database/database.service';
import { RegisterDTO } from "./auth.dto";
import { randomAvatarUrl } from "../../common/utils/random-avatar";
import { generateOtp, hashValue } from "../../common/utils/crypto";
import { AuthTokenType } from "../../../generated/prisma/enums";
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
            }
        })
    }
    async checkUserById(id:number){
        return await this.db.user.findUnique({
            where:{
                id:id
            }
        })    
    }

}