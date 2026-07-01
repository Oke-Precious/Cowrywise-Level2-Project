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
                // Smoothly switch from step 1 layout to step 2 fund wallet layout
                const step1 = document.getElementById('step1Container');
                const step2 = document.getElementById('step2Container');
                
                if (step1 && step2) {
                    step1.style.display = 'none';
                    step1.classList.add('d-none');
                    
                    step2.style.display = 'flex';
                    step2.classList.remove('d-none');
                    
                    // Reset input focus and values
                    const fundAmountInput = document.getElementById('fundAmount');
                    if (fundAmountInput) {
                        fundAmountInput.focus();
                        formatAndValidateAmount(fundAmountInput);
                    }
                }
            }
        }

        // Return back to Step 1 selector screen
        function goBackToStep1() {
            const step1 = document.getElementById('step1Container');
            const step2 = document.getElementById('step2Container');
            
            if (step1 && step2) {
                step2.style.display = 'none';
                step2.classList.add('d-none');
                
                step1.style.display = 'flex';
                step1.classList.remove('d-none');
            }
        }

        // Real-time currency format & validation logic
        function formatAndValidateAmount(input) {
            // Remove non-numeric characters
            let rawValue = input.value.replace(/[^0-9]/g, '');
            
            // Format with thousands separator
            let numericVal = parseInt(rawValue, 10);
            if (isNaN(numericVal)) {
                numericVal = 0;
            }
            
            input.value = numericVal.toLocaleString('en-US');
            
            // Validate limit constraint (Minimum ₦1,000)
            const warning = document.getElementById('fundLimitWarning');
            const processingFee = document.getElementById('processingFeeContainer');
            const fundBtn = document.getElementById('fundWalletBtn');
            
            if (numericVal < 1000) {
                if (warning) {
                    warning.style.display = 'flex';
                    warning.classList.remove('d-none');
                }
                if (processingFee) {
                    processingFee.style.display = 'none';
                    processingFee.classList.add('d-none');
                }
                if (fundBtn) {
                    fundBtn.disabled = true;
                }
            } else {
                if (warning) {
                    warning.style.display = 'none';
                    warning.classList.add('d-none');
                }
                if (processingFee) {
                    processingFee.style.display = 'inline-block';
                    processingFee.classList.remove('d-none');
                }
                if (fundBtn) {
                    fundBtn.disabled = false;
                }
            }
        }

        // Submits the wallet funding request and continues to index.html
        function handleFundWallet() {
            const amountInput = document.getElementById('fundAmount');
            if (!amountInput) return;

            const cleanAmount = parseInt(amountInput.value.replace(/[^0-9]/g, ''), 10);
            if (isNaN(cleanAmount) || cleanAmount < 1000) return;

            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const fundWalletBtn = document.getElementById('fundWalletBtn');

            if (currentUser && currentUser.uid && typeof db !== "undefined" && db) {
                fundWalletBtn.disabled = true;
                fundWalletBtn.textContent = "Processing...";

                db.collection("users").doc(currentUser.uid).update({
                    initialFundingAmount: cleanAmount,
                    walletFunded: true
                })
                .then(() => {
                    currentUser.initialFundingAmount = cleanAmount;
                    currentUser.walletFunded = true;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    
                    alert(`Successfully funded ₦${cleanAmount.toLocaleString()} to your wallet!`);
                    window.location.href = "index.html";
                })
                .catch((err) => {
                    console.error("Error storing funding details:", err);
                    window.location.href = "index.html";
                });
            } else {
                window.location.href = "index.html";
            }
        }