const express=require('express')
const router=express.Router()
const {trainModel,trainOffline,trainGraph}=require('../controllers/train');

router.route('/').post(trainModel).get(trainOffline);
router.route('/:type').get(trainGraph)
module.exports=router;