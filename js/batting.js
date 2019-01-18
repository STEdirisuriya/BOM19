var bomAdmin = angular.module('bomAdmin', ['bomServices']);

bomAdmin.controller('ctrl', ['$scope', 'socket', '$http',
  function($scope, socket, $http) {

    $http.get(serverAddress + '/data/players').success(function(data) {
      $scope.players = data;
      console.log($scope.players);
    });

    $http.get(serverAddress + '/data/main').success(function(data) {
      $scope.dataset = data.batting;
      console.log(data);
      console.log($scope.dataset);
    });

    $scope.types = ["in1", "in2", "in3", "in4", "od1", "od2"];
    $scope.typeFilter = {
      "ID": "in2"
    };
    $scope.schoolFilter = {
      "school": "Ananda"
    };
    $scope.order = "order";

    var valid = function(name, type) {
      for (var i = 0; i < $scope.players.length; i++) {
        if (($scope.players[i].name == name)) {
          if ($scope.types.indexOf(type) > -1) {
            return true;
          }

        }

      }
      return false;
    }

    var hasGot = function(ID, playerID) {
      for (var i = 0; i < $scope.dataset.length; i++) {
        if ($scope.dataset[i].ID == ID && $scope.dataset[i].playerID == playerID) {
          return i;
        }
      }
      return -1;
    }

    $scope.processRemove = function() {
      if (valid($scope.toRemove.name, $scope.toRemove.type)) {
        var rmPlayerID;
        for (var i = 0; i < $scope.players.length; i++) {
          if ($scope.players[i].name == $scope.toRemove.name)
            rmPlayerID = i;
        }
        socket.emit('data.remove.batting', {
          ID: $scope.toRemove.type,
          playerID: rmPlayerID
        });
        alert('please refresh your browser');
      }
    };
    $scope.controlSet = [{
      "index": -1,
      "name": "",
      "order": "",
      "score": 0,
      "balls": 0,
      "inTheField": false,
      "batting": false,
      "updateMain": function() {
        $scope.updateMain(0);
      }
    }, {
      "index": -1,
      "name": "",
      "type": "",
      "order": "",
      "score": 0,
      "balls": 0,
      "inTheField": false,
      "batting": false,
      "updateMain": function() {
        $scope.updateMain(1);
      }
    }];

    $scope.updateMain = function(index) {
      if (!valid($scope.controlSet[index].name, $scope.typeFilter.ID)) {
        alert("Player name or game type is not valid!");
        return;
      }
      var ID = $scope.typeFilter.ID;
      var playerID;
      for (var i = 0; i < $scope.players.length; i++) {
        if ($scope.players[i].name == $scope.controlSet[index].name)
          playerID = i;
      }
      var playerIndex = hasGot(ID, playerID);
      if (playerIndex < 0) {
        console.log("adding player!");
        $scope.dataset.push({
          "ID": ID,
          "playerID": playerID,
          "order": $scope.controlSet[index].order,
          "score": 0,
          "balls": 0,
          "current": false,
          "inTheField": false
        });
        playerIndex = hasGot(ID, playerID);
      }
      if (playerIndex > -1) // already existing 
      {
        $scope.controlSet[index].order = $scope.dataset[playerIndex].order;
        $scope.controlSet[index].inTheField = $scope.dataset[playerIndex].inTheField;
        $scope.controlSet[index].batting = $scope.dataset[playerIndex].batting;
        $scope.controlSet[index].score = $scope.dataset[playerIndex].score;
        $scope.controlSet[index].balls = $scope.dataset[playerIndex].balls;
        $scope.controlSet[index].index = playerIndex;
      }
    };

    for (var i = 0; i < $scope.controlSet.length; i++) {
      $scope.$watchCollection(
        "controlSet[" + i + "]",
        function(newValue, oldValue) {
          if (newValue.index < 0)
            return;
          if (newValue.name != oldValue.name)
            return;
          $scope.dataset[newValue.index].order = newValue.order;
          $scope.dataset[newValue.index].score = newValue.score;
          $scope.dataset[newValue.index].balls = newValue.balls;
          $scope.dataset[newValue.index].inTheField = newValue.inTheField;
          $scope.dataset[newValue.index].batting = newValue.batting;
          socket.emit('data.batting', $scope.dataset[newValue.index]);
        });
    }
  }
]);
