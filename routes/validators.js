const express=require('express')
const router=express.Router()
const {validateCorrelation,instantValidate}=require('../controllers/validators');

router.route('/').get(validateCorrelation).post(instantValidate);

module.exports=router;