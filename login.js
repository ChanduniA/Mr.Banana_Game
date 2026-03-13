function register(){

let user=document.getElementById("newUser").value
let pass=document.getElementById("newPass").value

if(user=="" || pass==""){

Swal.fire({
icon:"warning",
title:"⚠ Missing Information",
text:"Enter username and password",
background:"#fff3e0",
confirmButtonColor:"#ff7a00"
})

return
}

localStorage.setItem(user,pass)

Swal.fire({
icon:"success",
title:"🎉 Registration Successful!",
text:"You can now login",
background:"#e8f5e9",
confirmButtonColor:"#4caf50"
}).then(()=>{

window.location="index.html"

})

}

function login(){

let user=document.getElementById("username").value
let pass=document.getElementById("password").value

let stored=localStorage.getItem(user)

if(stored===pass){

localStorage.setItem("currentPlayer",user)
window.location="game.html"

}else{

Swal.fire({
icon:"error",
title:"❌ Invalid Login",
text:"Wrong username or password",
background:"#ffebee",
confirmButtonColor:"#e53935"
})

}

}

function clearUsers(){

localStorage.clear()

Swal.fire({
icon:"success",
title:"All Users Removed",
confirmButtonColor:"#ff7a00"
})

}