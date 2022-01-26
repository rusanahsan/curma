const mongoose=require('mongoose');
const latlngSchema=new mongoose.Schema({
    latlng:{
        type:String,
        required:[true,'Latitude-Longitude String must be provided'],
        unique:true
    },
    num:{
        type:Number,
        required:[true,'Number of reviews must be provided']
    },
    RF:{
        type:[Number],
        default:undefined,
        required:[true,'Review Array must be provided']
    }
});
module.exports=mongoose.model('LatLng',latlngSchema);