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
  console.log(playerListRef);
  //var connectedRef = firebase.database().ref('.info/connected');
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
              if (playerData[i].userId != username) {
                  if ( playerData[i].state === "picked" && state === "picked") {
                    otherPlayerMove = playerData[i].rps;
                    checkWinner();
                }
              }
          }
      }
  });


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

  function play() {
      if (player1Move != "" && player2Move != "") {
          checkWinner();
      }
  }

  function checkWinner() {
      for (var i in winOption) {
          var winOptionArray = winOption[i].split(",");

          if (playerMove === winOptionArray[0] && otherPlayerMove === winOptionArray[1]) {
              console.log("You win");
          } else if (otherPlayerMove === winOptionArray[0] && playerMove === winOptionArray[1]) {
              console.log("You Loss");
          } else if (playerMove === otherPlayerMove) {
              console.log("TIE");
          }
      }
  }


  $(document).ready(function () {
      $(".gameContainer").hide();


      $(document).on("click", "#submitUsername", function () {
          event.preventDefault();

          username = $("#inputUsername").val();
          console.log(username);
          init(username);

      });


      console.log("test");

      $(document).on("click", "i", function () {
          event.preventDefault();

          if (state === "start") {
              state = "picked";
              playerMove = $(this).attr("id");
              addtoPlayerData();
          }

          if (state != 2) {
              if (whoTurn === "player1") {
                  player1Move = $(this).attr("id");
                  whoTurn = "player2";
                  console.log(player1Move);
              } else if (whoTurn === "player2") {
                  player2Move = $(this).attr("id");
                  console.log(player2Move);
                  state = 2;
                  play();
              }
          }

      });
  });