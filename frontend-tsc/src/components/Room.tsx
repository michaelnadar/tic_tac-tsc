import { useEffect, useState ,useRef} from 'react'
import '../App.css' 
import io from 'socket.io-client';
import axios from 'axios';
import styled from 'styled-components';
function checkWinner(matrix) {
  // Check horizontal rows
  for (let i = 0; i < 3; i++) {
      if (matrix[i][0] !== "-" && matrix[i][0] === matrix[i][1] && matrix[i][1] === matrix[i][2]) {
        console.log(matrix[i][0] === matrix[i][1]);
          return matrix[i][0]; // Winner found, return the symbol
      }
  }

  // Check vertical columns
  for (let i = 0; i < 3; i++) {
      if (matrix[0][i] !== "-" && matrix[0][i] === matrix[1][i] && matrix[1][i] === matrix[2][i]) {
          return matrix[0][i]; // Winner found, return the symbol
      }
  }

  // Check main diagonal
  if (matrix[0][0] !== "-" && matrix[0][0] === matrix[1][1] && matrix[1][1] === matrix[2][2]) {
      return matrix[0][0]; // Winner found, return the symbol
  }

  // Check counter diagonal
  if (matrix[0][2] !== "-" && matrix[0][2] === matrix[1][1] && matrix[1][1] === matrix[2][0]) {
      return matrix[0][2]; // Winner found, return the symbol
  }

  // No winner found
  return null;
}
type TicTacToeBoard = Array<Array<string>>;

const handleDraw = (matrix:TicTacToeBoard)=>{
  return  matrix.some(row => row.some(cell => cell === "-"));
}

