const express=require('express')
const router=express.Router()
const {trainModel,trainOffline}=require('../controllers/train');

router.route('/').post(trainModel).get(trainOffline);

module.exports=router;