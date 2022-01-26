function logout(){
  localStorage.removeItem("name");
  localStorage.removeItem("token");
  window.location.href="./index.html";
}
if(!localStorage.getItem("name") || !localStorage.getItem("token"))
    logout();
const rfNames=["Road Condition",
"Women Safety",
"Water Logging",
"Traffic Congestion",
"Frequent Gas Filling Stations"];
const container=document.querySelector('#mapcontainer');
const btnContainer=document.getElementById("btn-container");
const placesearch1=placeSearch({
  key: 'p08yX5PAYwvCu5AIPoqfkYwe1EyB2IMA',
  container: document.querySelector('#place-search-input-from'),
  useDeviceLocation:true
});
const placesearch2=placeSearch({
  key: 'p08yX5PAYwvCu5AIPoqfkYwe1EyB2IMA',
  container: document.querySelector('#place-search-input-to'),
  useDeviceLocation:true
});
document.getElementById("welcomeuser").textContent=localStorage.getItem("name");
const rfCheckbox=document.getElementById('rfCheckbox');
let routeReviews=[];
let optimizedRoute=0;
let customLayer,resp;
function insertCheckbox(){
  str="";
  for(let i=0;i<rfNames.length;i++){
    str+=`<input onchange="changeRoute()" type="checkbox" id="checkbox${i}" name="${rfNames[i]}" value="${rfNames[i]}"/>
    <label for="${rfNames[i]}">${rfNames[i]}</label></br>`;
  }
  rfCheckbox.innerHTML=str;
}
function start(){
  insertCheckbox();
  if(localStorage.getItem("from")&&localStorage.getItem("to")){
    placesearch1.setVal(localStorage.getItem("from"));
    placesearch2.setVal(localStorage.getItem('to'));
    getRoutes();
  }
}
function manToArray(maneuvers){
    maneuvers=maneuvers.map((item)=>{
      return {...item.startPoint}
    });
    return maneuvers;
}
function createMap(err, response) {
  container.innerHTML=`<div id="map"></div>`;
  let map = L.mapquest.map('map', {
    center: [26.343821, 80.230347],
    layers: L.mapquest.tileLayer('map'),
    zoom: 12,
    attributionControl: true,
  });
  customLayer = L.mapquest.directionsLayer({
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
  customLayer.on('route_selected', function(eventResponse) {
    //console.log(eventResponse);
    btnContainer.innerHTML=`<a href="./review.html" class="btn btn-danger" id="btn-review">
      Review Route-${eventResponse.route_index}
    </div>`;
    let route_index=eventResponse.route_index;
    let maneuvers=eventResponse.sourceTarget.routes[route_index].legs[0].maneuvers;
    localStorage.setItem('route_index',route_index);
    localStorage.setItem('maneuvers',JSON.stringify(maneuvers));
    localStorage.setItem('from',placesearch1.getVal());
    localStorage.setItem('to',placesearch2.getVal());
    //console.log(maneuvers);
    //console.log(manToArray(maneuvers));
  });
  customLayer.addTo(map);
}
function getRoutes(){
  //console.log(map);
  L.mapquest.key = 'p08yX5PAYwvCu5AIPoqfkYwe1EyB2IMA';
  let directions = L.mapquest.directions();
  asyncWrapper(L.mapquest.key,[placesearch1.getVal(),placesearch2.getVal()],{
    timeOverage:100,
    maxRoutes: 5,
  });
  directions.route({
    start: placesearch1.getVal(),
    end: placesearch2.getVal(),
    /*start:'jadavpur',
    end:'howrah',*/
    options: {
      timeOverage:100,
      maxRoutes: 5,
    }
  },createMap);
}
function changeRoute(){
  selectRoute();
  console.log(optimizedRoute);
  if(customLayer){
    customLayer.selectRoute(optimizedRoute);
  }
}
function selectRoute(){
  const len=rfNames.length;
  let arr=Array(routeReviews.length).fill(0);
  for(let i=0;i<len;i++){
    const checkbox=document.getElementById(`checkbox${i}`);
    if(!checkbox.checked)
      continue;
    for(let j=0;j<routeReviews.length;j++){
      arr[j]+=routeReviews[j][i];
    }
  }
  optimizedRoute=0;
  let max=arr[0];
  for(let i=1;i<routeReviews.length;i++){
    if(max<arr[i]){
      max=arr[i];
      optimizedRoute=i;
    }
  }
}
function asyncWrapper(key,locations,options){
  postRoute(key,locations,options);
}
async function postRoute(key,locations,options){
  try{
    const obj={locations,...options};
    const res=await axios.post(`http://www.mapquestapi.com/directions/v2/alternateroutes?key=${key}`,obj)
    //console.log(res.data);
    resp=res.data.route.legs[0].maneuvers;
    if(!btnContainer.innerHTML){
      localStorage.setItem('route_index',0);
      localStorage.setItem('maneuvers',JSON.stringify(resp));
      localStorage.setItem('from',placesearch1.getVal());
      localStorage.setItem('to',placesearch2.getVal());
      btnContainer.innerHTML=`<a href="./review.html" class="btn btn-danger" id="btn-review">
        Review Route-0
      </div>`;
    }
    let maneuvers=res.data.route.legs[0].maneuvers.map((item)=>{
      return {...item.startPoint}
    });
    let index=0;
    let info=await axios.post('/api/v1/latlng',{maneuvers},{
      headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
      }});
    routeReviews.push(info.data.totalReview);
    const routeinfo=document.getElementById('routeinfo');
    let str=`<div>Route index:${index} Reviews:${printArray(info.data.totalReview)} Total reviews:${info.data.segmentHit}/${info.data.totalSegment}`;
    const alternateroute=res.data.route.alternateRoutes;
    //console.log(alternateroute);
    for(let i=0;i<alternateroute.length;i++){
      index++;
      maneuvers=alternateroute[i].route.legs[0].maneuvers.map((item)=>{
        return {...item.startPoint}
      });
      info=await axios.post('/api/v1/latlng',{maneuvers},{
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        }});
      routeReviews.push(info.data.totalReview);
      str+=`<div>Route index:${index} Reviews:${printArray(info.data.totalReview)} Total reviews:${info.data.segmentHit}/${info.data.totalSegment}`;
    }
    routeinfo.innerHTML=str;
  }
  catch (error) {
    console.log(error);
  }
}
function printArray(arr){
  if(!arr||arr.length==0)
    return;
  let str="["+arr[0].toFixed(1);
  for(let i=1;i<arr.length;i++){
    str+=`,${arr[i].toFixed(1)}`
  }
  str+="]";
  return str;
}
start();