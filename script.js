// Initialize data
let transactions = [
  {
    id: 1,
    date: "2025-01-14",
    category: "Subscription",
    amount: -440,
    status: "Success",
    type: "expense",
  },
  {
    id: 2,
    date: "2025-01-10",
    category: "Transfer",
    amount: -440,
    status: "Success",
    type: "expense",
  },
  {
    id: 3,
    date: "2025-01-08",
    category: "Transfer",
    amount: -440,
    status: "Success",
    type: "expense",
  },
];


let editingTransactionId = null;
let editingAccountId = null;

let searchTerm = "";
let currentFilter = "all";
let currentSort = "latest";
let overviewChart = null;
let expensePieChart = null;
let selectedAccount = "all";

let overviewFromDate = "";
let overviewToDate = "";

let monthlyBudget = 15000;

let expensePeriod = "monthly";


// ====================
// Accounts
// ====================

let accounts = [
    {
        id: "cash",
        name: "Cash",
        type: "cash",
        balance: 0
    },
    {
        id: "bank",
        name: "Bank Account",
        type: "bank",
        balance: 0
    },
    {
        id: "upi",
        name: "UPI",
        type: "upi",
        balance: 0
    },
    {
        id: "credit",
        name: "Credit Card",
        type: "credit",
        balance: 0
    }
];


// Get transactions for the selected dashboard period
function getDashboardTransactions() {

    const period =
        document.getElementById("dashboardPeriod").value;

    const selectedDate =
        document.getElementById("datePickerInput").value;

    const now = selectedDate
        ? new Date(selectedDate + "T00:00:00")
        : new Date();


    // First filter transactions by selected period
    let periodTransactions =
        transactions.filter(transaction => {

            const [year, month, day] =
                transaction.date.split("-").map(Number);

            const transactionDate =
                new Date(year, month - 1, day);


            // Daily
            if (period === "daily") {

                return (
                    transactionDate.getFullYear() === now.getFullYear() &&
                    transactionDate.getMonth() === now.getMonth() &&
                    transactionDate.getDate() === now.getDate()
                );

            }


            // Weekly
            if (period === "weekly") {

                const startOfWeek =
                    new Date(now);

                const dayOfWeek =
                    now.getDay();

                startOfWeek.setDate(
                    now.getDate() - dayOfWeek
                );

                startOfWeek.setHours(
                    0, 0, 0, 0
                );


                const endOfWeek =
                    new Date(startOfWeek);

                endOfWeek.setDate(
                    startOfWeek.getDate() + 6
                );

                endOfWeek.setHours(
                    23, 59, 59, 999
                );


                return (
                    transactionDate >= startOfWeek &&
                    transactionDate <= endOfWeek
                );

            }


            // Monthly
            if (period === "monthly") {

                return (
                    transactionDate.getFullYear() === now.getFullYear() &&
                    transactionDate.getMonth() === now.getMonth()
                );

            }


            // Yearly
            if (period === "yearly") {

                return (
                    transactionDate.getFullYear() === now.getFullYear()
                );

            }


            return true;

        });

// Filter by custom date range
if (overviewFromDate || overviewToDate) {

    periodTransactions =
        periodTransactions.filter(transaction => {

            if (
                overviewFromDate &&
                transaction.date < overviewFromDate
            ) {
                return false;
            }

            if (
                overviewToDate &&
                transaction.date > overviewToDate
            ) {
                return false;
            }

            return true;

        });

}

    // Then filter by selected account
    if (selectedAccount !== "all") {

        periodTransactions =
            periodTransactions.filter(
                transaction =>
                    transaction.account === selectedAccount
            );

    }


    return periodTransactions;

}

// ====================
// Local Storage
// ====================

function saveData() {

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

    localStorage.setItem(
        "monthlyBudget",
        monthlyBudget
    );

    localStorage.setItem(
    "accounts",
    JSON.stringify(accounts)
);

}

function loadData() {

    const savedTransactions = localStorage.getItem("transactions");

    if(savedTransactions){
        transactions = JSON.parse(savedTransactions);
    }

    const savedBudget =
    localStorage.getItem("monthlyBudget");

    if(savedBudget){

      monthlyBudget = Number(savedBudget);

}

const savedAccounts =
    localStorage.getItem("accounts");

if (savedAccounts) {

    accounts =
        JSON.parse(savedAccounts);

}

transactions.forEach(transaction => {

    if (!transaction.account) {

        transaction.account = "bank";

    }

});

}

// Set today's date as default
const today = new Date().toISOString().split("T")[0];
document.getElementById("datePickerInput").value = today;
document.getElementById("incomeDate").value = today;
document.getElementById("expenseDate").value = today;

// Modal functions
function openIncomeModal() {
  document.getElementById("incomeModal").style.display = "block";
  document.body.style.overflow = "hidden";
}

function openExpenseModal() {
  document.getElementById("expenseModal").style.display = "block";
  document.body.style.overflow = "hidden";
}

function openTransferModal() {

    const modal =
        document.getElementById("transferModal");

    const dateInput =
        document.getElementById("transferDate");

    dateInput.value = today;

    populateTransferAccounts();

    modal.style.display = "block";

    document.body.style.overflow = "hidden";

}

