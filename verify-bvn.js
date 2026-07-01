// userDatabase in localStorage is replaced by Firestore db

// ===================== BVN VERIFICATION ===============================
const addBVN = () => {
    const bvnNumber = document.getElementById('bvnNumber');
    const dateOfBirth = document.getElementById('dateOfBirth');
    const bvnErrorMessage = document.getElementById('bvnErrorMessage');
    
    if (!bvnNumber || !dateOfBirth || !bvnErrorMessage) return;
    
    const bvnValue = bvnNumber.value.trim();
    const dobValue = dateOfBirth.value;
 
    bvnNumber.style.border = "";
    dateOfBirth.style.border = "";
    bvnErrorMessage.innerHTML = "";
    
    let labels = document.querySelectorAll('.emailInputContainer label');
    labels.forEach(label => label.style.color = "");
    
    if (bvnValue === "" || dobValue === "") {
        bvnErrorMessage.innerHTML = `<p class="text-danger mt-2" style="font-weight: 500;"><b>&#x26A0;</b> Please enter both your BVN and Date of Birth</p>`;
        bvnErrorMessage.style.fontSize = "12px";
        if (bvnValue === "") {
            bvnNumber.style.border = "1px solid red";
        }
        if (dobValue === "") {
            dateOfBirth.style.border = "1px solid red";
        }
        labels.forEach(label => {
            label.style.color = "red";
        });
        return;
    }
    
    // Check if BVN is exactly 11 digits
    if (!/^\d{11}$/.test(bvnValue)) {
        bvnErrorMessage.innerHTML = `<p class="text-danger mt-2" style="font-weight: 500;"><b>&#x26A0;</b> Bank Verification Number must be exactly 11 digits</p>`;
        bvnErrorMessage.style.fontSize = "12px";
        bvnNumber.style.border = "1px solid red";
        const bvnLabel = document.querySelector('label[for="bvnNumber"]');
        if (bvnLabel) bvnLabel.style.color = "red";
        return;
    }
    
    // Find user in Firestore database using newUserEmail
    const newUserEmail = localStorage.getItem('newUserEmail');
    
    // Check if firebase is configured
    if (typeof isFirebaseConfigured !== "function" || !isFirebaseConfigured()) {
        showFirebaseSetupWarning();
        return;
    }

    if (newUserEmail) {
        db.collection("users").where("email", "==", newUserEmail).get()
            .then((querySnapshot) => {
                if (!querySnapshot.empty) {
                    const doc = querySnapshot.docs[0];
                    const updatedData = {
                        bvn: bvnValue,
                        dob: dobValue
                    };
                    return doc.ref.update(updatedData).then(() => {
                        return doc.ref.get();
                    });
                } else {
                    throw new Error("User session not found in database.");
                }
            })
            .then((updatedDoc) => {
                const userData = updatedDoc.data();
                localStorage.setItem('currentUser', JSON.stringify(userData));
                
                bvnErrorMessage.innerHTML = `<p class="text-success mt-2" style="font-weight: 500;">✅ BVN Verification Successful!</p>`;
                bvnErrorMessage.style.fontSize = "13px";
                localStorage.removeItem('newUserEmail');
                setTimeout(() => {
                    window.location.href = "welcome.html";
                }, 1500);
            })
            .catch((error) => {
                console.error("BVN Error:", error);
                bvnErrorMessage.innerHTML = `<p class="text-danger mt-2" style="font-weight: 500;"><b>&#x26A0;</b> ${error.message}</p>`;
                bvnErrorMessage.style.fontSize = "12px";
            });
    } else {
        bvnErrorMessage.innerHTML = `<p class="text-success mt-2" style="font-weight: 500;">✅ BVN Verification Successful!</p>`;
        bvnErrorMessage.style.fontSize = "13px";
        setTimeout(() => {
            window.location.href = "welcome.html";
        }, 1500);
    }
}
