import mongoose from "mongoose";
import dotenv from 'dotenv'

dotenv.config({
    path:'./.env'
})
  const dbConnection = ()=> {
    mongoose.connect(process.env.MONGO_URL).then(()=>{
        console.log("db connected Successfully ");
    }).catch((err)=>{
        console.log(err);

    })      
}
export default dbConnection;