document
    .getElementById("addTransferBtn")
    .addEventListener("click", openTransferModal);


function populateTransferAccounts() {

    const fromSelect =
        document.getElementById("transferFrom");

    const toSelect =
        document.getElementById("transferTo");


    const options =
        accounts
            .map(account => {

                return `
                    <option value="${account.id}">
                        ${account.name}
                    </option>
                `;

            })
            .join("");


    fromSelect.innerHTML =
        `<option value="">
            Select account
        </option>
        ${options}`;


    toSelect.innerHTML =
        `<option value="">
            Select account
        </option>
        ${options}`;

}

function saveTransfer() {

    const amount =
        parseFloat(
            document.getElementById("transferAmount").value
        );

    const fromAccount =
        document.getElementById("transferFrom").value;

    const toAccount =
        document.getElementById("transferTo").value;

    const description =
        document.getElementById("transferDescription").value;

    const date =
        document.getElementById("transferDate").value;


    if (
        !amount ||
        amount <= 0 ||
        !fromAccount ||
        !toAccount ||
        !date
    ) {

        showNotification(
            "Please fill in all required fields.",
            "error"
        );

        return;

    }


    if (fromAccount === toAccount) {

        showNotification(
            "From and To accounts must be different.",
            "error"
        );

        return;

    }


    const sourceAccount =
        accounts.find(
            account => account.id === fromAccount
        );


    if (!sourceAccount) {

        showNotification(
            "Source account not found.",
            "error"
        );

        return;

    }


    calculateAccountBalances();


    if (sourceAccount.balance < amount) {

        showNotification(
            "Insufficient balance in the source account.",
            "error"
        );

        return;

    }


    const transferId =
        Date.now();


    const transferOut = {

        id: transferId,

        date: date,

        category: "Transfer",

        account: fromAccount,

        amount: -amount,

        status: "Success",

        type: "transfer",

        description:
            description ||
            `Transfer to ${getAccountName(toAccount)}`,

        transferId: transferId,

        transferDirection: "out",

        transferAccount: toAccount

    };


    const transferIn = {

        id: transferId + 1,

        date: date,

        category: "Transfer",

        account: toAccount,

        amount: amount,

        status: "Success",

        type: "transfer",

        description:
            description ||
            `Transfer from ${getAccountName(fromAccount)}`,

        transferId: transferId,

        transferDirection: "in",

        transferAccount: fromAccount

    };


    transactions.push(
        transferOut,
        transferIn
    );


    saveData();

    calculateAccountBalances();

    updateDashboard();

    updateTransactionsTable();

    closeModal("transferModal");


    document
        .getElementById("transferForm")
        .reset();


    showNotification(
        `₹${amount.toLocaleString("en-IN")} transferred successfully!`
    );

}

function openBudgetModal() {

    const budgetInput = document.getElementById("budgetInput");

    budgetInput.value = monthlyBudget;

    document.getElementById("budgetModal").style.display = "block";

    document.body.style.overflow = "hidden";
}

function openAccountModal(accountId = null) {

    const modal =
        document.getElementById("accountModal");

    const title =
        document.getElementById("accountModalTitle");

    const nameInput =
        document.getElementById("accountName");

    const typeInput =
        document.getElementById("accountType");


    editingAccountId = accountId;


    if (accountId) {

        const account =
            accounts.find(
                acc => acc.id === accountId
            );

        if (!account) return;

        title.textContent = "Edit Account";

        nameInput.value = account.name;

        typeInput.value = account.type;

    } else {

        title.textContent = "Add Account";

        nameInput.value = "";

        typeInput.value = "";

    }


    modal.style.display = "block";

    document.body.style.overflow = "hidden";

}

function closeModal(modalId) {

    document.getElementById(modalId).style.display = "none";

    document.body.style.overflow = "auto";


    // Reset income form
    if (modalId === "incomeModal") {

        document.getElementById("incomeForm").reset();

        document.getElementById("incomeDate").value = today;

    }


    // Reset expense form
    else if (modalId === "expenseModal") {

        document.getElementById("expenseForm").reset();

        document.getElementById("expenseDate").value = today;

    }


    // Reset budget form
    else if (modalId === "budgetModal") {

        document.getElementById("budgetForm").reset();

    }

}

document.getElementById("editBudgetBtn").addEventListener("click", function () {

    openBudgetModal();

});

function saveAccount() {

    const name =
        document.getElementById("accountName")
            .value.trim();

    const type =
        document.getElementById("accountType")
            .value;


    if (!name || !type) {

        alert("Please fill in all required fields.");

        return;

    }


    // Editing existing account

    if (editingAccountId) {

        const account =
            accounts.find(
                acc => acc.id === editingAccountId
            );

        if (account) {

            account.name = name;
            account.type = type;

        }

        showNotification(
            "Account updated successfully!"
        );

    }


    // Creating new account

    else {

        const newAccount = {

            id:
                "account_" +
                Date.now(),

            name: name,

            type: type,

            balance: 0

        };


        accounts.push(newAccount);


        showNotification(
            "Account added successfully!"
        );

    }


    saveData();

    populateAccountDropdowns();

    calculateAccountBalances();
    populateAccountFilter();

    renderAccounts();

    closeModal("accountModal");

    editingAccountId = null;

}

