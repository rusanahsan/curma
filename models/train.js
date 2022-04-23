const mongoose=require('mongoose');
const trainSchema=new mongoose.Schema({
    UNID:{
        type:Number,
        required:[true,'Unique Natural Id must be provided']
    },
    RF:{
        type:[Number],
        default:undefined,
        required:[true,'Review Array must be provided']
    }
})
module.exports=mongoose.model('Train',trainSchema);