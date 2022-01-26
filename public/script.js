function register(){
    registerName=document.getElementById('registerName');
    registerEmail=document.getElementById('registerEmail');
    registerPassword=document.getElementById('registerPassword');
    const obj={
        name:registerName.value,
        email:registerEmail.value,
        password:registerPassword.value
    }
    postRegisterOrLogin(obj,"register");
}
function login(){
    loginEmail=document.getElementById('loginEmail');
    loginPassword=document.getElementById('loginPassword');
    const obj={
        email:loginEmail.value,
        password:loginPassword.value
    }
    postRegisterOrLogin(obj,"login");
}
const postRegisterOrLogin=async(obj,str)=>{
    const loginmsg=document.getElementById('loginmsg');
    const registermsg=document.getElementById('registermsg');
    try {
        let res=await axios.post(`/api/v1/auth/${str}`,obj);
        console.log(res);
        localStorage.setItem("token",res.data.token);
        localStorage.setItem("name",res.data.user.name);
        window.location.href="./main.html";
    } catch (error) {
        console.log(error.response.data.msg);
        if(str==="login"){
            loginmsg.innerHTML=`<div class="col text-danger">${error.response.data.msg}</div>`;
            setTimeout(()=>{loginmsg.innerHTML=""},3000);
        }
        else{
            registermsg.innerHTML=`<div class="col text-danger">${error.response.data.msg}</div>`;
            setTimeout(()=>{registermsg.innerHTML=""},3000);
        }
    }
} 