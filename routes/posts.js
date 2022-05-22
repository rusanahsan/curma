const express=require('express')
const router=express.Router()
const {createAll,getAllPosts,patchPost,getSinglePost}=require('../controllers/posts');

router.route('/').get(getAllPosts).post(createAll);
router.route('/:_id').patch(patchPost).get(getSinglePost);
module.exports=router;