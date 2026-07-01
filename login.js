let allUserDetails = JSON.parse(localStorage.getItem('userDatabase')) || [];

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
            return;
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

// ===================== SIGN IN FUNCTIONS ===================================
const errorLabel = ()=>{
    let floatingLabels = document.querySelectorAll('.emailInputContainer label');
    floatingLabels.forEach(label => {
        label.style.color = "red";
    });
}

const signIn = () =>{
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
                localStorage.setItem('currentUser', JSON.stringify(allUserDetails[index]));
                window.location.href = "welcome.html";
                break;
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

// ===================== GOOGLE SIGN IN =======================================
const signInWithGoogle = (event) => {
    if (event) event.preventDefault();

    // Check if firebase is configured
    if (typeof isFirebaseConfigured !== "function" || !isFirebaseConfigured()) {
        showFirebaseSetupWarning();
        return;
    }

    auth.signInWithPopup(googleProvider)
        .then((result) => {
            const user = result.user;
            const email = user.email.toLowerCase();

            // Access latest database
            let currentDatabase = JSON.parse(localStorage.getItem('userDatabase')) || [];
            let existingUser = currentDatabase.find(u => u.email === email);

            if (!existingUser) {
                // If user doesn't exist yet, sign them up seamlessly
                const displayName = user.displayName || "";
                const nameParts = displayName.split(" ");
                const firstNameVal = nameParts[0] || "User";
                const lastNameVal = nameParts.slice(1).join(" ") || "Google";
                const usernameVal = email.split("@")[0] + Math.floor(Math.random() * 1000);

                existingUser = {
                    email: email,
                    password: "", // Google accounts do not have local passwords
                    firstName: firstNameVal,
                    secondName: lastNameVal,
                    username: usernameVal,
                    phoneNumber: user.phoneNumber || "",
                    isHalal: false,
                    authProvider: "google"
                };
                currentDatabase.push(existingUser);
                localStorage.setItem('userDatabase', JSON.stringify(currentDatabase));
            }

            // Save user email temporarily for onboarding sequence
            localStorage.setItem('newUserEmail', email);

            // Direct user based on missing setup fields
            if (!existingUser.pin) {
                // PIN setup is required, redirect to login page with newUser parameter
                if (window.location.search.includes('newUser=true')) {
                    // We are already on the page with the parameter, show modal directly
                    showPINModal();
                } else {
                    window.location.href = "login.html?newUser=true";
                }
            } else if (!existingUser.bvn) {
                // BVN verification is required
                window.location.href = "verify-bvn.html";
            } else {
                // Already fully registered: log in directly
                localStorage.setItem('currentUser', JSON.stringify(existingUser));
                localStorage.removeItem('newUserEmail');
                window.location.href = "welcome.html";
            }
        })
        .catch((error) => {
            console.error("Google Sign In Error:", error);
            const loginErrorMessage = document.getElementById('loginErrorMessage');
            if (loginErrorMessage) {
                loginErrorMessage.innerHTML = `<p class="text-danger mt-2" style="font-weight: 500;"><b>&#x26A0;</b> Google sign-in failed: ${error.message}</p>`;
                loginErrorMessage.style.fontSize = "12px";
            }
        });
};
