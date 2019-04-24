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
var playerDatabase = database.ref("/players");
var chatDatabase = database.ref("/chat");
var connectedDatabase = database.ref(".info/connected");

// Creates an array that lists out all of the options (Rock, Paper, or Scissors).
const computerChoices = ["r", "p", "s"];

//initial values
var initialWins = 0;
var initialLosses = 0;
var initialTies = 0;
// local player data
var playerName,
    player1LoggedIn = false,
    player2LoggedIn = false,
    playerNumber,
    playerObject,
    player1Object = {
        name: "",
        choice: "",
        wins: 0,
        losses: 0,
        ties: 0
    },
    player2Object = {
        name: "",
        choice: "",
        wins: 0,
        losses: 0,
        ties: 0
    },
    resetId;

// when the login button is clicked, add the new player to the open player slot
$("#loginBtn").click(function (event) {
    event.preventDefault();

    // check to see which player slot is available
    if (!player1LoggedIn) {
        playerNumber = "1";
        playerObject = player1Object;
    }
    else if (!player2LoggedIn) {
        playerNumber = "2";
        playerObject = player2Object;
    }
    else {
        playerNumber = null;
        playerObject = null;
    }

    // if a slot was found, update it with the new information
    if (playerNumber) {
        playerName = $("#player-name-input").val().trim();
        playerObject.name = playerName;
        $("#player-name-input").val("");

        $("#player-name-display").text(playerName);
        $("#player-number").text(playerNumber);

        database.ref("/players/" + playerNumber).set(playerObject);
        database.ref("/players/" + playerNumber).onDisconnect().remove();
    }
});

// when player is added, update respective loggedIn flag and playerObject
playerDatabase.on("child_added", function (childSnap) {
    window["player" + childSnap.key + "LoggedIn"] = true;
    window["player" + childSnap.key + "Object"] = childSnap.val();
}, errorHandler);

// when player is changed, update respective playerObject and stats
playerDatabase.on("child_changed", function (childSnap) {
    window["player" + childSnap.key + "Object"] = childSnap.val();

    updateStats();
}, errorHandler);

// when player is removed, reset respective playerObject and loggedIn flag
playerDatabase.on("child_removed", function (childSnap) {
    chatDatabase.push({
        userId: "system",
        text: childSnap.val().name + " has disconnected"
    });

    window["player" + childSnap.key + "LoggedIn"] = false;
    window["player" + childSnap.key + "Object"] = {
        name: "",
        choice: "",
        wins: 0,
        losses: 0
    };

    // when both players have left, clear the chat
    if (!player1LoggedIn && !player2LoggedIn) {
        chatRef.remove();
    }
}, errorHandler);

// when general changes are made, perform bulk of game logic
playerDatabase.on("value", function (snap) {
    // update the player names
    $("#p1NameIs").text(player1Object.name || "Player 1");
    $("#p2NameIs").text(player2Object.name || "Player 2");

    // update which part of the player box is showing based on whether a selection has been made
    updatePlayerBox("1", snap.child("1").exists(), snap.child("1").exists() && snap.child("1").val().choice);
    updatePlayerBox("2", snap.child("2").exists(), snap.child("2").exists() && snap.child("2").val().choice);

    // display correct "screen" depending on logged in statuses
    if (player1LoggedIn && player2LoggedIn && !playerNumber) {
        loginPending();
    } else if (playerNumber) {
        showLoggedInScreen();
    } else {
        showLoginScreen();
    }

    // if both players have selected their choice, perform the comparison
    if (player1Object.choice && player2Object.choice) {
        rps(player1Object.choice, player2Object.choice);
    }

}, errorHandler);

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

        // Change the directions to viewer count
        directionsText.textContent = "2 people are currently watching your match! Don't let them down!";

        // Display the user and computer guesses, and wins/losses/ties.
        // userChoiceText.textContent = "P1=" + userGuess;
        // computerChoiceText.textContent = "P2=" + computerGuess;
        //store wins for each players into firebase
        // database.ref("/player1WinInfo").set({

        //     p1Win: initialWins
        // });

        // p2NameInput = $("#p2Id-input").val().trim();
        // database.ref("/player2WinInfo").set({

        //     p2Win: initialLosses
        // });
        //locally store and display win count 
        // p1WinIs.textContent = initialWins;
        // p2WinIs.textContent = initialLosses;
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
/**
 * Update the player box state
 * @param {string} playerNum 1 or 2
 * @param {boolean} exists 
 * @param {boolean} choice 
 */
function updatePlayerBox(playerNum, exists, choice) {
    if (exists) {
        if (playerNumber != playerNum) {
            if (choice) {
                $(".p" + playerNum + "-selection-made").show();
                $(".p" + playerNum + "-pending-selection").hide();
            } else {
                $(".p" + playerNum + "-selection-made").hide();
                $(".p" + playerNum + "-pending-selection").show();
            }
        }
    } else {
        $(".p" + playerNum + "-selection-made").hide();
        $(".p" + playerNum + "-pending-selection").hide();
    }
}

//error hanler function
function errorHandler(error) {
    console.log("Error:", error.code);
}

//#region Display functions

function loginPending() {
    $(".pre-connection, .pre-login, .post-login, .selections").hide();
    $(".pending-login").show();
}

function showLoginScreen() {
    $(".pre-connection, .pending-login, .post-login, .selections").hide();
    $(".pre-login").show();
}

function showLoggedInScreen() {
    $(".pre-connection, .pre-login, .pending-login").hide();
    $(".post-login").show();
    if (playerNumber == "1") {
        $(".p1-selections").show();
    } else {
        $(".p1-selections").hide();
    }
    if (playerNumber == "2") {
        $(".p2-selections").show();
    } else {
        $(".p2-selections").hide();
    }
}

function showSelections() {
    $(".selections, .pending-selection, .selection-made").hide();
    $(".selection-reveal").show();
}

// Chat system

// when a chat message is received, add it to the DOM
chatDatabase.on("child_added", function (chatSnap) {
    let chatObj = chatSnap.val();
    let chatText = chatObj.text;
    let chatLogItem = $("<li>").attr("id", chatSnap.key);

    // style the message based on who sent it
    if (chatObj.userId === "system") {
        chatLogItem.addClass("system");
    } else if (chatObj.userId === playerNumber) {
        chatLogItem.addClass("current-user");
    } else {
        chatLogItem.addClass("other-user");
    }

    // if a username exist, prepend it to the chat text
    if (chatObj.name) {
        chatText = "<strong>" + chatObj.name + ":</strong> " + chatText;
    }

    chatLogItem.html(chatText);

    $("#chat-log").append(chatLogItem);

    // scroll to the bottom 
    $("#chat-log").scrollTop($("#chat-log")[0].scrollHeight);
}, errorHandler);

// if a chat message is removed, remove it from the DOM
chatDatabase.on("child_removed", function (chatSnap) {
    $("#" + chatSnap.key).remove();
}, errorHandler);

// when the send-chat button is clicked, send the message to the database
$("#send-chat").click(function (e) {
    e.preventDefault();

    chatDatabase.push({
        userId: playerNumber,
        name: playerName,
        text: $("#chat").val().trim()
    });

    $("#chat").val("");
});
