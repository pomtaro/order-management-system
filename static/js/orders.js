let orders = [];
let sortField = 'customer';
let sortAsc = true;
let searchQuery = '';

const addOrderModal = new bootstrap.Modal(document.getElementById('addOrderModal'));
const editOrderModal = new bootstrap.Modal(document.getElementById('editOrderModal'));
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

    let filteredOrders = orders;
    if (searchQuery) {
        filteredOrders = orders.filter(order => 
            order.customer.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    const sortedOrders = [...filteredOrders].sort((a, b) => {
        let comparison = 0;
        if (sortField === 'amount') {
            comparison = a.amount - b.amount;
        } else {
            comparison = a.customer.localeCompare(b.customer);
        }
        return sortAsc ? comparison : -comparison;
    });

    if (sortedOrders.length === 0) {
        const row = tbody.insertRow();
        const cell = row.insertCell(0);
        cell.colSpan = 3;
        cell.className = 'text-center text-muted';
        cell.textContent = 'No orders found';
        return;
    }

    sortedOrders.forEach(order => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = order.customer;
        row.insertCell(1).textContent = order.amount.toFixed(2);
        
        const actionsCell = row.insertCell(2);
        const editButton = document.createElement('button');
        editButton.className = 'btn btn-sm btn-outline-secondary';
        editButton.innerHTML = '<i class="bi bi-pencil"></i>';
        editButton.onclick = () => showEditOrderModal(order);
        actionsCell.appendChild(editButton);
    });
}

function searchCustomers() {
    searchQuery = document.getElementById('customerSearch').value;
    displayOrders();
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

function showEditOrderModal(order) {
    document.getElementById('editOrderId').value = order.id;
    document.getElementById('editCustomer').value = order.customer;
    document.getElementById('editAmount').value = order.amount;
    editOrderModal.show();
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

async function updateOrder() {
    const id = document.getElementById('editOrderId').value;
    const customer = document.getElementById('editCustomer').value;
    const amount = document.getElementById('editAmount').value;

    try {
        const response = await fetch(`/api/orders/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ customer, amount }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error);
        }

        const updatedOrder = await response.json();
        const index = orders.findIndex(o => o.id === updatedOrder.id);
        if (index !== -1) {
            orders[index] = updatedOrder;
        }
        displayOrders();
        editOrderModal.hide();
        showToast('Order updated successfully', 'success');
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
