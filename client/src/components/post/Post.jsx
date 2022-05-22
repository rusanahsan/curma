import "./post.css";
import { MoreVert } from "@material-ui/icons";
import { Users } from "../../dummyData";
import React,{ useState,useEffect } from "react";
import { FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import { faThumbsDown, faThumbsUp,faStar } from '@fortawesome/free-solid-svg-icons'
import rfNames from "../Review-factors";
import axios from "axios";
export default function Post({ post }) {
  const [like,setLike] = useState(post.likeColor)
  const [dislike,setDislike] = useState(post.dislikeColor)
  const [numLikes,setNumLikes]=useState(post.numLikes)
  const [numDislikes,setNumDislikes]=useState(post.numDislikes)

  async function getColorLikes(){
    try{
      const posts=await axios.get('/api/v1/posts/'+post["_id"],{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      })
      const likedislike=posts.data.posts.likedislike;
          if(likedislike[post.userId]!=1 && likedislike[post.userId]!=-1){
            setLike("black");
            setDislike("black");
          }
          else if(likedislike[post.userId]==1){
            setLike("blue");
            setDislike("black");
          }
          else{
            setLike("black");
            setDislike("red");
          }
    }
    catch(err){
      console.log(err)
    }
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
              {`I have reviewed a route from ${post.from} to ${post.to} with 
              Latitudes: ${JSON.stringify(post.pathLat)} and Longitudes
              : ${JSON.stringify(post.pathLong)}`}
              <div className="mt-3">
              {rfNames.map((item,index)=>{
                return(<div key={index}>
                  {item+": "}
                  {
                    [...Array(parseInt(post.RF[index]))].map((itm,ind)=>{
                      console.log(ind);
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
