const express=require('express')
const router=express.Router()
const {getUserId}=require('../controllers/userid');

router.route('/').get(getUserId);

module.exports=router;