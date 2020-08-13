// // Firebase App (the core Firebase SDK) is always required and
// // must be listed before other Firebase SDKs
// var firebase = require("firebase/app");

// // Add the Firebase products that you want to use
// require("firebase/auth");
// require("firebase/database");

// CANNOT DO initializeApp since 

const firebaseConfig = {
    apiKey: "AIzaSyDVmSBp5fDYonObveYsZDcDjrMndmogZbw",
    authDomain: "common-sense-bof.firebaseapp.com",
    databaseURL: "https://common-sense-bof.firebaseio.com",
    projectId: "common-sense-bof",
    storageBucket: "common-sense-bof.appspot.com",
    messagingSenderId: "582431397382",
    appId: "1:582431397382:web:f80f0182313b03a48ed587",
    measurementId: "G-GDW2HXQGJL"
};

// function init() {
//     return firebase.initializeApp(firebaseConfig);
// }