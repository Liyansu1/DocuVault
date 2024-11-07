import cors from "cors";
import express from "express";
import morgan from "morgan";
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const port=process.env.SERVER_PORT; //main server_port
/////.////////////////base setup////////
const app = express();
app.use(cors());
app.use(express.json());
//app.use(express.urlencoded({ extended: false }));
app.use(morgan("common"));
app.use(bodyParser.json());




//////////////////////////MongoDbFn../////////////////////////////
/////mongo///////////////
import { mongoConnect } from "./MongoDb/mongoConnect.js";
import authRouter from "./MongoDb/mongofn.js";

mongoConnect();
app.use('/auth', authRouter);
////////////////////////////////////////////////////////////

// Call the function to initialize the IPFS client
////////ipfs////////////////
import { initIPFSClient } from "./IpfsDb/ipfsConnect.js";
import ipfsRouter from "./IpfsDb/ipfsfn.js";

initIPFSClient();
app.use('/',ipfsRouter);
//////////////////////////////////////////////////////



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
