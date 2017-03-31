angular.module('Khitwa.controllers', ['Khitwa.services'])

.controller('UserController', function($scope, User, $window, $location, $timeout, $rootScope) {
	$scope.loggedIn = $window.localStorage.getItem('com.khitwa')? true : false;
	$scope.res = {};
	$rootScope.$on('$stateChangeStart', function () {
		// using stateChangeStart not $routeChangeStart because I use ui-router
		$scope.loggedIn = $window.localStorage.getItem('com.khitwa')? true : false;
		// if logged send info to backend and get user info here
		// add user info to $scope
	});
	$scope.signin = function (data) {
		$scope.res = {};
		$scope.loading = true;
		User.signin({username : data.username, password: data.password})
		.then(function (resp) {
			if (resp.status !== 200) {
				$scope.loading = false;
				$scope.res.fail = resp.data;
			} else {
				$scope.loading = false;
				$window.localStorage.setItem('com.khitwa',resp.data.token);
				$scope.res.success = '....Redirecting!';
				$timeout(function () {
					$location.path('/main');
					$scope.res = {};
				},2000)
			}
		})
	};
	$scope.facebook = function () {
		$window.location = $window.location.protocol + '//' + $window.location.host + '/auth/facebook';
	}
	$scope.goHome = function () {
		$location.path('/');
	}
	$scope.goLogin = function () {
		$location.path('/login')
	}
	$scope.signout = function () {
		$window.localStorage.removeItem('com.khitwa');
		$location.path('/');
	};
	$scope.vData = function (regData) {
		var valid = true;
		$scope.res = {};
		$scope.loading = true; 
		if (regData.password.length < 8) {
			$scope.loading = false;
			$scope.res.fail = "Password Should be at Least 8 Character Long"
			valid = false;
		} else if (regData.password !== regData.confirm) {
			$scope.loading = false;
			$scope.res.fail = "Password Doesn't match";
			valid = false;
		}else if (regData.email.indexOf('@')<0 || regData.email.indexOf('.')<0) {
			$scope.loading = false;
			$scope.res.fail = "Please Enter Valid Email Address!";
			valid = false;
		}
		return valid
	}
	$scope.signup = function (regData) {
		if ($scope.vData(regData)) {
			User.signup(regData)
			.then(function (resp) {
				if (resp.status!= 201) {
					$scope.loading = false;
					$scope.res.fail = resp.data;
				} else {
					$scope.loading = false;
					$scope.res.success = resp.data + '....Redirecting!';
					$timeout(function () {
						$location.path('/main');
						$scope.res = {};
					},2000);
				}
			})
		}
	};
})

.controller('OrganizationController', function($scope, Organization, $window, $location, $timeout, $rootScope, User) {
	$scope.loggedIn = $window.localStorage.getItem('com.khitwa')? true : false;
	$rootScope.$on('$stateChangeStart', function () {
		// using stateChangeStart not $routeChangeStart because I use ui-router
		$scope.loggedIn = $window.localStorage.getItem('com.khitwa')? true : false;
	})
	$scope.res = {};
	$scope.signin = function (data) {
		$scope.res = {};
		$scope.loading = true;
		Organization.signin({username : data.username, password : data.password})
		.then(function (resp) {
			if (resp.status !== 200) {
				$scope.loading = false;
				$scope.res.fail = resp.data;
			} else {
				$scope.loading = false;
				$window.localStorage.setItem('com.khitwa',resp.data.token);
				$scope.res.success = '....Redirecting!';
				$timeout(function () {
					$location.path('/main');
					$scope.res = {};
				}, 2000);
			}
		})
	};
	$scope.vData = function (regData) {
		var valid = true;
		$scope.res = {};
		$scope.loading = true; 
		if (regData.password.length < 8) {
			$scope.loading = false;
			$scope.res.fail = "Password Should be at Least 8 Character Long"
			valid = false;
		} else if (regData.password !== regData.confirm) {
			$scope.loading = false;
			$scope.res.fail = "Password Doesn't match";
			valid = false;
		}else if (regData.email.indexOf('@')<0 || regData.email.indexOf('.')<0) {
			$scope.loading = false;
			$scope.res.fail = "Please Enter Valid Email Address!";
			valid = false;
		}
		return valid
	};
	$scope.signup = function (regData) {
		if ($scope.vData(regData)) {
			Organization.signup(regData)
			.then(function (resp) {
				if (resp.status!= 201) {
					$scope.loading = false;
					$scope.res.fail = resp.data;
				} else {
					$scope.loading = false;
					$scope.res.success = resp.data + '....Redirecting!';
					$timeout(function () {
						$location.path('/main');
						$scope.res = {};
					},2000);
				}
			})
		}
	};
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});
})

.controller('FacebookCtrl', function ($stateParams, $location, $window) {
	$window.localStorage.setItem('com.khitwa', $stateParams.token);
	$location.path('/main')
})