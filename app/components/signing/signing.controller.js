angular
    .module('awt-cts-client')
    .controller('SigningController', SigningController);

SigningController.$inject = ['$http', '$window', 'signingService', 'CONFIG'];

function SigningController($http, $window, signingService, CONFIG) {
    var signingVm = this;

    // Setting background image for signing page
    $(".login-page").backstretch("assets/img/login_background.jpg");

    // Variable binders
    signingVm.credentials = {};
    signingVm.registrationUser = {};
    signingVm.dataLoading = false;

    // Methods
    signingVm.login = login;
    signingVm.register = register;

    function login() {
        signingVm.dataLoading = true;
        signingService.auth(signingVm.credentials.email, signingVm.credentials.password)
            .then(function(response) {
                var token = response.data.token;

                if (token !== undefined) {
                    $http.defaults.headers.common[CONFIG.AUTH_TOKEN] = token;
                    $window.localStorage.setItem('AUTH_TOKEN', token);
                    console.log("Successfully logged in.")
                } else {
                    signingVm.credentials.password = '';
                }
                signingVm.dataLoading = false;
            });
    };

    function register() {
        console.log(signingVm.registrationUser);
        signingService.register(signingVm.registrationUser)
            .then(function(registeredUser) {
                console.log(registeredUser);
                signingVm.registrationUser = {};
            });
    };

}