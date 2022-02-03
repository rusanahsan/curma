import React,{useRef,useState} from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faUser,faEnvelope,faLock} from '@fortawesome/free-solid-svg-icons' 
import loginpic from "../img/log.svg";
import registerpic from "../img/register.svg"
import {Alert} from 'react-bootstrap'
import { useGlobalContext } from '../context'

const axios=require('axios')
export default function Logreg() {
    const [loginAlert,setLoginAlert]=useState({alert:false,msg:""});
    const [registerAlert,setRegisterAlert]=useState({alert:false,msg:""});
    const containerRef=useRef(null);
    const[registerInfo,setRegisterInfo]=useState({});
    const [loginInfo,setLoginInfo]=useState({});
    const {server}=useGlobalContext();

    function handleLoginChange(e){
      const {name,value}=e.target;
      setLoginInfo({...loginInfo,[name]:value})
    }
    function handleRegisterChange(e){
      const {name,value}=e.target;
      setRegisterInfo({...registerInfo,[name]:value})
    }
    function handleLoginSubmit(e){
      e.preventDefault();
      postRegisterOrLogin(loginInfo,"login");
    }
    function handleRegisterSubmit(e){
      e.preventDefault();
      postRegisterOrLogin(registerInfo,"register");
    }
  const postRegisterOrLogin=async(obj,str)=>{
      try {
          let res=await axios.post(`${server}/api/v1/auth/${str}`,obj);
          localStorage.setItem("token",res.data.token);
          localStorage.setItem("name",res.data.user.name);
          window.location.href="/";
      } catch (error) {
          if(!error.response){
            console.log(error)
          }
          else{
            if(str==="login"){
              setLoginAlert({alert:true,msg:error.response.data.msg});
              setTimeout(()=>{setLoginAlert({...loginAlert,alert:false})},3000);
            }
            else{
              setRegisterAlert({alert:true,msg:error.response.data.msg});
              setTimeout(()=>{setRegisterAlert({...registerAlert,alert:false})},3000);
            }
          }
        }
  } 
    function handleSignin(){
        containerRef.current.classList.remove("sign-up-mode");
    }
    function handleSignup(){
        containerRef.current.classList.add("sign-up-mode");
    }
  return (
    <section>
        <div className="containerMain" ref={containerRef}>
      <div className="forms-container">
        <div className="signin-signup">
          <form className="sign-in-form" onSubmit={handleLoginSubmit}>
            <h2 className="title">Sign in</h2>
            <div className="input-field">
              <FontAwesomeIcon icon={faEnvelope} className='fontawsomeStyle'/>
              <input type="email" name="email" value={loginInfo.email||""} placeholder="Email" onChange={handleLoginChange}/>
            </div>
            <div className="input-field">
              <FontAwesomeIcon icon={faLock} className='fontawsomeStyle'/>
              <input type="password" name="password" value={loginInfo.password||""} placeholder="Password" onChange={handleLoginChange}/>
            </div>
            {
              loginAlert.alert&&<Alert variant='danger'>{loginAlert.msg}</Alert>
            }
            <button type="submit" value="Login" className="butt solid">Sign in</button>
          </form>
          <form className="sign-up-form" onSubmit={handleRegisterSubmit}>
            <h2 className="title">Sign up</h2>
            <div className="input-field">
              <FontAwesomeIcon icon={faUser} className='fontawsomeStyle'/>
              <input type="text" name="name" placeholder="Name" value={registerInfo.name||""} onChange={handleRegisterChange}/>
            </div>
            <div className="input-field">
              <FontAwesomeIcon icon={faEnvelope} className='fontawsomeStyle'/>
              <input type="email" name="email" placeholder="Email" value={registerInfo.email||""} onChange={handleRegisterChange}/>
            </div>
            <div className="input-field">
              <FontAwesomeIcon icon={faLock} className='fontawsomeStyle'/>
              <input type="password" name="password" placeholder="Password" value={registerInfo.password||""} onChange={handleRegisterChange}/>
            </div>
            {
              registerAlert.alert&&<Alert variant='danger'>{registerAlert.msg}</Alert>
            }
            <button type="submit" className="butt">Sign up</button>
          </form>
        </div>
      </div>

      <div className="panels-container">
        <div className="panel left-panel">
          <div className="content">
            <h3>New here ?</h3>
            <p>
              Please click on sign up button below to register.
            </p>
            <button className="butt transparent" id="sign-up-btn" onClick={handleSignup}>
              Sign up
            </button>
          </div>
          <img src={loginpic} className="imgs" alt="" />
        </div>
        <div className="panel right-panel">
          <div className="content">
            <h3>One of us ?</h3>
            <p>
              Please click on sign in button to login to your account.
            </p>
            <button className="butt transparent" id="sign-in-btn" onClick={handleSignin}>
              Sign in
            </button>
          </div>
          <img src={registerpic} className="imgs" alt="" />
        </div>
      </div>
    </div>
    </section>
  )
}
