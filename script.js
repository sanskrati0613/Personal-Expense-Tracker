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

let searchTerm = "";
let currentFilter = "all";
let currentSort = "latest";
let overviewChart = null;
let expensePieChart = null;

let monthlyBudget = 15000;

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

}

// Set today's date as default
const today = new Date().toISOString().split("T")[0];
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

function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none";
  document.body.style.overflow = "auto";

  // Reset forms
  if (modalId === "incomeModal") {
    document.getElementById("incomeForm").reset();
    document.getElementById("incomeDate").value = today;
  } else {
    document.getElementById("expenseForm").reset();
    document.getElementById("expenseDate").value = today;
  }
}

// Close modal when clicking outside
window.onclick = function (event) {
  const incomeModal = document.getElementById("incomeModal");
  const expenseModal = document.getElementById("expenseModal");

  if (event.target === incomeModal) {
    closeModal("incomeModal");
  }
  if (event.target === expenseModal) {
    closeModal("expenseModal");
  }
};

// Add income function
function addIncome() {
  const amount = parseFloat(document.getElementById("incomeAmount").value);
  const category = document.getElementById("incomeCategory").value;
  const description = document.getElementById("incomeDescription").value;
  const date = document.getElementById("incomeDate").value;

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

  if (!amount || !category || !date) {
    alert("Please fill in all required fields");
    return;
  }

  // Add to transactions
  const newTransaction = {
    id: Date.now(),
    date: date,
    category: category.charAt(0).toUpperCase() + category.slice(1),
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

  if (!amount || !category || !date) {
    alert("Please fill in all required fields");
    return;
  }

  // Add to transactions
  const newTransaction = {
    id: Date.now(),
    date: date,
    category: category.charAt(0).toUpperCase() + category.slice(1),
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

function calculateTotals() {

    let income = 0;
    let expense = 0;

    transactions.forEach(transaction => {

        if(transaction.type === "income"){

            income += transaction.amount;

        }else{

            expense += Math.abs(transaction.amount);

        }

    });

    return {

        income,
        expense,
        balance: income - expense,
        totalTransactions: transactions.length

    };

}

function updateExpenseBreakdown(){

    const container =
        document.getElementById("expenseCategories");

    container.innerHTML = "";

    const categories = {};

    transactions.forEach(transaction=>{

        if(transaction.type==="expense"){

            if(!categories[transaction.category]){

                categories[transaction.category]=0;

            }

            categories[transaction.category]+=Math.abs(transaction.amount);

        }

    });

    Object.entries(categories).forEach(([category,amount])=>{

        container.innerHTML += `
<li class="expense-category">

    <div class="category-info">

        <span>${category}</span>

    </div>

    <strong>₹${amount.toLocaleString()}</strong>

</li>
`;

    });

}

function updateCharts(){

    const ctx =
        document.getElementById("overviewChart");

    if(!ctx) return;

    const totals = calculateTotals();

    if(overviewChart){

        overviewChart.destroy();

    }

    overviewChart = new Chart(ctx,{

        type:"bar",

        data:{

            labels:["Income","Expense"],

            datasets:[{

                label:"Amount",

                data:[
                    totals.income,
                    totals.expense
                ],

                backgroundColor:[
                    "#10b981",
                    "#ef4444"
                ],

                borderRadius:8

            }]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false,

            plugins:{

                legend:{
                    display:false
                }

            }

        }

    });

}

function updateExpensePieChart(){

    const canvas = document.getElementById("expensePieChart");

    if(!canvas) return;

    const categories = {};

    transactions.forEach(transaction=>{

        if(transaction.type==="expense"){

            if(!categories[transaction.category]){
                categories[transaction.category]=0;
            }

            categories[transaction.category]+=Math.abs(transaction.amount);

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

  const totals = calculateTotals();

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
            <td colspan="5" style="text-align:center; padding:30px;">
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

// Keyboard shortcuts
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeModal("incomeModal");
    closeModal("expenseModal");
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

// Initialize the dashboard on load
document.addEventListener("DOMContentLoaded", function () {
  loadData();
  updateDashboard();
  updateTransactionsTable();
});
