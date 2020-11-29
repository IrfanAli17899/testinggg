
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');

var config = {
    apiKey: "AIzaSyCoaRqFgdUu6D_IZ9XZ_ag8J4lc0kRZYYs",
    authDomain: "developer-irfanali-olx-17899.firebaseapp.com",
    databaseURL: "https://developer-irfanali-olx-17899.firebaseio.com",
    projectId: "developer-irfanali-olx-17899",
    storageBucket: "developer-irfanali-olx-17899.appspot.com",
    messagingSenderId: "716478877040"
};
firebase.initializeApp(config);

const messaging = firebase.messaging();