function Room({name,localAudioTrack,localVideoTrack}:{name:string,localAudioTrack:MediaStreamTrack,localVideoTrack:MediaStreamTrack}) {
  const colors = [
    "#FF5733", // Vibrant Orange
    "#FFBD33", // Bright Yellow
    "#75FF33", // Lime Green
    "#33FF57", // Spring Green
    "#33FFBD", // Turquoise
    "#3380FF", // Light Blue
    "#5733FF", // Blue-Violet
    "#BD33FF", // Bright Purple
    "#FF33A8", // Hot Pink
    "#FF3358"  // Red-Pink
  ];
  const number:TicTacToeBoard= [["-","-","-"],["-","-","-"],["-","-","-"]];
  const inputRef = useRef(null);
  const buttonRef = useRef(null);
  const [matrix, setMatrix] = useState(number);
  const [preVal,setPreVal] = useState("X");
  const [count,setCount] = useState(0);
  const [draw,setDraw] = useState(false);
  const [winner,setWinner] = useState(false);
  const [winVal,setWinVal] = useState("");
  const [disable,setDisable] = useState(false);
  const [socket,setSocket] = useState(null);
  const [room,setRoom] =useState(null);
  const [loading,setLoading] =useState(true);
  const [resetSocket,setResetSocket] = useState(false);
  const [resetData,setResetData] = useState(false);
  const [location, setLocation] = useState(null);
  const [strangerName,setStrangerName] = useState(null);
  const [myName,setMyName] =useState(null);
  const [strangerCity,setStrangerCity] =useState(null);
  const [chat,setChat] = useState('');
  const [chatArr,setchatArr] = useState([]);
  const scrollRef =useRef();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
  const [remoteMousePosition, setRemoteMousePosition] = useState({ x: 0, y: 0 });
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [remoteWidth,setRemoteWidth] =useState(null);
 const [pc,setPc] = useState<RTCPeerConnection|null>(null);
  const [videoTrack, setVideoTrack] = useState(null);
  const [audioTrack,setAudioTrack] = useState(null);
  const remoteVideoRef = useRef<HTMLVideoElement|null>(null);
  const localVideoRef = useRef(null);


  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
  //  window.addEventListener('resize', adjustScale);
    console.log(windowWidth);
    const single = windowWidth/2.4;
      console.log(single);
      setRemoteWidth(single);
    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [window.innerWidth]);
  socket?.on('mouse_point_receive',({x,y})=>{
      setRemoteMousePosition({x:x,y:y});
  })

  function getRandomColor() {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  }
  
  const handleChat = (e)=>{
    e.preventDefault();
    console.log(chat);
    if(chat !== ''){
      console.log(chat);
      const random = getRandomColor();
       const msgs = [...chatArr];
       msgs.push({You:{chat,random}});
      setchatArr(msgs);
      socket.emit('chat',{room,chat});
      console.log(chatArr);
      setChat('');
    }
  };
 
  const handleClick = (r,c) =>{
    console.log(r,c) 
    if(matrix[r][c]==="-"){
      setDisable(true);
      setCount(count=>count+1)
      console.log(count)
      if(preVal === "X"){
        setPreVal("O");
        console.log(preVal)
      }else if(preVal === "O"){
        setPreVal("X");
      }
      console.log(preVal,'hello');
      //setDisable(true)
      //const name = "micheal";
      const data = {
        room,
        preVal,
        r,
        c
      }
      socket.emit('msg',{data});
      // socket.on('receive',(preVal)=>{
        console.log(preVal);

        const newMatrix = [...matrix];
        newMatrix[r][c] = preVal;
        setMatrix(newMatrix)
   //   }); 
     
    }
    

   const winner = checkWinner(matrix);
    if (winner) {
      console.log(`Winner: ${winner}`);
        setWinner(true);
        setWinVal(winner);
        setDraw(false);
        setDisable(true);
    } else {
      console.log("No winner yet.");
    }
    if(!handleDraw(matrix)){
      //console.log('hel',handleDraw);
      setDraw(true);
    }
  }
  const handleReset =()=>{
    if(winner || draw){
     socket?.emit('reset',room);
     setMatrix(number);
     setCount(0);
     setDisable(false);
     setPreVal("X");
     setWinVal("");
     setWinner(false);
     setDraw(false);
   }
  };
 
 
 
  // 192.168.1.104
  //172.20.10.2
  useEffect(()=>{
    const pc =new  RTCPeerConnection();
    var socket = io('http://192.168.1.110:3000');
    setPc(pc);
      setSocket(socket)
      
      socket.on('connect', () => {
        console.log('connected to server');
     
    });
    if(remoteVideoRef && remoteVideoRef.current){
      console.log('inside Media to set New MediaStream()');
      remoteVideoRef.current.srcObject = new MediaStream();
    }
   
    const fetchLocation = async () => {
      try {
        const response = await axios.get(`http://ip-api.com/json`);
        setLocation(response.data);
        const city = response?.data?.city;
        socket.emit('name',{name,city});  
        setMyName(name);  
      } catch (err) {
    console.log(err);
    socket.emit('name',{name,city:'no Network'});    
      }
    };
    fetchLocation();
    socket?.on('ice-candicate',({candidate})=>{
        console.log(candidate)

        pc?.addIceCandidate(candidate);
    
     });

     socket?.on('receiveChat',(chat)=>{
      console.log(chat);
      const random = getRandomColor();
  
      const msgs = [...chatArr];
      msgs.push({Stranger:{chat,random}});
      setchatArr(msgs);
      console.log(chatArr);
    })
    
    socket?.on('userdisconnected',(data)=>{
      console.log(data,'partner disconnected');
      setResetSocket(true);
      setLoading(true);
      setResetData(true);
      setchatArr([]);
      setChat('');
      setMatrix(number);
      setCount(0);
      setDisable(false);
      setPreVal("X");
      setWinVal("");
      setWinner(false);
      setDraw(false);
    });
  
  
    socket?.on('receive',(data)=>{
      //debugger;
      const {preVal,r,c} = data.data;
      console.log(data.data)
      if(matrix[r][c]==="-"){
         setDisable(false);
         console.log(matrix)
         if(preVal === "X"){
           setPreVal("O");
           console.log(preVal)
         }else if(preVal === "O"){
           setPreVal("X");
         }
         console.log(matrix);
         const newMatrix = [...matrix];
         newMatrix[r][c] = preVal;
         setMatrix(newMatrix);
         
         const winner = checkWinner(matrix);
         console.log(winner);
         if (winner) {
          // console.log(`Winner: ${winner}`);
             setWinner(true);
             setWinVal(winner);
             setDraw(false);
             setDisable(true);
         }
         if(!handleDraw(matrix)){
         // console.log('hel',handleDraw);
          setDraw(true);
        }
         
       }else{
         console.log(count);
         console.log(matrix);
         setWinVal("");
         setWinner(false);
         setDraw(false);
          const winner = checkWinner(matrix);
         if (winner) {
          // console.log(`Winner: ${winner}`);
             setWinner(true);
             setWinVal(winner);
             setDraw(false);
             setDisable(true);
         }
         if(!handleDraw(matrix)){
         // console.log('hel',handleDraw);
          setDraw(true);
        }
       }
     });
    socket?.on('doreset',()=>{
      console.log('handlereset');
     
      setMatrix(number);
      setCount(0);
      setDisable(false);
      setPreVal("X");
      setWinVal("");
      setWinner(false);
      setDraw(false);
    })
    

     socket?.on('answer', async ({room,sdp})=>{
      console.log('answer called');
      if(sdp){
       
        if (!pc.remoteDescription) {
        pc.setRemoteDescription(sdp)};
        const answer = await pc.createAnswer();
        
        pc.setLocalDescription(answer);
       // console.log(answer);
        if(localAudioTrack){
          pc.addTransceiver(localAudioTrack);
        }
        if(localVideoTrack){
          console.log(localVideoTrack)
          pc.addTransceiver(localVideoTrack);
        }
        pc.onicecandidate = e=>{
          console.log(room,'room')
          if(!e.candidate){
            return;
          }
          if (e.candidate) {
            socket.emit("add-ice-candidate", {
              candidate: e.candidate,
              room
            })
          }
        }
        console.log(room,'room');
       console.log(pc)
    socket.emit('answer-client',{room,answer});
       
      }

     
  });

   socket?.on('client-answer',({answer})=>{
    console.log('client-answer');
    console.log(answer);
    
     

        pc.setRemoteDescription(answer);
    
    console.log(pc);
   });
    
        window.pcr = pc;
        socket?.on('room',async ({room,name,city,type})=>{
          console.log(name,city);
          setStrangerName(name);
          setStrangerCity(city);
          setRoom(room);
          setLoading(false);
         if(type === "offer"){
          
           console.log('offer called');
          //setSendingPc(pc);
          if(localAudioTrack){
            pc.addTransceiver(localAudioTrack);
          }
          if(localVideoTrack){
            pc.addTransceiver(localVideoTrack);
          }
         
              const sdp = await pc.createOffer();
              console.log(sdp);
              pc.setLocalDescription(sdp);
              socket.emit('offer',{sdp,room});
          
          pc.onicecandidate = e=>{
            if(!e.candidate){
              console.log('no candicate')
              return;
            }
            if (e.candidate) {
              
              socket.emit("add-ice-candidate", {
               candidate: e.candidate,
               room
              })
           }
          }
        
          setTimeout(()=>{
            console.log(remoteVideoRef)
            const track1 = pc.getTransceivers()[0].receiver.track
            const track2 = pc.getTransceivers()[1].receiver.track
            console.log(track2);
            // if(track2.kind === "video"){
            //       setVideoTrack(track2);
            //       setAudioTrack(track1);
            // }else{
            //   setVideoTrack(track1);
            //   setAudioTrack(track2);
            // }
            //@ts-ignore
            remoteVideoRef.current.srcObject.addTrack(track1);
            //@ts-ignore
            remoteVideoRef.current.srcObject.addTrack(track2);
            //@ts-ignore
            remoteVideoRef.current.play();
          
          },3000)
          
        }
      
      });
      pc.addEventListener('track',e=>{
        console.log("Got a track from the other peer!! How excting")
        console.log(e)
        console.log(e,'ontrack');
          const {type,track} = e;
          if(track.kind === 'video'){
            console.log(track,'video');
           // remoteVideoRef.current.srcObject.addTrack(track)
            setVideoTrack(track)
          }else{
           // remoteVideoRef.current.srcObject.addTrack(track)
            setAudioTrack(track)
          }
        //  remoteVideoRef.current.play();
        // })
    })
        // pc.ontrack = e =>{
        // 
        // }
    
        pc.oniceconnectionstatechange= e=>{
          console.log(pc.iceConnectionState);
        }
      


    if(remoteVideoRef && remoteVideoRef.current){
      console.log(remoteVideoRef,'inside remoteVideoRef');
      remoteVideoRef.current.srcObject = new MediaStream();
    }
    
    if (inputRef.current) {
      inputRef.current?.focus();
    }
   
    return () => {
      
      socket.disconnect();
      pc.close();
      console.log('Disconnected from server');
  };
    },[resetSocket]);

    useEffect(()=>{
      if(remoteVideoRef && remoteVideoRef.current){
        console.log('came in');
        if(videoTrack){
        console.log('came inside video');
        //@ts-ignore
          remoteVideoRef.current.srcObject.addTrack(videoTrack)
        }
        if(audioTrack){
          //@ts-ignore
          remoteVideoRef.current.srcObject.addTrack(audioTrack)
        }
        //@ts-ignore
        remoteVideoRef.current.play();
      }
    },[videoTrack,audioTrack])



    useEffect(()=>{
        setResetSocket(false);
    // setResetData(false);
    },[socket]);
    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        // Trigger the button click when Enter is pressed
        if (buttonRef.current) {
          buttonRef.current.click();
        }
      }
    };
   useEffect(()=>{
  scrollRef.current?.scrollIntoView({ behavior: "smooth" });
 },[chatArr]);
 const handleMouseMove = (event) => {
  setMousePosition({ x: event.clientX, y: event.clientY });
  
    if(mousePosition.x !==0 &&mousePosition.y !== 0){
    //  console.log(mousePosition);
      const x= mousePosition.x;
      const y= mousePosition.y;
  
      socket?.emit('mouse',{x,y,room});
    }
  
};




