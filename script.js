

// ===================== SIGN UP ===============================
let allUserDetails = JSON.parse(localStorage.getItem('userDatabase')) || [];
// console.log(allUserDetails);
const errorLabel = ()=>{
    let floatingLabels = document.querySelectorAll('.emailInputContainer label');
        floatingLabels.forEach(label => {
            label.style.color = "red";
        });
}
const createAccount=()=>{
    for(let index=0; index<allUserDetails.length; index++){
        if(allUserDetails[index].email == emailInput.value){
            signupErrorMessage.innerHTML = `<p class="text-danger mt-2" style="font-weight: 500;"><b>&#x26A0;</b> An account with this email exists. Please login to your account.</p>`;
            signupErrorMessage.style.fontSize = "12px";
            return
        }
        else if(allUserDetails[index].username == username.value){
            signupErrorMessage.innerHTML = `<p class="text-danger mt-2" style="font-weight: 500;"><b>&#x26A0;</b> An account with this username exists. Please choose a different username.</p>`;
            signupErrorMessage.style.fontSize = "12px";
            return
        }
        
    }
    if(emailInput.value=="" || firstName.value == "" || lastName.value == "" || username.value == "" || phoneNumber.value =="" || password.value == "" || confirmPassword.value == ""){
        errorLabel();
        emailInput.style.border = "1px solid red";
        firstName.style.border = "1px solid red";
        firstName.style.color = "red";
        lastName.style.border = "1px solid red";
        lastName.style.color = "red";
        username.style.border = "1px solid red";
        username.style.color = "red";
        phoneNumber.style.border = "1px solid red";
        phoneNumber.style.color = "red";
        password.style.border = "1px solid red";
        password.style.color = "red";
        confirmPassword.style.border = "1px solid red";
        confirmPassword.style.color = "red";
        signupErrorMessage.innerHTML = `<p class="text-danger mt-2" style="font-weight: 500;"><b>&#x26A0;</b> Enter a valid credentials</p>`;
        signupErrorMessage.style.fontSize = "12px";
    }
    else if(confirmPassword.value.length < 8){
        signupErrorMessage.innerHTML = `<p class="text-danger mt-2" style="font-weight: 500;"><b>&#x26A0;</b> Password must be at least 8 characters</p>`;
        password.style.border = "1px solid red";
        confirmPassword.style.border = "1px solid red";
        signupErrorMessage.style.fontSize = "12px";
    }
    else if(!emailInput.value.includes("@") || !emailInput.value.includes(".")){
        signupErrorMessage.innerHTML = `<p class="text-danger mt-2" style="font-weight: 500;"><b>&#x26A0;</b> Enter a valid email address</p>`;
        signupErrorMessage.style.fontSize = "12px";
        emailInput.style.border = "1px solid red";
        emailLabel.style.color = "red";

    }
    else if(password.value !== confirmPassword.value){
        signupErrorMessage.innerHTML = `<p class="text-danger mt-2" style="font-weight: 500;"><b>&#x26A0;</b> Passwords do not match</p>`;
        password.style.border = "1px solid red";
        confirmPassword.style.border = "1px solid red";
        signupErrorMessage.style.fontSize = "12px";
    }
    else{
        let userDetails = {
            email: emailInput.value.trim(),
            password: confirmPassword.value.trim(),
            firstName: firstName.value.trim(),
            secondName: lastName.value.trim(),
            username: username.value.trim(),
            phoneNumber: phoneNumber.value.trim()
        }
        allUserDetails.push(userDetails)
        localStorage.setItem('userDatabase', JSON.stringify(allUserDetails))
        window.location.href = "/login.html"
        console.log(allUserDetails)
    }
}

const signIn = () =>{
    // console.log(loginPassword.value, loginEmail.value)
    if(loginEmail.value == "" || loginPassword.value == ""){
        loginErrorMessage.innerHTML = `<p class="text-danger mt-2" style="font-weight: 500;"><b>&#x26A0;</b> Please enter your email and password</p>`;
        errorLabel();
        loginEmail.style.border = "1px solid red";
        loginPassword.style.border = "1px solid red";
        loginErrorMessage.style.fontSize = "12px";
    }
    else if(!loginEmail.value.includes("@") || !loginEmail.value.includes(".")){
        loginErrorMessage.innerHTML = `<p class="text-danger mt-2" style="font-weight: 500;"><b>&#x26A0;</b> Enter a valid email address</p>`;
        loginEmailLabel.style.color = "red";
        loginErrorMessage.style.fontSize = "12px";
        loginEmail.style.border = "1px solid red";
    }
    else{
        for(let index=0; index<allUserDetails.length; index++){
            if(allUserDetails[index].email == loginEmail.value && allUserDetails[index].password == loginPassword.value){
                alert(`Welcome back ${allUserDetails[index].firstName} ${allUserDetails[index].secondName}`);
                break
            }
        }
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