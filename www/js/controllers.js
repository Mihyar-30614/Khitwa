angular.module('Khitwa.controllers', ['Khitwa.services'])

.controller('UserController', function($scope, User, $window, $location, $timeout, $rootScope, $ionicScrollDelegate, $stateParams, Organization) {
	$scope.loggedIn = $window.localStorage.getItem('com.khitwa')? true : false;
	$scope.isOrg = $window.localStorage.getItem('Organization')? true : false;
	$scope.res = {};
	$scope.toggle = false;
	$scope.user = $window.localStorage.getItem('user')? JSON.parse($window.localStorage.user) : {};
	$rootScope.$on('$stateChangeStart', function () {
		// using stateChangeStart not $routeChangeStart because I use ui-router
		$scope.isOrg = $window.localStorage.getItem('Organization')? true : false;
		$scope.loggedIn = $window.localStorage.getItem('com.khitwa')? true : false;
		// if logged send info to backend and get user/organization info here and add user/organization info to $scope
		$scope.user = $window.localStorage.getItem('user')? JSON.parse($window.localStorage.user) : {};
		$scope.organization = $window.localStorage.getItem('organization')? JSON.parse($window.localStorage.organization) : {};
	});
	$(document).ready(function(){
	    $('#submit').attr('disabled', true);
	    $('#login-form1').keyup(function () {
			var disable = false;
		    $('.input').each(function () {
		    	if($(this).val() == '') { disable = true };
		    });
		    $('#submit').prop('disabled', disable);
	    })
	});
	$scope.toUser = function () {
		$scope.res = {};
		$scope.toggle = false;
		$('#login-form1').trigger('reset');
		$('.toUser').attr('class', 'button button-large button-assertive toUser');
		$('.toOrg').attr('class', 'button button-large button-outline button-assertive toOrg');
		$('.user').attr('class', 'login-form user');
		$('.org').attr('class','login-form hidden org');
		$('#submit').attr('disabled', true);
	    $('#login-form1').keyup(function () {
			var disable = false;
		    $('.input').each(function () {
		    	if($(this).val() == '') { disable = true };
		    });
		    $('#submit').prop('disabled', disable);
	    })
	};
	$scope.toOrg = function () {
		$scope.res = {};
		$scope.toggle = true;
		$('#signup1').trigger('reset');
		$('.toUser').attr('class', 'button button-large button-outline button-assertive toUser');
		$('.toOrg').attr('class', 'button button-large button-assertive toOrg');
		$('.user').attr('class','login-form hidden user');
		$('.org').attr('class','login-form org');
	    $('#submit1').attr('disabled', true);
	    $('#signup1').keyup(function () {
			var disable = false;
		    $('.input1').each(function () {
		    	if($(this).val() == '') { disable = true };
		    });
		    $('#submit1').prop('disabled', disable);
	    })
	};
	$scope.signin = function (data) {
		$scope.res = {};
		$scope.loading = true;
		if($scope.toggle){
			 var x = Organization.signin({username : data.username, password : data.password})
		} else {
			var x = User.signin({username : data.username, password: data.password})
		}
		x.then(function (resp) {
			if (resp.status !== 200) {
				$scope.loading = false;
				$scope.res.fail = resp.data;
				$ionicScrollDelegate.scrollBottom();
			} else {
				$scope.loading = false;
				$window.localStorage.setItem('com.khitwa',resp.data.token);
				$scope.setWindowUser(resp.data);
				if($scope.toggle){$window.localStorage.setItem('Organization',true);}
				$scope.res.success = '....Redirecting!';
				$timeout(function () {
					$location.path('/main');
					$scope.res = {};
				},2000)
			}
		})
	};
	$scope.setWindowUser = function (resp) {
		if ($scope.toggle) {
			Organization.getByName(resp.username).then(function (res) {
				$window.localStorage['organization'] = angular.toJson(res.data);
			})
		} else {		
			User.getUser(resp.username).then(function (res) {
				$window.localStorage['user'] = angular.toJson(res.data);
			})
		}
	};
	$scope.facebook = function () {
		$window.location = $window.location.protocol + '//' + $window.location.host + '/auth/facebook';
	};
	$scope.twitter = function () {
		$window.location = $window.location.protocol + '//' + $window.location.host + '/auth/twitter';
	};
	$scope.google = function () {
		$window.location = $window.location.protocol + '//' + $window.location.host + '/auth/google';
	};
	$scope.goProfile = function () {
		$location.path('/profile');
	}
	$scope.goHome = function () {
		$location.path('/');
	};
	$scope.goLogin = function () {
		$location.path('/login')
	};
	$scope.signout = function () {
		$window.localStorage.removeItem('com.khitwa');
		$window.localStorage.removeItem('Organization');
		$window.localStorage.removeItem('user');
		$scope.loggedIn = $window.localStorage.getItem('com.khitwa')? true : false;
		$scope.loggedIn = $window.localStorage.getItem('Organization')? true : false;
		$scope.isOrg = false;
		$location.path('/');
	};
	$scope.signup = function (regData) {
		$scope.res = {};
		$scope.loading = true;
		var valid = User.validate(regData.username, regData.password, regData.email);
		if (valid.valid) {
			if ($scope.toggle) {
				var x = Organization.signup(regData)
			} else {
				var x = User.signup(regData)
			}
			x.then(function (resp) {
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
	$scope.resetRequest = function (email) {
		$scope.res = {};
		$scope.loading = true;
		if ($scope.toggle) {
			var x = Organization.forgot({email: email});
		} else {
			var x = User.forgot({email: email});
		}
		x.then(function (resp) {
			if (resp.status !== 200) {
				$scope.loading = false;
				$scope.res.fail = resp.data;
			} else {
				$scope.loading = false;
				$scope.res.success = resp.data;
				$timeout(function () {
					$location.path('/login');
					$scope.res = {};
				},5000);
			}
		})
	};
	$scope.reset = function (data) {
		var token = $stateParams.token;
		$scope.res = {};
		$scope.loading = true;
		if (data.password === data.confirm) {
			var valid = User.validate('john', data.password, 'example@someone.ca');
			if (valid.valid) {
				User.reset({token: token, password : data.password}).then(function (resp) {
					if (resp.status !== 201) {
						$scope.loading = false;
						$scope.res.fail = resp.data;
					} else {
						$scope.loading = false;
						$scope.res.success = resp.data;
						$timeout(function () {
							$location.path('/login');
							$scope.res = {};
						},5000);
					}
				})
			} else {
				$scope.loading = false;
				$scope.res.fail = valid.message;
			}
		} else {
			$scope.res.fail = 'Password does not match!';
			$scope.loading = false;
		}	
	};
})

.controller('OrganizationController', function($scope, Organization, $window, $location, $timeout, $rootScope, User, $ionicScrollDelegate, $stateParams) {
	$scope.organization = $window.localStorage.getItem('organization')? JSON.parse($window.localStorage.organization) : {};
	$scope.isOrg = $window.localStorage.getItem('Organization')? true : false;
	$scope.loggedIn = $window.localStorage.getItem('com.khitwa')? true : false;
	$rootScope.$on('$stateChangeStart', function () {
		// using stateChangeStart not $routeChangeStart because I use ui-router
		$scope.isOrg = $window.localStorage.getItem('Organization')? true : false;
		$scope.loggedIn = $window.localStorage.getItem('com.khitwa')? true : false;
		// if logged send info to backend and get user/organization info here and add user/organization info to $scope
		$scope.organization = $window.localStorage.getItem('organization')? JSON.parse($window.localStorage.organization) : {};
	});
	$scope.resetOrg = function (data) {
		var token = $stateParams.token;
		$scope.res = {};
		$scope.loading = true;
		if (data.password === data.confirm) {
			var valid = User.validate('john', data.password, 'example@someone.ca');
			if (valid.valid) {
				Organization.reset({token: token, password : data.password}).then(function (resp) {
					if (resp.status !== 201) {
						$scope.loading = false;
						$scope.res.fail = resp.data;
					} else {
						$scope.loading = false;
						$scope.res.success = resp.data;
						$timeout(function () {
							$location.path('/login');
							$scope.res = {};
						},5000);
					}
				})
			} else {
				$scope.loading = false;
				$scope.res.fail = valid.message;
			}
		} else {
			$scope.res.fail = 'Password does not match!';
			$scope.loading = false;
		}	
	};
	$scope.goOrgProfile = function () {
		$location.path('/orgProfile');
	}
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});
})

.controller('SocialCtrl', function ($stateParams, $location, $window, User) {
	if ($window.location.pathname === '/socialerror') {
		$scope.res.fail = 'Login Failed';
	} else {	
		$window.localStorage.setItem('com.khitwa', $stateParams.token);
		User.checkAuth({token : $stateParams.token}).then(function (resp) {
			$window.localStorage['user'] = angular.toJson(resp.data);
		});
		$location.path('/main');
	}
})