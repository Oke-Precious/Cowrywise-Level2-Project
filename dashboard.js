// ==========================================
// COWRYWISE DASHBOARD MODULE LOGIC
// ==========================================

let currentUserData = null;
let baseBalance = 1000;
let annualInterestRate = 0.15; // 15% annual yield
let rawInterestEarned = 0;
let isBalanceVisible = true;

// Initialization
document.addEventListener("DOMContentLoaded", () => {
    // 1. Restore local session details
    const localSession = JSON.parse(localStorage.getItem('currentUser'));
    if (localSession) {
        updateSidebarGreeting(localSession);
        if (localSession.initialFundingAmount) {
            baseBalance = parseFloat(localSession.initialFundingAmount);
        }
    }
    
    // Hide hiddenBalanceStars element initially since balance is visible on load
    const starsEl = document.getElementById('hiddenBalanceStars');
    if (starsEl) starsEl.style.display = 'none';

    // 2. Setup Firebase listeners
    if (typeof isFirebaseConfigured === "function" && isFirebaseConfigured() && auth) {
        auth.onAuthStateChanged((user) => {
            if (user) {
                // Fetch latest data from Firestore
                db.collection("users").doc(user.uid).get()
                    .then((doc) => {
                        if (doc.exists) {
                            currentUserData = doc.data();
                            // Update local storage
                            localStorage.setItem('currentUser', JSON.stringify(currentUserData));
                            updateSidebarGreeting(currentUserData);
                            
                            if (currentUserData.initialFundingAmount) {
                                baseBalance = parseFloat(currentUserData.initialFundingAmount);
                            }
                            
                            // Initialize balance calculations & dynamic line charts
                            calculateAndRenderGrowth();
                        }
                    })
                    .catch((err) => {
                        console.error("Error loading user profile:", err);
                        calculateAndRenderGrowth();
                    });
            } else {
                // No user logged in, redirect to login page
                window.location.href = "login.html";
            }
        });
    } else {
        // Fallback calculations if Firebase is not active in dev
        calculateAndRenderGrowth();
    }

    // 3. Initialize carousel auto-slide loop
    startCarouselAutoPlay();

    // 4. Setup drag-to-scroll for all horizontal tracks
    const scrollContainers = document.querySelectorAll(
        '.save-cards-track, .invest-cards-grid, .invest-more-grid'
    );
    
    scrollContainers.forEach(container => {
        let isDown = false;
        let startX;
        let scrollLeft;
        
        container.addEventListener('mousedown', (e) => {
            isDown = true;
            container.style.cursor = 'grabbing';
            startX = e.pageX - container.offsetLeft;
            scrollLeft = container.scrollLeft;
        });
        
        container.addEventListener('mouseleave', () => {
            isDown = false;
            container.style.cursor = 'grab';
        });
        
        container.addEventListener('mouseup', () => {
            isDown = false;
            container.style.cursor = 'grab';
        });
        
        container.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - container.offsetLeft;
            const walk = (x - startX) * 1.5; // adjust scrolling speed multiplier
            container.scrollLeft = scrollLeft - walk;
        });

        // Set initial grab cursor styling
        container.style.cursor = 'grab';
    });
});

// Update greeting name dynamically
function updateSidebarGreeting(userData) {
    const greetingEl = document.getElementById('greetingUsername');
    if (!greetingEl) return;
    
    // Greeting with second name as requested, falling back to first name
    if (userData.secondName) {
        greetingEl.textContent = userData.secondName;
    } else if (userData.firstName) {
        greetingEl.textContent = userData.firstName;
    }
}

// Custom Toast notification UI utility
function showToast(message, type = "success") {
    let toastContainer = document.getElementById('toast-notification-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-notification-container';
        toastContainer.style.position = 'fixed';
        toastContainer.style.top = '24px';
        toastContainer.style.right = '24px';
        toastContainer.style.zIndex = '999999';
        toastContainer.style.display = 'flex';
        toastContainer.style.flexDirection = 'column';
        toastContainer.style.gap = '10px';
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.style.background = type === "success" ? "#00A680" : "#FF3B30";
    toast.style.color = "#ffffff";
    toast.style.padding = "12px 24px";
    toast.style.borderRadius = "8px";
    toast.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.15)";
    toast.style.fontSize = "14px";
    toast.style.fontWeight = "600";
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-20px)";
    toast.style.transition = "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)";
    toast.textContent = message;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateY(0)";
    }, 50);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(-20px)";
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3500);
}

