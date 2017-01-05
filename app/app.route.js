angular
    .module('awt-cts-client', [
        'ui.router',
        'ngResource',
        'ngAnimate',
        'ngStorage',
        'ngSanitize',
        'ui.bootstrap',
        'angularFileUpload',
        'angular-jwt',
        'mgo-angular-wizard',
        'ngToast',
        'angularTrix'
    ])
    .factory('_', ['$window',
        function ($window) {
            // place lodash include before angular
            return $window._;
        }
    ])
    .constant(
    'CONFIG', {
        'SERVICE_URL': 'http://localhost:8091/api',
        'AUTH_TOKEN': 'X-Auth-Token'
    }
    )
    .config(function ($stateProvider, $urlRouterProvider, $httpProvider) {

        // http://stackoverflow.com/questions/39931983/angularjs-possible-unhandled-rejection-when-using-ui-router

        // $qProvider.errorOnUnhandledRejections(false);


        // For any unmatched url, redirect to /home
        $urlRouterProvider.otherwise("/home");

        // States setup
        $stateProvider
            .state('home', {
                url: "/home",
                data: {
                    pageTitle: 'Početna'
                },
                views: {
                    'content@': {
                        templateUrl: "app/components/home/home.html",
                        controller: "HomeController",
                        controllerAs: "homeVm"
                    }
                }
            })
            .state('about', {
                url: "/about",
                data: {
                    pageTitle: 'Početna'
                },
                views: {
                    'content@': {
                        templateUrl: "app/components/about/about.html",
                        controller: "AboutController",
                        controllerAs: "aboutVm"
                    }
                }
            })
            .state('announcement', {
                url: "/announcement/:announcementId",
                data: {
                    pageTitle: 'Podaci o oglasu'
                },
                views: {
                    'content@': {
                        templateUrl: "app/components/announcement/announcement.html",
                        controller: "AnnouncementController",
                        controllerAs: "announcementVm"
                    }
                }
            })
            .state('addAnnouncement', {
                url: "/addAnnouncement",
                data: {
                    pageTitle: 'Dodavanje oglasa'
                },
                views: {
                    'content@': {
                        templateUrl: "app/components/announcement/announcement-form.html",
                        controller: "AnnouncementFormController",
                        controllerAs: "announcementFormVm"
                    }
                }
            })
            .state('updateAnnouncement', {
                url: "/updateAnnouncement/:announcementId",
                data: {
                    pageTitle: 'Izmjena oglasa'
                },
                views: {
                    'content@': {
                        templateUrl: "app/components/announcement/announcement-form.html",
                        controller: "AnnouncementFormController",
                        controllerAs: "announcementFormVm"
                    }
                }
            })
            .state('company', {
                url: "/company/:companyId",
                data: {
                    pageTitle: 'Podaci o agenciji'
                },
                views: {
                    'content@': {
                        templateUrl: "app/components/company/company.html",
                        controller: "CompanyController",
                        controllerAs: "companyVm"
                    }
                }
            })
            .state('addCompany', {
                url: "/addCompany",
                data: {
                    pageTitle: 'Dodavanje agencije'
                },
                views: {
                    'content@': {
                        templateUrl: "app/components/company/company-form.html",
                        controller: "CompanyFormController",
                        controllerAs: "companyFormVm"
                    }
                }
            })
            .state('updateCompany', {
                url: "/updateCompany/:companyId",
                data: {
                    pageTitle: 'Izmena agencije'
                },
                views: {
                    'content@': {
                        templateUrl: "app/components/company/company-form.html",
                        controller: "CompanyFormController",
                        controllerAs: "companyFormVm"
                    }
                }
            })
            .state('login', {
                url: "/login",
                data: {
                    pageTitle: 'Početna'
                },
                views: {
                    'content@': {
                        templateUrl: "app/components/signing/signing.html",
                        controller: "SigningController",
                        controllerAs: "signingVm"
                    }
                }
            })
            .state('registration-confirm-success', {
                url: '/registration-confirm-success',
                views: {
                    'content@': {
                        templateUrl: "app/components/verification/verification-success.html"
                    }
                }
            })
            .state('registration-wrong-token', {
                url: '/registration-wrong-token',
                views: {
                    'content@': {
                        templateUrl: "app/components/verification/verification-wrong.html",
                        controller: "VerificationTokenController",
                        controllerAs: "verificationTokenVm"
                    }
                }
            })
            .state('registration-token-expired', {
                url: '/registration-token-expired',
                views: {
                    'content@': {
                        templateUrl: "app/components/verification/verification-expired.html",
                        controller: "VerificationTokenController",
                        controllerAs: "verificationTokenVm"
                    }
                }
            });

        $httpProvider.interceptors.push(['$q', '$location', '$localStorage', function ($q, $location, $localStorage) {
            return {
                // Set Header to Request if user is logged
                'request': function (config) {
                    var token = $localStorage.token;

                    if (token != "null") {
                        config.headers['X-Auth-Token'] = token;
                    }
                    return config;
                },
                // When try to get Unauthorized or Forbidden page
                'responseError': function (response) {
                    // If you get Unauthorized on login page you should just write message
                    if ("/login" !== $location.path()) {
                        if (response.status === 401 || response.status === 403) {
                            $location.path('/');
                        }

                        return $q.reject(response);
                    }
                    else {
                        return $q.resolve("Wrong credentials");
                    }
                }
            };
        }]);
    });
