angular.module('Khitwa.controllers', ['Khitwa.services'])

.controller('UserController', function($scope, User, $window, $location, $timeout, $rootScope, $ionicScrollDelegate) {
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
		$scope.loggedIn = $window.localStorage.getItem('com.khitwa')? true : false;
		$location.path('/');
	};
	$scope.signup = function (regData) {
		var valid = User.validate(regData.username, regData.password, regData.email);
		if (valid.valid) {
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
		}else{
			$ionicScrollDelegate.scrollBottom();
			$scope.loading = false;
			$scope.res.fail = valid.message;
		}
	};
	$(document).ready(function(){
	    $('#submit').attr('disabled', true);
	    $('#signup').keyup(function () {
			var disable = false;
		    $('.input').each(function () {
		    	if($(this).val() == '') { disable = true };
		    });
		    $('#submit').prop('disabled', disable);
	    })
	});
})

.controller('OrganizationController', function($scope, Organization, $window, $location, $timeout, $rootScope, User, $ionicScrollDelegate) {
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
	$scope.signup = function (regData) {
		var valid = User.validate(regData.username, regData.password, regData.email);
		if (valid.valid) {
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
		}else{
			$ionicScrollDelegate.scrollBottom();
			$scope.loading = false;
			$scope.res.fail = valid.message;
		}
	};
	$(document).ready(function(){
	    $('#submit1').attr('disabled', true);
	    $('#signup1').keyup(function () {
			var disable = false;
		    $('.input1').each(function () {
		    	if($(this).val() == '') { disable = true };
		    });
		    $('#submit1').prop('disabled', disable);
	    })
	});
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