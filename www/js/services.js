var link = 'http://127.0.0.1:8000';
// var link = 'http://khitwaorg.herokuapp.com';
angular.module('Khitwa.services', [])
.factory('User', function($http, $window, $location) {
    var signin = function (user) {
        return $http({
            method : 'POST',
            url : link + '/api/user/signin',
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
    var reset = function (data) {
        return $http ({
            method : 'POST',
            url : link + '/api/user/reset/'+data.token,
            data : data
        })
        .then(function (resp) {
            return resp;
        }).catch(function (error) {
            return error;
        })
    };
    var validate = function (username, password, email, confirm) {
        var result = [];
        var username = username === undefined? '' : username;
        var password = password === undefined? '' : password;
        var email    = email    === undefined? '' : email;
        var usr = username.toLowerCase();
        var pass = password.toLowerCase();
        var index = pass.indexOf(usr[0]);
        var same = false;
        var count = 0 ;
        if (index > -1) {
            for (var i = index; i < usr.length; i++) {
                if (pass[i] === usr[count]){same = true; count++;}else{ same = false; }
            }
        }
        if(username.length < 3) result.push( { message: 'At Least 3 Characters Long!', type: 'username' } );
        if(username.indexOf(' ')>-1) result.push( { message: 'No Spaces!', type: 'username'} );
        if(!/[a-z]/.test(username)) result.push( { message: 'At Least One Letter!', type: 'username' } );
        if(password.length < 6 || password.length > 48) result.push( { message : 'Must be 6 - 24 characters long.', type: 'password' } );
        if (password !== confirm) result.push( { message : 'Password Does Not Match!', type : 'confirm' } );
        if(same) result.push( { message : 'Can Not Contain Username', type : 'password' } );
        if (email.indexOf('@')<0 || email.indexOf('.')<0) result.push( { message: 'Email Address Invalid', type: 'email' } );
        if(!/[a-z]/.test(password)) result.push( { message: 'At Least One Lowercase Character!', type: 'password' } );
        if(!/[A-Z]/.test(password)) result.push( { message: 'At Least One Uppercase Character!', type: 'password' } );
        if(!/[0-9]/.test(password)) result.push( { message: 'At Least One Number!', type: 'password' } );
        if(!/[!#@$%^&*()_+]/.test(password)) result.push( { message: 'At Least One Special Character!', type: 'password'} );
        return result
    };
    var checkusername = function (data) {
        return $http({
            method : 'POST',
            url : link + '/api/user/checkusername',
            data : data
        })
        .then(function (resp) {
            return resp;
        }).catch(function (error) {
            return error;
        })
    };
    var checkemail = function (data) {
        return $http({
            method : 'POST',
            url : link + '/api/user/checkemail',
            data : data
        })
        .then(function (resp) {
            return resp;
        }).catch(function (error) {
            return error;
        })
    }
    return {
        signin : signin,
        signup : signup,
        checkAuth : checkAuth,
        getall : getall,
        getUser : getUser,
        edit : edit,
        remove : remove, 
        rate : rate, 
        forgot : forgot,
        reset : reset,
        validate : validate,
        checkusername : checkusername, 
        checkemail : checkemail
    };
})
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
    var reset = function (data) {
        return $http ({
            method : 'POST',
            url : link + '/api/organization/reset/'+data.token,
            data : data
        })
        .then(function (resp) {
            return resp;
        }).catch(function (error) {
            return error;
        })
    };
    var checkOrgUsername = function (data) {
        return $http({
            method : 'POST',
            url : link + '/api/organization/checkusername',
            data : data
        })
        .then(function (resp) {
            return resp;
        }).catch(function (error) {
            return error;
        })
    };
    var checkOrgEmail = function (data) {
        return $http({
            method : 'POST',
            url : link + '/api/organization/checkemail',
            data : data
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
        award : award,
        forgot: forgot,
        reset : reset, 
        checkOrgUsername : checkOrgUsername,
        checkOrgEmail : checkOrgEmail
    }
})
.factory('Opportunity', function($http, $window, $location){
    var add = function (data) {
        return $http({
            method : 'POST',
            url : link + '/api/opportunity/add',
            data : data
        })
        .then(function (resp) {
            return resp;
        }).catch(function (error) {
            return resp;
        })
    };
    var close = function (id) {
        return $http ({
            method : 'POST',
            url : link + '/api/opportunity/close/'+id
        })
        .then(function (resp) {
            return resp;
        }).catch(function (error) {
            return error;
        })
    };
    var reopen = function (id) {
        return $http({
            method : 'POST',
            url : link + '/api/opportunity/reopen/'+id
        })
        .then(function (resp) {
            return resp;
        }).catch(function (error) {
            return error;
        })
    }
    var getall = function () {
        return $http({
            method : 'GET',
            url : link + '/opportunity/getall'
        })
        .then(function (resp) {
            return resp;
        }).catch(function (error) {
            return error;
        })
    };
    var edit = function (id, data) {
        return $http({
            method : 'POST',
            url : link + '/api/opportunity/edit/'+id,
            data : data
        })
        .then(function (resp) {
            return resp;
        }).catch(function (error) {
            return error;
        })
    };
    var currentOpenings = function (id) {
        return $http({
            method : 'GET',
            url : link + '/api/opportunity/currentopenings/'+id
        })
        .then(function (resp) {
            return resp;
        }).catch(function (error) {
            return error;
        })
    };
    var closedOpenings = function (id) {
        return $http({
            method : 'GET',
            url : link + '/api/opportunity/closedopenings/'+id
        })
        .then(function (resp) {
            return resp;
        }).catch(function (error) {
            return error;
        })
    };
    var get = function (id) {
        return $http({
            method : 'GET',
            url : link + '/api/opportunity/get/'+id
        })
        .then(function (resp) {
            return resp;
        }).catch(function (error) {
            return error;
        })
    };
    var byOrgID = function (id) {
        return $http({
            method : 'GET',
            url : link + '/api/opportunity/organization/'+id
        })
        .then(function (resp) {
            return resp;
        }).catch(function (error) {
            return error;
        })
    };
    var remove = function (id) {
        return $http({
            method : 'POST',
            url : link + '/api/opportunity/delete/'+id
        })
        .then(function (resp) {
            return resp;
        }).catch(function (error) {
            return error
        })
    };

    return {
        add : add,
        close : close,
        reopen : reopen,
        getall : getall,
        edit : edit,
        currentOpenings : currentOpenings,
        closedOpenings : closedOpenings,
        get : get,
        byOrgID : byOrgID,
        remove : remove
    };
})
.factory('Opening', function($http, $window, $location){
    var add = function (id, data) {
        return $http({
            method : 'POST',
            url : link + '/api/opening/add/'+id,
            data : data
        })
        .then(function (resp) {
            return resp;
        }).catch(function (error) {
            return error
        })
    };
    var getall = function () {
        return $http({
            method : 'GET',
            url : link + '/api/opening/getall'
        })
        .then(function (resp) {
            return resp;
        })
        .catch(function (error) {
            return error;
        })
    };
    var close = function (id) {
        return $http({
            method : 'POST',
            url : link + '/api/opening/close/'+id
        })
        .then(function (resp) {
            return resp;
        })
        .catch(function (error) {
            return error;
        })
    };
    var remove = function (id) {
        return $http({
            method : 'POST',
            url : link + '/api/opening/delete/'+id
        })
        .then(function (resp) {
            return resp;
        })
        .catch(function (error) {
            return error;
        })
    };
    var edit = function (id, data) {
        return $http({
            method : 'POST',
            url : link + '/api/opening/edit/'+id,
            data : data
        })
        .then(function (resp) {
            return resp;
        })
        .catch(function (error) {
            return error;
        })
    };
    var apply = function (id) {
        return $http({
            method : 'POST',
            url : link + '/api/opening/apply/'+id
        })
        .then(function (resp) {
            return resp;
        })
        .catch(function (error) {
            return error;
        })
    };
    var approve = function (id) {
        return $http ({
            method : 'POST',
            url : link + '/api/opening/approve/'+id
        })
        .then(function (resp) {
            return resp;
        })
        .catch(function (error) {
            return error;
        })
    };
    var reject = function (id) {
        return $http({
            method : 'POST',
            url : link + '/api/opening/reject/'+id
        })
        .then(function (resp) {
            return resp;
        })
        .catch(function (error) {
            return error;
        })
    };
    var getone = function (id) {
        return $http({
            method : 'GET',
            url : linl + '/api/opening/getOne/'+id
        })
        .then(function (resp) {
            return resp;
        })
        .catch(function (error) {
            return error;
        })
    };
    var reopen = function (id) {
        return $http({
            method : 'POST',
            url : link + '/api/opening/reopen/'+id
        })
        .then(function (resp) {
            return resp;
        })
        .catch(function (error) {
            return error;
        })
    };
    
    return {
        add : add,
        getall : getall,
        close : close,
        remove : remove,
        edit : edit,
        apply : apply,
        approve : approve,
        reject : reject,
        getone : getone,
        reopen : reopen
    };
})
.factory('AttachToken', function ($window) {
    var attach = function (config) {
        var jwt = $window.localStorage.getItem('com.khitwa');
        if(jwt){
            config.headers['x-access-token'] = jwt;
        }
        return config;
    }
    return {
        attach : attach
    }
})