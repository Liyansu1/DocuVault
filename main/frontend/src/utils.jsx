const server="http://localhost:"; //localhost server//
const ApiBaseUrl=`${server}3000`;  //main backend server.js
const IpfsBaseUrl=`${server}9090`;  //ipfs server
const SocketBaseUrl=`${server}5000`;  //socket_server.js
const ClientBaseUrl=`${server}5173`;   //frontend vite//
const contractAddress = "0x24121464627Be34DB6Aa031A65a6962F8c6d5bA4";
const contractOwner="0xFEf1F25F24D935f9A3d695C2f67A6F8E4e36Da26";

export {ApiBaseUrl,IpfsBaseUrl,SocketBaseUrl,ClientBaseUrl,contractOwner};