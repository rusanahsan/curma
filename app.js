require('dotenv').config();
require('express-async-errors');
const express=require('express');
const app=express();
const connectDB=require('./db/connect');
const reviewsRouter=require('./routes/reviews');
const authRouter = require('./routes/auth');
const latlngRouter=require('./routes/latlng');
const notFoundMiddleware=require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
const authenticateUser = require('./middleware/authentication');

app.use(express.static('./public'));
app.use(express.json());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/reviews', authenticateUser,reviewsRouter);
app.use('/api/v1/latlng',authenticateUser,latlngRouter);
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port=process.env.PORT || 3000;
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