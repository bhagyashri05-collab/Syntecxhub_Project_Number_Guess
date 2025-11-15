// State management
let isEditMode = false;
let editingStudentId = null;
let allStudents = [];
let filteredStudents = [];

// DOM Elements
const studentForm = document.getElementById('student-form');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const studentIdInput = document.getElementById('student-id');
const studentNameInput = document.getElementById('student-name');
const studentGradeInput = document.getElementById('student-grade');
const studentsTbody = document.getElementById('students-tbody');
const studentCount = document.getElementById('student-count');
const countText = document.getElementById('count-text');
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search');
const loadingSpinner = document.getElementById('loading-spinner');
const toastContainer = document.getElementById('toast-container');
const totalStudentsEl = document.getElementById('total-students');
const statsGradeEl = document.getElementById('stats-grade');
const statsAverageEl = document.getElementById('stats-average');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadStudents();
    
    studentForm.addEventListener('submit', handleFormSubmit);
    cancelBtn.addEventListener('click', cancelEdit);
    searchInput.addEventListener('input', handleSearch);
    clearSearchBtn.addEventListener('click', clearSearch);
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            handleFilter(e.target.dataset.filter);
        });
    });
});

// Load all students
async function loadStudents() {
    try {
        showLoading(true);
        const response = await fetch('/api/students');
        const data = await response.json();
        
        if (data.success) {
            allStudents = data.students;
            filteredStudents = [...allStudents];
            displayStudents(filteredStudents);
            updateStudentCount(data.count);
            updateStats(allStudents);
            showLoading(false);
        } else {
            showToast('Failed to load students', 'error');
            showLoading(false);
        }
    } catch (error) {
        showToast('Error loading students: ' + error.message, 'error');
        showLoading(false);
    }
}

