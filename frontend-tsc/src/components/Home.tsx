import { useEffect, useRef, useState } from "react";
import  Room  from "./Room";
import styled from "styled-components";

function Home(){
    const [name, setName] = useState("");   
   const [joined,setJoined] = useState(false);
    const [localAudioTrack, setLocalAudioTrack] = useState<MediaStreamTrack | null>(null);
    const [localVideoTrack, setlocalVideoTrack] = useState<MediaStreamTrack | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
   const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const getCam = async ()=>{
    const stream = await window.navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
  });
  
   const audioTrack = stream.getAudioTracks()[0]
  const videoTrack = stream.getVideoTracks()[0]
  setLocalAudioTrack(audioTrack);
  setlocalVideoTrack(videoTrack);
  if (!videoRef.current) {
      return;
  }
  videoRef.current.srcObject = new MediaStream([videoTrack])
  videoRef.current.play();
  }
  useEffect(() => {
    // Focus on the input field when the component 
   
    console.log(videoRef.current);
    console.log(videoRef);
    console.log('hello world');
    if(videoRef && videoRef.current){
      getCam();
    console.log('hello world2');
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleKeyDown = (event:any) => {
    if (event.key === 'Enter') {
      // Trigger the button click when Enter is pressed
      if (buttonRef.current) {
        buttonRef.current.click();
      }
    }
  };
  const handleJoin = () =>{
    if(!name){
      alert('name is empty');
    }else{
      setJoined(true);
    }
  }
    if(!joined){

        return (
            <>
            <Container>
            <video autoPlay height={300} ref={videoRef}></video>
            <div>

            <input style={{padding:20,fontSize:20}} autoFocus ref={inputRef} onKeyDown={handleKeyDown}  type="text" onChange={(e) => {
                    setName(e.target.value);
                }}>
                </input>
                <button ref={buttonRef}  onClick={handleJoin}>Join</button>
            </div>
                </Container>
            </>
        )
    }

    return <Room name={name} localVideoTrack={localVideoTrack} localAudioTrack={localAudioTrack}/>
        
    
}

export default Home;

const breakpoints = {
  mobile: '768px',
  tablet: '1024px',
  desktop: '1200px',
};

const Container = styled.div`
@media (max-width: ${breakpoints.mobile}) {
  flex-direction: column;
  gap: 50px;
  
}
display: flex;
align-items: center;
justify-content: center;
height: 100%;
gap:70px;
`