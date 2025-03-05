import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/User.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js';
import {ApiResponse} from '../utils/ApiResponse.js';

const generateAccessAndRefreshTokens=async(userId)=>{
    try {
        const user=await User.findById(userId)
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()

        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false}) // no validation required here before saving to database

        return {accessToken, refreshToken}
    }
    catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
} 

const registerUser = asyncHandler(async (req, res) => {
    // try console log -> req.body and see structure
    const {fullname, username, email, password} = req.body;
    // console.log("email: ", email);
    

    // Add more validation logic here
    if(
        [fullname, username, email, password].some((field) => field?.trim()==="")
    ){
        throw new ApiError(400, 'All fields are required');
    }

    const existedUser=await User.findOne({
        $or:[{username}, {email}]
    })
    // Enhance by validating first user then email to provide more specific error message
    if(existedUser){
        throw new ApiError(409, 'Username or email already exists');
    }

    // console log -> req.files and see structure
    const avatarLocalPath=req.files?.avatar[0]?.path;
    // const coverImageLocalPath=req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath=req.files.coverImage[0];
    } 
    if(!avatarLocalPath){
        throw new ApiError(400, 'Avatar image is required');
    }

    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage=await uploadOnCloudinary(avatarLocalPath)

    if(!avatar){
        throw new ApiError(400, 'Avatar upload failed');
    }

    const user=await User.create({
        fullname,
        username:username.toLowerCase(),
        email,
        password,
        avatar:avatar.url,
        coverImage:coverImage?.url || ""
    })

    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken" // exclude password and refreshToken
    )

    if(!createdUser){
        throw new ApiError(500, 'User registration failed');
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    )

})

const loginUser=asyncHandler(async (req,res)=>{
    // Todo:
    // Bring data from req body
    // Username or email based
    // Find user
    // Password check
    // Generate access and refresh tokens
    // Send in the form of cookies

    const{email, username, password}=req.body
    console.log("email: ", email);

    if(!username && !email){
        throw new ApiError(400, "Username and Email is required")
    }

    // Find first occurence
    const user=await User.findOne({
        $or:[{username},{email}]
    })

    if(!user){
        throw new ApiError(404, "User does not exist")
    }

    // User: from mongoDB schema
    // user: from loggedin user
    const isPasswordValid=await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credentials")
    }

    const {accessToken, refreshToken}=await generateAccessAndRefreshTokens(user._id)
     
    const loggedInUser=await User.findById(user._id).
    select("-password -refreshToken") // get fields of user except password and refreshToken

    // Time to send cookies

    const options={
        httpOnly:true, // cannot be modified by frontend, server can only modify
        secure:true
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,{
                user:loggedInUser, accessToken, refreshToken
            },"User Logged In Successfully"
        )
    )
})

const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(req.user._id,{
        $set:{
            refreshToken:undefined
        }
    })

    const options={
        httpOnly:true,
        secure:true
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"))
})

export {registerUser, loginUser, logoutUser}