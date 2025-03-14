import express from "express"
// Cross origin resource sharing
// Used in case of middleware
import cors from "cors"
import cookieParser from "cookie-parser"
// routes import
import userRouter from "./routes/user.routes.js"

const app=express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

// Configurations of express
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true, limit:"16kb"}))
app.use(express.static("public")) // public folder
app.use(cookieParser( ))
app.use("/api/v1/users",userRouter) // routes declaration

export {app}