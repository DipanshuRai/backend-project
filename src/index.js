// require('dotenv').config({path:'./env'})
import dotenv from "dotenv"
import connectDB from "./db/index.js" 

dotenv.config({
    path:'./env'
})

// async function (connectDB) returns promise
connectDB()
.then(()=>{
    app.listen(process.env.PORT||8000,()=>{
        console.log(`Sever is running at port: ${process.env.PORT}`);  
    })
})
.catch((err)=>{
    console.log("MONGODB connection failed !!!",err)
})