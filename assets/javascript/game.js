// Initialize Firebase
const config = {
    apiKey: "AIzaSyBVm0go9PSlCykzEZDF2y2EOAGIzTeBlOo",
    authDomain: "rps-multiplayer-fd7e2.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-fd7e2.firebaseio.com",
    projectId: "rps-multiplayer-fd7e2",
    storageBucket: "rps-multiplayer-fd7e2.appspot.com",
    messagingSenderId: "838105829531"
};
firebase.initializeApp(config);

// Create a variable to reference the database.
const database = firebase.database();
let playerDatabase = database.ref("/players");
let chatDatabase = database.ref("/chat");
let connectedDatabase = database.ref(".info/connected");

// Creates an array that lists out all of the options (Rock, Paper, or Scissors).
const computerChoices = ["r", "p", "s"];

//initial values
let initialWins = 0;
let initialLosses = 0;
let initialTies = 0;
// local player data
let playerName;
let player1LoggedIn = false;
let player2LoggedIn = false;
let playerNumber;
let playerObject;
let player1Object = {
    name: "",
    choice: "",
    wins: 0,
    losses: 0
}
let player2Object = {
    name: "",
    choice: "",
    wins: 0,
    losses: 0
}
let resetId;

let p1Name = "Player 1"
let p1Win = initialWins;
let p2Name = "Player 2"
let p2Win = initialWins;

// when the login button is clicked, add the new player to the open player slot
$("#loginBtn").click(function (event) {
    event.preventDefault();

    // check to see which player slot is available
    if (!player1LoggedIn) {
        playerNumber = 1;
        playerObject = player1Object;
    }
    else if (!player2LoggedIn) {
        playerNumber = 2;
        playerObject = player2Object;
    }
    else {
        playerNumber = null;
        playerObject = null;
    }

    // if a slot was found, update it with the new information
    if (playerNumber === 1 || playerNumber === 2) {
        playerName = $("#player-name-input").val().trim();
        playerObject.name = playerName;
        $("#player-name-input").val("");

        $("#player-name-display").text(playerName);
        $("#player-number").text(playerNumber);

        database.ref(`/players/${playerNumber}`).set(playerObject);
        database.ref(`/players/${playerNumber}`).onDisconnect().remove();
    }
});

// when a selection is made, send it to the database
$(".selection").click(function () {
    playerObject.choice = this.id;
    database.ref("/players/" + playerNumber).set(playerObject);

    $(`.p ${playerNumber}-selections`).hide();
    $(`.p ${playerNumber}-selection-reveal`).text(this.id).show();
});

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
        console.log("player1 name:" + p1Name);
        console.log("player1 win:" + p1Win);
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
        $("#p2NameIs").text(p2Name);
        $("#p2WinIs").text(p2Win);

        // Print the local data to the console.
        console.log("local player 2 information:");
        console.log("player2 name:" + p2Name);
        console.log("player2 win:" + p2Win);
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
        p1Name: p1NameInput
    });

    // Log the new p1 name
    console.log("New player 1 has entered the arena!");
    console.log(p1Name);

    // Store the new name as a local variable (could have also used the Firebase variable)
    p1Name = p1NameInput;

    // Change the HTML to reflect the new data
    $("#p1NameIs").text(p1Name);

    $("#p1Id-input").val("");
});

$("#submit-p2").on("click", function (event) {
    event.preventDefault();

    // Get the input values
    p2NameInput = $("#p2Id-input").val().trim();
    // Save the new data in Firebase
    database.ref("/player2Info").set({
        p2Name: p2NameInput
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
const directionsText = document.getElementById("directions-text");
const userChoiceText = document.getElementById("userchoice-text");
const computerChoiceText = document.getElementById("computerchoice-text");
const winsText = document.getElementById("wins-text");
const lossesText = document.getElementById("losses-text");
const tiesText = document.getElementById("ties-text");

// This function is run whenever the user presses a key.
$(".btn-secondary").on("click", function (event) {

    // Determines which button was pressed.
    const userGuess = $(this).val();
    console.log(userGuess);

    // Randomly chooses a choice from the options array. This is the Computer's guess.
    let computerGuess = computerChoices[Math.floor(Math.random() * computerChoices.length)];

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

        // Change the directions to viewer count
        directionsText.textContent = "2 people are currently watching your match! Don't let them down!";

        // Display the user and computer guesses, and wins/losses/ties.
        // userChoiceText.textContent = "P1=" + userGuess;
        // computerChoiceText.textContent = "P2=" + computerGuess;
        //store wins for each players into firebase
        database.ref("/player1WinInfo").set({

            p1Win: initialWins
        });

        // p2NameInput = $("#p2Id-input").val().trim();
        // database.ref("/player2WinInfo").set({

        //     p2Win: initialLosses
        // });
        //locally store and display win count 
        p1WinIs.textContent = initialWins;
        p2WinIs.textContent = initialLosses;
    }
    //display RPS imgs to represnt choices
    if (userGuess === "r") {
        $("#playerOneRpsImg").append(`<img src="./assets/image/rock.png" id="hideMe" style="width: 7rem; -webkit-transform: scaleX(-1); transform: scaleX(-1)">`);
    }
    if (userGuess === "p") {
        $("#playerOneRpsImg").append(`<img src="./assets/image/paper.png" id="hideMe" style="width: 7rem">`);
    }
    if (userGuess === "s") {
        $("#playerOneRpsImg").append(`<img src="./assets/image/sissor.png" id="hideMe" style="width: 7rem">`);
    }
    if (computerGuess === "r") {
        $("#playerTwoRpsImg").append(`<img src="./assets/image/rock.png" id="hideMe" style="width: 7rem">`);
    }
    if (computerGuess === "p") {
        $("#playerTwoRpsImg").append(`<img src="./assets/image/paper.png" id="hideMe" style="width: 7rem; -webkit-transform: scaleX(-1); transform: scaleX(-1)">`);
    }
    if (computerGuess === "s") {
        $("#playerTwoRpsImg").append(`<img src="./assets/image/sissor.png" id="hideMe" style="width: 7rem; -webkit-transform: scaleX(-1); transform: scaleX(-1)">`);
    }

});
