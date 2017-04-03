var app = angular.module('Khitwa', [
    'ionic',
    'ionic-material',
    'ngAnimate',
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
        controller : 'UserController',
        controllerAs : 'User'
    })
    .state('organizationLogin',{
        url:'/loginOrg',
        templateUrl : 'js/templates/loginOrg.html',
        controller : 'OrganizationController',
        controllerAs : 'Organization'
    })
    .state('userSignup',{
        url : '/signup',
        templateUrl : 'js/templates/signup.html',
        controller : 'UserController',
        controllerAs : 'User'
    })
    .state('signupOrganization', {
        url : '/signupOrg',
        templateUrl : 'js/templates/signupOrg.html',
        controller : 'OrganizationController',
        controllerAs : 'Organization'
    })
    .state('userPwdForgot', {
        url :'/forgot',
        templateUrl : 'js/templates/forgot.html',
        controller : 'UserController',
        controllerAs : 'User'
    })
    .state('orgnizationPwdForgot',{
        url : '/forgotOrg',
        templateUrl : 'js/templates/forgotOrg.html',
        controller : 'OrganizationController',
        controllerAs : 'Organization'
    })
    .state('main',{
        url : '/main',
        templateUrl : 'js/templates/main.html'
    })
    .state('facebook',{
        url : '/facebook/:token',
        templateUrl : 'js/templates/main.html',
        controller : 'FacebookCtrl',
        controllerAs : 'Facebook'
    })
    .state('pwdreset',{
        url : '/user/reset/:token',
        templateUrl : 'js/templates/reset.html',
        controller: 'UserController',
        controllerAs: 'User'
    })
    .state('pwdResetFail',{
        url : '/reseterror',
        templateUrl : 'js/templates/reseterror.html'
    })
    .state('pwdResetOrg',{
        url : '/organization/reset/:token',
        templateUrl : 'js/templates/resetOrg.html',
        controller: 'OrganizationController',
        controllerAs : 'Organization'
    })

    $urlRouterProvider.otherwise('/');
    $httpProvider.interceptors.push('AttachToken');
    $httpProvider.defaults.transformRequest = function(data) {
        if (data === undefined) { return data; }
        return $.param(data);
    };
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
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