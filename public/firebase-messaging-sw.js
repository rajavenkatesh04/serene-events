// /public/firebase-messaging-sw.js

// Import the Firebase scripts using the compatibility version for service workers
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

// Your project's Firebase configuration object
const firebaseConfig = {
    apiKey: "AIzaSyCJ0DHebGc9fd5WLD6DF_tp8se7CGQRbiQ",
    authDomain: "luna-895ae.firebaseapp.com",
    projectId: "luna-895ae",
    storageBucket: "luna-895ae.firebasestorage.app",
    messagingSenderId: "430728041821",
    appId: "1:430728041821:web:78446a6c84672f8c5404b4",
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Get an instance of Firebase Messaging
const messaging = firebase.messaging();

/**
 * Handles incoming messages when the app is in the background or closed.
 */
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message: ', payload);

    // Extract notification data from the payload
    const notificationTitle = payload.data.title || 'Event Update';
    const notificationBody = payload.data.body || 'You have a new announcement';
    const notificationUrl = payload.data.url || '/'; // Default to home page if no URL

    const notificationOptions = {
        body: notificationBody,
        tag: 'event-notification', // Groups notifications to prevent spam
        icon: '/favicon.ico',      // Optional: Add an icon
        data: {
            url: notificationUrl   // Pass the URL to the click handler
        },
        requireInteraction: true,  // Keep notification visible until user interaction
    };

    // Show the notification to the user
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

/**
 * Handles the user clicking on the notification.
 */
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification clicked: ', event.notification);

    // Close the notification
    event.notification.close();

    // Open the URL from the notification's data payload in a new window/tab
    if (event.notification.data && event.notification.data.url) {
        event.waitUntil(clients.openWindow(event.notification.data.url));
    }
});