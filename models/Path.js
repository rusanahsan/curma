const mongoose=require('mongoose');
const pathSchema=new mongoose.Schema({
    UNID:{
        type:Number,
        required:[true,'Unique Natural Id must be provided']
    },
    UIPS:{
        type:String,
        required:[true,'Unique Identifiable Path String must be provided']
    }
})
module.exports=mongoose.model('Path',pathSchema);