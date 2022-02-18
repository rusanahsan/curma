const Review=require('../models/Review')
const { StatusCodes } = require('http-status-codes')
const {entryLatLng}=require('../helper')
const { BadRequestError, NotFoundError } = require('../errors')

const getAllReviews=async(req,res)=>{
    const reviews = await Review.find({ userId: req.user.userId }).sort('createdAt');
    res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
}
const createReview=async(req,res)=>{
    req.body.userId = req.user.userId;
    req.body.name=req.user.name;
    const review = await Review.create(req.body);
    entryLatLng(req.body.pathLat,req.body.pathLong,req.body.RF);
    res.status(StatusCodes.CREATED).json({ review });
}
module.exports={
    getAllReviews,
    createReview,
}