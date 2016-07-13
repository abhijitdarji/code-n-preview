(function () {
    "use strict";
    angular.module('myapp', ['ui.codemirror', 'ui.validate', 'LocalStorageModule'])
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
        .constant('TYPESCRIPT', ts)
        .constant('DEXIE', window.Dexie) //index db add update
        .constant('INLET', window.Inlet) //css color picker
        .constant('FILE_TYPES', /\.(html|css|js|less|coffee|jade|sass|scss|styl|md|markdown|ts|json|txt)$/i)
        .constant('COMPILE_TYPES', /\.(less|coffee|jade|sass|scss|styl|md|markdown|ts)$/i)
        .constant('COMPILE_MAP',
        {
            'LESS': '.css',
            'COFFEE': '.js',
            'JADE': '.html',
            'MARKDOWN': '.html',
            'MD': '.html',
            'SASS': '.css',
            'SCSS': '.css',
            'STYL': '.css',
            'TS': '.js'
        })
        .constant('SETTINGS', {
            preview_delay: 500,
            auto_refresh: true,
            view_compiled: false,
            mobile: 700,
            tablet: 900,
            laptop: 1100,
            desktop: 1400
        });
} ());