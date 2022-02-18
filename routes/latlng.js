const express=require('express')
const router=express.Router()
const {postlatlngReviews,reEvaluateReviews}=require('../controllers/latlng');

router.route('/').post(postlatlngReviews);
router.route('/reevaluateReviews').post(reEvaluateReviews);
module.exports=router;