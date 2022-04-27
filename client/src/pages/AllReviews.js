import React,{useState,useEffect} from 'react'
import Navbar from '../components/Navbar'
import logout from '../components/logout'
import {Container,Row,Col,Button,Alert,Modal} from 'react-bootstrap'
import rfNames from '../components/Review-factors'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import { faStar } from '@fortawesome/free-solid-svg-icons'
let location={};
export default function AllReviews(){
    if(!localStorage.getItem("name") || !localStorage.getItem("token") || !localStorage.getItem("from") || !localStorage.getItem("to") || !localStorage.getItem("maneuvers"))
        logout();
    const [review,setReview]=useState({});
    const [hover,setHover]=useState({});
    const [showAlert,setShowAlert]=useState({show:false,msg:["custom message"],variant:'danger'});
    const [showModal,setShowModal]=useState(false);
    useEffect(()=>{
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition,showError);
        }
        else{
            alert("Geolocation is not supported by this browser. My current location checkbox won't work");
        }
    },[])
    function submitReview(){
        //console.log(review);
        setShowModal(false);
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
        //console.log(RF);
        const obj={
            from:localStorage.getItem('from'),
            to:localStorage.getItem('to'),
            pathLat,
            pathLong,
            RF
        }
        postReview(obj);
    }
    function showPosition(position){
        location={lat:position.coords.latitude,long:position.coords.longitude};
    }
    function showError(error) {
        switch(error.code) {
            case error.PERMISSION_DENIED:
                alert("You denied the request for Geolocation. Please give permission of geolocation and try again!!");
                break;
            case error.POSITION_UNAVAILABLE:
                alert("Location information is unavailable. My current location checkbox won't work.")
                break;
            case error.TIMEOUT:
                alert("The request to get your location timed out. Please try again.")
                break;
            case error.UNKNOWN_ERROR:
                alert("An unknown error occurred fetching your location. Please try again.")
                break;
            default:
        }
    }
    const postReview=async(obj)=>{
        obj.UIPS=JSON.stringify(obj.pathLat)+JSON.stringify(obj.pathLong);
        try {
            console.log(location);
            obj.location=location;
            setShowAlert({show:true,msg:['Waiting for server response....'],variant:`warning`})
            const response=await axios.post(`/api/v1/train`,obj,{
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
            }});
            const response1=await axios.post('/api/v1/validate',obj,{
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                }
            })
            setShowAlert({...showAlert,show:false})
            const result=response.data.result;
            const {success,spam,localValidity}=response1.data;
            if(result.ml_success){
                setShowAlert({show:true,
                msg:[success?"Instant Validators ran successfully":"Instant Validators failed",
                spam?"It is a spam review":"It is not a spam review",
                localValidity?"Review is genuine due to user's location":"User's Location is not close enough to identify it as genuine review",
                `${result.msg}`,
                `Expected RF: ${JSON.stringify(result.random_forest.map((item=>item.toFixed(2))))}`,
                `Error %: ${result.error_percentage.toFixed(2)}`,
                `Error% tolerance:30`,
                `Review Type: ${result.good_review?"GENUINE":"FAKE"}`],
                variant:'success'})
            }
            else{
                setShowAlert({show:true,msg:[success?"Instant Validators ran successfully":"Instant Validators failed",
                spam?"It is a spam review":"It is not a spam review",
                localValidity?"Review is genuine due to user's location":"User's Location is not close enough to identify it as genuine review",
                `${result.msg}`],variant:'danger'})
            }
            /*await axios.post(`/api/v1/reviews`,obj,{
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                }});
            setShowAlert({show:true,msg:[`Your reviews was successfully submitted`],variant:'success'});
            setTimeout(()=>setShowAlert({...showAlert,show:false}),3000);*/
        }catch (error) {
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
                    <Button className="me-1" variant="dark" onClick={()=>setShowModal(true)}>Submit Reviews</Button>
                    <Link to="/"><Button className="ms-1" variant="dark">Back</Button></Link>
                </Col>
                <Modal show={showModal} onHide={()=>setShowModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title className='fs-5'>Confirmation Dialogue Box</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div>Are You Sure You Want To submit Your Review. You Cannot Change It Later</div>
                    </Modal.Body>
                    <Modal.Footer>
                    <Button variant="primary" onClick={submitReview}>Final Submit</Button>
                        <Button variant="danger" onClick={()=>setShowModal(false)}>Close</Button>
                    </Modal.Footer>
                </Modal>
            </Row>
            </Container>
            </section>
        </main>
    )
}