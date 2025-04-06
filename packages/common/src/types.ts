import {z} from 'zod'

export const CreateUserSchema= z.object({
    name: z.string().min(5).max(50),
    password: z.string(),
    email: z.string().email(),
})
export const SignInSchema= z.object({
    email: z.string().min(5).max(50),
    password: z.string(),
})
export const CreateRoomSchema= z.object({
    name: z.string().min(5).max(50),
})