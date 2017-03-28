angular.module('Khitwa.controllers', [])

.controller('UserController', function($scope, User, $window, $location, $timeout) {
	$scope.loggedIn = $window.localStorage.getItem('com.khitwa')? true : false;
	$scope.res = {};
	$scope.signin = function (data) {
		$scope.loading = true;
		User.signin({username : data.username, password: data.password})
		.then(function (resp) {
			if (resp.status !== 200) {
				$scope.loading = false;
				$scope.res.fail = resp.data;
			} else {
				$scope.loading = false;
				$scope.res = {};
				$window.localStorage.setItem('com.khitwa',resp.data.token);
				$scope.res.success = '....Redirecting!';
				$timeout(function () {
					$location.path('/main');
					$scope.loggedIn = $window.localStorage.getItem('com.khitwa')? true : false; 
					$window.location.reload(true);
				},2000)
			}
		})
	};
	$scope.goHome = function () {
		$location.path('/');
	}
	$scope.goLogin = function () {
		$location.path('/login')
	}
	$scope.signout = function () {
		$window.localStorage.removeItem('com.khitwa');
		$location.path('/');
		$scope.loggedIn = $window.localStorage.getItem('com.khitwa')? true : false;
	};
	$scope.signup = function (regData) {
		$scope.loading = true; 
		if (regData.password !== regData.confirm) {
			$scope.loading = false;
			$scope.res.fail = "Password Doesn't match";
		} else {
			User.signup(regData)
			.then(function (resp) {
				if (resp.status!= 201) {
					$scope.loading = false;
					$scope.res.fail = resp.data;
				} else {
					$scope.loading = false;
					$scope.res = {};
					$scope.res.success = resp.data + '....Redirecting!';
					$timeout(function () {
						$location.path('/main');
					},2000);
				}
			})
		}
	};
})

.controller('OrganizationController', function($scope, Organization, $window, $location, $timeout) {
	$scope.loggedIn = $window.localStorage.getItem('com.khitwa')? true : false;
	$scope.res = {};
	$scope.signin = function (data) {
		$scope.loading = true;
		Organization.signin({username : data.username, password : data.password})
		.then(function (resp) {
			if (resp.status !== 200) {
				$scope.loading = false;
				$scope.res.fail = resp.data;
			} else {
				$scope.loading = false;
				$scope.res = {};
				$window.localStorage.setItem('com.khitwa',resp.data.token);
				$scope.res.success = '....Redirecting!';
				$timeout(function () {
					$location.path('/main');
					$scope.loggedIn = $window.localStorage.getItem('com.khitwa')? true : false; 
					$window.location.reload(true);
				}, 2000);
			}
		})
	}
	$scope.signup = function (regData) {
		$scope.loading = true; 
		if (regData.password !== regData.confirm) {
			$scope.loading = false;
			$scope.res.fail = "Password Doesn't match";
		} else {
			Organization.signup(regData)
			.then(function (resp) {
				if (resp.status!= 201) {
					$scope.loading = false;
					$scope.res.fail = resp.data;
				} else {
					$scope.loading = false;
					$scope.res = {};
					$scope.res.success = resp.data + '....Redirecting!';
					$timeout(function () {
						$location.path('/main');
					},2000);
				}
			})
		}
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
