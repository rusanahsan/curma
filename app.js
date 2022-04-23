require('dotenv').config();
require('express-async-errors');
const express=require('express');
const app=express();
const connectDB=require('./db/connect');
const reviewsRouter=require('./routes/reviews');
const authRouter = require('./routes/auth');
const latlngRouter=require('./routes/latlng');
const trainRouter=require('./routes/train');
const validateRouter=require('./routes/validators')
const errorHandlerMiddleware = require('./middleware/error-handler');
const authenticateUser = require('./middleware/authentication');
const path=require('path');
const cors=require('cors');

app.use(cors());
app.use(express.json());
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/reviews', authenticateUser,reviewsRouter);
app.use('/api/v1/latlng',authenticateUser,latlngRouter);
app.use('/api/v1/train',trainRouter);
app.use('/api/v1/validate',validateRouter);
//serve static assets  if in production
if(process.env.NODE_ENV === 'production'){
    app.use(express.static('./client/build'));
    app.get('*',(req,res)=>{
        res.sendFile(path.resolve(__dirname,'client','build','index.html'))
    })
}

app.use(errorHandlerMiddleware);

const port=process.env.PORT || 5000;
const start=async()=>{
    try{
        await connectDB(process.env.MONGO_URI);
        app.listen(port,console.log("listening on port...."+port));
    }
    catch(error){
        console.log(error);
    }
}
start();