// Display students in table
function displayStudents(students) {
    if (students.length === 0) {
        studentsTbody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    <i class="fas fa-inbox empty-icon"></i>
                    <div>No students found. ${searchInput.value ? 'Try a different search.' : 'Add your first student above!'}</div>
                </td>
            </tr>
        `;
        return;
    }
    
    studentsTbody.innerHTML = students.map((student, index) => {
        const gradeBadge = getGradeBadge(student.grade);
        return `
            <tr style="animation: fadeInUp 0.3s ease ${index * 0.05}s both">
                <td><strong class="student-id">${escapeHtml(student.id)}</strong></td>
                <td><span class="student-name">${escapeHtml(student.name)}</span></td>
                <td>${gradeBadge}</td>
                <td>
                    <div class="actions">
                        <button class="btn btn-edit" onclick="editStudent('${escapeHtml(student.id)}')" title="Edit Student">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-delete" onclick="deleteStudent('${escapeHtml(student.id)}')" title="Delete Student">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Get grade badge HTML
function getGradeBadge(grade) {
    const gradeUpper = grade.toUpperCase().trim();
    let badgeClass = 'grade-C';
    
    if (gradeUpper.startsWith('A')) {
        badgeClass = 'grade-A';
    } else if (gradeUpper.startsWith('B')) {
        badgeClass = 'grade-B';
    } else if (gradeUpper.startsWith('C')) {
        badgeClass = 'grade-C';
    }
    
    return `<span class="grade-badge ${badgeClass}">${escapeHtml(grade)}</span>`;
}

// Update student count
function updateStudentCount(count) {
    countText.textContent = `${count} student${count !== 1 ? 's' : ''}`;
    totalStudentsEl.textContent = count;
    
    // Animate count update
    totalStudentsEl.style.transform = 'scale(1.2)';
    setTimeout(() => {
        totalStudentsEl.style.transform = 'scale(1)';
    }, 300);
}

// Update statistics
function updateStats(students) {
    if (students.length === 0) {
        statsGradeEl.textContent = '-';
        statsAverageEl.textContent = '-';
        return;
    }
    
    // Find top grade
    const grades = students.map(s => s.grade.toUpperCase().trim());
    const gradeOrder = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'];
    
    let topGrade = grades[0];
    for (const grade of grades) {
        const currentIndex = gradeOrder.findIndex(g => grade.startsWith(g[0]));
        const topIndex = gradeOrder.findIndex(g => topGrade.startsWith(g[0]));
        if (currentIndex !== -1 && (topIndex === -1 || currentIndex < topIndex)) {
            topGrade = grade;
        }
    }
    
    statsGradeEl.textContent = students.find(s => s.grade.toUpperCase().trim() === topGrade)?.grade || '-';
    
    // Calculate average if grades are numeric
    const numericGrades = students
        .map(s => parseFloat(s.grade))
        .filter(g => !isNaN(g));
    
    if (numericGrades.length > 0) {
        const average = numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length;
        statsAverageEl.textContent = average.toFixed(1);
    } else {
        statsAverageEl.textContent = '-';
    }
}

// Handle search
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    if (searchTerm) {
        clearSearchBtn.style.display = 'flex';
        filteredStudents = allStudents.filter(student => 
            student.id.toLowerCase().includes(searchTerm) ||
            student.name.toLowerCase().includes(searchTerm) ||
            student.grade.toLowerCase().includes(searchTerm)
        );
    } else {
        clearSearchBtn.style.display = 'none';
        filteredStudents = [...allStudents];
    }
    
    displayStudents(filteredStudents);
    updateStudentCount(filteredStudents.length);
}

// Clear search
function clearSearch() {
    searchInput.value = '';
    clearSearchBtn.style.display = 'none';
    filteredStudents = [...allStudents];
    displayStudents(filteredStudents);
    updateStudentCount(filteredStudents.length);
}

// Handle filter
function handleFilter(filterType) {
    if (filterType === 'all') {
        filteredStudents = [...allStudents];
    } else if (filterType === 'grade') {
        filteredStudents = [...allStudents].sort((a, b) => {
            const gradeOrder = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'];
            const aGrade = a.grade.toUpperCase().trim();
            const bGrade = b.grade.toUpperCase().trim();
            const aIndex = gradeOrder.findIndex(g => aGrade.startsWith(g[0]));
            const bIndex = gradeOrder.findIndex(g => bGrade.startsWith(g[0]));
            return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
        });
    }
    
    // Apply search if active
    if (searchInput.value.trim()) {
        const searchTerm = searchInput.value.toLowerCase().trim();
        filteredStudents = filteredStudents.filter(student => 
            student.id.toLowerCase().includes(searchTerm) ||
            student.name.toLowerCase().includes(searchTerm) ||
            student.grade.toLowerCase().includes(searchTerm)
        );
    }
    
    displayStudents(filteredStudents);
    updateStudentCount(filteredStudents.length);
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const studentData = {
        id: studentIdInput.value.trim(),
        name: studentNameInput.value.trim(),
        grade: studentGradeInput.value.trim()
    };
    
    // Show loading on button
    const originalBtnText = submitBtn.querySelector('.btn-text').textContent;
    submitBtn.disabled = true;
    submitBtn.querySelector('.btn-text').textContent = isEditMode ? 'Updating...' : 'Adding...';
    
    try {
        if (isEditMode) {
            await updateStudent(studentData);
        } else {
            await addStudent(studentData);
        }
    } finally {
        submitBtn.disabled = false;
        submitBtn.querySelector('.btn-text').textContent = originalBtnText;
    }
}

// Add new student
async function addStudent(studentData) {
    try {
        const response = await fetch('/api/students', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(studentData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(data.message, 'success');
            studentForm.reset();
            await loadStudents();
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        showToast('Error adding student: ' + error.message, 'error');
    }
}

// Edit student
function editStudent(studentId) {
    isEditMode = true;
    editingStudentId = studentId;
    
    // Fetch student data
    fetch(`/api/students/${studentId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                studentIdInput.value = data.student.id;
                studentNameInput.value = data.student.name;
                studentGradeInput.value = data.student.grade;
                
                // Disable ID input in edit mode
                studentIdInput.disabled = true;
                
                // Update UI
                formTitle.innerHTML = '<i class="fas fa-user-edit"></i> Edit Student';
                submitBtn.innerHTML = '<i class="fas fa-save"></i> <span class="btn-text">Update Student</span>';
                cancelBtn.style.display = 'block';
                
                // Scroll to form with smooth animation
                document.querySelector('.form-section').scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Highlight form section
                document.querySelector('.form-section').style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.2)';
                setTimeout(() => {
                    document.querySelector('.form-section').style.boxShadow = '';
                }, 2000);
            } else {
                showToast(data.message, 'error');
            }
        })
        .catch(error => {
            showToast('Error loading student: ' + error.message, 'error');
        });
}

// Update student
async function updateStudent(studentData) {
    try {
        const response = await fetch(`/api/students/${editingStudentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: studentData.name,
                grade: studentData.grade
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(data.message, 'success');
            cancelEdit();
            await loadStudents();
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        showToast('Error updating student: ' + error.message, 'error');
    }
}

// Cancel edit mode
function cancelEdit() {
    isEditMode = false;
    editingStudentId = null;
    studentForm.reset();
    studentIdInput.disabled = false;
    
    formTitle.innerHTML = '<i class="fas fa-user-plus"></i> Add New Student';
    submitBtn.innerHTML = '<i class="fas fa-plus"></i> <span class="btn-text">Add Student</span>';
    cancelBtn.style.display = 'none';
}

// Delete student
async function deleteStudent(studentId) {
    const student = allStudents.find(s => s.id === studentId);
    const studentName = student ? student.name : studentId;
    
    if (!confirm(`Are you sure you want to delete "${studentName}" (ID: ${studentId})?\n\nThis action cannot be undone.`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/students/${studentId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(data.message, 'success');
            await loadStudents();
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        showToast('Error deleting student: ' + error.message, 'error');
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' 
        ? '<i class="fas fa-check-circle"></i>'
        : '<i class="fas fa-exclamation-circle"></i>';
    
    toast.innerHTML = `
        ${icon}
        <div class="toast-content">${escapeHtml(message)}</div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Remove toast after animation
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 5000);
}

// Show loading spinner
function showLoading(show) {
    if (show) {
        loadingSpinner.style.display = 'block';
        studentsTbody.style.opacity = '0.3';
    } else {
        loadingSpinner.style.display = 'none';
        studentsTbody.style.opacity = '1';
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
