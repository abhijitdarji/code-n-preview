(function () {
    'use strict';

    angular.module('myApp', [])
        .controller('myCtrl', function () {
            var vm = this;
            vm.message = "Data from controller";
        });
})();