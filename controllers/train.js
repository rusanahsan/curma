const { StatusCodes } = require('http-status-codes')
const Review=require('../models/Review')
const Path=require('../models/Path')
const Train=require('../models/train')
const {RandomForestRegression}= require('ml-random-forest');
const trainOffline=async(req,res)=>{
    await Path.deleteMany({});
    const record=await Review.find({});
    const options = {
        seed: 3,
        replacement:true,
        nEstimators: 25
    };
    let regression=[];
    for(let i=0;i<5;i++){
        let trainingSet=[],predictionSet=[];
        record.map((item)=>{
            trainingSet.push([item.UNID]);
            predictionSet.push(item.RF[i]);
        })
        regression.push(new RandomForestRegression(options));
        regression[i].train(trainingSet, predictionSet);
    }
    const paths=await Path.find({});
    for(let i=0;i<paths.length;i++){
        let predictedReviews=[];
        for(let j=0;j<5;j++){
            predictedReviews.push(...regression[j].predict([[paths[i].UNID]]))
        }
        await Train.create({UNID:paths[i].UNID,RF:predictedReviews});
    }
    res.status(StatusCodes.OK).json({ ml_success:true,
        msg:'Successfully Applied Random Forest Regression' });
}
const trainModel=async(req,res)=>{
    const {UIPS,RF}=req.body;
    const rec=await Path.find({UIPS});
    let result={};
    if(rec.length==0){
        result.ml_success=false;
        result.msg='Completely new route to apply ML';
    }
    else{
        result.ml_success=true;
        result.msg='Successfully ran Random forest regression';
        //result.random_forest=await Train.find({UNID:rec[0].UNID})[0].RF;
        const random_forest=await Train.find({UNID:rec[0].UNID});
        result.error_percentage=0;
        if(random_forest.length==0){
            result.ml_success=false;
            result.msg='This route is not trained yet';
        }
        else{
            result.random_forest=random_forest[0].RF;
            RF.map((item,index)=>{
                result.error_percentage+=Math.abs(item-result.random_forest[index])
            })
            result.error_percentage=result.error_percentage/25*100;
            result.good_review=result.error_percentage<=30?true:false;
        }
    }
    //let arr=[];
    /*for(let i=0;i<record.length;i++){
        let RF;
        RF=i%5+1;
        arr.push({
            id:0,
            RF
        })
    }
    for(let i=0;i<1000;i++)
        arr.push({id:0,RF:5});
    record.map((item)=>{
        arr.push({
            id:item.UNID,
            RF:item.RF[0]
        });
    })
    const dt = new DecisionTree(arr,"RF",["id"]);
    let predicted_class = dt.predict({id: 0});
    console.log(predicted_class);
    predicted_class = dt.predict({id: 1});
    console.log(predicted_class);
    predicted_class = dt.predict({id: 2});
    console.log(predicted_class);*/
    /*let x=[],y=[];
    record.map((item)=>{
        x.push(parseInt(item.UNID));
        y.push(parseInt(item.RF[4]));
    })
    const regression = new SimpleLinearRegression(x, y);
    console.log(regression.predict(0));
    console.log(regression.predict(1));
    console.log(regression.predict(2));
    console.log(regression.toString());*/
    /* const config = {
        hiddenLayers: [10,10],
        activition:'relu'
    };
    // create a simple feed forward neural network with backpropagation
    const net = new brain.NeuralNetwork();
    const record=await Review.find({});
    const highestUNID=await Path.find({}).sort({UNID:-1}).limit(1);
    const inputdata=record.map((item)=>{
        /*for(let i=0;i<item.pathLat.length;i++){
            inparr.push(parseInt(item.pathLat[i])-22);
            inparr.push(parseInt(item.pathLong[i])-88);
        }
        for(let i=0;i<item.pathLat.length;i++){
            inparr.push((parseInt(item.pathLat[i])-22)+" "+(parseInt(item.pathLong[i])-88));
        }
        const outarr=item.RF.map((itm)=>{
            return parseInt(itm)/5;
        })
        return {
            input:parseInt(item.UNID)/parseInt(highestUNID[0].UNID),
            output:outarr
        }
    })
    //console.log(inputdata);

    net.train(inputdata,{
        log:(stat)=>console.log(stat),
        iterations: 20000,
        errorThresh: 0.005
    });
    let output1=net.run(0);
    let output2=net.run(0.5);
    let output3=net.run(1);
    let str="";
    output1.map((item)=>{str=str+" "+(item*5);return 1;});
    console.log(str);
    str="";
    output2.map((item)=>{str=str+" "+(item*5);return 1;});
    console.log(str);
    str="";
    output3.map((item)=>{str=str+" "+(item*5);return 1;});
    console.log(str);
    str="";
    console.log('finished!!!')*/
    res.status(StatusCodes.OK).json({ result });
}
module.exports={
    trainModel,
    trainOffline
}