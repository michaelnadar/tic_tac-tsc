import { Socket } from "socket.io";


let GLOBAL_ROOM_ID = 1;

interface User{
    name:string |undefined,
    socket:Socket,
    city:string| undefined,
    width:Number |undefined,
    height:Number|undefined
}
interface Room{
    user1:User,
    user2:User
}

 export default class Users {
    private userDisconnect :Map<User| undefined,string>;
    private  room : Map<string | undefined,Room>;
    private  user : User[];
    private queue : string[];

    constructor(){
        this.room = new Map<string|undefined,Room>;
        this.user = [];
        this.queue = [];
        this.userDisconnect = new Map<User| undefined,string>;
    }

        createUser(socket:Socket,name:string,city:string,width:Number,height:Number){
        console.log(`user connected ${socket.id}`);
        this.user.push({
            name,socket,city,width,height
        });
        this.queue.push(socket.id);
        this.clearQueue();
        this.handleQuery(socket);
    }

    removeUser(socket:string){
        const user = this.user.find(x=>x.socket.id===socket);
      //  const data = this.room.filter(([k,v])=>v===user)
        const roomId = this.userDisconnect.get(user);
        const room = this.room.get(roomId);
        if(room !== undefined){
            const userF = room.user1 === user ? room.user2: room.user1;
            userF.socket.emit('userdisconnected',
                'user got disconnected'
            )
        }
        this.user = this.user.filter(x=>x.socket.id !== socket);
        this.queue = this.queue.filter(x=>x !== socket);
    }

    clearQueue(){
       // console.log(this.queue.length);
        if(this.queue.length < 2){
            return;
        }
        this.user.forEach(x=>{
            console.log(x.socket.id);
        })
        const id1 = this.queue.pop();
        const id2 = this.queue.pop();
      //  console.log(id1,id2);

        const user1 = this.user.find(x=>x.socket.id === id1);
        const user2 = this.user.find(x=>x.socket.id === id2);
       
        if(!user1 || !user2){
            return;
        }
        console.log("creating room");
        this.clearRoom(user1,user2);
        this.clearQueue();
    }

    clearRoom(user1:User,user2:User){
            const roomId =this.generate();
            console.log(roomId);
            this.userDisconnect.set(user1,roomId.toString());
            this.userDisconnect.set(user2,roomId.toString());
             this.room.set(roomId.toString(),{
                user1,user2
            });
            console.log(roomId,user1.city);
            console.log(roomId,user2.city);
           
            user1.socket.emit('room',
            {
                room:roomId,
                name:user2.name,
                city:user2.city,
                width:user2.width,
                height:user2.height
            }
            )
            user2.socket.emit('room',
            {
                room:roomId,
                name:user1.name,
                city:user1.city,
                width:user1.width,
                height:user1.height
            }
            )
            
    }
    
    handleQuery(socket:Socket){
            socket.on('offer',({sdp,room})=>{
                const roomId = room?.toString();
                const rooom = this.room.get(roomId);
                const user = rooom?.user1.socket.id === socket.id ? rooom.user2 :rooom?.user1;
                user?.socket.emit('answer',{room,sdp});
            });
            socket.on('answer-client',({room,answer})=>{
                // client-answer
                console.log(room,answer);
                const roomId = room?.toString();
                const rooom = this.room.get(roomId);
                const user = rooom?.user1.socket.id === socket.id ? rooom.user2 :rooom?.user1;
                user?.socket.emit('client-answer',{room,answer});
            })
            socket.on("add-ice-candidate", ({candidate, room,type}) => {
                const roomId = room?.toString();
                const rooom = this.room.get(roomId);
                const user = rooom?.user1.socket.id === socket.id ? rooom.user2 :rooom?.user1;
                user?.socket.emit('ice-candicate',{candidate,type});
               // this.onIceCandidates(roomId, socket.id, candidate, type);
            });
        }
    generate(){
        return GLOBAL_ROOM_ID++;
    }

}