(function() {
    'use strict';

    angular
        .module('awt-cts-client')
        .controller('CompaniesController', CompaniesController);

    CompaniesController.$inject = ['$state', '$log', 'companyService', 'LinkParser', 'pagingParams', 'paginationConstants'];

    function CompaniesController($state, $log, companyService, LinkParser, pagingParams, paginationConstants) {
        var vm = this;

        vm.loadPage = loadPage;
        vm.predicate = pagingParams.predicate;
        vm.reverse = pagingParams.ascending;
        vm.transition = transition;
        vm.itemsPerPage = paginationConstants.itemsPerPage;
        vm.clear = clear;
        vm.activate = activate;

        activate();

        function activate() {
            companyService.getCompanies(pagingParams.page - 1, vm.itemsPerPage, sort())
            .then(function(response) {
                var headers = response.headers;

                vm.links = LinkParser.parse(headers('Link'));
                vm.totalItems = headers('X-Total-Count');
                vm.queryCount = vm.totalItems;
                vm.companies = response.data;
                vm.page = pagingParams.page;
            })
            .catch(function (error) {
                $log.error(error);
            });

            function sort() {
                var result = [vm.predicate + ',' + (vm.reverse ? 'asc' : 'desc')];
                if (vm.predicate !== 'id') {
                    result.push('id');
                }
                return result;
            }
        }

        function loadPage(page) {
            vm.page = page;
            vm.transition();
        }

        function transition() {
            $state.transitionTo($state.$current, {
                page: vm.page,
                sort: vm.predicate + ',' + (vm.reverse ? 'asc' : 'desc'),
            });
        }

        function clear() {
            vm.links = null;
            vm.page = 1;
            vm.predicate = 'id';
            vm.reverse = true;
            vm.currentSearch = null;
            vm.transition();
        }
    }
})();