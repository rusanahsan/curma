const mongoose=require('mongoose');
const reviewSchema=new mongoose.Schema({
    userId:{
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide user'],
    },
    name:{
        type:String,
        required:[true,'Name of the user must be provided']
    },
    from:{
        type:String,
        required:[true,'from must be provided']
    },
    to:{
        type:String,
        required:[true,'to must be provided']
    },
    pathLat:{
        type:[Number],
        default:undefined,
        required:[true,'pathLat must be provided']
    },
    pathLong:{
        type:[Number],
        default:undefined,
        required:[true,'pathLong must be provided']
    },
    RF:{
        type:[Number],
        default:undefined,
        required:[true,'Review Array must be provided']
    }
},{ timestamps: true })
module.exports=mongoose.model('Review',reviewSchema);