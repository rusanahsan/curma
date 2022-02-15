import React,{useState,useRef,useEffect} from 'react'
import Navbar from '../components/Navbar'
import logout from '../components/logout'
import {Container,Row,Col,Button,ButtonGroup,Modal} from 'react-bootstrap'
import rfNames from '../components/Review-factors'
import axios from 'axios'
import { services } from '@tomtom-international/web-sdk-services';
import SearchBox from '@tomtom-international/web-sdk-plugin-searchbox';

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
  const checkboxRef=useRef(null);
  const {L}=window;

  //eslint-disable-next-line
  const [checkbox,setCheckbox]=useState(new Array(rfNames.length).fill(false));
  //eslint-disable-next-line
  const [reviewOptimization,setReviewOptimization]=useState({routeReviews:[],optimizedRoute:0});

  const searchOptions = {
    key: process.env.REACT_APP_TOMTOM_KEY,
    language: 'en-GB',
    limit: 5,
    countrySet:"IN"
  };
// Options for the autocomplete service
  const autocompleteOptions = {
    key: process.env.REACT_APP_TOMTOM_KEY,
    language: 'en-GB'
  };
  const searchBoxOptionsFrom = {
    minNumberOfCharacters: 0,
    searchOptions: searchOptions,
    autocompleteOptions: autocompleteOptions,
    labels:{
        placeholder:"FROM....."
    },
    idleTimePress:500
  };
  const searchBoxOptionsTo = {
    minNumberOfCharacters: 0,
    searchOptions: searchOptions,
    autocompleteOptions: autocompleteOptions,
    labels:{
        placeholder:"TO....."
    },
    idleTimePress:500
  };
  const ttSearchBoxFrom = new SearchBox(services, searchBoxOptionsFrom);
  const ttSearchBoxTo = new SearchBox(services, searchBoxOptionsTo);

  useEffect(()=>{
    fromRef.current.appendChild(ttSearchBoxFrom.getSearchBoxHTML());
    toRef.current.appendChild(ttSearchBoxTo.getSearchBoxHTML());
    if(localStorage.getItem("from")&&localStorage.getItem("to")){
      document.getElementsByClassName('tt-search-box-close-icon')[0].classList.remove('-hidden');
      document.getElementsByClassName('tt-search-box-close-icon')[1].classList.remove('-hidden');
      document.getElementsByClassName('tt-search-box-input')[0].value=localStorage.getItem("from");
      document.getElementsByClassName('tt-search-box-input')[1].value=localStorage.getItem('to');
      getRoutes();
    }
    document.getElementsByClassName('tt-search-box-close-icon')[0].addEventListener('click',(e)=>{
      checkboxRef.current.checked=false;
    });
    document.getElementsByClassName('tt-search-box-input')[0].addEventListener('click',(e)=>{
      checkboxRef.current.checked=false;
    })
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
      localStorage.setItem('route_index',0);
      localStorage.setItem('maneuvers',JSON.stringify(resp));
      localStorage.setItem('from',document.getElementsByClassName('tt-search-box-input')[0].value);
      localStorage.setItem('to',document.getElementsByClassName('tt-search-box-input')[1].value);
      setRouteBtn({RI:0,showRouteBtn:true});
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
      if(!alternateroute){
        setRouteInfo(str);
        return;
      }
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
      localStorage.setItem('from',document.getElementsByClassName('tt-search-box-input')[0].value);
      localStorage.setItem('to',document.getElementsByClassName('tt-search-box-input')[1].value);
    });
    customLayer1.addTo(map);
    setCustomLayer(customLayer);
  }
  function getRoutes(){
    L.mapquest.key = process.env.REACT_APP_MAPQUEST_KEY
    let directions = L.mapquest.directions();
    asyncWrapper(L.mapquest.key,[document.getElementsByClassName('tt-search-box-input')[0].value,document.getElementsByClassName('tt-search-box-input')[1].value],{
    timeOverage:100,
    maxRoutes: 5,
  });
  directions.route({
    start: document.getElementsByClassName('tt-search-box-input')[0].value,
    end: document.getElementsByClassName('tt-search-box-input')[1].value,
    options: {
      timeOverage:100,
      maxRoutes: 5,
    }
    },createMap);
  }
function showPosition(position) {
    reverseGeolocation(position.coords.latitude,position.coords.longitude);
}
async function reverseGeolocation(latitude,longitude){
    try{
        const res=await axios.get(`https://api.tomtom.com/search/2/reverseGeocode/${latitude},${longitude}.json?key=${process.env.REACT_APP_TOMTOM_KEY}&language=en-GB&entityType=MunicipalitySubdivision`)
        document.getElementsByClassName('tt-search-box-close-icon')[0].classList.remove('-hidden');
        document.getElementsByClassName('tt-search-box-input')[0].value=res.data.addresses[0].address.freeformAddress;
    }
    catch(error){
        console.log(error);
    }
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
  function handleChange(e){
    if(!e.target.checked){
      /*if(localStorage.getItem('from'))
        document.getElementsByClassName('tt-search-box-input')[0].value=localStorage.getItem('from');
      else
        document.getElementsByClassName('tt-search-box-input')[0].value='';*/
      return;
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition,showError);
    }
    else {
      alert("Geolocation is not supported by this browser. My current location checkbox won't work");
    }
  }
  return (
    <main>
      <Navbar/>
      <section>
      <Container>
        <Row className="justify-content-center my-3">
            <Col sm="6" ref={fromRef} style={{zIndex:'999999'}}>
            </Col>
            <Col sm="6" ref={toRef} style={{zIndex:'999999'}}>
            </Col>
            <Col xs="12" className='d-flex align-items-center my-1'>
              <input type="checkbox" id="location" className="locationinput" ref={checkboxRef} onChange={handleChange}/>
              <label htmlFor="location" className="locationlabel"></label>
              <label htmlFor="location" className="locationtext mx-1 fw-bold">My current location</label>
            </Col>
            <Col>
                <ButtonGroup aria-label='map buttons' className="my-2">
                <Button variant="dark" onClick={getRoutes}>
                    Get Routes
                </Button>
                {
                  routeBtn.showRouteBtn && <Button variant='danger' onClick={()=>window.location.href="/allReviews"}>{`Review route-${routeBtn.RI}`}</Button>
                }
                <Button variant="primary" onClick={()=>setShowInfo(true)}>
                    Info
                </Button>
                <Button variant="success" onClick={()=>setShowSettings(true)}>
                    Settings
                </Button>
                </ButtonGroup>
                <Modal show={showSettings} onHide={()=>setShowSettings(false)} style={{zIndex:'9999999'}}>
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
                <Modal show={showInfo} onHide={()=>setShowInfo(false)} style={{zIndex:'9999999'}}>
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