function renderAccounts() {

    const container =
        document.getElementById("accountsList");

    if (!container) return;


    calculateAccountBalances();


    container.innerHTML =
        accounts.map(account => {

            const balance =
                Number(account.balance || 0);


            return `

                <div
                    class="account-item"
                    data-account-id="${account.id}">

                    <div class="account-info">

                        <div class="account-icon">
                            ${getAccountIcon(account.type)}
                        </div>

                        <div>

                            <div class="account-name">
                                ${account.name}
                            </div>

                            <div class="account-type">
                                ${formatAccountType(account.type)}
                            </div>

                        </div>

                    </div>


                    <div class="account-right">

                        <div
                            class="account-balance
                            ${balance < 0 ? "negative" : ""}">

                            ₹${Math.abs(balance)
                                .toLocaleString("en-IN")}

                        </div>


                        <div class="account-actions">

                            <button
                                onclick="openAccountModal('${account.id}')"
                                title="Edit">

                                <i class="fas fa-pen"></i>

                            </button>


                            <button
                                onclick="deleteAccount('${account.id}')"
                                title="Delete">

                                <i class="fas fa-trash"></i>

                            </button>

                        </div>

                    </div>

                </div>

            `;

        }).join("");

}

function getAccountIcon(type) {

    const icons = {

        cash: "💵",

        bank: "🏦",

        upi: "📱",

        credit: "💳",

        wallet: "👛",

        other: "💰"

    };


    return icons[type] || "💰";

}

function formatAccountType(type) {

    const names = {

        cash: "Cash",

        bank: "Bank Account",

        upi: "UPI",

        credit: "Credit Card",

        wallet: "Digital Wallet",

        other: "Other"

    };


    return names[type] || "Other";

}

function deleteAccount(accountId) {

    const account =
        accounts.find(
            acc => acc.id === accountId
        );


    if (!account) return;


    const transactionCount =
        transactions.filter(
            transaction =>
                transaction.account === accountId
        ).length;


    if (transactionCount > 0) {

        alert(
            "This account has transactions and cannot be deleted yet."
        );

        return;

    }


    const confirmed =
        confirm(
            `Delete "${account.name}"?`
        );


    if (!confirmed) return;


    accounts =
        accounts.filter(
            acc => acc.id !== accountId
        );
if (selectedAccount === accountId) {

    selectedAccount = "all";

}

    saveData();

    populateAccountDropdowns();
    populateAccountFilter();

    renderAccounts();

    showNotification(
        "Account deleted successfully!"
    );

}

function saveBudget() {

    const budgetInput =
        document.getElementById("budgetInput");

    const newBudget =
        parseFloat(budgetInput.value);

    if (!newBudget || newBudget <= 0) {

        alert("Please enter a valid budget.");

        return;
    }

    monthlyBudget = newBudget;

    saveData();

    updateDashboard();

    closeModal("budgetModal");

    showNotification("Budget updated successfully!");

}

// Close modal when clicking outside
window.onclick = function (event) {

    const incomeModal =
        document.getElementById("incomeModal");

    const expenseModal =
        document.getElementById("expenseModal");

    const budgetModal =
        document.getElementById("budgetModal");


    const transferModal =
    document.getElementById("transferModal");

if (event.target === transferModal) {

    closeModal("transferModal");

}

    if (event.target === incomeModal) {

        closeModal("incomeModal");

    }


    if (event.target === expenseModal) {

        closeModal("expenseModal");

    }


    if (event.target === budgetModal) {

        closeModal("budgetModal");

    }

};

// Add income function
function addIncome() {
  const amount = parseFloat(document.getElementById("incomeAmount").value);
  const category = document.getElementById("incomeCategory").value;
  const description = document.getElementById("incomeDescription").value;
  const date = document.getElementById("incomeDate").value;
  const account =
    document.getElementById("incomeAccount").value;

  if(editingTransactionId){

    const oldTransaction=transactions.find(
        t=>t.id===editingTransactionId
    );

    oldTransaction.amount=amount;
    oldTransaction.category =
    category.charAt(0).toUpperCase() + category.slice(1);
    oldTransaction.description=description;
    oldTransaction.date=date;


    editingTransactionId=null;

    updateDashboard();
    updateTransactionsTable();
    saveData();

    closeModal("incomeModal");

    showNotification("Transaction updated!");

    return;
  }

  if (!amount || !category || !account || !date) {
    alert("Please fill in all required fields");
    return;
  }

  // Add to transactions
  const newTransaction = {
    id: Date.now(),
    date: date,
    category: category.charAt(0).toUpperCase() + category.slice(1),
    account: account,
    amount: amount,
    status: "Success",
    type: "income",
    description: description,
  };

  transactions.unshift(newTransaction);

  // Update monthly income
  updateDashboard();
  updateTransactionsTable();
  saveData();

  closeModal("incomeModal");

  // Show success message
  showNotification("Income added successfully!", "success");
}

