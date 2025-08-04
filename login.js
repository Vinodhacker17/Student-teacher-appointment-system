import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { log } from './logger.js';

window.loginUser = async function () {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const role = document.getElementById("roleSelect").value;

  if (!email || !password || !role) {
      return log('WARN', 'Login form validation failed.');
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    log('INFO', 'User logged in successfully.', { email: userCredential.user.email, role: role });

    if (role === 'student') window.location.href = "dashboard.html";
    else if (role === 'teacher') window.location.href = "teacher.html"; 
    else if (role === 'admin') window.location.href = "admin.html";
    
  } catch (error) {
    log('ERROR', 'Login failed.', { errorCode: error.code, errorMessage: error.message });
    alert("Login Failed: " + error.message); // Keep alert for user feedback on failure
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