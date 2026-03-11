function register(){

let user=document.getElementById("newUser").value
let pass=document.getElementById("newPass").value

if(user=="" || pass==""){

Swal.fire({
icon:"warning",
title:"Missing Information",
text:"Please enter username and password"
})

return
}

localStorage.setItem(user,pass)

Swal.fire({
icon:"success",
title:"Registration Successful 🎉",
text:"You can now login!",
confirmButtonColor:"#ff7a00"
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
title:"Login Failed ❌",
text:"Invalid username or password",
confirmButtonColor:"#ff7a00"
})

}

}