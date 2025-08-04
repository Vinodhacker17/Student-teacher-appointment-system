import { db, auth } from './firebase-config.js';
import {
  collection, getDocs, addDoc, query, where, doc, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { log } from './logger.js';

let currentUser;

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
    currentUser = user;
    loadAppointments();
  } else {
    log('INFO', 'User not authenticated, redirecting to login.');
    window.location.href = "index.html";
  }
});

// --- Teacher Search and Selection ---
window.searchTeachers = async function () {
  const searchInput = document.getElementById('searchInput').value.toLowerCase();
  const list = document.getElementById('teacherList');
  list.innerHTML = '<li class="list-group-item"><div class="skeleton skeleton-text"></div></li>';

  try {
    const snapshot = await getDocs(collection(db, 'teachers'));
    list.innerHTML = '';
    let found = false;
    snapshot.forEach(doc => {
      const data = doc.data();
      const name = (data.name || '').toLowerCase();
      const subject = (data.subject || '').toLowerCase();

      if (name.includes(searchInput) || subject.includes(searchInput)) {
        found = true;
        const li = document.createElement('li');
        li.className = 'list-group-item list-group-item-action';
        li.style.cursor = 'pointer';
        li.textContent = `${data.name} - ${data.subject}`;
        li.onclick = () => selectTeacher(data.name, data.email);
        list.appendChild(li);
      }
    });
    if (!found) list.innerHTML = '<li class="list-group-item">No teachers found.</li>';
  } catch(err){
    log('ERROR', 'Error searching teachers.', { error: err.message });
  }
};

function selectTeacher(name, email) {
    document.getElementById('selectedTeacher').value = name;
    document.getElementById('selectedTeacherEmail').value = email;
    document.getElementById('datePicker').value = '';
    document.getElementById('timeSlotSelect').innerHTML = '<option>Select a date first</option>';
    document.getElementById('timeSlotSelect').disabled = true;
    log('INFO', 'Student selected a teacher.', { teacherName: name, teacherEmail: email });
}

// --- Availability and Booking Logic ---
document.getElementById('datePicker').addEventListener('change', async (e) => {
    const selectedDate = new Date(e.target.value);
    const dayOfWeek = selectedDate.toLocaleString('en-US', { weekday: 'long' });
    const teacherEmail = document.getElementById('selectedTeacherEmail').value;
    const timeSlotSelect = document.getElementById('timeSlotSelect');

    if (!teacherEmail) {
        return log('WARN', 'Date picked without selecting a teacher first.');
    }

    const q = query(collection(db, 'availabilities'), 
        where("teacherEmail", "==", teacherEmail),
        where("day", "==", dayOfWeek)
    );

    try {
        const snapshot = await getDocs(q);
        timeSlotSelect.innerHTML = '';
        if(snapshot.empty){
            timeSlotSelect.innerHTML = '<option>Teacher not available on this day</option>';
            timeSlotSelect.disabled = true;
        } else {
            snapshot.forEach(doc => {
                const slot = doc.data();
                const option = document.createElement('option');
                option.value = `${slot.startTime}-${slot.endTime}`;
                option.textContent = `${slot.startTime} - ${slot.endTime}`;
                timeSlotSelect.appendChild(option);
            });
            timeSlotSelect.disabled = false;
        }
    } catch(err) {
        log('ERROR', 'Error fetching availability.', { error: err.message });
    }
});

window.bookAppointment = async function () {
  const teacherEmail = document.getElementById('selectedTeacherEmail').value;
  const date = document.getElementById('datePicker').value;
  const timeSlot = document.getElementById('timeSlotSelect').value;
  const message = document.getElementById('message').value;

  if (!teacherEmail || !date || !timeSlot || !message) {
    return log('WARN', 'Book appointment form validation failed.');
  }
  
  const startTime = timeSlot.split('-')[0];
  const appointmentTime = new Date(`${date}T${startTime}`);

  try {
    await addDoc(collection(db, 'appointments'), {
      studentId: currentUser.uid,
      studentEmail: currentUser.email,
      teacher: teacherEmail,
      time: appointmentTime.toISOString(),
      message,
      status: 'Pending'
    });

    log('INFO', 'Appointment booked successfully.', { forTeacher: teacherEmail });
    document.getElementById('selectedTeacher').value = '';
    document.getElementById('selectedTeacherEmail').value = '';
    document.getElementById('datePicker').value = '';
    document.getElementById('timeSlotSelect').innerHTML = '<option>Select a date first</option>';
    document.getElementById('message').value = '';
    loadAppointments();
  } catch (err) {
    log('ERROR', 'Error booking appointment.', { error: err.message });
  }
};

// --- Appointment List Management ---
async function loadAppointments() {
  if (!currentUser) return;
  const tbody = document.getElementById('myAppointments');
  renderSkeleton(3, 5, tbody); // Render skeleton for 5 columns

  const q = query(collection(db, 'appointments'), where("studentId", "==", currentUser.uid));
  const snapshot = await getDocs(q);
  tbody.innerHTML = '';

  if (snapshot.empty) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center">You have no appointments.</td></tr>';
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
      <td>${data.teacher}</td>
      <td>${new Date(data.time).toLocaleString()}</td>
      <td>${data.message}</td>
      <td>${statusBadge}</td>
      <td>
        ${data.status === 'Pending' ? `
            <button onclick="cancelAppointment('${docSnap.id}')" class="btn btn-danger btn-sm" title="Cancel Appointment"><i class="bi bi-x-lg"></i></button>
        ` : 'N/A'}
      </td>
    `;
    tbody.appendChild(tr);
    delay += 0.05;
  });
}

// NEW: Function for students to cancel their own pending appointments
window.cancelAppointment = async function(docId) {
    if (confirm("Are you sure you want to cancel this appointment?")) {
        try {
            await deleteDoc(doc(db, 'appointments', docId));
            log('INFO', 'Student cancelled an appointment.', { appointmentId: docId });
            loadAppointments();
        } catch(err) {
            log('ERROR', 'Error cancelling appointment.', { appointmentId: docId, error: err.message });
        }
    }
};

// --- Logout ---
window.logout = function() {
    signOut(auth).then(() => {
        log('INFO', 'Student logged out.');
        window.location.href = 'index.html';
    }).catch((error) => {
        log('ERROR', 'Logout Error', { error: error.message });
    });
}