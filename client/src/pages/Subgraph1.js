import React,{useState,useEffect} from "react";
import Navbar from '../components/Navbar'
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(...registerables);
Chart.register(ChartDataLabels);
export default function Subgraph1(props){
    let count=JSON.parse(localStorage.getItem('CountReviews'));
    let label=['ONE','TWO','THREE','FOUR','FIVE']
    let newCount=[],newLabel=[];
    count.map((item,index)=>{
      if(item!=0){
        newCount.push(item);
        newLabel.push(label[index]);
      }
    })
    const data={
        labels:newLabel,
        datasets: [
          {
            label: "Reviews(1-5)",
            data: newCount,
            backgroundColor:[
              'rgba(255, 99, 132, 0.6)',
              'rgba(60, 179, 113,0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
            ],
            borderWidth:1,
            borderColor:'#777',
            hoverBorderWidth:3,
            hoverBorderColor:'#000'
          },
        ],
      }
    useEffect(()=>{
      const legendMarginRight={
        id:'legendMarginRight',
        afterFit(chart,args,options){
          const fitValue=chart.legend.fit;
          chart.legend.fit=function fit(){
            fitValue.bind(chart.legend)();
            let width=this.width+=100;
            return width;
          }
        }
      }
      const ctx = document.getElementById('myChart').getContext('2d');
      const myChart = new Chart(ctx, {
        type: 'pie',
        data:data,
        options:{
          responsive:true,
          maintainAspectRatio:false,
          plugins: {
            datalabels: {
              anchor:'end',
              align:'end',
              offset:5,
              formatter: (value, ctx) => {
                let sum = 0;
                let dataArr = ctx.chart.data.datasets[0].data;
                dataArr.map(data => {
                    sum += data;
                });
                let percentage = (value*100 / sum).toFixed(2)+"%";
                return percentage;
              },
              font: {
                size: 15,
                weight:"bolder"
              }
            },
            title:{
              display:true,
              padding: {
                top: 10,
                bottom: 40,
              },
              text:`Reviews For Area ${localStorage.getItem('Area')} On ${localStorage.getItem('ReviewFactor')}`,
              font: {
                size: 20,
                weight:"bolder"
              }
            },
            legend:{
              display:true,
              rtl:true,
              position:'right',
              align:'start',
              labels:{
                color:'#000',
                textAlign:'left'
              }
            },
          },
          layout:{
            padding:{
              left:50,
              bottom:30
            }
          },
        },
        plugins:[legendMarginRight]
        })
      },[])
    return(
        <main>
            <Navbar/>
            <div className="chart-container" style={{
              position: "relative", 
              height:"670px", 
              width:"1000px",
            }}>
              <canvas id="myChart"></canvas>
            </div>
        </main>
    )
}