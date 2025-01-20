import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"; // for pagination

const videoSchema=new Schema({
    videoFile:{
        type:String, // cloudinary url
        required:true,
    },
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    duration:{
        type:Number, // in seconds from cloudinary
        required:true,
    },
    isPublished:{
        type:Boolean,
        default:true,
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    thumbnail:{
        type:String,
        required:true,
    },
    views:{
        type:Number,
        default:0,
    },
},
{
    timestamps:true
})

videoSchema.plugin(mongooseAggregatePaginate) // allows to write queries for pagination

export const Video=mongoose.model("Video",videoSchema)