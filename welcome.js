 let selectedOption = null;

        // Custom Loader Transition Handling
        (function() {
            const loaderStartTime = Date.now();
            window.addEventListener('load', () => {
                const elapsed = Date.now() - loaderStartTime;
                const minTime = 1500;
                const remainingTime = Math.max(0, minTime - elapsed);
                
                setTimeout(() => {
                    const loader = document.getElementById('pageTransitionLoader');
                    if (loader) {
                        loader.style.transition = 'opacity 0.5s ease';
                        loader.style.opacity = '0';
                        setTimeout(() => {
                            loader.style.display = 'none';
                        }, 500);
                    }
                }, remainingTime);
            });
        })();

        // Fetch registered user name dynamically
        window.addEventListener('DOMContentLoaded', () => {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser && currentUser.secondName) {
                document.getElementById('username').textContent = currentUser.secondName;
            }
        });

        // Toggle selected option card and activate Continue button
        function selectOption(option) {
            selectedOption = option;
            
            const savingsCard = document.getElementById('savingsCard');
            const investmentsCard = document.getElementById('investmentsCard');
            const continueBtn = document.getElementById('continueBtn');

            if (option === 'savings') {
                savingsCard.classList.add('selected');
                investmentsCard.classList.remove('selected');
            } else if (option === 'investments') {
                investmentsCard.classList.add('selected');
                savingsCard.classList.remove('selected');
            }

            // Enable and style button
            continueBtn.disabled = false;
            continueBtn.classList.add('active');
        }

        // Navigate forward and save user selection in database
        function handleContinue() {
            if (!selectedOption) return;
            
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            
            if (currentUser && currentUser.uid && typeof db !== "undefined" && db) {
                // Change CTA to loading state
                const continueBtn = document.getElementById('continueBtn');
                const originalText = continueBtn.textContent;
                continueBtn.disabled = true;
                continueBtn.textContent = "Saving...";

                db.collection("users").doc(currentUser.uid).update({
                    onboardingChoice: selectedOption
                })
                .then(() => {
                    // Update locally cached currentUser as well
                    currentUser.onboardingChoice = selectedOption;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    
                    proceedToNext();
                })
                .catch((err) => {
                    console.error("Error saving onboarding choice to database:", err);
                    // Fallback to redirection even if database update fails for seamless UX
                    proceedToNext();
                });
            } else {
                proceedToNext();
            }

            function proceedToNext() {
                if (selectedOption === 'savings') {
                    alert("Redirecting to Savings setup...");
                    window.location.href = "index.html"; 
                } else if (selectedOption === 'investments') {
                    alert("Redirecting to Investments setup...");
                    window.location.href = "index.html"; 
                }
            }
        }