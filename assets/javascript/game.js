// Initialize Firebase
var config = {
    apiKey: "AIzaSyBVm0go9PSlCykzEZDF2y2EOAGIzTeBlOo",
    authDomain: "rps-multiplayer-fd7e2.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-fd7e2.firebaseio.com",
    projectId: "rps-multiplayer-fd7e2",
    storageBucket: "rps-multiplayer-fd7e2.appspot.com",
    messagingSenderId: "838105829531"
};
firebase.initializeApp(config);

// Create a variable to reference the database.
var database = firebase.database();

// Creates an array that lists out all of the options (Rock, Paper, or Scissors).
var computerChoices = ["r", "p", "s"];

//initial values
let initialWins = 0;
let initialLosses = 0;
let initialTies = 0;
let p1Name = "Rockonly360noScope"
let p1Win = initialWins;
let p2Name = "NoobWith2fingers"
let p2Win = initialWins;

//firewatcher
database.ref("/player1Info").on("value", function (snapshot) {
    // If Firebase has a p1Name and p1Win stored (first case)
    if (snapshot.child("p1Name").exists()) {

        // Set the local variables for player 1 info equal to the stored values in firebase.
        p1Name = snapshot.val().p1Name;
        p1Win = parseInt(snapshot.val().p1Win);

        // change the HTML to reflect the newly updated local values (most recent information from firebase)
        $("#p1NameIs").text(snapshot.val().p1Name);
        $("#p1WinIs").text(snapshot.val().p1Win);

        // Print the local data to the console.
        console.log(snapshot.val().p1Name);
        console.log(snapshot.val().p1Win);
    }

    // Else Firebase doesn't have a player 1 info, so use the initial local values.
    else {

        // Change the HTML to reflect the local value in firebase
        $("#p1NameIs").text(p1Name);
        $("#p1WinIs").text(p1Win);

        // Print the local data to the console.
        console.log("local player 1 information:");
        console.log(p1Name);
        console.log(p1Win);
    }
}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});

//firewatcher
database.ref("/player2Info").on("value", function (snapshot) {
    // If Firebase has a p1Name and p1Win stored (first case)
    if (snapshot.child("p2Name").exists()) {

        // Set the local variables for player 1 info equal to the stored values in firebase.
        p2Name = snapshot.val().p2Name;
        p2Win = parseInt(snapshot.val().p2Win);

        // change the HTML to reflect the newly updated local values (most recent information from firebase)
        $("#p2NameIs").text(snapshot.val().p2Name);
        $("#p2WinIs").text(snapshot.val().p2Win);

        // Print the local data to the console.
        console.log(snapshot.val().p2Name);
        console.log(snapshot.val().p2Win);
    }

    // Else Firebase doesn't have a player 1 info, so use the initial local values.
    else {

        // Change the HTML to reflect the local value in firebase
        $("#p2NameIs").text(p1Name);
        $("#p2WinIs").text(p1Win);

        // Print the local data to the console.
        console.log("local player 1 information:");
        console.log(p1Name);
        console.log(p1Win);
    }
}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});

// Whenever a user clicks the submit-p1 button
$("#submit-p1").on("click", function (event) {
    event.preventDefault();

    // Get the input values
    p1NameInput = $("#p1Id-input").val().trim();
    // Save the new data in Firebase
    database.ref("/player1Info").set({
        p1Name: p1NameInput,
    });

    // Log the new p1 name
    console.log("New player 1 has entered the arena!");
    console.log(p1Name);

    // Store the new name as a local variable (could have also used the Firebase variable)
    p1Name = p1NameInput;

    // Change the HTML to reflect the new data
    $("#p1NameIs").text(p1Name);
    $("#p1WinIs").text(p1Win);

    $("#p1Id-input").val("");
});

$("#submit-p2").on("click", function (event) {
    event.preventDefault();

    // Get the input values
    p2NameInput = $("#p2Id-input").val().trim();
    // Save the new data in Firebase
    database.ref("/player2Info").set({
        p2Name: p2NameInput,
    });

    // Log the new player enter
    console.log("New player 2 has entered the arena!");
    console.log(p1Name);

    // Store the new name as a local variable (could have also used the Firebase variable)
    p2Name = p2NameInput;

    // Change the HTML to reflect the new data
    $("#p2NameIs").text(p2Name);
    $("#p2WinIs").text(p2Win);

    $("#p2Id-input").val("");
});

// Create variables that hold references to the places in the HTML where we want to display things.
var directionsText = document.getElementById("directions-text");
var userChoiceText = document.getElementById("userchoice-text");
var computerChoiceText = document.getElementById("computerchoice-text");
var winsText = document.getElementById("wins-text");
var lossesText = document.getElementById("losses-text");
var tiesText = document.getElementById("ties-text");

// This function is run whenever the user presses a key.
document.onkeyup = function (event) {

    // Determines which key was pressed.
    var userGuess = event.key;

    // Randomly chooses a choice from the options array. This is the Computer's guess.
    var computerGuess = computerChoices[Math.floor(Math.random() * computerChoices.length)];

    // This logic determines the outcome of the game (win/loss/tie), and increments the appropriate number
    if ((userGuess === "r") || (userGuess === "p") || (userGuess === "s")) {

        if ((userGuess === "r" && computerGuess === "s") ||
            (userGuess === "s" && computerGuess === "p") ||
            (userGuess === "p" && computerGuess === "r")) {
            initialWins++;
        } else if (userGuess === computerGuess) {
            initialTies++;
        } else {
            initialLosses++;
        }

        // Hide the directions
        directionsText.textContent = "";

        // Display the user and computer guesses, and wins/losses/ties.
        userChoiceText.textContent = "P1=" + userGuess;
        computerChoiceText.textContent = "P2=" + computerGuess;
        p1WinIs.textContent = initialWins;
        p2WinIs.textContent = initialLosses;
    }
};