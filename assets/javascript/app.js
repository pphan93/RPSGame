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


  // -------------------CONNECTIONS STATUS--------------------------------------------------- //
  var rpsgame = database.ref("RPSGAME");
  var playerListRef = database.ref("RPSGAME/playerList");
  var messageRef = database.ref("RPSGAME").child("message");
  

  function initalData() {

      console.log(playerListRef);
      rpsgame.on('value', function (snapshot) {
          if (snapshot.child("playerList").exists()) {
              playerInGame = snapshot.child("playerList").numChildren();
              playerlistArrary = snapshot.val().playerList;
              console.log(playerlistArrary);

              if (playerInGame === 2) {
                  $(".gameContainer").show();
                  $(".status").text("");
              } else if (playerInGame < 2) {
                  $(".status").text("Waiting for another player");
                  $(".gameContainer").hide();
              }
          } else {
              console.log("No player");
          }

          if (snapshot.child("playerData").exists()) {
              var playerData = snapshot.child("playerData").val();
              for (var i in playerData) {
                  if (playerData[i].userId != username && username != "") {
                      if (playerData[i].state === "picked" && state === "picked") {
                          otherPlayerMove = playerData[i].rps;
                          checkWinner();
                      }
                  }
              }
          }
      });
  }


  function getScore() {
      if (username != "") {
          var playerScoreData = database.ref("RPSGAME/playerScore/" + username);
          playerScoreData.once("value", function (snapshot) {
              console.log("_________________________");
              console.log(snapshot.val());
              if (snapshot.val() != null) {
                  winScore = snapshot.val().win;
                  loseScore = snapshot.val().lose;
              }
          });
          console.log("user" + username);
      }
  }


  function init(username) {

      console.log(playerlistArrary);
      if (playerlistArrary.length < MAXPLAYER) {
          playerlistArrary.push(username);
          addtoPlayerList();
          myPlayerNum = playerlistArrary.length - 1;
          state = "start";
          addtoPlayerData();
          console.log(myPlayerNum);
      } else {
          if (playerlistArrary.length === 2) {

              for (var i = 0; i < playerlistArrary.length; i++) {
                  if (playerlistArrary[i] === undefined) {
                      playerlistArrary[i] = username;
                      myPlayerNum = i;
                      addtoPlayerList();
                      state = "start";
                      addtoPlayerData();
                  }
              }
          } else {
              console.log("ROOM FULL");
          }

      }
      var connectionChild = database.ref("RPSGAME").child("playerList/" + myPlayerNum);
      connectionChild.onDisconnect().remove();
  }

  function addtoPlayerList() {
      playerListRef.set(playerlistArrary);
  }


  function pushEmptyChildren() {
      var ref = firebase.database().ref('yourDatabase');
      var yourDatabase = {
          childOne: "test",
          childTwo: "",
          childThree: ""
      };
      ref.push(yourDatabase);
  }

  function addtoPlayerData() {
      playerDataRef = database.ref("RPSGAME").child("playerData/" + myPlayerNum);
      playerDataRef.set({
          rps: playerMove,
          state: state,
          userId: username
      });
      console.log("playerdata" + myPlayerNum);

      playerDataRef.onDisconnect().remove();
  }

  function addScore(win, lose) {
      console.log("win:" + win, lose);
      playerScoreRef = database.ref("RPSGAME").child("playerScore/" + username);
      playerScoreRef.set({
          win: win,
          lose: lose
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
          console.log(msg.username + " " + msg.text);
          
          var containerDiv = $("<div>", {
              "class": "container darker"
          }).appendTo(".messageBox");

          $("<p>", {
              text: msg.text
          }).appendTo(containerDiv);

          $("<span>", {
              "class" : "username-left",
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

  var state;
  var whoTurn = "player1";
  var winOption = [
      "rock,scissors",
      "paper,rock",
      "scissors,paper"
  ];
  var playerMove = "";
  var player1Move;
  var player2Move;
  var username = "";
  var myPlayerNum;
  var playerlistArrary = [];
  var MAXPLAYER = 2;
  var playerInGame;
  var playerDataRef;
  var otherPlayerMove;
  var winScore = 0;
  var loseScore = 0;

  function play() {
      if (player1Move != "" && player2Move != "") {
          checkWinner();
      }
  }

  function checkWinner() {
      for (var i in winOption) {
          var winOptionArray = winOption[i].split(",");

          if (playerMove === winOptionArray[0] && otherPlayerMove === winOptionArray[1]) {
              //winScore = winScore + 1;
              addScore(winScore + 1, loseScore);
              console.log("You win");
          } else if (otherPlayerMove === winOptionArray[0] && playerMove === winOptionArray[1]) {
              //loseScore = loseScore + 1;
              addScore(winScore, loseScore + 1);
              console.log("You Loss");
          } else if (playerMove === otherPlayerMove) {
              console.log("TIE");
          }

          state = "finished";
          addtoPlayerData();
      }
  }

  
  $(document).ready(function () {
    
      initalData();
      listenNewMessage();
      $(".gameContainer").hide();


      $(document).on("click", "#submitUsername", function () {

          event.preventDefault();

          username = $("#inputUsername").val();
          console.log(username);
          getScore();
          init(username);

      });


      console.log("test");

      $(document).on("click", "a", function () {
          event.preventDefault();

          if (state === "start") {
              state = "picked";
              playerMove = $(this).attr("id");
              addtoPlayerData();
          }
      });



      $(document).on("click", "#submitMessage", function () {
          event.preventDefault();

          if ($("#message").val() != "" && username != "") {
              var message = $("#message").val();
              addMessage(message, username);
          }

      });
  });