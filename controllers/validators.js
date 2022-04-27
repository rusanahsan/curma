const { StatusCodes } = require('http-status-codes')
const Review=require('../models/Review')
const Path=require('../models/Path');
const {entryLatLng}=require('../helper')
const calculateCorrelation=require('calculate-correlation');
function findCorrelation(response,ind1,ind2){
    let X=[],Y=[];
    response.map((item)=>{
        const {RF}=item;
        X.push(RF[ind1]);
        Y.push(RF[ind2]);
    })
    let correlation=calculateCorrelation(X,Y,{
        string:false,
        decimals:6
    })
    return correlation;
    /*let sumxy=0,sumx2=0,sumy2=0,meanx=0,meany=0;
    response.map((item)=>{
        const {RF}=item;
        meanx+=RF[ind1];
        meany+=RF[ind2];
    })
    meanx/=response.length;
    meany/=response.length;
    response.map((item)=>{
        const {RF}=item;
        const deviationMeanX=RF[ind1]-meanx;
        const deviationMeanY=RF[ind2]-meany;
        sumxy+=deviationMeanX*deviationMeanY;
        sumx2+=deviationMeanX*deviationMeanX;
        sumy2+=deviationMeanY*deviationMeanY;
    });
    return sumxy/Math.sqrt(sumx2*sumy2);*/
}
function findMeanDeviation(response,ind1,ind2){
    let deviation=0;
    response.map((item)=>{
        const {RF}=item;
        deviation+=Math.abs(RF[ind1]-RF[ind2]);
    })
    deviation/=response.length;
    return deviation;
}
function removeReviews(resp,ind1,ind2,flag){
    const errorPos=2,errorNeg=1.5;
    const response=[...resp];
    const condition=()=>{
        const FMD=findMeanDeviation(response,ind1,ind2)
        if(flag==1){
            console.log("RC<-->WC===> "+FMD);
            return response.length>1 && FMD>=errorPos;
        }
        else{
            console.log("WS<-->TC===> "+FMD);
            return response.length>1 && FMD<=errorNeg;
        }
    }
    response.sort((a,b)=>{
        const RF1=a.RF;
        const RF2=b.RF;
        if(flag==1)
            return Math.abs(RF1[ind1]-RF1[ind2])-Math.abs(RF2[ind1]-RF2[ind2]);
        else
            return Math.abs(RF2[ind1]-RF2[ind2])-Math.abs(RF1[ind1]-RF1[ind2]);
    })
    while(condition()){
        response.poll();
    }
    return response;
}
const validateCorrelation=async(req,res)=>{
    let highest=await Path.find({}).sort({UNID:-1}).limit(1);
    highest=highest[0].UNID;
    for(let i=0;i<=highest;i++){
        const response=await Review.find({UNID:i});
        let resp=removeReviews(response,0,2,1);
        //await Review.deleteMany({UNID:i});
        //await Review.create(resp);
        resp=removeReviews(response,1,3,-1);
        //await Review.deleteMany({UNID:i});
        //await Review.create(resp);
        //await LatLng.deleteMany({});
        //for await (const doc of Review.find()) {
          //  entryLatLng(doc.pathLat,doc.pathLong,doc.RF);
        //}
    }
    res.status(StatusCodes.OK).json({success:true});
}
function haversine(lat1,lon1,lat2,lon2){
    Number.prototype.toRad = function() {
        return this * Math.PI / 180;
    }
    let R = 6371; // km 
     //has a problem with the .toRad() method below.
    let x1 = lat2-lat1;
    let dLat = x1.toRad();  
    let x2 = lon2-lon1;
    let dLon = x2.toRad();  
    let a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
            Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);  
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    let d = R * c; 
    return d;
}
const instantValidate=async(req,res)=>{
    const disConstraint=2,timeConstraint=15;
    const {UIPS,location,pathLat,pathLong}=req.body;
    const rec=await Path.find({UIPS});
    let isSpam=false,locationBased=false;
    if(rec.length!=0){
        const resp=await Review.find({UNID:rec[0].UNID}).sort({createdAt:-1});
        if(resp.length!=0){
            const temp=resp[0].createdAt;
            const days=(Date.now()-Date.parse(temp))/(1000*60*60*24);
            if(days<timeConstraint)
                isSpam=true;
        }
    }
    const disSource=haversine(location.lat,location.long,pathLat[0],pathLong[0]);
    const disDest=haversine(location.lat,location.long,
        pathLat[pathLat.length-1],pathLong[pathLong.length-1]);
    if(disSource<=disConstraint || disDest<=disConstraint)
        locationBased=true;
    res.status(StatusCodes.OK).json({success:true,spam:isSpam,
        locationValidity:locationBased,disSource,disDest});
}
module.exports={
    validateCorrelation,
    instantValidate
}