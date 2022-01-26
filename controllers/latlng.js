const LatLng=require("../models/LatLng")
const { BadRequestError, NotFoundError } = require('../errors')
const { StatusCodes } = require('http-status-codes')
const {latlngToString}=require('../helper')
const postlatlngReviews=async(req,res)=>{
    const {maneuvers}=req.body;
    //console.log(req);
    if(!maneuvers)
        throw new BadRequestError('Please send maneuvers')
    let totalReview,totalSegment=0,segmentHit=0;
    for(let i=1;i<maneuvers.length;i++){
        totalSegment++;
        const latlng=latlngToString(maneuvers[i-1].lat,maneuvers[i-1].lng,maneuvers[i].lat,maneuvers[i].lng);
        const record=await LatLng.findOne({latlng});
        //console.log(record);
        if(record){
            segmentHit++;
            if(!totalReview)
                totalReview=Array(record.RF.length).fill(0);
            for(let j=0;j<totalReview.length;j++)
                totalReview[j]+=record.RF[j];
        }
    }
    if(segmentHit!=0)
        totalReview=totalReview.map((item)=>item/segmentHit);
    if(!totalReview)
        totalReview=Array(5).fill(0);
    res.status(StatusCodes.OK).json({totalReview,segmentHit,totalSegment});
}
module.exports={
    postlatlngReviews
}