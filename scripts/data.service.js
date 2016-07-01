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
            getLibraries: getLibraries,
            getTemplateFromUrl: getTemplateFromUrl
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

        function getTemplateFromUrl(name, url) {
            var fetchURL = "data/" + url + name;
            return $http.get(fetchURL);
        }
    }
})();