// Add expense function
function addExpense() {
  const amount = parseFloat(document.getElementById("expenseAmount").value);
  const category = document.getElementById("expenseCategory").value;
  const description = document.getElementById("expenseDescription").value;
  const date = document.getElementById("expenseDate").value;
  const account =
    document.getElementById("expenseAccount").value;

  if(editingTransactionId){

    const oldTransaction=transactions.find(
        t=>t.id===editingTransactionId
    );


    oldTransaction.amount=-amount;
    oldTransaction.category =
    category.charAt(0).toUpperCase() + category.slice(1);
    oldTransaction.description=description;
    oldTransaction.date=date;

    editingTransactionId=null;

    updateDashboard();
    updateTransactionsTable();
    saveData();

    closeModal("expenseModal");

    showNotification("Transaction updated!");

    return;
  }

  if (!amount || !category || !account || !date) {
    alert("Please fill in all required fields");
    return;
  }

  // Add to transactions
  const newTransaction = {
    id: Date.now(),
    date: date,
    category: category.charAt(0).toUpperCase() + category.slice(1),
    account: account,
    amount: -amount,
    status: "Success",
    type: "expense",
    description: description,
  };

  transactions.unshift(newTransaction);

  // Update monthly expenses
  updateDashboard();
  updateTransactionsTable();
  saveData();

  closeModal("expenseModal");

  // Show success message
  showNotification("Expense added successfully!", "success");
}

document.getElementById("searchInput")
.addEventListener("input", function(){

    searchTerm = this.value.toLowerCase();

    updateTransactionsTable();

});

document.getElementById("typeFilter")
.addEventListener("change", function () {

    currentFilter = this.value;

    updateTransactionsTable();

});

document.getElementById("sortTransactions")
.addEventListener("change", function () {

    currentSort = this.value;

    updateTransactionsTable();

});

document.getElementById("clearFilters").addEventListener("click", function () {

    searchTerm = "";
    currentFilter = "all";
    currentSort = "latest";

    document.getElementById("searchInput").value = "";
    document.getElementById("typeFilter").value = "all";
    document.getElementById("sortTransactions").value = "latest";

    updateTransactionsTable();

    showNotification("Filters cleared!");
});

function populateAccountDropdowns() {

    const incomeSelect =
        document.getElementById("incomeAccount");

    const expenseSelect =
        document.getElementById("expenseAccount");


    const options = accounts
        .map(account => {

            return `
                <option value="${account.id}">
                    ${account.name}
                </option>
            `;

        })
        .join("");


    if (incomeSelect) {

        incomeSelect.innerHTML =
            `<option value="">Select account</option>
             ${options}`;

    }


    if (expenseSelect) {

        expenseSelect.innerHTML =
            `<option value="">Select account</option>
             ${options}`;

    }

}

function calculateTotals() {

    let income = 0;
    let expense = 0;

    const periodTransactions =
        getDashboardTransactions();

    periodTransactions.forEach(transaction => {

        if (transaction.type === "income") {

    income += transaction.amount;

}
else if (transaction.type === "expense") {

    expense += Math.abs(transaction.amount);

}

    });

    return {

        income,
        expense,
        balance: income - expense,
        totalTransactions: periodTransactions.length

    };

}

function getExpensePeriodTransactions() {

    const selectedDate =
        document.getElementById("datePickerInput").value;

    const now = selectedDate
        ? new Date(selectedDate + "T00:00:00")
        : new Date();


    return transactions.filter(transaction => {

        if (transaction.type !== "expense") {
            return false;
        }


        const [year, month, day] =
            transaction.date.split("-").map(Number);

        const transactionDate =
            new Date(year, month - 1, day);


        // DAILY
        if (expensePeriod === "daily") {

            return (
                transactionDate.getFullYear() === now.getFullYear() &&
                transactionDate.getMonth() === now.getMonth() &&
                transactionDate.getDate() === now.getDate()
            );

        }


        // WEEKLY
        if (expensePeriod === "weekly") {

            const startOfWeek =
                new Date(now);

            const dayOfWeek =
                now.getDay();

            startOfWeek.setDate(
                now.getDate() - dayOfWeek
            );

            startOfWeek.setHours(
                0, 0, 0, 0
            );


            const endOfWeek =
                new Date(startOfWeek);

            endOfWeek.setDate(
                startOfWeek.getDate() + 6
            );

            endOfWeek.setHours(
                23, 59, 59, 999
            );


            return (
                transactionDate >= startOfWeek &&
                transactionDate <= endOfWeek
            );

        }


        // MONTHLY
        if (expensePeriod === "monthly") {

            return (
                transactionDate.getFullYear() === now.getFullYear() &&
                transactionDate.getMonth() === now.getMonth()
            );

        }


        return false;

    });

}

function updateExpensePeriod() {

    const periodTransactions =
        getExpensePeriodTransactions();

    let total = 0;

    periodTransactions.forEach(transaction => {

        total += Math.abs(transaction.amount);

    });


    document.getElementById("totalExpenses").textContent =
        `₹${total.toLocaleString()}.00`;

}

