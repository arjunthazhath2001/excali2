import express from 'express'
import cors from 'cors'
import { Middleware } from './middleware'
import {CreateUserSchema,CreateRoomSchema,SignInSchema} from '@repo/common/types'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '@repo/backend-common/config'

const app= express()
app.use(cors())
app.use(express.json())


app.post('/signup', async(req,res)=>{
    const parsedBody= CreateUserSchema.safeParse(req.body)

    if(!parsedBody.success){
        res.json({message:parsedBody.error.issues[0]?.message})
    }
    const {username,name,password}= req.body
    const hashedPassword= await bcrypt.hash(password,5)

    //db call to check username already exists

    if(existingUser){
        res.json({message:"Username already exists"})
        return
    }

    //db to call to store hashedPassword and other details of user

    res.json({message:"User created"})    
    
})


app.post('/signin', (req,res)=>{
    const parsedBody= SignInSchema.safeParse(req.body)

    if(!parsedBody.success){
        res.json({message:parsedBody.error.issues[0]?.message})
    }
    const {username,password}= req.body

    //db call

    if(user){
        const verified = await bcrypt.compare(password,user.password)
        if(verified){
            const token= jwt.sign({user._id},JWT_SECRET as string)
            res.status(200).json({"token":token})
        } else{
            res.json({message:"password does not match!"})
        }
    }


})


app.post('/createroom', Middleware, (req,res)=>{
    const parsedBody= CreateRoomSchema.safeParse(req.body)

    if(!parsedBody.success){
        res.json({message:parsedBody.error.issues[0]?.message})
    }
    const {name}= req.body

    res.json({roomdId:123})
    

})


app.listen(3001,()=>{console.log("listening at 3001")})