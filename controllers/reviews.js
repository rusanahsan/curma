const Review=require('../models/Review')
const Path=require('../models/Path')
const Post=require('../models/Post')
const { StatusCodes } = require('http-status-codes')
const {entryLatLng}=require('../helper')
const { BadRequestError, NotFoundError } = require('../errors')

const getAllReviews=async(req,res)=>{
    const reviews = await Review.find({ userId: req.user.userId }).sort('createdAt');
    res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
}
const getAllUsersReviews=async(req,res)=>{
    const reviews = await Review.find({}).sort('createdAt')
    res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
}
const createReview=async(req,res)=>{
    req.body.userId = req.user.userId;
    req.body.name=req.user.name;
    const UIPS=JSON.stringify(req.body.pathLat)+JSON.stringify(req.body.pathLong);
    const foundUNID=await Path.find({UIPS});
    if(foundUNID.length!=0){
        req.body.UNID=parseInt(foundUNID[0].UNID);
    }
    else{     
        const highestUNID=await Path.find({}).sort({UNID:-1}).limit(1);
        if(highestUNID.length!=0)
            req.body.UNID=parseInt(highestUNID[0].UNID)+1;
        else
            req.body.UNID=0;
        await Path.create({UIPS,UNID:req.body.UNID});
    }
    const review = await Review.create(req.body);
    entryLatLng(req.body.pathLat,req.body.pathLong,req.body.RF);
    let item=req.body;
    let obj={userId:item.userId,
        name:item.name,
        from:item.from,
        to:item.to,
        pathLat:item.pathLat,
        pathLong:item.pathLong,
        RF:item.RF,
        createdAt:new Date(),
        likedislike:{},
        numLikes:0,
        numDislikes:0};
        await Post.create(obj);
    res.status(StatusCodes.CREATED).json({ review });
}
module.exports={
    getAllReviews,
    createReview,
    getAllUsersReviews
}