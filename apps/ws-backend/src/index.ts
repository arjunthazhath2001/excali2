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
        const parsedData= JSON.parse(data as unknown as string)
        

        //user wishes to join the room (INTENT) and also sends a particular roomId(PAYLOAD) that he wishes to join
        if(parsedData.type==="join_room"){
             const user= users.find(x=>x.ws===ws)
             user?.rooms.push(parsedData.roomId )
        }


        //user wishes to leave the room (INTENT) and also sends a particular roomId(PAYLOAD) that he wishes to leave
        if(parsedData.type==="leave_room"){
            const user= users.find(x=>x.ws===ws)
            if(!user){
                return
            }
          user.rooms= user?.rooms.filter(x=> x != parsedData.roomId)
        }


        //user wishes to send a message(INTENT) and also sends a particular message and roomId {PAYLOAD} that he wishes to send

        if(parsedData.type=="chat"){
            const roomId = parsedData.roomId
            const message= parsedData.message 

            users.forEach(user=>{
                if(user.rooms.includes(roomId)){
                    user.ws.send(JSON.stringify({
                        type:"chat",
                        message:message,
                        roomId:roomId
                    }))
                }
            })
        }






    })
})