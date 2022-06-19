const { StatusCodes } = require('http-status-codes')
const Review=require('../models/Review')
const Path=require('../models/Path')
const Train=require('../models/train')
const {RandomForestRegression}= require('ml-random-forest');
const SimpleLinearRegression= require('ml-regression-simple-linear');
const { DecisionTreeRegression } =require('ml-cart');
const PolynomialRegression=require('ml-regression-polynomial');
const ExponentialRegression=require('ml-regression-exponential');
const TheilSenRegression=require('ml-regression-theil-sen');
const MLR=require('ml-regression-multivariate-linear');
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
function decisionTreeRegression(record){
    let regression=[];
    for(let i=0;i<5;i++){
        let trainingSet=[],predictionSet=[];
        record.map((item)=>{
            if(item.UNID<=2){
                trainingSet.push(item.UNID);
                predictionSet.push(item.RF[i]);
            }
        })
        regression.push(new DecisionTreeRegression());
        regression[i].train(trainingSet,predictionSet);
    }
    let routeInfo={
        "route0":[],"route1":[],"route2":[]
    };
    for(let i=0;i<5;i++){
        //predictedReviews.push(regression[j].predict([0,1,2]));
        const temparr=regression[i].predict([0,1,2]);
        temparr.map((item,index)=>{
            routeInfo[`route${index}`].push(item);
        })
    }
    for(let i=0;i<3;i++){
        routeInfo[`route${i}`]=routeInfo[`route${i}`].map((item)=>{
            return Math.round((item+Number.EPSILON)*100)/100;
        });
    }
    return {routeInfo,type:"Decision Tree Regression"};
}
function linearRegression(record){
    let regression=[];
    for(let i=0;i<5;i++){
        let trainingSet=[],predictionSet=[];
        record.map((item)=>{
            if(item.UNID<=2){
                trainingSet.push(item.UNID);
                predictionSet.push(item.RF[i]);
            }
        })
        regression.push(new SimpleLinearRegression(trainingSet, predictionSet));
    }
    let routeInfo={};
    for(let i=0;i<3;i++){
        let predictedReviews=[];
        for(let j=0;j<5;j++){
            predictedReviews.push(regression[j].predict(i))
        }
        routeInfo[`route${i}`]=predictedReviews.map((item)=>{
            return Math.round((item+Number.EPSILON)*100)/100;
        });
    }
    return {routeInfo,type:"Simple Linear Regression"};
}
function polynomialRegression(record){
    let regression=[];
    const degree=5;
    for(let i=0;i<5;i++){
        let trainingSet=[],predictionSet=[];
        record.map((item)=>{
            if(item.UNID<=2){
                trainingSet.push(item.UNID);
                predictionSet.push(item.RF[i]);
            }
        })
        regression.push(new PolynomialRegression(trainingSet, predictionSet,degree));
    }
    let routeInfo={};
    for(let i=0;i<3;i++){
        let predictedReviews=[];
        for(let j=0;j<5;j++){
            predictedReviews.push(regression[j].predict(i))
        }
        routeInfo[`route${i}`]=predictedReviews.map((item)=>{
            return Math.round((item+Number.EPSILON)*100)/100;
        });
    }
    return {routeInfo,type:"Polynomial Regression"};
}
function exponentialRegression(record){
    let regression=[];
    for(let i=0;i<5;i++){
        let trainingSet=[],predictionSet=[];
        record.map((item)=>{
            if(item.UNID<=2){
                trainingSet.push(item.UNID);
                predictionSet.push(item.RF[i]);
            }
        })
        regression.push(new ExponentialRegression(trainingSet, predictionSet));
    }
    let routeInfo={};
    for(let i=0;i<3;i++){
        let predictedReviews=[];
        for(let j=0;j<5;j++){
            predictedReviews.push(regression[j].predict(i))
        }
        routeInfo[`route${i}`]=predictedReviews.map((item)=>{
            return Math.round((item+Number.EPSILON)*100)/100;
        });
    }
    return {routeInfo,type:"Exponential Regression"};
}
function tsRegression(record){
    let regression=[];
    for(let i=0;i<5;i++){
        let trainingSet=[],predictionSet=[];
        record.map((item)=>{
            if(item.UNID<=2){
                trainingSet.push(item.UNID);
                predictionSet.push(item.RF[i]);
            }
        })
        regression.push(new TheilSenRegression(trainingSet, predictionSet));
    }
    let routeInfo={};
    for(let i=0;i<3;i++){
        let predictedReviews=[];
        for(let j=0;j<5;j++){
            predictedReviews.push(regression[j].predict(i))
        }
        routeInfo[`route${i}`]=predictedReviews.map((item)=>{
            return Math.round((item+Number.EPSILON)*100)/100;
        });
    }
    return {routeInfo,type:"Theil Sen Regression"};
}
function multivariateLinearRegression(record){
    let trainingSet=[],predictionSet=[];
    record.map((item)=>{
        if(item.UNID<=2){
            trainingSet.push([item.UNID]);
            predictionSet.push(item.RF);
        }
    })
    const regression=new MLR(trainingSet, predictionSet);
    let routeInfo={};
    for(let i=0;i<3;i++){
        routeInfo[`route${i}`]=regression.predict([i]).map((item)=>{
            return Math.round((item+Number.EPSILON)*100)/100;
        });
    }
    return {routeInfo,type:"Multivariate Linear Regression"};
}
function randomForestRegression(record){
    let regression=[];
    const options = {
        seed: 3,
        replacement:true,
        nEstimators: 25
    };
    for(let i=0;i<5;i++){
        let trainingSet=[],predictionSet=[];
        record.map((item)=>{
            if(item.UNID<=2){
                trainingSet.push([item.UNID]);
                predictionSet.push(item.RF[i]);
            }
        })
        regression.push(new RandomForestRegression(options));
        regression[i].train(trainingSet,predictionSet);
    }
    let routeInfo={};
    for(let i=0;i<3;i++){
        let predictedReviews=[];
        for(let j=0;j<5;j++){
            predictedReviews.push(...regression[j].predict([[i]]))
        }
        routeInfo[`route${i}`]=predictedReviews.map((item)=>{
            return Math.round((item+Number.EPSILON)*100)/100;
        });
    }
    return {routeInfo,type:"Random Forest Regression"};
}
function statistics(record){
    let routeInfo={};
    for(let i=0;i<3;i++){
        let arr=[[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]]
        record.map((item)=>{
            if(item.UNID==i){
                item.RF.map((itm,index)=>{
                    arr[index][itm-1]+=1;
                })
            }
        })
        routeInfo[`route${i}`]=arr;
    }
    return {routeInfo,type:"info"}
}
const trainGraph=async(req,res)=>{
    let record=await Review.find({});
    const {params}=req;
    let routeInfo={};
    record=record.filter((item)=>{
        return item.UNID==18||item.UNID==17
    }).map((item)=>{
        item.UNID-=17;
        return item;
    })
    if(params.type=='slr')
        routeInfo=linearRegression(record);
    else if(params.type=='dtr')
        routeInfo=decisionTreeRegression(record)
    else if(params.type=='pr')
        routeInfo=polynomialRegression(record)
    else if(params.type=='er')
        routeInfo=exponentialRegression(record)
    else if(params.type=='tsr')
        routeInfo=tsRegression(record)
    else if(params.type=='mlr')
        routeInfo=multivariateLinearRegression(record)
    else if(params.type=='rfr')
        routeInfo=randomForestRegression(record)
    else
        routeInfo=statistics(record)
    res.status(StatusCodes.OK).json({...routeInfo});
}

module.exports={
    trainModel,
    trainOffline,
    trainGraph
}