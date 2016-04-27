(function () {
    "use strict";
    angular.module('myapp', ['ui.codemirror', 'LocalStorageModule'])
        .config(function (localStorageServiceProvider) {
            localStorageServiceProvider
                .setPrefix('cnpApp')
                //.setStorageType('sessionStorage')
                //.setNotify(true, true)
                ;
        })
        .constant('LESS', window.less)
        .constant('HTML_BEAUTIFY', window.html_beautify)
        .constant('JS_BEAUTIFY', window.js_beautify)
        .constant('CSS_BEAUTIFY', window.css_beautify)
        .constant('EMMET_CODEMIRROR', window.emmetCodeMirror)
        .constant('JSZIP', window.JSZip)
        .constant('SAVEAS', window.saveAs)
        .constant('COFFEESCRIPT', window.CoffeeScript)
        .constant('JADE', window.jade)
        .constant('MARKDOWN', window.markdown)
        .constant('SASS', window.Sass)
        .constant('STYLUS', window.stylus)
        .constant('FILE_TYPES', /\.(html|css|js|less|coffee|jade|sass|scss|styl|md|markdown)$/i)
        .constant('COMPILE_TYPES', /\.(less|coffee|jade|sass|scss|styl|md|markdown)$/i);
} ());