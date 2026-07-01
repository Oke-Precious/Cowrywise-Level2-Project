let allUserDetails = JSON.parse(localStorage.getItem('userDatabase')) || [];

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

// ===================== SIGN UP FUNCTIONS ===================================
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
            return;
        }
        else if(allUserDetails[index].username == username.value){
            signupErrorMessage.innerHTML = `<p class="text-danger mt-2" style="font-weight: 500;"><b>&#x26A0;</b> An account with this username exists. Please choose a different username.</p>`;
            signupErrorMessage.style.fontSize = "12px";
            return;
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
        allUserDetails.push(userDetails);
        localStorage.setItem('userDatabase', JSON.stringify(allUserDetails));
        localStorage.setItem('newUserEmail', emailInput.value.trim().toLowerCase());
        window.location.href = "login.html?newUser=true";
        console.log(allUserDetails);
    }
}

// ===================== GOOGLE SIGN UP =======================================
const signUpWithGoogle = (event) => {
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

            // Extract names from display name
            const displayName = user.displayName || "";
            const nameParts = displayName.split(" ");
            const firstNameVal = nameParts[0] || "User";
            const lastNameVal = nameParts.slice(1).join(" ") || "Google";
            
            // Clean username using prefix of email
            const usernameVal = email.split("@")[0] + Math.floor(Math.random() * 1000);

            // Access latest database
            let currentDatabase = JSON.parse(localStorage.getItem('userDatabase')) || [];
            let existingUser = currentDatabase.find(u => u.email === email);

            if (!existingUser) {
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
                // PIN setup is required
                window.location.href = "login.html?newUser=true";
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
            console.error("Google Sign Up Error:", error);
            const signupErrorMessage = document.getElementById('signupErrorMessage');
            if (signupErrorMessage) {
                signupErrorMessage.innerHTML = `<p class="text-danger mt-2" style="font-weight: 500;"><b>&#x26A0;</b> Google sign-up failed: ${error.message}</p>`;
                signupErrorMessage.style.fontSize = "12px";
            }
        });
};
