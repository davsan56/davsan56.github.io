app.controller("ModalInstanceCtrl", ["$scope", "message", "num", "$rootScope", "playerHit", function($scope, message, num, $rootScope, playerHit) {
    $scope.message = message;
    $scope.num = num;
    $scope.playerHit = playerHit;

    $scope.reset = function() {
        $rootScope.$broadcast('RESTART');
        $rootScope.$broadcast('HIDE_MODAL');
    }

    $scope.closeModal = function() {
        $rootScope.$broadcast('HIDE_MODAL');
    }
}]);