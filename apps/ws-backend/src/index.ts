import { WebSocket, WebSocketServer } from "ws";
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '@repo/backend-common/config';
const wss= new WebSocketServer({port:8080})


interface User{
    ws:WebSocket,
    rooms: string[],
    userId:string
}


const users: User[] = [] 

function checkUser(token: string): string | null{
    const decoded= jwt.verify(token,JWT_SECRET as string)

    if(typeof token=="string"){
        return null
    }

    if(!decoded){
        return null
    }
    //@ts-ignore
    return decoded.userId
}



wss.on("connection", function connection(ws,req){

    const url= req.url
    if(!url){
        return
    }

    const queryParams= new URLSearchParams(url.split("?")[1])

    const token= queryParams.get("token") || "";
    const userId= checkUser(token)
    
    if(userId==null){
        ws.close()
        return
    }

    users.push({
        userId,
        rooms:[],
        ws

    })

    ws.on("message", function message(data){
        ws.send(`The message sent was ${data}`)
    })
})