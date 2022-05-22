import Post from "../post/Post";
import Share from "../share/Share";
import "./feed.css";
import { Posts } from "../../dummyData";
import React, { useEffect,useState } from 'react'
import axios from "axios";
export default function Feed() {
  const [postarray,setPostarray]=useState([])
  const [userId,setUserId]=useState("")
  useEffect(()=>{
    if(postarray.length!=0)
      return;
    getInputData();
  },[postarray])
  async function getInputData(){
    try{
    const posts=await axios.get(`/api/v1/posts`,{
      headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
      }});
      const u=await axios.get('/api/v1/userid',{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      })
      setUserId(u.data.userId);
    for(let i=0;i<posts.data.posts.length;i++){
        const likedislike=posts.data.posts[i].likedislike;
          if(likedislike[u.data.userId]!=1 && likedislike[u.data.userId]!=-1){
            posts.data.posts[i].likeColor="black";
            posts.data.posts[i].dislikeColor="black";
          }
          else if(likedislike[u.data.userId]==1){
            posts.data.posts[i].likeColor="blue";
            posts.data.posts[i].dislikeColor="black";
          }
          else{
            posts.data.posts[i].likeColor="black";
            posts.data.posts[i].dislikeColor="red";
          }
    }
    setPostarray(posts.data.posts.slice(0,50))
    }
    catch(error){
      console.log(error);
    }
  }
  return (
    <div className="feed">
      <div className="feedWrapper">
        {postarray.length>0 && postarray.map((p) =>{
          return (
          <Post key={p["_id"]} post={p} />
        )})}
      </div>
    </div>
  );
}
