(function () {
    'use strict';

    angular
        .module('myapp')
        .factory('DataService', DataService);

    DataService.$inject = ['$http'];
    function DataService($http) {
        var service = {
            getSnippets: getSnippets,
            getTemplates: getTemplates,
            getLibraries: getLibraries
        };

        return service;

        ////////////////

        function getSnippets() {
            return $http.get('data/snippets.json');
        }

        function getTemplates() {
            return $http.get('data/templates.json');
        }

        function getLibraries() {
            return $http.get('data/libraries.json');
        }
    }
})();