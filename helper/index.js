const LatLng=require("../models/LatLng");
function latlngToString(lat1,lng1,lat2,lng2){
    if(lat1<lat2 || (lat1==lat2 && lng1<lng2))
        return lat1+":"+lng1+"::"+lat2+":"+lng2;
    else
        return lat2+":"+lng2+"::"+lat1+":"+lng1;
}
async function entryLatLng(lat,lng,RF){
    for(let i=1;i<lat.length;i++){
        const latlng=latlngToString(lat[i-1],lng[i-1],lat[i],lng[i]);
        const record=await LatLng.findOne({latlng});
        if(record)
            updateLatLng(record,latlng,RF);
        else
            createLatLng(latlng,RF);
    }
}
const createLatLng=async(latlng,RF)=>{
    const obj={latlng,RF,num:1};
    await LatLng.create(obj);
}
const updateLatLng=async(obj,latlng,RF)=>{
    for(let i=0;i<RF.length;i++){
        obj.RF[i]=(obj.RF[i]*obj.num+RF[i])/(obj.num+1);
    }
    ++obj.num;
    await LatLng.findOneAndUpdate({latlng},obj,{ new: true, runValidators: true });
}
module.exports={
    entryLatLng,
    latlngToString
};