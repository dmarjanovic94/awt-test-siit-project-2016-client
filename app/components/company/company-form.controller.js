(function () {
    'use strict';

    angular
        .module('awt-cts-client')
        .controller('CompanyFormController', CompanyFormController);

    CompanyFormController.$inject = ['$scope', '$state', '$stateParams', '$log', '$localStorage', '_', 'companyService', 'FileUploader', 'CONFIG'];

    function CompanyFormController($scope, $state, $stateParams, $log, $localStorage, _, companyService, FileUploader, CONFIG) {

        var companyFormVm = this;

        companyFormVm.company = {};
        companyFormVm.fileName = "";
        companyFormVm.image_source = "http://www.genaw.com/linda/translucent_supplies/translucent_mask3.png";
        companyFormVm.btnName = "Pretraži"
        companyFormVm.clearHide = false;

        companyFormVm.addCompany = addCompany;
        companyFormVm.clearFile = clearFile;
        companyFormVm.uploadFile = uploadFile;
        companyFormVm.onSelectedUserCallback = onSelectedUserCallback;
        companyFormVm.getUsers = getUsers;

        // Upload images
        var uploader = companyFormVm.uploader = new FileUploader({
            url: CONFIG.SERVICE_URL + '/images/company/',
            headers: {
                "X-Auth-Token": $localStorage.token
            }
        });

        // FILTERS
        uploader.filters.push({
            name: 'imageFilter',
            fn: function (item /*{File|FileLikeObject}*/, options) {
                var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
            }
        });

        uploader.onAfterAddingFile = function (fileItem) {
            if (uploader.queue.length > 1) {
                uploader.queue.shift();
            }

            uploadFile();
        };

        uploader.onSuccessItem = function (fileItem, response, status, headers) {
            companyFormVm.company.imagePath = response;
            companyFormVm.company.users = [companyFormVm.selectedUser];
            companyService.createCompany(companyFormVm.company)
                .then(function (response) {
                    $state.transitionTo("company", {
                        companyId: response.data.id
                    });
                });
        };

        function uploadFile() {
            companyFormVm.currentFile = event.target.files[0];
            var reader = new FileReader();

            reader.onload = function (e) {
                companyFormVm.btnName = "Izmijeni"
                companyFormVm.clearHide = true;
                companyFormVm.fileName = companyFormVm.currentFile.name;

                companyFormVm.image_source = e.target.result;
                $scope.$apply();
            }

            // When the file is read it triggers the onload event above.
            reader.readAsDataURL(event.target.files[0]);
        }

        function clearFile() {
            $log.info("Clear");
            companyFormVm.btnName = "Pretraži";
            companyFormVm.clearHide = false;
            companyFormVm.fileName = "";
            companyFormVm.image_source = "http://www.genaw.com/linda/translucent_supplies/translucent_mask3.png";
            uploader.queue = [];
        }

        function addCompany() {
            uploader.uploadItem(uploader.queue[0]);
        }

        function getUsers(val) {
            var splitted = val.split(/ +/);
            return companyService.findUsers(splitted[0], splitted[1] || "")
                .then(function (response) {
                    return response.data;
                });
        };

        function onSelectedUserCallback($item, $model, $label) {
            companyFormVm.selectedUser = $item
            companyFormVm.selectedItem = $item.firstName + " " + $item.lastName;
        };
    }
})();