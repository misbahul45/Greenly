import { Injectable } from "@nestjs/common";
import { DatabaseService } from '../../libs/database/database.service';
import { RegisterDTO } from "./auth.dto";
import { randomAvatarUrl } from "../../common/utils/random-avatar";
import { generateOtp, hashValue } from "../../common/utils/crypto";
import { AuthTokenType, UserStatus } from "../../../generated/prisma/enums";
import * as bcrypt from 'bcrypt'
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
    async checkUserById(id:number){
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

    async findAuthToken(tokenHash:string, tokenType:AuthTokenType){
        return await this.db.authToken.findUnique({
            where:{
                tokenHash,
                type:tokenType
            },
        })
    }

    async findOTPToken(id:number, tokenType:AuthTokenType){
        return await this.db.authToken.findUnique({
            where:{
                id:id,
                type:tokenType
            },
        })
    }

    async verifyEmail(userId:number){
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

    async markTokenUsed(tokenId:number){
        return await this.db.authToken.update({
            where:{
                id:tokenId
            },
            data:{
                usedAt:new Date()
            }
        })
    }

    async saveToken(payload: {
        userId: number;
        token: string;
        expiresAt: Date;
        tokenType:AuthTokenType;
    }) {

        const hashedToken = await bcrypt.hash(payload.token, 10);

        return this.db.authToken.create({
            data: {
                userId: payload.userId,
                tokenHash: hashedToken,
                type:payload.tokenType,
                expiresAt: payload.expiresAt,
            },
        });
    }
    async getUserPermissions(userId: number): Promise<string[]> {
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
        })

        if (!user) return []

        const permissions = new Set<string>()

        user.roles.forEach((ur) => {
            ur.role.permissions.forEach((p) =>
            permissions.add(p.name),
            )
        })

        return [...permissions]
    }

    async changePassword(userId:number, passwordHash:string){
        return await this.db.user.update({
            where:{
                id:userId,
            },
            data:{
                passwordHash
            }
        })
    }
}