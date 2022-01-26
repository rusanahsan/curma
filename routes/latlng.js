const express=require('express')
const router=express.Router()
const {postlatlngReviews}=require('../controllers/latlng');

router.route('/').post(postlatlngReviews);

module.exports=router;