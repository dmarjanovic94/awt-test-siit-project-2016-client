(function() {
    'use strict';

    angular
        .module('awt-cts-client')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['$state', '$timeout', '$location', '$log', '_', 'LanguageUtil', 'announcementService', 'LinkParser', 'pagingParams', 'paginationConstants'];

    function HomeController($state, $timeout, $location, $log, _, LanguageUtil, announcementService, LinkParser, pagingParams, paginationConstants) {
        var homeVm = this;

        homeVm.announcements = {};

        // Pagination init params
        homeVm.loadPage = loadPage;
        homeVm.predicate = pagingParams.predicate;
        homeVm.reverse = pagingParams.ascending;
        homeVm.transition = transition;
        homeVm.itemsPerPage = 10;
        homeVm.clear = clear;
        homeVm.sort = sort;

        homeVm.getAllAnnouncements = getAllAnnouncements;
        homeVm.searchAnnouncements = searchAnnouncements;
        homeVm.searchAnnouncementsInArea = searchAnnouncementsInArea;
        homeVm.find = find;
        homeVm.initMap = initMap;
        homeVm.showMapResult = showMapResult;
        homeVm.translateType = translateType;

        activate();

        function activate () {

            homeVm.paginationView = true;

            if (_.isNull(pagingParams.search)) {
                homeVm.getAllAnnouncements();
            }
            else {
                homeVm.currentSearch = pagingParams.search;
                homeVm.search = {};

                _.forEach(_.split(homeVm.currentSearch, "&"), function(param) {
                    if (!_.isEmpty(param)) {
                        var splitted = _.split(param, "=");

                        var value = _.parseInt(splitted[1]);
                        if (_.isNaN(value)) {
                            value = splitted[1];
                        }
                        
                        homeVm.search[splitted[0]] = value;
                    }
                });

                homeVm.searchAnnouncements(pagingParams.search);
            }
        }

        function getAllAnnouncements() {
            announcementService.getAnnouncements(pagingParams.page - 1, homeVm.itemsPerPage, homeVm.sort())
                .then(function(response) {
                    var headers = response.headers;

                    homeVm.announcements = response.data;
                    _.forEach(homeVm.announcements, function(announcement) {
                        formatAnnouncement(announcement);
                    });
                    homeVm.totalItems = response.headers('X-Total-Count');

                    homeVm.links = LinkParser.parse(headers('Link'));
                    homeVm.totalItems = headers('X-Total-Count');
                    homeVm.queryCount = homeVm.totalItems;
                    homeVm.page = pagingParams.page;
                })
                .catch(function (error) {
                    $log.error(error);
                });
        }

        function loadPage(page) {
            homeVm.page = page;
            homeVm.transition();
        }

        function transition() {
            $state.transitionTo($state.$current, {
                page: homeVm.page,
                sort: homeVm.predicate + ',' + (homeVm.reverse ? 'asc' : 'desc'),
                search: homeVm.currentSearch
            });
        }

        function clear() {
            homeVm.links = null;
            homeVm.page = 1;
            homeVm.predicate = 'id';
            homeVm.reverse = true;
            homeVm.transition();
        }

        function sort() {
            var result = [homeVm.predicate + ',' + (homeVm.reverse ? 'asc' : 'desc')];

            if (homeVm.predicate !== 'id') {
                result.push('id');
            }
            return result;
        }

        function initMap() {
            var map = new google.maps.Map(document.getElementById('map'), {
                center: {lat: 45.252711, lng: 19.841499},
                zoom: 15
            });
            var geocoder = new google.maps.Geocoder();

            var tooltip = new google.maps.InfoWindow({map: map});

            $timeout(function() {
                // Refresh map and find center
                google.maps.event.trigger(map, 'resize');

                // Try HTML5 geolocation.
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function(position) {
                        var yourPosition = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };

                        tooltip.setPosition(yourPosition);
                        tooltip.setContent('Vi ste ovdje! :)');
                        map.setCenter(yourPosition);

                    }, function() {
                        handleLocationError(true, tooltip, map.getCenter());
                    });
                } else {
                    // Browser doesn't support Geolocation
                    handleLocationError(false, tooltip, map.getCenter());
                }
            }, 500);

            google.maps.event.addListener(map, 'bounds_changed', function() {
                var ne = map.getBounds().getNorthEast();
                var sw = map.getBounds().getSouthWest();

                homeVm.searchAnnouncementsInArea(ne, sw, map);
            });
        }

        function geocodeAddress(geocoder, resultsMap) {
            var address = 'Petra Drapsina 5 Novi Sad Serbia';

            geocoder.geocode({ 'address': address }, function(results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    resultsMap.setCenter(results[0].geometry.location);
                    var marker = new google.maps.Marker({
                        map: resultsMap,
                        position: results[0].geometry.location
                    });
                } else {
                    $log.error('Geocode was not successful for the following reason: ' + status);
                }
            });
        }

        function loadPage(page) {
            homeVm.page = page;
            homeVm.transition();
        }

        function find() {
            var searchTerm = "";

            _.forEach(homeVm.search, function(value, key) {
                if (value !== '' && value !== false && !_.isUndefined(value) && !_.isNull(value)) {
                    searchTerm += key + "=" + value + "&";
                }
            });

            homeVm.currentSearch = searchTerm;
            pagingParams.page = 1;
            pagingParams.search = searchTerm;
            homeVm.paginationView = true;

            homeVm.searchAnnouncements(searchTerm);
        }

        function searchAnnouncements(searchTerm) {
            announcementService.searchAnnouncements(searchTerm, pagingParams.page - 1, homeVm.itemsPerPage, homeVm.sort())
                .then(function(response) {
                    var headers = response.headers;

                    homeVm.announcements = response.data;
                    _.forEach(homeVm.announcements, function(announcement) {
                        formatAnnouncement(announcement);
                    });
                    homeVm.totalItems = response.headers('X-Total-Count');

                    homeVm.links = LinkParser.parse(headers('Link'));
                    homeVm.totalItems = headers('X-Total-Count');
                    homeVm.queryCount = homeVm.totalItems;

                    homeVm.page = pagingParams.page;

                    homeVm.transition();
                })
                .catch(function (error) {
                    $log.error(error);
                });
        }

        function searchAnnouncementsInArea(ne, sw, map) {
            announcementService.getAnnouncementsInArea(ne, sw)
                .then(function (response) {
                    var announcements = response.data;

                    homeVm.mapAnnouncements = announcements;

                    _.forEach(response.data, function(announcement) {

                        formatAnnouncement(announcement);

                        var location = announcement.realEstate.location;
                        var position = {
                          lat: location.latitude,
                          lng: location.longitude
                        };

                        var marker = new google.maps.Marker({
                            position: position,
                            map: map,
                            title: announcement.name
                        });

                        var dialog = new google.maps.InfoWindow({
                            content: formatContent(announcement)
                        })

                        marker.addListener('click', function() {
                            dialog.open(map, marker);
                        });
                    });
                })
                .catch(function (error) {
                    $log.error(error);
                });
        }

        function showMapResult() {
            homeVm.announcements = homeVm.mapAnnouncements;
            homeVm.paginationView = false;
        }

        function formatContent(announcement) {
            return '<div class="media" style="width: 200px! important;">' +
              '<div class="media-body">' +
                '<h4 class="media-heading">' + announcement.name + '</h4>' +
                '<p>' + announcement.description + '</p>' +
                '<h6>' + announcement.price + ' RSD </h6>'
              '</div>' +
            '</div>';
        }

        function handleLocationError(browserHasGeolocation, tooltip, pos) {
            var content = (browserHasGeolocation) ? "Ne dozvoljavate Vaše lociranje." : "Vaš pretraživač ne podržava ovu uslugu.";

            tooltip.setPosition(pos);
            tooltip.setContent(content);
        }

        function translateType(type) {
            return LanguageUtil.translateAdvertisementType(type);
        }

        function formatAnnouncement(announcement) {
            var momentExpDate = moment(new Date(announcement.expirationDate));
            announcement.expiredMessage = momentExpDate.fromNow();
            if (momentExpDate.isAfter(moment())) {
                announcement.expirationClass = 'color-success';
                // check if expiration date is close (by 7 days)
                if (moment(new Date(announcement.expirationDate)).subtract(7, 'days').isBefore(moment())) {
                    announcement.expirationClass = 'color-warning';
                };
            }
            else {
                announcement.expirationClass = 'color-danger';
            };
        }
    }
})();