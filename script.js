

// ===================== SIGN UP ===============================
let allUserDetails = JSON.parse(localStorage.getItem('userDatabase')) || [];
// console.log(allUserDetails);

const enterEmail=()=>{
    for(let index=0; index<allUserDetails.length; index++){
        if(allUserDetails[index].email == emailInput.value){
            signupErrorMessage.innerHTML = `<p class="text-danger mt-2" style="font-weight: 500;"><b>&#x26A0;</b> An account with this email exists. Please login to your account.</p>`;
            signupErrorMessage.style.fontSize = "13px";
            return
        }
        
    }
    if(emailInput.value==""){
        emailInput.style.border = "1px solid red";
        emailLabel.style.color = "red";
        signupErrorMessage.innerHTML = `<p class="text-danger mt-2" style="font-weight: 500;"><b>&#x26A0;</b> Enter your email address</p>`;
    }
    else if(!emailInput.value.includes("@") || !emailInput.value.includes(".")){
        signupErrorMessage.innerHTML = `<p class="text-danger mt-2" style="font-weight: 500;"><b>&#x26A0;</b> Enter a valid email address</p>`;
        signupErrorMessage.style.fontSize = "13px";
        emailInput.style.border = "1px solid red";
        emailLabel.style.color = "red";

    }
    else{
        let userDetails = {
            email: emailInput.value,
            password: "",
            reciveMoney: "",
            sendMoney: "",
            invest: "",
        }
        allUserDetails.push(userDetails)
        localStorage.setItem('userDatabase', JSON.stringify(allUserDetails))
        wi
        console.log(allUserDetails)

    }
}