// firebase-config.js

// Replace the placeholder values below with your Firebase project's web app credentials.
// You can get these by going to the Firebase Console -> Project Settings -> General -> Your apps -> Web app.
const firebaseConfig = {
  apiKey: "AIzaSyAcuJOvZop1dYRxLYUUSjpMgLcGJfiTUJ4",
  authDomain: "level-2-project-cowrywise.firebaseapp.com",
  projectId: "level-2-project-cowrywise",
  storageBucket: "level-2-project-cowrywise.firebasestorage.app",
  messagingSenderId: "144159232391",
  appId: "1:144159232391:web:af4a70a40012fc90f40322"
};

// Check if Firebase has been configured with real credentials
function isFirebaseConfigured() {
    return firebaseConfig && 
           firebaseConfig.apiKey && 
           firebaseConfig.apiKey !== "YOUR_API_KEY" && 
           firebaseConfig.projectId !== "YOUR_PROJECT_ID";
}

// Show a user-friendly setup notification if placeholders are still present
function showFirebaseSetupWarning() {
    // Create a styled warning overlay/banner on the screen
    let warningDiv = document.getElementById('firebase-setup-warning');
    if (!warningDiv) {
        warningDiv = document.createElement('div');
        warningDiv.id = 'firebase-setup-warning';
        warningDiv.style.position = 'fixed';
        warningDiv.style.bottom = '20px';
        warningDiv.style.right = '20px';
        warningDiv.style.backgroundColor = '#FFF3CD';
        warningDiv.style.color = '#856404';
        warningDiv.style.border = '1px solid #FFEBAA';
        warningDiv.style.padding = '15px';
        warningDiv.style.borderRadius = '8px';
        warningDiv.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        warningDiv.style.zIndex = '9999';
        warningDiv.style.maxWidth = '350px';
        warningDiv.style.fontFamily = "'Montserrat', sans-serif";
        warningDiv.style.fontSize = '13px';
        warningDiv.style.lineHeight = '1.5';
        
        warningDiv.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px; display: flex; align-items: center; gap: 5px;">
                ⚠️ Firebase Not Configured
            </div>
            <div>
                Google Sign-In is not active because the placeholder values in <strong>firebase-config.js</strong> have not been updated with your Firebase credentials yet.
            </div>
            <button onclick="this.parentElement.remove()" style="margin-top: 10px; background: #856404; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px;">Dismiss</button>
        `;
        document.body.appendChild(warningDiv);
    }
}

// Initialize Firebase only if we have configured values to prevent library crash
let auth = null;
let googleProvider = null;
let db = null;

if (isFirebaseConfigured()) {
    try {
        firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
        googleProvider = new firebase.auth.GoogleAuthProvider();
        
        // Optional: force select account prompt each time
        googleProvider.setCustomParameters({
            prompt: 'select_account'
        });
    } catch (error) {
        console.error("Error initializing Firebase App:", error);
    }
} else {
    console.warn("Firebase configuration has not been set in firebase-config.js yet. Google Sign-In features will display warnings on click.");
}
