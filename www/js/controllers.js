angular.module('Khitwa.controllers', [])

.controller('UserController', function($scope, User, $window, $location) {
	$scope.user = {};
	$scope.newUser = {};
	$scope.res = {};
	$scope.signin = function () {
		User.signin({username : $scope.user.username, password: $scope.user.password})
		.then(function (resp) {
			if (resp.status !== 200) {
				$scope.res.fail = resp;
			} else {
				$window.localStorage.setItem('com.khitwa',resp.data.token);
				$window.localStorage.setItem('user',resp.data.user);
				$location.path('/');
			}
		})
	};
	$scope.signout = function () {
		User.signout();
		$scope.user = {};
	};
	$scope.signup = function () {
		if ($scope.newUser.password !== $scope.newUser.confirm) {
			$scope.res.fail = {data : "Password Doesn't match"}
		} else {
			User.signup($scope.newUser)
			.then(function (resp) {
				if (resp.status!= 201) {
					$scope.res.fail = resp;
				} else {
					$scope.res = {};
					$scope.res.success = resp;
					$scope.newUser = {};
				}
			})
		}
	};
})

.controller('OrganizationController', function($scope, Organization) {
	$scope.org = {};
	$scope.signin = function () {
		Organization.signin({name : $scope.org.name, password : $scope.org.password})
		.then(function (resp) {
			console.log(resp)
		})
	}
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});
})
