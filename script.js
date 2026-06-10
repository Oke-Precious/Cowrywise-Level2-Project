

// ===================== SIGN UP ===============================
let allUserDetails = JSON.parse(localStorage.getItem('userDatabase')) || [];
// console.log(allUserDetails);

const createAccount=()=>{
    for(let index=0; index<allUserDetails.length; index++){
        if(allUserDetails[index].email == emailInput.value){
            signupErrorMessage.innerHTML = `<p class="text-danger mt-2" style="font-weight: 500;"><b>&#x26A0;</b> An account with this email exists. Please login to your account.</p>`;
            signupErrorMessage.style.fontSize = "12px";
            return
        }
        
    }
    if(emailInput.value=="" || firstName.value == "" || lastName.value == "" || username.value == "" || phoneNumber.value =="" || password.value == ""){
        emailInput.style.border = "1px solid red";
        emailLabel.style.color = "red";
        signupErrorMessage.innerHTML = `<p class="text-danger mt-2" style="font-weight: 500;"><b>&#x26A0;</b> Enter a valid credentials</p>`;
    }
    else if(!emailInput.value.includes("@") || !emailInput.value.includes(".")){
        signupErrorMessage.innerHTML = `<p class="text-danger mt-2" style="font-weight: 500;"><b>&#x26A0;</b> Enter a valid email address</p>`;
        signupErrorMessage.style.fontSize = "13px";
        emailInput.style.border = "1px solid red";
        emailLabel.style.color = "red";

    }
    else{
        let userDetails = {
            email: emailInput.value.trim(),
            password: password.value.trim(),
            firstName: firstName.value.trim(),
            secondName: lastName.value.trim(),
        }
        allUserDetails.push(userDetails)
        localStorage.setItem('userDatabase', JSON.stringify(allUserDetails))
        window.location.href = "/createAccount.html"
        console.log(allUserDetails)
    }
}



// const createAccount = () =>{
//     if (firstName.value == "" || lastName.value == "" || username.value == "" || phoneNumber.value =="" || password.value == ""){
//         alert("enterFirst name")
//     }
//     else if(password.value.length < 8){
//         alert("password must be at least 8 characters")
//     }
//     else{
//         allUserDetails.parse = JSON.parse(localStorage.getItem('userDatabase')) || [];
//         allUserDetails.parse[allUserDetails.parse.length - 1].firstName = firstName.value.trim();
//         allUserDetails.parse[allUserDetails.parse.length - 1].secondName = lastName.value.trim();
//         allUserDetails.parse[allUserDetails.parse.length - 1].username = username.value.trim();
//         allUserDetails.parse[allUserDetails.parse.length - 1].phoneNumber = phoneNumber.value.trim();
//         allUserDetails.parse[allUserDetails.parse.length - 1].password = password.value.trim();
//         localStorage.setItem('userDatabase', JSON.stringify(allUserDetails.parse));
//         window.location.href = "/login.html"
//         // firstName.value = allUserDetails['userDatabase'].email
//         // // console.log(allUserDetails)
//         // // console.log(allUserDetails[0].email)
//     }
// }