useEffect(() => {
  console.log(localVideoRef)
  console.log(localVideoRef.current);
  
  if (localVideoRef && localVideoRef.current) {
      if (localVideoTrack) {    
        console.log(localVideoTrack,'local')
          localVideoRef.current.srcObject = new MediaStream([localVideoTrack]);
          localVideoRef.current.play();
      }
  }
}, [localVideoRef,loading]);



const handleMouseDown = (event) => {
  setClickPosition({ x: event.clientX, y: event.clientY });
  console.log(clickPosition);
};

  return (
    <>
    <div>
    Hi {name}
        <video autoPlay width={400} height={400} ref={localVideoRef} />
        
        <video autoPlay width={400} height={400} ref={remoteVideoRef} />
    
    </div>
      </>
    
    
    
  )
}

export default Room

const ChatContainer = styled.div`
  display:flex;
  flex:0.4;
  flex-shrink: 0.4;
  justify-content:end;
  flex-direction:column;
  height:100%;
`

const VerticalLine = styled.div`
  width: 1px; /* Thickness of the line */
  height: 100%; /* Height of the line */
  background-color: black; /* Color of the line */
  // margin: 0 10px; /* Optional: Spacing around the line */
`;

const RemoteCursor = styled.div`
  position: absolute;
  white-space: nowrap; 
  width: 88px;
  height: 88px;
  font-size:17px;
  background: url('/icons8-cursor.svg') no-repeat center center;
  border-radius: 50%;
  pointer-events: none;
  transform: translate(-50%, -50%);
`;


