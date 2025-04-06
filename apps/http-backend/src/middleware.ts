import { Request, Response, NextFunction } from "express";
import {JWT_SECRET} from '@repo/backend-common/config'
import jwt, { JwtPayload } from 'jsonwebtoken'
import "./types"
  
export function Middleware(req:Request,res:Response,next:NextFunction){

    const auth= req.headers.authorization
    if(!auth || !auth.startsWith("Bearer")){
        res.status(401).json({message:"Invalid auth credentials.Login again"})
    }

    const token= auth?.split(" ")[1] || ""

    const decodedToken= jwt.verify(token, JWT_SECRET as string) as JwtPayload

    if(decodedToken){
        req.userId= decodedToken.userId
        next()
    } else{
        res.json("You are unauthorized")
        return
    }
    
}