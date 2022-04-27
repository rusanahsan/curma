const express=require('express')
const router=express.Router()
const {getAllUsersReviews}=require('../controllers/reviews');

router.route('/').get(getAllUsersReviews);

module.exports=router;