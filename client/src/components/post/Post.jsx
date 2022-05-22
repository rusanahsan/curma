import "./post.css";
import { MoreVert } from "@material-ui/icons";
import { Users } from "../../dummyData";
import React,{ useState,useEffect } from "react";
import { FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import { faThumbsDown, faThumbsUp,faStar } from '@fortawesome/free-solid-svg-icons'
import rfNames from "../Review-factors";
import axios from "axios";
import {Modal,Button} from 'react-bootstrap'
export default function Post({ post }) {
  const [like,setLike] = useState(post.likeColor)
  const [dislike,setDislike] = useState(post.dislikeColor)
  const [numLikes,setNumLikes]=useState(post.numLikes)
  const [numDislikes,setNumDislikes]=useState(post.numDislikes)
  const [showModal,setShowModal]=useState(false);
  const [showMap,setShowMap]=useState(false);
  const [customLayer,setCustomLayer]=useState(null);
  const {L}=window;
  useEffect(()=>{selectRoutes()},[customLayer])
  function createMap(err,response){
    setShowMap(false);
    setShowMap(true);
    let map = L.mapquest.map('map', {
      center: [26.343821, 80.230347],
      layers: L.mapquest.tileLayer('map'),
      zoom: 12,
      attributionControl: true,
    });
    const customLayer1 = L.mapquest.directionsLayer({
      startMarker: {
        icon: 'marker-start',
        draggable:false,
        iconOptions: {
          size: 'sm',
          primaryColor: '#000000',
          secondaryColor: '#1fc715',
          symbol: 'A'
        }
      },
      endMarker: {
        icon: 'marker-end',
        draggable:false,
        iconOptions: {
          size: 'sm',
          primaryColor: '#000000',
          secondaryColor: '#e9304f',
          symbol: 'B'
        }
      },
      routeRibbon: {
        color: "#5882FA",
        opacity: 0.7,
        widths: [
          10, 15, 10, 15, 10, 13, 10, 12, 10, 11, 10, 11, 10, 12, 10, 14, 10,
        ],
        showTraffic: false
      },
      alternateRouteRibbon: {
        color: "#F78181",
        opacity: 0.7,
        widths: [
          10, 15, 10, 15, 10, 13, 10, 12, 10, 11, 10, 11, 10, 12, 10, 14, 10,
        ],
        showTraffic: false,
      },
      directionsResponse: response
    });
    customLayer1.on('route_selected', function(eventResponse) {
      const loading=document.getElementById("loading");
      if(loading)
        loading.innerHTML="";
    });
    customLayer1.addTo(map);
    setCustomLayer(customLayer1)
  }
  function getRoutes(){
    L.mapquest.key = process.env.REACT_APP_MAPQUEST_KEY
    let directions = L.mapquest.directions();
  directions.route({
    start: post.from,
    end: post.to,
    options: {
      timeOverage:100,
      maxRoutes: 5,
    }
    },createMap);
  }
  async function getLikesDislike(obj){
    try{
      const LDL=await axios.patch('/api/v1/posts/'+post["_id"],obj,{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      })
      setNumLikes(LDL.data.likes);
      setNumDislikes(LDL.data.dislikes);
    }
    catch(err){
      console.log(err)
    }
  }
  const likeHandler =()=>{
    let changeLikes=0;
    if(like==="black"){
      setLike("blue");
      changeLikes=1;
      setDislike("black");
    }
    else{
      setLike("black");
      changeLikes=0;
    }
    getLikesDislike({changeLikes})
  }
  const dislikehandler=()=>{
    let changeLikes=0;
    if(dislike==="black"){
      setDislike("red");
      changeLikes=-1;
      setLike("black");
    }
    else{
      setDislike("black");
      changeLikes=0;
    }
    getLikesDislike({changeLikes})
  }
  function timeSpan(d){
    d=new Date()-d;
    d=d/60000;
    if(d<1)
      return "Less than a minute ago";
    else if(d/60<1)
      return `${Math.round(d)} minutes ago`
    else if(d/(60*24)<1)
      return `${Math.round(d/60)} hours ago`
    else if(d/(60*24*30)<1)
      return `${Math.round(d/(60*24))} days ago`
    else if(d/(60*24*365)<1)
      return `${Math.round(d/(60*24*30))} months ago`
    else
      return `${Math.round(d/(60*24*365))} years ago`
  }
  useEffect(()=>{
    if(showModal){
      const loading=document.getElementById("loading");
      loading.innerHTML="(LOADING........)";
    }
  },[showModal])
  const modelClickHandler=()=>{
    setShowModal(true);
    getRoutes()
  }
  function matchMan(maneuvers,pathLat,pathLong){
    if(!pathLat || !pathLong|| !maneuvers || pathLat.length!=maneuvers.length)
      return false;
    for(let index=0;index<maneuvers.length;index++){
      if(maneuvers[index].startPoint.lat!=pathLat[index]||maneuvers[index].startPoint.lng!=pathLong[index])
        return false;
    }
    return true;
  }
  const selectRoutes=async()=>{
    let res=await axios.post(`https://www.mapquestapi.com/directions/v2/alternateroutes?key=${process.env.REACT_APP_MAPQUEST_KEY}`,{
      timeOverage:100,
      maxRoutes: 5,
      locations:[post.from,post.to]
    })
    res=res.data;
    if(matchMan(res.route.legs[0].maneuvers,post.pathLat,post.pathLong)&&customLayer){
      customLayer.selectRoute(0);
      console.log(0);
    }
    res=res.route.alternateRoutes;
    for(let i=0;i<res.length;i++){
      if(matchMan(res[i].route.legs[0].maneuvers,post.pathLat,post.pathLong)&&customLayer){
        customLayer.selectRoute(i+1);
        console.log(i+1);
        break;
      }
    }
  }
  return (
    <div className="post">
      <div className="postWrapper">
        <div className="postTop">
          <div className="postTopLeft">
            <img
              className="postProfileImg"
              src="assets/person/2.jpeg"
              alt=""
            />
            <span className="postUsername">
              {post.name}
            </span>
            <span className="postDate">{
              timeSpan(new Date(post.createdAt))
            }</span>
          </div>
          <div className="postTopRight">
            <MoreVert />
          </div>
        </div>
        <div className="postCenter">
          <span className="postText">
            <div className="postwidth">
              <span>I have reviewed a route from </span>
              <span className="places">{post.from}</span><span> to </span>
              <span className="places">{post.to}</span>
              <div className="textBold">Latitudes:</div>
              <div className="latlng">{JSON.stringify(post.pathLat)}</div>
              <div className="textBold">Longitudes:</div>
              <div className="latlng">{JSON.stringify(post.pathLong)}</div>
                <div style={{
                  textDecoration:"underline",
                  cursor:"pointer",
                  color:"blue"
                }} onClick={modelClickHandler}>
                  Click here to view the route in the map
                </div>
                <Modal show={showModal} size="lg" onHide={()=>setShowModal(false)}>
                  <Modal.Header closeButton>
                    <Modal.Title className='fs-5'>Routes
                    <span className="places" id="loading">(LOADING........)</span>
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                  <div style={{
                    display:"grid",
                    justifyItems:"center"
                  }}>
                  {
                    showMap && <div id="map" style={{
                      width:"600px",
                      height:"400px"
                    }} >
                    </div>
                  }
                  </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="dark" onClick={()=>setShowModal(false)}>Close</Button>
                  </Modal.Footer>
                </Modal>
              <div className="mt-3">
              {rfNames.map((item,index)=>{
                return(<div key={index}>
                  {item+": "}
                  {
                    [...Array(parseInt(post.RF[index]))].map((itm,ind)=>{
                      return(
                        <FontAwesomeIcon key={ind} icon={faStar} color="orange"/>
                      )
                    })
                  }
                </div>)
              })}
              </div>
            </div>
          </span>
        <div className="postBottom mt-3">
          <div className="postBottomLeft">
            <FontAwesomeIcon icon={faThumbsUp} onClick={likeHandler} color={like}
            className="mx-1" style={{cursor: "pointer"}}/>
            <FontAwesomeIcon icon={faThumbsDown} onClick={dislikehandler} color={dislike}
            className="mx-1" style={{cursor:"pointer"}}/>
            <span className="postLikeCounter">{numLikes} Likes and {numDislikes} Dislikes</span>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
