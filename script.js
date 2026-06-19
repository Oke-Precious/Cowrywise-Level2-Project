

// ===================== SIGN UP ===============================
let allUserDetails = JSON.parse(localStorage.getItem('userDatabase')) || [];
// console.log(allUserDetails);

// ===================== HALAL MODAL FUNCTIONS ===============================
const showHalalModal = () => {
    const modal = document.getElementById('halalModal');
    modal.classList.add('show');
}

const closeHalalModal = () => {
    const modal = document.getElementById('halalModal');
    modal.classList.remove('show');
}

const handleHalalToggle = (checkbox) => {
    if(checkbox.checked) {
        showHalalModal();
    }
}

// ===================== PIN MODAL FUNCTIONS ===============================
const showPINModal = () => {
    const modal = document.getElementById('createPINModal');
    if(modal) modal.classList.add('show');
}

const closePINModal = () => {
    const modal = document.getElementById('createPINModal');
    if(modal) modal.classList.remove('show');
}

const handlePINInput = (input) => {
    // Allow only digits
    input.value = input.value.replace(/[^0-9]/g, '');
    
    if(input.value.length === 1) {
        const nextInput = input.nextElementSibling;
        if(nextInput && nextInput.classList.contains('pin-input')) {
            nextInput.focus();
        }
    }
    if(input.value.length > 1) {
        input.value = input.value.slice(-1);
    }
}

const handlePINBackspace = (e, input) => {
    if(e.key === 'Backspace' && input.value === '') {
        const prevInput = input.previousElementSibling;
        if(prevInput && prevInput.classList.contains('pin-input')) {
            prevInput.focus();
        }
    }
}

const showPINError = (message, inputClass) => {
    const errorElement = document.getElementById('pinErrorMessage');
    const inputs = document.querySelectorAll(`.${inputClass}`);
    
    if(errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    
    inputs.forEach(input => {
        input.classList.add('error');
    });
}

const clearPINError = () => {
    const errorElement = document.getElementById('pinErrorMessage');
    const createInputs = document.querySelectorAll('.create-pin-input');
    const confirmInputs = document.querySelectorAll('.confirm-pin-input');
    
    if(errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
    
    createInputs.forEach(input => input.classList.remove('error'));
    confirmInputs.forEach(input => input.classList.remove('error'));
}

const createPIN = () => {
    const createPINInputs = document.querySelectorAll('.create-pin-input');
    const confirmPINInputs = document.querySelectorAll('.confirm-pin-input');
    
    let createPINValue = '';
    let confirmPINValue = '';
    
    createPINInputs.forEach(input => {
        createPINValue += input.value;
    });
    
    confirmPINInputs.forEach(input => {
        confirmPINValue += input.value;
    });
    
    if(createPINValue.length !== 4 || confirmPINValue.length !== 4) {
        showPINError('Please enter a 4-digit PIN', 'create-pin-input');
        return;
    }
    
    if(createPINValue !== confirmPINValue) {
        showPINError('PINs do not match. Please try again.', 'confirm-pin-input');
        confirmPINInputs.forEach(input => input.value = '');
        confirmPINInputs[0].focus();
        return;
    }
    
    const newUserEmail = localStorage.getItem('newUserEmail');
    if(newUserEmail) {
        const allUserDetails = JSON.parse(localStorage.getItem('userDatabase')) || [];
        const userIndex = allUserDetails.findIndex(user => user.email === newUserEmail);
        if(userIndex !== -1) {
            allUserDetails[userIndex].pin = createPINValue;
            localStorage.setItem('userDatabase', JSON.stringify(allUserDetails));
            window.location.href = 'verify-bvn.html';
        }
    }
    
    localStorage.removeItem('newUserEmail');
    closePINModal();
}

const initPINModal = () => {
    const urlParams = new URLSearchParams(window.location.search);
    if(urlParams.get('newUser') === 'true') {
        setTimeout(() => {
            showPINModal();
        }, 500);
    }
}

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
            email: emailInput.value.trim().toLowerCase(),
            password: confirmPassword.value.trim(),
            firstName: firstName.value.trim(),
            secondName: lastName.value.trim(),
            username: username.value.trim(),
            phoneNumber: phoneNumber.value.trim(),
            isHalal: document.getElementById('halalToggle')?.checked || false
        }
        allUserDetails.push(userDetails)
        localStorage.setItem('userDatabase', JSON.stringify(allUserDetails))
        localStorage.setItem('newUserEmail', emailInput.value.trim().toLowerCase())
        window.location.href = "/login.html?newUser=true";
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
            if(allUserDetails[index].email == loginEmail.value.toLowerCase() && allUserDetails[index].password == loginPassword.value){
                alert(`Welcome back ${allUserDetails[index].firstName} ${allUserDetails[index].secondName}`);
                break
            }
            else{
                loginErrorMessage.innerHTML = `<p class="text-danger mt-2" style="font-weight: 500;"><b>&#x26A0;</b> Invalid credentials</p>`;
                loginEmailLabel.style.color = "red";
                loginErrorMessage.style.fontSize = "12px";
                loginEmail.style.border = "1px solid red";
                loginPassword.style.border = "1px solid red";
                errorLabel();
                return;
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