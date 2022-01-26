function logout(){
    localStorage.removeItem("name");
    localStorage.removeItem("token");
    window.location.href="./index.html";
}
if(!localStorage.getItem("name") || !localStorage.getItem("token") || !localStorage.getItem("from") || !localStorage.getItem("to") || !localStorage.getItem("maneuvers"))
    logout();
const fromto=document.getElementById('fromto');
fromto.textContent=localStorage.getItem('from')+" - "+localStorage.getItem('to');
const inputlist=document.getElementsByTagName('input');
const rfLength=5;
const rfNames=["Road Condition",
"Women Safety",
"Water Logging",
"Traffic Congestion",
"Frequent Gas Filling Stations"];
let pathLat=[],pathLong=[];
document.getElementById("welcomeuser").textContent=localStorage.getItem("name");
getPathLatLong();
const message=document.getElementById("message");
function getPathLatLong(){
    const maneuvers=JSON.parse(localStorage.getItem('maneuvers'));
    for(let i=0;i<maneuvers.length;i++){
        pathLat.push(maneuvers[i].startPoint.lat);
        pathLong.push(maneuvers[i].startPoint.lng);
    }
    console.log(pathLat,pathLong);
}
function submitReview(){
    const RF=Array(rfLength).fill(0);
    for(let i=0;i<inputlist.length;i++){
        if(inputlist[i].checked==true){
            let ind=parseInt(inputlist[i].name.substring(inputlist[i].name.length-1));
            RF[ind]=parseInt(inputlist[i].value);
        }
    }
    for(let i=0;i<rfLength;i++){
        if(RF[i]==0){
            message.innerHTML=`<div class="text-warning">Please enter the review for ${rfNames[i]}</div>`;
            setTimeout(()=>{message.innerHTML=""},3000);
            return;
        }
    }
    let obj={
        from:localStorage.getItem('from'),
        to:localStorage.getItem('to'),
        pathLat:pathLat,
        pathLong:pathLong,
        RF:RF
    };
    postReview(obj);
    //console.log(RF);
}
const postReview=async(obj)=>{
    try {
        await axios.post('/api/v1/reviews',obj,{
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            }});
        message.innerHTML=`<div class="text-success">Your reviews was successfully submitted</div>`;
        setTimeout(()=>{message.innerHTML=""},3000);
    } catch (error) {
        message.innerHTML=`<div class="text-danger">Something went wrong!!!</br>
        Redirecting you to the login/register page.....
        </div>`;
        setTimeout(()=>{message.innerHTML=""},3000);
    }
} 