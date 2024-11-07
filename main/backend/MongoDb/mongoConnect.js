import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();


const mongoConnect = async () => {
  try {
    const uri = process.env.DB_URI; 
     await mongoose.connect(uri, {
      
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      console.error("Mongo server is not running or accessible");
      // Handle connection refusal error here
  } else {
    console.error('Error connecting to MongoDB',error);
 //   process.exit(1); // Exit the process if unable to connect
  }
}
};

export { mongoConnect };
