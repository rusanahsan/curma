const express=require('express')
const router=express.Router()
const {getAllReviews,createReview}=require('../controllers/reviews');

router.route('/').get(getAllReviews).post(createReview);

module.exports=router;