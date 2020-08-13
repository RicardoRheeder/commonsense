var firebase = require("firebase/app");
require("firebase/database");

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

firebase.initializeApp(firebaseConfig);
var prevTotal = 0;
var curTotal = 0;

var prevUserCount = 0;
var userCount = 0;

var users = 0;
var average = 0;

var UpdateWasMade = false;

setInterval(() => {
    firebase.database().ref().once('value', (snapshot) => { // Get a snapshot of values in the DB
        // console.log(snapshot.val())
        // curTotal = snapshot.val().total;
        // userCount = snapshot.val().userCount;

        curTotal = 0;
        users = snapshot.val().users;

        // Count the users
        if (users) {
            userCount = Object.keys(users).filter((e) => users[e].status === 'active').length;
            Object.keys(users).filter((e) => { (users[e].status === 'active' && users[e].heartrate > 0) ? curTotal += users[e].heartrate : null })
        } else {
            userCount = 0
        }

        // Update the userCount on database only if it has changed
        if (prevUserCount != userCount) {
            firebase.database().ref().update({ userCount });
            prevUserCount = userCount;

            UpdateWasMade = true;
            console.log("UPDATE COUNT")
        }

        if (prevTotal != curTotal) {
            if (userCount < 1 || curTotal == 0) {
                firebase.database().ref().update({ avg: 0 });
            } else {
                average = parseFloat((curTotal / userCount).toFixed(3));

                firebase.database().ref().update({ avg: average });
            }
            prevTotal = curTotal;

            UpdateWasMade = true;
            console.log("UPDATE TOTAL")
        }

        if (UpdateWasMade) {
            console.log(users)
            console.log("Total Heartrate: " + curTotal + " -- User Count: " + userCount + " -- Average Heartrate: " + average)
            UpdateWasMade = false;
        }
    });

}, 500)