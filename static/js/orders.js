let orders = [];
let sortField = 'customer';
let sortAsc = true;

const addOrderModal = new bootstrap.Modal(document.getElementById('addOrderModal'));
const toast = new bootstrap.Toast(document.getElementById('toast'));

async function loadOrders() {
    try {
        const response = await fetch('/api/orders');
        orders = await response.json();
        displayOrders();
    } catch (error) {
        showToast('Error loading orders', 'danger');
    }
}

function displayOrders() {
    const tbody = document.getElementById('orderTableBody');
    tbody.innerHTML = '';

    const sortedOrders = [...orders].sort((a, b) => {
        let comparison = 0;
        if (sortField === 'amount') {
            comparison = a.amount - b.amount;
        } else {
            comparison = a.customer.localeCompare(b.customer);
        }
        return sortAsc ? comparison : -comparison;
    });

    sortedOrders.forEach(order => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = order.customer;
        row.insertCell(1).textContent = order.amount.toFixed(2);
    });
}

function sortTable(field) {
    if (sortField === field) {
        sortAsc = !sortAsc;
    } else {
        sortField = field;
        sortAsc = true;
    }
    displayOrders();
}

function showAddOrderModal() {
    document.getElementById('addOrderForm').reset();
    addOrderModal.show();
}

async function addOrder() {
    const customer = document.getElementById('customer').value;
    const amount = document.getElementById('amount').value;

    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ customer, amount }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error);
        }

        const newOrder = await response.json();
        orders.push(newOrder);
        displayOrders();
        addOrderModal.hide();
        showToast('Order added successfully', 'success');
    } catch (error) {
        showToast(error.message, 'danger');
    }
}

async function handleCsvUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/api/import-csv', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error);
        }

        const result = await response.json();
        showToast(result.message, 'success');
        loadOrders();
    } catch (error) {
        showToast(error.message, 'danger');
    }

    event.target.value = '';
}

function showToast(message, type = 'info') {
    const toastEl = document.getElementById('toast');
    toastEl.className = `toast bg-${type} text-white`;
    document.getElementById('toastMessage').textContent = message;
    toast.show();
}

// Load orders when page loads
document.addEventListener('DOMContentLoaded', loadOrders);
