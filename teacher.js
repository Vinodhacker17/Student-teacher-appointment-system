import { db, auth } from './firebase-config.js';
import {
  collection, getDocs, query, where, updateDoc, doc, addDoc, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { log } from './logger.js';

let currentUserEmail;

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

// --- Authentication State Observer ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUserEmail = user.email;
        loadTeacherAppointments();
        loadAvailability();
    } else {
        log('INFO', 'User not authenticated, redirecting to login.');
        window.location.href = "index.html";
    }
});

// --- Availability Management ---
window.addAvailability = async () => {
    const day = document.getElementById('daySelect').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;

    if (!day || !startTime || !endTime) {
        return log('WARN', 'Add availability form validation failed.');
    }

    try {
        await addDoc(collection(db, 'availabilities'), {
            teacherEmail: currentUserEmail,
            day,
            startTime,
            endTime
        });
        log('INFO', 'Availability slot added.', { teacher: currentUserEmail, day, start: startTime });
        loadAvailability();
    } catch (err) {
        log('ERROR', 'Could not add availability slot.', { error: err.message });
    }
}

async function loadAvailability() {
    if (!currentUserEmail) return;
    const list = document.getElementById('availabilityList');
    list.innerHTML = '<li class="list-group-item"><div class="skeleton skeleton-text" style="width: 80%;"></div></li>'; // Skeleton for lists

    const q = query(collection(db, 'availabilities'), where("teacherEmail", "==", currentUserEmail));
    const snapshot = await getDocs(q);
    list.innerHTML = ''; // Clear skeleton

    if (snapshot.empty) {
        list.innerHTML = '<li class="list-group-item">No availability slots added.</li>';
        return;
    }
    
    let delay = 0;
    snapshot.forEach(docSnap => {
        const data = docSnap.data();
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center fade-in-item';
        li.style.animationDelay = `${delay}s`;
        li.innerHTML = `
            <span><strong>${data.day}</strong>: ${data.startTime} - ${data.endTime}</span>
            <button class="btn btn-danger btn-sm" onclick="deleteAvailability('${docSnap.id}')" title="Remove Slot"><i class="bi bi-x-lg"></i></button>
        `;
        list.appendChild(li);
        delay += 0.05;
    });
}

window.deleteAvailability = async (docId) => {
    if (confirm('Are you sure you want to remove this slot?')) {
        try {
            await deleteDoc(doc(db, 'availabilities', docId));
            log('INFO', 'Availability slot removed.', { availabilityId: docId });
            loadAvailability();
        } catch (err) {
            log('ERROR', 'Could not remove availability slot.', { availabilityId: docId, error: err.message });
        }
    }
}

// --- Appointment Management ---
async function loadTeacherAppointments() {
    if (!currentUserEmail) return;
    const tbody = document.getElementById('appointmentsTableBody');
    renderSkeleton(3, 5, tbody); // Show skeleton loader

    const q = query(collection(db, 'appointments'), where("teacher", "==", currentUserEmail));
    const snapshot = await getDocs(q);
    tbody.innerHTML = ''; // Clear skeleton

    if (snapshot.empty) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">You have no appointment requests.</td></tr>';
        return;
    }

    let delay = 0;
    snapshot.forEach(docSnap => {
        const data = docSnap.data();
        const tr = document.createElement('tr');
        tr.className = 'fade-in-item';
        tr.style.animationDelay = `${delay}s`;
        
        let statusBadge;
        switch (data.status) {
            case 'Approved': statusBadge = `<span class="badge bg-success">${data.status}</span>`; break;
            case 'Cancelled': statusBadge = `<span class="badge bg-danger">${data.status}</span>`; break;
            default: statusBadge = `<span class="badge bg-warning text-dark">${data.status}</span>`;
        }

        tr.innerHTML = `
            <td>${data.studentEmail}</td>
            <td>${new Date(data.time).toLocaleString('en-IN')}</td>
            <td>${data.message}</td>
            <td>${statusBadge}</td>
            <td>
                ${data.status === 'Pending' ? `
                    <button onclick="updateStatus('${docSnap.id}', 'Approved')" class="btn btn-success btn-sm" title="Approve"><i class="bi bi-check-lg"></i></button>
                    <button onclick="updateStatus('${docSnap.id}', 'Cancelled')" class="btn btn-danger btn-sm" title="Cancel"><i class="bi bi-x-lg"></i></button>
                ` : 'No actions'}
            </td>
        `;
        tbody.appendChild(tr);
        delay += 0.05;
    });
}

window.updateStatus = async function (docId, status) {
    if (status === 'Cancelled' && !confirm('Are you sure you want to cancel this appointment?')) return;

    const appointmentRef = doc(db, 'appointments', docId);
    try {
        await updateDoc(appointmentRef, { status });
        log('INFO', 'Appointment status updated.', { appointmentId: docId, status });
        loadTeacherAppointments();
    } catch (err) {
        log('ERROR', 'Could not update appointment status.', { appointmentId: docId, error: err.message });
    }
}

// --- Logout ---
window.logout = function () {
    signOut(auth).then(() => {
        log('INFO', 'Teacher logged out.');
        window.location.href = 'index.html';
    }).catch((error) => {
        log('ERROR', 'Logout Error', { error: error.message });
    });
}