// Calculate compounded interest and draw the SVG line chart
function calculateAndRenderGrowth() {
    const totalDays = 30; // 30-day timeline chart
    const dailyRate = annualInterestRate / 365;
    
    let balancesTimeline = [];
    let currentAccumulated = baseBalance;
    
    // Simulate daily interest growth compounding over the past 30 days
    for (let i = 0; i < totalDays; i++) {
        currentAccumulated = currentAccumulated * (1 + dailyRate);
        balancesTimeline.push(currentAccumulated);
    }

    rawInterestEarned = currentAccumulated - baseBalance;

    // Display current values
    updateBalanceDisplay(currentAccumulated);

    // Update return pill text dynamically
    const returnPillText = document.getElementById('returnPillText');
    if (returnPillText) {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const currentMonth = monthNames[new Date().getMonth()];
        returnPillText.textContent = `₦${rawInterestEarned.toFixed(2)} return in ${currentMonth}`;
    }

    // Render SVG line chart path coordinates
    renderSVGChart(balancesTimeline);
}

// Set big numbers and decimals
function updateBalanceDisplay(totalAmount) {
    const mainEl = document.getElementById('mainBalanceValue');
    const decimalEl = document.getElementById('decimalBalanceValue');
    const starsEl = document.getElementById('hiddenBalanceStars');

    if (!mainEl || !decimalEl || !starsEl) return;

    if (isBalanceVisible) {
        const formattedStr = totalAmount.toFixed(2);
        const parts = formattedStr.split('.');
        
        mainEl.textContent = parseInt(parts[0], 10).toLocaleString('en-US');
        decimalEl.textContent = '.' + parts[1];
        
        mainEl.style.display = 'inline';
        decimalEl.style.display = 'inline';
        starsEl.style.display = 'none';
    } else {
        mainEl.style.display = 'none';
        decimalEl.style.display = 'none';
        starsEl.style.display = 'inline-flex';
        // Render 4 premium eyes with inline styles for a premium 3D / shadow effect
        starsEl.innerHTML = `
            <i class="fa-solid fa-eye" style="margin: 0 4px !important; text-shadow: 0 4px 8px rgba(0,0,0,0.3); font-size: clamp(24px, 4vw, 32px);"></i>
            <i class="fa-solid fa-eye" style="margin: 0 4px !important; text-shadow: 0 4px 8px rgba(0,0,0,0.3); font-size: clamp(24px, 4vw, 32px);"></i>
            <i class="fa-solid fa-eye" style="margin: 0 4px !important; text-shadow: 0 4px 8px rgba(0,0,0,0.3); font-size: clamp(24px, 4vw, 32px);"></i>
            <i class="fa-solid fa-eye" style="margin: 0 4px !important; text-shadow: 0 4px 8px rgba(0,0,0,0.3); font-size: clamp(24px, 4vw, 32px);"></i>
        `;
    }

    // Update Portfolio tab figures
    const portfolioTodayAmount = document.getElementById('portfolioTodayAmount');
    const portfolioEarningsAmount = document.getElementById('portfolioEarningsAmount');
    
    if (portfolioTodayAmount) {
        // Today value e.g., "₦ 1K" if 1000
        const roundedK = (totalAmount / 1000).toFixed(0);
        portfolioTodayAmount.textContent = `₦ ${roundedK}K`;
    }
    if (portfolioEarningsAmount) {
        // July return e.g. "₦0.48"
        portfolioEarningsAmount.textContent = `₦${rawInterestEarned.toFixed(2)}`;
    }
}

// Toggles visibility of account balance numbers
function toggleBalanceVisibility(btnElement) {
    isBalanceVisible = !isBalanceVisible;
    
    const icon = btnElement.querySelector('i');
    if (icon) {
        if (isBalanceVisible) {
            icon.className = 'fa-regular fa-eye';
        } else {
            icon.className = 'fa-regular fa-eye-slash';
        }
    }
    
    // Refresh calculations displays
    const dailyRate = annualInterestRate / 365;
    let currentAccumulated = baseBalance;
    for (let i = 0; i < 30; i++) {
        currentAccumulated = currentAccumulated * (1 + dailyRate);
    }
    updateBalanceDisplay(currentAccumulated);
}

