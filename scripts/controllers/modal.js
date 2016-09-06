app.controller("ModalInstanceCtrl", ["$scope", "message", "num", "$rootScope", function($scope, message, num, $rootScope) {
    $scope.message = message;
    $scope.num = num;

    $scope.reset = function() {
        $rootScope.$broadcast('RESTART');
        $rootScope.$broadcast('HIDE_MODAL');
    }

    $scope.closeModal = function() {
        $rootScope.$broadcast('HIDE_MODAL');
    }
}]);