function updateExpenseBreakdown(){

    const container =
        document.getElementById("expenseCategories");

    container.innerHTML = "";

    const categories = {};

    const periodTransactions =
        getExpensePeriodTransactions();


    periodTransactions.forEach(transaction => {

        if(transaction.type === "expense"){

            if(!categories[transaction.category]){
                categories[transaction.category] = 0;
            }

            categories[transaction.category] +=
                Math.abs(transaction.amount);

        }

    });


    Object.entries(categories).forEach(
        ([category, amount]) => {

            container.innerHTML += `

                <li class="expense-category">

                    <div class="category-info">
                        <span>${category}</span>
                    </div>

                    <strong>
                        ₹${amount.toLocaleString()}
                    </strong>

                </li>

            `;

        }
    );

}

function updateCharts() {

    const ctx =
        document.getElementById("overviewChart");

    if (!ctx) return;

    const period =
        document.getElementById("dashboardPeriod").value;

    const selectedDate =
        document.getElementById("datePickerInput").value;

    const now = selectedDate
        ? new Date(selectedDate + "T00:00:00")
        : new Date();


    // Destroy previous chart
    if (overviewChart) {
        overviewChart.destroy();
    }


    let labels = [];
    let incomeData = [];
    let expenseData = [];


    // =====================================
    // DAILY
    // =====================================

    if (period === "daily") {

        const dailyTransactions =
            getDashboardTransactions();

        let income = 0;
        let expense = 0;

        dailyTransactions.forEach(transaction => {

            if (transaction.type === "income") {
                income += transaction.amount;
            }

            if (transaction.type === "expense") {
                expense += Math.abs(transaction.amount);
            }

        });

        labels = ["Income", "Expense"];

        incomeData = [income, 0];

        expenseData = [0, expense];

    }


    // =====================================
    // WEEKLY
    // =====================================

    else if (period === "weekly") {

        labels = [
            "Sun",
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat"
        ];

        incomeData = Array(7).fill(0);
        expenseData = Array(7).fill(0);


        const startOfWeek =
            new Date(now);

        const dayOfWeek =
            now.getDay();

        startOfWeek.setDate(
            now.getDate() - dayOfWeek
        );

        startOfWeek.setHours(0, 0, 0, 0);


        const endOfWeek =
            new Date(startOfWeek);

        endOfWeek.setDate(
            startOfWeek.getDate() + 6
        );

        endOfWeek.setHours(23, 59, 59, 999);


        transactions.forEach(transaction => {

            const [year, month, day] =
                transaction.date.split("-").map(Number);

            const transactionDate =
                new Date(year, month - 1, day);


            if (
                transactionDate >= startOfWeek &&
                transactionDate <= endOfWeek
            ) {

                const dayIndex =
                    transactionDate.getDay();


                if (transaction.type === "income") {

                    incomeData[dayIndex] +=
                        transaction.amount;

                }

                if (transaction.type === "expense") {

                    expenseData[dayIndex] +=
                        Math.abs(transaction.amount);

                }

            }

        });

    }


    // =====================================
    // MONTHLY
    // =====================================

    else if (period === "monthly") {

        labels = [
            "Week 1",
            "Week 2",
            "Week 3",
            "Week 4",
            "Week 5"
        ];

        incomeData = Array(5).fill(0);
        expenseData = Array(5).fill(0);


        transactions.forEach(transaction => {

            const [year, month, day] =
                transaction.date.split("-").map(Number);

            const transactionDate =
                new Date(year, month - 1, day);


            if (
                transactionDate.getFullYear() ===
                    now.getFullYear() &&
                transactionDate.getMonth() ===
                    now.getMonth()
            ) {

                const weekIndex =
                    Math.min(
                        Math.floor(
                            (transactionDate.getDate() - 1) / 7
                        ),
                        4
                    );


                if (transaction.type === "income") {

                    incomeData[weekIndex] +=
                        transaction.amount;

                }

                if (transaction.type === "expense") {

                    expenseData[weekIndex] +=
                        Math.abs(transaction.amount);

                }

            }

        });

    }


    // =====================================
    // YEARLY
    // =====================================

    else if (period === "yearly") {

        labels = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec"
        ];

        incomeData = Array(12).fill(0);
        expenseData = Array(12).fill(0);


        transactions.forEach(transaction => {

            const [year, month, day] =
                transaction.date.split("-").map(Number);

            const transactionDate =
                new Date(year, month - 1, day);


            if (
                transactionDate.getFullYear() ===
                now.getFullYear()
            ) {

                const monthIndex =
                    transactionDate.getMonth();


                if (transaction.type === "income") {

                    incomeData[monthIndex] +=
                        transaction.amount;

                }

                if (transaction.type === "expense") {

                    expenseData[monthIndex] +=
                        Math.abs(transaction.amount);

                }

            }

        });

    }


    // =====================================
    // CREATE CHART
    // =====================================

    overviewChart = new Chart(ctx, {

        type: "bar",

        data: {

            labels: labels,

            datasets: [

                {
                    label: "Income",
                    data: incomeData,
                    backgroundColor: "#10b981",
                    borderRadius: 8
                },

                {
                    label: "Expense",
                    data: expenseData,
                    backgroundColor: "#ef4444",
                    borderRadius: 8
                }

            ]

        },


        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {
                    display: true,
                    position: "top"
                }

            },

            scales: {

                y: {
                    beginAtZero: true
                }

            }

        }

    });

}

