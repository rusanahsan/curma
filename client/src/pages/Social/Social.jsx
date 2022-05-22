import React from 'react'
import Navbar from "../../components/Navbar"
import Sidebar from "../../components/sidebar/Sidebar";
import Feed from "../../components/feed/Feed";
import Rightbar from "../../components/rightbar/Rightbar";
import "./social.css"

export default function Social() {
  return (
    <>
      <Navbar />
        <Feed/>
    </>
  );
}
