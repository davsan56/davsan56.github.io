var app = angular.module("battleship", []);
app.controller("myCtrl", function ($scope) {
    var myChoices = [];
    $scope.myBoard = [];
    $scope.enemyBoard = [];
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

    var foundShip = [];
    $scope.easyMode = false;

    $scope.enemyHit = 0;
    $scope.playerHit = 0;

    $scope.myLocations = {
        0: [],
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
        6: []
    };
    $scope.myTotalLocations = [];

    $scope.enemyLocations = {
        0: [],
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
        6: []
    };
    $scope.enemyTotalLocations = [];

    var color = 0;

    // Holds the information for each of the ships
    var ships = {
        "Aircraft Carrier": 5,
        "Battleship": 4,
        "Cruiser": 3,
        "Destroyer": 2,
        "second Destroyer": 2,
        "Submarine": 1,
        "second Submarine": 1
    }

    $scope.num = Object.keys(ships).length;

    // Make this variable true to see the enemy ships
    var testing = false;
    
    // Initializes the array for the players board
    for (var i = 0; i < 100; i++) {
        $scope.myBoard.push({
            id: i,
            backgroundColor: "dodgerblue"
        });
    }

    // Initializes the array for the enemy's board
    for (var i = 0; i < 100; i++) {
        $scope.enemyBoard.push({
            id: i,
            backgroundColor: "dodgerblue"
        });
    }
    
    // Picks random enemy locations
    $scope.initialize = function() {
        for (var i = 0; i < Object.keys(ships).length; i++) { //Object.keys(ships).length
            $scope.length = ships[Object.keys(ships)[i]];
            $scope.blocksLeft = $scope.length;

            var id = Math.floor((Math.random() * 100));
            while ($scope.enemyTotalLocations.indexOf(id.toString()) != -1) {
                id = Math.floor((Math.random() * 100));
            }
            id = id.toString();

            $scope.enemyLocations[currentShip].push(id);
            $scope.enemyTotalLocations.push(id);
            $scope.shipLocations.push(id);
            if (testing) $scope.enemyBoard[id].backgroundColor = "#" + color.toString().repeat(6);
            $scope.blocksLeft--;
            updatePossibleLocations(true);

            for (var j = 0; j < $scope.possibleLocations.length; j++) {
                var first = parseInt(id);
                var second = parseInt($scope.possibleLocations[j]);

                var toAdd = 0;
                var k = 0;
                var lessThan = 0;
                if (Math.abs(first - second) < 10) {
                    toAdd = 1;
                    if (first > second) {
                        k = second + 1;
                        lessThan = first;
                    } else {
                        k = first + 1;
                        lessThan = second;
                    }
                } else {
                    toAdd = 10;
                    if (first > second) {
                        k = second + 10;
                        lessThan = first;
                    } else {
                        k = first + 10;
                        lessThan = second;
                    }
                }
                for (k; k < lessThan; k += toAdd) {
                    if ($scope.enemyTotalLocations.indexOf(k.toString()) != -1) {
                        $scope.possibleLocations = $scope.possibleLocations.filter(function(x){return x != $scope.possibleLocations[j]});
                    }
                }
            }

            if ($scope.length > 1) {
                id = $scope.possibleLocations[Math.floor((Math.random() * $scope.possibleLocations.length))];
                while ($scope.enemyTotalLocations.indexOf(id.toString()) != -1) {
                    id = $scope.possibleLocations[Math.floor((Math.random() * $scope.possibleLocations.length))];
                }
                id = id.toString();

                $scope.enemyLocations[currentShip].push(id);
                $scope.enemyTotalLocations.push(id);
                $scope.shipLocations.push(id);
                if (testing) $scope.enemyBoard[id].backgroundColor = "#" + color.toString().repeat(6);
                $scope.blocksLeft--;
                updatePossibleLocations(true);
            }

            currentShip++;
            $scope.shipLocations = [];
            $scope.possibleLocations = [];
            color += 2;
        }

        currentShip = -1;
        $scope.length = 0;
        $scope.shipLocations = [];
        $scope.possibleLocations = [];
        $scope.pickingShips = true;
        $scope.blocksLeft = 0;
        color = 0;
    }

    // When the user is still pickingShips and there are 0 blocks left to pick, tell the user to pick the next ship
    $scope.$watch('pickingShips && blocksLeft', function() {
        if ($scope.pickingShips && $scope.blocksLeft == 0) {
            currentShip++;
            var name = Object.keys(ships)[currentShip];
            $scope.length = parseInt(ships[name]);
            $scope.blocksLeft = $scope.length;
            $scope.shipsLeft--;
            $scope.shipLocations = [];
            $scope.possibleLocations = [];

            if ($scope.shipsLeft != 0) addNewMessage("Choose the start and end of your " + name + " (" + $scope.length + " blocks long)");
        }
    });

    // When there are no ships left to pick, start the game
    $scope.$watch('shipsLeft', function() {
        if ($scope.shipsLeft == 0 && $scope.pickingShips) {
            $scope.pickingShips = false;
            $scope.started = true;
            $scope.yourTurn = Math.round((Math.random())) == 0 ? true : false;
            addNewMessage($scope.yourTurn ? "It is your turn to start" : "The computer will go first");
            $scope.stillGuessing = $scope.yourTurn;
            if (!$scope.yourTurn) computerGuess();
        }
    });

    // This function is called when the player is assigning their ships
    $scope.assign = function($event) {
        if (!$scope.started && $scope.pickingShips) {
            var id = $event.currentTarget.id;
            if ($scope.myTotalLocations.indexOf(id) == -1) {
                if ($scope.possibleLocations.length == 0) {
                    $scope.myLocations[currentShip].push(id);
                    $scope.myTotalLocations.push(id);
                    $scope.shipLocations.push(id);
                    $scope.myBoard[id].backgroundColor = "#" + color.toString().repeat(6);
                    $scope.blocksLeft--;
                    updatePossibleLocations(false);
                    for (var j = 0; j < $scope.possibleLocations.length; j++) {
                        var first = parseInt(id);
                        var second = parseInt($scope.possibleLocations[j]);

                        var toAdd = 0;
                        var k = 0;
                        var lessThan = 0;
                        if (Math.abs(first - second) < 10) {
                            toAdd = 1;
                            if (first > second) {
                                k = second + 1;
                                lessThan = first;
                            } else {
                                k = first + 1;
                                lessThan = second;
                            }
                        } else {
                            toAdd = 10;
                            if (first > second) {
                                k = second + 10;
                                lessThan = first;
                            } else {
                                k = first + 10;
                                lessThan = second;
                            }
                        }
                        for (k; k < lessThan; k += toAdd) {
                            if ($scope.myTotalLocations.indexOf(k.toString()) != -1) {
                                $scope.possibleLocations = $scope.possibleLocations.filter(function(x){return x != $scope.possibleLocations[j]});
                            }
                        }
                    }
                } else {
                    if ($scope.possibleLocations.indexOf(parseInt(id)) != -1) {
                        $scope.myLocations[currentShip].push(id);
                        $scope.myTotalLocations.push(id);
                        $scope.shipLocations.push(id);
                        $scope.myBoard[id].backgroundColor = "#" + color.toString().repeat(6);
                        $scope.blocksLeft--;
                        updatePossibleLocations(false);
                        color += 2;
                    } else {
                        addNewMessage("Invalid location. Pick again.");
                    }
                }
            } else {
                addNewMessage("You have already chosen this box.");
            }
        }
    }

    var updateScreen = function() {
        var x = $scope.possibleLocations[Math.floor((Math.random() * $scope.possibleLocations.length))];
        while ($scope.guessedLocations.indexOf(x) != -1) {
           x = $scope.possibleLocations[Math.floor((Math.random() * $scope.possibleLocations.length))];
        }
        $scope.guessedLocations.push(x);
        var hit = $scope.myTotalLocations.indexOf(x.toString()) == -1 ? false : true;
        if (hit) $scope.myTotalLocations = $scope.myTotalLocations.filter(function(y) {return y != parseInt(x);});
        var message = hit ? "hit one of your ships!" : "missed your ships!";
        var sank = hit ? removeFromLocations($scope.myLocations, x) : false;
        $scope.myBoard[x].backgroundColor = hit ? "green" : "red";
        if (!sank) {
            addNewMessage("The enemy guessed " + $scope.translate(parseInt(x) + 1) + " and " + message);
            if (hit) foundShip.push(x.toString());
        } else {
            foundShip = [];
        }
        $scope.yourTurn = true;
        if ($scope.myLocations.length != 0) addNewMessage("It is your turn to attack.");
    }

    // This method choices a random location for the computer to pick
    // TODO: Add in some sort of logic so when the computer guesses a correct location, it guesses around the spot, randomly
    var computerGuess = function() {
        if (foundShip.length == 0 || $scope.easyMode) {
            // take random guesses
            var x = Math.floor((Math.random() * 100));
            while ($scope.guessedLocations.indexOf(x) != -1) {
               x = Math.floor((Math.random() * 100));
            }
            $scope.guessedLocations.push(x);
            var hit = $scope.myTotalLocations.indexOf(x.toString()) == -1 ? false : true;
            if (hit) $scope.myTotalLocations = $scope.myTotalLocations.filter(function(y) {return y != parseInt(x);});
            var message = hit ? "hit one of your ships!" : "missed your ships!";
            var sank = hit ? removeFromLocations($scope.myLocations, x) : false;
            $scope.myBoard[x].backgroundColor = hit ? "green" : "red"; 
            if (!sank) {
                addNewMessage("The enemy guessed " + $scope.translate(parseInt(x) + 1) + " and " + message);
                if (hit) foundShip.push(x.toString());
            }
            $scope.yourTurn = true;
            if ($scope.myLocations.length != 0) addNewMessage("It is your turn to attack.");
        } else {
            // choose possible square 
            if (foundShip.length == 1) {
                possibleLocationFinding(foundShip, 1, true, true);
                updateScreen();
            } else {
                // figure out what direction the ship is going and choose those
                var first = foundShip[0];
                var second = foundShip[1];

                if (Math.abs(first - second) < 10) {
                    // guess horizontally
                    possibleLocationFinding(foundShip, 1, true, false);
                } else {
                    // guess vertically
                    possibleLocationFinding(foundShip, 1, false, true);
                }

                updateScreen();
            }
        }

        $scope.possibleLocations = [];
    }

    var possibleLocationFinding = function(locations, amount, horizontal, vertical) {
        for (var i = 0; i < locations.length; i++) {
            var location = parseInt(locations[i]);
            var first = (location + amount).toString();
            var second = locations[0];

            if (first.length == 1) first = "0";
            if (second.length == 1) second = "0";

            first = first[0];
            second = second[0];

            if ((first == second && location + amount < 100) && horizontal )
                $scope.possibleLocations.push(location + amount);

            first = (location - amount).toString();
            second = locations[0];

            if (first.length == 1) first = "0";
            if (second.length == 1) second = "0";

            first = first[0];
            second = second[0];

            if ((first == second && location - amount > -1) && horizontal)
                $scope.possibleLocations.push(location - amount);

            if (vertical) {
                if (location + (amount * 10) < 100)                
                    $scope.possibleLocations.push(location + (amount * 10));
                if (location - (amount * 10) > -1)
                    $scope.possibleLocations.push(location - (amount * 10));
            }
        }
    }

    // This method calculates any possible location of the end of the ship given a specific start point. 
    // Also fills in all the squares once the player picks a correct end point
    var updatePossibleLocations = function(enemy) {
        if ($scope.blocksLeft > 0) {
            if ($scope.shipLocations.length == 1) {
                // fill in possible locations
                possibleLocationFinding($scope.shipLocations, $scope.blocksLeft, true, true);
            } else if ($scope.shipLocations.length == 2) {
                var first = parseInt($scope.shipLocations[0]);
                var second = parseInt($scope.shipLocations[1]);

                var toAdd = 0;
                var i = 0;
                var lessThan = 0;
                if (Math.abs(first - second) < 10) {
                    toAdd = 1;
                    if (first > second) {
                        i = second + 1;
                        lessThan = first;
                    } else {
                        i = first + 1;
                        lessThan = second;
                    }
                } else {
                    toAdd = 10;
                    if (first > second) {
                        i = second + 10;
                        lessThan = first;
                    } else {
                        i = first + 10;
                        lessThan = second;
                    }
                }
                for (i; i < lessThan; i += toAdd) {
                    if (!enemy) {
                        $scope.myLocations[currentShip].push(i.toString());
                        $scope.myTotalLocations.push(i.toString());
                        $scope.myBoard[i].backgroundColor = "#" + color.toString().repeat(6);
                    } else {
                        $scope.enemyLocations[currentShip].push(i.toString());
                        $scope.enemyTotalLocations.push(i.toString());
                        if (testing) $scope.enemyBoard[i].backgroundColor = "#" + color.toString().repeat(6);
                    }
                    $scope.shipLocations.push(i.toString());
                    $scope.blocksLeft--;
                }
            }
        }
    }
    
    // This function is called when the user is picking an enemy ship
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
                for (var i = 0; i < $scope.enemyTotalLocations.length; i++) {
                    if ($scope.enemyTotalLocations[i] == parseInt(id)) {
                        $scope.enemyBoard[id].backgroundColor = "green";
                        var index = $scope.enemyTotalLocations.indexOf(parseInt(id));
                        $scope.enemyTotalLocations = $scope.enemyTotalLocations.filter(function(x) {return x != parseInt(id);});
                        var missed = "hit a ship!"
                        var sank = removeFromLocations($scope.enemyLocations, id);
                        break;
                    }
                }
                if (!sank) addNewMessage("You guessed box " + $scope.translate(parseInt(id) + 1) + " and " + missed);
                $scope.stillGuessing = false;
                $scope.yourTurn = false;
            }
        }
    }

    var removeFromLocations = function(whichLocation, id) {
        for (var i = 0; i < $scope.num; i++) {
            if (whichLocation[i].length != 0) {
                whichLocation[i] = whichLocation[i].filter(function(x) {return x != id});
                if (whichLocation[i].length == 0) {
                    if (whichLocation == $scope.enemyLocations) {
                        $scope.playerHit++;
                        addNewMessage("You sank my " + Object.keys(ships)[i] + "!");
                        return true;
                    } else if (whichLocation == $scope.myLocations) {
                        $scope.enemyHit++;
                        addNewMessage("The enemy sank your " + Object.keys(ships)[i] + "!");
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    // This function resets the whole game and is able to play again
    $scope.reset = function() {
        $scope.picking = 0;
        $scope.messages = [];
        $scope.myLocations = {
            0: [],
            1: [],
            2: [],
            3: [],
            4: [],
            5: [],
            6: []
        };
        $scope.enemyLocations = {
            0: [],
            1: [],
            2: [],
            3: [],
            4: [],
            5: [],
            6: []
        };
        currentShip = 0;
        $scope.myTotalLocations = [];
        $scope.enemyTotalLocations = [];
        $scope.started = false;
        $scope.guessedLocations = [];
        $scope.finished = false;
        $scope.shipsLeft = $scope.num + 1;
        $scope.pickingShips = false;
        $scope.playerHit = 0;
        $scope.enemyHit = 0;
        myChoices = [];
        color = 0;
        foundShip = [];

        for (var i = 0; i < 100; i++) {
            $scope.enemyBoard[i].backgroundColor = "dodgerblue";
            $scope.myBoard[i].backgroundColor = "dodgerblue";
        }

        $scope.initialize();
    }

    // This function watches for changes on the yourTurn variable and correct assigns whos turn it is
    $scope.$watch('yourTurn', function() {
        if ($scope.started) {
            if ($scope.yourTurn) {
                $scope.stillGuessing = true;
            } else {
                if (!$scope.stillGuessing) {
                    // addNewMessage(thinkingMessages[Math.floor((Math.random() * thinkingMessages.length - 1))]);
                    computerGuess();
                }
            }
        }
    });

    // This function is called when the user hovers over a square and changes the color appropriately 
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
                if (board[id].backgroundColor == "dodgerblue")
                    board[id].backgroundColor = "gray";
        } else if (board == $scope.myBoard){
            if ($scope.pickingShips)  if (board[id].backgroundColor == "dodgerblue") board[id].backgroundColor = "gray";
        }
    }
    
    // This function is called when the user stops hovering over a square and changes the color appropriately 
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
                if (board[id].backgroundColor == "gray")
                    board[id].backgroundColor = "dodgerblue";
        } else if (board == $scope.myBoard) {
            if ($scope.pickingShips) if (board[id].backgroundColor == "gray") board[id].backgroundColor = "dodgerblue";
        }
    }

    // This method takes a message and adds it to the messages array. Also removes messages if there are too many
    var addNewMessage = function(message) {
        $scope.messages.unshift(message);
        if ($scope.messages.length > 3) {
            $scope.messages = $scope.messages.slice(0, 3);
        }
    }

    // This function returns a range based on user input
    $scope.range = function(min, max, step) {
        step = step || 1;
        var input = [];
        for (var i = min; i <= max; i += step) {
            input.push(i);
        }
        return input;
    };

    // This function takes in a number and translates it to the correct location on the playing field
    // Example: 1 -> A1, 57 -> F7
    $scope.translate = function(n) {
        var str = n.toString();
        var first = str.charAt(str.length - 1);
        var num = first == "0" ? "10" : first;

        var second = str.charAt(str.length - 2);
        var letterNum = second == "" ? 0 : (second == "0" ? 9 : parseInt(second));
        var toAdd = n % 10 == 0 ? 64 : 65;
        var letter = String.fromCharCode(letterNum + toAdd);
        if (n == 100) return "J10"; else return letter + num;
    }
    
    // This function is called when the enemy wins
    $scope.$watch('playerHit', function() {
       if ($scope.started) {
           if ($scope.playerHit == $scope.num) {
                addNewMessage("Congratulations! You won!");
                $scope.started = false;
                $scope.yourTurn = false;
                $scope.finished = true;
           };
        }
    });

    // This function is called when the user wins
    $scope.$watch('enemyHit', function() {
        if ($scope.started) {
            if ($scope.enemyHit == $scope.num) {
                addNewMessage("You have lost!");
                $scope.started = false;
                $scope.yourTurn = false;
                $scope.finished = true;
            }
        }
    });
});
