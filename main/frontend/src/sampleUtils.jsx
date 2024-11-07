const server="http://localhost:"; //localhost server//
const ApiBaseUrl=`${server}3000`;  //main backend server.js
const IpfsBaseUrl=`${server}9090`;  //ipfs server
const SocketBaseUrl=`${server}5000`;  //socket_server.js
const ClientBaseUrl=`${server}5173`;   //frontend vite//
const contractAddress = "0x5534fc747a528b4b136234b2733823629171d471";
const contractOwner="0xccBFCc2Ea11F018328072a447bd9e66711283B73";

export {ApiBaseUrl,IpfsBaseUrl,SocketBaseUrl,ClientBaseUrl,contractOwner};