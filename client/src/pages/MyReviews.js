import React,{useEffect,useState} from 'react'
import Navbar from '../components/Navbar'
import logout from '../components/logout'
import {Container,Row,Col,Table,Alert} from 'react-bootstrap'
import axios from 'axios'

export default function AllReviews(){
    if(!localStorage.getItem("name") || !localStorage.getItem("token"))
        logout();
    const[reviews,setReviews]=useState({"latlongarr":[]})
    const[showAlert,setShowAlert]=useState({show:false,msg:'custom message',variant:'danger'})

    function handleClick(e,num){
        let ind=e.target.parentNode.rowIndex;
        if(e.target.textContent==='[Array]'){
            e.target.textContent=JSON.stringify(reviews.latlongarr[ind-1][num]);
            e.target.classList.remove("text-danger");
            e.target.classList.add("text-primary");
        }
        else{
            e.target.textContent=`[Array]`;
            e.target.classList.remove("text-primary");
            e.target.classList.add("text-danger");
        }
    }
    //eslint-disable-next-line
    useEffect(()=>{getReviews()},[])
    const getReviews=async()=>{
        try{
            const review=await axios.get(`/api/v1/reviews`,{
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                }});
            setReviews({...review,latlongarr:[]})
        }
        catch(error){
            setShowAlert({...showAlert,show:true,msg:`Something went wrong!!!!`})
            setTimeout(()=>setShowAlert({...showAlert,show:false}),3000);
            logout();
        }
    }
    return(
        <main>
            <Navbar/>
            <section>
            <Container fluid className="my-5">
                <Row className="justify-content-center">
                    <Col>
                        {
                            showAlert.show?(
                            <Alert
                                className="fs-3 text-center" 
                                variant={showAlert.variant}>
                                    {showAlert.msg}
                            </Alert>):
                            (reviews.data && reviews.data.count!==0)?(
                                <Table striped bordered responsive hover>
                                    <thead>
                                        <tr>
                                            <th>From</th>
                                            <th>To</th>
                                            <th>Path Latitudes</th>
                                            <th>Path Longitudes</th>
                                            <th>Reviews(in order)</th>
                                            <th>Created At</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            reviews.data.reviews.map((item,index)=>{
                                                reviews.latlongarr.push([item.pathLat,item.pathLong]);
                                                return(
                                                    <tr key={index}>
                                                        <td>{item.from}</td>
                                                        <td>{item.to}</td>
                                                        <td onClick={(e)=>handleClick(e,0)} style={{cursor:"pointer"}} className="text-danger">[Array]</td>
                                                        <td onClick={(e)=>handleClick(e,1)} style={{cursor:"pointer"}} className="text-danger">[Array]</td>
                                                        <td>{JSON.stringify(item.RF)}</td>
                                                        <td>{item.createdAt}</td>
                                                    </tr>
                                                )
                                            })
                                        }
                                    </tbody>
                                </Table>
                                ):(
                                <Alert
                                    className="fs-3 text-center text-capitalize" 
                                    variant="success">
                                        you are yet to review a route
                                </Alert>
                            )
                        }
                    </Col>
                </Row>
            </Container>
            </section>
        </main>
    )
}