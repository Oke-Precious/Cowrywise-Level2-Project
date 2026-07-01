// userDatabase in localStorage is replaced by Firestore db

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
        // Query Firestore for user by email and update PIN
        db.collection("users").where("email", "==", newUserEmail).get()
            .then((querySnapshot) => {
                if (!querySnapshot.empty) {
                    const doc = querySnapshot.docs[0];
                    return doc.ref.update({ pin: createPINValue });
                } else {
                    throw new Error("User record not found");
                }
            })
            .then(() => {
                window.location.href = 'verify-bvn.html';
            })
            .catch((err) => {
                console.error("Error setting PIN:", err);
                showPINError(err.message || 'Error saving PIN to server', 'create-pin-input');
            });
        return;
    }
    
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
        return;
    }
    if(!loginEmail.value.includes("@") || !loginEmail.value.includes(".")){
        loginErrorMessage.innerHTML = `<p class="text-danger mt-2" style="font-weight: 500;"><b>&#x26A0;</b> Enter a valid email address</p>`;
        loginEmailLabel.style.color = "red";
        loginErrorMessage.style.fontSize = "12px";
        loginEmail.style.border = "1px solid red";
        return;
    }

    // Check if firebase is configured
    if (typeof isFirebaseConfigured !== "function" || !isFirebaseConfigured()) {
        showFirebaseSetupWarning();
        return;
    }

    const email = loginEmail.value.toLowerCase();
    const pwd = loginPassword.value;

    auth.signInWithEmailAndPassword(email, pwd)
        .then((result) => {
            const uid = result.user.uid;
            return db.collection("users").doc(uid).get();
        })
        .then((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                localStorage.setItem('currentUser', JSON.stringify(userData));
                
                // Direct user based on missing setup fields
                if (!userData.pin) {
                    localStorage.setItem('newUserEmail', userData.email);
                    window.location.href = "login.html?newUser=true";
                } else if (!userData.bvn) {
                    localStorage.setItem('newUserEmail', userData.email);
                    window.location.href = "verify-bvn.html";
                } else {
                    localStorage.removeItem('newUserEmail');
                    window.location.href = "welcome.html";
                }
            } else {
                throw new Error("User profile not found");
            }
        })
        .catch((error) => {
            console.error("Login Error:", error);
            loginErrorMessage.innerHTML = `<p class="text-danger mt-2" style="font-weight: 500;"><b>&#x26A0;</b> Invalid email or password</p>`;
            loginEmailLabel.style.color = "red";
            loginErrorMessage.style.fontSize = "12px";
            loginEmail.style.border = "1px solid red";
            loginPassword.style.border = "1px solid red";
            errorLabel();
        });
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
            const uid = user.uid;

            // Fetch user profile from Firestore
            return db.collection("users").doc(uid).get()
                .then((doc) => {
                    if (!doc.exists) {
                        // Create profile for new Google user
                        const displayName = user.displayName || "";
                        const nameParts = displayName.split(" ");
                        const firstNameVal = nameParts[0] || "User";
                        const lastNameVal = nameParts.slice(1).join(" ") || "Google";
                        const usernameVal = email.split("@")[0] + Math.floor(Math.random() * 1000);

                        const userDetails = {
                            uid: uid,
                            email: email,
                            firstName: firstNameVal,
                            secondName: lastNameVal,
                            username: usernameVal,
                            phoneNumber: user.phoneNumber || "",
                            isHalal: false,
                            authProvider: "google"
                        };

                        return db.collection("users").doc(uid).set(userDetails)
                            .then(() => userDetails);
                    } else {
                        // User exists, return their profile data
                        return doc.data();
                    }
                });
        })
        .then((userData) => {
            if (!userData) return;
            
            // Save user email temporarily for onboarding sequence
            localStorage.setItem('newUserEmail', userData.email);

            // Direct user based on missing setup fields
            if (!userData.pin) {
                // PIN setup is required, redirect to login page with newUser parameter
                if (window.location.search.includes('newUser=true')) {
                    // We are already on the page with the parameter, show modal directly
                    showPINModal();
                } else {
                    window.location.href = "login.html?newUser=true";
                }
            } else if (!userData.bvn) {
                // BVN verification is required
                window.location.href = "verify-bvn.html";
            } else {
                // Already fully registered: log in directly
                localStorage.setItem('currentUser', JSON.stringify(userData));
                localStorage.removeItem('newUserEmail');
                window.location.href = "welcome.html";
            }
        })
        .catch((error) => {
            console.error("Google Sign In Error:", error);
            const loginErrorMessage = document.getElementById('loginErrorMessage');
            if (loginErrorMessage) {
                loginErrorMessage.innerHTML = `<p class="text-danger mt-2" style="font-weight: 500;"><b>&#x26A0;</b> Google sign-in failed</p>`;
                loginErrorMessage.style.fontSize = "12px";
            }
        });
};
