
import { create } from "ipfs-http-client";
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/////////////////////////IPFS SERVER/////////////////////
const IPFS_NODE_HOST = process.env.IPFS_NODE_HOST;
const IPFS_NODE_PORT = process.env.IPFS_NODE_PORT;

let ipfs;
// Function to initialize IPFS client
async function initIPFSClient() {
    try {
        ipfs = create({
            host: IPFS_NODE_HOST,
            protocol: "http",
            port: IPFS_NODE_PORT,
        });

        // Check IPFS connection status
        const isOnline = await ipfs.isOnline();
        if (isOnline) {
            console.log("connected to IPFS");
        } else {
            console.log("IPFS client failed to connect");
            // Handle connection failure here
        }
    } catch (error) {
        if (error.code === "ECONNREFUSED") {
            console.error("IPFS server is not running or accessible");
            // Handle connection refusal error here
        } else {
            console.error("Error connecting to IPFS server:", error);
            // Handle other connection errors here
        }
    }
}

export {ipfs,initIPFSClient}