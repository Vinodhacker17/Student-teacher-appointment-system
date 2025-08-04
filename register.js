import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { log } from './logger.js';

window.registerStudent = async function() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const name = document.getElementById("name").value;

  if(!email || !password || !name) {
      return log('WARN', 'Registration form validation failed.');
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    log('INFO', 'User account created.', { uid: userCredential.user.uid });
    
    await addDoc(collection(db, "students"), {
      uid: userCredential.user.uid,
      email,
      name,
      approved: false
    });
    log('INFO', 'Student profile created in Firestore, pending approval.');
    
    alert("Registration Successful. Please wait for an admin to approve your account.");
    window.location.href = "index.html";
  } catch (error) {
    log('ERROR', 'Registration failed.', { errorCode: error.code, errorMessage: error.message });
    alert("Error: " + error.message); // Keep alert for user feedback on failure
  }
}

document.addEventListener('DOMContentLoaded', () => {
    const imageSection = document.querySelector('.auth-image-section');
    if (imageSection) {
        const images = [
            'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1974',
            'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1769',
            'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=1770'
        ];
        const randomIndex = Math.floor(Math.random() * images.length);
        imageSection.style.backgroundImage = `url('${images[randomIndex]}')`;
    }
});