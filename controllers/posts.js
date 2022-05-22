const Review=require('../models/Review')
const Post=require('../models/Post')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')
const { post } = require('../routes/reviews')

const createAll=async(req,res)=>{
    const reviews=await Review.find({}).sort({createdAt:-1});
    for(let i=0;i<reviews.length;i++){
        let item=reviews[i];
        await Post.create({userId:item.userId,
        name:item.name,
        from:item.from,
        to:item.to,
        pathLat:item.pathLat,
        pathLong:item.pathLong,
        RF:item.RF,
        createdAt:item.createdAt,
        likedislike:{},
        numLikes:0,
        numDislikes:0});
    }
    res.status(StatusCodes.OK).json({ success:true });
}
const getAllPosts=async(req,res)=>{
    const posts= await Post.find({}).sort({createdAt:-1});
    res.status(StatusCodes.OK).json({posts})
}
const patchPost=async(req,res)=>{
    const {_id}=req.params;
    const {changeLikes}=req.body;
    const posts=(await Post.find({_id}))[0];
    let {likedislike}=posts;
    const{userId}=req.user;
    if(!likedislike.get(userId)){
        if(changeLikes!=0)
            posts.likedislike.set(userId,changeLikes);
        if(changeLikes==1)
            posts.numLikes=posts.numLikes+1;
        else if(changeLikes==-1)
            posts.numDislikes=posts.numDislikes+1;
    }
    else{
        if(likedislike.get(userId)!=changeLikes){
            if(changeLikes==0){
                if(likedislike.get(userId)==1)
                    posts.numLikes=posts.numLikes-1;
                else
                    posts.numDislikes=posts.numDislikes-1;
                posts.likedislike.delete(userId);
            }
            else if(changeLikes==1){
                posts.numLikes=posts.numLikes+1;
                posts.numDislikes=posts.numDislikes-1;
                posts.likedislike.set(userId,changeLikes);
            }
            else{
                posts.numLikes=posts.numLikes-1;
                posts.numDislikes=posts.numDislikes+1;
                posts.likedislike.set(userId,changeLikes);
            }
        }
    }
    await Post.findOneAndUpdate({_id},posts);
    res.status(StatusCodes.OK).json({likes:posts.numLikes,dislikes:posts.numDislikes})
}
const getSinglePost=async(req,res)=>{
    const {_id}=req.params;
    const posts=(await Post.find({_id}))[0];
    res.status(StatusCodes.OK).json({posts})
}
module.exports={
    createAll,
    getAllPosts,
    patchPost,
    getSinglePost
}
