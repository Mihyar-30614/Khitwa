var app = angular.module('Khitwa', [
    'ionic',
    'ionic-material',
    'Khitwa.controllers', 
    'Khitwa.services',
    'ui.router'
    ]);
app.config(function($stateProvider, $urlRouterProvider, $httpProvider) {
    
    $httpProvider.defaults.headers.common = {};
    $httpProvider.defaults.headers.put = {};
    $httpProvider.defaults.headers.patch = {};

    $stateProvider
    .state('/', {
        url : '/',
        templateUrl : 'js/templates/home.html'
    })
    .state('login',{
        url : '/login',
        templateUrl : 'js/templates/login.html',
        controller : 'UserController'
    })
    .state('organizationLogin',{
        url:'/loginOrg',
        templateUrl : 'js/templates/loginOrg.html',
        controller : 'OrganizationController'
    })
    .state('userSignup',{
        url : '/signup',
        templateUrl : 'js/templates/signup.html',
        controller : 'UserController'
    })
    .state('signupOrganization', {
        url : '/signupOrg',
        templateUrl : 'js/templates/signupOrg.html',
        controller : 'OrganizationController'
    })
    .state('userPwdForgot', {
        url :'/forgot',
        templateUrl : 'js/templates/forgot.html',
        controller : 'UserController'
    })
    .state('orgnizationPwdForgot',{
        url : '/forgotOrg',
        templateUrl : 'js/templates/forgotOrg.html',
        controller : 'OrganizationController'
    })

    $urlRouterProvider.otherwise('/');
    $httpProvider.defaults.transformRequest = function(data) {
        if (data === undefined) { return data; }
        return $.param(data);
    };
    // $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
})
app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})
