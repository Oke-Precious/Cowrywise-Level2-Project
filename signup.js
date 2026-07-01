// userDatabase in localStorage is replaced by Firestore db

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
        return;
    }
    if(confirmPassword.value.length < 8){
        signupErrorMessage.innerHTML = `<p class="text-danger mt-2" style="font-weight: 500;"><b>&#x26A0;</b> Password must be at least 8 characters</p>`;
        password.style.border = "1px solid red";
        confirmPassword.style.border = "1px solid red";
        signupErrorMessage.style.fontSize = "12px";
        return;
    }
    if(!emailInput.value.includes("@") || !emailInput.value.includes(".")){
        signupErrorMessage.innerHTML = `<p class="text-danger mt-2" style="font-weight: 500;"><b>&#x26A0;</b> Enter a valid email address</p>`;
        signupErrorMessage.style.fontSize = "12px";
        emailInput.style.border = "1px solid red";
        emailLabel.style.color = "red";
        return;
    }
    if(password.value !== confirmPassword.value){
        signupErrorMessage.innerHTML = `<p class="text-danger mt-2" style="font-weight: 500;"><b>&#x26A0;</b> Passwords do not match</p>`;
        password.style.border = "1px solid red";
        confirmPassword.style.border = "1px solid red";
        signupErrorMessage.style.fontSize = "12px";
        return;
    }

    // Check if firebase is configured
    if (typeof isFirebaseConfigured !== "function" || !isFirebaseConfigured()) {
        showFirebaseSetupWarning();
        return;
    }

    const email = emailInput.value.trim().toLowerCase();
    const usernameVal = username.value.trim();

    // Verify username uniqueness in Firestore first
    db.collection("users").where("username", "==", usernameVal).get()
        .then((querySnapshot) => {
            if (!querySnapshot.empty) {
                signupErrorMessage.innerHTML = `<p class="text-danger mt-2" style="font-weight: 500;"><b>&#x26A0;</b> An account with this username exists. Please choose a different username.</p>`;
                signupErrorMessage.style.fontSize = "12px";
                username.style.border = "1px solid red";
                throw new Error("username-taken");
            }
            
            // Create user in Firebase Auth
            return auth.createUserWithEmailAndPassword(email, password.value.trim());
        })
        .then((userCredential) => {
            if (!userCredential) return;
            
            const uid = userCredential.user.uid;
            const userDetails = {
                uid: uid,
                email: email,
                firstName: firstName.value.trim(),
                secondName: lastName.value.trim(),
                username: usernameVal,
                phoneNumber: phoneNumber.value.trim(),
                isHalal: document.getElementById('halalToggle')?.checked || false,
                authProvider: "email"
            };

            // Store details in Firestore doc users/{uid}
            return db.collection("users").doc(uid).set(userDetails);
        })
        .then((result) => {
            if (result === undefined) {
                localStorage.setItem('newUserEmail', email);
                window.location.href = "login.html?newUser=true";
            }
        })
        .catch((error) => {
            if (error.message === "username-taken") return;
            console.error("Signup error:", error);
            let userMsg = error.message;
            if (error.code === "auth/email-already-in-use") {
                userMsg = "email already exist";
                emailInput.style.border = "1px solid red";
                emailLabel.style.color = "red";
            }
            signupErrorMessage.innerHTML = `<p class="text-danger mt-2" style="font-weight: 500;"><b>&#x26A0;</b> ${userMsg}</p>`;
            signupErrorMessage.style.fontSize = "12px";
        });
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
                // PIN setup is required
                window.location.href = "login.html?newUser=true";
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
            console.error("Google Sign Up Error:", error);
            const signupErrorMessage = document.getElementById('signupErrorMessage');
            if (signupErrorMessage) {
                signupErrorMessage.innerHTML = `<p class="text-danger mt-2" style="font-weight: 500;"><b>&#x26A0;</b> Google sign-up failed: ${error.message}</p>`;
                signupErrorMessage.style.fontSize = "12px";
            }
        });
};