function updateExpensePieChart(){

    const canvas = document.getElementById("expensePieChart");

    if(!canvas) return;

   const categories = {};

const periodTransactions =
    getExpensePeriodTransactions();

periodTransactions.forEach(transaction=>{

    if(transaction.type==="expense"){

        if(!categories[transaction.category]){
            categories[transaction.category]=0;
        }

        categories[transaction.category] +=
            Math.abs(transaction.amount);

    }

});

    const labels = Object.keys(categories);
    const values = Object.values(categories);

    if(expensePieChart){
        expensePieChart.destroy();
    }

    expensePieChart = new Chart(canvas,{

        type:"pie",

        data:{

            labels,

            datasets:[{

                data:values,

                backgroundColor:[
                    "#10b981",
                    "#3b82f6",
                    "#f59e0b",
                    "#ef4444",
                    "#8b5cf6",
                    "#06b6d4",
                    "#ec4899",
                    "#84cc16"
                ]

            }]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false,

            plugins:{

                legend:{
                    position:"bottom"
                }

            }

        }

    });

}

// Update dashboard values
function updateDashboard() {

    calculateAccountBalances();
renderAccounts();

  const totals = calculateTotals();

  const period =
    document.getElementById("dashboardPeriod").value;

const periodLabels = {

    daily: "Daily",

    weekly: "Weekly",

    monthly: "Monthly",

    yearly: "Yearly"

};

const periodLabel =
    periodLabels[period];

document.getElementById("incomeCardTitle").textContent =
    `${periodLabel} Income`;

document.getElementById("expenseCardTitle").textContent =
    `${periodLabel} Expenses`;

  document.getElementById("budgetAmount").textContent =
`₹${monthlyBudget.toLocaleString()}.00`;

  const transactionElement =
    document.getElementById("totalTransactions");

if (transactionElement) {

    transactionElement.textContent =
        totals.totalTransactions;

}

  document.querySelector(".income-amount").textContent =
    `₹${totals.income.toLocaleString()}.00`;
  document.querySelector(".expense-amount").textContent =
    `₹${totals.expense.toLocaleString()}.00`;

const balanceElement =
    document.getElementById("currentBalance");

balanceElement.textContent =
    `${totals.balance < 0 ? "-₹" : "₹"}${Math.abs(totals.balance).toLocaleString()}`;

balanceElement.style.color =
    totals.balance < 0
        ? "#ef4444"
        : "#10b981";

const balanceStatus = document.getElementById("balanceStatus");

if (totals.balance >= 0) {

    balanceStatus.innerHTML =
        `<i class="fas fa-check-circle"></i> You're within your budget`;

    balanceStatus.style.color = "#10b981";

} else {

    balanceStatus.innerHTML =
        `<i class="fas fa-exclamation-circle"></i> Expenses exceed income`;

    balanceStatus.style.color = "#ef4444";

}

const incomeCount =
    transactions.filter(t => t.type === "income").length;

const expenseCount =
    transactions.filter(t => t.type === "expense").length;

document.getElementById("transactionSummary").textContent =
    `${incomeCount} Income • ${expenseCount} Expense`;


  // Update spending limit progress

const usedAmount = totals.expense;

const remainingAmount = monthlyBudget - usedAmount;

document.getElementById("spendingUsed").textContent =
`Used ₹${totals.expense.toLocaleString()} of ₹${monthlyBudget.toLocaleString()}`;

const percentage =
monthlyBudget > 0
? (usedAmount / monthlyBudget) * 100
: 0;

document.querySelector(".spending-limit").textContent =
  `₹${remainingAmount.toLocaleString()}.00`;

document.querySelector(".progress-fill").style.width =
  `${Math.min(percentage, 100)}%`;

document.getElementById("totalExpenses").textContent =
`₹${totals.expense.toLocaleString()}.00`;

  updateExpenseBreakdown();

  updateCharts();

  updateExpensePieChart();
}

