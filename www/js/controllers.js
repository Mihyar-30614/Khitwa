angular.module('Khitwa.controllers', [])

.controller('UserController', function($scope, User, $window, $location, $timeout) {
	$scope.loggedIn = $window.localStorage.getItem('com.khitwa')? true : false;
	$scope.res = {};
	$scope.signin = function (data) {
		User.signin({username : data.username, password: data.password})
		.then(function (resp) {
			if (resp.status !== 200) {
				$scope.res.fail = resp;
			} else {
				$window.localStorage.setItem('com.khitwa',resp.data.token);
				$location.path('/main');
				$scope.loggedIn = $window.localStorage.getItem('com.khitwa')? true : false; 
				$window.location.reload(true);
			}
		})
	};
	$scope.goHome = function () {
		$location.path('/');
	}
	$scope.signout = function () {
		$window.localStorage.removeItem('com.khitwa');
		$location.path('/');
		$scope.loggedIn = $window.localStorage.getItem('com.khitwa')? true : false;
	};
	$scope.signup = function (regData) {
		$scope.loading = true; 
		if (regData.password !== regData.confirm) {
			$scope.res.fail = {data : "Password Doesn't match"}
		} else {
			User.signup(regData)
			.then(function (resp) {
				if (resp.status!= 201) {
					$scope.loading = false;
					$scope.res.fail = resp;
				} else {
					$scope.loading = false;
					$scope.res = {};
					$scope.res.success = resp;
					$timeout(function () {
						$location.path('/main');
					},2000);
				}
			})
		}
	};
})

.controller('OrganizationController', function($scope, Organization, $window) {
	$scope.loggedIn = $window.localStorage.getItem('com.khitwa')? true : false;
	$scope.res = {};
	$scope.signin = function (data) {
		Organization.signin({username : data.username, password : data.password})
		.then(function (resp) {
			if (resp.status !== 200) {
				$scope.res.fail = resp;
			} else {
				$window.localStorage.setItem('com.khitwa',resp.data.token);
				$location.path('/main');
				$scope.loggedIn = $window.localStorage.getItem('com.khitwa')? true : false; 
				$window.location.reload(true);
			}
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
.controller('appCtrl', function($scope, $window, $location ){
    $scope.loggedIn = $window.localStorage.getItem('com.khitwa')? true : false; 
    $scope.logout = function () {
        $window.localStorage.removeItem('com.khitwa');
        $location.path('/');
        $scope.loggedIn = $window.localStorage.getItem('com.khitwa')? true : false;
    }
})
