import express from 'express'
import cors from 'cors'
import { Middleware } from './middleware'
import {CreateUserSchema,CreateRoomSchema,SignInSchema} from '@repo/common/types'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '@repo/backend-common/config'
import { prismaClient } from '@repo/db/client'
import "./types"

const app= express()
app.use(cors())
app.use(express.json())


app.post('/signup', async(req,res)=>{
    const parsedBody= CreateUserSchema.safeParse(req.body)

    if(!parsedBody.success){
        res.json({message:parsedBody.error.issues[0]?.message})
    }
    const password= req.body.password
    const hashedPassword= await bcrypt.hash(password,5)

    try{
    const user =await prismaClient.user.create({
        data:{
            name:parsedBody.data?.name as string,
            email: parsedBody.data?.email as string,
            password: hashedPassword

        }
    })
   

    res.json({message:`User created with userId:${user.id}`})    
    } catch(e){
        res.json({message:"User already exists"})
    }
})


app.post('/signin', async(req,res)=>{
    const parsedBody= SignInSchema.safeParse(req.body)

    if(!parsedBody.success){
        res.json({message:parsedBody.error.issues})
    }
    const {email,password}= req.body

    const user= await prismaClient.user.findFirstOrThrow({
        where:{
            email:email
        }
    })


    if(user){
        const verified = await bcrypt.compare(password,user.password)
        if(verified){
            const token= jwt.sign({userId:user.id},JWT_SECRET as string)
            res.status(200).json({"token":token})
        } else{
            res.json({message:"password does not match!"})
        }
    }


})


app.post('/room', Middleware, async(req,res)=>{
    const parsedBody= CreateRoomSchema.safeParse(req.body)

    if(!parsedBody.success){
        res.json({message:parsedBody.error.issues[0]?.message})
    }
    
    const userId= req.userId;
    try{
    const room= await prismaClient.room.create({
        data:{
            slug:parsedBody.data?.name as string,
            adminId:userId as string
        }
    })
    res.json({roomdId:room.id})
    } catch(e){
        res.json("room with same name already exists")
    }
    

})


app.listen(3001,()=>{console.log("listening at 3001")})