  // Initialize Firebase
  var config = {
      apiKey: "AIzaSyDlMhu0mxTHty4m4lEOeMoCE5vzudZYdRs",
      authDomain: "rpsgame-684e0.firebaseapp.com",
      databaseURL: "https://rpsgame-684e0.firebaseio.com",
      projectId: "rpsgame-684e0",
      storageBucket: "",
      messagingSenderId: "183068980388"
  };

  firebase.initializeApp(config);


  // Create a variable to reference the database.
  var database = firebase.database();


//-----------------------------------------------//
var state;
var winOption = [
    "rock,scissors",
    "paper,rock",
    "scissors,paper"
];
var playerMove = "";
var username = "";
var otherPlayerUsername;
var MAXPLAYER = 2;
var playerInGame;
var playerDataRef;
var otherPlayerMove;
var winScore = 0;
var loseScore = 0;
var currentWinScore = 0;
var otherPlayerCurrentWinScore = 0;

//-------------------------------//

 // -------------------CONNECTIONS STATUS--------------------------------------------------- //
 var rpsgame = database.ref("RPSGAME");
 var messageRef = database.ref("RPSGAME").child("message");

  function initalData() {

      rpsgame.on('value', function (snapshot) {
          playerInGame = snapshot.child("playerData").numChildren();
          var playerData = snapshot.child("playerData").val();
          if (snapshot.child("playerData").exists()) {
              if (playerInGame === 2) {
                  $(".gameContainer").show();
                  $(".status").text("");
                  $("#myUsername").text(username);
                  currentWinScore = playerData[username].win;
                  $("#playerScore").text(currentWinScore);

                  for (var i in playerData) {
                      if (playerData[i].userId != username && username != "") {
                          otherPlayerUsername = playerData[i].userId;
                          $("#otherPlayerUsername").text(otherPlayerUsername);
                          otherPlayerCurrentWinScore = playerData[otherPlayerUsername].win;
                          $("#otherPlayerScore").text(otherPlayerCurrentWinScore);
                          if (playerData[i].state === "picked" && state === "picked") {
                              otherPlayerMove = playerData[i].rps;
                              checkWinner();
                          }
                      }
                  }

              } else if (playerInGame < 2) {
                  $(".status").text("Waiting for another player");
                  $(".gameContainer").hide();
                  resetGame();
              }
          } else {

              console.log("No player");
          }



      });
  }


  function getScore() {
      if (username != "") {
          var playerScoreData = database.ref("RPSGAME/playerScore/" + username);
          playerScoreData.once("value", function (snapshot) {
              if (snapshot.val() != null) {
                  winScore = snapshot.val().win;
                  loseScore = snapshot.val().lose;
              }
          });
      }
  }


  function init(username) {

      if (playerInGame < MAXPLAYER) {
          state = "start";
          addtoPlayerData();
      } else {
          console.log("ROOM FULL");
      }
  }

  function addtoPlayerData() {
      playerDataRef = database.ref("RPSGAME").child("playerData/" + username);
      playerDataRef.set({
          rps: playerMove,
          state: state,
          userId: username,
          win: currentWinScore
      });

      playerDataRef.onDisconnect().remove();
  }

  function addScore(win, lose) {
      playerScoreRef = database.ref("RPSGAME").child("playerScore/" + username);
      playerScoreRef.set({
          win: win,
          lose: lose
      });

      playerDataRef.update({
        win: currentWinScore
        });
  }


  function addMessage(message, username) {

      messageRef.push({
          username: username,
          text: message
      });

      $("#message").val("");
  }

  function listenNewMessage() {

      messageRef.on('child_added', function (snapshot) {
          var msg = snapshot.val();

          var containerDiv = $("<div>", {
              "class": "container darker"
          }).appendTo(".messageBox");

          $("<p>", {
              text: msg.text
          }).appendTo(containerDiv);

          $("<span>", {
              "class": "username-left",
              text: msg.username
          }).appendTo(containerDiv);

          $(".wrapper").scrollTop($(".wrapper")[0].scrollHeight);

      });
  }

  function checkArray(my_arr) {
      for (var i = 0; i < my_arr.length; i++) {
          if (my_arr[i] === "")
              return false;
      }
      return true;
  }

  function checkWinner() {
      for (var i in winOption) {
          var winOptionArray = winOption[i].split(",");

          if (playerMove === winOptionArray[0] && otherPlayerMove === winOptionArray[1]) {
              //winScore = winScore + 1;
              addScore(winScore + 1, loseScore);
              currentWinScore++;
              $("#winner").text("YOU WIN");
          } else if (otherPlayerMove === winOptionArray[0] && playerMove === winOptionArray[1]) {
              //loseScore = loseScore + 1;
              addScore(winScore, loseScore + 1);
              $("#winner").text("You Loss");
          } else if (playerMove === otherPlayerMove) {
              $("#winner").text("TIE");
          }

          state = "finished";
          addtoPlayerData();
      }
  }

  function resetGame() {
        state = "start";
        playerMove = "";
        otherPlayerMove = "";
        $("a").removeClass("active");
        $(".clear").empty();
        playerDataRef.child("active").set({
            state: state
        });
  }

  $(document).ready(function () {

      initalData();
      listenNewMessage();
      $(".gameContainer").hide();


      $(document).on("click", "#submitUsername", function (event) {

          event.preventDefault();

          username = $("#inputUsername").val();
          getScore();
          init(username);

      });

      $(document).on("click", "a", function (event) {
          event.preventDefault();

          if (state === "start") {
              state = "picked";
              playerMove = $(this).attr("id");
              $(this).addClass("active");
              addtoPlayerData();
          }
      });

      $(document).on("click", "#submitMessage", function (event) {
          event.preventDefault();

          if ($("#message").val() != "" && username != "") {
              var message = $("#message").val();
              addMessage(message, username);
          }

      });

      $(document).on("click", "#reset", function (event) {
        event.preventDefault();

        resetGame();

    });
  });