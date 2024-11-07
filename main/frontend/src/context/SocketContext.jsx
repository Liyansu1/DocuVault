// Context.js

import React, { createContext, useState, useRef, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';
import { useMetaMaskContext } from './MetaMaskContext';
import { SocketBaseUrl } from '../utils';

const SocketContext = createContext();

export const useSocketContext = () => useContext(SocketContext);

const socket = io(`${SocketBaseUrl}`);

export const SocketProvider = ({ children }) => {
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState();
  const [name, setName] = useState('');
  const [call, setCall] = useState({});
  const [me, setMe] = useState('');

  const [isMyVideoEnabled, setIsMyVideoEnabled] = useState(true);
  const [isMyAudioEnabled, setIsMyAudioEnabled] = useState(true);

  
  const[calling,SetCalling]=useState("");

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const { contract, account } = useMetaMaskContext();

  const toggleMyVideo = (para) => {
    setIsMyVideoEnabled(para);

    if (stream) {
      const videoTracks = stream.getVideoTracks();
      videoTracks.forEach((track) => (track.enabled = para));
    }
  };

  const toggleMyAudio = (para) => {
    setIsMyAudioEnabled(para);

    if (stream) {
      const audioTracks = stream.getAudioTracks();
      audioTracks.forEach((track) => (track.enabled = para));
    }
  };

  useEffect(() => {
    if(!account)return;
    
   //  console.log("Call",account);
    // Establish a new socket connection with the updated account
    socket.emit("join", account);
  
    socket.on('me', (id) => setMe(id));
  
    socket.on('callUser', ({ from, name: callerName, signal }) => {
      setCall({ isReceivingCall: true, from, name: callerName, signal });
    });
  
    return () => {
      // Disconnect from the current room before unmounting
      socket.emit('leaveRoom', account);
     // leaveCall();
      //setEndCall(true);
      // socket.disconnect();
    };
  }, [account]);

  useEffect(() => {
    // Listen for call rejection from the other user
    socket.on('callRejected', () => {
      // Implement your logic for handling the call rejection notification
      console.log('Call rejected by the other user');
      SetCalling("Call ended by the other user");
      
    });

    return () => {
      socket.off('callRejected');
    };
  }, [call.from]);
  
  const answerCall = () => {
    setCallAccepted(true);

    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on('signal', (data) => {
      socket.emit('answerCall', { signal: data, to: call.from, name });
    });

    peer.on('stream', (currentStream) => {
      userVideo.current.srcObject = currentStream;
     // console.log("stream1", currentStream);
    });



    peer.signal(call.signal);

    connectionRef.current = peer;
  };

  const callUser = (id) => {
    SetCalling("calling");
    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on('signal', (data) => {
      socket.emit('callUser', { userToCall: id, signalData: data, from: me, name });
    });

    peer.on('stream', (currentStream) => {
      userVideo.current.srcObject = currentStream;
    //  console.log("stream2", currentStream);
    });


    socket.on('callAccepted', ({ signal, name: calleeName }) => {
      SetCalling(`On Call ${calleeName}`);
      setCallAccepted(true);
      if (!peer.destroyed) { // Check if the peer is not destroyed
        peer.signal(signal);
      }

      setCall({ name: calleeName });


    });

    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCall({});
    setCallEnded(false);
    setCallAccepted(false);
    SetCalling("call ended");
   if(connectionRef.current){
    connectionRef.current.destroy();
   }
    
    if (userVideo.current) {
      userVideo.current.srcObject = null; // Reset srcObject
    }
    if (call.from) {
      socket.emit('callRejected', { to: call.from });
    }

  };

  return (
    <SocketContext.Provider value={{
      call,
      callAccepted,
      myVideo,
      userVideo,
      stream,
      name,
      setName,
      callEnded,
      me,
      callUser,
      leaveCall,
      answerCall,
      setStream,

      isMyVideoEnabled,
      isMyAudioEnabled,
      toggleMyVideo,
      toggleMyAudio,

     
      calling
    }}
    >
      {children}
    </SocketContext.Provider>
  );
};

