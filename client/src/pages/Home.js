import React,{useState,useRef,useEffect} from 'react'
import Navbar from '../components/Navbar'
import logout from '../components/logout'
import {Container,Row,Col,Button,ButtonGroup,Modal} from 'react-bootstrap'
import rfNames from '../components/Review-factors'
import axios from 'axios'

export default function Home() {
  if(!localStorage.getItem('token')||!localStorage.getItem('name'))
    logout();
  
  const [showInfo, setShowInfo] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [routeBtn,setRouteBtn]=useState({showRouteBtn:false,RI:0});
  const [routeInfo,setRouteInfo]=useState([]);
  const [customLayer,setCustomLayer]=useState(null);
  const [showMap,setShowMap]=useState(true);
  const fromRef=useRef(null);
  const toRef=useRef(null);
  const {placeSearch,L}=window;

  //eslint-disable-next-line
  const [checkbox,setCheckbox]=useState(new Array(rfNames.length).fill(false));
  //eslint-disable-next-line
  const [reviewOptimization,setReviewOptimization]=useState({routeReviews:[],optimizedRoute:0});

  useEffect(()=>{
    placeSearch({
      key: process.env.REACT_APP_MAPQUEST_KEY,
      container: fromRef.current,
      useDeviceLocation:true
    });
    placeSearch({
      key: process.env.REACT_APP_MAPQUEST_KEY,
      container: toRef.current,
      useDeviceLocation:true
    });
    if(localStorage.getItem("from")&&localStorage.getItem("to")){
      fromRef.current.value=localStorage.getItem("from");
      toRef.current.value=localStorage.getItem('to');
      getRoutes();
    }
    //eslint-disable-next-line
  },[])
  function printArray(arr){
    if(!arr||arr.length===0)
      return;
    let str="["+arr[0].toFixed(1);
    for(let i=1;i<arr.length;i++){
      str+=`,${arr[i].toFixed(1)}`
    }
    str+="]";
    return str;
  }
  function selectRoute(){
    const len=rfNames.length;
    let arr=Array(reviewOptimization.routeReviews.length).fill(0);
    for(let i=0;i<len;i++){
      if(!checkbox[i])
        continue;
      for(let j=0;j<reviewOptimization.routeReviews.length;j++){
        arr[j]+=reviewOptimization.routeReviews[j][i];
      }
    }
    reviewOptimization.optimizedRoute=0;
    let max=arr[0];
    for(let i=1;i<reviewOptimization.routeReviews.length;i++){
      if(max<arr[i]){
        max=arr[i];
        reviewOptimization.optimizedRoute=i;
      }
    }
  }
  function changeRoute(e){
    checkbox[e.target.value]=e.target.checked;
    selectRoute();
    if(customLayer){
      customLayer.selectRoute(reviewOptimization.optimizedRoute);
    }
  }
  async function postRoute(key,locations,options){
    try{
      const obj={locations,...options};
      const res=await axios.post(`https://www.mapquestapi.com/directions/v2/alternateroutes?key=${key}`,obj)
      const resp=res.data.route.legs[0].maneuvers;
      if(!routeBtn.showRouteBtn){
        localStorage.setItem('route_index',0);
        localStorage.setItem('maneuvers',JSON.stringify(resp));
        localStorage.setItem('from',toRef.current.value);
        localStorage.setItem('to',fromRef.current.value);
        setRouteBtn({RI:0,showRouteBtn:true});
      }
      let maneuvers=res.data.route.legs[0].maneuvers.map((item)=>{
        return {...item.startPoint}
      });
      let index=0;
      let info=await axios.post(`/api/v1/latlng`,{maneuvers},{
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        }});
      reviewOptimization.routeReviews.push(info.data.totalReview);
      let str=[`Route index:${index} Reviews:${printArray(info.data.totalReview)} Total reviews:${info.data.segmentHit}/${info.data.totalSegment}`];
      const alternateroute=res.data.route.alternateRoutes;
      for(let i=0;i<alternateroute.length;i++){
        index++;
        maneuvers=alternateroute[i].route.legs[0].maneuvers.map((item)=>{
          return {...item.startPoint}
        });
        info=await axios.post(`/api/v1/latlng`,{maneuvers},{
          headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
          }});
        reviewOptimization.routeReviews.push(info.data.totalReview);
        str.push(`Route index:${index} Reviews:${printArray(info.data.totalReview)} Total reviews:${info.data.segmentHit}/${info.data.totalSegment}`);
      }
      setRouteInfo(str);
    }
    catch (error) {
      console.log(error);
    }
  }
  function asyncWrapper(key,locations,options){
    postRoute(key,locations,options);
  }
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
      setRouteBtn({RI:eventResponse.route_index,showRouteBtn:true});
      let maneuvers=eventResponse.sourceTarget.routes[routeBtn.RI].legs[0].maneuvers;
      localStorage.setItem('route_index',routeBtn.RI);
      localStorage.setItem('maneuvers',JSON.stringify(maneuvers));
      localStorage.setItem('from',fromRef.current.value);
      localStorage.setItem('to',toRef.current.value);
    });
    customLayer1.addTo(map);
    setCustomLayer(customLayer);
  }
  function getRoutes(){
    L.mapquest.key = process.env.REACT_APP_MAPQUEST_KEY
    let directions = L.mapquest.directions();
    asyncWrapper(L.mapquest.key,[fromRef.current.value,toRef.current.value],{
    timeOverage:100,
    maxRoutes: 5,
  });
  directions.route({
    start: fromRef.current.value,
    end: toRef.current.value,
    options: {
      timeOverage:100,
      maxRoutes: 5,
    }
    },createMap);
  }
  return (
    <main>
      <Navbar/>
      <section>
      <Container>
        <Row className="justify-content-center my-3">
            <Col xs="6">
                <input type="search" ref={fromRef} placeholder="From....."/>
            </Col>
            <Col xs="6">
                <input type="search" ref={toRef} placeholder="To....."/>
            </Col>
            <Col>
                <ButtonGroup aria-label='map buttons' className="my-2">
                <Button variant="dark" onClick={getRoutes}>
                    Get Routes
                </Button>
                {
                  routeBtn.showRouteBtn && <Button variant='danger' onClick={()=>window.location.href="/allReviews"}>{`Route-${routeBtn.RI}`}</Button>
                }
                <Button variant="primary" onClick={()=>setShowInfo(true)}>
                    Info
                </Button>
                <Button variant="success" onClick={()=>setShowSettings(true)}>
                    Settings
                </Button>
                </ButtonGroup>
                <Modal show={showSettings} onHide={()=>setShowSettings(false)}>
                  <Modal.Header closeButton>
                    <Modal.Title className='fs-5'>Settings</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    {
                      rfNames.map((item,index)=>{
                        return(
                          <article key={index}>
                          <input onChange={changeRoute} type="checkbox" name={`checkbox${index}`} value={index}/>
                          <label htmlFor={`checkbox${index}`}>{item}</label>
                          </article>
                        )
                      })
                    }
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="dark" onClick={()=>setShowSettings(false)}>Close</Button>
                  </Modal.Footer>
                </Modal>
                <Modal show={showInfo} onHide={()=>setShowInfo(false)}>
                  <Modal.Header closeButton>
                    <Modal.Title className='fs-5'>Route Info</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    { routeInfo.map((item,index)=>{
                        return(
                          <article key={index}>{item}</article>
                        )
                      })
                    }            
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="dark" onClick={()=>setShowInfo(false)}>Close</Button>
                  </Modal.Footer>
                </Modal>
            </Col>
        </Row>
    </Container>
      <Container>
        {
        showMap && <div id="map"></div>
        }
      </Container>
      </section>
    </main>
  )
}
