document.addEventListener('DOMContentLoaded', function() {
    const frequencySelect = document.querySelector('.timeSelect:first-of-type');
    const durationSelect = document.querySelector('.timeSelect:last-of-type');
    const amountField = document.querySelector('.amountField');
    const currencySelect = document.querySelector('.currencySelect');
    const resultAmount = document.querySelector('.mainAmount span:last-child');
    const resultReturns = document.querySelectorAll('.mainAmount')[1]?.querySelector('span:last-child');
    const bankAmount = document.querySelectorAll('.calculatorBox:last-of-type .display-6 span:last-child');

    // Check if all required elements exist
    if (!frequencySelect || !durationSelect || !amountField || !currencySelect || !resultAmount || !resultReturns) {
        console.error('Missing required calculator elements');
        return;
    }

    const currencySymbols = {
        'Dollar': '$',
        'Naira': '₦',
        'Euro': '€'
    };

    const exchangeRates = {
        'Dollar': 1,
        'Naira': 0.00065,
        'Euro': 1.08
    };

    const cowrywiseRates = {
        'Dollar': 0.16,
        'Naira': 0.16,
        'Euro': 0.12
    };

    const bankRates = {
        'Dollar': 0.025,
        'Naira': 0.04,
        'Euro': 0.02
    };

    function calculateReturns() {
        const amount = parseFloat(amountField.value) || 0;
        const currency = currencySelect.value;
        const frequency = frequencySelect.value;
        const durationText = durationSelect.value;
        const match = durationText.match(/\d+/);
        const durationYears = match ? parseInt(match[0]) : 1;

        if (amount <= 0) return;

        const periodsPerYear = {
            'every week': 52,
            'every month': 12,
            'daily': 365,
            'once': 1
        };

        const periods = periodsPerYear[frequency];
        const annualRate = cowrywiseRates[currency];
        const bankAnnualRate = bankRates[currency];
        const symbol = currencySymbols[currency];

        let totalContributed;
        if (frequency === 'once') {
            totalContributed = amount;
        } else {
            totalContributed = amount * periods * durationYears;
        }

        const cowrywiseTotal = totalContributed * Math.pow(1 + annualRate, durationYears);
        const cowrywiseReturns = cowrywiseTotal - totalContributed;

        const bankTotal = totalContributed * Math.pow(1 + bankAnnualRate, durationYears);

        const formatNumber = (num) => {
            return Math.round(num).toLocaleString();
        };

        resultAmount.textContent = formatNumber(cowrywiseTotal);
        resultReturns.textContent = formatNumber(cowrywiseReturns);

        if (bankAmount.length > 0) {
            bankAmount[0].textContent = formatNumber(bankTotal);
        }

        document.querySelectorAll('.currency').forEach(el => {
            el.textContent = symbol;
        });
    }

    frequencySelect.addEventListener('change', calculateReturns);
    durationSelect.addEventListener('change', calculateReturns);
    amountField.addEventListener('input', calculateReturns);
    currencySelect.addEventListener('change', calculateReturns);

    calculateReturns();
});
