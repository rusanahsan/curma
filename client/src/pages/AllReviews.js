import React,{useState} from 'react'
import Navbar from '../components/Navbar'
import logout from '../components/logout'
import {Container,Row,Col,Button,Alert} from 'react-bootstrap'
import rfNames from '../components/Review-factors'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import { faStar } from '@fortawesome/free-solid-svg-icons'

export default function AllReviews(){
    if(!localStorage.getItem("name") || !localStorage.getItem("token") || !localStorage.getItem("from") || !localStorage.getItem("to") || !localStorage.getItem("maneuvers"))
        logout();
    const [review,setReview]=useState({});
    const [hover,setHover]=useState({});
    const [showAlert,setShowAlert]=useState({show:false,msg:["custom message"],variant:'danger'});

    function submitReview(){
        console.log(review);
        let notReviewed=rfNames.find((item)=>{
            return review[item]==null;
        })
        if(notReviewed){
            setShowAlert({show:true,msg:[`Please Enter Review For ${notReviewed}`],variant:'danger'});
            setTimeout(()=>setShowAlert({...showAlert,show:false}),3000);
            return;
        }
        const maneuvers=JSON.parse(localStorage.getItem('maneuvers'));
        let pathLat=maneuvers.map((item)=>{
            return item.startPoint.lat;
        })
        let pathLong=maneuvers.map((item)=>{
            return item.startPoint.lng;
        })
        let RF=rfNames.map((item)=>{
            return parseInt(review[item]);
        })
        console.log(RF);
        const obj={
            from:localStorage.getItem('from'),
            to:localStorage.getItem('to'),
            pathLat,
            pathLong,
            RF
        }
        postReview(obj);
    }
    const postReview=async(obj)=>{
        obj.UIPS=JSON.stringify(obj.pathLat)+JSON.stringify(obj.pathLong);
        try {
            setShowAlert({show:true,msg:['Waiting for server response....'],variant:`warning`})
            const response=await axios.post(`/api/v1/train`,obj,{
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                }});
            setShowAlert({...showAlert,show:false})
            const result=response.data.result;
            if(result.ml_success){
                setShowAlert({show:true,
                msg:[`${result.msg}`,`Expected RF: ${JSON.stringify(result.random_forest.map((item=>item.toFixed(2))))}`,
                `Error %: ${result.error_percentage.toFixed(2)}`,
                `Error% tolerance:30`,
                `Review Type: ${result.good_review?"GENUINE":"FAKE"}`],
                variant:'success'})
            }
            else
                setShowAlert({show:true,msg:[`${result.msg}`],variant:'danger'})
            /*await axios.post(`/api/v1/reviews`,obj,{
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                }});
            setShowAlert({show:true,msg:[`Your reviews was successfully submitted`],variant:'success'});
            setTimeout(()=>setShowAlert({...showAlert,show:false}),3000);*/
        } catch (error) {
            setShowAlert({show:true,msg:[`Something went wrong!!!
            Redirecting you to the login/register page.....`],variant:'danger'});
            setTimeout(()=>setShowAlert({...showAlert,show:false}),3000);
            console.log(error);
            //logout();
        }
    }
    function addressToWord(str){
        const words=str.split(',');
        const regExp=/[a-zA-Z]/g;
        for(let i=0;i<words.length;i++){
            if(regExp.test(words[i]))
                return words[i].trim();
        }
    }
    return(
        <main>
            <Navbar/>
            <section>
            <Container className="my-3">
            <Row className="justify-content-center">
                <Col className="display-5 text-center">
                    Route Reviews For <span className='text-capitalize text-danger'>
                        {addressToWord(localStorage.getItem('from'))}
                    </span>-<span className='text-capitalize text-success'>
                        {addressToWord(localStorage.getItem('to'))}
                    </span>
                </Col>
            </Row>
            </Container>
            <Container className='my-5'>
                <Row className="justify-content-center my-3">
                    <Col id="full-stars-example">
                        {
                            rfNames.map((item,index)=>{
                                return(
                                    <article key={index}>
                                        <span className="fs-4">{item+":"}</span>
                                        {
                                            [...Array(5)].map((itm,ind)=>{
                                                return(
                                                    <label key={ind}>
                                                        <input className="inputstar" 
                                                            name={item} 
                                                            value={ind+1} 
                                                            onClick={()=>setReview({...review,[item]:ind+1})}
                                                            type="radio"
                                                        />
                                                        <FontAwesomeIcon
                                                            icon={faStar} className="fs-4 star"
                                                            color={ind+1<=(hover[item]||review[item])?"orange":"#ddd"}
                                                            onMouseEnter={()=>setHover({...hover,[item]:ind+1})} 
                                                            onMouseLeave={()=>setHover({...hover,[item]:null})} 
                                                            onTouchStart={()=>setHover({...hover,[item]:ind+1})}
                                                            onTouchEnd={()=>setHover({...hover,[item]:null})}
                                                        />
                                                    </label>
                                                )
                                            })
                                        }
                                    </article>
                                )
                            })
                        }
                    </Col>
                </Row>
            </Container>
            <Container>
            {
                showAlert.show&&<Alert style={{maxWidth:'70%'}} className="fs-5" variant={showAlert.variant}>{showAlert.msg.map((item,index)=>{
                    return <div key={index}>
                        <>{item}</>
                        <br/>
                    </div>
                })}</Alert>
            }
            <Row className="justify-content-start my-5">
                <Col>
                    <Button className="me-1" variant="dark" onClick={submitReview}>Submit Reviews</Button>
                    <Link to="/"><Button className="ms-1" variant="dark">Back</Button></Link>
                </Col>
            </Row>
            </Container>
            </section>
        </main>
    )
}