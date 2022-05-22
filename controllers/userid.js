const { StatusCodes } = require('http-status-codes')
const getUserId=async(req,res)=>{
    res.status(StatusCodes.OK).json({userId:req.user.userId});
}
module.exports={
    getUserId
}