// Update transactions table
function updateTransactionsTable() {
  const tbody = document.querySelector(".transactions-table tbody");
  tbody.innerHTML = "";

let filteredTransactions = [...transactions];

if(searchTerm){

    filteredTransactions = filteredTransactions.filter(transaction=>{

        return (

            transaction.category.toLowerCase().includes(searchTerm)

            ||

            (transaction.description || "")
            .toLowerCase()
            .includes(searchTerm)

            ||

            Math.abs(transaction.amount)
            .toString()
            .includes(searchTerm)

        );

    });

}

if (currentFilter !== "all") {

    filteredTransactions = filteredTransactions.filter(transaction => {

        return transaction.type === currentFilter;

    });

}

if (selectedAccount !== "all") {

    filtered =
        filtered.filter(transaction =>
            transaction.account === selectedAccount
        );

}

switch (currentSort) {

    case "latest":
        filteredTransactions.sort(
            (a, b) => new Date(b.date) - new Date(a.date)
        );
        break;

    case "oldest":
        filteredTransactions.sort(
            (a, b) => new Date(a.date) - new Date(b.date)
        );
        break;

    case "highest":
        filteredTransactions.sort(
            (a, b) => Math.abs(b.amount) - Math.abs(a.amount)
        );
        break;

    case "lowest":
        filteredTransactions.sort(
            (a, b) => Math.abs(a.amount) - Math.abs(b.amount)
        );
        break;
}

const recentTransactions = filteredTransactions.slice(0,10);

if (recentTransactions.length === 0) {

    tbody.innerHTML = `
        <tr>
            <td colspan="6" style="text-align:center; padding:30px;">
                No transactions found.
            </td>
        </tr>
    `;

    return;
}

  recentTransactions.forEach((transaction) => {
    const row = document.createElement("tr");
    const formattedDate = new Date(transaction.date).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      },
    );

    const amountDisplay =
      transaction.amount > 0
        ? `+${transaction.amount.toLocaleString()}.00`
        : `-${Math.abs(transaction.amount).toLocaleString()}.00`;

    row.innerHTML = `
                    <td>${formattedDate}</td>
                    <td>${transaction.category}</td>
                    <td>
    ${getAccountName(transaction.account)}
</td>
                    <td style="color: ${transaction.amount > 0 ? "#10b981" : "#ef4444"
      }">${amountDisplay}</td>
                    <td><span class="status-success">${transaction.status
      }</span></td>
                    <td>
    <button class="edit-btn"
        onclick="editTransaction(${transaction.id})">
        <i class="fas fa-pen"></i>
    </button>

    <button class="delete-btn"
        onclick="deleteTransaction(${transaction.id})">
        <i class="fas fa-trash"></i>
    </button>
</td>
                `;

    tbody.appendChild(row);
  });
}

function deleteTransaction(id) {

  const confirmDelete = confirm("Are you sure you want to delete this transaction?");

  if (!confirmDelete) return;

  const transaction = transactions.find(t => t.id === id);

  if (!transaction) return;

  transactions = transactions.filter(t => t.id !== id);

  updateDashboard();
  updateTransactionsTable();
  saveData();

  showNotification("Transaction deleted successfully!");
}

function editTransaction(id){

    const transaction = transactions.find(t=>t.id===id);

    if(!transaction) return;

    editingTransactionId=id;

    if(transaction.type==="income"){

        document.getElementById("incomeAmount").value=transaction.amount;

        document.getElementById("incomeCategory").value=
            transaction.category.toLowerCase();

        document.getElementById("incomeDescription").value=
            transaction.description || "";

        document.getElementById("incomeDate").value=
            transaction.date;

        openIncomeModal();

    }else{

        document.getElementById("expenseAmount").value=
            Math.abs(transaction.amount);

        document.getElementById("expenseCategory").value=
            transaction.category.toLowerCase();

        document.getElementById("expenseDescription").value=
            transaction.description || "";

        document.getElementById("expenseDate").value=
            transaction.date;

        openExpenseModal();

    }

}


// Show notification
function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.style.cssText = `
                position: fixed;
                top: 2rem;
                right: 2rem;
                background: ${type === "success" ? "#10b981" : "#ef4444"};
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 1001;
                animation: slideInRight 0.3s ease;
            `;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.3s ease";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Add CSS for notification animations
const style = document.createElement("style");
style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
document.head.appendChild(style);

    function updateGreeting() {

    const hour = new Date().getHours();

    let greeting;

    if (hour < 12) {

        greeting = "Good Morning";

    } else if (hour < 18) {

        greeting = "Good Afternoon";

    } else {

        greeting = "Good Evening";

    }

    document.getElementById("greeting").textContent =
        `${greeting}, Sanskrati!`;

}

function updateCurrentDate() {

    const dateInput =
        document.getElementById("datePickerInput");

    const date =
        dateInput.value
            ? new Date(dateInput.value + "T00:00:00")
            : new Date();

    const formattedDate =
        date.toLocaleDateString("en-IN", {

            day: "numeric",

            month: "long",

            year: "numeric"

        });

    document
        .querySelector("#currentDate span")
        .textContent = formattedDate;

}

document
    .getElementById("currentDate")
    .addEventListener("click", function () {

        const dateInput =
            document.getElementById("datePickerInput");

        dateInput.showPicker();

    });

document
    .getElementById("datePickerInput")
    .addEventListener("change", function () {

        updateCurrentDate();

        updateDashboard();

        showNotification(
            "Dashboard date updated!"
        );

    });

