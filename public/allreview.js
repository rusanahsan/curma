function logout(){
    localStorage.removeItem("name");
    localStorage.removeItem("token");
    window.location.href="./index.html";
}
if(!localStorage.getItem("name") || !localStorage.getItem("token"))
    logout();
document.getElementById("welcomeuser").textContent=localStorage.getItem("name");
let latlongarr=[];
function createTable(reviews){
    const inserttable=document.getElementById("inserttable")
    latlongarr=[];
    //console.log(reviews);
    if(reviews.data.count==0){
        inserttable.innerHTML=`<div class="text-capitalize fs-1 text-center">You are yet to review a route<div>`;
        return;
    }
    let str=`<table class="table table-striped table-bordered" id="db">
    <thead>
        <tr>
            <th scope="col">From</th>
            <th scope="col">To</th>
            <th scope="col">Path Latitudes</th>
            <th scope="col">Path Longitudes</th>
            <th scope="col">Reviews(in order)</th>
            <th scope="col">Created At</th>
        </tr>
    </thead>
    <tbody>`;
    for(let i=0;i<reviews.data.count;i++){
        let rev=reviews.data.reviews[i];
        str+=`<tr>
        <td>${rev.from}</td>
        <td>${rev.to}</td>
        <td onclick="changeExpandLat(this)" style="cursor:pointer;" class="text-danger">[Array]</td>
        <td onclick="changeExpandLong(this)" style="cursor:pointer;" class="text-danger">[Array]</td>
        <td>${JSON.stringify(rev.RF)}</td>
        <td>${rev.createdAt}</td>
        </tr>`;
        latlongarr.push([rev.pathLat,rev.pathLong]);
    }
    str+=`</tbody></table>`;
    inserttable.innerHTML=str;
}
function changeExpandLat(obj){
    changeExpand(obj,0);
}
function changeExpandLong(obj){
    changeExpand(obj,1);
}
function changeExpand(obj,num){
    const db=document.getElementById('db');
    let ind=obj.parentNode.rowIndex;
    //console.log(obj.textContent);
    if(obj.textContent==='[Array]'){
        obj.textContent=JSON.stringify(latlongarr[ind-1][num]);
        obj.classList.remove("text-danger");
        obj.classList.add("text-primary");
    }
    else{
        obj.textContent=`[Array]`;
        obj.classList.remove("text-primary");
        obj.classList.add("text-danger");
    }
}
function fetchReviews(){
    getReviews();
}
const getReviews=async()=>{
    try{
        const reviews=await axios.get('/api/v1/reviews',{
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            }});
        createTable(reviews);
    }
    catch(error){
        document.getElementById("inserttable").innerHTML=`<div class="text-capitalize fs-1 text-center text-danger">
        something went wrong!!!!</br>
        redirecting to login/register page.......
        <div>`;
        setTimeout(logout,3000);
    }
}
fetchReviews();