var app = angular.module("battleship", []);
app.controller("myCtrl", function ($scope) {
    var myChoices = [];
    $scope.enemyLocations = [];
    $scope.myLocations = [];
    $scope.myBoard = [];
    $scope.enemyBoard = [];
    $scope.num = 7;
    $scope.started = false;
    $scope.messages = [];
    var guessing = false;
    $scope.pickingShips = false;
    $scope.picking = 0;
    $scope.yourTurn = false;
    $scope.finished = false;
    $scope.stillGuessing = false;
    $scope.guessedLocations = [];
    $scope.abc = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
    var thinkingMessages = ["Hmm..", "Where to attack..", "Thinking..", "This spot looks good.."];

    $scope.blocksLeft = 0;
    $scope.shipsLeft = $scope.num + 1;
    $scope.shipLocations = [];
    $scope.possibleLocations = [];
    var currentShip = 0;

    var ships = {
        "Aircraft Carrier": 5,
        "Battleship": 4,
        "Cruiser": 3,
        "Destroyer": 2,
        "second Destroyer": 2,
        "Submarine": 1,
        "second Submarine": 1
    }
    
    for (var i = 0; i < 100; i++) {
        $scope.myBoard.push({
            id: i,
            backgroundColor: "dodgerblue"
        });
    }

    for (var i = 0; i < 100; i++) {
        $scope.enemyBoard.push({
            id: i,
            backgroundColor: "dodgerblue"
        });
    }
    
    $scope.initialize = function() {
        for (var i = 0; i < $scope.num; i++) {
            var x = Math.floor((Math.random() * 100));
            if ($scope.enemyLocations.indexOf(x) == -1) {
                $scope.enemyLocations[i] = x;
            } else {
                i--;
            }
        }

        var plural = $scope.num > 1 ? " ships" : " ship!";
        $scope.pickingShips = true;
    }

    $scope.$watch('pickingShips && blocksLeft', function() {
        if ($scope.pickingShips && $scope.blocksLeft == 0) {
            var name = Object.keys(ships)[currentShip];
            $scope.length = parseInt(ships[name]);
            $scope.blocksLeft = $scope.length;
            $scope.shipsLeft--;
            currentShip++;
            $scope.shipLocations = [];
            $scope.possibleLocations = [];

            addNewMessage("Choose the start and end of your " + name + " (" + $scope.length + " blocks long)");
        }
    });

    $scope.$watch('shipsLeft', function() {
        if ($scope.shipsLeft == 0 && $scope.pickingShips) {
            $scope.pickingShips = false;
            $scope.started = true;
            $scope.yourTurn = Math.round((Math.random())) == 0 ? true : false;
            addNewMessage($scope.yourTurn ? "It is your turn to start" : "The computer will go first");
            $scope.stillGuessing = $scope.yourTurn;
            if (!$scope.yourTurn) computerGuessHelper();
        }
    });

    $scope.assign = function($event) {
        if (!$scope.started && $scope.pickingShips) {
            var id = $event.currentTarget.id;
            if ($scope.myLocations.indexOf(id) == -1) {
                if ($scope.possibleLocations.length == 0) {
                    $scope.myLocations.push(id);
                    $scope.shipLocations.push(id);
                    $scope.myBoard[id].backgroundColor = "black";
                    $scope.blocksLeft--;
                    updatePossibleLocations(false);
                } else {
                    if ($scope.possibleLocations.indexOf(parseInt(id)) != -1) {
                        $scope.myLocations.push(id);
                        $scope.shipLocations.push(id);
                        $scope.myBoard[id].backgroundColor = "black";
                        $scope.blocksLeft--;
                        updatePossibleLocations(false);
                    } else {
                        addNewMessage("Invalid location. Pick again.");
                    }
                }
            } else {
                addNewMessage("You have already chosen this box.");
            }
        }
    }

    var updatePossibleLocations = function(enemy) {
        if ($scope.blocksLeft > 0) {
            if ($scope.shipLocations.length == 1) {
                var location = parseInt($scope.shipLocations[0]);
                var first = (location + $scope.blocksLeft).toString();
                var second = $scope.shipLocations[0];

                if (first.length == 1) first = "0";
                if (second.length == 1) second = "0";

                first = first[0];
                second = second[0];

                if (first == second && location + $scope.blocksLeft < 100)
                    $scope.possibleLocations.push(location + $scope.blocksLeft);

                first = (location - $scope.blocksLeft).toString();
                second = $scope.shipLocations[0];

                if (first.length == 1) first = "0";
                if (second.length == 1) second = "0";

                first = first[0];
                second = second[0];

                if (first == second && location - $scope.blocksLeft > -1)
                    $scope.possibleLocations.push(location - $scope.blocksLeft);

                if (location + ($scope.blocksLeft * 10) < 100)                
                    $scope.possibleLocations.push(location + ($scope.blocksLeft * 10));
                if (location - ($scope.blocksLeft * 10) > -1)
                    $scope.possibleLocations.push(location - ($scope.blocksLeft * 10));
            } else if ($scope.shipLocations.length == 2) {
                var first = parseInt($scope.shipLocations[0]);
                var second = parseInt($scope.shipLocations[1]);
                if (Math.abs(first - second) < 10) {
                    if (first > second) {
                        for (i = second + 1; i < first; i++) {
                            if (!enemy) {
                                $scope.myLocations.push(i.toString());
                                $scope.myBoard[i].backgroundColor = "black";
                            } else {
                                $scope.enemyLocations.push(i.toString());
                                $scope.enemyBoard[i].backgroundColor = "black";
                            }
                            $scope.shipLocations.push(i.toString());
                            $scope.blocksLeft--;
                        }
                    } else {
                        for (i = first + 1; i < second; i++) {
                            if (!enemy) {
                                $scope.myLocations.push(i.toString());
                                $scope.myBoard[i].backgroundColor = "black";
                            } else {
                                $scope.enemyLocations.push(i.toString());
                                $scope.enemyBoard[i].backgroundColor = "black";
                            }
                            $scope.shipLocations.push(i.toString());
                            $scope.blocksLeft--;
                        }
                    }
                } else {
                    if (first > second) {
                        for (i = second + 10; i < first; i += 10) {
                            if (!enemy) {
                                $scope.myLocations.push(i.toString());
                                $scope.myBoard[i].backgroundColor = "black";
                            } else {
                                $scope.enemyLocations.push(i.toString());
                                $scope.enemyBoard[i].backgroundColor = "black";
                            }
                            $scope.shipLocations.push(i.toString());
                            $scope.blocksLeft--;
                        }
                    } else {
                        for (i = first + 10; i < second; i += 10) {
                            if (!enemy) {
                                $scope.myLocations.push(i.toString());
                                $scope.myBoard[i].backgroundColor = "black";
                            } else {
                                $scope.enemyLocations.push(i.toString());
                                $scope.enemyBoard[i].backgroundColor = "black";
                            }
                            $scope.shipLocations.push(i.toString());
                            $scope.blocksLeft--;
                        }
                    }
                }
            }
        }
    }
    
    $scope.myGuess = function($event) {
        if ($scope.started && $scope.yourTurn) {
            var id = $event.currentTarget.id;
            var alreadyClicked = false;
            for (var i = 0; i < myChoices.length; i++) {
                if (myChoices[i] == id) {
                    alreadyClicked = true;
                    break;
                }
            }
            
            if (!alreadyClicked) {
                myChoices.push(id);
                $scope.enemyBoard[id].backgroundColor = "red";
                var missed = "missed!"
                for (var i = 0; i < $scope.enemyLocations.length; i++) {
                    if ($scope.enemyLocations[i] == parseInt(id)) {
                        $scope.enemyBoard[id].backgroundColor = "green";
                        var index = $scope.enemyLocations.indexOf(parseInt(id));
                        $scope.enemyLocations = $scope.enemyLocations.filter(function(x) {return x != parseInt(id);});
                        var missed = "hit a ship!"
                        break;
                    }
                }
                addNewMessage("You guessed box " + $scope.translate(parseInt(id) + 1) + " and " + missed);
                $scope.stillGuessing = false;
                $scope.yourTurn = false;
            }
        }
    }
    
    $scope.reset = function() {
        $scope.picking = 0;
        $scope.messages = [];
        $scope.myLocations = [];
        $scope.enemyLocations = [];
        $scope.started = false;
        $scope.guessedLocations = [];
        $scope.finished = false;
        myChoices = [];
        $scope.initialize();
        for (var i = 0; i < 100; i++) {
            $scope.enemyBoard[i].backgroundColor = "dodgerblue";
            $scope.myBoard[i].backgroundColor = "dodgerblue";
        }
    }

    $scope.$watch('yourTurn', function() {
        if ($scope.started) {
            if ($scope.yourTurn) {
                $scope.stillGuessing = true;
            } else {
                if (!$scope.stillGuessing) {
                    computerGuessHelper();
                }
            }
        }
    });

    var computerGuessHelper = function() {
        addNewMessage(thinkingMessages[Math.floor((Math.random() * thinkingMessages.length - 1))]);
        computerGuess();
    }

    var computerGuess = function() {
        var x = Math.floor((Math.random() * 100));
        while ($scope.guessedLocations.indexOf(x) != -1) {
           x = Math.floor((Math.random() * 100));
        }
        $scope.guessedLocations.push(x);
        var hit = $scope.myLocations.indexOf(x.toString()) == -1 ? false : true;
        if (hit) $scope.myLocations = $scope.myLocations.filter(function(y) {return y != parseInt(x);});
        var message = hit ? "hit one of your ships!" : "missed your ships!";
        $scope.myBoard[x].backgroundColor = hit ? "green" : "red"; 
        addNewMessage("The computer guessed " + $scope.translate(parseInt(x) + 1) + " and " + message);
        $scope.yourTurn = true;
        if ($scope.myLocations.length != 0) addNewMessage("It is your turn to attack.");
    }
    
    $scope.hover = function($event, board) {
        var id = $event.currentTarget.id;
        if (board == $scope.enemyBoard && $scope.yourTurn && !$scope.pickingShips) {
            var clicked = false;
            for (var i = 0; i < myChoices.length; i++) {
                if (id == myChoices[i]) {
                    clicked = true; 
                    break;
                } 
            }
            if (!clicked)
                if (board[id].backgroundColor != "red" || board[id].backgroundColor != "green")
                    board[id].backgroundColor = "gray";
        } else if (board == $scope.myBoard){
            if ($scope.pickingShips)  if (board[id].backgroundColor != "black") board[id].backgroundColor = "gray";
        }
    }
    
    $scope.exit = function($event, board) {
        var id = $event.currentTarget.id;
        if (board == $scope.enemyBoard && $scope.yourTurn) {
            var clicked = false;
            for (var i = 0; i < myChoices.length; i++) {
                if (id == myChoices[i]) {
                    clicked = true; 
                    break;
                } 
            }
            if (!clicked)
                if (board[id].backgroundColor != "red" || board[id].backgroundColor != "green" || board[id].backgroundColor != "black")
                    board[id].backgroundColor = "dodgerblue";
        } else if (board == $scope.myBoard) {
            if ($scope.pickingShips) if (board[id].backgroundColor != "black") board[id].backgroundColor = "dodgerblue";
        }
    }

    var addNewMessage = function(message) {
        $scope.messages.unshift(message);
        if ($scope.messages.length > 5) {
            $scope.messages = $scope.messages.slice(0, 5);
        }
    }

    $scope.range = function(min, max, step) {
        step = step || 1;
        var input = [];
        for (var i = min; i <= max; i += step) {
            input.push(i);
        }
        return input;
    };

    $scope.translate = function(n) {
        var str = n.toString();
        var first = str.charAt(str.length - 1);
        var num = first == "0" ? "10" : first;

        var second = str.charAt(str.length - 2);
        var letterNum = second == "" ? 0 : (second == "0" ? 9 : parseInt(second));
        var letter = String.fromCharCode(letterNum + 65);
        return letter + num;
    }
    
    $scope.$watch('enemyLocations', function() {
       if ($scope.started) { 
           if ($scope.enemyLocations.length == 0) {
                addNewMessage("Congratulations! You won!");
                $scope.started = false;
                $scope.yourTurn = false;
                $scope.finished = true;
           };
        }
    });

    $scope.$watch('myLocations', function() {
        if ($scope.started) {
            if ($scope.myLocations.length == 0) {
                addNewMessage("You have lost!");
                $scope.started = false;
                $scope.yourTurn = false;
                $scope.finished = true;
            }
        }
    });
});
