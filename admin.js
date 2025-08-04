import { db, auth } from './firebase-config.js';
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc, query, where
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { log } from './logger.js';

let editTeacherModal;

// --- Helper function for rendering skeleton loaders ---
function renderSkeleton(rows, cols, target) {
    let skeletonHTML = '';
    for (let i = 0; i < rows; i++) {
        skeletonHTML += '<tr>';
        for (let j = 0; j < cols; j++) {
            skeletonHTML += '<td><div class="skeleton skeleton-text"></div></td>';
        }
        skeletonHTML += '</tr>';
    }
    target.innerHTML = skeletonHTML;
}

// --- Teacher Management ---
window.addTeacher = async function () {
    const name = document.getElementById("name").value;
    const department = document.getElementById("department").value;
    const subject = document.getElementById("subject").value;
    const email = document.getElementById("email").value;

    if (!name || !department || !subject || !email) {
        return log('WARN', 'Add teacher form validation failed: All fields required.');
    }

    try {
        const docRef = await addDoc(collection(db, "teachers"), { name, department, subject, email });
        log('INFO', 'Teacher added successfully', { teacherId: docRef.id });
        document.getElementById("name").value = '';
        document.getElementById("department").value = '';
        document.getElementById("subject").value = '';
        document.getElementById("email").value = '';
        loadTeachers();
    } catch (err) {
        log('ERROR', 'Error adding teacher', { error: err.message });
    }
};

async function loadTeachers() {
    const tbody = document.getElementById('teacherList');
    renderSkeleton(3, 4, tbody); // Show skeleton loader

    const snapshot = await getDocs(collection(db, "teachers"));
    tbody.innerHTML = ''; // Clear skeleton

    if (snapshot.empty) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No teachers found.</td></tr>';
        return;
    }

    let delay = 0;
    snapshot.forEach(docSnap => {
        const data = docSnap.data();
        const tr = document.createElement('tr');
        tr.className = 'fade-in-item';
        tr.style.animationDelay = `${delay}s`;
        tr.innerHTML = `
            <td>${data.name}</td>
            <td>${data.email}</td>
            <td>${data.subject}</td>
            <td>
                <button onclick="openEditModal('${docSnap.id}')" class="btn btn-warning btn-sm" title="Edit Teacher"><i class="bi bi-pencil-square"></i></button>
                <button onclick="deleteTeacher('${docSnap.id}')" class="btn btn-danger btn-sm" title="Delete Teacher"><i class="bi bi-trash-fill"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
        delay += 0.05;
    });
}

window.openEditModal = async (docId) => {
    const docRef = doc(db, 'teachers', docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        document.getElementById('editTeacherId').value = docId;
        document.getElementById('editName').value = data.name;
        document.getElementById('editDepartment').value = data.department;
        document.getElementById('editSubject').value = data.subject;
        editTeacherModal.show();
    } else {
        log('ERROR', 'Could not find teacher document for editing.', { teacherId: docId });
    }
};

window.saveTeacherChanges = async () => {
    const docId = document.getElementById('editTeacherId').value;
    const updatedData = {
        name: document.getElementById('editName').value,
        department: document.getElementById('editDepartment').value,
        subject: document.getElementById('editSubject').value,
    };

    if (!updatedData.name || !updatedData.department || !updatedData.subject) {
        return log('WARN', 'Update teacher form validation failed: All fields required.');
    }

    const docRef = doc(db, 'teachers', docId);
    try {
        await updateDoc(docRef, updatedData);
        log('INFO', 'Teacher information updated successfully.', { teacherId: docId });
        editTeacherModal.hide();
        loadTeachers();
    } catch (err) {
        log('ERROR', 'Error updating teacher.', { teacherId: docId, error: err.message });
    }
};

window.deleteTeacher = async function (docId) {
    if (confirm("Are you sure you want to delete this teacher?")) {
        try {
            await deleteDoc(doc(db, 'teachers', docId));
            log('INFO', 'Teacher deleted', { teacherId: docId });
            loadTeachers();
        } catch (err) {
            log('ERROR', 'Error deleting teacher', { teacherId: docId, error: err.message });
        }
    }
};

// --- Student Approval Management ---
async function loadPendingStudents() {
    const tbody = document.getElementById('studentList');
    renderSkeleton(2, 3, tbody); // Show skeleton loader

    const q = query(collection(db, 'students'), where("approved", "==", false));
    const snapshot = await getDocs(q);
    tbody.innerHTML = ''; // Clear skeleton

    if (snapshot.empty) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center">No pending registrations.</td></tr>';
        return;
    }
    let delay = 0;
    snapshot.forEach(docSnap => {
        const data = docSnap.data();
        const tr = document.createElement('tr');
        tr.className = 'fade-in-item';
        tr.style.animationDelay = `${delay}s`;
        tr.innerHTML = `
            <td>${data.name}</td>
            <td>${data.email}</td>
            <td>
                <button onclick="approveStudent('${docSnap.id}')" class="btn btn-success btn-sm"><i class="bi bi-check-lg"></i> Approve</button>
            </td>
        `;
        tbody.appendChild(tr);
        delay += 0.05;
    });
}

window.approveStudent = async function (docId) {
    try {
        await updateDoc(doc(db, 'students', docId), { approved: true });
        log('INFO', 'Student approved', { studentId: docId });
        loadPendingStudents();
    } catch (err) {
        log('ERROR', 'Error approving student', { studentId: docId, error: err.message });
    }
};

// --- Authentication ---
window.logout = function() {
    signOut(auth).then(() => {
        log('INFO', 'Admin logged out.');
        window.location.href = 'index.html';
    }).catch((error) => {
        log('ERROR', 'Logout Error', { error: error.message });
    });
};

// --- Initializer ---
document.addEventListener('DOMContentLoaded', () => {
    editTeacherModal = new bootstrap.Modal(document.getElementById('editTeacherModal'));
    loadTeachers();
    loadPendingStudents();
});