function exportTransactions() {

    if (transactions.length === 0) {

        showNotification(
            "No transactions to export.",
            "error"
        );

        return;

    }


    const headers = [
        "Date",
        "Type",
        "Category",
        "Description",
        "Amount",
        "Status"
    ];


    const rows = transactions.map(transaction => {

        return [

            transaction.date,

            transaction.type,

            transaction.category,

            transaction.description || "",

            Math.abs(transaction.amount).toFixed(2),

            transaction.status

        ];

    });


    const csvRows = [
        headers,
        ...rows
    ];


    const csvContent =
        csvRows
            .map(row => {

                return row.map(value => {

                    const text =
                        String(value)
                        .replace(/"/g, '""');

                    return `"${text}"`;

                }).join(",");

            })
            .join("\n");


    const blob = new Blob(
        ["\uFEFF" + csvContent],
        {
            type: "text/csv;charset=utf-8;"
        }
    );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        "personal-finance-transactions.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);


    showNotification(
        "Transactions exported successfully!"
    );

}

document
    .getElementById("exportBtn")
    .addEventListener("click", exportTransactions);



    function getAccountName(accountId) {

    const account =
        accounts.find(
            account => account.id === accountId
        );

    return account
        ? account.name
        : "Unknown";

}

function calculateAccountBalances() {

    accounts.forEach(account => {

        account.balance = 0;

    });


    transactions.forEach(transaction => {

        if (!transaction.account) {
            return;
        }


        const account =
            accounts.find(
                acc => acc.id === transaction.account
            );


        if (!account) {
            return;
        }


        account.balance +=
            transaction.amount;

    });

}

function populateAccountFilter() {

    const select =
        document.getElementById("accountFilter");

    if (!select) return;

    select.innerHTML = `
        <option value="all">
            All Accounts
        </option>
    `;

    accounts.forEach(account => {

        const option =
            document.createElement("option");

        option.value = account.id;

        option.textContent =
            account.name;

        select.appendChild(option);

    });

}

document
    .getElementById("accountFilter")
    .addEventListener("change", function () {

        selectedAccount =
            this.value;

        updateTransactionsTable();

        updateDashboard();

    });

document
    .getElementById("overviewFilterBtn")
    .addEventListener("click", function () {

        document
            .getElementById("overviewFilterModal")
            .style.display = "block";

        document.body.style.overflow = "hidden";

    });

document
    .getElementById("applyOverviewFilter")
    .addEventListener("click", function () {

        overviewFromDate =
            document.getElementById("overviewFromDate").value;

        overviewToDate =
            document.getElementById("overviewToDate").value;


        if (
            overviewFromDate &&
            overviewToDate &&
            overviewFromDate > overviewToDate
        ) {

            showNotification(
                "From date cannot be after To date.",
                "error"
            );

            return;

        }


        closeModal("overviewFilterModal");

        updateDashboard();

        showNotification(
            "Overview filter applied!"
        );

    });

    document
    .getElementById("clearOverviewFilter")
    .addEventListener("click", function () {

        overviewFromDate = "";
        overviewToDate = "";

        document.getElementById(
            "overviewFromDate"
        ).value = "";

        document.getElementById(
            "overviewToDate"
        ).value = "";

        closeModal("overviewFilterModal");

        updateDashboard();

        showNotification(
            "Overview filter cleared!"
        );

    });



    document
    .querySelectorAll(".period-tab")
    .forEach(tab => {

        tab.addEventListener("click", function () {

            document
                .querySelectorAll(".period-tab")
                .forEach(item => {
                    item.classList.remove("active");
                });


            this.classList.add("active");


            expensePeriod =
                this.dataset.expensePeriod;


            updateExpensePeriod();

        });

    });

    document.querySelectorAll(".card-menu").forEach(button => {
    button.addEventListener("click", function () {
        showNotification("More options coming soon!");
    });
});

// Keyboard shortcuts
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeModal("incomeModal");
    closeModal("expenseModal");
    closeModal("budgetModal");
    closeModal("transferModal");
  }

  if (e.ctrlKey && e.key === "i") {
    e.preventDefault();
    openIncomeModal();
  }

  if (e.ctrlKey && e.key === "e") {
    e.preventDefault();
    openExpenseModal();
  }
});

// Add hover effects to cards
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("mouseenter", function () {
    this.style.transform = "translateY(-2px)";
    this.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
    this.style.transition = "all 0.2s ease";
  });

  card.addEventListener("mouseleave", function () {
    this.style.transform = "translateY(0)";
    this.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
  });
});




function handlePeriodChange(source) {

    const headerPeriod =
        document.getElementById("headerDashboardPeriod");

    const overviewPeriod =
        document.getElementById("dashboardPeriod");

    const selectedPeriod = source.value;

    // Keep both dropdowns synchronized
    if (headerPeriod && source !== headerPeriod) {
        headerPeriod.value = selectedPeriod;
    }

    if (overviewPeriod && source !== overviewPeriod) {
        overviewPeriod.value = selectedPeriod;
    }

    // Update everything
    updateDashboard();

    showNotification("Dashboard period updated!");
}


// Header dropdown
document
    .getElementById("headerDashboardPeriod")
    .addEventListener("change", function () {
        handlePeriodChange(this);
    });


// Overview dropdown
document
    .getElementById("dashboardPeriod")
    .addEventListener("change", function () {
        handlePeriodChange(this);
    });

    // Initialize the dashboard on load
document.addEventListener("DOMContentLoaded", function () {
    loadData();

    populateAccountDropdowns();
    populateAccountFilter();

    calculateAccountBalances();

    renderAccounts();

    updateDashboard();
    updateTransactionsTable();
    updateGreeting();
    updateCurrentDate();
    updateExpensePeriod();
    
});