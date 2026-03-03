import z from "zod";

export const createShopSchema=z.object({
    
})


export type CreateShopDTO=z.infer<typeof createShopSchema>

export const updateShopSchema=z.object({

})

export type UpdateShopDTO=z.infer<typeof updateShopSchema>

