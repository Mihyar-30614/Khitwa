angular.module('Khitwa.services', [])
var link = 'http://127.0.0.1:8000';
// var link = 'http://khitwaorg.herokuapp.com';
.factory('User', function($http, $window, $location) {
    var singin = function (user) {
        return $http({
            method : 'POST',
            url : link + '/api/user/singin',
            data : user
        })
        .then(function (resp) {
            return resp;
        }).catch(function (error) {
            return error;
        })
    };
    var signup = function (data) {
        return $http ({
            method : 'POST',
            url : link + '/api/user/signup',
            data : data
        })
        .then(function (resp) {
            return resp;
        }).catch(function (error) {
            return error;
        })
    };
    var signout = function () {
        localStorage.clear();
        $window.localStorage.clear();
        $location.path('/');
    };
    var checkAuth = function (token) {
        return $http ({
            method : 'POST',
            url : link + '/api/user/signedin',
            data : token
        })
        .then(function (resp) {
            return resp;
        }).catch(function (error) {
            return error;
        })
    };
    var getall = function () {
        return $http ({
            method : 'GET',
            url : link + '/api/user/getall'
        })
        .then(function (resp) {
            return resp;
        }).catch(function (error) {
            return error;
        })
    };
    var getUser = function (user) {
        return $http ({
            method : 'GET',
            url : link + '/api/user/getUser/'+user
        })
        .then(function (resp) {
            return resp;
        }).catch(function (error) {
            return error;
        })
    };
    var edit = function (data) {
        return $http ({
            method : 'POST',
            url : link + '/api/user/edit',
            data : data
        })
        .then(function (resp) {
            return resp;
        }).catch(function (error) {
            return error;
        })
    };
    var remove = function (password) {
        return $http ({
            method : 'POST',
            url : link + '/api/user/delete',
            data : password
        })
        .then(function (resp) {
            return resp;
        }).catch(function (error) {
            return error;
        })
    };
    var rate = function (id) {
        return $http({
            method : 'POST',
            url : link + '/api/user/rate/'+id
        })
        .then(function (resp) {
            return resp;
        }).catch(function (error) {
            return error;
        })
    };
    var forgot = function (email) {
        return $http ({
            method : 'POST',
            url : link + '/api/user/forgot',
            data : email
        })
        .then(function (resp) {
            return resp;
        }).catch(function (error) {
            return error;
        })
    };
    var checkToken = function (token) {
        return $http({
            method : 'GET',
            url : link + '/api/user/chck/'+token
        })
        .then(function (resp) {
            return resp;
        }).catch(function (error) {
            return error;
        })
    };
    var reset = function (token, password) {
        return $http ({
            method : 'POST',
            url : link + '/api/user/reset/'+token,
            data : password
        })
        .then(function (resp) {
            return resp;
        }).catch(function (error) {
            return error;
        })
    };
    return {
        signin : signin,
        signup : signup,
        signout : signout,
        checkAuth : checkAuth,
        getall : getall,
        getUser : getUser,
        edit : edit,
        remove : remove, 
        rate : rate, 
        forgot : forgot,
        checkToken : checkToken, 
        reset : reset
    };
});
.factory('Organization', function($http, $window, $location){
    var signin = function (data) {
        return $http ({
            method : 'POST',
            url : link + '/api/organization/signin',
            data : data
        })
        .then(function (resp) {
            return resp;
        }).catch(function (error) {
            return error;
        })
    };
    var signup = function (data) {
        return $http({
            method : 'POST',
            url : link + '/api/organization/signup',
            data : data
        })
        .then(function (resp) {
            return resp;
        }).catch(function (error) {
            return error;
        })
    };
    var getByName = function (name) {
        return $http({
            method : 'GET',
            url : link + '/api/organization/getByName/'+name
        })
        .then(function (resp) {
            return resp;
        }).catch(function (error) {
            return error;
        })
    };
    var getall = function () {
        return $http({
            method : 'GET',
            url : link + '/api/organization/all'
        })
        .then(function (resp) {
            return resp;
        }).catch(function (error) {
            return error;
        })
    };
    var edit = function (data) {
        return $http ({
            method : 'POST',
            url : link + '/api/organization/edit',
            data : data 
        })
        .then (function (resp) {
            return resp;
        }).catch(function (error) {
            return error;
        })
    };
    var remove = function (password) {
        return $http ({
            method : 'POST',
            url : link + '/api/organization/delete',
            data : password
        })
        .then(function (resp) {
            return resp;
        }).catch(function (error) {
            return error;
        })
    };
    var checkAuth = function (token) {
        return $http ({
            method : 'POST',
            url : link + '/api/organization/signedin',
            data : token
        })
        .then (function (resp) {
            return resp;
        }).catch(function (error) {
            return error;
        })
    };
    var signout = function () {
        localStorage.clear();
        $window.localStorage.clear();
        $location.path('/');
    };
    var award = function (id) {
        return $http ({
            method : 'POST',
            url : link + '/api/organization/award/'+id
        })
        .then(function (resp) {
            return resp;
        }).catch(function (error) {
            return error;
        })
    }
    var forgot = function (email) {
        return $http({
            method : 'POST',
            url : link + '/api/organization/forgot',
            data : email
        })
        .then(function (resp) {
            return resp;
        }).catch(function (error) {
            return error;
        })
    };
    var checkToken = function (token) {
        return $http({
            method : 'GET',
            url : link + '/api/organization/chck/'+token
        })
        .then(function (resp) {
            return resp;
        }).catch(function (error) {
            return error;
        })
    };
    var reset = function (token, password) {
        return $http ({
            method : 'POST',
            url : link + '/api/organization/reset/'+token,
            data : password
        })
        .then(function (resp) {
            return resp;
        }).catch(function (error) {
            return error;
        })
    };
    return {
        signin : signin,
        signup : signup,
        getByName : getByName,
        getall : getall,
        edit : edit,
        remove : remove,
        checkAuth : checkAuth,
        signout : signout,
        award : award,
        forgot: forgot,
        checkToken : checkToken,
        reset : reset
    }
};
.factory('Opportunity', function(){};
.factory('Opening', function(){};