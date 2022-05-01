import React,{useState,useRef,useEffect} from "react";
import Navbar from '../components/Navbar'
import { Button,Container,Row,Col } from "react-bootstrap";
import axios from 'axios'
import rfNames from "../components/Review-factors";
const area=new Set();
let count=[0,0,0,0,0];
let review=[];
function addressToWord(str){
    const words=str.split(',');
    const regExp=/[a-zA-Z]/g;
    for(let i=0;i<words.length;i++){
        if(regExp.test(words[i]))
            return words[i].trim();
    }
}
async function getAllReviews(){
    try{
        review=await axios.get(`/api/v1/getAllRouter`,{
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            }});
        review.data.reviews.map((item)=>{
            area.add(addressToWord(item.from).toUpperCase()+"<->"+addressToWord(item.to).toUpperCase());
        })
    }
    catch(error){
        console.log(error)
    }
}
function getReviews(){
    return getAllReviews();
}
/*
{
    Array.from(area).map((item,index)=>{
        return <option key={index} value={item}>{item}</option>
    })
}*/
//<option value="volvo">Volvo</option>
export default function Graph1() {
    const [areaList,setAreaList]=useState([]);
    const areaRef=useRef(null);
    const reviewRef=useRef(null);
    useEffect(()=>{
        getReviews()},[]);
    useEffect(()=>{
        if(areaList.length==0)
        setAreaList(Array.from(area))},[areaList])
    function generateGraph(){
        review.data.reviews.map((item)=>{
            //console.log(addressToWord(item.to)+"<->"+addressToWord(item.from))
            //console.log(areaRef.current.value)
            if(areaRef.current.value==addressToWord(item.from).toUpperCase()+"<->"+addressToWord(item.to).toUpperCase()){
                const temp=item.RF[rfNames.indexOf(reviewRef.current.value)]
                count[temp-1]++;
            }
        })
        console.log(count);
        localStorage.setItem('Area',areaRef.current.value);
        localStorage.setItem('ReviewFactor',reviewRef.current.value);
        localStorage.setItem('CountReviews',JSON.stringify(count));
        window.location.href='./subgraph1';
    }
    return(
        <main>
            <Navbar/>
            <Container className="my-5 fs-4">
            <Row>
            <Col xs="12">
            <label htmlFor="area">Choose an Area:</label>
            <select name="area" id="area" ref={areaRef}>
            {
                areaList.map((item,index)=>{
                return <option key={index} value={item}>{item}</option>
                })
            }
            </select></Col>
            <Col xs="12" className="my-5">
            <label htmlFor="area">Choose an Review Factor:</label>
            <select name="review" id="review" ref={reviewRef}>
            {
                rfNames.map((item,index)=>{
                return <option key={index} value={item}>{item}</option>
                })
            }
            </select></Col>
            <Col xs="12" className="my-5">
                <Button variant="success" onClick={generateGraph}>Generate Graph</Button>
            </Col>
            </Row>
            </Container>
        </main>
    )
}