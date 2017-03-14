angular.module('Khitwa.controllers', [])

.controller('UserController', function($scope, User, $window, $location) {
	$scope.user = {};
	$scope.res = {};
	$scope.signin = function () {
		User.signin({username : $scope.user.username, password: $scope.user.password})
		.then(function (resp) {
			if (resp.status !== 200) {
				$scope.res = resp;
			} else {
				$window.localStorage.setItem('com.khitwa',resp.data.token);
				$window.localStorage.setItem('user',resp.data.user);
				$location.path('/');
			}
		})
	}
})

.controller('OrganizationController', function($scope) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});
})
