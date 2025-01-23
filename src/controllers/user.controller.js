import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/User.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js';
import {ApiResponse} from '../utils/ApiResponse.js';

const registerUser = asyncHandler(async (req, res) => {
    const {fullname, username, email, password} = req.body;

    // Add more validation logic here
    if(
        [fullname, username, email, password].some((field) => field?.trim()==="")
    ){
        throw new ApiError(400, 'All fields are required');
    }

    const existedUser=User.findOne({
        $or:[{username}, {email}]
    })
    // Enhance by validating first user then email to provide more specific error message
    if(existedUser){
        throw new ApiError(409, 'Username or email already exists');
    }

    const avatarLocalPath=req.files?.avatar[0]?.path;
    const coverImageLocalPath=req.files?.coverImage[0]?.path;

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

export {registerUser}