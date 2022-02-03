import React,{useState} from 'react'
import Navbar from '../components/Navbar'
import logout from '../components/logout'
import {Container,Row,Col,Button,Alert} from 'react-bootstrap'
import rfNames from '../components/Review-factors'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import { faStar } from '@fortawesome/free-solid-svg-icons'
import { useGlobalContext } from '../context'

export default function AllReviews(){
    if(!localStorage.getItem("name") || !localStorage.getItem("token") || !localStorage.getItem("from") || !localStorage.getItem("to") || !localStorage.getItem("maneuvers"))
        logout();
    const [review,setReview]=useState({});
    const [hover,setHover]=useState({});
    const [showAlert,setShowAlert]=useState({show:false,msg:"custom message",variant:'danger'});
    const {server}=useGlobalContext();

    function submitReview(){
        console.log(review);
        let notReviewed=rfNames.find((item)=>{
            return review[item]==null;
        })
        if(notReviewed){
            setShowAlert({show:true,msg:`Please Enter Review For ${notReviewed}`,variant:'danger'});
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
        try {
            await axios.post(`${server}/api/v1/reviews`,obj,{
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                }});
            setShowAlert({show:true,msg:`Your reviews was successfully submitted`,variant:'success'});
            setTimeout(()=>setShowAlert({...showAlert,show:false}),3000);
        } catch (error) {
            setShowAlert({show:true,msg:`Something went wrong!!!
            Redirecting you to the login/register page.....`,variant:'danger'});
            setTimeout(()=>setShowAlert({...showAlert,show:false}),3000);
            logout();
        }
    } 
    return(
        <main>
            <Navbar/>
            <section>
            <Container className="my-3">
            <Row className="justify-content-center">
                <Col className="display-5 text-center">
                    Route Reviews For <span className='text-capitalize'>
                        {localStorage.getItem('from')}
                    </span>-<span className='text-capitalize'>
                        {localStorage.getItem('to')}
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
                showAlert.show&&<Alert style={{maxWidth:'70%'}} className="fs-5" variant={showAlert.variant}>{showAlert.msg}</Alert>
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