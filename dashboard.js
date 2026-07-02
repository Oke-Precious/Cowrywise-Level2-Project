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
    menuLinkBtn.classList.add('active');

    // Close mobile menu on select
    const sidebar = document.getElementById('dashboardSidebar');
    if (sidebar) sidebar.classList.remove('show');

    // Toggle Tab Views
    const homePanel = document.getElementById('homePanel');
    const fallbackPanel = document.getElementById('fallbackPanel');
    
    if (tabId === 'home') {
        homePanel.classList.add('active');
        homePanel.style.display = 'block';
        
        fallbackPanel.classList.add('d-none');
        fallbackPanel.style.display = 'none';
    } else {
        homePanel.classList.remove('active');
        homePanel.style.display = 'none';
        
        fallbackPanel.classList.remove('d-none');
        fallbackPanel.style.display = 'block';
        
        // Update Title dynamically
        const fallbackTitle = document.getElementById('fallbackTitle');
        if (fallbackTitle) {
            fallbackTitle.textContent = `${tabId.charAt(0).toUpperCase() + tabId.slice(1)} Segment`;
        }
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
    const inputVal = prompt("Enter the custom amount to add (Min ₦100):");
    if (inputVal === null) return;
    
    const amount = parseInt(inputVal.replace(/[^0-9]/g, ''), 10);
    if (isNaN(amount) || amount < 100) {
        showToast("Please enter a valid amount of ₦100 or more.", "error");
        return;
    }
    quickAddAmount(amount);
}
