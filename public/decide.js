if(!localStorage.getItem("name") || !localStorage.getItem("token"))
    window.location.href="./loginreg.html";
else
    window.location.href="./main.html";