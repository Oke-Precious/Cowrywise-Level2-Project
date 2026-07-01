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

        // Timer variable for countdown
        let timerInterval = null;

        // Submits the wallet funding request and opens the payment method modal
        function handleFundWallet() {
            const amountInput = document.getElementById('fundAmount');
            if (!amountInput) return;

            const cleanAmount = parseInt(amountInput.value.replace(/[^0-9]/g, ''), 10);
            if (isNaN(cleanAmount) || cleanAmount < 1000) return;

            const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
            
            // Format amounts (adding 15 Naira processing fee as per mockups)
            const totalPayAmount = cleanAmount + 15;
            const amountWithFeeFormatted = `₦ ${totalPayAmount.toLocaleString()}`;

            // Generate a random 10-digit account number
            const randomAccountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();

            // Set the full account name: Cowrywise/[firstName secondName]
            let fullname = "User";
            if (currentUser.firstName && currentUser.secondName) {
                fullname = `${currentUser.firstName} ${currentUser.secondName}`;
            } else if (currentUser.secondName) {
                fullname = currentUser.secondName;
            } else if (currentUser.firstName) {
                fullname = currentUser.firstName;
            }
            const fullAccountName = `Cowrywise/${fullname}`;

            // Populate the modal fields
            document.getElementById('modalTransferAmount').textContent = amountWithFeeFormatted;
            document.getElementById('modalAccountNumber').textContent = randomAccountNumber;
            document.getElementById('modalAccountName').textContent = fullAccountName;

            // Save values locally to confirm transaction details later
            currentUser.pendingFundingAmount = cleanAmount;
            currentUser.tempAccountNumber = randomAccountNumber;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            // Display Transfer modal overlay
            const modal = document.getElementById('transferModal');
            if (modal) {
                modal.style.display = 'flex';
                modal.classList.remove('d-none');
                startTransferTimer(59, 59);
            }
        }

        // Close the transfer overlay
        function closeTransferModal() {
            const modal = document.getElementById('transferModal');
            if (modal) {
                modal.style.display = 'none';
                modal.classList.add('d-none');
            }
            if (timerInterval) clearInterval(timerInterval);
        }

        // Accordion panel toggle function
        function toggleAccordion(detailsId) {
            const detailsElement = document.getElementById(detailsId);
            if (!detailsElement) return;

            // Toggle target details
            if (detailsElement.classList.contains('d-none')) {
                detailsElement.classList.remove('d-none');
                detailsElement.style.display = 'block';
            } else {
                detailsElement.classList.add('d-none');
                detailsElement.style.display = 'none';
            }
        }

        // Clipboard copy utility
        function copyText(elementId, buttonElement) {
            const textToCopy = document.getElementById(elementId).textContent.replace('₦', '').trim();
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalHTML = buttonElement.innerHTML;
                buttonElement.innerHTML = `<span style="font-size: 10px; font-weight: bold; color: #00A680;">Copied!</span>`;
                setTimeout(() => {
                    buttonElement.innerHTML = originalHTML;
                }, 2000);
            }).catch(err => {
                console.error("Failed to copy text: ", err);
            });
        }

        // 60-minutes countdown timer logic
        function startTransferTimer(minutes, seconds) {
            if (timerInterval) clearInterval(timerInterval);
            
            const timerDisplay = document.getElementById('transferTimer');
            let totalSeconds = (minutes * 60) + seconds;

            timerInterval = setInterval(() => {
                if (totalSeconds <= 0) {
                    clearInterval(timerInterval);
                    if (timerDisplay) timerDisplay.textContent = "00:00";
                    return;
                }
                
                totalSeconds--;
                const min = Math.floor(totalSeconds / 60);
                const sec = totalSeconds % 60;
                
                const formattedMin = min < 10 ? '0' + min : min;
                const formattedSec = sec < 10 ? '0' + sec : sec;
                
                if (timerDisplay) {
                    timerDisplay.textContent = `${formattedMin}:${formattedSec}`;
                }
            }, 1000);
        }

        // Handles clicking the 'I have paid' button
        function handleIHavePaid() {
            const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
            const cleanAmount = currentUser.pendingFundingAmount || 1000;

            closeTransferModal();

            // Save details to Firebase database
            if (currentUser.uid && typeof db !== "undefined" && db) {
                db.collection("users").doc(currentUser.uid).update({
                    initialFundingAmount: cleanAmount,
                    walletFunded: true,
                    virtualAccountNumber: currentUser.tempAccountNumber || ""
                })
                .then(() => {
                    currentUser.initialFundingAmount = cleanAmount;
                    currentUser.walletFunded = true;
                    currentUser.virtualAccountNumber = currentUser.tempAccountNumber;
                    delete currentUser.pendingFundingAmount;
                    delete currentUser.tempAccountNumber;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));

                    // Show success feedback cards popup modal
                    showSuccessModal();
                })
                .catch((err) => {
                    console.error("Database update error on confirmation:", err);
                    showSuccessModal();
                });
            } else {
                showSuccessModal();
            }
        }

        // Opens the success response popup
        function showSuccessModal() {
            const successModal = document.getElementById('successPopupModal');
            if (successModal) {
                successModal.style.display = 'flex';
                successModal.classList.remove('d-none');
            }
        }

        // Action for 'Show me how' button to navigate to main index dashboard
        function navigateToDashboard() {
            window.location.href = "index.html";
        }