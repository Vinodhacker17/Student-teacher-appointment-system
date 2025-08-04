# Student–Teacher Appointment System

<p align="center">
  <img alt="Languages" src="https://img.shields.io/github/languages/count/Vinodhacker17/Student-teacher-appointment-system?style=for-the-badge&color=blue">
  <img alt="Top Language" src="https://img.shields.io/github/languages/top/Vinodhacker17/Student-teacher-appointment-system?style=for-the-badge&color=blueviolet">
  <img alt="Repo size" src="https://img.shields.io/github/repo-size/Vinodhacker17/Student-teacher-appointment-system?style=for-the-badge&color=orange">
</p>

A web-based platform for students to book appointments with teachers based on their availability. Built with vanilla JavaScript and powered by Google Firebase.

**Live Demo:** [https://your-project-id.web.app](https://your-project-id.web.app) *(Replace with your Firebase Hosting URL)*

<br>

<p align="center">
  <img src="https://i.imgur.com/your-screenshot-url.png" alt="Project Screenshot" width="80%">
  <br>
  <em>(Important: Replace this with a real screenshot of your application's dashboard)</em>
</p>

---

## Table of Contents

- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Getting Started](#getting-started)
- [Deployment](#deployment)

---

## Key Features

This project contains three main user roles with distinct functionalities:

#### 👨‍💼 Admin
-   **Dashboard:** Secure login to the admin panel.
-   **Teacher Management:** Add, update, and delete teacher profiles.
-   **Student Approval:** View and approve pending student registrations.

#### 🧑‍🏫 Teacher
-   **Dashboard:** Secure login to the teacher dashboard.
-   **Availability Management:** Set and manage weekly availability slots for student bookings.
-   **Appointment Management:** View, approve, or cancel pending appointment requests from students.

#### 👨‍🎓 Student
-   **Authentication:** Securely register for a new account and log in.
-   **Teacher Discovery:** Search for teachers by name or subject.
-   **Booking Workflow:** Select a teacher, view their available dates and times, and book an appointment with a purpose message.
-   **Status Tracking:** View a list of their own booked appointments and their current status (Pending, Approved, Cancelled).

---

## Technology Stack

-   **Frontend:** HTML5, CSS3, JavaScript (ESM), Bootstrap 5
-   **Backend & Database:** Google Firebase
    -   **Authentication:** For user registration and login.
    -   **Firestore:** As the NoSQL database for all application data.
    -   **Hosting:** For cloud deployment.

---

## System Architecture

The system uses a client-server architecture where the frontend client communicates directly with Firebase services.

-   **Client (Browser):** A static web application built with HTML, CSS, and Bootstrap. All dynamic behavior is handled by modular JavaScript.
-   **Backend (Firebase):** Google Firebase provides the backend-as-a-service. It handles user identity and stores data in Firestore collections.

```mermaid
graph TD
    A[Student] --> B{Firebase App};
    C[Teacher] --> B;
    D[Admin] --> B;
    B --> E[Firebase Auth];
    B --> F[Firestore Database];
```    
## Getting Started
To get a local copy up and running, follow these steps.

Prerequisites
A modern web browser (e.g., Chrome, Firefox).

A code editor (e.g., VS Code).

A Google account to create a Firebase project.

Local Setup
Clone the repository:

Bash

git clone [https://github.com/Vinodhacker17/Student-teacher-appointment-system.git](https://github.com/Vinodhacker17/Student-teacher-appointment-system.git)
cd Student-teacher-appointment-system
Set up your Firebase Credentials:

In the Firebase Console, create a new project and then create a Web App.

Firebase will provide you with a firebaseConfig object.

In the project folder, create a new file named firebase-config.js.

Copy the following code into your new firebase-config.js file and paste your credentials into the firebaseConfig object.

JavaScript

// firebase-config.js
import { initializeApp } from "[https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js](https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js)";
import { getAuth } from "[https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js](https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js)";
import { getFirestore } from "[https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js](https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js)";

// IMPORTANT: Paste your own Firebase config object here
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
This file is listed in .gitignore and will not be pushed to GitHub, keeping your keys safe.

Enable Firebase Services:

In your Firebase project console, go to Authentication and enable the Email/Password sign-in provider.

Go to Firestore Database and create a database. Start in test mode for easy setup.

Run the Project:

Use a live server extension in VS Code to open index.html.

Deployment
This project can be deployed globally using Firebase Hosting.

Install Firebase CLI:

Bash

npm install -g firebase-tools
Login to Firebase:

Bash

firebase login
Initialize Firebase:

Bash

firebase init
Select Hosting: Configure files for Firebase Hosting....

Choose your existing Firebase project.

Set your public directory to . (the root directory).

Configure as a single-page app: No.

Deploy:

Bash

firebase deploy