// Render dynamic path inside SVG viewport
function renderSVGChart(timelineData) {
    const linePath = document.getElementById('chartLinePath');
    const fillPath = document.getElementById('chartFillPath');
    if (!linePath || !fillPath) return;

    const width = 400;
    const height = 100;
    const paddingBottom = 20;
    const paddingTop = 30;
    const chartHeight = height - paddingTop - paddingBottom;
    
    const minVal = Math.min(...timelineData);
    const maxVal = Math.max(...timelineData);
    const valRange = maxVal - minVal || 1;

    let points = [];
    const stepX = width / (timelineData.length - 1);

    for (let i = 0; i < timelineData.length; i++) {
        const x = i * stepX;
        // Map values so higher balances are higher on screen (lower Y coordinate)
        const normalized = (timelineData[i] - minVal) / valRange;
        const y = height - paddingBottom - (normalized * chartHeight);
        points.push({x, y});
    }

    // Build SVG Path command
    let pathD = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 1; i < points.length; i++) {
        // Curve calculation (bezier helper)
        const prev = points[i - 1];
        const curr = points[i];
        const cpX1 = prev.x + (curr.x - prev.x) / 2;
        const cpY1 = prev.y;
        const cpX2 = prev.x + (curr.x - prev.x) / 2;
        const cpY2 = curr.y;
        pathD += ` C ${cpX1.toFixed(1)} ${cpY1.toFixed(1)}, ${cpX2.toFixed(1)} ${cpY2.toFixed(1)}, ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
    }

    linePath.setAttribute('d', pathD);

    // Build closed fill path for gradient shape
    const fillD = `${pathD} L ${width} ${height} L 0 ${height} Z`;
    fillPath.setAttribute('d', fillD);
}

// Sidebar Mobile Toggle
function toggleSidebarMenu() {
    const sidebar = document.getElementById('dashboardSidebar');
    if (sidebar) {
        sidebar.classList.toggle('show');
    }
}

// Header profile menu toggling
function toggleUserDropdown() {
    const menu = document.getElementById('userDropdown');
    if (menu) {
        if (menu.classList.contains('d-none')) {
            menu.classList.remove('d-none');
            menu.style.display = 'block';
        } else {
            menu.classList.add('d-none');
            menu.style.display = 'none';
        }
    }
}

// Logout session handling
function handleLogOut() {
    if (typeof auth !== "undefined" && auth) {
        auth.signOut().then(() => {
            localStorage.removeItem('currentUser');
            window.location.href = "login.html";
        });
    } else {
        localStorage.removeItem('currentUser');
        window.location.href = "login.html";
    }
}

// Sidebar Tab switching
function switchMainTab(tabId, menuLinkBtn) {
    // Remove active sidebar link highlight
    const links = document.querySelectorAll('.sidebar-nav .nav-link');
    links.forEach(l => l.classList.remove('active'));
    if (menuLinkBtn) menuLinkBtn.classList.add('active');

    // Close mobile menu on select
    const sidebar = document.getElementById('dashboardSidebar');
    if (sidebar) sidebar.classList.remove('show');

    // All panels to hide
    const allPanels = ['homePanel', 'savePanel', 'investPanel', 'nestPanel', 'stashPanel', 'fallbackPanel'];
    allPanels.forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.classList.remove('active'); el.classList.add('d-none'); el.style.display = 'none'; }
    });

    // Page title badge update
    const titleBadge = document.querySelector('.page-title-badge');
    const pageTitles = {
        home: 'Account Overview', save: 'SAVE', invest: 'INVEST',
        nest: 'NEST', payment: 'PAYMENT', stash: 'STASH',
        learn: 'LEARN', referral: 'REFERRAL'
    };
    if (titleBadge) titleBadge.textContent = pageTitles[tabId] || tabId.toUpperCase();

    // Show target panel
    if (tabId === 'home') {
        const p = document.getElementById('homePanel');
        if (p) { p.classList.add('active'); p.classList.remove('d-none'); p.style.display = 'block'; }
    } else if (tabId === 'save') {
        const p = document.getElementById('savePanel');
        if (p) { p.classList.add('active'); p.classList.remove('d-none'); p.style.display = 'block'; }
        syncSaveBalanceDisplay();
    } else if (tabId === 'invest') {
        const p = document.getElementById('investPanel');
        if (p) { p.classList.add('active'); p.classList.remove('d-none'); p.style.display = 'block'; }
        syncInvestBalanceDisplay();
    } else if (tabId === 'nest') {
        const p = document.getElementById('nestPanel');
        if (p) { p.classList.add('active'); p.classList.remove('d-none'); p.style.display = 'block'; }
    } else if (tabId === 'stash') {
        const p = document.getElementById('stashPanel');
        if (p) { p.classList.add('active'); p.classList.remove('d-none'); p.style.display = 'block'; }
        syncStashPage();
    } else {
        const p = document.getElementById('fallbackPanel');
        if (p) { p.classList.add('active'); p.classList.remove('d-none'); p.style.display = 'block'; }
        const fallbackTitle = document.getElementById('fallbackTitle');
        if (fallbackTitle) {
            fallbackTitle.textContent = `${tabId.charAt(0).toUpperCase() + tabId.slice(1)} Segment`;
        }
    }
}

// Sync save balance from the main balance (savings is separate, starts at 0)
function syncSaveBalanceDisplay() {
    const saveMain = document.getElementById('saveBalanceMain');
    const saveDec  = document.getElementById('saveBalanceDecimal');
    if (saveMain && saveDec) {
        saveMain.textContent = '0';
        saveDec.textContent  = '.00';
    }
}

// Sync invest balance from calculated main balance
function syncInvestBalanceDisplay() {
    const mainEl    = document.getElementById('mainBalanceValue');
    const decimalEl = document.getElementById('decimalBalanceValue');
    const investMain = document.getElementById('investBalanceMain');
    const investDec  = document.getElementById('investBalanceDecimal');
    const nairaFunds = document.getElementById('nairaFundsDisplayAmt');
    if (mainEl && investMain) {
        investMain.textContent = mainEl.textContent;
    }
    if (decimalEl && investDec) {
        investDec.textContent = decimalEl.textContent;
    }
    if (mainEl && decimalEl && nairaFunds) {
        nairaFunds.textContent = `₦ ${mainEl.textContent}${decimalEl.textContent}`;
    }
}

// Save page balance visibility toggle
let isSaveBalanceVisible = true;
function toggleSaveBalanceVisibility(iconEl) {
    isSaveBalanceVisible = !isSaveBalanceVisible;
    const saveMain = document.getElementById('saveBalanceMain');
    const saveDec  = document.getElementById('saveBalanceDecimal');
    if (saveMain && saveDec) {
        saveMain.style.opacity = isSaveBalanceVisible ? '1' : '0';
        saveDec.style.opacity  = isSaveBalanceVisible ? '1' : '0';
    }
    if (iconEl) {
        iconEl.className = isSaveBalanceVisible ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash';
    }
}

// Sub tab toggles (Home vs Portfolio)
function switchSubTab(subTabId, tabHeaderBtn) {
    const buttons = document.querySelectorAll('.sub-tabs-container .sub-tab-btn');
    buttons.forEach(b => b.classList.remove('active'));
    tabHeaderBtn.classList.add('active');

    const homeContent = document.getElementById('homeSubTabContent');
    const portfolioContent = document.getElementById('portfolioSubTabContent');

    if (subTabId === 'home-sub') {
        homeContent.classList.add('active');
        homeContent.classList.remove('d-none');
        homeContent.style.display = 'block';
        
        portfolioContent.classList.add('d-none');
        portfolioContent.classList.remove('active');
        portfolioContent.style.display = 'none';
    } else {
        portfolioContent.classList.add('active');
        portfolioContent.classList.remove('d-none');
        portfolioContent.style.display = 'block';
        
        homeContent.classList.add('d-none');
        homeContent.classList.remove('active');
        homeContent.style.display = 'none';
    }
}

// ==========================================
// ADVERTISEMENT CAROUSEL SYSTEM
// ==========================================
let carouselIndex = 0;
let carouselTimer = null;

function slideCarousel(direction) {
    const slides = document.querySelectorAll('.carousel-slide');
    if (slides.length === 0) return;

    // Reset slide timers
    resetCarouselTimer();

    slides[carouselIndex].classList.remove('active');
    
    carouselIndex = (carouselIndex + direction + slides.length) % slides.length;
    
    slides[carouselIndex].classList.add('active');
}

function startCarouselAutoPlay() {
    carouselTimer = setInterval(() => {
        slideCarousel(1);
    }, 4500); // Transitions every 4.5 seconds
}

function resetCarouselTimer() {
    if (carouselTimer) clearInterval(carouselTimer);
    startCarouselAutoPlay();
}

// ==========================================
// QUICK MONEY ADD BUTTONS
// ==========================================
function quickAddAmount(amount, currency = '₦') {
    const formattedAmt = amount.toLocaleString('en-US');
    showToast(`Initiating payment of ${currency}${formattedAmt}...`);
    
    // Save new balance to database simulation
    const updatedBalance = baseBalance + amount;
    
    const user = auth ? auth.currentUser : null;
    if (user && db) {
        db.collection("users").doc(user.uid).update({
            initialFundingAmount: updatedBalance
        })
        .then(() => {
            baseBalance = updatedBalance;
            // Update cache
            const cache = JSON.parse(localStorage.getItem('currentUser')) || {};
            cache.initialFundingAmount = updatedBalance;
            localStorage.setItem('currentUser', JSON.stringify(cache));
            
            calculateAndRenderGrowth();
            showToast(`Added ${currency}${formattedAmt} successfully!`, 'success');
        })
        .catch(err => {
            console.error("Error updating balance:", err);
            showToast("Failed to complete transaction.", "error");
        });
    } else {
        baseBalance = updatedBalance;
        calculateAndRenderGrowth();
        showToast(`Added ${currency}${formattedAmt} successfully (Offline)!`, 'success');
    }
}

function customAddAmount() {
    const modal = document.getElementById('topupModalOverlay');
    if (modal) {
        // Sync Naira Mutual Fund display value with current calculated balance
        const nairaDisplay = document.getElementById('topupNairaFundDisplay');
        const mainEl = document.getElementById('mainBalanceValue');
        const decimalEl = document.getElementById('decimalBalanceValue');
        if (nairaDisplay && mainEl && decimalEl) {
            nairaDisplay.textContent = `₦ ${mainEl.textContent}${decimalEl.textContent}`;
        }
        
        modal.style.display = 'flex';
        modal.classList.remove('d-none');
    }
}

function closeTopupModal() {
    const modal = document.getElementById('topupModalOverlay');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.add('d-none');
    }
}

function switchTopupModalTab(tabKey) {
    // Toggles tab buttons active class
    document.getElementById('topupTabSavings').classList.remove('active');
    document.getElementById('topupTabNaira').classList.remove('active');
    document.getElementById('topupTabDollar').classList.remove('active');

    // Toggles panels active class
    document.getElementById('topupPanelSavings').style.display = 'none';
    document.getElementById('topupPanelSavings').classList.add('d-none');
    document.getElementById('topupPanelNaira').style.display = 'none';
    document.getElementById('topupPanelNaira').classList.add('d-none');
    document.getElementById('topupPanelDollar').style.display = 'none';
    document.getElementById('topupPanelDollar').classList.add('d-none');

    if (tabKey === 'savings') {
        document.getElementById('topupTabSavings').classList.add('active');
        document.getElementById('topupPanelSavings').style.display = 'block';
        document.getElementById('topupPanelSavings').classList.remove('d-none');
    } else if (tabKey === 'naira') {
        document.getElementById('topupTabNaira').classList.add('active');
        document.getElementById('topupPanelNaira').style.display = 'block';
        document.getElementById('topupPanelNaira').classList.remove('d-none');
    } else if (tabKey === 'dollar') {
        document.getElementById('topupTabDollar').classList.add('active');
        document.getElementById('topupPanelDollar').style.display = 'block';
        document.getElementById('topupPanelDollar').classList.remove('d-none');
    }
}

function selectTopupOption(optionName) {
    closeTopupModal();
    const amountVal = prompt(`Enter top-up amount for [${optionName}] (Min ₦100):`);
    if (amountVal === null) return;
    
    const cleanAmt = parseInt(amountVal.replace(/[^0-9]/g, ''), 10);
    if (isNaN(cleanAmt) || cleanAmt < 100) {
        showToast("Please enter a valid amount of ₦100 or more.", "error");
        return;
    }
    
    if (optionName.includes('Dollar')) {
        quickAddAmount(cleanAmt, '$');
    } else {
        quickAddAmount(cleanAmt);
    }
}

// Nest Form submission & validation handler
function handleNestSubmit(event) {
    event.preventDefault();
    
    const firstName = document.getElementById('nestFirstName');
    const surname = document.getElementById('nestSurname');
    const dob = document.getElementById('nestDOB');
    
    const firstNameErr = document.getElementById('nestFirstNameError');
    const surnameErr = document.getElementById('nestSurnameError');
    const dobErr = document.getElementById('nestDOBError');
    
    let isValid = true;
    
    // Validate First Name
    if (!firstName.value.trim()) {
        firstNameErr.classList.remove('d-none');
        firstName.classList.add('input-error');
        isValid = false;
    } else {
        firstNameErr.classList.add('d-none');
        firstName.classList.remove('input-error');
    }
    
    // Validate Surname
    if (!surname.value.trim()) {
        surnameErr.classList.remove('d-none');
        surname.classList.add('input-error');
        isValid = false;
    } else {
        surnameErr.classList.add('d-none');
        surname.classList.remove('input-error');
    }
    
    // Validate Date of Birth
    if (!dob.value) {
        dobErr.classList.remove('d-none');
        dob.classList.add('input-error');
        isValid = false;
    } else {
        dobErr.classList.add('d-none');
        dob.classList.remove('input-error');
    }
    
    if (isValid) {
        showToast(`Nest account for ${firstName.value.trim()} has been successfully created!`);
        firstName.value = '';
        surname.value = '';
        dob.value = '';
    }
}

/* ======================================================
   STASH PAGE HELPERS
   ====================================================== */

/**
 * Populate the stash bank card with the virtual account number
 * and full name generated during the user's registration payment.
 */
function syncStashPage() {
    const acctEl   = document.getElementById('stashAcctNumber');
    const nameEl   = document.getElementById('stashAcctName');
    if (!acctEl || !nameEl) return;

    try {
        const raw = localStorage.getItem('currentUser');
        if (!raw) throw new Error('No user in storage');
        const user = JSON.parse(raw);

        // Account number — saved as virtualAccountNumber after payment confirmed
        const acctNum = user.virtualAccountNumber || user.tempAccountNumber || '';

        // Build full name identical to how welcome.js builds it
        let fullname = '';
        if (user.firstName && user.secondName) {
            fullname = `${user.firstName} ${user.secondName}`;
        } else if (user.firstName) {
            fullname = user.firstName;
        } else if (user.secondName) {
            fullname = user.secondName;
        } else if (user.displayName) {
            fullname = user.displayName;
        } else {
            fullname = user.email || 'Account Holder';
        }

        if (acctNum) {
            acctEl.textContent = acctNum;
            nameEl.textContent = `Cowrywise/${fullname}`;
        } else {
            // User hasn't completed initial funding yet
            acctEl.textContent = 'Not yet generated';
            acctEl.style.fontSize = '14px';
            nameEl.textContent = 'Complete your first deposit to get an account number';
        }
    } catch (e) {
        acctEl.textContent = 'Unavailable';
        nameEl.textContent = 'Please log in again';
    }
}

/** Toggle stash balance between visible and hidden */
function toggleStashBalance(eyeIcon) {
    const display = document.getElementById('stashBalanceDisplay');
    if (!display) return;
    const main = display.querySelector('.stash-balance-main');
    const dec  = display.querySelector('.stash-balance-decimal');
    if (!main) return;

    const isHidden = main.dataset.hidden === 'true';
    if (isHidden) {
        main.textContent = main.dataset.realValue || '0';
        dec.style.visibility = 'visible';
        main.dataset.hidden = 'false';
        eyeIcon.classList.replace('fa-eye-slash', 'fa-eye');
    } else {
        main.dataset.realValue = main.textContent;
        main.textContent = '****';
        dec.style.visibility = 'hidden';
        main.dataset.hidden = 'true';
        eyeIcon.classList.replace('fa-eye', 'fa-eye-slash');
    }
}

/** Copy the stash virtual account number from the DOM to clipboard */
function copyStashAccount() {
    const acctEl = document.getElementById('stashAcctNumber');
    const acctNum = acctEl ? acctEl.textContent.trim() : '';

    if (!acctNum || acctNum === '—' || acctNum === 'Not yet generated' || acctNum === 'Unavailable') {
        showToast('No account number to copy yet.');
        return;
    }
    navigator.clipboard.writeText(acctNum).then(() => {
        showToast('Account number copied!');
    }).catch(() => {
        showToast('Copy failed. Account number: ' + acctNum);
    });
}

/** Filter stash transaction list */
function filterStashTx(type) {
    const items = document.querySelectorAll('#stashTxList .stash-tx-item');
    items.forEach(item => {
        if (type === 'all') {
            item.style.display = 'flex';
        } else if (type === 'credit') {
            item.style.display = item.classList.contains('stash-tx-credit') ? 'flex' : 'none';
        } else if (type === 'debit') {
            item.style.display = item.classList.contains('stash-tx-debit') ? 'flex' : 'none';
        }
    });
}
