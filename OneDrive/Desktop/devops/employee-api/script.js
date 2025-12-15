// API Base URL
const API_URL = 'http://localhost:8080/api/employees';

// Store all employees for filtering
let allEmployees = [];

// Load employees on page load
document.addEventListener('DOMContentLoaded', () => {
    loadEmployees();
});

// Form submission
document.getElementById('addEmployeeForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const isEditMode = document.getElementById('isEditMode').value === 'true';
    const employeeId = document.getElementById('employeeId').value;

    const employee = {
        id: employeeId,
        name: document.getElementById('employeeName').value,
        role: document.getElementById('employeeRole').value,
        email: document.getElementById('employeeEmail').value,
        department: document.getElementById('employeeDepartment').value
    };

    try {
        let response;
        if (isEditMode) {
            // UPDATE existing employee
            response = await fetch(`${API_URL}/${employeeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(employee)
            });

            if (response.ok) {
                showToast('Employee updated successfully! ✅', 'success');
                resetForm();
                loadEmployees();
            } else {
                showToast('Failed to update employee ❌', 'error');
            }
        } else {
            // ADD new employee
            response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(employee)
            });

            if (response.ok) {
                showToast('Employee added successfully! 🎉', 'success');
                document.getElementById('addEmployeeForm').reset();
                loadEmployees();
            } else if (response.status === 409) {
                showToast('Employee ID already exists! ⚠️', 'error');
            } else {
                showToast('Failed to add employee ❌', 'error');
            }
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Network error! Please check if the server is running. 🔌', '');
    }
});

// Load all employees
async function loadEmployees() {
    try {
        const response = await fetch(API_URL);
        allEmployees = await response.json();

        filterEmployees(); // Apply any active filters
        updateStats(allEmployees.length);
    } catch (error) {
        console.error('Error loading employees:', error);
        showToast('Failed to load employees ❌', 'error');
    }
}

// Filter employees based on search and department
function filterEmployees() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const departmentFilter = document.getElementById('departmentFilter').value;

    let filtered = allEmployees;

    // Apply search filter
    if (searchTerm) {
        filtered = filtered.filter(emp =>
            emp.name.toLowerCase().includes(searchTerm) ||
            emp.role.toLowerCase().includes(searchTerm) ||
            emp.email.toLowerCase().includes(searchTerm) ||
            (emp.department && emp.department.toLowerCase().includes(searchTerm))
        );
    }

    // Apply department filter
    if (departmentFilter) {
        filtered = filtered.filter(emp => emp.department === departmentFilter);
    }

    displayEmployees(filtered);
}

// Clear all filters
function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('departmentFilter').value = '';
    filterEmployees();
    showToast('Filters cleared! 🔄', 'success');
}

// Display employees
function displayEmployees(employees) {
    const employeesList = document.getElementById('employeesList');
    const emptyState = document.getElementById('emptyState');

    if (employees.length === 0) {
        employeesList.style.display = 'none';
        emptyState.classList.add('show');
    } else {
        employeesList.style.display = 'grid';
        emptyState.classList.remove('show');

        employeesList.innerHTML = employees.map((emp, index) => {
            const departmentColor = getDepartmentColor(emp.department);
            return `
            <div class="employee-card" style="animation-delay: ${index * 0.1}s">
                <div class="employee-header">
                    <div class="employee-avatar" style="background: ${departmentColor}">
                        ${getInitials(emp.name)}
                    </div>
                    <div class="employee-info">
                        <h3>${emp.name}</h3>
                        <div class="employee-role">${emp.role}</div>
                    </div>
                </div>
                <div class="employee-details">
                    <div class="detail-row">
                        <span class="detail-icon">🆔</span>
                        <span>${emp.id}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-icon">📧</span>
                        <span>${emp.email}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-icon">🏢</span>
                        <span class="department-badge" style="background: ${departmentColor}">
                            ${emp.department || 'N/A'}
                        </span>
                    </div>
                </div>
                <div class="employee-actions">
                    <button class="btn-edit" onclick="editEmployee('${emp.id}')">
                        ✏️ Edit
                    </button>
                    <button class="btn-delete" onclick="deleteEmployee('${emp.id}')">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `}).join('');
    }
}

// Edit employee - populate form with data
function editEmployee(id) {
    const employee = allEmployees.find(emp => emp.id === id);
    if (!employee) return;

    // Set form to edit mode
    document.getElementById('isEditMode').value = 'true';
    document.getElementById('editEmployeeId').value = id;

    // Update form title
    document.getElementById('formTitleText').textContent = 'Update Employee';
    document.querySelector('#formTitle .icon').textContent = '✏️';

    // Populate form fields
    document.getElementById('employeeId').value = employee.id;
    document.getElementById('employeeId').disabled = true; // Can't change ID
    document.getElementById('employeeName').value = employee.name;
    document.getElementById('employeeRole').value = employee.role;
    document.getElementById('employeeDepartment').value = employee.department || '';
    document.getElementById('employeeEmail').value = employee.email;

    // Update button text
    document.getElementById('submitBtnText').textContent = 'Update Employee';
    document.getElementById('cancelBtn').style.display = 'inline-flex';

    // Scroll to form
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });

    showToast('Editing employee... ✏️', 'success');
}

// Cancel edit mode
function cancelEdit() {
    resetForm();
    showToast('Edit cancelled 🔄', 'success');
}

// Reset form to add mode
function resetForm() {
    document.getElementById('isEditMode').value = 'false';
    document.getElementById('editEmployeeId').value = '';
    document.getElementById('addEmployeeForm').reset();
    document.getElementById('employeeId').disabled = false;

    // Reset form title
    document.getElementById('formTitleText').textContent = 'Add New Employee';
    document.querySelector('#formTitle .icon').textContent = '➕';

    // Reset button text
    document.getElementById('submitBtnText').textContent = 'Add Employee';
    document.getElementById('cancelBtn').style.display = 'none';
}

// Delete employee
async function deleteEmployee(id) {
    if (!confirm('Are you sure you want to delete this employee?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showToast('Employee deleted successfully! ✅', 'success');
            loadEmployees();
        } else {
            showToast('Failed to delete employee ❌', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Network error! ❌', 'error');
    }
}

// Get initials from name
function getInitials(name) {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

// Get department color
function getDepartmentColor(department) {
    const colors = {
        'Engineering': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'Marketing': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'Sales': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'HR': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'Finance': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'Operations': 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
    };
    return colors[department] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
}

// Update statistics
function updateStats(count) {
    document.getElementById('totalEmployees').textContent = count;
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
