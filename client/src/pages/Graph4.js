import React from "react";
import Navbar from '../components/Navbar'
import axios from 'axios'
import { Button,Col } from "react-bootstrap";
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(...registerables);
Chart.register(ChartDataLabels);
let user=[],numRoutes=[];
async function getAllReviews(){
    let obj={},userName={};
    try{
        const review=await axios.get(`/api/v1/getAllRouter`,{
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            }});
        review.data.reviews.map((item)=>{
            if(!obj[item.userId]){
                obj[item.userId]=new Set();
                obj[item.userId].add(item.UNID);
            }
            else
                obj[item.userId].add(item.UNID);
            userName[item.userId]=item.name;
        })
        numRoutes=[];user=[];
        Object.keys(obj).map((item,index)=>{
            user.push(userName[item].split(" ")[0]);
            numRoutes.push(Array.from(obj[item]).length);
        })
    }
    catch(error){
        console.log(error)
    }
}
function getReviews(){
    return getAllReviews();
}
export default function Graph4() {
    getAllReviews();
    function generateGraph(){
        document.getElementById('buttonCol').innerHTML="";
        const data={
            labels:user,
            datasets: [
                {
                label: "Users",
                data: numRoutes,
                backgroundColor:'red',
                borderWidth:1,
                borderColor:'#777',
                hoverBorderWidth:3,
                hoverBorderColor:'#000',
                barThickness: 50,
                },
            ],
        }
        const ctx = document.getElementById('myChart').getContext('2d');
        const myChart = new Chart(ctx, {
        type: 'bar',
        data:data,
        options:{
          responsive:true,
          maintainAspectRatio:false,
          scales: {
            x: {
                title:{
                    display:true,
                    text:"Users",
                    font:{
                        weight:"bolder",
                        size:18
                    }
                },
                ticks: {
                    color:'black',
                    font:{
                        weight:"bolder",
                        size:13
                    }
                }
            },
            y: {
                title:{
                    display:true,
                    text:"Number of Routes",
                    font:{
                        weight:"bolder",
                        size:18
                    }
                },
                ticks: {
                    color:'black',
                    font:{
                        weight:"bolder",
                        size:13
                    }
                }
            }
          },
          plugins: {
            datalabels: {
                font: {
                    size: 20,
                    weight:"bolder",
                },
                color:"white"
            },
            title:{
              display:true,
              padding: {
                top: 10,
                bottom: 40,
              },
              text:`Number of Routes Vs Users`,
              font: {
                size: 20,
                weight:"bolder"
              }
            },
            legend:{
              display:false
            },
          },
          layout:{
            padding:{
              left:50,
              bottom:30
            }
          },
        },
        })
    }
    return(
        <main>
            <Navbar/>
            <div className="chart-container" style={{
                position: "relative", 
                height:"500px", 
                width:"1000px",
            }}>
                <canvas id="myChart"></canvas>
            </div>
            <Col xs="12" id="buttonCol">
                <Button className="my-1 mx-3" variant="success" onClick={generateGraph}>Generate Graph</Button>
            </Col>
        </main>
    )
}