const Chat = styled.div`
white-space: normal;
font-size:14px;
text-align:left;
overflow-wrap: break-word;
word-break: break-all;
overflow: hidden;
`

const breakpoints = {
  mobile: '768px',
  tablet: '1024px',
  desktop: '1200px',
};

const Tic = styled.div`
  flex:1;
  
  @media (max-width: ${breakpoints.mobile}) {
      margin-left:0px;
  }
`

const Container = styled.div`
  height: 100%;
  width: 100%;
 
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Scroll = styled.div`
 
  overflow:auto;
  /* Custom scrollbar styles for WebKit browsers */
  &::-webkit-scrollbar {
    width: 12px; /* Width of the vertical scrollbar */
    height: 12px; /* Height of the horizontal scrollbar */
  }

  &::-webkit-scrollbar-track {
    background: #242424; /* Background of the scrollbar track */
    border-radius: 6px; /* Optional: rounded corners for the track */
  }

  &::-webkit-scrollbar-thumb {
    background-color:black; /* Color of the scrollbar thumb */
    border-radius: 6px; /* Optional: rounded corners for the thumb */
    border: 3px solid orange; /* Creates padding around thumb */
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #555; /* Color of the thumb when hovered */
  }

`

  // socket?.on('disconnect',()=>{
  //   console.log(data,'partner disconnected');
  //   setResetSocket(true);
  //   setLoading(true);
  //   setResetData(true);
  //   setchatArr([]);
  //   setChat('');
  //   setMatrix(number);
  //   setCount(0);
  //   setDisable(false);
  //   setPreVal("X");
  //   setWinVal("");
  //   setWinner(false);
  //   setDraw(false);
  // })